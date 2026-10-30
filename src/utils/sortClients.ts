import type { Client, SortKey, SortState } from "../types";
import { STATUSES } from "./constants";
import { hasCompany } from "./company";

export const SORT_FIELDS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Имя" },
  { key: "company", label: "Компания" },
  { key: "email", label: "Email" },
  { key: "status", label: "Статус" },
  { key: "createdAt", label: "Дата добавления" },
];

const collator = new Intl.Collator(["ru", "uz", "en"], { sensitivity: "base", numeric: true });

const statusIndex = (c: Client) => {
  const i = STATUSES.findIndex((s) => s.key === c.status);
  return i === -1 ? STATUSES.length : i;
};

// Каждый компаратор уже учитывает направление (dir = 1 | -1)
type Comparator = (a: Client, b: Client, dir: number) => number;

const comparators: Record<SortKey, Comparator> = {
  name: (a, b, dir) => dir * collator.compare(a.name || "", b.name || ""),
  email: (a, b, dir) => dir * collator.compare(a.email || "", b.email || ""),
  status: (a, b, dir) => dir * (statusIndex(a) - statusIndex(b)),
  createdAt: (a, b, dir) => dir * ((a.createdAt || 0) - (b.createdAt || 0)),
  // Клиенты без компании всегда в конце — независимо от направления
  company: (a, b, dir) => {
    const ha = hasCompany(a);
    const hb = hasCompany(b);
    if (!ha || !hb) return ha === hb ? 0 : ha ? -1 : 1;
    return dir * collator.compare(a.company, b.company);
  },
};

export function sortClients(clients: Client[], sort: SortState): Client[] {
  const compare = sort.key ? comparators[sort.key] : undefined;
  if (!compare) return clients;
  const dir = sort.dir === "desc" ? -1 : 1;
  // Array.prototype.sort стабилен — равные элементы сохраняют исходный порядок
  return [...clients].sort((a, b) => compare(a, b, dir));
}

// Клик по заголовку: asc → desc → без сортировки
export function nextSortState(current: SortState, key: SortKey): SortState {
  if (current.key !== key) return { key, dir: "asc" };
  if (current.dir === "asc") return { key, dir: "desc" };
  return { key: null, dir: "asc" };
}
