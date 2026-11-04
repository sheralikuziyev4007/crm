import { NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { useDeleteNote, useNotes } from "../hooks";
import type { Note } from "../types";
import { NoteForm } from "./NoteForm";
import { NoteItem } from "./NoteItem";

export function NotesPanel({ clientId }: { clientId: string }) {
  const notesQuery = useNotes(clientId);
  const deleteNote = useDeleteNote(clientId);

  const handleDelete = (note: Note) =>
    deleteNote.mutate(note.id, {
      onSuccess: () => toast.success("Note deleted"),
      onError: (error) => toast.error("Couldn't delete the note", { description: getErrorMessage(error) }),
    });

  const renderList = () => {
    if (notesQuery.isPending) {
      return (
        <div role="status" aria-busy="true" className="space-y-2">
          <span className="sr-only">Loading notes…</span>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (notesQuery.isError) {
      return (
        <ErrorState
          title="Couldn't load notes"
          message={getErrorMessage(notesQuery.error)}
          onRetry={() => void notesQuery.refetch()}
          isRetrying={notesQuery.isFetching}
          className="py-8"
        />
      );
    }
    if (notesQuery.data.length === 0) {
      return (
        <p className="flex items-center justify-center gap-2 rounded-md border border-dashed py-6 text-sm text-muted-foreground">
          <NotebookPen className="size-4" aria-hidden="true" /> No notes yet
        </p>
      );
    }
    return (
      <ul aria-label="Notes" className="space-y-2">
        {notesQuery.data.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDelete={handleDelete}
            isDeleting={deleteNote.isPending && deleteNote.variables === note.id}
          />
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Private to your team. Press Ctrl + Enter to save.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoteForm clientId={clientId} />
        {renderList()}
      </CardContent>
    </Card>
  );
}
