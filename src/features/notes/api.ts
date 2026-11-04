import { request } from "@/lib/http";
import type { Note } from "./types";

const notesPath = (clientId: string) => `/clients/${encodeURIComponent(clientId)}/notes`;

export const listNotes = (clientId: string) => request<Note[]>(notesPath(clientId));

export const addNote = (clientId: string, body: string) =>
  request<Note>(notesPath(clientId), { method: "POST", body: JSON.stringify({ body }) });

export const deleteNote = (clientId: string, noteId: string) =>
  request<void>(`${notesPath(clientId)}/${encodeURIComponent(noteId)}`, { method: "DELETE" });
