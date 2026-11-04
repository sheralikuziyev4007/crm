import { cn } from "@/lib/utils";
import { STATUSES } from "../constants";
import type { StatusKey } from "../types";

interface StatusSwitcherProps {
  value: StatusKey;
  onChange: (status: StatusKey) => void;
  disabled?: boolean;
}

// Segmented control for the pipeline stage on the client page
export function StatusSwitcher({ value, onChange, disabled }: StatusSwitcherProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pipeline stage"
      className="grid grid-cols-3 gap-1 rounded-md border bg-muted/40 p-1"
    >
      {STATUSES.map((s) => {
        const selected = value === s.key;
        return (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(s.key)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              selected ? cn(s.badgeClass, "shadow-sm") : "text-muted-foreground hover:bg-card",
            )}
          >
            <span aria-hidden="true" className={cn("size-2 rounded-full", s.dotClass)} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
