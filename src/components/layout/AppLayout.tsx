import { Suspense } from "react";
import { Outlet } from "react-router";
import { PageLoader } from "@/components/common/PageLoader";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// Shell for every signed-in page: sidebar, top bar and the page itself
export function AppLayout() {
  return (
    <div className="bg-glow flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 focus:outline-none sm:px-6 sm:py-8"
        >
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
