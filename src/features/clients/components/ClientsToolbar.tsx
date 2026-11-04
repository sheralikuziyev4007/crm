import { ArrowDown, ArrowUp, LayoutGrid, List, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { useClientFiltersStore } from "@/store/clientFiltersStore";
import { SORT_FIELDS, STATUSES } from "../constants";
import type { ClientsView, SortKey, StatusFilter } from "../types";

const VIEWS: { key: ClientsView; label: string; icon: typeof List }[] = [
  { key: "table", label: "List", icon: List },
  { key: "kanban", label: "Kanban", icon: LayoutGrid },
];

// Search, filter, sort and view live in a Zustand store, so they survive navigating to a client and back
export function ClientsToolbar() {
  const { search, status, sort, view, setSearch, setStatus, setSort, setView } = useClientFiltersStore(
    useShallow((s) => ({
      search: s.search,
      status: s.status,
      sort: s.sort,
      view: s.view,
      setSearch: s.setSearch,
      setStatus: s.setStatus,
      setSort: s.setSort,
      setView: s.setView,
    })),
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company or email…"
          aria-label="Search clients"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex">
        <NativeSelect
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="sm:w-40"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </NativeSelect>

        <div className="flex gap-1">
          <NativeSelect
            aria-label="Sort by"
            value={sort.key ?? ""}
            onChange={(e) => setSort({ key: (e.target.value || null) as SortKey | null, dir: sort.dir })}
            className="min-w-0 flex-1 sm:w-40"
          >
            <option value="">No sorting</option>
            {SORT_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </NativeSelect>
          <Button
            variant="outline"
            size="icon"
            disabled={!sort.key}
            onClick={() => setSort({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })}
            aria-label={
              sort.dir === "asc"
                ? "Sort ascending, switch to descending"
                : "Sort descending, switch to ascending"
            }
          >
            {sort.dir === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        </div>
      </div>

      <div
        role="group"
        aria-label="View"
        className="flex self-start rounded-md border bg-card p-0.5 lg:self-auto"
      >
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className={cn(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
