// @version 0.6.0 @date 2026-06-02
// 0.6.0 — Daniel 2026-06-02: TweetsTab gets sub-tabs. The existing Launch
//         playbook + Hashtag bank stay at the top (they're cross-cutting),
//         then a horizontal pill-tab strip routes between 6 categorised
//         tweet sets: Security / Inheritance / Reframe / New features /
//         Managed service / Launch. The 7th "Original" sub-tab keeps the
//         existing X reframe posts + Launch tweets surfaces intact so no
//         previously-shipped copy is lost. New categorised content lives
//         in outreachChannels.ts (TWEETS_BY_CATEGORY).
// 0.5.0 — Daniel: "why are x refreme tweets under tgm/li tab on marketing
//         page?". X reframe posts are X content — they belong with the
//         launch tweets, not under Telegram/LinkedIn. Moved
//         X_REFRAME_POSTS out of ChannelsTab and INTO TweetsTab as a
//         standalone card above the existing Launch tweets. ChannelsTab
//         now scopes to Telegram + LinkedIn only.
// 0.4.0 — Partners tab restructured: subtabs (Wallets/exchanges/ecosystem |
//         Telegram groups). The 2 self-serve builders MOVED OUT to the new
//         wallet-gated public /partners page (PartnersToolkit) — Partners tab
//         now shows a pointer banner + the two candidate pipelines. Targets
//         tab unified: X + Telegram in one list with channel filter (All / X /
//         Telegram). New Telegram-groups data file at data/telegramGroups.ts
//         (~40 curated prospects, every row marked "verify live").
// 0.3.0 — Partners tab gained TWO new tools at the top: <PartnerCardBuilder/>
//         (cobrand "Partner × NoKLock" PNG 1200×675 — partner logo upload,
//         tagline, live canvas preview, Download / Copy image) and
//         <ContestBuilder/> (Refer & Share: 4-knob form [share% / trigger /
//         prize / distribution] + per-partner Sample-campaign tab [card +
//         Telegram post + 30s pitch] + Partner-playbook tab [generated
//         markdown how-to-run-it doc]). Both reuse the existing referral
//         mechanic (no contract change); honour-system payout backed by
//         on-chain verifiability (PolygonScan address page).
// 0.2.0 — NEW "Telegram / LinkedIn" subtab (Daniel): group posts + DMs for
//         Telegram (with a prefilled t.me/share deep-link) and LinkedIn DMs
//         (copy-to-paste; LinkedIn has no prefilled-message URL).
// 0.1.0 — /marketing — owner+treasury-gated marketing cockpit (Daniel b/c).
//         Moved out of /admin into its own page with subtabs:
//   Tweets    — launch playbook + hashtag bank (incl. custom) + launch tweets
//   Reddit    — value-first answer templates (with the disclosure rules)
//   Channels  — Telegram group posts + Telegram DMs + LinkedIn DMs
//   Targets   — searchable 159-influencer list + per-target DM + public tweet
//   Partners  — wallet/exchange/DEX/ecosystem candidates + outreach + announced
//   Settings  — edit hashtags, add/edit socials (localStorage; no server)
// All copy is ONLINE here (not in docs). "Tweet ↗"/"Share to Telegram ↗" open
// the compose pre-filled; LinkedIn DMs are copy-to-paste.

import { useState } from "react";
import { OwnerOnly } from "../components/OwnerOnly.js";
import { SubTabBar } from "../components/SubTabBar.js";
import { LAUNCH_MESSAGES, LAUNCH_PLAYBOOK, HASHTAG_BANK } from "../lib/launchMessages.js";
import { INFLUENCERS } from "../data/influencers.js";
import { REDDIT_ANSWERS, REDDIT_RULES } from "../lib/redditAnswers.js";
import { PARTNER_CANDIDATES, PARTNER_TYPE_LABEL, PARTNER_OUTREACH, type PartnerType } from "../lib/partners.js";
import { dmTemplate, publicTweet } from "../lib/outreachTemplates.js";
import {
  TELEGRAM_GROUP_POSTS, TELEGRAM_DMS, LINKEDIN_DMS, TELEGRAM_GROUP_RULES,
  COMMUNITY_MANAGER_OUTREACH, COMMUNITY_OWNER_OFFER, X_REFRAME_POSTS,
  TWEETS_BY_CATEGORY, TWEET_CATEGORY_LABEL, TWEET_CATEGORY_BLURB,
  type ChannelTemplate, type TweetCategory,
} from "../lib/outreachChannels.js";
import {
  getCustomHashtags, addCustomHashtag, removeCustomHashtag,
  getSocials, setSocials, resetSocials, type Social,
} from "../lib/marketingSettings.js";
import { TG_GROUPS, TG_CATEGORY_LABEL, TG_APPROACH_LABEL, SIZE_LABEL, type TgCategory } from "../data/telegramGroups.js";

