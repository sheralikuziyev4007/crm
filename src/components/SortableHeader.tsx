import type { SortKey, SortState } from "../types";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  field: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}

export default function SortableHeader({ label, field, sort, onSort }: SortableHeaderProps) {
  const active = sort.key === field;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  const ariaSort: "none" | "ascending" | "descending" = !active ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  return (
    <th aria-sort={ariaSort} className="px-4 py-2.5 font-medium">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded ${
          active ? "text-brand-ink" : ""
        }`}
      >
        {label}
        <Icon size={12} className={active ? "" : "opacity-50"} />
      </button>
    </th>
  );
}
