import { Compass } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROUTES } from "@/lib/routes";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="py-10">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        icon={<Compass />}
        title="This page does not exist"
        description="The link may be broken, or the page may have moved."
        action={
          <Button asChild>
            <Link to={ROUTES.dashboard}>Go to the dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
