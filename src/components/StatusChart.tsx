import type { Client } from "../types";
import { STATUSES } from "../utils/constants";

// Кольцевая диаграмма на чистом SVG — без сторонних библиотек (меньше вес бандла)
export default function StatusChart({ clients }: { clients: Client[] }) {
  const total = clients.length;
  const data = STATUSES.map((s) => {
    const count = clients.filter((c) => c.status === s.key).length;
    return { ...s, count, pct: total ? (count / total) * 100 : 0 };
  });

  let offset = 25; // старт с 12 часов
  const segments = data.map((d) => {
    const seg = { ...d, dash: `${d.pct} ${100 - d.pct}`, offset };
    offset -= d.pct;
    return seg;
  });

  return (
    <div className="flex h-full items-center gap-5 rounded-2xl border border-stone-200 bg-surface p-4 shadow-sm">
      <div className="relative h-28 w-28 shrink-0">
        <svg
          viewBox="0 0 36 36"
          role="img"
          aria-label={`Распределение клиентов по статусам, всего ${total}`}
          className="h-full w-full"
        >
          <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" className="stroke-stone-100" />
          {segments
            .filter((s) => s.count > 0)
            .map((s) => (
              <circle
                key={s.key}
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                style={{ stroke: s.dot }}
                strokeWidth="4"
                strokeDasharray={s.dash}
                strokeDashoffset={s.offset}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-stone-900">{total}</span>
          <span className="text-[9px] font-mono uppercase tracking-wide text-stone-400">клиентов</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-stone-600">
              <span style={{ backgroundColor: s.dot }} className="h-2 w-2 rounded-full" />
              {s.label}
            </span>
            <span className="font-mono text-stone-400">
              {s.count} · {Math.round(s.pct)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
