import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { useClientActivity } from "../hooks";
import { ActivityTimeline } from "./ActivityTimeline";

export function ClientActivityCard({ clientId }: { clientId: string }) {
  const activityQuery = useClientActivity(clientId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Everything that happened with this client.</CardDescription>
      </CardHeader>
      <CardContent>
        {activityQuery.isPending ? (
          <div role="status" aria-busy="true" className="space-y-4">
            <span className="sr-only">Loading activity…</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activityQuery.isError ? (
          <ErrorState
            title="Couldn't load activity"
            message={getErrorMessage(activityQuery.error)}
            onRetry={() => void activityQuery.refetch()}
            isRetrying={activityQuery.isFetching}
            className="py-8"
          />
        ) : activityQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ActivityTimeline items={activityQuery.data} label="Client activity" />
        )}
      </CardContent>
    </Card>
  );
}
