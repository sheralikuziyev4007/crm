// The mock API is on unless VITE_ENABLE_MOCKS=false (set that when you point VITE_API_URL at a real backend)
export const MOCKS_ENABLED = import.meta.env.VITE_ENABLE_MOCKS !== "false";
