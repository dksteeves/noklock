// @version 0.9.0 @date 2026-06-11
// 0.9.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.4):
//         reconnecting + !isConnected branches collapse into ONE
//         `gate.status !== "connected"` block using <WalletGateCard/>
//         (connect buttons always live). Public Leaderboard + bonus banner
//         stay visible. Dropped the now-unused useAccount/isConnected read.
// @version 0.8.0 @date 2026-06-08
// 0.8.0 — Managed-mode referral codes. When useWalletGate reports
//         kind === 'managed', the connected user's link is now
//         `${SITE}/?ref=NK-MGMT-XXXX` (their Form-B-issued 12-char code)
//         instead of `${SITE}/?ref=${address}`. Code is fetched from the
//         NEW Form-B endpoint GET /v1/managed-referrals/me via the thin
//         useManagedReferralCode hook (Agent 3 endpoint). Graceful
//         fallback: if the endpoint returns 404 / is unreachable, we fall
//         back to the self-custody address link (strawman §9.4: combined
//         leaderboard, so the displayed link is the only managed-specific
//         render — everything else here is path-agnostic).
// 0.7.0 — Migrate off useWalletSettling shim onto useWalletGate directly.
//         EarnReferralsPanel now branches on gate.status (tri-state:
//         connected | reconnecting | disconnected) instead of a single
//         reconnecting boolean + full WalletReconnecting subtree replace.
//         During the reconnecting window we still render the public
//         Leaderboard + FounderReferrerBonusBanner (they're on-chain data
//         that must NEVER be trapped behind the connect/reconnect gate)
//         plus an inline aria-busy "Reconnecting your wallet…" card —
//         the user keeps the page they navigated to. WalletReconnecting
//         import dropped (no longer referenced).
// 0.6.0 — Daniel: Community Owners reorg (page was "heavy and unclear").
//         Folded the toolkit intro + honour-system blurb into ONE tight card
//         that hosts the NEW <CommunityOwnersFlow/> visual 5-step process
//         diagram; demoted the two tool sections (Cobrand card / Refer &
//         Share contest builder) to compact subheads beneath. One scroll,
//         immediate visual story, two clearly-labelled tools.
// 0.5.0 — Daniel: leaderboard hoisted to the TOP of Earn referrals (above
//         FounderReferrerBonusBanner) in BOTH connected + not-connected
//         branches; rewritten as a collapsible <details> default-closed
//         with rank-medal styling (gold/silver/bronze borders + gradient
//         numerals for the podium). Removed the duplicate inner "Refer &
//         earn" <h1> instances inside EarnReferralsPanel — the parent
//         <Refer> header already prints it once.
// 0.4.0 — Daniel: the partner / community-owner toolkit is a SUBSET of refer
//         & earn, not a separate page. Restructured /refer into subtabs:
//           * "Earn referrals"   — the existing 0.3.x content as-is.
//           * "Community Owners" — the partner toolkit (PartnerCardBuilder
//             visible to ALL connected-or-not; ContestBuilder + playbook
//             gated by Premium-tier OR selected-partner-invitation via the
//             new <PartnerAccessGate/> 0.2.0).
//         Old standalone /partners and /telegram-partners routes redirect to
//         /refer?tab=community-owners. Fallback `sharePct` default changed
//         15→10 to match the deployed contract (referrerShareBps=1000) —
//         the live read shows 10 anyway, this only affected the offline
//         fallback display.
// 0.3.0 — Daniel-asked 2026-05-20: Founder-Referrer Bonus banner at the
//         top (above the wallet header on the connected view, above the
//         connect card on the not-connected view). 3 milestones (100/500/
//         1000 paid referrals → 25%/50%/75% bonus on hard earnings to
//         date), tranched-exclusive for same-wallet multi-milestone
//         winners. Admin-paid (not contract-enforced) — the trust anchor
//         is the on-chain referralCount + the public PolygonScan payout
//         tx + our explicit reputation pledge. Banner links to full
//         rules at /info?tab=referrals#founder-referrer-bonus.
// 0.2.8 — Connected view reordered: the "How your link is remembered"
//         box now sits ABOVE the leaderboard (Daniel) — link → status →
//         how-it-works → leaderboard last.
// 0.2.7 — Reconnect guard → shared useWalletSettling grace window (no
//         false "connect" flash on a fast SW-served load).
// 0.2.6 — Not-connected card states clearly: no purchase / no signup to
//         refer, link is just your wallet address (link itself stays
//         blank until connected — already gated to the connected branch).
// 0.2.5 — Leaderboard now ALSO renders on the not-connected screen — it
//         is PUBLIC on-chain data and was trapped behind the wallet-
//         connect gate (the real reason it "was never seen"). Reverted
//         the useReconnectGate experiment back to the simple status
//         guard (Daniel: back it out — it didn't fix the loop).
// 0.2.4 — Leaderboard endpoint-down now shows an honest "temporarily
//         unavailable (needs archive RPC)" card instead of vanishing,
//         so the section is always visible. Root cause is the pruned
//         RPC server-side — a code display fix, not a data fix.
// 0.2.3 — reconnect guard → shared useReconnectGate (initial-grace
//         window): /refer no longer flashes the connect prompt while
//         wagmi restores the session. Was the reason the page told a
//         connected user to connect (and the leaderboard never showed).
// 0.2.2 — Leaderboard now renders even with zero referrers (empty-state
//         "be the first" attractor) instead of hiding the whole section
//         — visible for testing + as social-proof scaffolding. Only a
//         genuine endpoint outage still omits it. (Daniel.)
// 0.2.1 — wallet-reconnect guard before the connect prompt (was telling
//         you to connect during the persisted-session restore window).
// 0.2.0 — WS-I: public leaderboard (top referrers) — read from Form B
//         /v1/referral/leaderboard, which indexes the on-chain
//         ReferralAttributed logs. Public on-chain data only; addresses
//         shown truncated. Hidden gracefully if the endpoint is down.
// 0.1.2 — No-cookie/no-tracking link mechanics note + fine-print pointer
//         (audited contract is the sole arbiter; off-chain link is
//         best-effort; no off-chain record so no dispute adjudication).
// 0.1.1 — Link to the full rules / how-it-works (Info → Referral tab).
// /refer — the connected wallet's referral dashboard.
//
// Reward model (Hybrid tiered, all on-chain): refer someone with your link;
// when they buy a paid licence they get a discount and you earn a share.
// Below the affiliate threshold your share accrues as redeemable CREDIT
// (auto-applied against your own next licence purchase — non-cash). Once
// you cross the threshold you're an affiliate and your share is paid to you
// INSTANTLY in USDC on every future referral (no claim step — it just
// arrives). All state is read straight from the License contract.

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useReadContract } from "wagmi";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { useManagedReferralCode } from "../hooks/useManagedReferralCode.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { SubTabBar } from "../components/SubTabBar.js";
import { PartnerCardBuilder } from "../components/PartnerCardBuilder.js";
import { ContestBuilder } from "../components/ContestBuilder.js";
import { PartnerAccessGate } from "../components/PartnerAccessGate.js";
import { CommunityOwnersFlow } from "../components/CommunityOwnersFlow.js";
import { trackCommunityOwnersLandingOncePerDay } from "../lib/track.js";
import { LICENSE_ADDR, licenseAbi } from "../lib/contracts.js";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";

