import { ArrowUp, ArrowDown } from "lucide-react";
import type { SortKey, SortState } from "../types";
import { SORT_FIELDS } from "../utils/sortClients";

// Сортировка для мобильных (в таблице есть кликабельные заголовки) и для канбана
interface SortSelectProps {
  sort: SortState;
  onChange: (sort: SortState) => void;
}

export default function SortSelect({ sort, onChange }: SortSelectProps) {
  return (
    <div className="flex gap-1">
      <select
        value={sort.key ?? ""}
        onChange={(e) => onChange({ key: (e.target.value || null) as SortKey | null, dir: sort.dir })}
        aria-label="Сортировка"
        className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
      >
        <option value="">Без сортировки</option>
        {SORT_FIELDS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!sort.key}
        onClick={() => onChange({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })}
        aria-label={sort.dir === "asc" ? "По возрастанию" : "По убыванию"}
        className="rounded-lg border border-stone-300 bg-surface px-2.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
      >
        {sort.dir === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
      </button>
    </div>
  );
}
