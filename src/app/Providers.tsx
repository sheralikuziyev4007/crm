import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { createQueryClient } from "@/lib/queryClient";

// Toasts are never needed for the first paint, so sonner loads in its own chunk
const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

/** Keeps the .dark class on <html> in sync with the chosen theme (and the OS, for "System"). */
function ThemeSync() {
  const theme = useResolvedTheme();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

interface ProvidersProps {
  children: ReactNode;
  /** Tests pass their own client (no retries, isolated cache) */
  queryClient?: QueryClient;
}

export function Providers({ children, queryClient }: ProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      {children}
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </QueryClientProvider>
  );
}
