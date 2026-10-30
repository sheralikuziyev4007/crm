import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useClients } from "./useClients";
import { LAST_ID_KEY, STORAGE_KEY } from "../utils/constants";
import { seedClients } from "../utils/idGenerator";

const newClient = { name: "Test", company: "", email: "t@t.uz", phone: "+998 90 111 22 33", status: "lead" as const };
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

describe("useClients", () => {
  it("starts with seed data when storage is empty", () => {
    const { result } = renderHook(() => useClients());
    expect(result.current.clients).toHaveLength(seedClients().length);
  });

  it("falls back to seed data when storage is corrupted", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useClients());
    expect(result.current.clients).toHaveLength(seedClients().length);
  });

  it("adds a client with the next id and a creation date, and persists it", () => {
    const { result } = renderHook(() => useClients());
    const before = result.current.clients.length;
    act(() => result.current.addClient(newClient));
    const added = result.current.clients.at(-1)!;
    expect(result.current.clients).toHaveLength(before + 1);
    expect(added.id).toBe(`CL-${String(before + 1).padStart(3, "0")}`);
    expect(added.createdAt).toBeGreaterThan(0);
    expect(stored().at(-1).email).toBe("t@t.uz");
  });

  it("updates, changes status and deletes", () => {
    const { result } = renderHook(() => useClients());
    const id = result.current.clients[0].id;

    act(() => result.current.updateClient(id, { name: "Renamed" }));
    expect(result.current.clients[0].name).toBe("Renamed");

    act(() => result.current.updateStatus(id, "closed"));
    expect(result.current.clients[0].status).toBe("closed");

    act(() => result.current.deleteClient(id));
    expect(result.current.clients.find((c) => c.id === id)).toBeUndefined();
    expect(stored().find((c: { id: string }) => c.id === id)).toBeUndefined();
  });

  it("drops broken saved entries but keeps the valid ones", () => {
    const [good] = seedClients();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([good, { id: "CL-099", status: "lead" }]));
    const { result } = renderHook(() => useClients());
    expect(result.current.clients.map((c) => c.id)).toEqual([good.id]);
  });

  it("falls back to seed data when every saved entry is broken", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ foo: 1 }]));
    const { result } = renderHook(() => useClients());
    expect(result.current.clients).toHaveLength(seedClients().length);
  });

  it("does not reuse the id of a deleted client, even after a reload", () => {
    const { result, unmount } = renderHook(() => useClients());
    act(() => result.current.addClient(newClient));
    const added = result.current.clients.at(-1)!.id;
    act(() => result.current.deleteClient(added));
    act(() => result.current.addClient(newClient));
    const second = result.current.clients.at(-1)!.id;
    expect(second).not.toBe(added);
    expect(localStorage.getItem(LAST_ID_KEY)).toBe(second.replace("CL-", "").replace(/^0+/, ""));

    // Удаляем и перезагружаем — номер всё равно не повторяется
    act(() => result.current.deleteClient(second));
    unmount();
    const reloaded = renderHook(() => useClients());
    act(() => reloaded.result.current.addClient(newClient));
    const third = reloaded.result.current.clients.at(-1)!.id;
    expect([added, second]).not.toContain(third);
  });

  it("gives unique ids to two clients added in the same tick", () => {
    const { result } = renderHook(() => useClients());
    act(() => {
      result.current.addClient(newClient);
      result.current.addClient({ ...newClient, email: "second@t.uz" });
    });
    const ids = result.current.clients.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("restores saved clients and normalises their phone numbers", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...seedClients()[0], phone: "901234567" }]));
    const { result } = renderHook(() => useClients());
    expect(result.current.clients).toHaveLength(1);
    expect(result.current.clients[0].phone).toBe("+998 90 123 45 67");
  });
});
