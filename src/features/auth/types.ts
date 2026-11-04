export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Session {
  token: string;
  user: User;
}

/** Why the previous session ended; the login page explains it. */
export type SignOutReason = "signed-out" | "expired";
