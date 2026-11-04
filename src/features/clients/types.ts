export type StatusKey = "lead" | "active" | "closed";
export type StatusFilter = StatusKey | "all";

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: StatusKey;
  createdAt: number;
}

/** What the user can edit; id and createdAt are set by the server. */
export type ClientInput = Omit<Client, "id" | "createdAt">;

export type SortKey = "name" | "company" | "email" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey | null;
  dir: SortDirection;
}

export type ClientsView = "table" | "kanban";
