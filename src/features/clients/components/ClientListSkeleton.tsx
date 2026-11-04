import { Skeleton } from "@/components/ui/skeleton";
import { SKELETON_ROWS } from "@/lib/constants";

const rows = Array.from({ length: SKELETON_ROWS }, (_, i) => i);

// Mirrors the real list (table on tablet/desktop, cards on phones), so nothing jumps when data arrives
export function ClientListSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading clients…</span>
      <div className="hidden overflow-hidden rounded-lg border bg-card shadow-sm md:block">
        <div className="border-b bg-muted/60 px-4 py-4">
          <Skeleton className="h-3 w-1/3" />
        </div>
        {rows.map((i) => (
          <div key={i} className="flex items-center gap-6 border-b px-4 py-4 last:border-b-0">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {rows.slice(0, 4).map((i) => (
          <div key={i} className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
