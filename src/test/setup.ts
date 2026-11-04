import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { toast } from "sonner";
import { server } from "@/mocks/server";
import { db } from "@/mocks/db";
import { setBaseLatency } from "@/mocks/controls";
import { useAuthStore } from "@/store/authStore";
import { useClientFiltersStore } from "@/store/clientFiltersStore";
import { reloadThemePreference } from "@/store/themeStore";

// ---- Browser APIs jsdom does not implement (Radix UI and sonner use them) ----
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

// ---- Fresh state for every test ----
const initialFilters = useClientFiltersStore.getState();

// Every request goes to the same mock API the browser uses; anything unexpected fails loudly
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(() => {
  setBaseLatency(0);
  db.reload(); // storage was cleared after the previous test, so this starts from the demo data
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  // sonner keeps toasts in a module-level store; a new <Toaster> would show the previous test's toasts
  toast.dismiss();
  localStorage.clear();
  sessionStorage.clear();
  useAuthStore.setState({ token: null, user: null, signOutReason: null });
  useClientFiltersStore.setState(initialFilters, true);
  reloadThemePreference();
  document.documentElement.classList.remove("dark");
});

afterAll(() => server.close());
