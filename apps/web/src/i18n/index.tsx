// @version 0.3.0 @date 2026-05-19
//
// Zero-dependency keyed i18n. The runtime DOM auto-translator was REMOVED
// (Daniel 2026-05-19) — whole-node scraping produced incoherent
// half-translated pages. i18n is now ONLY explicit `t(key)` lookups:
//   - the marketing funnel (Landing, diagrams, nav, footer) is fully
//     key-translated into every locale,
//   - everything else stays English (authoritative/precise) with the
//     per-item <TermTip> hover-translations + the localized
//     <PageLangNotice> box.
//
// Unknown keys fall back to English, then the key — never blank, never a
// mixed sentence. English is the governing version (Terms §12 / Info →
// Compliance). zh-Hans / hi flagged for native review.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./locales/en.js";
import { zhHans } from "./locales/zh-Hans.js";
import { hi } from "./locales/hi.js";
import { de } from "./locales/de.js";
import { fr } from "./locales/fr.js";
import { pt } from "./locales/pt.js";

export type Lang = "en" | "zh-Hans" | "hi" | "de" | "fr" | "pt";

export const LANGS: readonly { code: Lang; flag: string; name: string }[] = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "zh-Hans", flag: "🇨🇳", name: "中文（简体）" },
  { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
];

const DICTS: Record<Lang, Record<string, string>> = {
  en,
  "zh-Hans": zhHans,
  hi,
  de,
  fr,
  pt,
};

const LS_KEY = "noklock.lang";

function initialLang(): Lang {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && DICTS[v as Lang]) return v as Lang;
  } catch {
    /* storage blocked */
  }
  return "en";
}

interface I18nCtx {
  readonly lang: Lang;
  readonly setLang: (l: Lang) => void;
  readonly t: (key: string, fallback?: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === "zh-Hans" ? "zh" : lang;
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key, fallback) => DICTS[lang][key] ?? en[key] ?? fallback ?? key,
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT(): I18nCtx {
  const c = useContext(Ctx);
  // Safe default if a component renders outside the provider (tests, etc.):
  // English passthrough, never throws.
  return c ?? { lang: "en", setLang: () => undefined, t: (k, f) => en[k] ?? f ?? k };
}
