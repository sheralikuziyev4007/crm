import { request } from "@/lib/http";
import type { LoginValues } from "./schemas";
import type { Session } from "./types";

export const login = (values: LoginValues) =>
  request<Session>("/auth/login", { method: "POST", body: JSON.stringify(values) });

export const logout = () => request<void>("/auth/logout", { method: "POST" });
