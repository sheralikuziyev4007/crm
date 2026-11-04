import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Form-level error (a failed request), as opposed to FormMessage which belongs to one field
export function FormAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border border-danger/30 bg-destructive/10 px-3 py-2 text-sm text-danger",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
