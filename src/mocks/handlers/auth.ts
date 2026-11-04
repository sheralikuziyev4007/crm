import { http, HttpResponse } from "msw";
import { loginSchema } from "@/features/auth/schemas";
import { API_URL } from "@/lib/http";
import { authenticate, createToken } from "../auth";
import { errorResponse, readJson, simulateNetwork, validationError } from "./utils";

export const authHandlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await simulateNetwork({ canFail: false });

    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) return validationError(parsed.error);

    const user = authenticate(parsed.data.email, parsed.data.password);
    if (!user) return errorResponse("Invalid email or password.", 401);

    return HttpResponse.json({ token: createToken(user), user });
  }),

  http.post(`${API_URL}/auth/logout`, async () => {
    await simulateNetwork({ canFail: false });
    return new HttpResponse(null, { status: 204 });
  }),
];
