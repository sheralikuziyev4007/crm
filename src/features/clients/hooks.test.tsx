import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { API_URL } from "@/lib/http";
import { server } from "@/mocks/server";
import { setMockControls } from "@/mocks/controls";
import { createWrapper, signIn } from "@/test/utils";
import { useAddNote, useNotes } from "@/features/notes/hooks";
import { useClient, useClients, useCreateClient, useDeleteClient, useMoveClient } from "./hooks";

const input = {
  name: "Test",
  company: "",
  email: "t@test.io",
  phone: "+1 415 555 0100",
  status: "lead" as const,
};

beforeEach(signIn);

describe("useClients", () => {
  it("starts pending, then returns the list", async () => {
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() });
    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(50);
  });

  it("reports an error and recovers on refetch", async () => {
    setMockControls({ serverError: true });
    const { result } = renderHook(() => useClients(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    // Reading `data` now also subscribes the hook to it (TanStack Query tracks the fields a component reads)
    expect(result.current.data).toBeUndefined();

    setMockControls({ serverError: false });
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toHaveLength(50));
  });
});

describe("client mutations", () => {
  const setup = () =>
    renderHook(
      () => ({
        list: useClients(),
        detail: useClient("CL-001"),
        create: useCreateClient(),
        remove: useDeleteClient(),
        move: useMoveClient(),
      }),
      { wrapper: createWrapper() },
    );

  it("create adds the new client to the cached list", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    await act(async () => {
      await result.current.create.mutateAsync(input);
    });
    await waitFor(() => expect(result.current.list.data).toHaveLength(51));
  });

  it("delete removes the client from the cached list", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    await act(async () => {
      await result.current.remove.mutateAsync("CL-002");
    });
    await waitFor(() => expect(result.current.list.data?.some((c) => c.id === "CL-002")).toBe(false));
  });

  it("move updates the list and the detail view", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.detail.isSuccess).toBe(true));
    await act(async () => {
      await result.current.move.mutateAsync({ id: "CL-001", status: "closed" });
    });
    expect(result.current.list.data?.find((c) => c.id === "CL-001")?.status).toBe("closed");
    expect(result.current.detail.data?.status).toBe("closed");
  });

  it("move is rolled back when the server rejects it", async () => {
    server.use(
      http.patch(`${API_URL}/clients/:id`, () => HttpResponse.json({ message: "boom" }, { status: 500 })),
    );
    const { result } = setup();
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    await act(async () => {
      await result.current.move.mutateAsync({ id: "CL-001", status: "closed" }).catch(() => undefined);
    });
    await waitFor(() => expect(result.current.move.isError).toBe(true));
    await waitFor(() =>
      expect(result.current.list.data?.find((c) => c.id === "CL-001")?.status).toBe("lead"),
    );
  });
});

describe("notes hooks", () => {
  it("adding a note puts it at the top of the list", async () => {
    const { result } = renderHook(() => ({ notes: useNotes("CL-001"), add: useAddNote("CL-001") }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.notes.isSuccess).toBe(true));
    await act(async () => {
      await result.current.add.mutateAsync("Fresh note");
    });
    await waitFor(() => expect(result.current.notes.data?.[0].body).toBe("Fresh note"));
  });
});
