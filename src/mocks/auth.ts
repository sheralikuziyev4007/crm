import type { User } from "@/features/auth/types";
import { DEMO_CREDENTIALS, SESSION_TTL_MS } from "@/lib/constants";
import { DEMO_USER_PROFILE } from "./data/seed";

// Mock authentication. The token is a signed-looking but unsigned "JWT-like" string: good enough
// to exercise the real flow (Bearer header, expiry, 401 handling) without a backend.

interface MockUser extends User {
  password: string;
}

const USERS: MockUser[] = [
  { ...DEMO_USER_PROFILE, email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password },
];

const toPublic = ({ password: _password, ...user }: MockUser): User => user;

export function authenticate(email: string, password: string): User | null {
  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  return user ? toPublic(user) : null;
}

export function createToken(user: User, now = Date.now()): string {
  return `mock.${btoa(JSON.stringify({ sub: user.id, exp: now + SESSION_TTL_MS }))}`;
}

/** The user a Bearer token belongs to, or null when it is missing, malformed or expired. */
export function verifyToken(token: string | null | undefined, now = Date.now()): User | null {
  if (!token?.startsWith("mock.")) return null;
  try {
    const payload = JSON.parse(atob(token.slice(5))) as { sub?: unknown; exp?: unknown };
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    const user = USERS.find((u) => u.id === payload.sub);
    return user ? toPublic(user) : null;
  } catch {
    return null;
  }
}

export const demoUser = (): User => toPublic(USERS[0]);