type Tab = "tweets" | "reddit" | "channels" | "targets" | "partners" | "settings";
const TABS: { id: Tab; label: string }[] = [
  { id: "tweets", label: "Tweets" },
  { id: "reddit", label: "Reddit" },
  { id: "channels", label: "Telegram / LinkedIn" },
  { id: "targets", label: "Targets" },
  { id: "partners", label: "Partners" },
  { id: "settings", label: "Settings" },
];

const tweetHref = (text: string): string => `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
const tgShareHref = (text: string): string =>
  `https://t.me/share/url?url=${encodeURIComponent("https://noklock.app")}&text=${encodeURIComponent(text)}`;

function CopyBtn({ text, label = "Copy", primary }: { readonly text: string; readonly label?: string; readonly primary?: boolean }): JSX.Element {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { try { void navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* blocked */ } }}
      className={`text-[11px] px-2 py-1 rounded hover:opacity-80 ${primary ? "bg-accent-cyan/20 text-accent-cyan font-semibold" : "bg-bg-surface text-text-on-dark/80"}`}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

export function Marketing(): JSX.Element {
  const [tab, setTab] = useState<Tab>("tweets");
  return (
    <OwnerOnly title="Marketing">
      <div className="space-y-4">
        <header>
          <h1 className="text-3xl font-bold font-display"><span className="grad">Marketing</span></h1>
          <p className="text-text-muted text-sm mt-1">Launch cockpit. "Tweet ↗" opens X pre-filled (you review + post). Premium X recommended for launch (better link reach).</p>
        </header>
        <div className="flex gap-1 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t.id ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-on-dark/70 hover:text-text-on-dark"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "tweets" && <TweetsTab />}
        {tab === "reddit" && <RedditTab />}
        {tab === "channels" && <ChannelsTab />}
        {tab === "targets" && <TargetsTab />}
        {tab === "partners" && <PartnersTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </OwnerOnly>
  );
}

// ── Tweets ───────────────────────────────────────────────────────────────
type TweetsSub = TweetCategory | "original";
const TWEETS_SUBS: { id: TweetsSub; label: string }[] = [
  { id: "security",         label: TWEET_CATEGORY_LABEL.security },
  { id: "inheritance",      label: TWEET_CATEGORY_LABEL.inheritance },
  { id: "reframe",          label: TWEET_CATEGORY_LABEL.reframe },
  { id: "new-features",     label: TWEET_CATEGORY_LABEL["new-features"] },
  { id: "managed-service",  label: TWEET_CATEGORY_LABEL["managed-service"] },
  { id: "community",        label: TWEET_CATEGORY_LABEL.community },
  { id: "launch",           label: TWEET_CATEGORY_LABEL.launch },
  { id: "original",         label: "Original" },
];

