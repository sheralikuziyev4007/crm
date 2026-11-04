import { useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import type { StatusMeta } from "../constants";
import type { Client, StatusKey } from "../types";
import { DRAG_TYPE, KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  status: StatusMeta;
  clients: Client[];
  onEdit: (client: Client) => void;
  onMove: (id: string, status: StatusKey) => void;
}

export function KanbanColumn({ status, clients, onEdit, onMove }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const headingId = `kanban-${status.key}`;

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsOver(false);
    const id = event.dataTransfer.getData(DRAG_TYPE);
    const dragged = clients.find((c) => c.id === id);
    // Dropping a card back into its own column is not a change
    if (id && !dragged) onMove(id, status.key);
  };

  return (
    <section
      aria-labelledby={headingId}
      data-status={status.key}
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={(event) => {
        // Ignore moving onto child elements, otherwise the highlight flickers
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-80 flex-col rounded-lg border bg-muted/40 p-3 transition-colors",
        isOver && "border-primary bg-accent/60",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 id={headingId} className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className={cn("size-2 rounded-full", status.dotClass)} />
          {status.label}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">{clients.length}</span>
      </div>
      {clients.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-xs text-muted-foreground">
          Drop a client here
        </p>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <KanbanCard key={client.id} client={client} onEdit={onEdit} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  );
}
