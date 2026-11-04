import { Download, Inbox, Plus, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { ClientCardList } from "@/features/clients/components/ClientCardList";
import { ClientFormDialog } from "@/features/clients/components/ClientFormDialog";
import { ClientListSkeleton } from "@/features/clients/components/ClientListSkeleton";
import { ClientsToolbar } from "@/features/clients/components/ClientsToolbar";
import { ClientTable } from "@/features/clients/components/ClientTable";
import { DeleteClientDialog } from "@/features/clients/components/DeleteClientDialog";
import { KanbanBoard } from "@/features/clients/components/KanbanBoard";
import { useClients, useMoveClient } from "@/features/clients/hooks";
import type { Client, StatusKey } from "@/features/clients/types";
import { exportClients } from "@/features/clients/utils/exportClients";
import { filterClients } from "@/features/clients/utils/filterClients";
import { sortClients } from "@/features/clients/utils/sortClients";
import { useDebounced } from "@/hooks/useDebounced";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { paginate } from "@/lib/pagination";
import { useClientFiltersStore } from "@/store/clientFiltersStore";

const NO_CLIENTS: Client[] = [];

type FormTarget = { client: Client | null } | null;

export default function ClientsPage() {
  useDocumentTitle("Clients");
  const clientsQuery = useClients();
  const moveClient = useMoveClient();
  const { search, status, sort, view, page, pageSize, cycleSort, setPage, setPageSize, clearFilters } =
    useClientFiltersStore(
      useShallow((s) => ({
        search: s.search,
        status: s.status,
        sort: s.sort,
        view: s.view,
        page: s.page,
        pageSize: s.pageSize,
        cycleSort: s.cycleSort,
        setPage: s.setPage,
        setPageSize: s.setPageSize,
        clearFilters: s.clearFilters,
      })),
    );
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const debouncedSearch = useDebounced(search, SEARCH_DEBOUNCE_MS);
  // Typing is debounced, but emptying the box (or "Clear filters") applies at once
  const activeSearch = search === "" ? "" : debouncedSearch;

  const clients = clientsQuery.data ?? NO_CLIENTS;
  const visible = useMemo(
    () => sortClients(filterClients(clients, activeSearch, status), sort),
    [clients, activeSearch, status, sort],
  );
  const { currentPage, pageItems } = paginate(visible, page, pageSize);

  const openCreate = () => setFormTarget({ client: null });
  const openEdit = (client: Client) => setFormTarget({ client });

  const handleMove = (id: string, next: StatusKey) =>
    moveClient.mutate(
      { id, status: next },
      {
        onError: (error) =>
          toast.error("Couldn't move the client", {
            description: `${getErrorMessage(error)} The change was reverted.`,
          }),
      },
    );

  const handleExport = () => {
    exportClients(visible);
    toast.success(`Exported ${visible.length} ${visible.length === 1 ? "client" : "clients"}`);
  };

  const renderContent = () => {
    if (clientsQuery.isPending) return <ClientListSkeleton />;

    if (clientsQuery.isError && !clientsQuery.data) {
      return (
        <ErrorState
          title="Couldn't load clients"
          message={getErrorMessage(clientsQuery.error)}
          onRetry={() => void clientsQuery.refetch()}
          isRetrying={clientsQuery.isFetching}
        />
      );
    }

    if (clients.length === 0) {
      return (
        <EmptyState
          icon={<Inbox />}
          title="No clients yet"
          description="Add your first client to start tracking your pipeline."
          action={
            <Button onClick={openCreate}>
              <Plus /> Add your first client
            </Button>
          }
        />
      );
    }

    if (visible.length === 0) {
      return (
        <EmptyState
          icon={<SearchX />}
          title="No clients found"
          description="Nothing matches your search or filter. Try different keywords or clear the filters."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }

    if (view === "kanban") return <KanbanBoard clients={visible} onEdit={openEdit} onMove={handleMove} />;

    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <ClientTable
            clients={pageItems}
            sort={sort}
            onSort={cycleSort}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
        <div className="md:hidden">
          <ClientCardList clients={pageItems} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div>
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={visible.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    );
  };

  const total = clientsQuery.data?.length;

  return (
    <>
      <PageHeader
        title="Clients"
        description={
          total === undefined
            ? "Your pipeline"
            : `${total} ${total === 1 ? "client" : "clients"} in your pipeline`
        }
        actions={
          <>
            <Button variant="outline" onClick={handleExport} disabled={visible.length === 0}>
              <Download /> Export CSV
            </Button>
            <Button onClick={openCreate} disabled={!clientsQuery.data}>
              <Plus /> Add client
            </Button>
          </>
        }
      />

      <div className="space-y-5">
        <ClientsToolbar />
        {renderContent()}
      </div>

      <ClientFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        client={formTarget?.client ?? null}
      />
      <DeleteClientDialog client={deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </>
  );
}
