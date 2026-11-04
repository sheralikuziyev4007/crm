import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortKey, SortState } from "../types";

interface SortableHeadProps {
  label: string;
  field: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}

export function SortableHead({ label, field, sort, onSort }: SortableHeadProps) {
  const active = sort.key === field;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  const ariaSort = !active ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  return (
    <TableHead aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 rounded uppercase tracking-wide transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden="true" />
      </button>
    </TableHead>
  );
}
