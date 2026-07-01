// @version 0.1.0 @date 2026-05-31
// AdminSocials — NK0-b, Daniel 2026-05-31. New Admin tab "Socials".
//
// Phase 1 ships the Twitter / X card with a FREE CSV paste-in (Daniel's
// choice over the $200/mo Basic API tier). The admin downloads the weekly
// Twitter Analytics export from analytics.twitter.com, pastes the CSV
// text in here; the card computes:
//   • Tweets in last 7d / 30d
//   • Total impressions / engagements / link clicks (7d + 30d)
//   • Engagement rate (eng / impressions)
//   • Best tweet by impressions (this month) — text + metrics + permalink
//   • Outbound link-click breakdown (tweets with URLs in the text)
//
// Storage: localStorage `noklock.socials.twitter.csv` + `…parsedAt`.
// Persists per-browser; nothing sent to a server. Re-paste any time to
// refresh.
//
// Extensible row: the same row holds future channel cards (Telegram,
// LinkedIn, Discord, YouTube) — those render as "Coming soon" tiles for
// now per Daniel's spec.

import { useMemo, useState, useEffect } from "react";
import { InfoTooltip } from "./InfoTooltip.js";

const LS_KEY  = "noklock.socials.twitter.csv";
const LS_DATE = "noklock.socials.twitter.parsedAt";

interface TweetRow {
  readonly id: string;
  readonly permalink: string;
  readonly date: string;   // ISO 8601 yyyy-mm-dd
  readonly text: string;
  readonly impressions: number;
  readonly engagements: number;
  readonly engagementRate: number; // 0..1
  readonly retweets: number;
  readonly replies: number;
  readonly likes: number;
  readonly urlClicks: number;
  readonly profileClicks: number;
}

interface Parsed {
  readonly rows: readonly TweetRow[];
  readonly errors: readonly string[];
}

// Minimal CSV parser — handles quoted cells with embedded commas + escaped
// double-quotes ("" → "). Sufficient for the Twitter Analytics export
// format (one header row + per-tweet rows). Not RFC 4180 strict.
function parseCsv(src: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = ""; let inQ = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { cell += c; }
    } else {
      if (c === '"') { inQ = true; }
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c === "\r") { /* skip */ }
      else { cell += c; }
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0]?.trim() !== ""));
}

