import { Moon, Sun } from "lucide-react";
import type { Theme } from "../hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-surface text-stone-500 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
