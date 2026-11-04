import { cn } from "@/lib/utils";
import { getStatusMeta } from "../constants";
import type { StatusKey } from "../types";

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide",
        meta.badgeClass,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
