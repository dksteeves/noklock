// @version 0.2.0 @date 2026-06-17
// NoKLock Articles — public index. Full content is hosted on our own domain
// (per-article pages at /articles/<slug>) for SEO/AIEO. 0.2.0: grid/list view
// toggle + filter-by-category (Daniel 2026-06-17).

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listArticles, CATEGORY_LABEL, type ArticleMeta } from "../lib/articles-client.js";
import { useDocumentHead } from "../lib/seo.js";

type View = "grid" | "list";

export function Articles(): JSX.Element {
  useDocumentHead("/articles");
  const [articles, setArticles] = useState<ArticleMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("grid");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    listArticles().then(setArticles).catch((e) => setError((e as Error).message));
  }, []);

  // Categories that actually have articles (for the filter row).
  const cats = useMemo(() => {
    const set = new Set<string>();
    (articles ?? []).forEach((a) => set.add(a.category));
    return Array.from(set);
  }, [articles]);

  const shown = useMemo(
    () => (articles ?? []).filter((a) => cat === "all" || a.category === cat),
    [articles, cat],
  );

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">NoKLock Articles</span></h1>
        <p className="text-text-on-dark/85 mt-2">
          Plain-language writing on crypto inheritance, security, and how NoKLock works — published in full here, on our own site.
        </p>
      </header>

      {error && <p className="text-danger text-sm">Couldn't load articles: {error}</p>}
      {articles === null && !error && <p className="text-text-muted text-sm">Loading…</p>}
      {articles && articles.length === 0 && <p className="text-text-muted text-sm">No articles yet — check back soon.</p>}

      {articles && articles.length > 0 && (
        <>
          {/* Controls: category filter + grid/list toggle. */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCat("all")}
                className={`text-xs px-2.5 py-1 rounded-full border ${cat === "all" ? "border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-muted hover:text-text-on-dark"}`}
              >
                All
              </button>
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${cat === c ? "border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-muted hover:text-text-on-dark"}`}
                >
                  {CATEGORY_LABEL[c] ?? c}
                </button>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setView("grid")} title="Grid view"
                className={`text-xs px-2 py-1 rounded border ${view === "grid" ? "border-accent-cyan/60 text-accent-cyan" : "border-bg-surface text-text-muted hover:text-text-on-dark"}`}>▦ Grid</button>
              <button onClick={() => setView("list")} title="List view"
                className={`text-xs px-2 py-1 rounded border ${view === "list" ? "border-accent-cyan/60 text-accent-cyan" : "border-bg-surface text-text-muted hover:text-text-on-dark"}`}>☰ List</button>
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="text-text-muted text-sm">No articles in this category yet.</p>
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((a) => (
                <Link key={a.slug} to={`/articles/${a.slug}`} className="card block hover:border-accent-cyan/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="tier-badge bg-cyan-700/30 text-accent-cyan border border-accent-cyan/40 text-[10px]">{CATEGORY_LABEL[a.category] ?? a.category}</span>
                    <span className="text-[11px] text-text-muted font-mono">{a.ymd}</span>
                  </div>
                  <h2 className="font-bold font-display text-lg leading-snug">{a.title}</h2>
                  <p className="text-sm text-text-on-dark/75 mt-1 line-clamp-5">{a.excerpt}</p>
                  <span className="text-xs text-accent-cyan mt-2 inline-block">Read →</span>
                </Link>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-bg-surface/40 card !p-0">
              {shown.map((a) => (
                <li key={a.slug}>
                  <Link to={`/articles/${a.slug}`} className="flex items-baseline gap-3 px-4 py-3 hover:bg-bg-surface/30 transition-colors">
                    <span className="text-[10px] text-text-muted font-mono w-20 shrink-0">{a.ymd}</span>
                    <span className="tier-badge bg-cyan-700/30 text-accent-cyan border border-accent-cyan/40 text-[10px] shrink-0">{CATEGORY_LABEL[a.category] ?? a.category}</span>
                    <span className="min-w-0">
                      <span className="font-bold font-display">{a.title}</span>
                      <span className="text-text-on-dark/65 text-sm block sm:inline sm:ml-2 line-clamp-1">{a.excerpt}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
