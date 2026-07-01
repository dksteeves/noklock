// @version 0.2.0 @date 2026-05-13
// 0.2.0 — dropped autoprefixer. Tailwind v3 covers our modern-browser
// targets without needing -webkit-/-moz- prefix expansion, and autoprefixer
// drags in caniuse-lite which has a known partial-install failure mode on
// Windows + npm workspaces. When we ship the marketing site to legacy-
// browser users we can re-add via Vite's official @vitejs/plugin-legacy.
export default {
  plugins: {
    tailwindcss: {},
  },
};
