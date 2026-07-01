// @version 0.1.0 @date 2026-06-16
// NoKLock Articles — single article page at /articles/<slug>. Full content on
// our own domain for SEO/AIEO: sets per-article <title> + meta + canonical and
// injects Article JSON-LD (so AI engines + search cite the page). Body is the
// sanitised HTML from the Admin editor (same RichTextView as Updates). Print
// button for save-as-PDF. These pages are ALSO prerendered at build time
// (scripts/gen-prerender.mjs) so crawlers without JS see the full text.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArticle, CATEGORY_LABEL, type Article } from "../lib/articles-client.js";
import { RichTextView } from "../components/RichTextView.js";
import { SITE_ORIGIN } from "../lib/seo.js";

/** Set the document head for one article; returns a cleanup that restores it. */
function applyArticleHead(a: Article, slug: string): () => void {
  const url = `${SITE_ORIGIN}/articles/${slug}`;
  const prevTitle = document.title;
  document.title = `${a.title} — NoKLock`;
  const created: HTMLElement[] = [];

  function meta(attr: "name" | "property", key: string, val: string): void {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
      created.push(el);
    }
    el.setAttribute("content", val);
  }
  meta("name", "description", a.excerpt);
  meta("property", "og:title", a.title);
  meta("property", "og:description", a.excerpt);
  meta("property", "og:type", "article");
  meta("property", "og:url", url);

  let canon = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const prevCanon = canon?.getAttribute("href") ?? null;
  if (!canon) {
    canon = document.createElement("link");
    canon.setAttribute("rel", "canonical");
    document.head.appendChild(canon);
    created.push(canon);
  }
  canon.setAttribute("href", url);

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.ymd,
    author: { "@type": "Organization", name: "NoKLock" },
    publisher: { "@type": "Organization", name: "NoKLock" },
    mainEntityOfPage: url,
    articleSection: CATEGORY_LABEL[a.category] ?? a.category,
  });
  document.head.appendChild(ld);
  created.push(ld);

  return () => {
    document.title = prevTitle;
    if (prevCanon !== null && canon) canon.setAttribute("href", prevCanon);
    created.forEach((el) => { try { el.remove(); } catch { /* gone */ } });
  };
}

export function ArticleView(): JSX.Element {
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setState("loading");
    getArticle(slug)
      .then((a) => {
        if (!alive) return;
        if (!a) { setState("notfound"); return; }
        setArticle(a);
        setState("ok");
      })
      .catch((e) => { if (alive) { setError((e as Error).message); setState("error"); } });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    return applyArticleHead(article, slug);
  }, [article, slug]);

  if (state === "loading") {
    return <div className="max-w-3xl mx-auto py-8 text-text-muted text-sm">Loading…</div>;
  }
  if (state === "notfound") {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-3">
        <p className="text-text-on-dark">That article wasn't found.</p>
        <Link to="/articles" className="text-accent-cyan hover:underline">← All articles</Link>
      </div>
    );
  }
  if (state === "error" || !article) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-3">
        <p className="text-danger text-sm">Couldn't load this article: {error}</p>
        <Link to="/articles" className="text-accent-cyan hover:underline">← All articles</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-4 space-y-4 print-doc">
      <div className="flex items-center justify-between gap-3 flex-wrap no-print">
        <Link to="/articles" className="text-sm text-accent-cyan hover:underline">← All articles</Link>
        <button className="btn btn-secondary text-sm" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <header className="border-b border-bg-surface/40 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="tier-badge bg-cyan-700/30 text-accent-cyan border border-accent-cyan/40 text-[10px]">
            {CATEGORY_LABEL[article.category] ?? article.category}
          </span>
          <span className="text-[11px] text-text-muted font-mono">{article.ymd}</span>
        </div>
        <h1 className="text-3xl font-bold font-display"><span className="grad">{article.title}</span></h1>
      </header>
      <RichTextView html={article.body} className="text-text-on-dark/90 leading-relaxed space-y-3" />
    </article>
  );
}
