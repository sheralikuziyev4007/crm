import { request } from "@/lib/http";
import type { Activity } from "./types";

export const listClientActivity = (clientId: string) =>
  request<Activity[]>(`/clients/${encodeURIComponent(clientId)}/activity`);

export const listRecentActivity = (limit: number) => request<Activity[]>(`/activity?limit=${limit}`);
