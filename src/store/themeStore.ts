import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const isPreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

// Stored as a plain string (not zustand/persist JSON) because the inline script in index.html
// reads it before React loads, to apply the theme without a flash.
function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (isPreference(saved)) return saved;
  } catch {
    // localStorage is unavailable: follow the system
  }
  return "system";
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  preference: readPreference(),
  setPreference: (preference) => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, preference);
    } catch {
      // not critical: the choice just won't be remembered
    }
    set({ preference });
  },
}));

export const resolveTheme = (preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme =>
  preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;

/** Re-reads the saved preference, e.g. after tests clear localStorage. */
export const reloadThemePreference = () => useThemeStore.setState({ preference: readPreference() });
