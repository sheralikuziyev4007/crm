import { Loader2 } from "lucide-react";

// Shown for a split second while a full-screen page (the login page) downloads
export function FullPageLoader() {
  return (
    <div role="status" aria-busy="true" className="grid min-h-dvh place-items-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