function TweetsTab(): JSX.Element {
  const custom = getCustomHashtags();
  const [sub, setSub] = useState<TweetsSub>("security");
  return (
    <div className="space-y-4">
      <details className="card">
        <summary className="font-bold font-display cursor-pointer">Launch playbook <span className="text-text-muted text-xs font-normal">(current X best-practice)</span></summary>
        <dl className="space-y-2 text-sm mt-3">
          {LAUNCH_PLAYBOOK.map((r) => (
            <div key={r.label} className="border-b border-bg-surface/40 pb-2">
              <dt className="font-bold text-accent-cyan text-xs uppercase tracking-wider">{r.label}</dt>
              <dd className="text-text-on-dark/85 text-xs mt-0.5">{r.body}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="card">
        <h3 className="font-bold font-display mb-1">Hashtag bank</h3>
        <p className="text-xs text-text-muted mb-3">Click to copy. Use 1–2 per tweet, lead niche, woven mid/end. Edit your custom set in Settings.</p>
        <div className="space-y-2">
          {HASHTAG_BANK.map((g) => (
            <div key={g.label}>
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">{g.label}</div>
              <div className="flex flex-wrap gap-1.5">{g.tags.map((t) => <CopyBtn key={t} text={t} label={t} />)}</div>
            </div>
          ))}
          {custom.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">Your custom</div>
              <div className="flex flex-wrap gap-1.5">{custom.map((t) => <CopyBtn key={t} text={t} label={t} />)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tab strip — categorised tweet sets */}
      <div className="flex gap-1 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
        {TWEETS_SUBS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSub(s.id)}
            className={
              "px-3 py-1.5 text-xs sm:text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (sub === s.id
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {s.label}
            {s.id !== "original" && (
              <span className="ml-1 text-[10px] text-text-muted/70">({TWEETS_BY_CATEGORY[s.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {sub === "original" ? (
        <OriginalTweetsPane />
      ) : (
        <CategoryTweetsPane category={sub} />
      )}
    </div>
  );
}

function CategoryTweetsPane({ category }: { readonly category: TweetCategory }): JSX.Element {
  const tweets = TWEETS_BY_CATEGORY[category];
  return (
    <div className="card border-accent-cyan/30">
      <h3 className="font-bold font-display mb-1">{TWEET_CATEGORY_LABEL[category]} <span className="text-text-muted text-xs font-normal">({tweets.length})</span></h3>
      <p className="text-xs text-text-muted mb-3">{TWEET_CATEGORY_BLURB[category]}</p>
      <div className="space-y-2">
        {tweets.map((t) => (
          <div key={t.id} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
            <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{t.angle}</div>
            <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{t.body}</p>
            {t.note && <div className="text-[11px] text-text-muted mt-1 italic">{t.note}</div>}
            <div className="flex gap-2 mt-2">
              <a href={tweetHref(t.body)} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Tweet ↗</a>
              <CopyBtn text={t.body} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OriginalTweetsPane(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="card border-accent-green/40">
        <h3 className="font-bold font-display mb-1">X reframe posts <span className="text-text-muted text-xs font-normal">({X_REFRAME_POSTS.length})</span></h3>
        <p className="text-xs text-text-muted mb-3">
          Original framing pass: <strong>protect your seed/secret first; inheritance is optional</strong>. Character-budgeted. The 4-part thread is paste-as-thread (separated by ———). Pair with the in-app reframe.
        </p>
        <div className="space-y-2">
          {X_REFRAME_POSTS.map((t) => (
            <div key={t.id} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{t.angle}</div>
              <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{t.body}</p>
              {t.note && <div className="text-[11px] text-text-muted mt-1 italic">{t.note}</div>}
              <div className="flex gap-2 mt-2">
                <a href={tweetHref(t.body)} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Tweet ↗</a>
                <CopyBtn text={t.body} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-1">Launch tweets <span className="text-text-muted text-xs font-normal">({LAUNCH_MESSAGES.length})</span></h3>
        <p className="text-xs text-text-muted mb-3">All truthful to real NoKLock properties. Vary the angle across launch week.</p>
        <div className="space-y-2">
          {LAUNCH_MESSAGES.map((m) => (
            <div key={m.id} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{m.angle}</div>
              <p className="text-sm text-text-on-dark whitespace-pre-line">{m.text}</p>
              <div className="text-xs text-accent-cyan mt-1">{m.hashtags.join(" ")}</div>
              <div className="text-[11px] text-text-muted mt-1 italic">{m.note}</div>
              <div className="flex gap-2 mt-2">
                <a href={tweetHref(`${m.text}\n\n${m.hashtags.join(" ")}`)} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Tweet ↗</a>
                <CopyBtn text={`${m.text}\n\n${m.hashtags.join(" ")}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reddit ───────────────────────────────────────────────────────────────
function RedditTab(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="card border-amber-500/40">
        <h3 className="font-bold font-display mb-2">Rules — read before posting</h3>
        <ul className="space-y-1 text-sm text-text-on-dark/85 list-disc list-inside">
          {REDDIT_RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>
      {REDDIT_ANSWERS.map((a) => (
        <div key={a.id} className="card">
          <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">For: {a.forThread}</div>
          <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{a.body}</p>
          <div className="mt-2"><CopyBtn text={a.body} label="Copy answer" primary /></div>
        </div>
      ))}
    </div>
  );
}

// ── Channels (Telegram / LinkedIn) ─────────────────────────────────────────
function TemplateCard({ t, share }: { readonly t: ChannelTemplate; readonly share?: boolean }): JSX.Element {
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{t.angle}</div>
      <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{t.body}</p>
      {t.note && <div className="text-[11px] text-text-muted mt-1 italic">{t.note}</div>}
      <div className="flex gap-2 mt-2">
        {share && (
          <a href={tgShareHref(t.body)} target="_blank" rel="noopener noreferrer"
            className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Share to Telegram ↗</a>
        )}
        <CopyBtn text={t.body} primary={!share} />
      </div>
    </div>
  );
}

type ChannelsSub = "telegram" | "linkedin" | "community-owners";
const CHANNELS_SUBS: { id: ChannelsSub; label: string }[] = [
  { id: "telegram",          label: "Telegram" },
  { id: "linkedin",          label: "LinkedIn" },
  { id: "community-owners",  label: "Community owners" },
];

function ChannelsTab(): JSX.Element {
  const [sub, setSub] = useState<ChannelsSub>("telegram");
  return (
    <div className="space-y-4">
      <SubTabBar items={CHANNELS_SUBS} active={sub} onPick={(id) => setSub(id as ChannelsSub)} />

      {sub === "telegram" && (
        <div className="space-y-4">
          <div className="card border-amber-500/40">
            <h3 className="font-bold font-display mb-2">Telegram etiquette — read before posting</h3>
            <ul className="space-y-1 text-sm text-text-on-dark/85 list-disc list-inside">
              {TELEGRAM_GROUP_RULES.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-bold font-display mb-1">Telegram — group posts</h3>
            <p className="text-xs text-text-muted mb-3">Value-first drops for relevant groups. "Share to Telegram ↗" opens Telegram with the text prefilled — you pick the chat and review before sending. The first two are <strong>reframe-launch</strong> additions (protect first, inherit optionally); the rest are the original library.</p>
            <div className="space-y-2">{TELEGRAM_GROUP_POSTS.map((t) => <TemplateCard key={t.id} t={t} share />)}</div>
          </div>

          <div className="card">
            <h3 className="font-bold font-display mb-1">Telegram — direct messages</h3>
            <p className="text-xs text-text-muted mb-3">1:1 outreach. Ask a group admin before posting in their group; replace {"{name}"} where shown.</p>
            <div className="space-y-2">{TELEGRAM_DMS.map((t) => <TemplateCard key={t.id} t={t} share />)}</div>
          </div>
        </div>
      )}

      {sub === "linkedin" && (
        <div className="card">
          <h3 className="font-bold font-display mb-1">LinkedIn — direct messages</h3>
          <p className="text-xs text-text-muted mb-3">Professional estate / fintech framing. LinkedIn has no prefilled-message link, so these are copy-to-paste. Replace {"{name}"} / {"{field}"}. The first two entries are <strong>reframe-launch</strong> additions; the rest are the original library.</p>
          <div className="space-y-2">{LINKEDIN_DMS.map((t) => <TemplateCard key={t.id} t={t} />)}</div>
        </div>
      )}

      {sub === "community-owners" && (
        <div className="space-y-4">
          <div className="card border-accent-green/40">
            <h3 className="font-bold font-display mb-1">Community owners — the product-as-payment offer</h3>
            <p className="text-xs text-text-muted mb-3">
              Short, cash-only outreach for operators who've heard a million pitches. The deal: <strong>Premium FREE on joining</strong> through their referral link (unlocks the whole Partner Toolkit), upgrading to <strong>Premium Lifetime at 10 signups</strong>. No upfront, no catch — the product is the payment. Replace {"{name}"} / {"{community}"} / {"{link}"}.
            </p>
            <div className="space-y-2">{COMMUNITY_OWNER_OFFER.map((t) => <TemplateCard key={t.id} t={t} share />)}</div>
          </div>

          <div className="card border-accent-cyan/40">
            <h3 className="font-bold font-display mb-1">Community managers / group owners — the partner-toolkit pitch</h3>
            <p className="text-xs text-text-muted mb-3">
              The 10%-USDC referral version. Every template spells out the <strong>extent of the offer</strong> (10% off / 10% USDC earned / contest pool / honour-system payout) AND the <strong>planning tool</strong> (cobrand card builder + contest builder + per-partner playbook) and points at <code className="text-accent-cyan">noklock.app/partners</code>. Replace {"{name}"} / {"{community}"} / pool knobs.
            </p>
            <div className="space-y-2">{COMMUNITY_MANAGER_OUTREACH.map((t) => <TemplateCard key={t.id} t={t} share />)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Targets ──────────────────────────────────────────────────────────────
type Channel = "all" | "twitter" | "telegram";
function TargetsTab(): JSX.Element {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<Channel>("all");
  const [twitterCat, setTwitterCat] = useState("all");
  const [tgCat, setTgCat] = useState<TgCategory | "all">("all");
  const ql = q.trim().toLowerCase();

  const twitterCats = Array.from(new Set(INFLUENCERS.map((i) => i.category)));
  const tgCats      = Array.from(new Set(TG_GROUPS.map((g) => g.category)));

  const xRows = channel === "telegram" ? [] : INFLUENCERS.filter((i) =>
    (twitterCat === "all" || i.category === twitterCat) &&
    (!ql || `${i.handle} ${i.name} ${i.relevance}`.toLowerCase().includes(ql)),
  );
  const tgRows = channel === "twitter" ? [] : TG_GROUPS.filter((g) =>
    (tgCat === "all" || g.category === tgCat) &&
    (!ql || `${g.name} ${g.why} ${g.url} ${g.language}`.toLowerCase().includes(ql)),
  );
  const total = xRows.length + tgRows.length;

  return (
    <div className="card">
      <h3 className="font-bold font-display mb-1">Outreach targets <span className="text-text-muted text-sm font-normal">(X {INFLUENCERS.length} · Telegram {TG_GROUPS.length})</span></h3>
      <p className="text-xs text-text-muted mb-3">Twitter and Telegram targets in one place. Verify every handle / size live before contact. Per target: open the profile, copy a tailored DM, fire a public mention tweet, or use the Telegram-pipeline rules in the <strong>Channels</strong> tab.</p>

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / handle / relevance / language…" className="flex-1 min-w-[12rem] bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm" />
        <div className="flex gap-1">
          {(["all", "twitter", "telegram"] as const).map((c) => (
            <button key={c} type="button" onClick={() => setChannel(c)}
              className={`px-3 py-1.5 rounded text-sm border ${channel === c ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}>
              {c === "all" ? "All channels" : c === "twitter" ? "X / Twitter" : "Telegram"}
            </button>
          ))}
        </div>
        {channel !== "telegram" && (
          <select value={twitterCat} onChange={(e) => setTwitterCat(e.target.value)} className="bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm text-text-on-dark">
            <option value="all">All X categories</option>
            {twitterCats.map((c) => <option key={c} value={c}>X · {c}</option>)}
          </select>
        )}
        {channel !== "twitter" && (
          <select value={tgCat} onChange={(e) => setTgCat(e.target.value as TgCategory | "all")} className="bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm text-text-on-dark">
            <option value="all">All TG categories</option>
            {tgCats.map((c) => <option key={c} value={c}>TG · {TG_CATEGORY_LABEL[c]}</option>)}
          </select>
        )}
      </div>

      <div className="text-[11px] text-text-muted mb-1">{total} shown</div>

      <div className="max-h-[65vh] overflow-y-auto divide-y divide-bg-surface/40">
        {xRows.map((i) => (
          <div key={`x-${i.handle}`} className="py-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">X</span>
              <a href={`https://x.com/${i.handle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm">{i.handle}</a>
              <span className="text-text-muted text-xs">· {i.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{i.category}</span>
              <span className="text-[10px] text-text-muted">{i.tier}</span>
            </div>
            <div className="text-[11px] text-text-muted leading-tight mt-0.5">{i.relevance}</div>
            <div className="flex gap-2 mt-1.5">
              <CopyBtn text={dmTemplate(i.category, i.handle)} label="Copy DM" primary />
              <a href={tweetHref(publicTweet(i.category, i.handle))} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan hover:opacity-80">Public tweet ↗</a>
              <CopyBtn text={publicTweet(i.category, i.handle)} label="Copy public" />
            </div>
          </div>
        ))}
        {tgRows.map((g) => (
          <div key={`tg-${g.slug}`} className="py-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">TG</span>
              <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm font-semibold">{g.name}</a>
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{TG_CATEGORY_LABEL[g.category]}</span>
              <span className="text-[10px] text-text-muted">{SIZE_LABEL[g.size]} · {g.language}</span>
            </div>
            <div className="text-[11px] text-text-muted leading-tight mt-0.5">{g.why}</div>
            <div className="text-[11px] text-accent-teal mt-0.5">Approach: <span className="text-text-on-dark/80">{TG_APPROACH_LABEL[g.approach]}</span></div>
            <div className="text-[10px] text-amber-300/70 italic mt-0.5">⚠ Verify handle + size + posting rules live before contact.</div>
          </div>
        ))}
        {total === 0 && <div className="py-4 text-sm text-text-muted text-center"><em>No targets match your filters.</em></div>}
      </div>
    </div>
  );
}

// ── Partners ─────────────────────────────────────────────────────────────
type PartnersSub = "companies" | "telegram-groups";
const PARTNERS_SUBS: { id: PartnersSub; label: string }[] = [
  { id: "companies",        label: "Wallets / exchanges / ecosystem" },
  { id: "telegram-groups",  label: "Telegram groups" },
];

function PartnersTab(): JSX.Element {
  const [sub, setSub] = useState<PartnersSub>("companies");
  return (
    <div className="space-y-4">
      {/* Pointer to the self-serve toolkit — admin can preview. */}
      <div className="card border-accent-cyan/30 bg-accent-cyan/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold font-display mb-0.5">Self-serve partner toolkit</h3>
            <p className="text-xs text-text-muted">Cobrand card builder (open to all) + Refer &amp; Share contest builder + partner playbook now live at <code className="text-accent-cyan">/refer?tab=community-owners</code>. Gated to <strong>Premium-tier holders OR selected-partner invitation</strong> (manage the invite list in the <em>Site toggles</em> tab below).</p>
          </div>
          <a href="/refer?tab=community-owners" target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-sm">Open Community Owners ↗</a>
        </div>
      </div>

      <div className="flex gap-1 border-b border-bg-surface overflow-x-auto">
        {PARTNERS_SUBS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSub(s.id)}
            className={
              "px-4 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (sub === s.id
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {sub === "companies"       && <CompaniesPipeline />}
      {sub === "telegram-groups" && <TelegramPipeline />}
    </div>
  );
}

function CompaniesPipeline(): JSX.Element {
  const types = Object.keys(PARTNER_TYPE_LABEL) as PartnerType[];
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold font-display mb-1">Announced partners</h3>
        <p className="text-sm text-text-muted">None yet. When a partnership is real, it lands here (and this becomes the public "our partners" surface). Until then, work the candidate pipeline below.</p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-2">Candidate pipeline</h3>
        {types.map((ty) => {
          const items = PARTNER_CANDIDATES.filter((p) => p.type === ty);
          if (items.length === 0) return null;
          return (
            <div key={ty} className="mb-3">
              <div className="text-[11px] uppercase tracking-wider text-accent-cyan mb-1">{PARTNER_TYPE_LABEL[ty]}</div>
              <div className="space-y-1.5">
                {items.map((p) => (
                  <div key={p.name} className="flex items-start justify-between gap-2 border-b border-bg-surface/30 pb-1.5">
                    <div className="flex-1 min-w-0">
                      <span className="text-text-on-dark text-sm font-semibold">{p.name}</span>
                      {p.handle && <a href={`https://x.com/${p.handle}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan text-xs ml-2">@{p.handle} ↗</a>}
                      <div className="text-[11px] text-text-muted leading-tight">{p.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-2">Reach-out templates</h3>
        <div className="space-y-2">
          {PARTNER_OUTREACH.map((o) => (
            <div key={o.label} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-accent-teal mb-1">{o.label}</div>
              <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{o.body}</p>
              <div className="mt-2"><CopyBtn text={o.body} label="Copy" primary /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TelegramPipeline(): JSX.Element {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<TgCategory | "all">("all");
  const ql = q.trim().toLowerCase();
  const cats = Array.from(new Set(TG_GROUPS.map((g) => g.category)));
  const rows = TG_GROUPS.filter((g) =>
    (cat === "all" || g.category === cat) &&
    (!ql || `${g.name} ${g.why} ${g.url} ${g.language}`.toLowerCase().includes(ql)),
  );
  return (
    <div className="space-y-4">
      <div className="card border-amber-500/40">
        <h3 className="font-bold font-display mb-2">Telegram-pipeline ground rules</h3>
        <ul className="space-y-1 text-sm text-text-on-dark/85 list-disc list-inside">
          <li><strong>Verify every handle + size LIVE</strong> before contact. The list is a curated starting point, not a contact database; group handles get renamed and sizes shift weekly.</li>
          <li><strong>Read the group rules + last 100 messages</strong> before any post. Some groups ban promotion outright; others welcome an AMA. The "Approach" hint suggests what's most likely to land — verify it locally.</li>
          <li><strong>Admin DM first when in doubt.</strong> Templates live in the <strong>Channels</strong> tab (Telegram → DMs). Disclosure is mandatory: "I work on NoKLock" or you're spamming.</li>
          <li><strong>One post per group, ever.</strong> Repeats are spam. Drip across groups by date, not within a group.</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-1">Telegram-groups candidate pipeline <span className="text-text-muted text-sm font-normal">({TG_GROUPS.length})</span></h3>
        <p className="text-xs text-text-muted mb-3">
          Curated, not live-verified — see <code>data/telegramGroups.ts</code> for the source of truth and to extend the list. Sizes are rough ranges (S / M / L / XL); verify before chasing.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / why / language / URL…"
            className="flex-1 min-w-[12rem] bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as TgCategory | "all")}
            className="bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm text-text-on-dark"
          >
            <option value="all">All categories</option>
            {cats.map((c) => <option key={c} value={c}>{TG_CATEGORY_LABEL[c]}</option>)}
          </select>
        </div>
        <div className="text-[11px] text-text-muted mb-1">{rows.length} shown</div>
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-bg-surface/40">
          {rows.map((g) => (
            <div key={g.slug} className="py-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm font-semibold">{g.name}</a>
                <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{TG_CATEGORY_LABEL[g.category]}</span>
                <span className="text-[10px] text-text-muted">{SIZE_LABEL[g.size]} · {g.language}</span>
              </div>
              <div className="text-[11px] text-text-muted leading-tight mt-0.5">{g.why}</div>
              <div className="text-[11px] text-accent-teal mt-0.5">Approach: <span className="text-text-on-dark/80">{TG_APPROACH_LABEL[g.approach]}</span></div>
              <div className="text-[10px] text-amber-300/70 mt-0.5 italic">⚠ Verify handle + size + posting rules live before contact.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────
function SettingsTab(): JSX.Element {
  const [tags, setTags] = useState<string[]>(() => getCustomHashtags());
  const [newTag, setNewTag] = useState("");
  const [socials, setS] = useState<Social[]>(() => getSocials());
  const [savedAt, setSavedAt] = useState(0);

  function persistSocials(next: Social[]): void { setS(next); setSocials(next); setSavedAt(Date.now()); }
  function editSocial(i: number, field: keyof Social, v: string): void {
    persistSocials(socials.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)));
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold font-display mb-1">Custom hashtags</h3>
        <p className="text-xs text-text-muted mb-3">Added on top of the built-in bank (shown under "Your custom" on the Tweets tab). Stored only in this browser.</p>
        <div className="flex gap-2 mb-3">
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="#yourTag" className="flex-1 bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm" />
          <button onClick={() => { setTags(addCustomHashtag(newTag)); setNewTag(""); }} className="btn btn-secondary text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? <span className="text-xs text-text-muted">No custom hashtags yet.</span> : tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded border border-bg-surface bg-bg-deepest text-accent-cyan inline-flex items-center gap-1">
              {t}<button onClick={() => setTags(removeCustomHashtag(t))} className="text-text-muted hover:text-danger" aria-label={`remove ${t}`}>✕</button>
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-1">Socials / accounts</h3>
        <p className="text-xs text-text-muted mb-3">Edit inline (saves as you type). Stored only in this browser. {savedAt && Date.now() - savedAt < 3000 ? <span className="text-accent-teal">Saved ✓</span> : null}</p>
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center">
              <input value={s.label} onChange={(e) => editSocial(i, "label", e.target.value)} placeholder="Label" className="bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-sm" />
              <input value={s.handle} onChange={(e) => editSocial(i, "handle", e.target.value)} placeholder="@handle" className="bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-sm" />
              <input value={s.url} onChange={(e) => editSocial(i, "url", e.target.value)} placeholder="https://…" className="bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-sm font-mono" />
              <button onClick={() => persistSocials(socials.filter((_, idx) => idx !== i))} className="text-xs text-text-muted hover:text-danger px-2">Remove</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => persistSocials([...socials, { label: "", handle: "", url: "" }])} className="btn btn-secondary text-sm">+ Add social</button>
          <button onClick={() => setS(resetSocials())} className="text-xs text-text-muted hover:underline">Reset to defaults</button>
        </div>
      </div>
    </div>
  );
}
