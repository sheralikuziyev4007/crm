import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { setApiReady } from "./lib/apiReady";
import { MOCKS_ENABLED } from "./mocks/enabled";
// Self-hosted fonts (@fontsource): no render-blocking requests to third-party domains;
// thanks to unicode-range the browser downloads only the subsets it actually needs
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./index.css";

// The mock API runs in a service worker. It is imported dynamically (with VITE_ENABLE_MOCKS=false none
// of that code is even built) and starts in parallel with the first render: requests wait for it, the UI does not.
async function enableMocking(): Promise<void> {
  if (!MOCKS_ENABLED) return;
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

// Let the page download and paint first; the mock API (≈100 kB) follows as soon as the browser is idle
const whenIdle = () =>
  new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) requestIdleCallback(() => resolve(), { timeout: 1000 });
    else setTimeout(resolve, 200);
  });

setApiReady(
  whenIdle()
    .then(enableMocking)
    .catch((error: unknown) => {
      // e.g. service workers are blocked: the app still works and shows its error states
      console.warn("Mock API could not start:", error);
    }),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
