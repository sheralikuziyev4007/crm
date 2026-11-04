import { STATUSES } from "../constants";
import type { Client, StatusKey } from "../types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onMove: (id: string, status: StatusKey) => void;
}

export function KanbanBoard({ clients, onEdit, onMove }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status.key}
          status={status}
          clients={clients.filter((c) => c.status === status.key)}
          onEdit={onEdit}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
