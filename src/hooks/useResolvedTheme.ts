import { useSyncExternalStore } from "react";
import { resolveTheme, useThemeStore, type ResolvedTheme } from "@/store/themeStore";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia?.(QUERY);
  media?.addEventListener?.("change", onChange);
  return () => media?.removeEventListener?.("change", onChange);
}

const getSystemPrefersDark = () => window.matchMedia?.(QUERY).matches ?? false;

/** "light" or "dark", following the saved preference or, for "system", the OS setting live. */
export function useResolvedTheme(): ResolvedTheme {
  const preference = useThemeStore((s) => s.preference);
  const systemPrefersDark = useSyncExternalStore(subscribe, getSystemPrefersDark, () => false);
  return resolveTheme(preference, systemPrefersDark);
}