// Twitter Analytics CSV columns (as of 2024-2025 exports): Tweet id,
// Tweet permalink, Tweet text, time, impressions, engagements,
// engagement rate, retweets, replies, likes, user profile clicks, url
// clicks, hashtag clicks, detail expands, permalink clicks, app opens,
// app installs, follows, email tweet, dial phone, media views, media
// engagements, promoted impressions, ... The column order has shifted
// historically — we look up by lowercase header name where possible.
function parseTwitterCsv(src: string): Parsed {
  const errors: string[] = [];
  const matrix = parseCsv(src);
  if (matrix.length === 0) return { rows: [], errors: ["Empty CSV."] };
  const header = (matrix[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = (name: string): number => header.findIndex((h) => h === name.toLowerCase());
  const idIdx       = col("Tweet id");
  const permIdx     = col("Tweet permalink");
  const textIdx     = col("Tweet text");
  const timeIdx     = col("time");
  const imprIdx     = col("impressions");
  const engIdx      = col("engagements");
  const erIdx       = col("engagement rate");
  const rtIdx       = col("retweets");
  const repIdx      = col("replies");
  const likeIdx     = col("likes");
  const urlIdx      = col("url clicks");
  const profIdx     = col("user profile clicks");
  if (idIdx < 0 || imprIdx < 0) {
    errors.push("CSV header doesn't look like a Twitter Analytics export — couldn't find 'Tweet id' + 'impressions' columns. Check the file.");
    return { rows: [], errors };
  }
  const rows: TweetRow[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const r = matrix[i] ?? [];
    if (!r[idIdx]) continue;
    const time = r[timeIdx] ?? "";
    const date = time.length >= 10 ? time.slice(0, 10) : "";
    const num = (idx: number): number => {
      if (idx < 0) return 0;
      const v = (r[idx] ?? "").trim();
      const n = parseFloat(v.replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    rows.push({
      id: (r[idIdx] ?? "").trim(),
      permalink: (r[permIdx] ?? "").trim(),
      date,
      text: (r[textIdx] ?? "").trim(),
      impressions: num(imprIdx),
      engagements: num(engIdx),
      engagementRate: num(erIdx),
      retweets: num(rtIdx),
      replies: num(repIdx),
      likes: num(likeIdx),
      urlClicks: num(urlIdx),
      profileClicks: num(profIdx),
    });
  }
  if (rows.length === 0) errors.push("No tweet rows parsed.");
  return { rows, errors };
}

function ymdUtc(d: Date): string { return d.toISOString().slice(0, 10); }
function daysAgo(n: number): string {
  const d = new Date(); d.setUTCDate(d.getUTCDate() - n);
  return ymdUtc(d);
}

interface Aggregate {
  readonly tweetCount: number;
  readonly impressions: number;
  readonly engagements: number;
  readonly urlClicks: number;
  readonly engagementRatePct: number;
}
function aggregate(rows: readonly TweetRow[], sinceYmd: string): Aggregate {
  const window = rows.filter((r) => r.date >= sinceYmd);
  const tweetCount = window.length;
  const impressions = window.reduce((s, r) => s + r.impressions, 0);
  const engagements = window.reduce((s, r) => s + r.engagements, 0);
  const urlClicks = window.reduce((s, r) => s + r.urlClicks, 0);
  const engagementRatePct = impressions > 0 ? (engagements / impressions) * 100 : 0;
  return { tweetCount, impressions, engagements, urlClicks, engagementRatePct };
}

export function AdminSocials(): JSX.Element {
  const [csv, setCsv] = useState<string>("");
  const [parsedAt, setParsedAt] = useState<string>("");

  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_KEY);
      const t = localStorage.getItem(LS_DATE);
      if (c) setCsv(c);
      if (t) setParsedAt(t);
    } catch { /* no storage */ }
  }, []);

  const { rows, errors } = useMemo(() => csv ? parseTwitterCsv(csv) : { rows: [], errors: [] }, [csv]);
  const last7  = useMemo(() => aggregate(rows, daysAgo(7)),  [rows]);
  const last30 = useMemo(() => aggregate(rows, daysAgo(30)), [rows]);
  const best30 = useMemo(() => {
    const window = rows.filter((r) => r.date >= daysAgo(30));
    return window.slice().sort((a, b) => b.impressions - a.impressions)[0];
  }, [rows]);
  const topByClicks30 = useMemo(() => {
    const window = rows.filter((r) => r.date >= daysAgo(30) && r.urlClicks > 0);
    return window.slice().sort((a, b) => b.urlClicks - a.urlClicks).slice(0, 5);
  }, [rows]);

  function saveCsv(): void {
    try {
      localStorage.setItem(LS_KEY, csv);
      const now = new Date().toISOString();
      localStorage.setItem(LS_DATE, now);
      setParsedAt(now);
    } catch { /* no storage */ }
  }
  function clearCsv(): void {
    setCsv(""); setParsedAt("");
    try { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_DATE); } catch { /* ignore */ }
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setCsv(String(reader.result ?? "")); };
    reader.readAsText(f);
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold font-display text-xl"><span className="grad">Socials</span></h2>
        <p className="text-text-muted text-sm mt-1">
          Per-channel social analytics. Phase 1 = Twitter / X via free CSV paste-in
          (no paid API integration). Telegram, LinkedIn, Discord, YouTube cards land in
          future rounds.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* TWITTER / X CARD */}
        <div className="card">
          <h3 className="font-bold font-display mb-1 flex items-center">
            X / Twitter
            <InfoTooltip hint="Free path: weekly CSV export from analytics.twitter.com → paste/upload here. Stored in this browser's localStorage only (nothing sent to a server). Re-paste any time to refresh. The paid X API Basic tier ($200/mo) could automate this — deferred until volumes justify the spend." />
          </h3>
          <p className="text-xs text-text-muted mb-3">
            {parsedAt
              ? `Last refreshed ${parsedAt.slice(0, 10)} (${rows.length} tweets parsed).`
              : "No data yet — export the CSV from analytics.twitter.com → Account home → Export data → By tweet, then paste below."}
          </p>

          {rows.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Tweets (7d)"      value={last7.tweetCount.toLocaleString()} />
                <Metric label="Tweets (30d)"     value={last30.tweetCount.toLocaleString()} />
                <Metric label="Impressions (7d)" value={last7.impressions.toLocaleString()} />
                <Metric label="Impressions (30d)" value={last30.impressions.toLocaleString()} />
                <Metric label="Engagements (7d)" value={last7.engagements.toLocaleString()} sub={`${last7.engagementRatePct.toFixed(2)}% rate`} />
                <Metric label="Engagements (30d)" value={last30.engagements.toLocaleString()} sub={`${last30.engagementRatePct.toFixed(2)}% rate`} />
                <Metric label="Link clicks (7d)"  value={last7.urlClicks.toLocaleString()} />
                <Metric label="Link clicks (30d)" value={last30.urlClicks.toLocaleString()} />
              </div>

              {best30 && (
                <div className="border-t border-bg-surface/60 pt-3">
                  <div className="text-[10px] uppercase tracking-wider text-accent-cyan font-bold mb-1">Best tweet · last 30d (by impressions)</div>
                  <p className="text-sm text-text-on-dark/90 mb-1">
                    {best30.text.length > 200 ? best30.text.slice(0, 200) + "…" : best30.text}
                  </p>
                  <p className="text-xs text-text-muted font-mono">
                    {best30.impressions.toLocaleString()} impr · {best30.engagements.toLocaleString()} eng · {best30.urlClicks.toLocaleString()} clicks
                    {best30.permalink && <> · <a href={best30.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">view ↗</a></>}
                  </p>
                </div>
              )}

              {topByClicks30.length > 0 && (
                <div className="border-t border-bg-surface/60 pt-3">
                  <div className="text-[10px] uppercase tracking-wider text-accent-cyan font-bold mb-1">Top link-driving tweets · last 30d</div>
                  <ul className="space-y-1.5">
                    {topByClicks30.map((t) => (
                      <li key={t.id} className="text-xs text-text-on-dark/85">
                        <span className="font-mono text-accent-cyan">{t.urlClicks.toLocaleString().padStart(4, " ")} clicks</span>{" "}
                        <span className="text-text-muted">·</span>{" "}
                        <span>{t.text.length > 120 ? t.text.slice(0, 120) + "…" : t.text}</span>
                        {t.permalink && <> <a href={t.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">↗</a></>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="text-xs text-rose-300 mt-2">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <details className="mt-4">
            <summary className="text-xs text-accent-cyan cursor-pointer font-mono">
              {rows.length > 0 ? "Re-paste CSV / upload new export" : "Paste / upload CSV"}
            </summary>
            <div className="mt-2 space-y-2">
              <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-xs text-text-muted" />
              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder="Paste the Twitter Analytics CSV content here…"
                rows={6}
                className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-xs font-mono"
              />
              <div className="flex gap-2">
                <button type="button" onClick={saveCsv} disabled={!csv.trim()} className="btn btn-primary text-xs disabled:opacity-50">Parse &amp; save</button>
                {csv && <button type="button" onClick={clearCsv} className="btn btn-secondary text-xs">Clear</button>}
              </div>
              <p className="text-[10px] text-text-muted">
                Stored in this browser only. Nothing sent to a server. Export from
                <a href="https://analytics.twitter.com/" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline ml-1">analytics.twitter.com</a>.
              </p>
            </div>
          </details>
        </div>

        {/* COMING-SOON TILES */}
        <ComingSoonCard channel="Telegram"  note="Channel subscribers + click-throughs on shared links." />
        <ComingSoonCard channel="LinkedIn"  note="Post impressions + engagement on company-page posts." />
        <ComingSoonCard channel="Discord"   note="Server member count + active members." />
        <ComingSoonCard channel="YouTube"   note="Subscribers + per-video views." />
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { readonly label: string; readonly value: string; readonly sub?: string }): JSX.Element {
  return (
    <div className="bg-bg-deepest border border-bg-surface/60 rounded p-2">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="text-lg font-bold font-display">{value}</div>
      {sub && <div className="text-[10px] text-text-muted">{sub}</div>}
    </div>
  );
}

function ComingSoonCard({ channel, note }: { readonly channel: string; readonly note: string }): JSX.Element {
  return (
    <div className="card border-bg-surface/60 bg-bg-deepest/40">
      <h3 className="font-bold font-display mb-1">{channel}</h3>
      <p className="text-xs text-text-muted mb-2">{note}</p>
      <span className="tier-badge bg-bg-surface text-text-muted text-[10px]">Coming soon</span>
    </div>
  );
}
