import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { getPageItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const sizeId = useId();
  // No pagination needed if everything fits on the smallest page size
  if (total <= pageSizeOptions[0]) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-mono text-xs">
          {from}–{to} of {total}
        </span>
        <label htmlFor={sizeId} className="flex items-center gap-2 text-xs">
          Per page
          <NativeSelect
            id={sizeId}
            className="w-20"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </NativeSelect>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>

        <span className="px-2 font-mono text-xs text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {getPageItems(page, totalPages).map((item, i) =>
            item === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn("font-mono text-xs")}
              >
                {item}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
