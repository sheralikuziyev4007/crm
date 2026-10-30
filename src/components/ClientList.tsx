import type { Client, SortKey, SortState } from "../types";
import ClientRow from "./ClientRow";
import ClientCard from "./ClientCard";
import SortableHeader from "./SortableHeader";

interface ClientListProps {
  clients: Client[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export default function ClientList({ clients, sort, onSort, onEdit, onDelete }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-surface text-center text-sm text-stone-400 py-12 shadow-sm">
        Клиенты не найдены
      </div>
    );
  }

  return (
    <>
      {/* Планшет и десктоп: таблица с горизонтальным скроллом на случай узкого экрана */}
      <div className="hidden md:block rounded-2xl border border-stone-200 bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-stone-50 text-left text-[11px] font-mono uppercase tracking-wide text-stone-400 border-b border-stone-200">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <SortableHeader label="Имя" field="name" sort={sort} onSort={onSort} />
                <SortableHeader label="Компания" field="company" sort={sort} onSort={onSort} />
                <SortableHeader label="Email" field="email" sort={sort} onSort={onSort} />
                <th className="px-4 py-2.5 font-medium">Телефон</th>
                <SortableHeader label="Статус" field="status" sort={sort} onSort={onSort} />
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <ClientRow key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Телефон: список карточек */}
      <ul className="md:hidden space-y-3">
        {clients.map((c) => (
          <ClientCard key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}