const SITE = "https://noklock.app";
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

// 0.3.0 — Founder-Referrer Bonus banner. Shown at the top of both the
// connected and not-connected views on /refer. Three milestones, exclusive-
// tranched for same-wallet multi-milestone winners. Admin-paid; the trust
// anchor is the on-chain referralCount + the public payout tx on PolygonScan
// + the reputation pledge written into the full rules.
function FounderReferrerBonusBanner(): JSX.Element {
  return (
    <div className="card border-accent-teal/50 bg-gradient-to-br from-bg-panel via-bg-panel to-cyan-900/10">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="tier-badge bg-cyan-700/40 text-accent-cyan border border-accent-cyan/40 shrink-0">Founder-Referrer Bonus</span>
        <h2 className="text-xl font-bold font-display flex-1 min-w-0">
          <span className="grad">Be one of the first to build {BRAND_NAME}'s network. Earn a public, on-chain-anchored bonus on top of every USDC you've already earned.</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Milestone n={100}  pct="25%" />
        <Milestone n={500}  pct="50%" />
        <Milestone n={1000} pct="75%" />
      </div>
      <p className="text-text-on-dark/85 text-sm mt-4">
        First wallet to reach each paid-referral milestone receives a bonus payout (in USDC, from {BRAND_NAME} Treasury) equal to the listed percentage of <em>their on-chain referral earnings up to that block</em>. Same wallet can win multiple tiers — later bonuses pay the marginal increase over what's already been paid at earlier milestones. Admin-administered, but the metric is the public on-chain <code>referralCount</code>; the payout is a public PolygonScan tx; the pledge is on the record.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Link to="/info?tab=referrals#founder-referrer-bonus" className="btn btn-secondary text-sm">Read the full rules &amp; pledge →</Link>
        <span className="text-xs text-text-muted">Anyone can refer — no purchase, no signup. Your wallet address is your link.</span>
      </div>
    </div>
  );
}

