import { Building2, Mail, Phone } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/lib/routes";
import type { Client } from "../types";
import { hasCompany } from "../utils/filterClients";
import { RowActions } from "./RowActions";
import { StatusBadge } from "./StatusBadge";

interface ClientCardListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

// Phones get cards instead of a squeezed table
export function ClientCardList({ clients, onEdit, onDelete }: ClientCardListProps) {
  return (
    <ul className="space-y-3">
      {clients.map((client) => (
        <li key={client.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-muted-foreground">{client.id}</p>
              <Link to={ROUTES.client(client.id)} className="block truncate font-medium hover:text-primary">
                {client.name}
              </Link>
            </div>
            <StatusBadge status={client.status} />
          </div>
          <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {hasCompany(client) && (
              <div>
                <dt className="sr-only">Company</dt>
                <dd className="flex items-center gap-2">
                  <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{client.company}</span>
                </dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Email</dt>
              <dd className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{client.email}</span>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Phone</dt>
              <dd className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                {client.phone}
              </dd>
            </div>
          </dl>
          <div className="mt-3 border-t pt-2">
            <RowActions client={client} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}
