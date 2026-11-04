import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Providers } from "@/app/Providers";
import { routes } from "@/app/routes";
import { createToken, demoUser } from "@/mocks/auth";
import { useAuthStore } from "@/store/authStore";

/** A client that fails fast (no retries) and keeps nothing between tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function createWrapper(queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/** Signs in as the demo user without going through the login form. */
export function signIn() {
  const user = demoUser();
  useAuthStore.getState().signIn({ token: createToken(user), user });
}

interface RenderAppOptions {
  route?: string;
  signedIn?: boolean;
}

/** Renders the real app (routes, providers, mock API) at a URL. */
export function renderApp({ route = "/", signedIn = true }: RenderAppOptions = {}) {
  if (signedIn) signIn();
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const utils = render(
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { user, router, queryClient, ...utils };
}

/** Rows of the desktop table (the mobile card list is rendered too, hidden by CSS). */
export const tableRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

export const cellText = (row: HTMLElement, index: number) =>
  within(row).getAllByRole("cell")[index].textContent;

/** Opens the clients page and waits until the table is there. */
export async function renderClientsPage(options: Omit<RenderAppOptions, "route"> = {}) {
  const result = renderApp({ route: "/clients", ...options });
  await screen.findByRole("table");
  return result;
}
