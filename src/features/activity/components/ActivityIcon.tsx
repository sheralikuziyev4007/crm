import { ArrowRightLeft, NotebookPen, PencilLine, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityType } from "../types";

const ICONS = {
  created: { icon: UserPlus, className: "bg-status-active-bg text-status-active-fg" },
  updated: { icon: PencilLine, className: "bg-secondary text-secondary-foreground" },
  status_changed: { icon: ArrowRightLeft, className: "bg-accent text-accent-foreground" },
  note_added: { icon: NotebookPen, className: "bg-status-lead-bg text-status-lead-fg" },
} satisfies Record<ActivityType, { icon: typeof UserPlus; className: string }>;

export function ActivityIcon({ type }: { type: ActivityType }) {
  const { icon: Icon, className } = ICONS[type];
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-card", className)}
    >
      <Icon className="size-4" />
    </span>
  );
}
