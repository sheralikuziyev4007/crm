import { AlertTriangle } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";

// Last line of defence: an unexpected render error shows this instead of a blank page
export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div role="alert" className="max-w-md text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-danger">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page crashed. Reloading usually helps. If it keeps happening, please tell us what you were
          doing.
        </p>
        <p className="mt-3 rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          {message}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
          <Button variant="outline" onClick={() => window.location.assign("/")}>
            Go home
          </Button>
        </div>
      </div>
    </main>
  );
}
