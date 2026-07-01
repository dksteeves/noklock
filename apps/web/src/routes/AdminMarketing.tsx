// @version 0.3.0 @date 2026-05-22
// 0.3.0 — + In-app full influencer list (Daniel): searchable + category-
//         filtered, all 159 from data/influencers.ts, each with an X-profile
//         link and a one-click "Tweet ↗" (opens X compose pre-filled with the
//         @mention). Bundled (not a public file).
// 0.2.0 — + Hashtag bank (click-to-copy tags, grouped niche/ecosystem/broad,
//         1–2-per-tweet guidance) for swapping tags on tweets (Daniel).
// @version 0.1.0 @date 2026-05-22
// Admin → Marketing tab (Daniel 2026-05-22). A launch cockpit:
//   • Accounts (X @noklock_app, Reddit).
//   • Launch playbook (research-backed X best-practice rules).
//   • Launch-message store — each tweet has "Tweet this ↗" (opens X compose
//     pre-filled; you review + post — no API needed, no cost) + Copy.
//   • Priority influencer targets (top of the vetted ~110-account CSV in
//     docs/crypto-influencers.csv) as click-through X links.
// True automated/scheduled posting via the X API is a separate decision
// (needs an X dev app + a paid tier); the intent-link flow keeps you in
// control with review-before-post, which is the right default for a launch.

import { useState } from "react";
import { LAUNCH_MESSAGES, LAUNCH_PLAYBOOK, HASHTAG_BANK, type LaunchMessage } from "../lib/launchMessages.js";
import { INFLUENCERS } from "../data/influencers.js";

// Highest-priority outreach targets (from docs/crypto-influencers.csv) — the
// inheritance-niche + self-custody voices most likely to care.
const PRIORITY_TARGETS: readonly { handle: string; why: string }[] = [
  { handle: "pamelawjd", why: "Crypto-inheritance attorney / author" },
  { handle: "TheBTCAdviser", why: "Bitcoin estate-planning + custody" },
  { handle: "nunchuk_io", why: "On-chain timelock inheritance" },
  { handle: "CasaHODL", why: "Self-custody vaults + inheritance" },
  { handle: "aantonop", why: "Co-author, crypto inheritance book" },
  { handle: "lopp", why: "Canonical self-custody voice" },
  { handle: "btcsessions", why: "Self-custody / family-setup how-tos" },
  { handle: "matt_odell", why: "Self-custody + custody trade-offs" },
  { handle: "AnitaPosch", why: "Accessible self-custody educator" },
  { handle: "laurashin", why: "Journalist; covers inheritance directly" },
  { handle: "0xPolygon", why: "Our chain — ecosystem amplification" },
  { handle: "sandeepnailwal", why: "Polygon co-founder" },
];

