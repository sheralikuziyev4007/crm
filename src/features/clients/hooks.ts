import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as clientsApi from "./api";
import type { Client, ClientInput, StatusKey } from "./types";

/** The client list. Exposes isPending / isError / refetch so the UI can render each state. */
export function useClients() {
  return useQuery({ queryKey: queryKeys.clients, queryFn: clientsApi.listClients });
}

/** One client. Shows the row from the list cache instantly (if there is one) while it refreshes. */
export function useClient(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: () => clientsApi.getClient(id),
    initialData: () => queryClient.getQueryData<Client[]>(queryKeys.clients)?.find((c) => c.id === id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.clients)?.dataUpdatedAt,
  });
}

function patchCaches(queryClient: QueryClient, client: Client) {
  queryClient.setQueryData<Client[]>(queryKeys.clients, (old) =>
    old?.map((c) => (c.id === client.id ? client : c)),
  );
  queryClient.setQueryData(queryKeys.client(client.id), client);
}

/** Whatever happened, make the screens match the server again. */
function revalidate(queryClient: QueryClient, id?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.clients, exact: true });
  void queryClient.invalidateQueries({ queryKey: queryKeys.recentActivity });
  if (id) void queryClient.invalidateQueries({ queryKey: queryKeys.client(id) });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => clientsApi.createClient(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Client[]>(queryKeys.clients, (old) => (old ? [...old, created] : old));
      queryClient.setQueryData(queryKeys.client(created.id), created);
    },
    onSettled: () => revalidate(queryClient),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ClientInput> }) =>
      clientsApi.updateClient(id, patch),
    onSuccess: (updated) => patchCaches(queryClient, updated),
    onSettled: (_data, _error, { id }) => revalidate(queryClient, id),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Client[]>(queryKeys.clients, (old) => old?.filter((c) => c.id !== id));
      queryClient.removeQueries({ queryKey: queryKeys.client(id) });
    },
    onSettled: () => revalidate(queryClient),
  });
}

/** Status change (Kanban, client page): optimistic, so the card moves at once; rolled back on error. */
export function useMoveClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusKey }) =>
      clientsApi.updateClient(id, { status }),
    onMutate: async ({ id, status }) => {
      // An in-flight refetch must not overwrite the optimistic value
      await queryClient.cancelQueries({ queryKey: queryKeys.clients });
      const previousList = queryClient.getQueryData<Client[]>(queryKeys.clients);
      const previousClient = queryClient.getQueryData<Client>(queryKeys.client(id));
      queryClient.setQueryData<Client[]>(queryKeys.clients, (old) =>
        old?.map((c) => (c.id === id ? { ...c, status } : c)),
      );
      queryClient.setQueryData<Client>(queryKeys.client(id), (old) => (old ? { ...old, status } : old));
      return { previousList, previousClient };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousList) queryClient.setQueryData(queryKeys.clients, context.previousList);
      if (context?.previousClient) queryClient.setQueryData(queryKeys.client(id), context.previousClient);
    },
    onSettled: (_data, _error, { id }) => revalidate(queryClient, id),
  });
}
