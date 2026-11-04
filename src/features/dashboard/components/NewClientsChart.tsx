import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/features/clients/types";
import { CHART_WEEKS, DAY_MS } from "@/lib/constants";
import { newClientsPerWeek } from "../utils/stats";
import { niceTicks } from "../utils/ticks";
import { ChartDataTable } from "./ChartDataTable";
import { cn } from "@/lib/utils";

const rangeFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const range = (start: number) =>
  `${rangeFormat.format(start + DAY_MS)} – ${rangeFormat.format(start + 7 * DAY_MS)}`;
const plural = (n: number) => `${n} new ${n === 1 ? "client" : "clients"}`;

// Single-series column chart in plain HTML: thin columns (≤24px) with 4px rounded tops on one baseline,
// hairline gridlines, a hover/focus tooltip per column, and a table view. One series → no legend.
export function NewClientsChart({ clients }: { clients: Client[] }) {
  const weeks = newClientsPerWeek(clients, CHART_WEEKS);
  const ticks = niceTicks(Math.max(...weeks.map((w) => w.count), 1));
  const top = ticks[ticks.length - 1];
  const lastIndex = weeks.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New clients per week</CardTitle>
        <CardDescription>Last {CHART_WEEKS} weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <figure aria-label={`New clients per week over the last ${CHART_WEEKS} weeks`}>
          <div className="mt-3 flex h-52 gap-2">
            {/* y-axis labels */}
            <div
              aria-hidden="true"
              className="relative w-6 shrink-0 text-right font-mono text-[11px] text-muted-foreground"
            >
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 -translate-y-1/2"
                  style={{ bottom: `calc(${(t / top) * 100}% - 0px)` }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="relative flex-1">
              {/* gridlines: hairline, solid, recessive */}
              {ticks.map((t) => (
                <div
                  key={t}
                  aria-hidden="true"
                  className="absolute inset-x-0 border-t border-border"
                  style={{ bottom: `${(t / top) * 100}%` }}
                />
              ))}

              <ul className="absolute inset-0 flex items-end">
                {weeks.map((week, i) => {
                  const height = (week.count / top) * 100;
                  const label = `${range(week.start)}: ${plural(week.count)}`;
                  return (
                    <li
                      key={week.start}
                      className="group relative flex h-full flex-1 items-end justify-center"
                    >
                      {/* The whole band is the hit target, not just the painted column */}
                      <div
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users get the same readout as hover
                        tabIndex={0}
                        role="img"
                        aria-label={label}
                        className="absolute inset-0 z-10 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div
                          role="tooltip"
                          className={cn(
                            // display:none until hover/focus, so a hidden tooltip never widens the page
                            "pointer-events-none absolute z-10 hidden whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md group-focus-within:block group-hover:block",
                            // Columns at the edges open their tooltip inwards
                            i < 2 ? "left-0" : i > lastIndex - 2 ? "right-0" : "left-1/2 -translate-x-1/2",
                          )}
                          style={{ bottom: `calc(${height}% + 10px)` }}
                        >
                          <span className="block font-semibold text-foreground">{plural(week.count)}</span>
                          <span className="block text-muted-foreground">{range(week.start)}</span>
                        </div>
                      </div>
                      {/* Selective direct label: only the current week */}
                      {i === lastIndex && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground"
                          style={{ bottom: `calc(${height}% + 4px)` }}
                        >
                          {week.count}
                        </span>
                      )}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none w-full max-w-6 rounded-t bg-chart-1 transition-opacity group-hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* x-axis labels */}
          <div aria-hidden="true" className="ml-8 mt-2 flex">
            {weeks.map((week, i) => (
              <span
                key={week.start}
                className="flex-1 text-center font-mono text-[11px] text-muted-foreground"
              >
                {/* Every other label on narrow screens so they never collide */}
                <span className={i % 2 === 1 && i !== lastIndex ? "hidden sm:inline" : undefined}>
                  {week.label}
                </span>
              </span>
            ))}
          </div>
        </figure>

        <ChartDataTable
          caption="New clients per week"
          columns={["Week", "New clients"]}
          rows={weeks.map((w) => [range(w.start), w.count])}
        />
      </CardContent>
    </Card>
  );
}
