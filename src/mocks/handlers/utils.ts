import { delay, HttpResponse } from "msw";
import type { ZodError } from "zod";
import type { User } from "@/features/auth/types";
import { verifyToken } from "../auth";
import { getLatencyMs, getMockControls } from "../controls";

export const errorResponse = (message: string, status: number, fields?: Record<string, string>) =>
  HttpResponse.json(fields ? { message, fields } : { message }, { status });

/** 422 with the first message per field, e.g. { email: "Enter a valid email address" } */
export function validationError(error: ZodError): Response {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fields[key] ??= issue.message;
  }
  return errorResponse("Please fix the highlighted fields.", 422, fields);
}

/**
 * Simulated network: waits, then fails on purpose when the demo "server error" switch is on.
 * Sign-in is never failed on purpose, so a visitor cannot lock themselves out of the demo.
 */
export async function simulateNetwork({ canFail = true } = {}): Promise<Response | null> {
  await delay(getLatencyMs());
  if (canFail && getMockControls().serverError) {
    return errorResponse("Internal server error (simulated by the demo settings).", 500);
  }
  return null;
}

/** The signed-in user, or a 401 response. */
export function authenticateRequest(request: Request): User | Response {
  const header = request.headers.get("Authorization") ?? "";
  const user = verifyToken(header.replace(/^Bearer\s+/i, ""));
  return user ?? errorResponse("Your session has expired. Please sign in again.", 401);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const param = (value: string | readonly string[] | undefined): string =>
  Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
