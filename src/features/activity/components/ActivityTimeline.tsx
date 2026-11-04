import { Link } from "react-router";
import { formatDateTime, formatRelative, isoDate } from "@/lib/date";
import { ROUTES } from "@/lib/routes";
import type { Activity } from "../types";
import { describeActivity } from "../utils/describeActivity";
import { ActivityIcon } from "./ActivityIcon";

interface ActivityTimelineProps {
  items: Activity[];
  /** On the dashboard every entry names (and links to) its client */
  showClient?: boolean;
  label?: string;
}

export function ActivityTimeline({ items, showClient = false, label = "Activity" }: ActivityTimelineProps) {
  return (
    <ol
      aria-label={label}
      className="relative space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border"
    >
      {items.map((item) => {
        const { title, detail } = describeActivity(item);
        return (
          <li key={item.id} className="relative flex gap-3">
            <ActivityIcon type={item.type} />
            <div className="min-w-0 pt-1">
              <p className="text-sm">
                {showClient && (
                  <>
                    <Link
                      to={ROUTES.client(item.clientId)}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {item.clientName}
                    </Link>
                    <span className="text-muted-foreground"> · </span>
                  </>
                )}
                <span className={showClient ? "text-muted-foreground" : "font-medium"}>{title}</span>
              </p>
              {detail && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">“{detail}”</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.actor} ·{" "}
                <time dateTime={isoDate(item.createdAt)} title={formatDateTime(item.createdAt)}>
                  {formatRelative(item.createdAt)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
