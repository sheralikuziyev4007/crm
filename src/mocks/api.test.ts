import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { listClientActivity, listRecentActivity } from "@/features/activity/api";
import { login, logout } from "@/features/auth/api";
import { createClient, deleteClient, getClient, listClients, updateClient } from "@/features/clients/api";
import { addNote, deleteNote, listNotes } from "@/features/notes/api";
import { resetDemoData } from "@/features/settings/api";
import { API_URL, ApiError } from "@/lib/http";
import { useAuthStore } from "@/store/authStore";
import { signIn } from "@/test/utils";
import { setMockControls } from "./controls";
import { server } from "./server";

// The real request path of the app: feature api → fetch (with the Bearer token) → MSW → handlers → database

const valid = {
  name: "Test Client",
  company: "",
  email: "test@client.io",
  phone: "+1 415 555 0100",
  status: "lead" as const,
};

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the request to fail");
}

describe("auth", () => {
  it("signs in with the demo account and returns a token", async () => {
    const session = await login({ email: "demo@pipelinecrm.app", password: "demo1234" });
    expect(session.token).toMatch(/^mock\./);
    expect(session.user).toMatchObject({ name: "Alex Morgan", email: "demo@pipelinecrm.app" });
  });

  it("rejects a wrong password with 401", async () => {
    const error = await failure(login({ email: "demo@pipelinecrm.app", password: "wrong-one" }));
    expect(error).toMatchObject({ status: 401, message: "Invalid email or password." });
  });

  it("rejects invalid input with 422 and field messages", async () => {
    const error = await failure(login({ email: "nope", password: "1" }));
    expect(error.status).toBe(422);
    expect(error.fields).toMatchObject({ email: "Enter a valid email address" });
  });

  it("refuses data requests without a valid token, and signs the user out on 401", async () => {
    expect((await failure(listClients())).status).toBe(401);

    useAuthStore.setState({ token: "mock.expired", user: null });
    const error = await failure(listClients());
    expect(error.status).toBe(401);
    expect(useAuthStore.getState()).toMatchObject({ token: null, signOutReason: "expired" });
  });

  it("logs out", async () => {
    await expect(logout()).resolves.toBeUndefined();
  });
});

describe("clients", () => {
  beforeEach(signIn);

  it("lists and gets clients", async () => {
    expect(await listClients()).toHaveLength(50);
    expect(await getClient("CL-001")).toMatchObject({ name: "Olivia Bennett" });
    expect((await failure(getClient("CL-999"))).status).toBe(404);
  });

  it("creates a client with a server-generated id and trims the input", async () => {
    const created = await createClient({ ...valid, name: "  Spaced  " });
    expect(created).toMatchObject({ id: "CL-051", name: "Spaced" });
    expect(await listClients()).toHaveLength(51);
  });

  it("rejects invalid data with 422 and per-field messages", async () => {
    const error = await failure(createClient({ ...valid, email: "nope", phone: "12345" }));
    expect(error.status).toBe(422);
    expect(error.fields).toEqual({
      email: "Enter a valid email address",
      phone: "Include the country code, e.g. +1 415 555 0132",
    });
  });

  it("rejects a duplicate email with 409, ignoring case", async () => {
    const error = await failure(createClient({ ...valid, email: "OLIVIA@northwind.io" }));
    expect(error).toMatchObject({
      status: 409,
      fields: { email: "A client with this email already exists." },
    });
  });

  it("updates only the fields that were sent", async () => {
    expect(await updateClient("CL-001", { status: "closed" })).toMatchObject({
      name: "Olivia Bennett",
      status: "closed",
    });
  });

  it("lets a client keep its own email but not take another client's", async () => {
    await expect(updateClient("CL-001", { email: "olivia@northwind.io" })).resolves.toBeTruthy();
    expect((await failure(updateClient("CL-001", { email: "lucas@atelierlumen.fr" }))).status).toBe(409);
    expect((await failure(updateClient("CL-001", { name: "A" }))).status).toBe(422);
    expect((await failure(updateClient("CL-999", { status: "active" }))).status).toBe(404);
  });

  it("deletes a client", async () => {
    await deleteClient("CL-001");
    expect((await listClients()).find((c) => c.id === "CL-001")).toBeUndefined();
    expect((await failure(deleteClient("CL-001"))).status).toBe(404);
  });
});

describe("notes and activity", () => {
  beforeEach(signIn);

  it("adds, lists and deletes notes", async () => {
    const note = await addNote("CL-002", "Sent the proposal");
    expect(note).toMatchObject({ clientId: "CL-002", body: "Sent the proposal", author: "Alex Morgan" });
    expect((await listNotes("CL-002"))[0].id).toBe(note.id);
    await deleteNote("CL-002", note.id);
    expect((await listNotes("CL-002")).some((n) => n.id === note.id)).toBe(false);
    expect((await failure(deleteNote("CL-002", note.id))).status).toBe(404);
  });

  it("validates notes and unknown clients", async () => {
    expect((await failure(addNote("CL-002", "   "))).status).toBe(422);
    expect((await failure(addNote("CL-999", "Hi"))).status).toBe(404);
    expect((await failure(listNotes("CL-999"))).status).toBe(404);
  });

  it("records every change in the client's history and the global feed", async () => {
    await updateClient("CL-005", { status: "active" });
    const history = await listClientActivity("CL-005");
    expect(history[0]).toMatchObject({
      type: "status_changed",
      from: "lead",
      to: "active",
      actor: "Alex Morgan",
    });

    const recent = await listRecentActivity(3);
    expect(recent).toHaveLength(3);
    expect(recent[0]).toMatchObject({ clientId: "CL-005" });
  });
});

describe("failures and demo controls", () => {
  beforeEach(signIn);

  it("fails data requests with 500 while the server-error switch is on, but never sign-in", async () => {
    setMockControls({ serverError: true });
    const error = await failure(listClients());
    expect(error.status).toBe(500);
    expect(error.message).toMatch(/simulated/);
    await expect(login({ email: "demo@pipelinecrm.app", password: "demo1234" })).resolves.toBeTruthy();

    setMockControls({ serverError: false });
    await expect(listClients()).resolves.toHaveLength(50);
  });

  it("turns a network failure into an ApiError with status 0", async () => {
    server.use(http.get(`${API_URL}/clients`, () => HttpResponse.error()));
    const error = await failure(listClients());
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/can't reach the server/i);
  });

  it("explains a response that is not JSON", async () => {
    server.use(http.get(`${API_URL}/clients`, () => new HttpResponse("<!doctype html>", { status: 200 })));
    expect((await failure(listClients())).message).toBe("The server sent a response the app could not read.");

    server.use(http.get(`${API_URL}/clients`, () => new HttpResponse("Bad gateway", { status: 502 })));
    expect(await failure(listClients())).toMatchObject({ status: 502, message: "Request failed (502)" });
  });

  it("empties the database and restores the demo data", async () => {
    await resetDemoData("empty");
    expect(await listClients()).toEqual([]);
    await resetDemoData("seed");
    expect(await listClients()).toHaveLength(50);
  });
});
