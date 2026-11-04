import { Link } from "react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/lib/routes";
import { SORT_FIELDS } from "../constants";
import type { Client, SortKey, SortState } from "../types";
import { hasCompany } from "../utils/filterClients";
import { RowActions } from "./RowActions";
import { SortableHead } from "./SortableHead";
import { StatusBadge } from "./StatusBadge";

interface ClientTableProps {
  clients: Client[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const label = (key: SortKey) => SORT_FIELDS.find((f) => f.key === key)?.label ?? key;

export function ClientTable({ clients, sort, onSort, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>ID</TableHead>
            <SortableHead label={label("name")} field="name" sort={sort} onSort={onSort} />
            <SortableHead label={label("company")} field="company" sort={sort} onSort={onSort} />
            <SortableHead label={label("email")} field="email" sort={sort} onSort={onSort} />
            <TableHead>Phone</TableHead>
            <SortableHead label={label("status")} field="status" sort={sort} onSort={onSort} />
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{client.id}</TableCell>
              <TableCell>
                <Link
                  to={ROUTES.client(client.id)}
                  className="font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {client.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {hasCompany(client) ? client.company : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{client.email}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{client.phone}</TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell>
                <RowActions client={client} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
