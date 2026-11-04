import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/http";
import { db } from "../db";
import { authenticateRequest, readJson, simulateNetwork } from "./utils";

// Mock-API only: lets a visitor restore the demo data or start from an empty account
export const demoHandlers = [
  http.post(`${API_URL}/demo/reset`, async ({ request }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const body = await readJson(request);
    const empty =
      typeof body === "object" && body !== null && (body as { dataset?: unknown }).dataset === "empty";
    db.reset(empty ? "empty" : "seed");
    return new HttpResponse(null, { status: 204 });
  }),
];
