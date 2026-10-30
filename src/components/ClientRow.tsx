import { Pencil, Trash2 } from "lucide-react";
import type { Client } from "../types";
import StatusBadge from "./StatusBadge";
import { companyLabel } from "../utils/company";

interface ClientRowProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export default function ClientRow({ client, onEdit, onDelete }: ClientRowProps) {
  return (
    <tr className="border-b border-stone-100 hover:bg-stone-50/70 transition-colors">
      <td className="px-4 py-3 text-xs text-stone-400 font-mono">{client.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-stone-800">{client.name}</td>
      <td className="px-4 py-3 text-sm text-stone-500">{companyLabel(client)}</td>
      <td className="px-4 py-3 text-sm text-stone-500">{client.email}</td>
      <td className="px-4 py-3 text-sm text-stone-500 whitespace-nowrap">{client.phone}</td>
      <td className="px-4 py-3">
        <StatusBadge status={client.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(client)}
            aria-label={`Редактировать ${client.name}`}
            className="rounded p-1.5 text-stone-400 hover:text-brand-ink hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(client)}
            aria-label={`Удалить ${client.name}`}
            className="rounded p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
