import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageItems } from "../utils/pagination";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  // Если записей не больше минимального размера страницы — пагинация не нужна
  if (total <= pageSizeOptions[0]) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtn =
    "rounded-lg border border-stone-300 bg-surface p-1.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors";

  return (
    <nav aria-label="Пагинация" className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3 text-xs text-stone-500">
        <span className="font-mono">
          {from}–{to} из {total}
        </span>
        <label className="flex items-center gap-1.5">
          На странице
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-stone-300 bg-surface px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Предыдущая страница" className={navBtn}>
          <ChevronLeft size={16} />
        </button>

        <span className="px-2 text-xs font-mono text-stone-500 sm:hidden">
          {page} / {totalPages}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {getPageItems(page, totalPages).map((item, i) =>
            item === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-stone-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  item === page ? "bg-brand-700 text-white" : "border border-stone-300 bg-surface text-stone-600 hover:bg-stone-50"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Следующая страница" className={navBtn}>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
