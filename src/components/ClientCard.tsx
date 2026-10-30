import { Building2, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import type { Client } from "../types";
import StatusBadge from "./StatusBadge";
import { hasCompany } from "../utils/company";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <li className="rounded-2xl border border-stone-200 bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-stone-400 font-mono">{client.id}</div>
          <div className="text-sm font-medium text-stone-800 truncate">{client.name}</div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="mt-2 space-y-1 text-xs text-stone-500">
        {hasCompany(client) && (
          <div className="flex items-center gap-1.5">
            <Building2 size={12} className="shrink-0" /> <span className="truncate">{client.company}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Mail size={12} className="shrink-0" /> <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone size={12} className="shrink-0" /> {client.phone}
        </div>
      </div>

      <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
        <button
          onClick={() => onEdit(client)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
        >
          <Pencil size={13} /> Изменить
        </button>
        <button
          onClick={() => onDelete(client)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
        >
          <Trash2 size={13} /> Удалить
        </button>
      </div>
    </li>
  );
}
