import { Building2, CalendarDays, Hash, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, isoDate } from "@/lib/date";
import { telHref } from "@/lib/phone";
import type { Client, StatusKey } from "../types";
import { hasCompany } from "../utils/filterClients";
import { StatusSwitcher } from "./StatusSwitcher";

interface ClientProfileCardProps {
  client: Client;
  onStatusChange: (status: StatusKey) => void;
}

// <dl> > <div> > <dt>/<dd> is the only valid nesting, so the icon lives inside the <dt>
function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="relative min-w-0 pl-7">
      <dt className="text-xs text-muted-foreground">
        <span className="absolute left-0 top-0.5 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  );
}

export function ClientProfileCard({ client, onStatusChange }: ClientProfileCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <Avatar name={client.name} className="size-12 text-base" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{client.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {hasCompany(client) ? client.company : "Independent"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <StatusSwitcher value={client.status} onChange={onStatusChange} />
        <dl className="space-y-4">
          <Detail icon={<Mail />} label="Email">
            <a href={`mailto:${client.email}`} className="text-primary hover:underline">
              {client.email}
            </a>
          </Detail>
          <Detail icon={<Phone />} label="Phone">
            <a href={telHref(client.phone)} className="text-primary hover:underline">
              {client.phone}
            </a>
          </Detail>
          {hasCompany(client) && (
            <Detail icon={<Building2 />} label="Company">
              {client.company}
            </Detail>
          )}
          <Detail icon={<CalendarDays />} label="Client since">
            <time dateTime={isoDate(client.createdAt)}>{formatDate(client.createdAt)}</time>
          </Detail>
          <Detail icon={<Hash />} label="Client ID">
            <span className="font-mono">{client.id}</span>
          </Detail>
        </dl>
      </CardContent>
    </Card>
  );
}
