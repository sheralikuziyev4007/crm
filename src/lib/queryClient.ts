import { QueryClient } from "@tanstack/react-query";
import { QUERY_RETRY_DELAY_MS, QUERY_STALE_TIME_MS } from "./constants";
import { isApiError } from "./http";

/** Retrying cannot fix "not found", "forbidden" or "invalid": only network and server errors. */
const isRetryable = (error: unknown) => !isApiError(error) || error.status === 0 || error.status >= 500;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        // One quick automatic retry hides a blip; after that the user decides with "Try again"
        retry: (failureCount, error) => failureCount < 1 && isRetryable(error),
        retryDelay: QUERY_RETRY_DELAY_MS,
      },
      mutations: { retry: false },
    },
  });
}
