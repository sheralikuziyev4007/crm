import type { StatusInfo, StatusKey } from "../types";

// Цвета — CSS-переменные из index.css: в тёмной теме они подменяются автоматически
const statusColors = (key: "lead" | "active" | "closed") => ({
  color: `rgb(var(--${key}-fg))`,
  bg: `rgb(var(--${key}-bg))`,
  dot: `rgb(var(--${key}-dot))`,
});

export const STATUSES: ReadonlyArray<StatusInfo & { key: StatusKey }> = [
  { key: "lead", label: "Lead", ...statusColors("lead") },
  { key: "active", label: "Active", ...statusColors("active") },
  { key: "closed", label: "Closed", ...statusColors("closed") },
];

export const STORAGE_KEY = "crm-mini-clients-v1";
// Последний выданный номер id — чтобы id удалённого клиента не достался новому
export const LAST_ID_KEY = "crm-mini-last-id-v1";

// Безопасный поиск статуса: неизвестный ключ (например, из повреждённого localStorage) не ломает UI
export const getStatus = (key: string): StatusInfo =>
  STATUSES.find((s) => s.key === key) ?? {
    key,
    label: key || "—",
    ...statusColors("closed"),
  };
