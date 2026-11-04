import type { SortKey, StatusKey } from "./types";

export interface StatusMeta {
  key: StatusKey;
  label: string;
  /** Tailwind classes for the badge (background + text), defined as CSS variables per theme */
  badgeClass: string;
  dotClass: string;
  /** Raw colour for SVG charts */
  color: string;
}

export const STATUSES: readonly StatusMeta[] = [
  {
    key: "lead",
    label: "Lead",
    badgeClass: "bg-status-lead-bg text-status-lead-fg",
    dotClass: "bg-status-lead-dot",
    color: "rgb(var(--lead-dot))",
  },
  {
    key: "active",
    label: "Active",
    badgeClass: "bg-status-active-bg text-status-active-fg",
    dotClass: "bg-status-active-dot",
    color: "rgb(var(--active-dot))",
  },
  {
    key: "closed",
    label: "Closed",
    badgeClass: "bg-status-closed-bg text-status-closed-fg",
    dotClass: "bg-status-closed-dot",
    color: "rgb(var(--closed-dot))",
  },
];

export const STATUS_KEYS = STATUSES.map((s) => s.key) as [StatusKey, ...StatusKey[]];

export const getStatusMeta = (key: StatusKey): StatusMeta =>
  STATUSES.find((s) => s.key === key) ?? STATUSES[0];

export const SORT_FIELDS: readonly { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Date added" },
];

export const CSV_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Date added" },
] as const;
