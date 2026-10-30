import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Plus, Search, List as ListIcon, LayoutGrid, Users } from "lucide-react";
import type { Client, ClientFields, SortState, StatusFilter } from "./types";
import { STATUSES } from "./utils/constants";
import { sortClients, nextSortState } from "./utils/sortClients";
import { useClients } from "./hooks/useClients";
import { useDebounced } from "./hooks/useDebounced";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";
import ClientList from "./components/ClientList";
import KanbanBoard from "./components/KanbanBoard";
import ClientForm from "./components/ClientForm";
import ConfirmDelete from "./components/ConfirmDelete";
import StatsCards from "./components/StatsCards";
import StatusChart from "./components/StatusChart";
import SortSelect from "./components/SortSelect";
import Pagination from "./components/Pagination";
import Toast from "./components/Toast";

type ModalState = { mode: "add" } | { mode: "edit"; client: Client } | null;

export default function App() {
  const { clients, addClient, updateClient, deleteClient, updateStatus } = useClients();
  const { theme, toggle: toggleTheme } = useTheme();

  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedSearch = useDebounced(search, 300);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // Таймер тоста не должен жить дольше компонента
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return clients.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [clients, debouncedSearch, statusFilter]);

  const sorted = useMemo(() => sortClients(filtered, sort), [filtered, sort]);

  // При смене поиска, фильтра, сортировки или размера страницы — возвращаемся на первую страницу
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sort.key, sort.dir, pageSize]);

  // Страница могла «исчезнуть» после удаления клиента — подрезаем до последней существующей
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize]
  );

  const handleSave = (fields: ClientFields) => {
    if (modal?.mode === "edit") {
      updateClient(modal.client.id, fields);
      showToast("Клиент обновлён");
    } else {
      addClient(fields);
      showToast("Клиент добавлен");
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteClient(deleteTarget.id);
    showToast("Клиент удалён");
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-8">
      <main className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30"
            >
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900">CRM mini</h1>
              <p className="text-sm text-stone-500">Управление клиентами · {clients.length} записей</p>
            </div>
          </div>
          <div className="flex items-center gap-2 max-sm:w-full">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              onClick={() => setModal({ mode: "add" })}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-700/25 transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas max-sm:flex-1"
            >
              <Plus size={16} /> Добавить клиента
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
            <StatsCards clients={clients} activeFilter={statusFilter} onSelect={setStatusFilter} />
          </div>
          <StatusChart clients={clients} />
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, компании или email..."
              aria-label="Поиск клиентов"
              className="w-full rounded-lg border border-stone-300 bg-surface pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Фильтр по статусу"
            className="rounded-lg border border-stone-300 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="all">Все статусы</option>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <SortSelect sort={sort} onChange={setSort} />

          <div className="flex rounded-lg border border-stone-300 bg-surface p-0.5 self-start lg:self-auto">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors ${
                view === "list" ? "bg-brand-700 text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <ListIcon size={14} /> Список
            </button>
            <button
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors ${
                view === "kanban" ? "bg-brand-700 text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
          </div>
        </div>

        {view === "list" ? (
          <>
            <ClientList
              clients={pageItems}
              sort={sort}
              onSort={(key) => setSort((s) => nextSortState(s, key))}
              onEdit={(cl) => setModal({ mode: "edit", client: cl })}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={sorted.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <KanbanBoard
            clients={sorted}
            onDrop={updateStatus}
            onEdit={(cl) => setModal({ mode: "edit", client: cl })}
          />
        )}
      </main>

      {modal && (
        <ClientForm
          initial={modal.mode === "edit" ? modal.client : null}
          onCancel={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.name} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}

      <Toast message={toast} />
    </div>
  );
}
