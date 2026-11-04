import { describe, it, expect } from "vitest";
import { clientSchema } from "@/features/clients/schemas";
import { SESSION_TTL_MS, STORAGE_KEYS } from "@/lib/constants";
import { authenticate, createToken, demoUser, verifyToken } from "./auth";
import { seedActivity, seedClients, seedNotes } from "./data/seed";
import { db } from "./db";
import { idNumber, nextId } from "./ids";

const input = {
  name: "Test",
  company: "",
  email: "t@test.io",
  phone: "+1 415 555 0100",
  status: "lead" as const,
};
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.database) ?? "{}");

describe("seed data", () => {
  const clients = seedClients();

  it("has 50 clients that all pass the same validation as user input", () => {
    expect(clients).toHaveLength(50);
    for (const c of clients) {
      expect(clientSchema.safeParse(c).success, c.name).toBe(true);
    }
  });

  it("has unique ids and emails", () => {
    expect(new Set(clients.map((c) => c.id)).size).toBe(50);
    expect(new Set(clients.map((c) => c.email.toLowerCase())).size).toBe(50);
  });

  it("has a history that never lies in the future", () => {
    const now = Date.now();
    const notes = seedNotes(clients, now);
    const activity = seedActivity(clients, notes, now);
    expect(activity.every((a) => a.createdAt <= now)).toBe(true);
    expect(activity.filter((a) => a.type === "created")).toHaveLength(50);
  });
});

describe("ids", () => {
  it("reads and creates CL-NNN ids without reusing numbers", () => {
    expect(idNumber("CL-012")).toBe(12);
    expect(Number.isNaN(idNumber("X-1"))).toBe(true);
    expect(nextId([{ id: "CL-002" }, { id: "CL-010" }])).toBe("CL-011");
    expect(nextId([{ id: "CL-002" }], 14)).toBe("CL-015");
    expect(nextId([])).toBe("CL-001");
  });
});

describe("mock auth", () => {
  it("accepts the demo credentials only", () => {
    expect(authenticate("DEMO@pipelinecrm.app", "demo1234")?.name).toBe("Alex Morgan");
    expect(authenticate("demo@pipelinecrm.app", "wrong")).toBeNull();
  });

  it("issues tokens that expire", () => {
    const now = Date.now();
    const token = createToken(demoUser(), now);
    expect(verifyToken(token, now)?.email).toBe("demo@pipelinecrm.app");
    expect(verifyToken(token, now + SESSION_TTL_MS + 1)).toBeNull();
    expect(verifyToken("mock.not-base64!!")).toBeNull();
    expect(verifyToken(null)).toBeNull();
  });
});

describe("mock database", () => {
  it("starts with the demo data", () => {
    expect(db.listClients()).toHaveLength(50);
    expect(db.listNotes("CL-001").length).toBeGreaterThan(0);
  });

  it("falls back to the demo data when storage is corrupted or unusable", () => {
    localStorage.setItem(STORAGE_KEYS.database, "{not json");
    db.reload();
    expect(db.listClients()).toHaveLength(50);

    localStorage.setItem(STORAGE_KEYS.database, JSON.stringify({ clients: [{ foo: 1 }] }));
    db.reload();
    expect(db.listClients()).toHaveLength(50);
  });

  it("keeps valid saved records and drops broken ones", () => {
    const [good] = seedClients();
    localStorage.setItem(
      STORAGE_KEYS.database,
      JSON.stringify({
        clients: [good, { id: "CL-099", status: "weird" }],
        notes: [{ bad: true }],
        activity: "x",
      }),
    );
    db.reload();
    expect(db.listClients().map((c) => c.id)).toEqual([good.id]);
    expect(db.listNotes(good.id)).toEqual([]);
  });

  it("creates a client with the next id, logs it and persists it", () => {
    const created = db.createClient(input, "Alex");
    expect(created.id).toBe("CL-051");
    expect(db.listActivity(created.id)[0]).toMatchObject({ type: "created", actor: "Alex" });
    expect(stored().clients.at(-1).email).toBe("t@test.io");
  });

  it("logs field edits and status changes separately", () => {
    db.updateClient(
      "CL-001",
      { email: "new@northwind.io", phone: "+1 415 555 0199", status: "active" },
      "Alex",
    );
    const types = db.listActivity("CL-001").map((a) => a.type);
    expect(types).toContain("updated");
    expect(types).toContain("status_changed");
    const updated = db.listActivity("CL-001").find((a) => a.type === "updated");
    expect(updated).toMatchObject({ fields: ["email", "phone"] });
  });

  it("does not log an edit that changes nothing", () => {
    const before = db.listActivity("CL-001").length;
    const current = db.findClient("CL-001")!;
    db.updateClient("CL-001", { name: current.name, status: current.status }, "Alex");
    expect(db.listActivity("CL-001")).toHaveLength(before);
  });

  it("deleting a client removes its notes and history too", () => {
    expect(db.removeClient("CL-001")).toBe(true);
    expect(db.findClient("CL-001")).toBeUndefined();
    expect(db.listNotes("CL-001")).toEqual([]);
    expect(db.listActivity("CL-001")).toEqual([]);
    expect(db.removeClient("CL-001")).toBe(false);
  });

  it("never reuses the id of a deleted client, even after a reload", () => {
    const first = db.createClient(input, "Alex").id;
    db.removeClient(first);
    db.reload();
    const second = db.createClient({ ...input, email: "second@test.io" }, "Alex").id;
    expect(second).not.toBe(first);
  });

  it("adds and removes notes, newest first, logging each new note", () => {
    const note = db.addNote("CL-002", "Follow up next week", "Alex")!;
    expect(db.listNotes("CL-002")[0].id).toBe(note.id);
    expect(db.listActivity("CL-002")[0]).toMatchObject({
      type: "note_added",
      preview: "Follow up next week",
    });
    expect(db.removeNote("CL-002", note.id)).toBe(true);
    expect(db.removeNote("CL-002", note.id)).toBe(false);
    expect(db.addNote("CL-999", "x", "Alex")).toBeUndefined();
  });

  it("returns the latest activity across clients", () => {
    db.addNote("CL-010", "Newest event", "Alex");
    const recent = db.recentActivity(3);
    expect(recent).toHaveLength(3);
    expect(recent[0]).toMatchObject({ clientId: "CL-010", type: "note_added" });
  });

  it("resets to an empty database or back to the demo data", () => {
    db.reset("empty");
    expect(db.listClients()).toEqual([]);
    db.reset("seed");
    expect(db.listClients()).toHaveLength(50);
  });
});
