import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

// Every "nothing to show" case: no data yet, no search results, a page that does not exist
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-lg border border-dashed bg-card px-6 py-12 text-center", className)}>
      <div
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-full bg-accent text-accent-foreground [&_svg]:size-5"
      >
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}
