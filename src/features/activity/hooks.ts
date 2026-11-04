import { useQuery } from "@tanstack/react-query";
import { RECENT_ACTIVITY_LIMIT } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import * as activityApi from "./api";

export function useClientActivity(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clientActivity(clientId),
    queryFn: () => activityApi.listClientActivity(clientId),
  });
}

export function useRecentActivity(limit = RECENT_ACTIVITY_LIMIT) {
  return useQuery({
    queryKey: [...queryKeys.recentActivity, limit],
    queryFn: () => activityApi.listRecentActivity(limit),
  });
}
