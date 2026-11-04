import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client } from "../types";

interface RowActionsProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function RowActions({ client, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(client)}
        aria-label={`Edit ${client.name}`}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(client)}
        aria-label={`Delete ${client.name}`}
        className="hover:bg-destructive/10 hover:text-danger"
      >
        <Trash2 />
      </Button>
    </div>
  );
}
