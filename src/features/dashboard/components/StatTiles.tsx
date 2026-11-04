import { ArrowRight, TrendingUp } from "lucide-react";
import { STATUSES } from "@/features/clients/constants";
import type { Client, StatusKey } from "@/features/clients/types";
import { DAY_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { countByStatus } from "../utils/stats";

interface StatTilesProps {
  clients: Client[];
  /** Opens the client list filtered by this stage ("all" for everyone) */
  onSelect: (status: StatusKey | "all") => void;
}

const WEEK_MS = 7 * DAY_MS;

const tileBase =
  "relative overflow-hidden rounded-lg border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Stat tiles: label · value · optional delta. The total is the page's one hero figure.
export function StatTiles({ clients, onSelect }: StatTilesProps) {
  const counts = countByStatus(clients);
  const now = Date.now();
  const newThisWeek = clients.filter((c) => now - c.createdAt < WEEK_MS).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={cn(tileBase, "sm:col-span-2 xl:col-span-1")}
      >
        <span className="block text-sm text-muted-foreground">Total clients</span>
        <span className="mt-1 block text-5xl font-semibold tracking-tight">{clients.length}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-status-active-fg">
          <TrendingUp className="size-3.5" aria-hidden="true" />+{newThisWeek} in the last 7 days
        </span>
      </button>

      {STATUSES.map((s) => (
        <button key={s.key} type="button" onClick={() => onSelect(s.key)} className={tileBase}>
          <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", s.dotClass)} />
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden="true" className={cn("size-2 rounded-full", s.dotClass)} />
            {s.label}
          </span>
          <span className="mt-1 block text-3xl font-semibold tracking-tight">{counts[s.key]}</span>
          <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            View clients <ArrowRight className="size-3" aria-hidden="true" />
          </span>
        </button>
      ))}
    </div>
  );
}
