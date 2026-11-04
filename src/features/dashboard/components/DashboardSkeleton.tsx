import { Skeleton } from "@/components/ui/skeleton";

// Same grid as the real dashboard, so the page does not jump when data arrives
export function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading dashboard…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}
