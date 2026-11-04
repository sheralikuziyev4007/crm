import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
// shadcn/ui design tokens: every colour is a CSS variable from src/index.css, so the .dark class on <html>
// re-themes the whole app and components never need duplicated dark: classes.
const hsl = (name) => `hsl(var(--${name}) / <alpha-value>)`;
const rgb = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        border: hsl("border"),
        input: hsl("input"),
        ring: hsl("ring"),
        background: hsl("background"),
        foreground: hsl("foreground"),
        primary: { DEFAULT: hsl("primary"), foreground: hsl("primary-foreground") },
        secondary: { DEFAULT: hsl("secondary"), foreground: hsl("secondary-foreground") },
        destructive: { DEFAULT: hsl("destructive"), foreground: hsl("destructive-foreground") },
        muted: { DEFAULT: hsl("muted"), foreground: hsl("muted-foreground") },
        accent: { DEFAULT: hsl("accent"), foreground: hsl("accent-foreground") },
        popover: { DEFAULT: hsl("popover"), foreground: hsl("popover-foreground") },
        card: { DEFAULT: hsl("card"), foreground: hsl("card-foreground") },
        danger: hsl("danger"),
        chart: { 1: rgb("chart-1"), ink: rgb("chart-ink") },
        status: {
          "lead-fg": rgb("lead-fg"),
          "lead-bg": rgb("lead-bg"),
          "lead-dot": rgb("lead-dot"),
          "active-fg": rgb("active-fg"),
          "active-bg": rgb("active-bg"),
          "active-dot": rgb("active-dot"),
          "closed-fg": rgb("closed-fg"),
          "closed-bg": rgb("closed-bg"),
          "closed-dot": rgb("closed-dot"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk Variable'", "'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};