function Milestone({ n, pct }: { readonly n: number; readonly pct: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-accent-teal/30 bg-bg-deepest p-3 text-center">
      <div className="text-text-muted text-xs">First wallet to</div>
      <div className="font-display font-bold text-2xl mt-1"><span className="grad">{n.toLocaleString()}</span></div>
      <div className="text-text-muted text-xs">paid referrals earns</div>
      <div className="font-display font-bold text-xl mt-1 text-accent-green">{pct}</div>
      <div className="text-text-muted text-[10px] mt-0.5">bonus on hard earnings to that block</div>
    </div>
  );
}

interface LeaderRow { referrer: string; referrals: number; earnedUSDC: string }

function rankStyle(rank: number): { border: string; chip: string; numCls: string; label: string } {
  if (rank === 1) return { border: "border-amber-400/60",  chip: "bg-amber-400/15 text-amber-300 border-amber-400/40",   numCls: "text-amber-300",   label: "1st" };
  if (rank === 2) return { border: "border-zinc-300/50",   chip: "bg-zinc-300/10  text-zinc-200  border-zinc-300/30",   numCls: "text-zinc-200",    label: "2nd" };
  if (rank === 3) return { border: "border-orange-500/50", chip: "bg-orange-500/10 text-orange-300 border-orange-500/30", numCls: "text-orange-300", label: "3rd" };
  return                  { border: "border-bg-surface",   chip: "bg-bg-deepest text-text-muted border-bg-surface",      numCls: "text-text-on-dark",label: `#${rank}` };
}

