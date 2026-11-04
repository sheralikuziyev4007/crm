import type { Client } from "@/features/clients/types";

/** Number from an id in CL-N format; NaN if the format differs */
export function idNumber(id: string): number {
  const match = /^CL-(\d+)$/.exec(id);
  return match ? Number(match[1]) : NaN;
}

/**
 * Next id: max(highest client number, last issued number) + 1.
 * lastIssued prevents re-issuing the id of a deleted client.
 */
export function nextId(clients: Pick<Client, "id">[], lastIssued = 0): string {
  const nums = clients.map((c) => idNumber(c.id)).filter((n) => !Number.isNaN(n));
  const max = Math.max(lastIssued, ...nums, 0);
  return `CL-${String(max + 1).padStart(3, "0")}`;
}

export const randomId = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;
