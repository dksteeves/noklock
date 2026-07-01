// @version 0.4.1 @date 2026-05-19
// 0.4.1 — + localized link to the full /manual step-by-step guide in the
//         visitor's language (screen-aligned walkthrough).
// 0.4.0 — Veracity: the old copy claimed "the main pages are in your
//         language" — false (only THIS landing page + nav/footer are
//         translated; the app, security, legal and enrolment pages are
//         English). Rewritten to say exactly that, and now suggests the
//         browser's built-in page-translation for the rest. (Daniel.)
// WS-C — ONE language-orientation block, HOME PAGE ONLY (Daniel: not
// repeated on every tab). Shown only when a non-English language is
// active. Self-contained — no per-page notice machinery, nothing on
// other routes, no stacked tooltips.

import { Link, useLocation } from "react-router-dom";
import { useT, type Lang } from "../i18n/index.js";

type NonEn = Exclude<Lang, "en">;

const HOME_BLOCK: Record<NonEn, { h: string; b: string; g: string }> = {
  de: {
    h: "Sprache & Übersetzungen",
    b: "Nur diese Startseite (samt Navigation und Fußzeile) ist in Ihrer Sprache. Der Rest von NoKLock — App, Sicherheits-, Rechts- und Einrichtungsseiten — ist auf Englisch, der rechtlich maßgeblichen Fassung; wichtige Begriffe zeigen beim Überfahren eine Übersetzung. Tipp: Ihr Browser kann den Rest übersetzen — in Chrome/Edge Rechtsklick → „Übersetzen“, in Safari die Übersetzungsschaltfläche.",
    g: "Vollständige Schritt-für-Schritt-Anleitung in Ihrer Sprache →",
  },
  fr: {
    h: "Langue et traductions",
    b: "Seule cette page d’accueil (avec la navigation et le pied de page) est dans votre langue. Le reste de NoKLock — l’application, les pages sécurité, mentions légales et enregistrement — est en anglais, la version juridiquement contraignante ; les termes clés affichent une traduction au survol. Astuce : votre navigateur peut traduire le reste — dans Chrome/Edge, clic droit → « Traduire » ; dans Safari, le bouton Traduire.",
    g: "Guide pas à pas complet dans votre langue →",
  },
  pt: {
    h: "Idioma e traduções",
    b: "Apenas esta página inicial (com navegação e rodapé) está no seu idioma. O resto do NoKLock — a aplicação e as páginas de segurança, jurídicas e de registo — está em inglês, a versão juridicamente vinculativa; os termos-chave mostram tradução ao passar o rato. Dica: o seu navegador pode traduzir o resto — no Chrome/Edge, botão direito → «Traduzir»; no Safari, o botão Traduzir.",
    g: "Guia passo a passo completo no seu idioma →",
  },
  "zh-Hans": {
    h: "语言与翻译",
    b: "仅本首页（含导航与页脚）提供您的语言。NoKLock 的其余部分——应用、安全、法律与登记页面——为英文（具有法律效力的版本）；关键术语鼠标悬停可见翻译。提示：可用浏览器翻译其余页面——Chrome/Edge 右键→“翻译”，Safari 点翻译按钮。",
    g: "您语言的完整分步指南 →",
  },
  hi: {
    h: "भाषा और अनुवाद",
    b: "केवल यह होम पेज (नेविगेशन और फ़ुटर सहित) आपकी भाषा में है। NoKLock का बाक़ी हिस्सा — ऐप, सुरक्षा, कानूनी और नामांकन पृष्ठ — अंग्रेज़ी में है, जो कानूनी रूप से मान्य संस्करण है; मुख्य शब्दों का अनुवाद माउस ले जाने पर दिखता है। सुझाव: बाक़ी पृष्ठ आपका ब्राउज़र अनुवाद कर सकता है — Chrome/Edge में राइट-क्लिक → “Translate”, Safari में Translate बटन।",
    g: "आपकी भाषा में पूर्ण चरण-दर-चरण मार्गदर्शिका →",
  },
};

// Mounted once in App (top of <main>). Renders the block ONLY on the home
// route and ONLY for a non-English language; nothing anywhere else.
export function RoutePageNotice(): JSX.Element | null {
  const { pathname } = useLocation();
  const { lang } = useT();
  const home = ((pathname.toLowerCase().replace(/\/+$/, "")) || "/") === "/";
  if (!home || lang === "en") return null;
  const c = HOME_BLOCK[lang];
  if (!c) return null;
  return (
    <div
      className="card border border-accent-cyan/40 bg-accent-cyan/5 mb-6 text-sm"
      lang={lang === "zh-Hans" ? "zh" : lang}
    >
      <h2 className="font-bold font-display mb-2"><span className="grad">{c.h}</span></h2>
      <p className="text-text-on-dark/85">{c.b}</p>
      <Link to="/manual" className="inline-block mt-2 text-accent-cyan hover:underline font-medium">{c.g}</Link>
    </div>
  );
}
