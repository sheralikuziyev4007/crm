/** @type {import('tailwindcss').Config} */
// Цвета берутся из CSS-переменных (см. src/index.css) — тема переключается классом .dark на <html>,
// поэтому в компонентах не нужно дублировать классы вида dark:...
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix, shades) => Object.fromEntries(shades.map((s) => [s, v(`${prefix}-${s}`)]));

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: v("canvas"),
        surface: v("surface"),
        stone: scale("stone", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        brand: { ...scale("brand", [50, 300, 400, 600, 700, 800]), ink: v("brand-ink") },
      },
      fontFamily: {
        display: ["'Space Grotesk Variable'", "'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
