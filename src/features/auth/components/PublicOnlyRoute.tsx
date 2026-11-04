import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "@/lib/routes";
import { selectIsAuthenticated, useAuthStore } from "@/store/authStore";
import type { RedirectState } from "./ProtectedRoute";

/** The login page is only for signed-out visitors; everyone else continues where they were going. */
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const location = useLocation();
  const from = (location.state as RedirectState | null)?.from;

  if (isAuthenticated) return <Navigate to={from ?? ROUTES.dashboard} replace />;
  return <Outlet />;
}
