import { http, HttpResponse } from "msw";
import { clientPatchSchema, clientSchema } from "@/features/clients/schemas";
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

const clientsPath = `${API_URL}/clients`;
const DUPLICATE_EMAIL = "A client with this email already exists.";

const duplicateEmail = () => errorResponse(DUPLICATE_EMAIL, 409, { email: DUPLICATE_EMAIL });

export const clientHandlers = [
  http.get(clientsPath, async ({ request }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    return HttpResponse.json(db.listClients());
  }),

  http.get(`${clientsPath}/:id`, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const client = db.findClient(param(params.id));
    return client ? HttpResponse.json(client) : errorResponse("Client not found.", 404);
  }),

  http.post(clientsPath, async ({ request }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const parsed = clientSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);
    if (db.findByEmail(parsed.data.email)) return duplicateEmail();

    return HttpResponse.json(db.createClient(parsed.data, user.name), { status: 201 });
  }),

  http.patch(`${clientsPath}/:id`, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const id = param(params.id);
    if (!db.findClient(id)) return errorResponse("Client not found.", 404);

    const parsed = clientPatchSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);
    if (parsed.data.email && db.findByEmail(parsed.data.email, id)) return duplicateEmail();

    return HttpResponse.json(db.updateClient(id, parsed.data, user.name));
  }),

  http.delete(`${clientsPath}/:id`, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    return db.removeClient(param(params.id))
      ? new HttpResponse(null, { status: 204 })
      : errorResponse("Client not found.", 404);
  }),
];
