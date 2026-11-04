import { Workflow } from "lucide-react";
import { Link } from "react-router";
import { APP_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to={ROUTES.dashboard}
      className={cn(
        "flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-md shadow-primary/30"
      >
        <Workflow className="size-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
