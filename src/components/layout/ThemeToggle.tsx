import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { useThemeStore } from "@/store/themeStore";

// Quick switch in the top bar; Settings also offers "System"
export function ThemeToggle() {
  const theme = useResolvedTheme();
  const setPreference = useThemeStore((s) => s.setPreference);
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setPreference(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
