export const APP_NAME = "Pipeline CRM";

/** Pre-filled on the login page so a visitor can sign in with one click. */
export const DEMO_CREDENTIALS = {
  email: "demo@pipelinecrm.app",
  password: "demo1234",
} as const;

export const STORAGE_KEYS = {
  auth: "pipeline-auth",
  theme: "pipeline-theme",
  clientsView: "pipeline-clients-view",
  database: "pipeline-db-v1",
  demoControls: "pipeline-demo-controls",
} as const;

// Data fetching
export const QUERY_STALE_TIME_MS = 30_000;
export const QUERY_RETRY_DELAY_MS = 600;
export const SEARCH_DEBOUNCE_MS = 300;

// Lists
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
export const SKELETON_ROWS = 8;
export const RECENT_ACTIVITY_LIMIT = 8;
export const RECENT_CLIENTS_LIMIT = 5;
export const CHART_WEEKS = 8;

// Validation limits shared by forms and the API
export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  companyMax: 80,
  noteMax: 1000,
  passwordMin: 6,
  phoneDigitsMin: 8,
  phoneDigitsMax: 15,
} as const;

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
