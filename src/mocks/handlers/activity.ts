import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/http";
import { RECENT_ACTIVITY_LIMIT } from "@/lib/constants";
import { db } from "../db";
import { authenticateRequest, errorResponse, param, simulateNetwork } from "./utils";

const MAX_LIMIT = 50;

export const activityHandlers = [
  http.get(`${API_URL}/clients/:id/activity`, async ({ request, params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const id = param(params.id);
    if (!db.findClient(id)) return errorResponse("Client not found.", 404);
    return HttpResponse.json(db.listActivity(id));
  }),

  http.get(`${API_URL}/activity`, async ({ request }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;
    const user = authenticateRequest(request);
    if (user instanceof Response) return user;

    const requested = Number(new URL(request.url).searchParams.get("limit"));
    const limit =
      Number.isInteger(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : RECENT_ACTIVITY_LIMIT;
    return HttpResponse.json(db.recentActivity(limit));
  }),
];
