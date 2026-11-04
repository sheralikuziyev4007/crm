import type { Client, StatusFilter } from "../types";

export const hasCompany = (client: Pick<Client, "company">): boolean => client.company.trim().length > 0;

/** Case-insensitive search over name, company and email, plus an optional status filter. */
export function filterClients(clients: Client[], search: string, status: StatusFilter): Client[] {
  const query = search.trim().toLowerCase();
  return clients.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query);
    return matchesQuery && (status === "all" || c.status === status);
  });
}
