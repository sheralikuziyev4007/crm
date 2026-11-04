import { Skeleton } from "@/components/ui/skeleton";

// Fallback while a lazily loaded page downloads (usually a few milliseconds)
export function PageLoader() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading page…</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
