import { STATUSES } from "../constants";
import type { Client, SortKey, SortState } from "../types";
import { hasCompany } from "./filterClients";

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

const statusIndex = (c: Client) => {
  const i = STATUSES.findIndex((s) => s.key === c.status);
  return i === -1 ? STATUSES.length : i;
};

// Every comparator already accounts for the direction (dir = 1 | -1)
type Comparator = (a: Client, b: Client, dir: number) => number;

const comparators: Record<SortKey, Comparator> = {
  name: (a, b, dir) => dir * collator.compare(a.name, b.name),
  email: (a, b, dir) => dir * collator.compare(a.email, b.email),
  status: (a, b, dir) => dir * (statusIndex(a) - statusIndex(b)),
  createdAt: (a, b, dir) => dir * (a.createdAt - b.createdAt),
  // Clients without a company always go last, regardless of direction
  company: (a, b, dir) => {
    const ha = hasCompany(a);
    const hb = hasCompany(b);
    if (!ha || !hb) return ha === hb ? 0 : ha ? -1 : 1;
    return dir * collator.compare(a.company, b.company);
  },
};

export function sortClients(clients: Client[], sort: SortState): Client[] {
  if (!sort.key) return clients;
  const compare = comparators[sort.key];
  const dir = sort.dir === "desc" ? -1 : 1;
  // Array.prototype.sort is stable, so equal items keep their original order
  return [...clients].sort((a, b) => compare(a, b, dir));
}
