import type { Client, StatusFilter } from "../types";
import { STATUSES } from "../utils/constants";

interface StatsCardsProps {
  clients: Client[];
  activeFilter: StatusFilter;
  onSelect: (filter: StatusFilter) => void;
}

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

// Карточки-счётчики. Клик по карточке включает фильтр по статусу
export default function StatsCards({ clients, activeFilter, onSelect }: StatsCardsProps) {
  const count = (key: StatusFilter) =>
    key === "all" ? clients.length : clients.filter((c) => c.status === key).length;
  const allActive = activeFilter === "all";

  return (
    <div className="grid h-full grid-cols-3 gap-3">
      <button
        type="button"
        aria-pressed={allActive}
        onClick={() => onSelect("all")}
        className={`relative col-span-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-5 text-left text-white shadow-xl shadow-brand-700/25 transition-transform hover:-translate-y-0.5 ${focusRing} ${
          allActive ? "ring-2 ring-brand-600 ring-offset-2 ring-offset-canvas" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl"
        />
        <span className="relative text-sm font-medium text-white/80">Всего</span>
        <span className="relative mt-1 block font-display text-5xl font-bold tracking-tight">{count("all")}</span>
      </button>

      {STATUSES.map((s) => {
        const active = activeFilter === s.key;
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(s.key)}
            className={`relative overflow-hidden rounded-2xl border bg-surface p-4 text-left shadow-sm transition-all ${focusRing} ${
              active ? "border-brand-600 ring-1 ring-brand-600" : "border-stone-200 hover:border-brand-300 hover:shadow-md"
            }`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.dot }} />
            <span className="block text-sm text-stone-500">{s.label}</span>
            <span className="mt-1 block font-display text-3xl font-bold text-stone-900">{count(s.key)}</span>
          </button>
        );
      })}
    </div>
  );
}
