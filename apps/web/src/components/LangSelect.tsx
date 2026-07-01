// @version 0.3.0 @date 2026-05-23
// 0.3.0 — `stayOnPage` prop (Daniel, 3rd ask): the language selector AT THE
//         TOP OF THE USER GUIDE must reload the SAME page in the new language
//         (the Manual IS fully translated, so staying put is right) — it was
//         still hard-navigating home, which is bad UX. The FOOTER selector
//         keeps the go-home-and-reload behaviour (the rest of the site is
//         English-authoritative). So: Manual passes stayOnPage → reload();
//         everywhere else → assign("/").
// 0.2.0 — Changing language persists the choice and HARD-navigates to a
//         freshly-loaded home page. Rationale: only the funnel is keyed-
//         translated; the rest is English-authoritative; one coherent reload
//         beats a half-changed in-place switch. (Now overridable per the
//         stayOnPage prop above for the fully-translated Manual.)
// 0.1.0 — Language picker (flag + native name). Funnel-only translation.

import { useT, LANGS, type Lang } from "../i18n/index.js";

// Must match i18n/index.tsx LS_KEY (kept in sync deliberately — the
// provider reads this on init).
const LS_KEY = "noklock.lang";

export function LangSelect({ compact, stayOnPage }: { readonly compact?: boolean; readonly stayOnPage?: boolean }): JSX.Element {
  const { lang, t } = useT();

  function change(next: Lang): void {
    if (next === lang) return;
    try {
      localStorage.setItem(LS_KEY, next);
    } catch {
      /* storage blocked — the provider will still default sanely */
    }
    // stayOnPage (the Manual): reload THIS path so the guide re-renders in the
    // chosen language. Otherwise: full reload at home (funnel-only translation).
    if (stayOnPage) window.location.reload();
    else window.location.assign("/");
  }

  return (
    <label className={`inline-flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <span className="text-text-muted">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={(e) => change(e.target.value as Lang)}
        className="bg-bg-deepest border border-bg-surface rounded p-1 text-text-on-dark/90"
        aria-label={t("lang.label")}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
