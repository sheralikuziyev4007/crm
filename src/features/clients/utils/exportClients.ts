import { downloadCsv, toCsv } from "@/lib/csv";
import { isoDate } from "@/lib/date";
import { CSV_COLUMNS, getStatusMeta } from "../constants";
import type { Client } from "../types";

export function clientsToCsv(clients: Client[]): string {
  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    status: getStatusMeta(c.status).label,
    createdAt: isoDate(c.createdAt),
  }));
  return toCsv(rows, [...CSV_COLUMNS]);
}

export const csvFileName = (now = Date.now()) => `clients-${isoDate(now)}.csv`;

/** Downloads exactly what the user is looking at: current search, filter and sort, all pages. */
export function exportClients(clients: Client[]): void {
  downloadCsv(csvFileName(), clientsToCsv(clients));
}
