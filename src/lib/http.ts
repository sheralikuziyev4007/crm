import { useAuthStore } from "@/store/authStore";
import { whenApiReady } from "./apiReady";

export const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

/** Error thrown for any failed request. status 0 means the server could not be reached at all. */
export class ApiError extends Error {
  readonly status: number;
  /** Field-level problems from a 4xx response, e.g. { email: "Already used" } */
  readonly fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

interface ErrorBody {
  message?: unknown;
  fields?: unknown;
}

function toFieldErrors(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ErrorBody | null;
    if (typeof body?.message === "string" && body.message) {
      return new ApiError(body.message, response.status, toFieldErrors(body.fields));
    }
  } catch {
    // The body is not JSON: fall through to the generic message
  }
  return new ApiError(`Request failed (${response.status})`, response.status);
}

/** Thin fetch wrapper: JSON in/out, the auth token, and one error type for the whole app. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  await whenApiReady();
  const token = useAuthStore.getState().token;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (!response.ok) {
    const error = await toApiError(response);
    // An expired or invalid session: sign out, the router then sends the user to the login page
    if (response.status === 401 && token) useAuthStore.getState().signOut("expired");
    throw error;
  }
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    // e.g. a wrong VITE_API_URL that answers with an HTML page
    throw new ApiError("The server sent a response the app could not read.", response.status);
  }
}
