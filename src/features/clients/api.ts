import { request } from "@/lib/http";
import type { Client, ClientInput } from "./types";

const clientPath = (id: string) => `/clients/${encodeURIComponent(id)}`;

export const listClients = () => request<Client[]>("/clients");

export const getClient = (id: string) => request<Client>(clientPath(id));

export const createClient = (input: ClientInput) =>
  request<Client>("/clients", { method: "POST", body: JSON.stringify(input) });

export const updateClient = (id: string, patch: Partial<ClientInput>) =>
  request<Client>(clientPath(id), { method: "PATCH", body: JSON.stringify(patch) });

export const deleteClient = (id: string) => request<void>(clientPath(id), { method: "DELETE" });
