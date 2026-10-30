import { Building2, Mail, Pencil } from "lucide-react";
import type { DragEvent } from "react";
import type { Client, StatusKey } from "../types";
import KanbanMoveButtons from "./KanbanMoveButtons";
import { hasCompany } from "../utils/company";

interface KanbanCardProps {
  client: Client;
  onDragStart: (e: DragEvent<HTMLDivElement>, id: string) => void;
  onEdit: (client: Client) => void;
  onMove: (id: string, status: StatusKey) => void;
}

export default function KanbanCard({ client, onDragStart, onEdit, onMove }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, client.id)}
      onClick={() => onEdit(client)}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-stone-200 bg-surface p-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-stone-400 font-mono">{client.id}</span>
        <button
          type="button"
          aria-label={`Редактировать ${client.name}`}
          onClick={(e) => {
            e.stopPropagation(); // иначе сработает клик по карточке и форма откроется дважды
            onEdit(client);
          }}
          className="-m-1 rounded p-1 text-stone-400 transition-colors hover:bg-brand-50 hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <Pencil size={12} />
        </button>
      </div>
      <div className="text-sm font-medium text-stone-800">{client.name}</div>
      {hasCompany(client) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          <Building2 size={11} /> {client.company}
        </div>
      )}
      <div className="mt-1 flex items-center gap-1 text-xs text-stone-400 truncate">
        <Mail size={11} /> {client.email}
      </div>
      <KanbanMoveButtons client={client} onMove={onMove} />
    </div>
  );
}
