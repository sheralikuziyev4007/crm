import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

// Shown when data could not be loaded. role="alert" makes screen readers announce it right away.
export function ErrorState({
  title = "Couldn't load data",
  message,
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-lg border border-danger/30 bg-card px-6 py-12 text-center", className)}
    >
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-danger">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCw aria-hidden="true" className={cn(isRetrying && "animate-spin")} />
        {isRetrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
