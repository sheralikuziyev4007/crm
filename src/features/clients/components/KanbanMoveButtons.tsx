import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUSES } from "../constants";
import type { Client, StatusKey } from "../types";

interface KanbanMoveButtonsProps {
  client: Client;
  onMove: (id: string, status: StatusKey) => void;
}

// Alternative to drag and drop: HTML5 DnD does not work on touch screens or with a keyboard
export function KanbanMoveButtons({ client, onMove }: KanbanMoveButtonsProps) {
  const index = STATUSES.findIndex((s) => s.key === client.status);
  const prev = index > 0 ? STATUSES[index - 1] : null;
  const next = index >= 0 && index < STATUSES.length - 1 ? STATUSES[index + 1] : null;

  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      {prev ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMove(client.id, prev.key)}
          aria-label={`Move to ${prev.label}`}
        >
          <ArrowLeft /> {prev.label}
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMove(client.id, next.key)}
          aria-label={`Move to ${next.label}`}
        >
          {next.label} <ArrowRight />
        </Button>
      )}
    </div>
  );
}
