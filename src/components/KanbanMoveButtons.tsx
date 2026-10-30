import type { MouseEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Client, StatusKey } from "../types";
import { STATUSES } from "../utils/constants";

// Альтернатива drag-and-drop: HTML5 DnD не работает на touch-экранах
interface KanbanMoveButtonsProps {
  client: Client;
  onMove: (id: string, status: StatusKey) => void;
}

export default function KanbanMoveButtons({ client, onMove }: KanbanMoveButtonsProps) {
  const index = STATUSES.findIndex((s) => s.key === client.status);
  const prev = index > 0 ? STATUSES[index - 1] : null;
  const next = index >= 0 && index < STATUSES.length - 1 ? STATUSES[index + 1] : null;

  if (!prev && !next) return null;

  const handle = (e: MouseEvent<HTMLButtonElement>, status: (typeof STATUSES)[number]) => {
    e.stopPropagation(); // не открывать форму редактирования
    onMove(client.id, status.key);
  };

  const btn =
    "inline-flex items-center gap-1 rounded border border-stone-200 px-2 py-1 text-[11px] font-medium text-stone-500 hover:border-brand-300 hover:text-brand-ink hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors";

  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      {prev ? (
        <button type="button" onClick={(e) => handle(e, prev)} aria-label={`Переместить в ${prev.label}`} className={btn}>
          <ArrowLeft size={11} /> {prev.label}
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button type="button" onClick={(e) => handle(e, next)} aria-label={`Переместить в ${next.label}`} className={btn}>
          {next.label} <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}
