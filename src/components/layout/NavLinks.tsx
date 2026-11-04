import { LayoutDashboard, Settings, Users } from "lucide-react";
import { NavLink } from "react-router";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.clients, label: "Clients", icon: Users, end: false },
  { to: ROUTES.settings, label: "Settings", icon: Settings, end: false },
] as const;

// NavLink sets aria-current="page" on the active link, so screen readers announce where you are
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
