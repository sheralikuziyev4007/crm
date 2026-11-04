import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/common/FormAlert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useReturnFocus } from "@/hooks/useReturnFocus";
import { getErrorMessage } from "@/lib/errors";
import { useDeleteClient } from "../hooks";
import type { Client } from "../types";

interface DeleteClientDialogProps {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (client: Client) => void;
}

export function DeleteClientDialog({ client, onOpenChange, onDeleted }: DeleteClientDialogProps) {
  const deleteClient = useDeleteClient();
  const [error, setError] = useState<string | null>(null);
  const returnFocus = useReturnFocus(client !== null);

  const handleOpenChange = (open: boolean) => {
    if (!open) setError(null);
    onOpenChange(open);
  };

  // A plain button instead of AlertDialogAction: the dialog must stay open while deleting and on failure
  const handleDelete = async () => {
    if (!client) return;
    setError(null);
    try {
      await deleteClient.mutateAsync(client.id);
      toast.success("Client deleted", { description: client.name });
      handleOpenChange(false);
      onDeleted?.(client);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AlertDialog open={client !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent onCloseAutoFocus={returnFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete client?</AlertDialogTitle>
          <AlertDialogDescription>
            {client?.name} will be permanently deleted together with their notes and history. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <FormAlert message={error} />}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteClient.isPending}>
            {deleteClient.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {deleteClient.isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