function tweetIntent(m: LaunchMessage): string {
  const body = `${m.text}\n\n${m.hashtags.join(" ")}`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(body)}`;
}

function CopyBtn({ text }: { readonly text: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { try { void navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* blocked */ } }}
      className="text-[11px] px-2 py-1 rounded bg-bg-surface text-text-on-dark/80 hover:opacity-80"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

// A hashtag chip that copies itself on click (for swapping tags on a tweet).
function TagChip({ tag }: { readonly tag: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { try { void navigator.clipboard?.writeText(tag); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* blocked */ } }}
      title="Copy this hashtag"
      className="text-[11px] px-2 py-0.5 rounded border border-bg-surface bg-bg-deepest text-accent-cyan hover:border-accent-cyan"
    >
      {copied ? "copied ✓" : tag}
    </button>
  );
}

// Full searchable/filterable outreach list (from data/influencers.ts). Each
// row links to the X profile + a one-click "Tweet ↗" that opens X compose
// pre-filled with the @mention to start a reply/mention tweet.
function InfluencerList(): JSX.Element {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const categories = Array.from(new Set(INFLUENCERS.map((i) => i.category)));
  const ql = q.trim().toLowerCase();
  const rows = INFLUENCERS.filter(
    (i) => (cat === "all" || i.category === cat) &&
      (!ql || `${i.handle} ${i.name} ${i.relevance}`.toLowerCase().includes(ql)),
  );
  return (
    <div className="card">
      <h3 className="font-bold font-display mb-1">All outreach targets <span className="text-text-muted text-sm font-normal">({INFLUENCERS.length})</span></h3>
      <p className="text-xs text-text-muted mb-3">Vetted list — verify a handle before reaching out (they change). Click a handle to open the profile, or "Tweet ↗" to start a mention.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / handle / relevance…"
          className="flex-1 min-w-[12rem] bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm text-text-on-dark">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="text-[11px] text-text-muted mb-1">{rows.length} shown</div>
      <div className="max-h-[60vh] overflow-y-auto divide-y divide-bg-surface/40">
        {rows.map((i) => (
          <div key={i.handle} className="flex items-start justify-between gap-2 py-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a href={`https://x.com/${i.handle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm">{i.handle}</a>
                <span className="text-text-muted text-xs">· {i.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{i.category}</span>
                <span className="text-[10px] text-text-muted">{i.tier}</span>
              </div>
              <div className="text-[11px] text-text-muted leading-tight">{i.relevance}</div>
            </div>
            <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`${i.handle} `)}`} target="_blank" rel="noopener noreferrer"
              className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan shrink-0 hover:opacity-80">Tweet ↗</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminMarketing(): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold font-display"><span className="grad">Marketing</span></h2>
        <p className="text-text-muted text-sm">Launch cockpit. "Tweet this" opens X with the post pre-filled — you review and hit Post (no API, no cost). Keep links out of the tweet body; put them in the first reply.</p>
      </div>

      {/* Accounts */}
      <div className="card">
        <h3 className="font-bold font-display mb-2">Accounts</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="https://x.com/noklock_app" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">X · @noklock_app ↗</a>
          <a href="https://www.reddit.com/user/Spirited_Future_4682/" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">Reddit · u/Spirited_Future_4682 ↗</a>
        </div>
      </div>

      {/* Playbook */}
      <div className="card">
        <h3 className="font-bold font-display mb-2">Launch playbook <span className="text-text-muted text-xs font-normal">(current X best-practice)</span></h3>
        <dl className="space-y-2 text-sm">
          {LAUNCH_PLAYBOOK.map((r) => (
            <div key={r.label} className="border-b border-bg-surface/40 pb-2">
              <dt className="font-bold text-accent-cyan text-xs uppercase tracking-wider">{r.label}</dt>
              <dd className="text-text-on-dark/85 text-xs mt-0.5">{r.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Hashtag bank — click any tag to copy it for swapping on a tweet. */}
      <div className="card">
        <h3 className="font-bold font-display mb-1">Hashtag bank</h3>
        <p className="text-xs text-text-muted mb-3">Click any tag to copy it. Use <strong>1–2 per tweet</strong> — lead with a niche tag, add at most one broad tag, woven mid/end (never start a tweet with a hashtag).</p>
        <div className="space-y-2">
          {HASHTAG_BANK.map((g) => (
            <div key={g.label}>
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">{g.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.tags.map((t) => <TagChip key={t} tag={t} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch message store */}
      <div className="card">
        <h3 className="font-bold font-display mb-1">Launch tweets <span className="text-text-muted text-xs font-normal">({LAUNCH_MESSAGES.length})</span></h3>
        <p className="text-xs text-text-muted mb-3">All truthful to real NoKLock properties. 1–2 hashtags each. Vary the angle across launch week (see the sequence in the playbook).</p>
        <div className="space-y-2">
          {LAUNCH_MESSAGES.map((m) => (
            <div key={m.id} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{m.angle}</div>
              <p className="text-sm text-text-on-dark whitespace-pre-line">{m.text}</p>
              <div className="text-xs text-accent-cyan mt-1">{m.hashtags.join(" ")}</div>
              <div className="text-[11px] text-text-muted mt-1 italic">{m.note}</div>
              <div className="flex gap-2 mt-2">
                <a href={tweetIntent(m)} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Tweet this ↗</a>
                <CopyBtn text={`${m.text}\n\n${m.hashtags.join(" ")}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Influencer outreach */}
      <div className="card">
        <h3 className="font-bold font-display mb-1">Priority outreach targets</h3>
        <p className="text-xs text-text-muted mb-3">Highest-relevance accounts first (inheritance niche → self-custody → Polygon). The full searchable list of all {INFLUENCERS.length} is below. Verify handles before outreach — they change.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRIORITY_TARGETS.map((t) => (
            <a key={t.handle} href={`https://x.com/${t.handle}`} target="_blank" rel="noopener noreferrer"
              className="rounded border border-bg-surface bg-bg-deepest/40 p-2 hover:border-accent-cyan">
              <div className="text-sm text-accent-cyan">@{t.handle} ↗</div>
              <div className="text-[11px] text-text-muted">{t.why}</div>
            </a>
          ))}
        </div>
      </div>

      <InfluencerList />
    </div>
  );
}
