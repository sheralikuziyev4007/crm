export type StatusKey = "lead" | "active" | "closed";
export type StatusFilter = StatusKey | "all";

export interface StatusInfo {
  key: string;
  label: string;
  color: string; // цвет текста
  bg: string; // фон бейджа
  dot: string; // насыщенный цвет для точек и диаграммы
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: StatusKey;
  createdAt: number;
}

// Поля, которые пользователь вводит в форме
export type ClientFields = Omit<Client, "id" | "createdAt">;

export type SortKey = "name" | "company" | "email" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey | null;
  dir: SortDirection;
}

export type FormErrors = Partial<Record<"name" | "email" | "phone", string>>;
