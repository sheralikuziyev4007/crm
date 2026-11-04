import { STATUSES } from "@/features/clients/constants";
import type { Client, StatusKey } from "@/features/clients/types";
import { DAY_MS } from "@/lib/constants";

export function countByStatus(clients: Client[]): Record<StatusKey, number> {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.key, 0])) as Record<StatusKey, number>;
  for (const c of clients) counts[c.status] += 1;
  return counts;
}

export interface WeekBucket {
  /** Start of the week (inclusive) */
  start: number;
  label: string;
  count: number;
}

const WEEK_MS = 7 * DAY_MS;
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** New clients per 7-day window, oldest first; the last window ends now. */
export function newClientsPerWeek(clients: Client[], weeks: number, now = Date.now()): WeekBucket[] {
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => {
    const start = now - (weeks - i) * WEEK_MS;
    return { start, label: shortDate.format(start + DAY_MS), count: 0 };
  });
  for (const c of clients) {
    const index = weeks - 1 - Math.floor((now - c.createdAt) / WEEK_MS);
    if (index >= 0 && index < weeks) buckets[index].count += 1;
  }
  return buckets;
}
