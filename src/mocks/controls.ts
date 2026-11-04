import { STORAGE_KEYS } from "@/lib/constants";

// Switches that let a visitor (or a test) make the mock API misbehave on purpose.
// They live in sessionStorage so they survive a reload but never leak into other tabs.

export const DEFAULT_LATENCY_MS = 400;
export const SLOW_NETWORK_EXTRA_MS = 2200;

export interface MockControls {
  slowNetwork: boolean;
  serverError: boolean;
}

const DEFAULTS: MockControls = { slowNetwork: false, serverError: false };

// Only used when sessionStorage cannot be read (blocked storage)
let fallback: MockControls = DEFAULTS;
let baseLatencyMs = DEFAULT_LATENCY_MS;

export function getMockControls(): MockControls {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.demoControls);
    if (stored === null) return DEFAULTS;
    const raw: unknown = JSON.parse(stored);
    if (typeof raw === "object" && raw !== null) {
      const saved = raw as Partial<Record<keyof MockControls, unknown>>;
      return { slowNetwork: saved.slowNetwork === true, serverError: saved.serverError === true };
    }
    return DEFAULTS;
  } catch {
    return fallback;
  }
}

export function setMockControls(patch: Partial<MockControls>): MockControls {
  fallback = { ...getMockControls(), ...patch };
  try {
    sessionStorage.setItem(STORAGE_KEYS.demoControls, JSON.stringify(fallback));
  } catch {
    // not critical: the in-memory copy still works for this page view
  }
  return fallback;
}

/** Tests set this to 0 so they do not wait for the simulated network. */
export function setBaseLatency(ms: number): void {
  baseLatencyMs = ms;
}

export function getLatencyMs(): number {
  return baseLatencyMs + (getMockControls().slowNetwork ? SLOW_NETWORK_EXTRA_MS : 0);
}
