import { Link } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/clients/components/StatusBadge";
import type { Client } from "@/features/clients/types";
import { RECENT_CLIENTS_LIMIT } from "@/lib/constants";
import { formatRelative } from "@/lib/date";
import { ROUTES } from "@/lib/routes";

export function RecentClientsCard({ clients }: { clients: Client[] }) {
  const recent = [...clients].sort((a, b) => b.createdAt - a.createdAt).slice(0, RECENT_CLIENTS_LIMIT);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recently added</CardTitle>
        <Button variant="link" size="sm" asChild className="h-auto p-0">
          <Link to={ROUTES.clients}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((client) => (
              <li key={client.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={client.name} />
                <div className="min-w-0 flex-1">
                  <Link
                    to={ROUTES.client(client.id)}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {client.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {client.company || "Independent"} · {formatRelative(client.createdAt)}
                  </p>
                </div>
                <StatusBadge status={client.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
