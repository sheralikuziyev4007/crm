import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import * as notesApi from "./api";
import type { Note } from "./types";

export function useNotes(clientId: string) {
  return useQuery({ queryKey: queryKeys.notes(clientId), queryFn: () => notesApi.listNotes(clientId) });
}

export function useAddNote(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => notesApi.addNote(clientId, body),
    onSuccess: (note) => {
      queryClient.setQueryData<Note[]>(queryKeys.notes(clientId), (old) => (old ? [note, ...old] : [note]));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes(clientId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientActivity(clientId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentActivity });
    },
  });
}

export function useDeleteNote(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => notesApi.deleteNote(clientId, noteId),
    onSuccess: (_result, noteId) => {
      queryClient.setQueryData<Note[]>(queryKeys.notes(clientId), (old) =>
        old?.filter((n) => n.id !== noteId),
      );
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notes(clientId) }),
  });
}
