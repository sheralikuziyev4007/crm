import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityTimeline } from "@/features/activity/components/ActivityTimeline";
import { useRecentActivity } from "@/features/activity/hooks";
import { getErrorMessage } from "@/lib/errors";

export function RecentActivityCard() {
  const activityQuery = useRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activityQuery.isPending ? (
          <div role="status" aria-busy="true" className="space-y-4">
            <span className="sr-only">Loading activity…</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3.5 w-2/3" />
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
          <p className="text-sm text-muted-foreground">Nothing has happened yet.</p>
        ) : (
          <ActivityTimeline items={activityQuery.data} showClient label="Recent activity" />
        )}
      </CardContent>
    </Card>
  );
}
