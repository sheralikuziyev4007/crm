import { useState, type DragEvent } from "react";
import type { Client, StatusKey } from "../types";
import { STATUSES } from "../utils/constants";
import KanbanCard from "./KanbanCard";

interface KanbanBoardProps {
  clients: Client[];
  onDrop: (id: string, status: StatusKey) => void;
  onEdit: (client: Client) => void;
}

export default function KanbanBoard({ clients, onDrop, onEdit }: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<StatusKey | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {STATUSES.map((s) => {
        const items = clients.filter((c) => c.status === s.key);
        return (
          <div
            key={s.key}
            data-status={s.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(s.key);
            }}
            onDragLeave={(e) => {
              // игнорируем «уход» на дочерние элементы — иначе подсветка мерцает
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) onDrop(id, s.key);
              setDragOverCol(null);
            }}
            className={`rounded-2xl border p-3 min-h-[320px] transition-colors ${
              dragOverCol === s.key ? "border-brand-400 bg-brand-50/40" : "border-stone-200 bg-stone-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: s.dot }} className="h-2 w-2 rounded-full" />
                <span className="font-display text-sm font-semibold text-stone-700">{s.label}</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((c) => (
                <KanbanCard key={c.id} client={c} onDragStart={handleDragStart} onEdit={onEdit} onMove={onDrop} />
              ))}
              {items.length === 0 && (
                <div className="text-center text-xs text-stone-400 py-8 border border-dashed border-stone-200 rounded-lg">
                  Пусто
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
