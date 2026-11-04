// One place for query keys. Everything about a client lives under ["clients", id, ...], so invalidating
// ["clients", id] refreshes the client together with its notes and history.
export const queryKeys = {
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  notes: (id: string) => ["clients", id, "notes"] as const,
  clientActivity: (id: string) => ["clients", id, "activity"] as const,
  recentActivity: ["activity", "recent"] as const,
};
