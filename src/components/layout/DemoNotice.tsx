import { FlaskConical } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/lib/routes";

// Tells visitors that the data is fake and where to play with the mock API
export function DemoNotice({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        <FlaskConical className="size-3.5" aria-hidden="true" />
        Demo workspace
      </p>
      <p className="mt-1">
        Data comes from a mock REST API.{" "}
        <Link
          to={ROUTES.settings}
          onClick={onNavigate}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Simulate errors or reset it
        </Link>
        .
      </p>
    </div>
  );
}
