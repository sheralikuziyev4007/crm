import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import RouteErrorPage from "@/pages/RouteErrorPage";

// Every page is its own chunk: the login screen does not download the dashboard, and so on
// The app shell (Radix menus, dialogs) is a chunk of its own too, so the login page stays light
const AppLayout = lazy(() => import("@/components/layout/AppLayout").then((m) => ({ default: m.AppLayout })));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("@/pages/ClientDetailPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "/login",
            element: (
              <Suspense fallback={<FullPageLoader />}>
                <LoginPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <Suspense fallback={<FullPageLoader />}>
                <AppLayout />
              </Suspense>
            ),
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "clients", element: <ClientsPage /> },
              { path: "clients/:clientId", element: <ClientDetailPage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];
