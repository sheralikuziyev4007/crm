import { http, HttpResponse } from "msw";
import { noteSchema } from "@/features/notes/schemas";
import { API_URL } from "@/lib/http";
import { db } from "../db";
import {
  authenticateRequest,
  errorResponse,
  param,
  readJson,
  simulateNetwork,
  validationError,
} from "./utils";

const notesPath = `${API_URL}/clients/:id/notes`;

export const noteHandlers = [
  http.get(notesPath, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const id = param(params.id);
    if (!db.findClient(id)) return errorResponse("Client not found.", 404);
    return HttpResponse.json(db.listNotes(id));
  }),

  http.post(notesPath, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const parsed = noteSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);

    const note = db.addNote(param(params.id), parsed.data.body, user.name);
    return note ? HttpResponse.json(note, { status: 201 }) : errorResponse("Client not found.", 404);
  }),

  http.delete(`${notesPath}/:noteId`, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    return db.removeNote(param(params.id), param(params.noteId))
      ? new HttpResponse(null, { status: 204 })
      : errorResponse("Note not found.", 404);
  }),
];
