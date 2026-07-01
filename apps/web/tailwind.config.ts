// @version 0.2.0 @date 2026-05-13
// 0.2.0 — aligned Tailwind palette + fonts with Daniel's design-token spec.
//   • Inter (body) and Jura (display/heading) become the named font families.
//   • New semantic colour tokens added at the top level:
//       bg-deepest / bg-panel / bg-surface
//       text-on-dark / text-muted / text-primary
//       accent-cyan / accent-teal / accent-green
//       danger
//   • Existing `soul-*` and `accent-*` aliases REMAP onto the new hex values
//     so every existing className continues to compile but now produces
//     the new look automatically.

import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // -- Named semantic tokens (preferred for new code) --
        "bg-deepest":   "#0f172a",
        "bg-panel":     "#162032",
        "bg-surface":   "#1e293b",
        "text-on-dark": "#e2e8f0",
        "text-muted":   "#94a3b8",  // 2026-05-28: bumped from #64748b for legibility — passes WCAG AA on bg-deepest
        "text-primary": "#0f172a",
        "accent-cyan":  "#7dd3fc",
        "accent-teal":  "#2dd4bf",
        "accent-green": "#10b981",
        danger:         "#b91c1c",

        // -- Aliased legacy tokens (existing components keep working) --
        soul: {
          900: "#0f172a", // was #020617 → maps to --bg-deepest
          800: "#162032", // was #0f172a → maps to --bg-panel
          700: "#1e293b", // was #1e293b → maps to --bg-surface (unchanged)
          600: "#334155",
          500: "#475569",
        },
        accent: {
          500: "#2dd4bf", // teal — primary action
          400: "#7dd3fc", // cyan — hover / highlight
          300: "#10b981", // green — confirmation / success
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Jura", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 24px 60px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
