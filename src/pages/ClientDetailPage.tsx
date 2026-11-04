import { ArrowLeft, Pencil, Trash2, UserX } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientActivityCard } from "@/features/activity/components/ClientActivityCard";
import { ClientFormDialog } from "@/features/clients/components/ClientFormDialog";
import { ClientProfileCard } from "@/features/clients/components/ClientProfileCard";
import { DeleteClientDialog } from "@/features/clients/components/DeleteClientDialog";
import { StatusBadge } from "@/features/clients/components/StatusBadge";
import { useClient, useMoveClient } from "@/features/clients/hooks";
import type { Client, StatusKey } from "@/features/clients/types";
import { NotesPanel } from "@/features/notes/components/NotesPanel";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/errors";
import { isApiError } from "@/lib/http";
import { ROUTES } from "@/lib/routes";

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-3 mb-4">
      <Link to={ROUTES.clients}>
        <ArrowLeft /> All clients
      </Link>
    </Button>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading client…</span>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96" />
        <Skeleton className="h-96 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const { clientId = "" } = useParams();
  const navigate = useNavigate();
  const clientQuery = useClient(clientId);
  const moveClient = useMoveClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  useDocumentTitle(clientQuery.data?.name ?? "Client");

  if (clientQuery.isPending) {
    return (
      <>
        <BackLink />
        <DetailSkeleton />
      </>
    );
  }

  if (clientQuery.isError) {
    const notFound = isApiError(clientQuery.error) && clientQuery.error.status === 404;
    return (
      <>
        <BackLink />
        {notFound ? (
          <EmptyState
            icon={<UserX />}
            title="Client not found"
            description="This client may have been deleted, or the link is wrong."
            action={
              <Button asChild>
                <Link to={ROUTES.clients}>Back to clients</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            title="Couldn't load this client"
            message={getErrorMessage(clientQuery.error)}
            onRetry={() => void clientQuery.refetch()}
            isRetrying={clientQuery.isFetching}
          />
        )}
      </>
    );
  }

  const client = clientQuery.data;

  const handleStatusChange = (status: StatusKey) =>
    moveClient.mutate(
      { id: client.id, status },
      {
        onError: (error) =>
          toast.error("Couldn't change the stage", {
            description: `${getErrorMessage(error)} The change was reverted.`,
          }),
      },
    );

  return (
    <>
      <BackLink />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{client.company || "Independent client"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil /> Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteTarget(client)}
            className="text-danger hover:bg-destructive/10 hover:text-danger"
          >
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-1">
          <ClientProfileCard client={client} onStatusChange={handleStatusChange} />
        </div>
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <NotesPanel clientId={client.id} />
          <ClientActivityCard clientId={client.id} />
        </div>
      </div>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
      <DeleteClientDialog
        client={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleted={() => navigate(ROUTES.clients, { replace: true })}
      />
    </>
  );
}
