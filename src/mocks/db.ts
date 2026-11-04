import { z } from "zod";
import type { Activity } from "@/features/activity/types";
import { STATUS_KEYS } from "@/features/clients/constants";
import type { Client, ClientInput } from "@/features/clients/types";
import type { Note } from "@/features/notes/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { seedActivity, seedClients, seedNotes } from "./data/seed";
import { idNumber, nextId, randomId } from "./ids";

// The "database" behind the mock API: kept in memory and mirrored to localStorage,
// so data survives a page reload the way a real backend's would.

interface State {
  clients: Client[];
  notes: Note[];
  activity: Activity[];
  lastIssued: number;
}

// Shapes of what we read back from storage: anything else is dropped
const clientRecord = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  company: z.string(),
  email: z.string().min(1),
  phone: z.string(),
  status: z.enum(STATUS_KEYS),
  createdAt: z.number().finite(),
});
const noteRecord = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  body: z.string(),
  author: z.string(),
  createdAt: z.number().finite(),
});
const activityBase = {
  id: z.string().min(1),
  clientId: z.string().min(1),
  clientName: z.string(),
  actor: z.string(),
  createdAt: z.number().finite(),
};
const activityRecord = z.discriminatedUnion("type", [
  z.object({ ...activityBase, type: z.literal("created") }),
  z.object({ ...activityBase, type: z.literal("updated"), fields: z.array(z.string()) }),
  z.object({
    ...activityBase,
    type: z.literal("status_changed"),
    from: z.enum(STATUS_KEYS),
    to: z.enum(STATUS_KEYS),
  }),
  z.object({ ...activityBase, type: z.literal("note_added"), preview: z.string() }),
]);

/** Keeps the valid items of an unknown array; null when nothing usable is left. */
function validItems<T>(raw: unknown, schema: z.ZodType<T>): T[] | null {
  if (!Array.isArray(raw)) return null;
  const items = raw.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  return raw.length > 0 && items.length === 0 ? null : items;
}

function seedState(): State {
  const now = Date.now();
  const clients = seedClients(now);
  const notes = seedNotes(clients, now);
  return { clients, notes, activity: seedActivity(clients, notes, now), lastIssued: 0 };
}

function load(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.database);
    if (saved === null) return seedState();
    const raw = JSON.parse(saved) as Record<string, unknown> | null;
    const clients = validItems(raw?.clients, clientRecord);
    // Broken records are dropped; if no client is usable, start again from the demo data
    if (!clients) return seedState();
    const ids = new Set(clients.map((c) => c.id));
    const lastIssued = Number(raw?.lastIssued);
    return {
      clients,
      notes: (validItems(raw?.notes, noteRecord) ?? []).filter((n) => ids.has(n.clientId)),
      activity: (validItems(raw?.activity, activityRecord) ?? []).filter((a) => ids.has(a.clientId)),
      lastIssued: Number.isInteger(lastIssued) && lastIssued > 0 ? lastIssued : 0,
    };
  } catch {
    return seedState();
  }
}

let state: State | null = null;

const getState = (): State => (state ??= load());

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.database, JSON.stringify(getState()));
  } catch {
    // localStorage is unavailable: the in-memory copy still serves this session
  }
}

const newestFirst = <T extends { createdAt: number }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

const EDITABLE: (keyof ClientInput)[] = ["name", "company", "email", "phone"];

function log(entry: Activity): void {
  getState().activity.push(entry);
}

export const db = {
  // ---- clients ----
  listClients(): Client[] {
    return getState().clients;
  },

  findClient(id: string): Client | undefined {
    return getState().clients.find((c) => c.id === id);
  },

  /** Another client (not `exceptId`) that already uses this email, compared case-insensitively. */
  findByEmail(email: string, exceptId?: string): Client | undefined {
    const wanted = email.trim().toLowerCase();
    return getState().clients.find((c) => c.id !== exceptId && c.email.trim().toLowerCase() === wanted);
  },

  createClient(input: ClientInput, actor: string): Client {
    const s = getState();
    const id = nextId(s.clients, s.lastIssued);
    s.lastIssued = idNumber(id);
    const client: Client = { id, ...input, createdAt: Date.now() };
    s.clients = [...s.clients, client];
    log({
      id: randomId("act"),
      type: "created",
      clientId: id,
      clientName: client.name,
      actor,
      createdAt: client.createdAt,
    });
    persist();
    return client;
  },

  updateClient(id: string, patch: Partial<ClientInput>, actor: string): Client | undefined {
    const s = getState();
    const current = s.clients.find((c) => c.id === id);
    if (!current) return undefined;
    const updated: Client = { ...current, ...patch };
    s.clients = s.clients.map((c) => (c.id === id ? updated : c));

    const now = Date.now();
    const base = { clientId: id, clientName: updated.name, actor, createdAt: now };
    const changed = EDITABLE.filter((key) => patch[key] !== undefined && patch[key] !== current[key]);
    if (changed.length > 0) log({ ...base, id: randomId("act"), type: "updated", fields: changed });
    if (patch.status && patch.status !== current.status) {
      log({ ...base, id: randomId("act"), type: "status_changed", from: current.status, to: patch.status });
    }
    persist();
    return updated;
  },

  /** Deleting a client also deletes its notes and history. */
  removeClient(id: string): boolean {
    const s = getState();
    if (!s.clients.some((c) => c.id === id)) return false;
    s.clients = s.clients.filter((c) => c.id !== id);
    s.notes = s.notes.filter((n) => n.clientId !== id);
    s.activity = s.activity.filter((a) => a.clientId !== id);
    persist();
    return true;
  },

  // ---- notes ----
  listNotes(clientId: string): Note[] {
    return newestFirst(getState().notes.filter((n) => n.clientId === clientId));
  },

  addNote(clientId: string, body: string, author: string): Note | undefined {
    const client = this.findClient(clientId);
    if (!client) return undefined;
    const note: Note = { id: randomId("note"), clientId, body, author, createdAt: Date.now() };
    getState().notes.push(note);
    log({
      id: randomId("act"),
      type: "note_added",
      clientId,
      clientName: client.name,
      actor: author,
      preview: body,
      createdAt: note.createdAt,
    });
    persist();
    return note;
  },

  removeNote(clientId: string, noteId: string): boolean {
    const s = getState();
    const exists = s.notes.some((n) => n.id === noteId && n.clientId === clientId);
    if (exists) {
      s.notes = s.notes.filter((n) => n.id !== noteId);
      persist();
    }
    return exists;
  },

  // ---- activity ----
  listActivity(clientId: string): Activity[] {
    return newestFirst(getState().activity.filter((a) => a.clientId === clientId));
  },

  recentActivity(limit: number): Activity[] {
    return newestFirst(getState().activity).slice(0, limit);
  },

  // ---- maintenance ----
  /** Throws the in-memory copy away so the next read comes from localStorage again. */
  reload(): void {
    state = null;
  },

  /** Replaces everything with the demo data set, or with an empty database. */
  reset(dataset: "seed" | "empty"): void {
    state = dataset === "seed" ? seedState() : { clients: [], notes: [], activity: [], lastIssued: 0 };
    persist();
  },
};
