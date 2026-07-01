// @version 0.1.0 @date 2026-06-16
// PWA client for the NoKLock Articles API (Form B). Public reads; owner-signed
// writes (the Admin editor signs via personal_sign recovering to the contract
// owner). Mirrors quorum-client.ts's base-URL resolution.

import type { Hex } from "viem";

const BASE: string = (
  (import.meta.env.VITE_FORM_B_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.noklock.app"
).replace(/\/+$/, "");

export const ARTICLE_CATEGORIES = ["security", "utility", "technology", "compliance", "guides", "features"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleMeta {
  readonly id: number;
  readonly slug: string;
  readonly ymd: string;
  readonly title: string;
  readonly category: string;
  readonly excerpt: string;
  readonly added_at: number;
  readonly updated_at: number;
}
export interface Article extends ArticleMeta {
  readonly body: string;
}

export async function listArticles(): Promise<ArticleMeta[]> {
  const r = await fetch(`${BASE}/v1/articles`, { credentials: "omit" });
  if (!r.ok) throw new Error(`articles list failed (${r.status})`);
  const b = (await r.json()) as { articles?: ArticleMeta[] };
  return Array.isArray(b.articles) ? b.articles : [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const r = await fetch(`${BASE}/v1/articles/${encodeURIComponent(slug)}`, { credentials: "omit" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`article fetch failed (${r.status})`);
  const b = (await r.json()) as { article?: Article };
  return b.article ?? null;
}

export interface PublishArticleArgs {
  readonly slug: string;
  readonly ymd: string;
  readonly title: string;
  readonly category: string;
  readonly excerpt: string;
  readonly body: string;
  readonly signature: Hex;
}

export async function publishArticle(args: PublishArticleArgs): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${BASE}/v1/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(args),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return { ok: false, error: t || `HTTP ${r.status}` };
  }
  return { ok: true };
}

export async function deleteArticle(id: number, signature: Hex): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${BASE}/v1/articles/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({ signature }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return { ok: false, error: t || `HTTP ${r.status}` };
  }
  return { ok: true };
}

/** Owner sign-message strings the Form B routes recover against (verbatim). */
export const articlePublishMsg = (slug: string): string => `NoKLock article publish: ${slug}`;
export const articleDeleteMsg = (id: number): string => `NoKLock article delete: ${id}`;

/** Derive a URL slug from a title (lowercase, hyphenated, a-z0-9). */
export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  utility: "Utility",
  technology: "Technology",
  compliance: "Compliance",
  guides: "Guides",
  features: "Features",
};
