interface ChartDataTableProps {
  caption: string;
  columns: [string, string, ...string[]];
  rows: (string | number)[][];
}

// Every chart has a table view, so no value is reachable only by hovering or by colour
export function ChartDataTable({ caption, columns, rows }: ChartDataTableProps) {
  return (
    <details className="group mt-4 text-sm">
      <summary className="cursor-pointer select-none rounded text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        View as table
      </summary>
      <table className="mt-3 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={i > 0 ? "py-1.5 text-right font-medium" : "py-1.5 font-medium"}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])} className="border-b last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={i > 0 ? "py-1.5 text-right tabular-nums" : "py-1.5"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
