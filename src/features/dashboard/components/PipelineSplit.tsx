import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES } from "@/features/clients/constants";
import type { Client } from "@/features/clients/types";
import { cn } from "@/lib/utils";
import { countByStatus } from "../utils/stats";
import { ChartDataTable } from "./ChartDataTable";

/** Below this share a block is too narrow for its label; the value stays in hover and the table. */
const LABEL_MIN_SHARE = 12;

// One whole split into three parts → a tall segmented bar (not a donut): 28px, 4px corners,
// a 2px surface gap between blocks, the share printed inside, a legend of names in block order.
export function PipelineSplit({ clients }: { clients: Client[] }) {
  const counts = countByStatus(clients);
  const total = clients.length;
  const parts = STATUSES.map((s) => ({
    ...s,
    count: counts[s.key],
    share: total ? Math.round((counts[s.key] / total) * 100) : 0,
  }));
  // A part at zero draws nothing
  const visible = parts.filter((p) => p.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline split</CardTitle>
        <CardDescription>Share of clients in each stage</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <>
            <div className="flex h-7 gap-0.5" aria-label={`Pipeline split of ${total} clients`} role="group">
              {visible.map((p, i) => {
                const label = `${p.label}: ${p.count} ${p.count === 1 ? "client" : "clients"} (${p.share}%)`;
                return (
                  <div
                    key={p.key}
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users get the same readout as hover
                    tabIndex={0}
                    role="img"
                    aria-label={label}
                    className={cn(
                      "group relative flex items-center rounded px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      p.dotClass,
                    )}
                    style={{ flexGrow: p.count, flexBasis: 0 }}
                  >
                    {p.share >= LABEL_MIN_SHARE && (
                      <span aria-hidden="true" className="text-xs font-semibold text-chart-ink">
                        {p.share}%
                      </span>
                    )}
                    <span
                      role="tooltip"
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md group-hover:block group-focus-visible:block",
                        i === visible.length - 1 && visible.length > 1 ? "right-0" : "left-0",
                      )}
                    >
                      <span className="block font-semibold text-foreground">
                        {p.count} · {p.share}%
                      </span>
                      <span className="block text-muted-foreground">{p.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <ul aria-label="Legend" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {parts.map((p) => (
                <li key={p.key} className="flex items-center gap-2 text-muted-foreground">
                  <span aria-hidden="true" className={cn("size-2.5 rounded-sm", p.dotClass)} />
                  {p.label}
                </li>
              ))}
            </ul>

            <ChartDataTable
              caption="Clients per pipeline stage"
              columns={["Stage", "Clients", "Share"]}
              rows={parts.map((p) => [p.label, p.count, `${p.share}%`])}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
