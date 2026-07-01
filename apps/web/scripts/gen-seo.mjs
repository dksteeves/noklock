// gen-seo.mjs — regenerates public/sitemap.xml from the single source of
// truth (src/lib/seo.ts ROUTE_SEO). Runs in `prebuild` so the committed
// sitemap can never drift from the actual marketing routes.
//
// Parses seo.ts as text (the ROUTE_SEO shape is ours and stable: each entry
// has `path: "..."` and `priority: N`). No TS loader needed — keeps this a
// zero-dependency build step.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const seoTsPath = join(here, "..", "src", "lib", "seo.ts");
const outPath = join(here, "..", "public", "sitemap.xml");

const src = readFileSync(seoTsPath, "utf8");

const originMatch = src.match(/SITE_ORIGIN\s*=\s*"([^"]+)"/);
const ORIGIN = originMatch ? originMatch[1] : "https://noklock.app";

// Grab the ROUTE_SEO array body.
const arrMatch = src.match(/ROUTE_SEO[^=]*=\s*\[([\s\S]*?)\];/);
if (!arrMatch) {
  console.error("gen-seo: could not locate ROUTE_SEO array in seo.ts");
  process.exit(1);
}
const body = arrMatch[1];

// Each entry: capture path then the next priority.
const entryRe = /path:\s*"([^"]+)"[\s\S]*?priority:\s*([0-9.]+)/g;
const routes = [];
let m;
while ((m = entryRe.exec(body)) !== null) {
  routes.push({ path: m[1], priority: Number(m[2]) });
}
if (routes.length === 0) {
  console.error("gen-seo: parsed 0 routes from ROUTE_SEO — aborting");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map((r) => {
    const loc = `${ORIGIN}${r.path === "/" ? "/" : r.path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(outPath, xml, "utf8");
console.log(`gen-seo: wrote ${routes.length} URLs to public/sitemap.xml`);
