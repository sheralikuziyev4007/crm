import { useEffect } from "react";
import { APP_NAME } from "@/lib/constants";

/** "Clients · Pipeline CRM" — every page gets its own title for tabs, history and SEO. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
