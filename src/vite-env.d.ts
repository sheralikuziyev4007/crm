/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the REST API. Defaults to "/api". */
  readonly VITE_API_URL?: string;
  /** Set to "false" to turn the MSW mock API off and call a real backend. */
  readonly VITE_ENABLE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
