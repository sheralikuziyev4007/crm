import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "@/lib/routes";
import { selectIsAuthenticated, useAuthStore } from "@/store/authStore";

export interface RedirectState {
  from?: string;
}

/** Signed-out visitors go to the login page, which sends them back here afterwards. */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const state: RedirectState = { from: `${location.pathname}${location.search}` };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }
  return <Outlet />;
}
