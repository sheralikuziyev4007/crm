import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelative, isoDate } from "@/lib/date";
import type { Note } from "../types";

interface NoteItemProps {
  note: Note;
  onDelete: (note: Note) => void;
  isDeleting: boolean;
}

export function NoteItem({ note, onDelete, isDeleting }: NoteItemProps) {
  return (
    <li className="group rounded-md border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="whitespace-pre-line break-words text-sm">{note.body}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="-mr-1 -mt-1 shrink-0 hover:bg-destructive/10 hover:text-danger"
          onClick={() => onDelete(note)}
          disabled={isDeleting}
          aria-label="Delete note"
        >
          <Trash2 />
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {note.author} ·{" "}
        <time dateTime={isoDate(note.createdAt)} title={formatDateTime(note.createdAt)}>
          {formatRelative(note.createdAt)}
        </time>
      </p>
    </li>
  );
}
