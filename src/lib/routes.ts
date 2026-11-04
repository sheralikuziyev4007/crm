export const ROUTES = {
  login: "/login",
  dashboard: "/",
  clients: "/clients",
  client: (id: string) => `/clients/${encodeURIComponent(id)}`,
  settings: "/settings",
} as const;
