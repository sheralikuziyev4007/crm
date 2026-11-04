import { Building2, Mail, Pencil } from "lucide-react";
import type { DragEvent } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { Client, StatusKey } from "../types";
import { hasCompany } from "../utils/filterClients";
import { KanbanMoveButtons } from "./KanbanMoveButtons";

export const DRAG_TYPE = "text/plain";

interface KanbanCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onMove: (id: string, status: StatusKey) => void;
}

export function KanbanCard({ client, onEdit, onMove }: KanbanCardProps) {
  const handleDragStart = (event: DragEvent<HTMLLIElement>) => {
    event.dataTransfer.setData(DRAG_TYPE, client.id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      data-client-id={client.id}
      className="cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground">{client.id}</p>
          <Link
            to={ROUTES.client(client.id)}
            className="block truncate text-sm font-medium hover:text-primary"
          >
            {client.name}
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="-mr-1 -mt-1"
          onClick={() => onEdit(client)}
          aria-label={`Edit ${client.name}`}
        >
          <Pencil />
        </Button>
      </div>
      {hasCompany(client) && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{client.company}</span>
        </p>
      )}
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Mail className="size-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{client.email}</span>
      </p>
      <KanbanMoveButtons client={client} onMove={onMove} />
    </li>
  );
}
