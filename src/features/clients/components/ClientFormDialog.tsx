import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReturnFocus } from "@/hooks/useReturnFocus";
import { useCreateClient, useUpdateClient } from "../hooks";
import type { ClientFormOutput } from "../schemas";
import type { Client } from "../types";
import { ClientForm } from "./ClientForm";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null → create a new client */
  client: Client | null;
  onSaved?: (client: Client) => void;
}

// The dialog stays open until the server confirms; failures are shown inside the form
export function ClientFormDialog({ open, onOpenChange, client, onSaved }: ClientFormDialogProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [dirty, setDirty] = useState(false);
  const handleDirtyChange = useCallback((value: boolean) => setDirty(value), []);
  const returnFocus = useReturnFocus(open);

  const handleSubmit = async (values: ClientFormOutput) => {
    const saved = client
      ? await updateClient.mutateAsync({ id: client.id, patch: values })
      : await createClient.mutateAsync(values);
    toast.success(client ? "Client updated" : "Client added", { description: saved.name });
    onSaved?.(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        // A click outside must not throw away what the user has typed
        onInteractOutside={(event) => dirty && event.preventDefault()}
        onCloseAutoFocus={returnFocus}
      >
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
          <DialogDescription>
            {client ? `Update the details of ${client.name}.` : "Add a person or company to your pipeline."}
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          key={client?.id ?? "new"}
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          onDirtyChange={handleDirtyChange}
        />
      </DialogContent>
    </Dialog>
  );
}