function Leaderboard({ self }: { readonly self?: string }): JSX.Element | null {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/referral/leaderboard`);
        if (!r.ok) { if (alive) setGone(true); return; }
        const j = (await r.json()) as { top?: LeaderRow[] };
        if (alive) setRows(Array.isArray(j.top) ? j.top : []);
      } catch {
        if (alive) setGone(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const topThree = rows ? rows.slice(0, 3) : [];
  const summaryRight = !rows
    ? <span className="text-xs text-text-muted">Loading…</span>
    : rows.length === 0
      ? <span className="text-xs text-text-muted">Be the first</span>
      : <span className="text-xs text-text-muted">{rows.length} referrer{rows.length === 1 ? "" : "s"} indexed</span>;

  return (
    <details className="card group">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="tier-badge bg-amber-400/15 text-amber-300 border border-amber-400/40 shrink-0">Leaderboard</span>
          <h2 className="text-xl font-bold font-display truncate"><span className="grad">Top referrers</span></h2>
        </div>
        <div className="flex items-center gap-3">
          {summaryRight}
          <span className="text-accent-cyan text-xl shrink-0 group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
        </div>
      </summary>

      {/* Podium teaser visible the moment it expands */}
      {rows && rows.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => {
            const row = topThree[i];
            const s = rankStyle(i + 1);
            if (!row) {
              return (
                <div key={i} className={`rounded-lg border ${s.border} bg-bg-deepest/40 p-3 text-center opacity-60`}>
                  <div className={`text-xs font-bold ${s.numCls}`}>{s.label}</div>
                  <div className="font-mono text-xs text-text-muted mt-2">(open)</div>
                </div>
              );
            }
            const mine = !!self && row.referrer.toLowerCase() === self.toLowerCase();
            return (
              <div key={row.referrer} className={`rounded-lg border ${s.border} bg-bg-deepest/40 p-3 text-center ${mine ? "ring-1 ring-accent-cyan" : ""}`}>
                <div className={`text-xs font-bold ${s.numCls}`}>{s.label}{mine ? " · you" : ""}</div>
                <div className="font-mono text-[11px] text-text-muted mt-1 truncate">{row.referrer.slice(0, 6)}…{row.referrer.slice(-4)}</div>
                <div className="font-display font-bold text-2xl mt-1 grad">${(Number(row.earnedUSDC) / 1e6).toFixed(2)}</div>
                <div className="text-[10px] text-text-muted">{row.referrals} paid ref{row.referrals === 1 ? "" : "s"}</div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">
        Indexed from the public on-chain <code>ReferralAttributed</code> events. Public data only — no tracking, no off-chain identity. Addresses shown truncated.
      </p>

      {gone ? (
        <p className="text-sm text-text-muted mt-3">
          Leaderboard temporarily unavailable — the on-chain referral scan needs an archive-capable RPC. Your referrals are still recorded on-chain; this is a display limit only.
        </p>
      ) : !rows ? null : rows.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-bg-surface bg-bg-deepest p-4 text-sm text-text-muted">
          No referrers yet — <span className="text-text-on-dark font-medium">be the first</span>. Share your link; this board fills automatically from on-chain paid referrals.
        </div>
      ) : (
        <ol className="mt-3 space-y-1 text-sm">
          {rows.map((row, i) => {
            const mine = !!self && row.referrer.toLowerCase() === self.toLowerCase();
            const s = rankStyle(i + 1);
            return (
              <li key={row.referrer} className={`flex items-center gap-3 py-1 ${mine ? "text-accent-cyan font-bold" : ""}`}>
                <span className={`shrink-0 inline-flex items-center justify-center w-10 text-[11px] font-bold rounded border px-1 py-0.5 ${s.chip}`}>{s.label}</span>
                <span className="font-mono text-xs flex-1 truncate">{row.referrer.slice(0, 6)}…{row.referrer.slice(-4)}{mine ? " (you)" : ""}</span>
                <span className="text-xs text-text-muted">{row.referrals} ref{row.referrals === 1 ? "" : "s"}</span>
                <span className="font-mono text-sm w-24 text-right">${(Number(row.earnedUSDC) / 1e6).toFixed(2)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </details>
  );
}

type ReferSub = "earn" | "community-owners";
const REFER_SUBS: { id: ReferSub; label: string }[] = [
  { id: "earn",              label: "Earn referrals" },
  { id: "community-owners",  label: "Community Owners" },
];

export function Refer(): JSX.Element {
  useDocumentHead("/refer");
  const [params, setParams] = useSearchParams();
  const sub: ReferSub = params.get("tab") === "community-owners" ? "community-owners" : "earn";
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Refer &amp; earn</span></h1>
        <p className="text-text-muted text-sm mt-1">Two ways the on-chain referral program shows up: <strong>Earn referrals</strong> is your personal dashboard; <strong>Community Owners</strong> is the partner toolkit for running Refer &amp; Share contests in your community.</p>
      </header>
      <SubTabBar
        items={REFER_SUBS}
        active={sub}
        onPick={(id) => setParams(id === "earn" ? {} : { tab: id }, { replace: true })}
      />
      {sub === "earn"             && <EarnReferralsPanel />}
      {sub === "community-owners" && <CommunityOwnersPanel />}
    </div>
  );
}

function EarnReferralsPanel(): JSX.Element {
  const gate = useWalletGate();
  const address = gate.address;
  const isManaged = gate.kind === "managed";
  // Managed-mode users get an NK-MGMT-XXXX 12-char code as their link path
  // (strawman §9.2). Self-custody users keep the 0x-address path; the hook
  // returns settled=true with code=null when not in managed mode so the
  // self-custody render is not blocked while waiting for a fetch that will
  // never fire. Endpoint 404 / failures also yield code=null → safe fallback.
  const { code: managedCode } = useManagedReferralCode(isManaged);
  const [copied, setCopied] = useState(false);

  const enabled = !!address;
  const args = address ? ([address] as const) : undefined;

  const { data: count } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "referralCount", args, query: { enabled } });
  const { data: credit } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "referralCreditUSDC", args, query: { enabled } });
  const { data: affiliate } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "isAffiliate", args, query: { enabled } });
  const { data: threshold } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "affiliateThreshold" });
  const { data: discBps } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "refereeDiscountBps" });
  const { data: shareBps } = useReadContract({ address: LICENSE_ADDR, abi: licenseAbi, functionName: "referrerShareBps" });

  // NOT connected (genuine disconnect OR no-address-yet boot). The public
  // on-chain leaderboard + bonus banner stay visible (never gated); the
  // connect surface is the ONE shared WalletGateCard (buttons always live).
  if (gate.status !== "connected") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Leaderboard />
        <FounderReferrerBonusBanner />
        <WalletGateCard
          note={
            <>
              <p>
                Connect your wallet to get your referral link and track rewards. That's all it takes —{" "}
                <strong>no purchase and no signup</strong> to refer; your link is simply your wallet address.
              </p>
              <p className="text-sm text-text-muted pt-2">
                New to how this works?{" "}
                <Link to="/info?tab=referrals" className="text-accent-cyan hover:underline font-semibold">
                  Read the full Referrals explainer →
                </Link>
              </p>
            </>
          }
        />
      </div>
    );
  }

  // Managed → NK-MGMT-* code; self-custody (or managed with no code yet) →
  // 0x address path. The managedCode-or-address branch keeps the displayed
  // link stable across the brief fetch window: address-path renders first,
  // then swaps to the code once Form B replies (no skeleton needed — it's a
  // single short string).
  const linkRef = isManaged && managedCode ? managedCode : address;
  const link = `${SITE}/?ref=${linkRef}`;
  const n = Number(count ?? 0n);
  const thr = Number(threshold ?? 5n);
  const creditUsdc = credit !== undefined ? (Number(credit as bigint) / 1e6).toFixed(2) : "0.00";
  const discPct = discBps !== undefined ? (Number(discBps as number) / 100).toFixed(0) : "10";
  const sharePct = shareBps !== undefined ? (Number(shareBps as number) / 100).toFixed(0) : "10";
  const isAff = !!affiliate;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Leaderboard self={address} />
      <FounderReferrerBonusBanner />
      <header>
        <p className="text-text-muted text-sm">Wallet: <span className="font-mono">{address?.slice(0, 6)}…{address?.slice(-4)}</span></p>
      </header>

      <div className="card space-y-3">
        <h2 className="font-bold font-display">Your referral link</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <code className="bg-bg-deepest border border-bg-surface rounded p-2 text-xs break-all flex-1 min-w-0">{link}</code>
          <button
            className="btn btn-secondary text-xs shrink-0"
            onClick={() => { void navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-text-muted">
          Anyone who buys a paid {BRAND_NAME} licence after visiting your link gets <strong>{discPct}% off</strong>; you earn <strong>{sharePct}%</strong> of what they pay. The referrer is locked on their first paid mint — you keep earning on their renewals.
        </p>
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-3">Your status</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-text-muted text-xs">Successful referrals</div>
            <div className="font-mono text-lg">{n}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">Mode</div>
            <div className={`font-bold ${isAff ? "text-accent-green" : "text-accent-cyan"}`}>{isAff ? "Affiliate — instant USDC" : "Credit (pre-affiliate)"}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">{isAff ? "Per-referral payout" : "Redeemable credit"}</div>
            <div className="font-mono text-lg">{isAff ? `${sharePct}% USDC` : `${creditUsdc} USDC`}</div>
          </div>
        </div>
        {!isAff && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Progress to affiliate (instant USDC)</span>
              <span>{Math.min(n, thr)} / {thr}</span>
            </div>
            <div className="h-2 bg-bg-deepest rounded overflow-hidden border border-bg-surface">
              <div className="h-full grad-bg" style={{ width: `${Math.min(100, (n / thr) * 100)}%` }} />
            </div>
            <p className="text-xs text-text-muted mt-2">
              Until you reach {thr} paid referrals your share builds as <strong>credit</strong> — it auto-applies against your own next {BRAND_NAME} licence purchase (it never expires, it's not withdrawable — purely a discount on your own renewal/upgrade). At {thr}, you flip to <strong>affiliate</strong>: every referral from then on pays your {sharePct}% straight to your wallet in USDC, automatically, no claim step.
            </p>
          </div>
        )}
        {isAff && (
          <p className="text-xs text-text-muted mt-4">
            You're an affiliate. Each new referral's {sharePct}% arrives in this wallet as USDC the moment they mint — there is no claim button by design (no contract-held balance = nothing to claim or lose).
          </p>
        )}
      </div>

      <div className="card text-xs text-text-muted space-y-2">
        <p>
          <strong className="text-text-on-dark/80">How your link is remembered:</strong> no cookie, no server, no tracking. Your link is stored only in the visitor's own browser. That browser keeps it — even on a later visit without the link — until their first paid mint. A different device/browser, cleared site-data or a private window has no memory of it. At the first paid mint the contract locks you in as referrer <strong>permanently</strong> (renewals included).
        </p>
        <p>
          All figures are read live from the on-chain {BRAND_NAME}License contract. Self-referral and zero-address referrers are rejected on-chain. Free-tier mints cost nothing and earn nothing (no farming surface).
        </p>
        <p>
          By participating you accept that the audited, public {BRAND_NAME}License contract is the <strong>sole and final arbiter</strong> of attribution and payouts; the browser link is best-effort and not guaranteed; because no off-chain record is kept (zero tracking), {BRAND_NAME} cannot adjudicate attribution disputes. Referral value is a discount/revenue-share on software — not an investment or income promise; not financial or legal advice. English governs.
        </p>
        <p>
          Full rules, the worked example, and why it’s 100% smart-contract-executed (no claim step, no custody):{" "}
          <Link to="/info?tab=referrals" className="text-accent-cyan hover:underline">How Refer &amp; earn works →</Link>
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CommunityOwnersPanel — the partner toolkit (NEW 0.4.0). Two pieces:
//   * Partner card builder — visible to ALL (connected or not). It's just a
//     PNG with two logos and a tagline — completely safe to expose; lets any
//     would-be partner see what a NoKLock × their-brand card looks like
//     before they commit.
//   * Contest builder + playbook — wallet-gated through <PartnerAccessGate/>:
//     Premium-tier perk OR selected-partner invitation (admin-managed
//     whitelist via Form B's app_flags). No bearer tokens to leak.
// -----------------------------------------------------------------------------
type ToolkitSub = "cobrand" | "contest";
const TOOLKIT_SUBS: { id: ToolkitSub; label: string }[] = [
  { id: "contest", label: "Refer & Share contest" },
  { id: "cobrand", label: "Cobrand card (open to all)" },
];

function CommunityOwnersPanel(): JSX.Element {
  // Fire the once-per-browser/day landing event the moment this panel mounts.
  // Dedup is inside the helper; the effect just guarantees the call happens.
  useEffect(() => { trackCommunityOwnersLandingOncePerDay(); }, []);

  const SHARE_URL = `${SITE}/partners`;
  const [shareCopied, setShareCopied] = useState(false);
  // 2026-05-28: Daniel #11 — the two builders go INSIDE the Partner Toolkit
  // card as subtabs, not as separate sections beneath it. Cobrand defaults
  // because it's open to everyone and is the first thing a partner explores.
  const [tool, setTool] = useState<ToolkitSub>("contest");

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="font-bold font-display flex-1 min-w-0">Partner Toolkit <span className="text-text-muted text-xs font-normal">— community-owner perk on top of the on-chain referral program</span></h2>
          <button
            type="button"
            className="btn btn-secondary text-xs shrink-0"
            onClick={() => {
              void navigator.clipboard?.writeText(SHARE_URL).then(() => {
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              });
            }}
            title={`Copy ${SHARE_URL}`}
          >
            {shareCopied ? "Copied ✓" : "Copy invite link"}
          </button>
        </div>
        <p className="text-sm text-text-on-dark/90">
          Visiting your link gets the buyer <strong>10% off</strong>; you earn <strong>10% of what they pay</strong> in USDC, on-chain at mint. The contest builder lets you pre-commit a slice of that earned USDC to a community pool.
        </p>
        <CommunityOwnersFlow />
        <p className="text-[11px] text-text-muted">
          <strong>Honour-system payout, on-chain verifiability.</strong> {BRAND_NAME} never custodies contest funds; partners pay out from their own earned wallet, and anyone can independently calculate what's owed by reading the partner's wallet on PolygonScan.
        </p>
        <p className="text-[11px] text-text-muted">
          Share this page with a partner: <code className="text-accent-cyan">{SHARE_URL}</code> (redirects straight here).
        </p>

        {/* Builder subtabs — Cobrand (open) / Contest (gated) — INSIDE the
            Partner Toolkit card so the page is one stack, not three. */}
        <div className="pt-2 border-t border-bg-surface/40">
          <SubTabBar items={TOOLKIT_SUBS} active={tool} onPick={(id) => setTool(id as ToolkitSub)} />
        </div>

        {tool === "cobrand" && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-text-muted">
              {BRAND_NAME} × your-brand 1200×675 PNG for Telegram, X, channel banners. Try it without committing — upload your logo, type a tagline, download the PNG.
            </p>
            <PartnerCardBuilder />
          </div>
        )}
        {tool === "contest" && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-text-muted">
              4 knobs (pool share / trigger / prize / distribution) → live sample card + Telegram post + per-partner playbook (.md / .rtf / Save-as-PDF). Premium-tier or selected-partner invitation only.
            </p>
            <PartnerAccessGate>
              <ContestBuilder />
            </PartnerAccessGate>
          </div>
        )}
      </section>
      {/* The standalone "want it without buying Premium?" invitation card was
          removed (Daniel 2026-06-15): it rendered for EVERYONE incl. Premium
          owners who already have access. The unlock offer + Book-a-call / See-
          Premium CTAs now live inside PartnerAccessGate's locked overlay, so
          they only show to genuinely-locked users. */}
    </div>
  );
}
