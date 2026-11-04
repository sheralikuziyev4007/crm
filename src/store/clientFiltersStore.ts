import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ClientsView, SortKey, SortState, StatusFilter } from "@/features/clients/types";
import { DEFAULT_PAGE_SIZE, STORAGE_KEYS } from "@/lib/constants";

interface ClientFiltersState {
  search: string;
  status: StatusFilter;
  sort: SortState;
  view: ClientsView;
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setStatus: (status: StatusFilter) => void;
  setSort: (sort: SortState) => void;
  /** Column header click cycles asc → desc → off */
  cycleSort: (key: SortKey) => void;
  setView: (view: ClientsView) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
}

const UNSORTED: SortState = { key: null, dir: "asc" };

export function nextSortState(current: SortState, key: SortKey): SortState {
  if (current.key !== key) return { key, dir: "asc" };
  if (current.dir === "asc") return { key, dir: "desc" };
  return UNSORTED;
}

// Every change that alters the result set goes back to page 1
export const useClientFiltersStore = create<ClientFiltersState>()(
  persist(
    (set) => ({
      search: "",
      status: "all",
      sort: UNSORTED,
      view: "table",
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setSort: (sort) => set({ sort, page: 1 }),
      cycleSort: (key) => set((s) => ({ sort: nextSortState(s.sort, key), page: 1 })),
      setView: (view) => set({ view }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      clearFilters: () => set({ search: "", status: "all", page: 1 }),
    }),
    {
      name: STORAGE_KEYS.clientsView,
      storage: createJSONStorage(() => localStorage),
      // Layout preferences are remembered; search and filters start fresh on every visit
      partialize: ({ view, pageSize }) => ({ view, pageSize }),
    },
  ),
);
