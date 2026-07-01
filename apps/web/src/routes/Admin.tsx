// @version 0.10.0 @date 2026-06-12
// 0.10.0 — Daniel 2026-06-12: collapse owner-admin signing for READS onto ONE
//          shared ops-session signature. The three owner-gated list fetchers
//          (AdminRefundsPending.load / AdminRefundsProcessed.load /
//          AdminBlacklistMinted.refetch) used to each sign their OWN per-action
//          read message ("NoKLock refund list: <ts>" / "NoKLock blacklist list
//          <ts>") on every load — three separate wallet prompts. They now call
//          the shared ensureOpsSig(address, signMessageAsync) from useOpsLive
//          and forward the CACHED ops-session credential as ?msg=&sig= (the old
//          ?ts= param + per-action read message are dropped). One signature
//          (24h TTL) now covers every admin READ across the whole panel + the
//          ops tiles. WRITES (approve/reject/add/remove/set/clear/publish/
//          delete) are UNCHANGED — still per-action signed. Also added
//          useAccount() to the two refund components so they can pass `address`.
//          PATENT LABELS: the PatentStatusManager option labels + the enum
//          comment no longer surface the word "provisional" in user-facing text
//          (clean plain wording); the internal flag-key constants
//          "patents.us-provisional-status/-serial" are UNTOUCHED (renaming them
//          would orphan Daniel's stored flag value).
// 0.9.0 — Daniel handoff §1.3 (2026-06-07): HYBRID OwnerOnly migration.
//          /admin was the LAST major surface still reading the legacy
//          parallel-state-machine store (the wallet-status hook from the
//          legacy wallet-session module) — the 2026-06-04 wallet-refactor
//          that migrated 9/12 surfaces to useWalletGate explicitly deferred
//          Admin/Recovery/Restore/DeadMan. Effect on Treasury wallet today:
//          /admin flashed the wallet-reconnecting card on every wagmi blip
//          plus a verify-owner spinner card on every nav, because the
//          OwnerOnly 0.9.0 offchain-admin fast-path was never wired here.
//
//          Refactor (handoff-locked HYBRID option per §7.1 decision row 7.2):
//            - Wrap the entire tab UI in OwnerOnly with title="Admin".
//              All gating logic — reconnect handling, license-owner read for
//              gate-purpose, offchain-admin allow-list, timeout escape,
//              not-authorised card — now lives in ONE place
//              (components/OwnerOnly.tsx).
//            - DELETE the inline gate: the early-return reconnect card, the
//              verify-owner spinner card, the early-return not-authorised
//              card, the duplicated OFFCHAIN_ADMINS Set, the legacy
//              wallet-status hook, and the reconnect-card import all go.
//            - PRESERVE the "Off-chain admin connected: … on-chain actions
//              require contract-owner wallet" header banner as an inline
//              AdminAddressBanner component placed INSIDE the OwnerOnly
//              children, BELOW the gate and ABOVE the tab navigation. It
//              only renders when isOffchainAdmin(address) returns true — the
//              banner exists to warn the user that on-chain owner actions
//              will revert. For the contract-owner wallet the banner is
//              suppressed (matches the previous semantics — the old
//              ternary's owner branch was just an address pill, no warning).
//            - useAccount() (wagmi) is the address source for the banner
//              conditional. No re-import of the legacy hook surface.
//            - The single retained useReadContract(License.owner) call lives
//              INSIDE the OwnerOnly children — it is NOT used for gating
//              (OwnerOnly does its own gate-purpose owner read with
//              staleTime: Infinity), only for supplying ownerAddress +
//              canWriteOnchain props to AdminWhitelists. canWriteOnchain is
//              derived as `!isOffchainAdmin(address)` — once the OwnerOnly
//              gate has passed, the user is either the contract owner OR an
//              off-chain admin; if not off-chain, they must be the contract
//              owner.
// 0.8.1 — LOW-17 (Daniel 2026-06-03): AdminBlacklists Mint sub-tab — added a
//          small (i) info icon next to each scope checkbox with a tooltip
//          (native title=) explaining precisely what each scope blocks:
//            • mint-license   — Blocks USDC license-NFT mint via paddle-webhook
//            • use-license    — Blocks license-state reads + refund requests
//            • heir-add       — Blocks designating new heirs + heir claim flow
//            • restore-quorum — Blocks restore via quorum vote + owner-self-restore
//          Help text is also rendered inline as muted text under each row so
//          it's discoverable without hovering. Pure UI surface — no schema,
//          no API change.
// 0.8.0 — Daniel 2026-06-03: NEW top-level "Refunds" tab. Two sub-tabs:
//          • Pending   — list of refund_requests where status='pending',
//                        with [Approve] / [Reject] / [View details] per row.
//                        Approve  → confirmation modal → admin-signs
//                          "NoKLock refund approve: <id>" → POST
//                          /v1/admin/refund-requests/:id/approve.
//                        Reject   → confirmation modal with reason textarea
//                          (required) → admin-signs "NoKLock refund reject:
//                          <id>" → POST /v1/admin/refund-requests/:id/reject
//                          with { signature, reason }.
//                        View     → inline expand row with full meta
//                          (subscription_state_id, paddle_transaction_id,
//                          request_signature, full reason).
//          • Processed — status in (refunded | rejected) read via the same
//                        admin-signed GET /v1/admin/refund-requests endpoint
//                        with two parallel calls (?status=refunded and
//                        ?status=rejected), merged + sorted DESC by
//                        processed_at_ts. Extra columns: processed_at,
//                        status pill, paddle_refund_id link.
//          Both tabs share a wallet-address search filter (client-side, case
//          insensitive substring). Refetch + toast after every action; one
//          admin signature covers a single list-fetch (5-minute window) and
//          one mutation. Sits between "Audit reports" and "Updates" in the
//          top-level tab bar — financial ops grouped with audit/updates.
// 0.7.0 — Daniel 2026-06-03: Whitelist tab reorg. The two top-level tabs
//          "Whitelist mint" + "Whitelist grants" collapse into a SINGLE
//          top-level "Whitelists" tab with three sub-tabs:
//            • Mint   — the existing adminMint form + setMintable panel.
//            • Minted — NEW. Read-only list of every adminMint grant
//                       (address · tier · timestamp · tx · minter), pulled
//                       from /v1/index/grants. The "minter" column shows
//                       the contract-owner address (the only signer the
//                       contract accepts for adminMint), with the
//                       PolygonScan tx link as the on-chain proof.
//            • Grants — the existing editable off-chain-note view
//                       (AdminWhitelistGrants) moved verbatim under here.
//          Default sub-tab = Mint. Tab state stays internal to Admin.tsx
//          (the page never had public sub-routes for whitelist anyway —
//          /admin/whitelist-mint was a tab key, not a router path), so
//          this is a pure in-page reorg with no App.tsx route changes.
// 0.6.1 — Daniel 2026-06-02: Textual updates only — three references that
//         said "Settings → About / Settings → AboutBox" updated to point
//         at the new home of those cards (Info → About NoKLock → About),
//         following the Settings 0.6.0 + Info 0.7.6 reorg. No structural
//         admin change required: Admin.tsx never rendered its own Day-1
//         honest note or its own copy of Updates / Privacy / System
//         status / About — the only Day-1 surface from this page is the
//         FlagToggleRow for "noklock.launch-banner.enabled" which gates
//         the Landing-page banner globally (left as is).
// 0.6.0 — Daniel 2026-05-31 (NK0-b): NEW "Socials" tab added between Stats
//          and Audit reports. Phase 1 = Twitter / X card with FREE CSV
//          paste-in (per Daniel's choice over the $200/mo Basic API tier).
//          Lives in components/AdminSocials.tsx — full inline analytics
//          (7d/30d tweet count, impressions, engagements, engagement rate,
//          link clicks, best tweet by impressions, top link-driving tweets).
//          Telegram / LinkedIn / Discord / YouTube cards render as
//          "Coming soon" tiles on the same row, ready to populate when
//          we have data sources.
// 0.5.0 — Daniel 2026-05-31: Traffic-sources block now pins X / Telegram /
//          LinkedIn — they always render (even at 0) since they're the
//          channels the outreach campaigns push to.
// 0.4.13 — Daniel: "still a bit of dancing moving around gated pages .. every
// 0.4.13 — Daniel: "still a bit of dancing moving around gated pages .. every
//          time a load happens the recon goes and the dialog screen comes up
//          with hard reset instructions". Switched the "not connected"
//          surface gate from wagmi's raw status (which briefly flips to
//          "disconnected" on every fresh mount before the connector binds)
//          to OUR debounced + hadWallet-aware store via the legacy
//          wallet-status hook. Companion change in OwnerOnly 0.5.0,
//          PartnerAccessGate 0.6.0, the reconnect card 0.7.0 — all reading
//          the same store. (Superseded by 0.9.0's full OwnerOnly migration.)
// 0.4.12 — Marketing MOVED out of /admin to its own gated /marketing page
//          (Daniel) — removed the Marketing tab + AdminMarketing import; added
//          a "Marketing tools →" header link. AdminMarketing.tsx is now an
//          orphan (superseded by routes/Marketing.tsx).
// 0.4.11 — NEW "Marketing" tab (AdminMarketing): launch playbook + research-
//          backed launch-tweet store with "Tweet this ↗" (X compose intent,
//          no API) + copy, accounts (X/Reddit), and priority influencer
//          outreach targets. Launch-week marketing cockpit.
// 0.4.10 — Stats: + "Licences sold by tier" (Daniel) — per-tier paid mint
//          counts + gross USDC revenue (from idx_licence_minted), whitelist/
//          comped grants listed separately, plus "Licences sold" + "Gross
//          revenue" headline tiles + CSV rows. The sales view was missing.
// 0.4.9 — Stats tab → ops/reporting/sales dashboard (Daniel 2026-05-22):
//         headline numbers row (page views · unique visitors · wallet
//         connects · founders claimed/cap · referrals + payouts all-time);
//         narrower event cards each with a colour-coded day-bar mini chart
//         (hand-rolled SVG, no dep) + an (i) explainer; NEW Top countries
//         (cf-ipcountry, IP never stored) + Traffic sources panels; custom
//         from/to date range alongside the presets; client-side CSV export
//         (well-described header, zero-PII). Reads the extended /v1/admin/
//         stats (+ /v1/founder/stats for the founder tile).
// 0.4.8 — NEW "Site toggles" tab (AdminSiteToggles + FlagToggleRow). First
//         consumer: the launch-transparency banner enable/disable global
//         override. Owner-signed via the new /v1/flags/:key endpoints
//         (Form B routes/flags.ts + migration 014-app-flags). Future
//         site-wide toggles slot in as additional FlagToggleRow rows
//         without code structural changes.
// 0.4.7 — Reconnect guard → shared useWalletSettling (grace window):
//         the fast SW-served load no longer flashes "connect wallet"
//         before wagmi restores the session (Daniel's soft-refresh bug).
// 0.4.6 — Events: + "Paid-tier vaults created" counter; EVENT_LABEL
//         re-ordered so the grid is 3+3 (installs · free · paid / prove
//         -it · how-it-works · unique) — Daniel.
// 0.4.5 — NEW "Tier mintability (setMintable)" owner control in the
//         Whitelist tab — call setMintable(tier,bool) from our own
//         panel (PolygonScan Write-Contract UI was unusable: silent
//         gas-revert + label-as-value foot-guns). Unblocks gating
//         tiers 4/5 on-chain.
// 0.4.4 — Connect prompt → shared <ConnectWallet/> (works with no
//         extension / mobile via WalletConnect). Whitelist-mint hard-
//         blocks double-granting Lifetime (tier 2) to an address that
//         already has one (audit #4 footgun closed UI-side until the
//         contract guard ships in the next redeploy).
// 0.4.3 — PERMANENT FIX: Whitelist-grants now reads the Form B event
//         INDEX (GET /v1/index/grants) — NO browser getLogs at all.
//         Ends the whole pruned/upstream-400/range-cap saga for this
//         tab. Dropped logsClient + ADMIN_MINTED_EVENT + DEPLOY_BLOCK/
//         LOG_QUERY_CHUNK usage here.
// 0.4.2 — Reverted the useReconnectGate experiment → simple status guard
//         (Daniel: back it out, it didn't fix the loop; re-judge once the
//         archive RPC is in).
// 0.4.1 — AdminStats reworked: Events + Views-by-day moved ABOVE
//         Views-by-route; redesigned (bold stat tiles, readable
//         numbers, clearer bars); ALL known event types listed even at
//         zero so the full analytics set is visible.
// 0.4.0 — PLAN-4: + "Updates" tab (owner-signed publish to Form B
//         /v1/updates → shows on /updates, WS-G); + "Whitelist grants"
//         tab (lists every on-chain LicenceAdminMinted grant via chunked
//         getLogs + an editable off-chain admin note per grant, owner-
//         signed PUT to /v1/whitelist-notes, WS-J); Stats tab now also
//         renders the zero-PII named-event counters (installs, free-tier
//         uses, prove-it / how-it-works runs, daily uniques, WS-H).
// 0.3.5 — WS-F: don't flash the "connect wallet" screen while the wallet
//         is reconnecting after navigation — show "Reconnecting…" instead
//         (paired with main.tsx persistent storage + reconnectOnMount).
// 0.3.4 — Audit list ordered first-entered-first (ascending added_at),
//         matching the public Info → Contracts view.
// 0.3.3 — Network guard on adminMint (ensurePolygon before the write) so
//         the owner panel can't fire adminMint on the wrong chain (BNB).
// 0.3.2 — FIX: stray up/down scrollbar arrows on the right of the tab bar.
//         `overflow-x-auto` with default `overflow-y: visible` computes
//         overflow-y to `auto` per the CSS overflow spec; a sub-pixel
//         vertical overflow (button border + `-mb-px`) then drew a native
//         vertical scrollbar. Added `overflow-y-hidden` — horizontal
//         scroll for narrow screens preserved, no vertical scrollbar.
// 0.3.1 — FIX: Audit tab blanked the whole page. Initial data loads were
//         fired from a render-phase `void refresh()` / `void load()` —
//         a side effect + setState during render (Rules-of-React
//         violation). In AdminAudit `loading` starts true so setLoading
//         no-ops, the guard never closes, and wagmi's owner-poll re-render
//         re-invokes it every render → "Maximum update depth exceeded".
//         With no ErrorBoundary in the app, that uncaught error unmounts
//         the entire root → blank screen. Both loads moved to useEffect
//         (once, on mount). Audit fetch now checks r.ok + clears err on
//         retry. Button label "&amp;" → literal "&" (it's a JS string —
//         the entity was rendering as text).
// 0.3.0 — Audit tab rewired: localStorage → Form B /v1/audit. Owner signs
//         a personal_sign message; server verifies signer == License.owner()
//         then persists. Reports now render publicly on Info → Contracts.
//         No localStorage, no dead duplicate — the form stays here.
// 0.2.0 — Round 3 wave 4: Stats tab reads /v1/admin/stats from Form B
//         (Plausible dropped; cPanel hosting has no Docker). Heartbeat tab
//         got a per-wallet on-chain lookup — paste an address, reads
//         lastHeartbeat / gracePeriodOverride / lastActivatedBlock from
//         the Oracle contract directly, shows time-to-fire + risk window.
// 0.1.0 — initial admin panel with 4 tabs.
//
// /admin — wallet-sig-gated owner panel. The PWA reads License.owner() from
// the on-chain License contract; if the connected wallet matches, the panel
// renders. Otherwise the user sees a not-authorised state and a Connect
// prompt.
//
// All actions in this panel hit the chain directly via the owner wallet's
// signature — no Form B session, no JWT. The gate is purely UX (hiding the
// UI from non-owners). On-chain functions enforce ownership themselves; a
// non-owner trying to call adminMint, setPrice, etc. would just have their
// transaction revert.
//
// Tabs:
//   - Stats   — Plausible iframe (if VITE_PLAUSIBLE_DOMAIN set)
//   - Audit   — paste SolidityScan / external-audit report URLs
//   - Whitelist — adminMint a tier to a wallet with a note (used for Beta
//                 Tester Programme, bug-report rewards, friends-and-family)
//   - Heartbeat — list wallets with active dead-man's-switch + grace period
//                 + last heartbeat (read-only)

import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import { useAccount, useReadContract, useWriteContract, useSignMessage } from "wagmi";
import { OwnerOnly } from "../components/OwnerOnly.js";
import { LICENSE_ADDR, ORACLE_ADDR, licenseAbi, oracleAbi, TIER_NAME } from "../lib/contracts.js";
import { isOffchainAdmin } from "../lib/offchainAdmins.js";
import { useEnsurePolygon } from "../hooks/useEnsurePolygon.js";
import { humanizeRpcError } from "../lib/rpcError.js";
import { humanizeTxError } from "../lib/txError.js";
import { AdminOpsManual } from "./AdminOpsManual.js";
import { AdminCitations } from "./AdminCitations.js";
import { InfoTooltip } from "../components/InfoTooltip.js";
import { RichTextEditor } from "../components/RichTextEditor.js";
import { RichTextView } from "../components/RichTextView.js";
import {
  listArticles, getArticle, publishArticle, deleteArticle, slugify,
  articlePublishMsg, articleDeleteMsg, ARTICLE_CATEGORIES, CATEGORY_LABEL,
  type ArticleMeta, type ArticleCategory,
} from "../lib/articles-client.js";
import { sanitizeHtml, htmlHasText, looksLikeHtml } from "../lib/sanitizeHtml.js";
import { AdminSocials } from "../components/AdminSocials.js";
import { AdminOperationalSurfaces } from "../components/AdminOperationalSurfaces.js";
import { AdminPaymentConfig } from "../components/AdminPaymentConfig.js";
import { ensureOpsSig } from "../hooks/useOpsLive.js";
import { Link, useSearchParams } from "react-router-dom";

type AdminTab = "stats" | "socials" | "opsurfaces" | "audit" | "refunds" | "updates" | "whitelists" | "opsmanual" | "citations" | "banner" | "payments" | "blacklists" | "heartbeat" | "vizzes";

const TAB_LABEL: Record<AdminTab, string> = {
  stats:       "Stats",
  socials:     "Socials",
  opsurfaces:  "Op Surfaces",
  audit:       "Audit reports",
  refunds:     "Refunds",
  updates:     "Updates+",
  whitelists:  "Whitelists",
  vizzes:      "Visualisers",
  opsmanual:   "Ops Manual",
  citations:   "Citations",
  banner:      "Site toggles",
  payments:    "Payment config",
  blacklists:  "Blacklists",
  heartbeat:   "Heartbeat status",
};

// 0.9.0 — HYBRID: OwnerOnly owns the gate; AdminTabsShell renders inside
// the gate's children and contains the tab UI + the preserved
// "Off-chain admin connected" header banner.
export function Admin(): JSX.Element {
  return (
    <OwnerOnly title="Admin">
      <AdminTabsShell />
    </OwnerOnly>
  );
}

// 0.9.0 — Inline banner preserved verbatim (warning copy unchanged) from the
// pre-refactor inline ternary. ONLY renders when the connected address is an
// off-chain admin — for the contract-owner wallet the banner is suppressed
// (matches the previous semantics where the owner branch was just an
// address pill with no warning copy). ownerAddr is the on-chain
// License.owner() result (may be undefined briefly while the read is in
// flight; in that case the trailing "(0x…)" suffix is omitted).
function AdminAddressBanner({ address, ownerAddr }: { readonly address: string; readonly ownerAddr: string | undefined }): JSX.Element {
  return (
    <p className="text-text-muted text-sm mt-1">
      Off-chain admin connected:{" "}
      <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>{" "}
      —{" "}
      <span className="text-amber-300">
        on-chain actions (mint / setMintable / setPrice) require the contract-owner wallet
        {ownerAddr ? <> ({ownerAddr.slice(0, 6)}…{ownerAddr.slice(-4)})</> : null}.
        Form-B actions (Updates, Audit, notes, toggles) work fine.
      </span>
    </p>
  );
}

// 0.9.0 — The tab shell. Rendered ONLY after OwnerOnly has confirmed the
// user is either the contract owner or an offchain admin, so `address` is
// guaranteed non-empty here (OwnerOnly's 'disconnected' branch renders its
// own Connect prompt and never reaches children).
function AdminTabsShell(): JSX.Element {
  const { address } = useAccount();
  // Persist the active tab in the URL (?tab=) so a hard refresh / reload STAYS
  // on the current tab instead of snapping back to "stats" (Daniel 2026-06-14).
  // Mirrors the Info.tsx ?tab= pattern; unknown/absent → "stats". `replace:true`
  // keeps tab switches out of the back-button history.
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab: AdminTab =
    rawTab && Object.prototype.hasOwnProperty.call(TAB_LABEL, rawTab)
      ? (rawTab as AdminTab)
      : "stats";
  const setTab = useCallback(
    (t: AdminTab): void => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", t);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // The ONLY useReadContract owner read kept on this surface — used solely
  // to populate the ownerAddress prop on <AdminWhitelists/> (which displays
  // the owner's short form on the OnchainOwnerGuard card + drives the
  // mint-button block when the connected wallet isn't the contract owner).
  // NOT used for gating: OwnerOnly does its own staleTime:Infinity owner
  // read internally for that purpose.
  const { data: ownerAddr } = useReadContract({
    abi: licenseAbi,
    address: LICENSE_ADDR,
    functionName: "owner",
    query: { staleTime: Infinity, gcTime: Infinity },
  });

  const addrIsOffchain = isOffchainAdmin(address);
  // Once OwnerOnly has gated us in, the connected wallet is either the
  // contract owner OR an off-chain admin. If not off-chain, it must be the
  // contract owner — that's what unlocks on-chain writes.
  const canWriteOnchain = !addrIsOffchain;
  const ownerAddrStr = ownerAddr ? ownerAddr.toString() : "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Admin</span></h1>
        {addrIsOffchain && address ? <AdminAddressBanner address={address} ownerAddr={ownerAddrStr || undefined} /> : null}
        {/* 2026-06-11 wallet fix: soft-nav <Link>, NOT a raw <a href> — a raw
            anchor did a FULL-DOCUMENT reload, the only mid-session full reload
            in the app, which re-ran wagmi reconnect-on-mount against a cold/
            locked Trust extension and wiped the persisted connection (root
            cause of the "/marketing breaks the wallet for every later page"
            bug). A soft nav performs zero wallet I/O under useWalletGate's
            address-trust. ctrl/middle-click still opens a new tab. */}
        <Link to="/marketing" className="text-sm text-accent-cyan hover:underline">Marketing tools →</Link>
      </header>

      <div className="flex gap-0 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
        {(Object.keys(TAB_LABEL) as AdminTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "px-2 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (tab === t
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "stats"     && <AdminStats />}
      {tab === "socials"   && <AdminSocials />}
      {tab === "opsurfaces"&& <AdminOperationalSurfaces />}
      {tab === "audit"     && <AdminAudit />}
      {tab === "refunds"   && <AdminRefunds />}
      {tab === "updates"   && <AdminUpdatesPlus />}
      {tab === "whitelists" && <AdminWhitelists canWriteOnchain={canWriteOnchain} ownerAddress={ownerAddrStr} />}
      {tab === "opsmanual" && <AdminOpsManual />}
      {tab === "citations" && <AdminCitations />}
      {tab === "banner"    && <AdminSiteToggles />}
      {tab === "payments"  && <AdminPaymentConfig />}
      {tab === "blacklists"&& <AdminBlacklists />}
      {tab === "heartbeat" && <AdminHeartbeat />}
      {tab === "vizzes"    && <AdminVizzes />}
    </div>
  );
}

// Pipeline vizzes — admin-only reference card. Daniel: "dont think we need
// this on the page ... but do want it under admin somewhere for info ..
// excl. the user instructions but give me the link etc in admin not on
// user page". Lists every standalone viz route + URL params for screen-
// recording into GIF/MP4 for social posts.
function AdminVizzes(): JSX.Element {
  const VIZZES: ReadonlyArray<{
    readonly path: string;
    readonly name: string;
    readonly step: string;
    readonly description: string;
    readonly params: ReadonlyArray<{ readonly key: string; readonly desc: string }>;
  }> = [
    {
      // 0.5.0 — Daniel 2026-05-30: end-to-end canned demo at the top of
      // the list. Strings all 7 step-vizzes together in one continuous
      // timeline. The canonical "full proof in motion" reference.
      path: "/viz/pipeline",
      name: "End-to-end pipeline · the full proof in motion",
      step: "all",
      description: "All 8 step-vizzes strung together in sequence. Per-step dwell tuned so heavy vizzes (Argon, Shamir) get time. The master canned demo — admin reference + marketing GIF source.",
      params: [
        { key: "speed", desc: "playback speed (0.25-3), default 1" },
        { key: "theme", desc: "cyan | emerald" },
      ],
    },
    {
      path: "/shamir",
      name: "Shamir polynomial",
      step: "split",
      description: "K-of-N threshold-scheme math. Vault-cards with seed-word content; polynomial fits/hides/reveals.",
      params: [
        { key: "n", desc: "share count (3-9), default 5" },
        { key: "k", desc: "threshold (2-N), default 3" },
        { key: "secret", desc: "secret value at P(0) (5-95), default 73" },
        { key: "speed", desc: "playback speed (0.25-3), default 1" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "kind", desc: "seed | letter | image | document | noise (vault content style)" },
        { key: "controls", desc: "0 to hide controls" },
        { key: "presets", desc: "0 to hide threshold-scheme presets" },
      ],
    },
    {
      path: "/argon",
      name: "Argon2id memory grid",
      step: "kdf",
      description: "Memory-hard password derivation. 16×8 grid fills, blends across rounds via data-dependent reads, extracts 32-byte master key. Live stat: '1M guesses = 64 TB of RAM.'",
      params: [
        { key: "speed", desc: "playback speed (0.25-3)" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
    {
      path: "/aead",
      name: "AEAD entropy",
      step: "enc",
      description: "XChaCha20-Poly1305 / AES-256-GCM. Plaintext grid (structured) → ciphertext grid (uniform random noise).",
      params: [
        { key: "speed", desc: "playback speed" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
    {
      path: "/restore-viz",
      name: "Restore loop",
      step: "restore",
      description: "Gather K shares → decrypt → Lagrange interpolate → master key recovered → content decrypted.",
      params: [
        { key: "n", desc: "share count" },
        { key: "k", desc: "threshold" },
        { key: "speed", desc: "playback speed" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
    {
      path: "/roundtrip",
      name: "Round-trip verify",
      step: "compare",
      description: "32-byte original vs recovered strip. Scanner cursor matches each byte, ends with INTEGRITY VERIFIED banner.",
      params: [
        { key: "speed", desc: "playback speed" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
    {
      path: "/bip39",
      name: "BIP-39 mnemonic generation",
      step: "gen + valid",
      description: "128 bits of entropy materialise as 16 colored byte cells → coalesce into 12 BIP-39 word tiles → last 4 checksum bits glow green when verified.",
      params: [
        { key: "speed", desc: "playback speed (0.25-3)" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
    {
      path: "/manifest",
      name: "Manifest signing (SHA-256 + Ed25519)",
      step: "manifest",
      description: "SHA-256 collapses the manifest to a 256-bit radial iris fingerprint → Ed25519 hex stamp descends with momentum + light burst on impact → 64-byte signature band materialises → concentric verify rings.",
      params: [
        { key: "speed", desc: "playback speed (0.25-3)" },
        { key: "theme", desc: "cyan | emerald" },
        { key: "controls", desc: "0 to hide controls" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold font-display mb-2"><span className="grad">Pipeline viz showcase URLs</span></h2>
        <p className="text-sm text-text-on-dark/85">
          Each standalone viz has a chromeless full-bleed route designed for screen-recording into GIF / MP4 for social posts.
          Open the route, optionally hide controls/presets via URL params, then screen-record with OBS / Loom / iOS native / Chrome built-in.
          The same viz also runs embedded on /info → Architecture → Technology (with controls + presets visible by default).
        </p>
        <p className="text-xs text-text-muted mt-2">
          All seven vizzes also stitch together on /prove-it as the live pipeline visualisation — driven by the actual crypto run.
        </p>
      </div>

      {VIZZES.map((v) => (
        <div key={v.path} className="card">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold font-display">{v.name}</h3>
              <p className="text-xs text-text-muted">{v.description}</p>
            </div>
            <span className="tier-badge bg-bg-surface text-text-muted font-mono text-[10px]">step: {v.step}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {/* All three links pre-include ?demo=record so the DemoGate
                lets us straight through. Admin should never see the gate
                landing — the gate exists for public visitors only. */}
            <a href={`${v.path}?demo=record`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs">Open {v.path} ↗</a>
            <a href={`${v.path}?demo=record&controls=0&theme=cyan`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs">Recording-ready (cyan)</a>
            <a href={`${v.path}?demo=record&controls=0&theme=emerald`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs">Recording-ready (emerald)</a>
          </div>
          <div className="text-xs text-text-on-dark/85">
            <div className="font-mono text-accent-cyan mb-1">URL params:</div>
            <ul className="space-y-0.5 ml-3">
              {v.params.map((p) => (
                <li key={p.key} className="flex gap-2">
                  <code className="text-accent-cyan whitespace-nowrap">?{p.key}=</code>
                  <span className="text-text-muted">{p.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StatsResponse {
  readonly windowDays: number;
  readonly sinceYmd: string;
  readonly untilYmd?: string;
  readonly totalPageViews: number;
  readonly byRoute: readonly { readonly route: string; readonly total: number }[];
  readonly byDay: readonly { readonly ymd: string; readonly total: number }[];
  readonly events?: {
    readonly byName: readonly { readonly name: string; readonly total: number }[];
    readonly byDay: readonly { readonly ymd: string; readonly name: string; readonly total: number }[];
  };
  readonly countries?: readonly { readonly country: string; readonly total: number }[];
  readonly sources?: readonly { readonly src: string; readonly total: number }[];
  readonly referralsAllTime?: { readonly count: number; readonly cutMicro: number };
  readonly licencesByTier?: readonly { readonly tier: string; readonly count: number; readonly revenueMicro: number }[];
  readonly adminGrantsByTier?: readonly { readonly tier: string; readonly count: number }[];
  // 0.8.0 — on-chain ground-truth traction (all-time, permanent public history).
  readonly traction?: {
    readonly nokDesignations: { readonly mints: number; readonly vaults: number; readonly owners: number };
    readonly activations: { readonly total: number; readonly vaults: number };
    readonly recoveries: { readonly total: number; readonly wallets: number };
    readonly restore: { readonly vaults: number; readonly byResult: readonly { readonly result: string; readonly rows: number }[] };
    readonly heartbeatOwners: { readonly allTime: number; readonly last30d: number };
    readonly paidLicencesTotal: number;
    // 0.6.0 (Form B analytics) — the 6 newly-indexed Oracle+Escrow streams.
    readonly onchainExtra?: {
      readonly onchainHeartbeats: { readonly wallets: number; readonly total: number };
      readonly deadManFires: number;
      readonly pendingActivations: number;
      readonly escrow: { readonly designations: number; readonly claims: number; readonly revocations: number };
    };
  };
  // 0.8.0 — on-chain indexer freshness (how far the event crawl has reached).
  readonly indexer?: {
    readonly lastBlock: number | null;
    readonly chainHead: number | null;
    readonly behind: number | null;
    readonly deployBlock: number;
  };
}

interface FounderStats { readonly cap: number; readonly claimed: number; readonly remaining: number }

// Event catalogue: label + plain-English explainer (shown on the (i) hover)
// + a colour for that event's mini day-bar chart. Order drives the grid.
// 0.5.0 — Pin Asserro (/corporate) and /whitelabel into the page-views
// byRoute list even when the server returned zero rows for them. They
// are highest-marketing-value routes; we want them visible in the
// dashboard the moment a single visit lands, not the moment they cross
// some natural ordering threshold.
function pinAsserroAndWhitelabel(
  rows: readonly { readonly route: string; readonly total: number }[],
): readonly { readonly route: string; readonly total: number }[] {
  const pinned = ["/corporate", "/whitelabel"];
  const seen = new Set(rows.map((r) => r.route));
  const result = rows.slice();
  for (const p of pinned) {
    if (!seen.has(p)) result.push({ route: p, total: 0 });
  }
  // Re-sort descending by total so the pinned 0-rows sit at the bottom of
  // the bar list rather than breaking the natural ordering.
  return result.slice().sort((a, b) => b.total - a.total);
}

// 0.6.0 — Daniel 2026-05-31: pin X / Telegram / LinkedIn into the sources
// bar list even when the server returned zero rows. They're the channels
// the social-outreach campaigns push to (see outreachChannels.ts) and
// Daniel wants them visible in the dashboard the moment a single visit
// lands — not the moment they cross some natural ordering threshold.
function pinSocialSources(
  rows: readonly { readonly src: string; readonly total: number }[],
): readonly { readonly src: string; readonly total: number }[] {
  const pinned = ["src_twitter", "src_telegram", "src_linkedin"];
  const seen = new Set(rows.map((r) => r.src));
  const result = rows.slice();
  for (const p of pinned) {
    if (!seen.has(p)) result.push({ src: p, total: 0 });
  }
  return result.slice().sort((a, b) => b.total - a.total);
}

const EVENT_META: Record<string, { label: string; desc: string; color: string }> = {
  unique_view:      { label: "Unique visitors",   desc: "First load on a browser each UTC day, de-duplicated entirely in the visitor's own browser — nothing identifying is ever sent.", color: "#2dd4bf" },
  wallet_connect:   { label: "Wallet connects",   desc: "A wallet was connected (counted once per browser per day). Your own admin/treasury wallets are excluded so this measures real users.", color: "#7dd3fc" },
  pwa_install:      { label: "PWA installs",       desc: "A visitor accepted the browser's 'install app' prompt.", color: "#a78bfa" },
  free_tier_use:    { label: "Free-tier vaults",  desc: "A Free-tier (no next-of-kin) vault was enrolled.", color: "#34d399" },
  paid_tier_use:    { label: "Paid-tier vaults",  desc: "A paid / NoK-capable (Standard+) vault was enrolled.", color: "#10b981" },
  prove_it_run:     { label: "Prove-It (math)",   desc: "The /prove-it/math dashboard ran the real crypto pipeline on throwaway data.", color: "#fbbf24" },
  prove_airgap_run: { label: "Prove-It (airgap)", desc: "The /prove-it/airgap test-fire panel was used. Each click attempts a deliberate exfil to verify the airgap holds. (Coming with the airgap-proof build.)", color: "#f59e0b" },
  how_it_works_run: { label: "How-it-works runs", desc: "A how-it-works / process-diagram demo was viewed.", color: "#f472b6" },
  // 0.8.0 traction events. vault_created/enrol_completed/nok_designated are
  // offline-durable (replayed on reconnect after an airgap session), so they
  // capture FREE-tier vaults that never touch the chain.
  vault_created:    { label: "Vaults created",    desc: "A vault was actually written to disk (any tier — including Free vaults that mint nothing on-chain). Airgap-durable: a vault stored offline replays this beacon when the browser reconnects.", color: "#22d3ee" },
  enrol_completed:  { label: "Enrolments done",   desc: "The Enrol wizard reached a stored vault. Pair with 'Enrolments started' to read the completion funnel.", color: "#06b6d4" },
  enrol_started:    { label: "Enrolments started", desc: "A user entered the Enrol wizard for any vault kind.", color: "#38bdf8" },
  restore_run:      { label: "Restores done",     desc: "A Restore / heir-restore drill rebuilt a vault in-browser (success).", color: "#4ade80" },
  restore_failed:   { label: "Restores failed",   desc: "A Restore / heir-restore drill ended in failure (wrong password, corrupted/incomplete shares). Airgap-durable.", color: "#fb7185" },
  heartbeat_ping:   { label: "Liveness pings",    desc: "A user proved they're alive from the app (signed-and-posted or on-chain selfHeartbeat), counted once per browser per day.", color: "#c084fc" },
  nok_designated:   { label: "NoK designated",    desc: "A next-of-kin designation was broadcast from the app. The on-chain indexer counts the mint independently for the permanent history.", color: "#818cf8" },
  // 0.8.0 enrol funnel checkpoints (fired once per step per session). Read these
  // in order to see where enrolment leaks: started → airgap → content → [auto
  // split] → shares → drill → nok → completed.
  enrol_reached_airgap:  { label: "Funnel · reached go-offline", desc: "Reached the 'go offline / airgap' step in the enrol wizard. The first real friction point.", color: "#fcd34d" },
  enrol_reached_content: { label: "Funnel · reached secret-entry", desc: "Reached the secret-entry step (offline). Got past the airgap ask.", color: "#fbbf24" },
  enrol_reached_shares:  { label: "Funnel · reached store-shares", desc: "Reached the 'store your share locations' step — the heaviest manual step (save/distribute the files).", color: "#f59e0b" },
  enrol_reached_drill:   { label: "Funnel · reached test-drill", desc: "Reached the test-restore drill step.", color: "#f97316" },
  enrol_reached_nok:     { label: "Funnel · reached next-of-kin", desc: "Reached the next-of-kin designation step.", color: "#ea580c" },
};
const EVENT_ORDER = ["unique_view", "wallet_connect", "pwa_install", "vault_created", "free_tier_use", "paid_tier_use", "nok_designated", "enrol_started", "enrol_reached_airgap", "enrol_reached_content", "enrol_reached_shares", "enrol_reached_drill", "enrol_reached_nok", "enrol_completed", "restore_run", "restore_failed", "heartbeat_ping", "prove_it_run", "prove_airgap_run", "how_it_works_run"] as const;

const SOURCE_LABEL: Record<string, string> = {
  src_direct: "Direct / typed / bookmark", src_google: "Google", src_bing: "Bing",
  src_duckduckgo: "DuckDuckGo", src_yahoo: "Yahoo", src_twitter: "X / Twitter",
  src_reddit: "Reddit", src_facebook: "Facebook", src_linkedin: "LinkedIn",
  src_instagram: "Instagram", src_youtube: "YouTube", src_github: "GitHub",
  src_telegram: "Telegram", src_discord: "Discord", src_medium: "Medium",
  src_chatgpt: "ChatGPT", src_claude: "Claude", src_perplexity: "Perplexity",
  src_gemini: "Gemini",
  src_google_app: "Google Play app", src_android_app: "Android app (other)",
  src_other: "Other referrer",
};
function sourceLabel(s: string): string { return SOURCE_LABEL[s] ?? s.replace(/^src_/, ""); }

const COUNTRY_NAME: Record<string, string> = {
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France", CA: "Canada",
  AU: "Australia", IN: "India", NL: "Netherlands", CH: "Switzerland", SG: "Singapore",
  JP: "Japan", BR: "Brazil", ES: "Spain", IT: "Italy", PT: "Portugal", IE: "Ireland",
  SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland", PL: "Poland", AT: "Austria",
  BE: "Belgium", AE: "UAE", ZA: "South Africa", MX: "Mexico", AR: "Argentina",
  NG: "Nigeria", KE: "Kenya", PH: "Philippines", ID: "Indonesia", KR: "South Korea",
  CN: "China", HK: "Hong Kong", TW: "Taiwan", TR: "Turkey", UA: "Ukraine", RU: "Russia",
  NZ: "New Zealand", IL: "Israel", SA: "Saudi Arabia",
};
function countryLabel(cc: string): string {
  if (cc === "ZZ" || cc === "XX") return "Unknown / hidden";
  return COUNTRY_NAME[cc] ?? cc;
}
function countryFlag(cc: string): string {
  if (!/^[A-Z]{2}$/.test(cc) || cc === "ZZ" || cc === "XX") return "🌐";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// Tiny hand-rolled day-bar sparkline (no chart dep — npm install is broken,
// and this matches the app's other hand-rolled SVG diagrams). Zero bars are
// drawn faint so the date axis is still legible.
function MiniBars({ values, color }: { readonly values: readonly number[]; readonly color: string }): JSX.Element {
  const max = Math.max(1, ...values);
  const n = values.length;
  const W = 100, H = 24, gap = n > 60 ? 0 : 0.6;
  const bw = n > 0 ? (W - gap * (n - 1)) / n : W;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-6 mt-2" aria-hidden="true">
      {values.map((v, i) => {
        const h = Math.max(0.8, (v / max) * (H - 1));
        return <rect key={i} x={i * (bw + gap)} y={H - h} width={Math.max(0.4, bw)} height={h} fill={color} opacity={v === 0 ? 0.16 : 0.9} />;
      })}
    </svg>
  );
}

// A horizontal labelled bar list (countries / sources / routes).
function BarList({ rows, max, color }: {
  readonly rows: readonly { readonly key: string; readonly label: string; readonly total: number }[];
  readonly max: number;
  readonly color: string;
}): JSX.Element {
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-3">
          <span className="text-text-on-dark/80 w-40 shrink-0 truncate text-xs">{r.label}</span>
          <div className="flex-1 bg-bg-deepest rounded h-5 overflow-hidden border border-bg-surface relative">
            <div className="h-full" style={{ width: `${(r.total / max) * 100}%`, backgroundColor: color, opacity: 0.55 }} />
            <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-bold text-text-on-dark tabular-nums">{r.total.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminStats(): JSX.Element {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
  const [days, setDays] = useState(30);
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [founder, setFounder] = useState<FounderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(query: string): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const [sr, fr] = await Promise.all([
        fetch(`${API_BASE}/admin/stats?${query}`),
        fetch(`${API_BASE}/founder/stats`).catch(() => null),
      ]);
      if (!sr.ok) throw new Error(`HTTP ${sr.status}`);
      setData((await sr.json()) as StatsResponse);
      if (fr && fr.ok) { try { setFounder((await fr.json()) as FounderStats); } catch { /* optional */ } }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function loadPreset(d: number): void { setCustom(false); setDays(d); void load(`days=${d}`); }
  function applyRange(): void {
    if (!from) return;
    setCustom(true);
    void load(`from=${from}${to ? `&to=${to}` : ""}`);
  }

  // Initial load — once, after mount (NOT during render).
  useEffect(() => { void load(`days=30`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Day axis (ascending) shared by every event sparkline so bars align.
  const dayAxisAsc = data ? [...data.byDay].map((d) => d.ymd).sort() : [];
  const eventDayMap = new Map<string, number>();
  data?.events?.byDay.forEach((d) => eventDayMap.set(`${d.name}|${d.ymd}`, d.total));
  const eventTotal = (name: string): number => data?.events?.byName.find((e) => e.name === name)?.total ?? 0;
  const eventSeries = (name: string): number[] => dayAxisAsc.map((ymd) => eventDayMap.get(`${name}|${ymd}`) ?? 0);

  const refCount = data?.referralsAllTime?.count ?? 0;
  const refUsdc = data?.referralsAllTime ? data.referralsAllTime.cutMicro / 1e6 : 0;

  const licTiers = data?.licencesByTier ?? [];
  const grantsByTier = data?.adminGrantsByTier ?? [];
  const totalLicences = licTiers.reduce((a, t) => a + t.count, 0);
  const totalGrants = grantsByTier.reduce((a, t) => a + t.count, 0);
  const grossRevenue = licTiers.reduce((a, t) => a + t.revenueMicro, 0) / 1e6;
  const tierLabel = (tier: string): string => TIER_NAME[tier] ?? `Tier ${tier}`;

  const headline: { label: string; value: string; sub?: string; hint: string; color: string }[] = [
    { label: "Licences sold", value: totalLicences.toLocaleString(), sub: totalGrants > 0 ? `+ ${totalGrants} comped` : undefined, hint: "Paid licence mints across all tiers (all-time, on-chain). Admin/whitelist (comped) grants are counted separately, not here.", color: "#5eead4" },
    { label: "Gross revenue", value: `$${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, hint: "Gross USDC buyers paid across all paid licence mints (all-time). Referral discounts are already reflected; this is what users paid, before the referrer split.", color: "#10b981" },
    { label: "Founders", value: founder ? `${founder.claimed.toLocaleString()}` : "—", sub: founder ? `of ${founder.cap.toLocaleString()} · ${founder.remaining.toLocaleString()} left` : undefined, hint: "Paid founder licences claimed vs the 10,000 cap (on-chain; admin grants don't count). All-time, not windowed.", color: "#fbbf24" },
    { label: "Unique visitors", value: eventTotal("unique_view").toLocaleString(), hint: EVENT_META.unique_view!.desc, color: "#2dd4bf" },
    { label: "Wallet connects", value: eventTotal("wallet_connect").toLocaleString(), hint: EVENT_META.wallet_connect!.desc, color: "#a78bfa" },
    { label: "Page views", value: (data?.totalPageViews ?? 0).toLocaleString(), hint: "Total page loads in this window (route + day counts summed). Includes repeat visits.", color: "#7dd3fc" },
    { label: "Referrals", value: refCount.toLocaleString(), hint: "Total referred mints attributed on-chain (all-time, not limited to the window).", color: "#34d399" },
    { label: "Referral payouts", value: `$${refUsdc.toFixed(2)}`, hint: "Total referrer earnings paid/credited on-chain in USDC (all-time).", color: "#10b981" },
  ];

  const maxRoute = data ? Math.max(1, ...data.byRoute.map((r) => r.total)) : 1;
  const maxDay = data ? Math.max(1, ...data.byDay.map((r) => r.total)) : 1;
  const maxCountry = data?.countries?.length ? Math.max(1, ...data.countries.map((c) => c.total)) : 1;
  const maxSource = data?.sources?.length ? Math.max(1, ...data.sources.map((s) => s.total)) : 1;

  function downloadCsv(): void {
    if (!data) return;
    const rows: string[][] = [["Section", "Key", "Value"]];
    rows.push(["Summary", "Total page views", String(data.totalPageViews)]);
    rows.push(["Summary", "Unique visitors", String(eventTotal("unique_view"))]);
    rows.push(["Summary", "Wallet connects", String(eventTotal("wallet_connect"))]);
    if (founder) {
      rows.push(["Founders", "Claimed", String(founder.claimed)]);
      rows.push(["Founders", "Cap", String(founder.cap)]);
      rows.push(["Founders", "Remaining", String(founder.remaining)]);
    }
    rows.push(["Referrals (all-time)", "Count", String(refCount)]);
    rows.push(["Referrals (all-time)", "Payout USDC", refUsdc.toFixed(2)]);
    if (data.traction) {
      const t = data.traction;
      rows.push(["Traction (on-chain, all-time)", "NoK designated — vaults", String(t.nokDesignations.vaults)]);
      rows.push(["Traction (on-chain, all-time)", "NoK designated — SBT mints", String(t.nokDesignations.mints)]);
      rows.push(["Traction (on-chain, all-time)", "NoK designated — owners", String(t.nokDesignations.owners)]);
      rows.push(["Traction (on-chain, all-time)", "Inheritances fired — vaults", String(t.activations.vaults)]);
      rows.push(["Traction (on-chain, all-time)", "Recoveries initiated", String(t.recoveries.total)]);
      rows.push(["Traction (on-chain, all-time)", "Active owners — all-time", String(t.heartbeatOwners.allTime)]);
      rows.push(["Traction (on-chain, all-time)", "Active owners — last 30d", String(t.heartbeatOwners.last30d)]);
      if (t.onchainExtra) {
        const ox = t.onchainExtra;
        rows.push(["Traction (on-chain, all-time)", "On-chain liveness — wallets", String(ox.onchainHeartbeats.wallets)]);
        rows.push(["Traction (on-chain, all-time)", "On-chain liveness — heartbeats", String(ox.onchainHeartbeats.total)]);
        rows.push(["Traction (on-chain, all-time)", "Dead-man fires", String(ox.deadManFires)]);
        rows.push(["Traction (on-chain, all-time)", "Queued activations", String(ox.pendingActivations)]);
        rows.push(["Traction (on-chain, all-time)", "Escrow — designations", String(ox.escrow.designations)]);
        rows.push(["Traction (on-chain, all-time)", "Escrow — claims", String(ox.escrow.claims)]);
        rows.push(["Traction (on-chain, all-time)", "Escrow — revocations", String(ox.escrow.revocations)]);
      }
      t.restore.byResult.forEach((r) => rows.push(["Traction (restore audit, all-time)", `restore ${r.result}`, String(r.rows)]));
    }
    licTiers.forEach((t) => {
      rows.push(["Licences sold (paid)", tierLabel(t.tier), String(t.count)]);
      rows.push(["Licence gross USDC", tierLabel(t.tier), (t.revenueMicro / 1e6).toFixed(2)]);
    });
    grantsByTier.forEach((t) => rows.push(["Whitelist grants (comped)", tierLabel(t.tier), String(t.count)]));
    EVENT_ORDER.forEach((n) => rows.push(["Event", EVENT_META[n]!.label, String(eventTotal(n))]));
    (data.countries ?? []).forEach((c) => rows.push(["Country", `${c.country} ${countryLabel(c.country)}`, String(c.total)]));
    (data.sources ?? []).forEach((s) => rows.push(["Source", sourceLabel(s.src), String(s.total)]));
    data.byRoute.forEach((r) => rows.push(["Route", r.route, String(r.total)]));
    [...data.byDay].sort((a, b) => a.ymd.localeCompare(b.ymd)).forEach((d) => rows.push(["Views by day", d.ymd, String(d.total)]));

    const header = [
      `# NoKLock analytics export`,
      `# Generated: ${new Date().toISOString()}`,
      `# Window: ${data.sinceYmd} .. ${data.untilYmd ?? "today"} (${data.windowDays} days)`,
      `# Privacy: zero-PII aggregate counts only — no IP, no user-agent, no wallet address.`,
      `# Country = Cloudflare-derived 2-letter code (raw IP never stored); ZZ/XX = unknown/hidden.`,
      `# Referrals are on-chain all-time totals (not limited to the window).`,
      ``,
    ].join("\n");
    const csv = header + rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noklock-analytics_${data.sinceYmd}_to_${data.untilYmd ?? "today"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Daniel 2026-05-28: quick links to the public-facing reseller /
          partner / corporate pages — saves the round-trip to nav. */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent-cyan font-bold">Public pages</span>
          <a href="/corporate" target="_blank" rel="noopener noreferrer" className="text-xs font-mono px-3 py-1.5 rounded border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">NoKLock.corporate ↗</a>
          <a href="/whitelabel" target="_blank" rel="noopener noreferrer" className="text-xs font-mono px-3 py-1.5 rounded border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10">NoKLock.white ↗</a>
          <a href="/refer?tab=community-owners" target="_blank" rel="noopener noreferrer" className="text-xs font-mono px-3 py-1.5 rounded border border-accent-teal/40 text-accent-teal hover:bg-accent-teal/10">Partners (Community Owners) ↗</a>
          <a href="/marketing" target="_blank" rel="noopener noreferrer" className="text-xs font-mono px-3 py-1.5 rounded border border-bg-surface text-text-on-dark/80 hover:bg-bg-surface">Marketing cockpit ↗</a>
        </div>
      </div>

      {/* Controls + window */}
      <div className="card">
        <div className="flex justify-between items-baseline flex-wrap gap-2 mb-3">
          <h2 className="font-bold font-display">Site stats</h2>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {[1, 7, 30, 90, 365].map((d) => (
              <button key={d}
                onClick={() => loadPreset(d)}
                className={`px-2 py-1 rounded ${!custom && days === d ? "bg-accent-cyan/20 text-accent-cyan font-bold" : "bg-bg-deepest text-text-muted hover:text-text-on-dark"}`}>
                {d}d
              </button>
            ))}
            <span className="text-text-muted/50">·</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)}
              className="bg-bg-deepest border border-bg-surface rounded px-1.5 py-1 text-text-on-dark" aria-label="From date" />
            <span className="text-text-muted">→</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)}
              className="bg-bg-deepest border border-bg-surface rounded px-1.5 py-1 text-text-on-dark" aria-label="To date" />
            <button onClick={applyRange} disabled={!from}
              className={`px-2 py-1 rounded ${custom ? "bg-accent-cyan/20 text-accent-cyan font-bold" : "bg-bg-deepest text-text-muted hover:text-text-on-dark"} disabled:opacity-40`}>
              Apply
            </button>
            <button onClick={downloadCsv} disabled={!data}
              className="px-2 py-1 rounded bg-bg-deepest text-accent-green hover:text-text-on-dark disabled:opacity-40" title="Download this window as CSV">
              ⬇ CSV
            </button>
          </div>
        </div>
        <p className="text-xs text-text-muted mb-3">
          Aggregate counters from Form B (<code>/v1/admin/stats</code>). Zero-PII: counts per day only — no IP, no user-agent, no cookies, no per-user state. Your own admin/treasury wallets are excluded from visitor/connect counts.
        </p>
        {err && <div className="text-rose-400 text-sm">{err}</div>}
        {loading && <div className="text-text-muted text-sm">Loading…</div>}
        {data && (
          <div className="font-mono text-xs text-text-muted">
            Window: <span className="text-text-on-dark">{data.sinceYmd}</span> → <span className="text-text-on-dark">{data.untilYmd ?? "today"}</span> ({data.windowDays} days)
          </div>
        )}
      </div>

      {/* Headline numbers — the at-a-glance ops/sales row. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {headline.map((h) => (
          <div key={h.label} className="rounded-lg border border-bg-surface bg-bg-deepest p-2.5 flex flex-col">
            <span className="text-2xl font-bold font-display tabular-nums" style={{ color: h.color }}>{h.value}</span>
            <span className="text-[11px] text-text-muted mt-0.5 leading-snug flex items-center">{h.label}<InfoTooltip hint={h.hint} /></span>
            {h.sub && <span className="text-[10px] text-text-muted/70 mt-0.5 leading-tight">{h.sub}</span>}
          </div>
        ))}
      </div>

      {/* 0.8.0 — TRACTION: the real adoption signals. On-chain ground truth
          (all-time, permanent, un-fakeable) for designations / activations /
          recoveries / liveness, plus the FREE-tier vault count from the
          offline-durable vault_created beacon. Daniel 2026-06-15: "surface
          what matters — vaults, restores, pings — count anything and
          everything, all the on-chain history; this is golden." */}
      {data && (
        <div className="card border-accent-cyan/30">
          <h3 className="font-bold font-display mb-1 flex items-center">
            Traction
            <InfoTooltip hint="The real adoption signals. The on-chain rows are permanent public history (all-time, not windowed) and cannot be faked — they come straight from the contract event indexes. 'Vaults created' is the front-end count and includes FREE-tier vaults that mint nothing on-chain; it's offline-durable (a vault stored in airgap is counted when the browser reconnects)." />
          </h3>
          <p className="text-xs text-text-muted mb-3">
            On-chain figures are <strong>all-time</strong> (permanent, un-fakeable). <span className="text-accent-cyan">Vaults created</span> / restores / pings come from the zero-PII beacons and follow the window above.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(() => {
              const t = data.traction;
              // 0.8.0 — restores now come from the EXCLUDED restore_run/restore_failed
              // beacons (not the wallet-less segment_activity audit), so your own
              // test restores don't inflate traction — provided you've set the
              // "exclude this browser" toggle below (a restore needs no wallet, so
              // wallet-exclusion alone can't catch it). The full per-share audit
              // (incl. tests) still lives in Op Surfaces → Segment activity.
              const restoreOk = eventTotal("restore_run");
              const restoreBad = eventTotal("restore_failed");
              const tiles: { label: string; value: string; sub?: string; hint: string; color: string }[] = [
                { label: "Wallets connected", value: eventTotal("wallet_connect").toLocaleString(), sub: "this window", hint: "Wallet-connect events fired from the app in this window (zero-PII beacon). Top of the funnel — connecting precedes enrolling.", color: "#a3e635" },
                { label: "Enrols started", value: eventTotal("enrol_started").toLocaleString(), sub: "this window", hint: "Users who entered the Enrol wizard (any tier). Funnel-pair with 'Vaults created' — the gap between them is the enrol drop-off.", color: "#38bdf8" },
                { label: "Vaults created", value: eventTotal("vault_created").toLocaleString(), sub: "incl. Free (this window)", hint: EVENT_META.vault_created!.desc, color: "#22d3ee" },
                { label: "NoK designated", value: t ? t.nokDesignations.vaults.toLocaleString() : "—", sub: t ? `${t.nokDesignations.mints.toLocaleString()} SBTs · ${t.nokDesignations.owners.toLocaleString()} owners (chain)` : undefined, hint: "Distinct vaults with a next-of-kin minted on-chain (all-time). A designation mints one soulbound SBT (Activation); M-of-N quorum vaults add a Voting SBT per heir. owners = distinct designating wallets. NOTE: on-chain numbers are NOT wallet-excluded yet, so your own test mints would count here.", color: "#818cf8" },
                { label: "Inheritances fired", value: t ? t.activations.vaults.toLocaleString() : "—", sub: t ? `${t.activations.total.toLocaleString()} activations (chain)` : undefined, hint: "Distinct vaults where the dead-man's switch / heir-claim actually fired on-chain (NoKActivated). All-time.", color: "#fbbf24" },
                { label: "Active owners", value: t ? t.heartbeatOwners.last30d.toLocaleString() : "—", sub: t ? `${t.heartbeatOwners.allTime.toLocaleString()} all-time` : undefined, hint: "Distinct wallets that proved liveness via a heartbeat POSTed to Form B, last 30 days / all-time. A trustless on-chain selfHeartbeat() that bypasses Form B is counted separately under 'On-chain liveness'.", color: "#c084fc" },
                { label: "Restores (ok)", value: restoreOk.toLocaleString(), sub: restoreBad > 0 ? `${restoreBad.toLocaleString()} failed` : undefined, hint: "Completed restore/heir-restore drills in this window (restore_run / restore_failed beacons). NOTE: a restore is wallet-less, so your OWN test drills can't be filtered out — treat early numbers as inclusive of your testing. The full per-share audit is in Op Surfaces → Segment activity.", color: "#4ade80" },
                { label: "Recoveries", value: t ? t.recoveries.total.toLocaleString() : "—", sub: t ? `${t.recoveries.wallets.toLocaleString()} wallets (chain)` : undefined, hint: "Lost-wallet social-recovery flows initiated on-chain (RecoveryInitiated). All-time.", color: "#34d399" },
                // 0.6.0 (Form B analytics) — the 6 newly-indexed Oracle+Escrow streams.
                { label: "On-chain liveness", value: t?.onchainExtra ? t.onchainExtra.onchainHeartbeats.wallets.toLocaleString() : "—", sub: t?.onchainExtra ? `${t.onchainExtra.onchainHeartbeats.total.toLocaleString()} heartbeats (chain)` : undefined, hint: "TRUE on-chain liveness from the Oracle HeartbeatRecorded stream (distinct wallets / total heartbeats, all-time). Catches a trustless selfHeartbeat() that never touches Form B — complements 'Active owners' (off-chain pings).", color: "#2dd4bf" },
                { label: "Dead-man fires", value: t?.onchainExtra ? t.onchainExtra.deadManFires.toLocaleString() : "—", hint: "Dead-man switches that actually FIRED on-chain (Oracle DeadManFired). All-time. Distinct from 'Inheritances fired' (NoKActivated SBT count) — this counts the switch-fire events.", color: "#f87171" },
                { label: "Queued activations", value: t?.onchainExtra ? t.onchainExtra.pendingActivations.toLocaleString() : "—", hint: "Activation tokens ARMED into the switch (Oracle PendingActivationQueued). Reads ≈0 until self-custody owners start arming via B-3 selfQueueActivation. All-time.", color: "#fb923c" },
                { label: "Email-NoK escrow", value: t?.onchainExtra ? t.onchainExtra.escrow.designations.toLocaleString() : "—", sub: t?.onchainExtra ? `${t.onchainExtra.escrow.claims.toLocaleString()} claimed · ${t.onchainExtra.escrow.revocations.toLocaleString()} revoked` : undefined, hint: "Email-heir escrow lifecycle on-chain: designations recorded / claimed (rebound to the heir's wallet) / revoked. All-time. ≈0 until the email-NoK path opens.", color: "#a78bfa" },
              ];
              return tiles.map((h) => (
                <div key={h.label} className="rounded-lg border border-bg-surface bg-bg-deepest p-2.5 flex flex-col">
                  <span className="text-2xl font-bold font-display tabular-nums" style={{ color: h.color }}>{h.value}</span>
                  <span className="text-[11px] text-text-muted mt-0.5 leading-snug flex items-center">{h.label}<InfoTooltip hint={h.hint} /></span>
                  {h.sub && <span className="text-[10px] text-text-muted/70 mt-0.5 leading-tight">{h.sub}</span>}
                </div>
              ));
            })()}
          </div>
          {/* On-chain indexer freshness (Daniel 2026-06-15: "have all on-chain
              transx been crawled?"). Shows how far the event crawl has reached
              vs the live chain head — so "all crawled?" is a number, not a claim. */}
          {data.indexer && (() => {
            const ix = data.indexer;
            const behind = ix.behind;
            const minsBehind = behind !== null ? Math.round((behind * 2.1) / 60) : null; // Polygon ~2.1s/block
            const caught = behind !== null && behind <= 200; // ~7 min — effectively head
            return (
              <p className="text-[11px] text-text-muted mt-3 pt-2 border-t border-bg-surface/50 font-mono">
                On-chain indexer:{" "}
                {ix.lastBlock === null
                  ? <span className="text-amber-300">not started yet (no rows crawled)</span>
                  : <>indexed to block <span className="text-text-on-dark">{ix.lastBlock.toLocaleString()}</span>{ix.chainHead !== null && <> · head <span className="text-text-on-dark">{ix.chainHead.toLocaleString()}</span> · <span className={caught ? "text-accent-green" : "text-amber-300"}>{behind!.toLocaleString()} behind{minsBehind !== null ? ` (~${minsBehind} min)` : ""}{caught ? " — caught up ✓" : ""}</span></>}{ix.chainHead === null && <span className="text-text-muted"> · head unavailable (RPC) </span>}</>}
              </p>
            );
          })()}
        </div>
      )}

      {/* Licences sold by tier — the sales view. */}
      <div className="card">
        <h3 className="font-bold font-display mb-1 flex items-center">Licences sold by tier<InfoTooltip hint="Paid licence mints per tier (all-time, on-chain). Gross = USDC buyers paid for that tier (referral discounts reflected). Whitelist/comped grants are listed separately, below." /></h3>
        {licTiers.length === 0 ? (
          <p className="text-xs text-text-muted mt-1">No paid licences yet.{totalGrants > 0 ? ` ${totalGrants} comped grant(s) issued.` : ""}</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs text-left border-b border-bg-surface">
                  <th className="py-1 pr-4 font-normal">Tier</th>
                  <th className="py-1 pr-4 font-normal text-right">Sold</th>
                  <th className="py-1 font-normal text-right">Gross (USDC)</th>
                </tr>
              </thead>
              <tbody>
                {licTiers.map((t) => (
                  <tr key={t.tier} className="border-b border-bg-surface/40">
                    <td className="py-1 pr-4 text-text-on-dark">{tierLabel(t.tier)}</td>
                    <td className="py-1 pr-4 text-right tabular-nums text-text-on-dark">{t.count.toLocaleString()}</td>
                    <td className="py-1 text-right tabular-nums text-accent-teal">${(t.revenueMicro / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-1 pr-4">Total</td>
                  <td className="py-1 pr-4 text-right tabular-nums">{totalLicences.toLocaleString()}</td>
                  <td className="py-1 text-right tabular-nums text-accent-teal">${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {grantsByTier.length > 0 && (
          <p className="text-xs text-text-muted mt-2">Whitelist / comped grants: {grantsByTier.map((t) => `${tierLabel(t.tier)} ×${t.count}`).join(" · ")}</p>
        )}
      </div>

      {/* Events — full catalogue, zero-filled, each with its own day-bar chart. */}
      <div className="card">
        <h3 className="font-bold font-display mb-1">Events</h3>
        <p className="text-xs text-text-muted mb-4">
          Named-event counters — zero-PII (name + day only). Every event is listed; a 0 just means it hasn't fired in this window. Hover any <span className="text-accent-cyan">(i)</span> for what it measures. The mini chart is that event's daily trend across the window.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {EVENT_ORDER.map((name) => {
            const m = EVENT_META[name]!;
            return (
              <div key={name} className="rounded-lg border border-bg-surface bg-bg-deepest p-2.5 flex flex-col">
                <span className="text-2xl font-bold font-display tabular-nums" style={{ color: m.color }}>{eventTotal(name).toLocaleString()}</span>
                <span className="text-[11px] text-text-muted mt-0.5 leading-snug flex items-center">{m.label}<InfoTooltip hint={m.desc} /></span>
                <MiniBars values={eventSeries(name)} color={m.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Geo + sources side by side. */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold font-display mb-1 flex items-center">Top countries<InfoTooltip hint="Country of unique visitors, from Cloudflare's edge (the raw IP is never read or stored). 'Unknown' = the country header wasn't present (e.g. not proxied through Cloudflare)." /></h3>
          <p className="text-xs text-text-muted mb-3">Unique visitors by country in this window.</p>
          {data?.countries?.length
            ? <BarList color="#7dd3fc" max={maxCountry} rows={data.countries.map((c) => ({ key: c.country, label: `${countryFlag(c.country)} ${countryLabel(c.country)}`, total: c.total }))} />
            : <p className="text-xs text-text-muted">No country data yet{" "}<span className="text-text-muted/60">(needs Cloudflare in front of the API; otherwise everything reads "unknown").</span></p>}
        </div>
        <div className="card">
          <h3 className="font-bold font-display mb-1 flex items-center">Traffic sources<InfoTooltip hint="Where unique visitors came from — derived from the referring site's host only (never a full URL). 'Direct' = typed, bookmarked, or no referrer. X / Telegram / LinkedIn are always shown (even at 0) since they're the channels the social-outreach campaigns push to." /></h3>
          <p className="text-xs text-text-muted mb-3">Unique visitors by referrer in this window. X / Telegram / LinkedIn pinned (shown even at 0).</p>
          {/* 0.6.0 — pin X / Telegram / LinkedIn even when zero so the
              social-channel signal is always visible alongside organic sources. */}
          <BarList color="#34d399" max={maxSource} rows={pinSocialSources(data?.sources ?? []).map((s) => ({ key: s.src, label: sourceLabel(s.src), total: s.total }))} />
        </div>
      </div>

      {data && data.byDay.length > 0 && (
        <div className="card">
          <h3 className="font-bold font-display mb-3">Page views by day</h3>
          <div className="space-y-2">
            {data.byDay.map((d) => (
              <div key={d.ymd} className="flex items-center gap-3">
                <span className="text-text-muted font-mono text-xs w-24 shrink-0">{d.ymd}</span>
                <div className="flex-1 bg-bg-deepest rounded h-6 overflow-hidden border border-bg-surface relative">
                  <div className="h-full bg-accent-cyan/40" style={{ width: `${(d.total / maxDay) * 100}%` }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-xs font-bold text-text-on-dark tabular-nums">{d.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && data.byRoute.length > 0 && (
        <div className="card">
          <h3 className="font-bold font-display mb-3">Page views by route</h3>
          {/* 0.5.0 — Daniel 2026-05-30: always surface /corporate (Asserro)
              and /whitelabel even when their counts are 0 or 1. They're
              the highest-marketing-value routes; not seeing them in the
              list (because they fall below the natural visibility cutoff)
              is a false-negative we don't want. */}
          <BarList color="#2dd4bf" max={maxRoute} rows={pinAsserroAndWhitelabel(data.byRoute).map((r) => ({ key: r.route, label: r.route, total: r.total }))} />
        </div>
      )}
    </div>
  );
}

interface AuditReport {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly score: string | null;
  readonly contract: string | null;
  readonly added_at: number;
}

const AUDIT_API = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

// Owner-signed audit publishing. Entries persist in Form B (audit_reports)
// and render publicly on Info → Contracts. Writes require a personal_sign
// from the License-owner wallet (server verifies signer == License.owner()).
function AdminAudit(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [score, setScore] = useState("");
  const [contract, setContract] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${AUDIT_API}/audit`);
      if (!r.ok) throw new Error(`Audit service unavailable (HTTP ${r.status})`);
      const j = (await r.json()) as { reports?: AuditReport[] };
      // First-entered first (ascending), matching the public Info view.
      setAudits([...(j.reports ?? [])].sort((a, b) => a.added_at - b.added_at || a.id - b.id));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Initial load — once, after mount (NOT during render).
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(): Promise<void> {
    if (!title.trim() || !url.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const u = url.trim();
      const signature = await signMessageAsync({ message: `NoKLock audit publish: ${u}` });
      const r = await fetch(`${AUDIT_API}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: u,
          score: score.trim() || undefined,
          contract: contract.trim() || undefined,
          signature,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setTitle(""); setUrl(""); setScore(""); setContract("");
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number): Promise<void> {
    if (!confirm("Remove this audit entry? It will disappear from the public Contracts tab.")) return;
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock audit delete: ${id}` });
      const r = await fetch(`${AUDIT_API}/audit/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-bold font-display mb-3">Publish audit report</h2>
        <p className="text-text-muted text-xs mb-3">
          Stored in Form B and shown publicly on <span className="font-mono">Info → Contracts</span>. Adding/removing requires a wallet signature from the License-owner wallet (the server verifies it against <code>License.owner()</code> on-chain — no password, no shared secret).
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input type="text" placeholder="Title (e.g. SolidityScan — NoKLockLicense)"
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <input type="url" placeholder="https://… (report URL)"
            value={url} onChange={(e) => setUrl(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <input type="text" placeholder="Score / grade (optional, e.g. 92 / A)"
            value={score} onChange={(e) => setScore(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <input type="text" placeholder="Contract (optional, e.g. NoKLockLicense)"
            value={contract} onChange={(e) => setContract(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
        </div>
        <button className="btn btn-primary text-sm" onClick={() => void add()} disabled={busy || !title.trim() || !url.trim()}>
          {busy ? "Signing…" : "Sign & publish"}
        </button>
        {err && <div className="text-xs text-rose-400 mt-2">{humanizeTxError(err)}</div>}
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-3">Published reports ({audits.length})</h2>
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : audits.length === 0 ? (
          <p className="text-text-muted text-sm">No audit reports published yet. They appear on Info → Contracts once added.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {audits.map((a) => (
              <li key={a.id} className="flex justify-between items-start gap-3 border-b border-bg-surface/40 pb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{a.title} {a.score && <span className="text-accent-cyan text-xs ml-2">({a.score})</span>} {a.contract && <span className="text-text-muted text-xs ml-1">· {a.contract}</span>}</div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-xs break-all font-mono">{a.url}</a>
                  <div className="text-text-muted text-xs">{new Date(a.added_at * 1000).toISOString().slice(0, 10)}</div>
                </div>
                <button className="btn btn-secondary text-xs shrink-0" onClick={() => void remove(a.id)} disabled={busy}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Shown on the on-chain owner panels when the connected wallet is an OFF-CHAIN
// admin (Treasury) rather than the actual contract owner — those panels call
// onlyOwner functions on-chain, which would revert. Prevents the opaque
// "execution reverted" footgun (Daniel hit this minting from Treasury 2026-05-25).
function OnchainOwnerGuard({ canWrite, ownerAddress }: { readonly canWrite: boolean; readonly ownerAddress: string }): JSX.Element | null {
  if (canWrite || !ownerAddress) return null; // owner OK, or owner still loading
  const short = `${ownerAddress.slice(0, 6)}…${ownerAddress.slice(-4)}`;
  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-900/30 text-amber-100 text-sm p-3">
      ⚠ You're connected as an <strong>off-chain admin</strong>, not the contract owner. This action runs on-chain as <code>onlyOwner</code> and <strong>will revert</strong>. Connect the <strong>Admin (owner) wallet</strong> <span className="font-mono">{short}</span> to do on-chain mints/sets. (Off-chain admin can still publish Updates / Audit / notes / citations / toggles.)
    </div>
  );
}

// -----------------------------------------------------------------------------
// AdminWhitelists — Daniel 2026-06-03 (Admin 0.7.0). Single top-level
// "Whitelists" tab that holds three sub-tabs: Mint / Minted / Grants.
// Default sub-tab = Mint. Sub-tab state stays internal; the page never
// had public sub-routes for whitelist (the old top-level tabs were keys
// in this same component, not router paths), so no App.tsx wiring needed.
// -----------------------------------------------------------------------------
type WhitelistSubTab = "mint" | "minted" | "grants";

const WHITELIST_SUBTAB_LABEL: Record<WhitelistSubTab, string> = {
  mint:   "Mint",
  minted: "Minted",
  grants: "Grants",
};

function AdminWhitelists({ canWriteOnchain, ownerAddress }: { readonly canWriteOnchain: boolean; readonly ownerAddress: string }): JSX.Element {
  const [sub, setSub] = useState<WhitelistSubTab>("mint");
  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
        {(Object.keys(WHITELIST_SUBTAB_LABEL) as WhitelistSubTab[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSub(s)}
            className={
              "px-3 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (sub === s
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {WHITELIST_SUBTAB_LABEL[s]}
          </button>
        ))}
      </div>
      {sub === "mint" && (
        <>
          <AdminWhitelist canWriteOnchain={canWriteOnchain} ownerAddress={ownerAddress} />
          <AdminMintability canWriteOnchain={canWriteOnchain} ownerAddress={ownerAddress} />
        </>
      )}
      {sub === "minted" && <AdminWhitelistMinted ownerAddress={ownerAddress} />}
      {sub === "grants" && <AdminWhitelistGrants />}
    </div>
  );
}

// AdminWhitelistMinted — Daniel 2026-06-03 (Admin 0.7.0). Read-only list of
// every adminMint grant from /v1/index/grants (LicenceAdminMinted events).
// Shows recipient · tier · timestamp · tx · minter. The "minter" column is
// the current contract owner — the contract only accepts adminMint from
// owner() per Ownable2Step, so the on-chain signer of every row IS the
// current owner (or the owner at the time, if ownership has rotated; the
// tx link is the immutable proof). Companion to AdminWhitelistGrants
// (which keeps the editable off-chain note); this view is for at-a-glance
// "who got what, when" without any edit affordances.
function AdminWhitelistMinted({ ownerAddress }: { readonly ownerAddress: string }): JSX.Element {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`${FORMB_API}/index/grants`);
        if (!r.ok) throw new Error(`Grants index unavailable (HTTP ${r.status})`);
        const j = (await r.json()) as { grants?: Grant[] };
        const out: Grant[] = Array.isArray(j.grants) ? [...j.grants] : [];
        out.sort((x, y) => y.mintedAt - x.mintedAt);
        if (!cancelled) setGrants(out);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const minter = ownerAddress || "—";
  const minterShort = ownerAddress ? `${ownerAddress.slice(0, 6)}…${ownerAddress.slice(-4)}` : "—";

  return (
    <div className="card space-y-3">
      <h2 className="font-bold font-display">Minted whitelist addresses</h2>
      <p className="text-text-muted text-sm">
        Every wallet that has been granted a free licence via <code>adminMint</code> — read live from on-chain
        <code> LicenceAdminMinted</code> events (most recent first). The <em>minter</em> is the contract owner
        (only address the contract accepts for <code>adminMint</code>); the tx link is the on-chain proof of the
        exact signer at the time. For the editable off-chain admin note per grant, see the <strong>Grants</strong> sub-tab.
      </p>
      {err && <div className="text-xs text-rose-400">{err}</div>}
      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : grants.length === 0 ? (
        <p className="text-text-muted text-sm">No adminMint grants found on-chain yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-muted border-b border-bg-surface/60">
                <th className="py-1 pr-3 font-normal">Recipient</th>
                <th className="py-1 pr-3 font-normal">Tier</th>
                <th className="py-1 pr-3 font-normal">When</th>
                <th className="py-1 pr-3 font-normal">Minter (contract owner)</th>
                <th className="py-1 pr-3 font-normal">Tx</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.key} className="border-b border-bg-surface/30 align-top">
                  <td className="py-1 pr-3 font-mono break-all text-text-on-dark/85">{g.to}</td>
                  <td className="py-1 pr-3 text-accent-cyan whitespace-nowrap">{TIER_NAME[g.tier] ?? `tier ${g.tier}`}</td>
                  <td className="py-1 pr-3 text-text-muted whitespace-nowrap">{g.mintedAt ? new Date(g.mintedAt * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "—"}</td>
                  <td className="py-1 pr-3 font-mono text-text-on-dark/70" title={minter}>{minterShort}</td>
                  <td className="py-1 pr-3 whitespace-nowrap">
                    <a href={`https://polygonscan.com/tx/${g.tx}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">tx ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-text-muted">
        Total: {grants.length} grant{grants.length === 1 ? "" : "s"}. Data source: <code>GET /v1/index/grants</code> (Form B indexed events).
      </p>
    </div>
  );
}

function AdminWhitelist({ canWriteOnchain, ownerAddress }: { readonly canWriteOnchain: boolean; readonly ownerAddress: string }): JSX.Element {
  const blocked = !!ownerAddress && !canWriteOnchain;
  const [to, setTo] = useState("");
  const [tier, setTier] = useState<string>("2"); // default Lifetime — most common use case (Beta Tester)
  const [note, setNote] = useState("");
  const { writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();
  const [guardErr, setGuardErr] = useState<string | null>(null);

  async function mint(): Promise<void> {
    if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert("Invalid address — must be 0x + 40 hex chars");
      return;
    }
    setGuardErr(null);
    try {
      // GUARD (#4): hard-block double-granting a ONE-TIME lifetime tier via
      // the panel — Lifetime (tier 2) AND Lifetime Premium (tier 6). Both are
      // pay-once / mint-once; re-granting would double-issue. (The on-chain
      // adminMint guard backs this up post-redeploy; this is the UI footgun
      // block on the only realistic path.)
      if (tier === "2" || tier === "6") {
        const g = await fetch(`${FORMB_API}/index/grants`);
        if (g.ok) {
          const j = (await g.json()) as { grants?: { to: string; tier: string }[] };
          const dupe = (j.grants ?? []).some(
            (x) => x.to?.toLowerCase() === to.toLowerCase() && x.tier === tier,
          );
          if (dupe) {
            setGuardErr(
              `Blocked: this address already has a ${TIER_NAME[tier]} (tier ${tier}) admin grant. ` +
              "Re-minting would double-issue a one-time lifetime tier. Use a different tier or recipient.",
            );
            return;
          }
        }
      }
      await ensurePolygon();
      await writeContractAsync({
        abi: licenseAbi,
        address: LICENSE_ADDR,
        functionName: "adminMint",
        args: [to as `0x${string}`, BigInt(tier), note],
      });
    } catch (e) {
      setGuardErr((e as Error).message ?? String(e));
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="font-bold font-display">Whitelist mint (adminMint)</h2>
      <p className="text-text-muted text-sm">Mint any tier free to any wallet. Use for Beta Tester Programme, bug-report rewards, friends &amp; family. The <code>note</code> field is emitted on-chain via LicenceAdminMinted — make it descriptive (e.g. "beta-tester-#12", "bug-XSS-2026-06").</p>

      <OnchainOwnerGuard canWrite={canWriteOnchain} ownerAddress={ownerAddress} />

      <label className="block">
        <span className="text-sm text-text-muted">Recipient wallet (0x…)</span>
        <input type="text" placeholder="0x…" value={to} onChange={(e) => setTo(e.target.value)}
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
      </label>

      <label className="block">
        <span className="text-sm text-text-muted">Tier</span>
        <select value={tier} onChange={(e) => setTier(e.target.value)}
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm">
          {["1", "2", "3", "4", "5", "6"].map((t) => (
            <option key={t} value={t}>{TIER_NAME[t]} (id {t})</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-text-muted">Note (emitted on-chain)</span>
        <input type="text" placeholder="beta-tester-#1" value={note} onChange={(e) => setNote(e.target.value)}
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
      </label>

      <button className="btn btn-primary text-sm" onClick={() => void mint()} disabled={isPending || !to.trim() || blocked}>
        {isPending ? "Submitting…" : blocked ? "Connect the owner wallet to mint" : "adminMint"}
      </button>

      {txHash && (
        <div className="text-xs font-mono">
          tx: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{txHash.slice(0, 12)}…{txHash.slice(-6)}</a>
        </div>
      )}
      {guardErr && <div className="text-xs text-rose-400">{guardErr}</div>}
      {error && <div className="text-xs text-rose-400">{humanizeTxError(error)}</div>}
    </div>
  );
}

// Owner-only tier mintability toggle — calls setMintable(tier,bool) with
// the connected owner wallet (same path as adminMint, which works), so
// gating tiers 4/5 "Coming Soon" doesn't depend on fighting PolygonScan's
// Write-Contract UI / its silent gas-estimation-revert behaviour.
function AdminMintability({ canWriteOnchain, ownerAddress }: { readonly canWriteOnchain: boolean; readonly ownerAddress: string }): JSX.Element {
  const blocked = !!ownerAddress && !canWriteOnchain;
  const [tier, setTier] = useState<string>("4");
  const [mintable, setMintable] = useState<string>("false");
  const { writeContractAsync, data: txHash, isPending, error } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();
  const [err, setErr] = useState<string | null>(null);

  async function go(): Promise<void> {
    setErr(null);
    try {
      await ensurePolygon();
      await writeContractAsync({
        abi: licenseAbi,
        address: LICENSE_ADDR,
        functionName: "setMintable",
        args: [BigInt(tier), mintable === "true"],
      });
    } catch (e) {
      setErr((e as Error).message ?? String(e));
    }
  }

  return (
    <div className="card space-y-3 mt-4">
      <h2 className="font-bold font-display">Tier mintability (setMintable)</h2>
      <p className="text-text-muted text-sm">
        Turn a tier on/off for minting on-chain. Use this to keep Family Office (4) and
        Institutional (5) <strong>off</strong> until they actually launch — the UI also hides
        them, this closes it at the contract too. Owner-only; signs with the connected wallet.
      </p>

      <OnchainOwnerGuard canWrite={canWriteOnchain} ownerAddress={ownerAddress} />
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-text-muted">Tier</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)}
            className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm">
            {["1", "2", "3", "4", "5", "6"].map((t) => (
              <option key={t} value={t}>{TIER_NAME[t]} (id {t})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">Mintable?</span>
          <select value={mintable} onChange={(e) => setMintable(e.target.value)}
            className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm">
            <option value="false">false — disable (Coming Soon)</option>
            <option value="true">true — enable for sale</option>
          </select>
        </label>
      </div>
      <button className="btn btn-primary text-sm" onClick={() => void go()} disabled={isPending || blocked}>
        {isPending ? "Submitting…" : blocked ? "Connect the owner wallet to set" : `setMintable(${tier}, ${mintable})`}
      </button>
      {txHash && (
        <div className="text-xs font-mono">
          tx: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{txHash.slice(0, 12)}…{txHash.slice(-6)}</a>
        </div>
      )}
      {error && <div className="text-xs text-rose-400">{humanizeTxError(error)}</div>}
      {err && <div className="text-xs text-rose-400">{humanizeTxError(err)}</div>}
    </div>
  );
}

function AdminHeartbeat(): JSX.Element {
  const [wallet, setWallet] = useState("");
  const [query, setQuery] = useState<`0x${string}` | null>(null);

  const valid = !!query && /^0x[a-fA-F0-9]{40}$/.test(query);

  const { data: lastHeartbeatData, isLoading: hbLoading } = useReadContract({
    abi: oracleAbi,
    address: ORACLE_ADDR,
    functionName: "lastHeartbeat",
    args: query ? [query] : undefined,
    query: { enabled: valid },
  });

  const { data: graceOverride, isLoading: graceLoading } = useReadContract({
    abi: oracleAbi,
    address: ORACLE_ADDR,
    functionName: "gracePeriodOverride",
    args: query ? [query] : undefined,
    query: { enabled: valid },
  });

  const { data: lastActivated, isLoading: actLoading } = useReadContract({
    abi: oracleAbi,
    address: ORACLE_ADDR,
    functionName: "lastActivatedBlock",
    args: query ? [query] : undefined,
    query: { enabled: valid },
  });

  function lookup(): void {
    const normalised = wallet.trim().toLowerCase();
    if (!/^0x[a-fA-F0-9]{40}$/.test(normalised)) {
      alert("Invalid address — must be 0x + 40 hex chars");
      return;
    }
    setQuery(normalised as `0x${string}`);
  }

  // lastHeartbeat returns (ts uint64, source uint8) as a tuple
  const hbTuple = lastHeartbeatData as readonly [bigint, number] | undefined;
  const lastHbTs = hbTuple ? Number(hbTuple[0]) : 0;
  const lastHbSource = hbTuple ? Number(hbTuple[1]) : 0;
  const graceSecs = graceOverride ? Number(graceOverride) : 60 * 86400; // default 60 days
  const activatedBlock = lastActivated ? Number(lastActivated) : 0;

  const now = Math.floor(Date.now() / 1000);
  const secsSinceHb = lastHbTs ? now - lastHbTs : 0;
  const secsToFire = lastHbTs ? Math.max(0, graceSecs - secsSinceHb) : 0;
  const fired = activatedBlock > 0;

  function fmtDuration(secs: number): string {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
    return `${Math.floor(secs / 86400)}d ${Math.floor((secs % 86400) / 3600)}h`;
  }

  function fmtTs(ts: number): string {
    if (!ts) return "—";
    return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) + "Z";
  }

  const SOURCE_NAMES: Record<number, string> = { 1: "app", 2: "email", 3: "on-chain", 4: "admin" };

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-bold font-display">Heartbeat lookup</h2>
        <p className="text-text-muted text-sm">
          Paste any wallet address. The panel reads its dead-man's-switch state directly from the Oracle contract on Polygon mainnet via the RPC proxy. No off-chain index needed — works for any wallet that has ever interacted with the Oracle.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x…"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") lookup(); }}
            className="flex-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
          />
          <button className="btn btn-primary text-sm" onClick={lookup}>Look up</button>
        </div>
      </div>

      {valid && (
        <div className="card space-y-3">
          <h3 className="font-bold font-display">
            <span className="font-mono text-sm text-text-muted">{query}</span>
          </h3>

          {(hbLoading || graceLoading || actLoading) ? (
            <p className="text-text-muted text-sm">Reading on-chain state…</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-text-muted text-xs">Last heartbeat</div>
                  <div className="font-mono">{fmtTs(lastHbTs)}</div>
                  {lastHbTs > 0 && (
                    <div className="text-xs text-text-muted">{fmtDuration(secsSinceHb)} ago · source: {SOURCE_NAMES[lastHbSource] ?? `code ${lastHbSource}`}</div>
                  )}
                </div>
                <div>
                  <div className="text-text-muted text-xs">Grace period</div>
                  <div className="font-mono">{fmtDuration(graceSecs)}</div>
                  <div className="text-xs text-text-muted">{graceOverride && Number(graceOverride) > 0 ? "user-overridden" : "default (60 days)"}</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs">Activation status</div>
                  {fired ? (
                    <>
                      <div className="font-bold text-rose-300">FIRED</div>
                      <div className="text-xs text-text-muted">at block {activatedBlock.toLocaleString()}</div>
                    </>
                  ) : lastHbTs > 0 ? (
                    <>
                      <div className="font-bold text-accent-green">ALIVE</div>
                      <div className="text-xs text-text-muted">~{fmtDuration(secsToFire)} until activation if no heartbeat</div>
                    </>
                  ) : (
                    <div className="text-text-muted">No heartbeats recorded — dead-man's-switch never armed</div>
                  )}
                </div>
                <div>
                  <div className="text-text-muted text-xs">Risk window</div>
                  {lastHbTs > 0 && !fired && (
                    <>
                      <div className="h-2 bg-bg-deepest rounded overflow-hidden border border-bg-surface">
                        <div
                          className={secsSinceHb > graceSecs * 0.75 ? "h-full bg-rose-500" : secsSinceHb > graceSecs * 0.5 ? "h-full bg-amber-400" : "h-full bg-accent-green"}
                          style={{ width: `${Math.min(100, (secsSinceHb / graceSecs) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {Math.min(100, Math.round((secsSinceHb / graceSecs) * 100))}% of grace consumed
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-text-muted pt-2 border-t border-bg-surface/40">
                Direct on-chain reads. <a href={`https://polygonscan.com/address/${ORACLE_ADDR}#readContract`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">Verify on PolygonScan</a>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const FORMB_API = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

const UPDATE_CATEGORIES = ["Launch", "Feature", "Polish", "Security", "Contracts"] as const;
type UpdateCategory = (typeof UPDATE_CATEGORIES)[number];

interface SiteUpdate {
  readonly id: number;
  readonly ymd: string;
  readonly title: string;
  readonly category: string;
  readonly body: string;
  readonly added_at: number;
}

// Owner-signed site-update publishing. Persists in Form B (site_updates),
// merged onto /updates with the static history. Same trust root as Audit.
function AdminUpdates(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const [list, setList] = useState<SiteUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [ymd, setYmd] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<UpdateCategory>("Feature");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${FORMB_API}/updates`);
      if (!r.ok) throw new Error(`Updates service unavailable (HTTP ${r.status})`);
      const j = (await r.json()) as { updates?: SiteUpdate[] };
      setList([...(j.updates ?? [])].sort((a, b) => (a.ymd < b.ymd ? 1 : a.ymd > b.ymd ? -1 : b.id - a.id)));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(): Promise<void> {
    if (!ymd.trim() || !title.trim() || !htmlHasText(body)) return;
    setBusy(true);
    setErr(null);
    try {
      const d = ymd.trim();
      const t = title.trim();
      const signature = await signMessageAsync({ message: `NoKLock update publish: ${d} ${t}` });
      const r = await fetch(`${FORMB_API}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ymd: d, title: t, category, body: sanitizeHtml(body), signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setTitle(""); setBody(""); setCategory("Feature");
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number): Promise<void> {
    if (!confirm("Remove this published update? It will disappear from /updates (the static history is unaffected).")) return;
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock update delete: ${id}` });
      const r = await fetch(`${FORMB_API}/updates/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-bold font-display mb-3">Publish update</h2>
        <p className="text-text-muted text-xs mb-3">
          Stored in Form B and merged into the public <span className="font-mono">/updates</span> page (newest first, on top of the built-in history). Requires a wallet signature from the License-owner wallet (server verifies it against <code>License.owner()</code> — no password).
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input type="date" value={ymd} onChange={(e) => setYmd(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <select value={category} onChange={(e) => setCategory(e.target.value as UpdateCategory)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm">
            {UPDATE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm sm:col-span-2" />
          <div className="sm:col-span-2">
            <RichTextEditor valueHtml={body} onChange={setBody} placeholder="Body — format with the toolbar (bold, headings, lists, links)…" minHeight={160} />
          </div>
        </div>
        <button className="btn btn-primary text-sm" onClick={() => void add()} disabled={busy || !title.trim() || !htmlHasText(body)}>
          {busy ? "Signing…" : "Sign & publish"}
        </button>
        {err && <div className="text-xs text-rose-400 mt-2">{humanizeTxError(err)}</div>}
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-3">Published updates ({list.length})</h2>
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-text-muted text-sm">None yet. The static built-in history still shows on /updates.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {list.map((u) => (
              <li key={u.id} className="flex justify-between items-start gap-3 border-b border-bg-surface/40 pb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{u.title} <span className="text-text-muted text-xs ml-1">· {u.category} · {u.ymd}</span></div>
                  {looksLikeHtml(u.body)
                    ? <RichTextView html={u.body} className="text-text-on-dark/80 text-xs" />
                    : <div className="text-text-on-dark/80 text-xs whitespace-pre-line">{u.body}</div>}
                </div>
                <button className="btn btn-secondary text-xs shrink-0" onClick={() => void remove(u.id)} disabled={busy}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 044 — NoKLock Articles editor (SEO/AIEO content hub). Same owner-signed trust
// root as updates; stored in Form B `articles`, served at /articles +
// /articles/<slug> (prerendered + JSON-LD). Re-publishing the same slug edits
// in place (upsert).
function AdminArticles(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const [list, setList] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [ymd, setYmd] = useState(new Date().toISOString().slice(0, 10));
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("guides");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true); setErr(null);
    try { setList(await listArticles()); }
    catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function onTitle(v: string): void { setTitle(v); if (!slugTouched) setSlug(slugify(v)); }

  async function publish(): Promise<void> {
    const s = (slug.trim() || slugify(title)).trim();
    if (!s || !ymd.trim() || !title.trim() || !htmlHasText(body)) return;
    setBusy(true); setErr(null); setOkMsg(null);
    try {
      const signature = await signMessageAsync({ message: articlePublishMsg(s) });
      const res = await publishArticle({
        slug: s, ymd: ymd.trim(), title: title.trim(), category,
        excerpt: excerpt.trim(), body: sanitizeHtml(body), signature,
      });
      if (!res.ok) throw new Error(res.error ?? "publish failed");
      setOkMsg(`Published → /articles/${s}`);
      setTitle(""); setSlug(""); setSlugTouched(false); setExcerpt(""); setBody(""); setCategory("guides");
      await refresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function startEdit(slugToEdit: string): Promise<void> {
    setBusy(true); setErr(null); setOkMsg(null);
    try {
      const a = await getArticle(slugToEdit);
      if (!a) throw new Error("article not found");
      setYmd(a.ymd); setSlug(a.slug); setSlugTouched(true); setTitle(a.title);
      setCategory((ARTICLE_CATEGORIES as readonly string[]).includes(a.category) ? (a.category as ArticleCategory) : "guides");
      setExcerpt(a.excerpt); setBody(a.body);
      setOkMsg(`Editing "${a.title}" — change it, then Sign & publish to update in place.`);
      window.scrollTo({ top: 0 });
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function remove(id: number): Promise<void> {
    if (!confirm("Delete this article? It disappears from /articles and its URL will 404.")) return;
    setBusy(true); setErr(null);
    try {
      const signature = await signMessageAsync({ message: articleDeleteMsg(id) });
      const res = await deleteArticle(id, signature);
      if (!res.ok) throw new Error(res.error ?? "delete failed");
      await refresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-bold font-display mb-3">Publish article</h2>
        <p className="text-text-muted text-xs mb-3">
          The FULL content lives on noklock.app (not linked out) so we keep the SEO/AIEO value. Stored in Form B, served at{" "}
          <span className="font-mono">/articles</span> + <span className="font-mono">/articles/&lt;slug&gt;</span> (each prerendered with Article JSON-LD on the next build). Re-publishing the same <strong>slug</strong> edits the article in place. Requires the License-owner wallet signature.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input type="date" value={ymd} onChange={(e) => setYmd(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <select value={category} onChange={(e) => setCategory(e.target.value as ArticleCategory)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm">
            {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
          </select>
          <input type="text" placeholder="Title" value={title} onChange={(e) => onTitle(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm sm:col-span-2" />
          <label className="text-xs text-text-muted sm:col-span-2">
            URL slug (auto from title; edit to override)
            <input type="text" placeholder="my-article-slug" value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm font-mono" />
            <span className="text-text-muted">→ /articles/{slug || "…"}</span>
          </label>
          <input type="text" placeholder="Excerpt (card preview; optional — auto-derived if blank)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm sm:col-span-2" />
          <div className="sm:col-span-2">
            <RichTextEditor valueHtml={body} onChange={setBody} placeholder="Article body — format with the toolbar (bold, headings, lists, links)…" minHeight={260} />
          </div>
        </div>
        <button className="btn btn-primary text-sm" onClick={() => void publish()} disabled={busy || !title.trim() || !htmlHasText(body)}>
          {busy ? "Signing…" : "Sign & publish"}
        </button>
        {okMsg && <div className="text-xs text-accent-green mt-2">{okMsg}</div>}
        {err && <div className="text-xs text-rose-400 mt-2">{humanizeTxError(err)}</div>}
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-3">Published articles ({list.length})</h2>
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-text-muted text-sm">None yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {list.map((a) => (
              <li key={a.id} className="flex justify-between items-start gap-3 border-b border-bg-surface/40 pb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{a.title} <span className="text-text-muted text-xs ml-1">· {CATEGORY_LABEL[a.category] ?? a.category} · {a.ymd}</span></div>
                  <div className="text-text-muted text-[11px] font-mono">/articles/{a.slug}</div>
                  <div className="text-text-on-dark/75 text-xs mt-0.5 line-clamp-2">{a.excerpt}</div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button className="btn btn-secondary text-xs" onClick={() => void startEdit(a.slug)} disabled={busy}>Edit</button>
                  <button className="btn btn-secondary text-xs" onClick={() => void remove(a.id)} disabled={busy}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// "Updates+" — App updates (changelog) + Articles (content hub) as two subtabs.
function AdminUpdatesPlus(): JSX.Element {
  const [sub, setSub] = useState<"app" | "articles">("app");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`btn text-sm ${sub === "app" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSub("app")}>App updates</button>
        <button className={`btn text-sm ${sub === "articles" ? "btn-primary" : "btn-secondary"}`} onClick={() => setSub("articles")}>Articles</button>
      </div>
      {sub === "app" ? <AdminUpdates /> : <AdminArticles />}
    </div>
  );
}


interface Grant {
  readonly key: string;        // `${txHash}:${logIndex}`
  readonly to: string;
  readonly tier: string;
  readonly chainNote: string;  // note emitted on-chain at adminMint
  readonly mintedAt: number;
  readonly tx: string;
}

// Lists every on-chain LicenceAdminMinted grant (chunked getLogs from
// DEPLOY_BLOCK) + an editable OFF-chain admin note per grant stored in
// Form B (owner-signed). The chain stays the source of truth.
function AdminWhitelistGrants(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      // PERMANENT FIX: read the Form B event INDEX, not browser getLogs.
      const gr = await fetch(`${FORMB_API}/index/grants`);
      if (!gr.ok) throw new Error(`Grants index unavailable (HTTP ${gr.status})`);
      const gj = (await gr.json()) as { grants?: Grant[] };
      const out: Grant[] = Array.isArray(gj.grants) ? [...gj.grants] : [];
      out.sort((x, y) => y.mintedAt - x.mintedAt);
      setGrants(out);

      // Off-chain editable notes (best-effort; grants still show without them).
      try {
        const r = await fetch(`${FORMB_API}/whitelist-notes`);
        if (r.ok) {
          const j = (await r.json()) as { notes?: Record<string, { note: string }> };
          const m: Record<string, string> = {};
          for (const [k, v] of Object.entries(j.notes ?? {})) m[k] = v.note;
          setNotes(m);
        }
      } catch { /* notes are optional */ }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveNote(key: string): Promise<void> {
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock wl-note set: ${key}` });
      const r = await fetch(`${FORMB_API}/whitelist-notes/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: editVal, signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setNotes((m) => ({ ...m, [key]: editVal.trim() }));
      setEditKey(null);
      setEditVal("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="font-bold font-display">Whitelist grants</h2>
      <p className="text-text-muted text-sm">
        Every <code>adminMint</code> ever made, read live from the on-chain <code>LicenceAdminMinted</code> events. The on-chain note is immutable; the editable admin note is an off-chain annotation stored in Form B (owner-signed) — handy for tracking beta testers / reward context.
      </p>
      {err && (
        humanizeRpcError(err)
          ? <div className="text-xs text-amber-300 border border-amber-500/40 bg-amber-500/10 rounded p-2">{humanizeRpcError(err)}</div>
          : <div className="text-xs text-rose-400">{err}</div>
      )}
      {loading ? (
        <p className="text-text-muted text-sm">Scanning chain…</p>
      ) : grants.length === 0 && !err ? (
        <p className="text-text-muted text-sm">No adminMint grants found on-chain yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {grants.map((g) => (
            <li key={g.key} className="border-b border-bg-surface/40 pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-xs text-text-on-dark/80 break-all">{g.to}</span>
                <span className="text-accent-cyan text-xs">{TIER_NAME[g.tier] ?? `tier ${g.tier}`}</span>
                <span className="text-text-muted text-xs">{g.mintedAt ? new Date(g.mintedAt * 1000).toISOString().slice(0, 10) : "—"}</span>
                <a href={`https://polygonscan.com/tx/${g.tx}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-xs">tx ↗</a>
              </div>
              {g.chainNote && <div className="text-xs text-text-muted">on-chain note: <span className="text-text-on-dark/80">{g.chainNote}</span></div>}
              {editKey === g.key ? (
                <div className="flex gap-2 mt-1">
                  <input type="text" value={editVal} onChange={(e) => setEditVal(e.target.value)} maxLength={500}
                    placeholder="Admin note (off-chain)"
                    className="flex-1 bg-bg-deepest border border-bg-surface rounded p-1 text-xs" />
                  <button className="btn btn-primary text-xs" onClick={() => void saveNote(g.key)} disabled={busy}>{busy ? "Signing…" : "Save"}</button>
                  <button className="btn btn-secondary text-xs" onClick={() => { setEditKey(null); setEditVal(""); }} disabled={busy}>Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs text-text-on-dark/70 flex-1">
                    admin note: {notes[g.key] ? <span className="text-text-on-dark">{notes[g.key]}</span> : <span className="text-text-muted italic">none</span>}
                  </span>
                  <button className="btn btn-secondary text-xs" onClick={() => { setEditKey(g.key); setEditVal(notes[g.key] ?? ""); }}>Edit note</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// AdminSiteToggles — Daniel 2026-05-21. Owner-controlled site-wide toggles
// that flip live (no Form B redeploy). Backed by the app_flags table via the
// /v1/flags/:key endpoints (registerFlagsRoutes). Currently exposes one
// toggle (launch transparency banner); structured so future toggles slot in
// as additional rows.
// -----------------------------------------------------------------------------
function AdminSiteToggles(): JSX.Element {
  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <h2 className="text-xl font-bold font-display"><span className="grad">Site toggles</span></h2>
        <p className="text-sm text-text-muted">
          Live owner-controlled switches. Changes take effect immediately — visitors pick them up on their next page load (or after the
          in-memory flag cache expires, ~no delay in practice). Each toggle is owner-signed via your connected admin wallet.
        </p>
      </section>

      <FlagToggleRow
        flagKey="noklock.launch-banner.enabled"
        title="Launch transparency banner"
        description={`The "Day-1 honest note" card at the top of /. It dismisses per-session via the ✕ and permanently per-browser via the "Dismiss forever" link. This toggle hides it for everyone, globally. Default (no flag set) = enabled, with the time-based 90-day auto-hide still in charge.`}
      />

      <PartnerWhitelistManager />
      <PatentStatusManager />
    </div>
  );
}

// -----------------------------------------------------------------------------
// PartnerWhitelistManager — Daniel 2026-05-27. Selected-partner invite list
// for the /community-owners Partner Toolkit. Stored as a JSON-stringified
// array of lower-cased 0x addresses under app_flags key
// `partners.toolkit-whitelist`. Owner-signed every write (the existing
// /v1/flags/:key endpoints). PWA reads it at runtime via useFlag, so adding
// or removing a partner is INSTANT and needs no rebuild/redeploy of either
// the PWA or Form B — exactly the env-was-a-pain ask.
// -----------------------------------------------------------------------------
function PartnerWhitelistManager(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const FLAG_KEY = "partners.toolkit-whitelist";

  const [addresses, setAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function refresh(): Promise<void> {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(FLAG_KEY)}`);
      if (r.status === 404) { setAddresses([]); return; }
      if (r.status === 400) {
        // Form B doesn't yet recognise this flag key — it's running an older
        // build (pre-2026-05-27) that doesn't list `partners.toolkit-whitelist`
        // in KNOWN_FLAGS. Surface this clearly so the admin knows it's a
        // deploy-pending state, not a real error.
        setErr("Form B doesn't yet recognise the partners-whitelist flag — upload + restart the latest Form B build (>= 2026-05-27).");
        setAddresses([]);
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json() as { value?: string };
      let parsed: unknown;
      try { parsed = JSON.parse(j.value ?? "[]"); } catch { parsed = []; }
      const arr = Array.isArray(parsed) ? parsed : [];
      setAddresses(arr.filter((a): a is string => typeof a === "string" && /^0x[a-f0-9]{40}$/.test(a.toLowerCase())).map((a) => a.toLowerCase()));
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function save(next: string[]): Promise<void> {
    setBusy(true); setErr(null); setInfo(null);
    try {
      const value = JSON.stringify(next);
      const signature = await signMessageAsync({ message: `NoKLock flag set: ${FLAG_KEY} = ${value}` });
      const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(FLAG_KEY)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value, signer: address, signature }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setAddresses(next);
      setInfo(`Saved — ${next.length} partner wallet${next.length === 1 ? "" : "s"} whitelisted.`);
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function addAddress(): Promise<void> {
    const a = draft.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(a)) { setErr("Enter a valid 0x… 40-hex address."); return; }
    if (addresses.includes(a)) { setErr("Already in the list."); return; }
    setDraft("");
    await save([...addresses, a]);
  }

  async function removeAddress(a: string): Promise<void> {
    await save(addresses.filter((x) => x !== a));
  }

  return (
    <section className="card space-y-3">
      <header>
        <h3 className="font-bold font-display"><span className="grad">Partner toolkit whitelist</span></h3>
        <p className="text-sm text-text-muted mt-1">
          Selected-partner invite list for the <code>/community-owners</code> toolkit. Add a partner's wallet address here and the gate opens for them immediately — no rebuild, no env, no token to share. Stored as a JSON array in Form B's <code>app_flags</code>; every change owner-signed.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="0x… (40-hex address)"
          className="flex-1 min-w-[20rem] bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm font-mono"
        />
        <button onClick={() => void addAddress()} disabled={busy || !draft} className="btn btn-secondary text-sm">
          {busy ? "Working…" : "Add (sign)"}
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="text-text-muted text-sm"><em>No partners whitelisted yet.</em> Premium-tier holders auto-qualify; everyone else needs to be added here.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {addresses.map((a) => (
            <li key={a} className="flex items-center justify-between border-b border-bg-surface/40 py-1.5 gap-2">
              <span className="font-mono text-xs break-all">{a}</span>
              <button onClick={() => void removeAddress(a)} disabled={busy} className="text-rose-400 hover:underline text-xs shrink-0">remove</button>
            </li>
          ))}
        </ul>
      )}

      {err && <p className="text-xs text-rose-300">{err}</p>}
      {info && <p className="text-xs text-accent-cyan">{info}</p>}
    </section>
  );
}

// -----------------------------------------------------------------------------
// PatentStatusManager — Daniel 2026-05-27. Live admin control over the patent-
// marking surface that appears on Pricing / Info → Architecture (WhyItMatters)
// / Info → Contracts / Info → About NoKLock → About. (Pre-2026-06-02 this
// last surface lived on Settings → About; moved to Info → About NoKLock in
// Settings 0.6.0 + Info 0.7.6 per Daniel's reorg.) Status enum (the ids are
// stable internal keys; only the displayed wording matters here):
//   "in-progress"  → "US patent application in progress"
//   "filed"        → "US patent application filed (serial …)"
//   "pending"      → "Patent pending — US application <serial>"
//   "non-pro"      → "Patent pending — <serial>"  (post-conversion)
// Don't legally set "pending" until you actually have a USPTO filing receipt
// with a serial — 35 USC §292 false-marking is civil-fines + qui tam
// enforceable. The UI warns but doesn't enforce; you're the one with the
// filing on your desk. Backed by Form B `patents.us-provisional-status` +
// `patents.us-provisional-serial` flags (flag-key strings UNCHANGED — they are
// internal identifiers; renaming them would orphan the stored flag value).
// -----------------------------------------------------------------------------
function PatentStatusManager(): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const STATUS_KEY = "patents.us-provisional-status";
  const SERIAL_KEY = "patents.us-provisional-serial";
  type PatentStatus = "in-progress" | "filed" | "pending" | "non-pro";
  // Labels are the user-facing wording only — the `id` values stay as the
  // stable internal status keys (don't surface "provisional" in displayed text).
  const STATUSES: ReadonlyArray<{ id: PatentStatus; label: string }> = [
    { id: "in-progress", label: "Application in progress" },
    { id: "filed",       label: "Application filed (have serial)" },
    { id: "pending",     label: "Patent pending" },
    { id: "non-pro",     label: "Patent pending (full application)" },
  ];

  const [status, setStatus] = useState<PatentStatus>("in-progress");
  const [serial, setSerial] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true); setErr(null);
    try {
      const [sR, nR] = await Promise.all([
        fetch(`${FORMB_API}/flags/${encodeURIComponent(STATUS_KEY)}`),
        fetch(`${FORMB_API}/flags/${encodeURIComponent(SERIAL_KEY)}`),
      ]);
      if (sR.status === 400 || nR.status === 400) {
        setErr("Form B doesn't yet recognise the patent flags — upload + restart the latest Form B build (>= 2026-05-27).");
        return;
      }
      if (sR.ok) {
        const sj = await sR.json() as { value?: string };
        if (sj.value === "in-progress" || sj.value === "filed" || sj.value === "pending" || sj.value === "non-pro") {
          setStatus(sj.value);
        }
      }
      if (nR.ok) {
        const nj = await nR.json() as { value?: string };
        setSerial(typeof nj.value === "string" ? nj.value : "");
      }
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function saveOne(key: string, value: string, label: string): Promise<void> {
    const signature = await signMessageAsync({ message: `NoKLock flag set: ${key} = ${value}` });
    const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value, signer: address, signature }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({} as { error?: string }));
      throw new Error(`${label}: ${j.error ?? `HTTP ${r.status}`}`);
    }
  }

  async function save(): Promise<void> {
    setBusy(true); setErr(null); setInfo(null);
    try {
      // Two signed writes (status, serial). Could be one combined endpoint
      // later; for now keeping the generic /v1/flags surface.
      await saveOne(STATUS_KEY, status, "status");
      await saveOne(SERIAL_KEY, serial.trim(), "serial");
      setInfo("Saved — patent notice updates live across Pricing / Info (Architecture + Contracts + About NoKLock) on next page load.");
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  const warnPending = (status === "pending" || status === "non-pro") && !serial.trim();

  return (
    <section className="card space-y-3">
      <header>
        <h3 className="font-bold font-display"><span className="grad">Patent status</span></h3>
        <p className="text-sm text-text-muted mt-1">
          Controls the IP marking wording across Pricing, Info → Architecture, Info → Contracts, and Info → About NoKLock → About. Default (no flag set) = "in progress". <strong className="text-text-on-dark">Don't legally set "Patent pending" until you actually have a USPTO filing receipt</strong> — 35 USC §292 false-marking is civil-fines + qui tam enforceable. The UI warns but doesn't enforce — you have the filing on your desk, not us.
        </p>
      </header>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <>
          <label className="block">
            <span className="text-text-muted text-xs">Status</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  disabled={busy}
                  className={`px-3 py-1.5 rounded border text-sm ${status === s.id ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-text-muted text-xs">USPTO serial (leave blank if not yet issued)</span>
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="63/xxx,xxx"
              className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1 font-mono"
            />
          </label>

          {warnPending && (
            <p className="text-xs text-amber-300">
              ⚠ You've selected "Patent pending" but the serial is blank. This is legally risky (false marking) unless you have actually filed and the receipt is in hand — fill the serial before saving, or roll back to "Filed" / "In progress".
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={() => void save()} disabled={busy} className="btn btn-primary text-sm">
              {busy ? "Saving…" : "Save (sign)"}
            </button>
            <button onClick={() => void refresh()} disabled={busy} className="btn btn-secondary text-sm">Reload</button>
          </div>
        </>
      )}

      {err && <p className="text-xs text-rose-300">{err}</p>}
      {info && <p className="text-xs text-accent-cyan">{info}</p>}
    </section>
  );
}

interface FlagToggleRowProps {
  readonly flagKey: string;
  readonly title: string;
  readonly description: string;
}

function FlagToggleRow({ flagKey, title, description }: FlagToggleRowProps): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const [current, setCurrent] = useState<"true" | "false" | null>(null);  // null = flag not set
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(flagKey)}`);
      if (r.status === 404) {
        setCurrent(null);
      } else if (r.ok) {
        const j = await r.json() as { value?: string };
        setCurrent(j.value === "false" ? "false" : "true");
      } else {
        throw new Error(`HTTP ${r.status}`);
      }
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function setValue(value: "true" | "false"): Promise<void> {
    setBusy(true); setErr(null); setInfo(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock flag set: ${flagKey} = ${value}` });
      const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(flagKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value, signer: address, signature }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setCurrent(value);
      setInfo(value === "false" ? "Hidden for all visitors." : "Visible (subject to per-browser dismiss + auto-hide).");
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function clearFlag(): Promise<void> {
    setBusy(true); setErr(null); setInfo(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock flag clear: ${flagKey}` });
      const r = await fetch(`${FORMB_API}/flags/${encodeURIComponent(flagKey)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({} as { error?: string }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setCurrent(null);
      setInfo("Cleared — reverted to default (enabled, subject to time-based auto-hide).");
    } catch (e) {
      setErr(String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  const stateLabel = current === null ? "default (enabled)" : current === "false" ? "disabled" : "enabled";
  const stateColor = current === "false" ? "text-rose-300" : "text-accent-green";

  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-baseline gap-2 justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="text-xs">
          Current state: {loading ? <span className="text-text-muted">loading…</span> : <span className={`${stateColor} font-bold`}>{stateLabel}</span>}
          <span className="text-text-muted ml-2 font-mono">{flagKey}</span>
        </div>
      </div>
      <p className="text-sm text-text-on-dark/80">{description}</p>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary text-sm" disabled={busy || loading} onClick={() => void setValue("true")}>
          {busy ? "Signing…" : "Enable"}
        </button>
        <button className="btn btn-secondary text-sm" disabled={busy || loading} onClick={() => void setValue("false")}>
          {busy ? "Signing…" : "Disable globally"}
        </button>
        <button className="btn btn-secondary text-sm" disabled={busy || loading || current === null} onClick={() => void clearFlag()}>
          Clear (revert to default)
        </button>
      </div>
      {err && <p className="text-sm text-rose-300">{err}</p>}
      {info && <p className="text-sm text-accent-green">{info}</p>}
    </section>
  );
}

// -----------------------------------------------------------------------------
// AdminRefunds — Daniel 2026-06-03 (Admin 0.8.0). Owner/admin-gated refund
// queue + history. Two sub-tabs:
//   Pending   — status='pending', actions [Approve] / [Reject] / [View details]
//   Processed — status in (refunded | rejected), read-only with extra columns
//               processed_at + status pill + paddle_refund_id.
// Both call GET /v1/admin/refund-requests?status=…&msg=…&sig=… authorised by
// the SHARED admin ops-session signature (ensureOpsSig, 24h TTL) — one sign
// covers every admin read (Admin 0.10.0). Approve/Reject are STILL per-action
// admin-signed POSTs to /v1/admin/refund-requests/:id/approve|reject (writes
// are unchanged — each is its own signature). Reject requires a non-empty
// reason; the textarea sits inside the confirmation modal so the action
// can't fire without it. Wallet-search filter applies to both tabs
// (case-insensitive substring against wallet_address).
// -----------------------------------------------------------------------------
type RefundSubTab = "pending" | "processed";

const REFUND_SUBTAB_LABEL: Record<RefundSubTab, string> = {
  pending:   "Pending",
  processed: "Processed",
};

interface RefundRequestRow {
  readonly id: number;
  readonly wallet_address: string;
  readonly subscription_state_id: number;
  readonly payment_method: string;
  readonly paddle_transaction_id: string | null;
  readonly request_reason: string | null;
  readonly requested_at_ts: number;
  readonly status: "pending" | "approved" | "rejected" | "refunded";
  readonly paddle_refund_id: string | null;
  readonly processed_at_ts: number | null;
  readonly admin_notes: string | null;
  readonly refund_amount_cents: number | null;
  readonly refund_currency: string | null;
}

function shortAddr(a: string): string {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmtRefundTs(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function fmtAmount(cents: number | null, currency: string | null): string {
  if (cents === null || cents === undefined) return "—";
  const amt = (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${amt}` : `$${amt}`;
}

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "—";
  if (s.length <= n) return s;
  return s.slice(0, n) + "…";
}

function AdminRefunds(): JSX.Element {
  const [sub, setSub] = useState<RefundSubTab>("pending");
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
        {(Object.keys(REFUND_SUBTAB_LABEL) as RefundSubTab[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSub(s)}
            className={
              "px-3 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (sub === s
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {REFUND_SUBTAB_LABEL[s]}
          </button>
        ))}
      </div>
      <div className="card">
        <label className="block">
          <span className="text-xs text-text-muted">Filter by wallet (substring, case-insensitive)</span>
          <input
            type="text"
            placeholder="0x… or partial"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
          />
        </label>
      </div>
      {sub === "pending"   && <AdminRefundsPending search={search} />}
      {sub === "processed" && <AdminRefundsProcessed search={search} />}
    </div>
  );
}

// Pending tab — actionable queue.
function AdminRefundsPending({ search }: { readonly search: string }): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const [rows, setRows] = useState<RefundRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal state — one for approve, one for reject (reject carries a reason).
  const [approveTarget, setApproveTarget] = useState<RefundRequestRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RefundRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      // Shared ops-session signature — one sign covers every admin READ for 24h.
      const cached = await ensureOpsSig(address, signMessageAsync);
      const r = await fetch(`${FORMB_API}/admin/refund-requests?status=pending&msg=${encodeURIComponent(cached.msg)}&sig=${encodeURIComponent(cached.sig)}`);
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const j = (await r.json()) as { rows?: RefundRequestRow[] };
      setRows(Array.isArray(j.rows) ? j.rows : []);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(row: RefundRequestRow): Promise<void> {
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock refund approve: ${row.id}` });
      const r = await fetch(`${FORMB_API}/admin/refund-requests/${row.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setToast(`Refund #${row.id} approved (${shortAddr(row.wallet_address)})`);
      setApproveTarget(null);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reject(row: RefundRequestRow, reason: string): Promise<void> {
    const r2 = reason.trim();
    if (!r2) {
      setErr("Reason required to reject.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock refund reject: ${row.id}` });
      const r = await fetch(`${FORMB_API}/admin/refund-requests/${row.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, reason: r2 }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setToast(`Refund #${row.id} rejected (${shortAddr(row.wallet_address)})`);
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = search.trim()
    ? rows.filter((r) => r.wallet_address.toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3">
          <h2 className="font-bold font-display">Pending refund requests ({filtered.length}{search ? ` of ${rows.length}` : ""})</h2>
          <button className="btn btn-secondary text-xs" onClick={() => void load()} disabled={loading || busy}>
            {loading ? "Loading…" : "Refresh (re-sign)"}
          </button>
        </div>
        <p className="text-text-muted text-xs mb-3">
          User-initiated refund requests against Paddle subscriptions. Approve calls Paddle's refund API (or MOCK
          when <code>PADDLE_API_KEY</code> is unset) and flips <code>subscription_state.status='refunded'</code>.
          Reject requires a reason which is emailed to the user.
        </p>
        {err && <div className="text-xs text-rose-400 mb-2">{err}</div>}
        {toast && <div className="text-xs text-accent-green mb-2">{toast}</div>}
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-muted text-sm">{search ? "No pending refunds match this wallet filter." : "No pending refund requests."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-muted border-b border-bg-surface/60">
                  <th className="py-1 pr-3 font-normal">Requested</th>
                  <th className="py-1 pr-3 font-normal">Wallet</th>
                  <th className="py-1 pr-3 font-normal">Tier (sub#)</th>
                  <th className="py-1 pr-3 font-normal">Subscribed (id)</th>
                  <th className="py-1 pr-3 font-normal">Amount</th>
                  <th className="py-1 pr-3 font-normal">Reason</th>
                  <th className="py-1 pr-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-b border-bg-surface/30 align-top">
                      <td className="py-1 pr-3 text-text-muted whitespace-nowrap">{fmtRefundTs(row.requested_at_ts)}</td>
                      <td className="py-1 pr-3 font-mono text-text-on-dark/85" title={row.wallet_address}>{shortAddr(row.wallet_address)}</td>
                      <td className="py-1 pr-3 text-accent-cyan whitespace-nowrap">sub#{row.subscription_state_id}</td>
                      <td className="py-1 pr-3 text-text-muted whitespace-nowrap" title={`subscription_state row id ${row.subscription_state_id}`}>{row.subscription_state_id}</td>
                      <td className="py-1 pr-3 whitespace-nowrap text-text-on-dark">{fmtAmount(row.refund_amount_cents, row.refund_currency)}</td>
                      <td className="py-1 pr-3 text-text-on-dark/80" title={row.request_reason ?? ""}>{truncate(row.request_reason, 60)}</td>
                      <td className="py-1 pr-3 whitespace-nowrap text-right">
                        <div className="inline-flex gap-1">
                          <button className="btn btn-primary text-[11px] px-2 py-0.5" disabled={busy} onClick={() => setApproveTarget(row)}>Approve</button>
                          <button className="btn btn-secondary text-[11px] px-2 py-0.5" disabled={busy} onClick={() => { setRejectTarget(row); setRejectReason(""); }}>Reject</button>
                          <button className="btn btn-secondary text-[11px] px-2 py-0.5" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>{expandedId === row.id ? "Hide" : "View"}</button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr className="border-b border-bg-surface/30 bg-bg-deepest/40">
                        <td colSpan={7} className="p-3">
                          <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                            <div><span className="text-text-muted">id:</span> <span className="font-mono">{row.id}</span></div>
                            <div><span className="text-text-muted">payment_method:</span> <span className="font-mono">{row.payment_method}</span></div>
                            <div className="sm:col-span-2"><span className="text-text-muted">wallet_address:</span> <span className="font-mono break-all">{row.wallet_address}</span></div>
                            <div className="sm:col-span-2"><span className="text-text-muted">subscription_state_id:</span> <span className="font-mono">{row.subscription_state_id}</span></div>
                            <div className="sm:col-span-2"><span className="text-text-muted">paddle_transaction_id:</span> <span className="font-mono break-all">{row.paddle_transaction_id ?? "—"}</span></div>
                            <div className="sm:col-span-2"><span className="text-text-muted">request_reason (full):</span> <span className="text-text-on-dark/90 whitespace-pre-wrap">{row.request_reason ?? "—"}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve confirmation modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deepest/80 p-4" role="dialog" aria-modal="true">
          <div className="card max-w-md w-full space-y-3">
            <h3 className="font-bold font-display">Approve refund #{approveTarget.id}?</h3>
            <p className="text-sm text-text-on-dark/85">
              This will call Paddle's refund API for transaction <span className="font-mono text-xs">{approveTarget.paddle_transaction_id ?? "—"}</span> and flip
              the user's subscription to <code>refunded</code>. They will be email-notified. You'll be asked to sign
              <code> NoKLock refund approve: {approveTarget.id}</code>.
            </p>
            <div className="text-xs text-text-muted">
              Wallet: <span className="font-mono">{shortAddr(approveTarget.wallet_address)}</span> · Amount: {fmtAmount(approveTarget.refund_amount_cents, approveTarget.refund_currency)}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary text-sm" disabled={busy} onClick={() => setApproveTarget(null)}>Cancel</button>
              <button className="btn btn-primary text-sm" disabled={busy} onClick={() => void approve(approveTarget)}>
                {busy ? "Signing…" : "Sign & approve"}
              </button>
            </div>
            {err && <div className="text-xs text-rose-400">{err}</div>}
          </div>
        </div>
      )}

      {/* Reject confirmation modal — reason required */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deepest/80 p-4" role="dialog" aria-modal="true">
          <div className="card max-w-md w-full space-y-3">
            <h3 className="font-bold font-display">Reject refund #{rejectTarget.id}?</h3>
            <p className="text-sm text-text-on-dark/85">
              The user will be email-notified with the reason below. You'll be asked to sign
              <code> NoKLock refund reject: {rejectTarget.id}</code>.
            </p>
            <label className="block">
              <span className="text-xs text-text-muted">Reason (required; sent to user)</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Outside the 14-day window / fraud signal / duplicate / …"
                className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary text-sm" disabled={busy} onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</button>
              <button className="btn btn-primary text-sm" disabled={busy || !rejectReason.trim()} onClick={() => void reject(rejectTarget, rejectReason)}>
                {busy ? "Signing…" : "Sign & reject"}
              </button>
            </div>
            {err && <div className="text-xs text-rose-400">{err}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// Processed tab — history (refunded + rejected merged, sorted DESC by processed_at_ts).
function AdminRefundsProcessed({ search }: { readonly search: string }): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const [rows, setRows] = useState<RefundRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      // Shared ops-session signature — one sign covers every admin READ for 24h
      // (both list reads below reuse the same cached credential).
      const cached = await ensureOpsSig(address, signMessageAsync);
      const [refundedR, rejectedR] = await Promise.all([
        fetch(`${FORMB_API}/admin/refund-requests?status=refunded&msg=${encodeURIComponent(cached.msg)}&sig=${encodeURIComponent(cached.sig)}`),
        fetch(`${FORMB_API}/admin/refund-requests?status=rejected&msg=${encodeURIComponent(cached.msg)}&sig=${encodeURIComponent(cached.sig)}`),
      ]);
      if (!refundedR.ok) {
        const j = (await refundedR.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${refundedR.status}`);
      }
      if (!rejectedR.ok) {
        const j = (await rejectedR.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${rejectedR.status}`);
      }
      const a = ((await refundedR.json()) as { rows?: RefundRequestRow[] }).rows ?? [];
      const b = ((await rejectedR.json()) as { rows?: RefundRequestRow[] }).rows ?? [];
      const merged = [...a, ...b].sort((x, y) => (y.processed_at_ts ?? 0) - (x.processed_at_ts ?? 0));
      setRows(merged);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = search.trim()
    ? rows.filter((r) => r.wallet_address.toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap justify-between items-baseline gap-2">
        <h2 className="font-bold font-display">Processed refunds ({filtered.length}{search ? ` of ${rows.length}` : ""})</h2>
        <button className="btn btn-secondary text-xs" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      <p className="text-text-muted text-xs">
        Combined history of <span className="text-emerald-300">refunded</span> and <span className="text-rose-300">rejected</span> requests
        (most recent action first). Source: two reads against <code>GET /v1/admin/refund-requests</code>, both authorised by your shared admin ops-session signature.
      </p>
      {err && <div className="text-xs text-rose-400">{err}</div>}
      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-text-muted text-sm">{search ? "No processed refunds match this wallet filter." : "No processed refunds yet."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-muted border-b border-bg-surface/60">
                <th className="py-1 pr-3 font-normal">Requested</th>
                <th className="py-1 pr-3 font-normal">Processed</th>
                <th className="py-1 pr-3 font-normal">Wallet</th>
                <th className="py-1 pr-3 font-normal">Tier (sub#)</th>
                <th className="py-1 pr-3 font-normal">Amount</th>
                <th className="py-1 pr-3 font-normal">Reason</th>
                <th className="py-1 pr-3 font-normal">Status</th>
                <th className="py-1 pr-3 font-normal">Paddle refund id</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-bg-surface/30 align-top">
                  <td className="py-1 pr-3 text-text-muted whitespace-nowrap">{fmtRefundTs(row.requested_at_ts)}</td>
                  <td className="py-1 pr-3 text-text-muted whitespace-nowrap">{fmtRefundTs(row.processed_at_ts)}</td>
                  <td className="py-1 pr-3 font-mono text-text-on-dark/85" title={row.wallet_address}>{shortAddr(row.wallet_address)}</td>
                  <td className="py-1 pr-3 text-accent-cyan whitespace-nowrap">sub#{row.subscription_state_id}</td>
                  <td className="py-1 pr-3 whitespace-nowrap text-text-on-dark">{fmtAmount(row.refund_amount_cents, row.refund_currency)}</td>
                  <td className="py-1 pr-3 text-text-on-dark/80" title={row.status === "rejected" ? (row.admin_notes ?? "") : (row.request_reason ?? "")}>
                    {truncate(row.status === "rejected" ? row.admin_notes : row.request_reason, 60)}
                  </td>
                  <td className="py-1 pr-3 whitespace-nowrap">
                    {row.status === "refunded"
                      ? <span className="tier-badge bg-emerald-500/15 text-emerald-300 text-[10px]">refunded</span>
                      : <span className="tier-badge bg-rose-500/15 text-rose-300 text-[10px]">rejected</span>}
                  </td>
                  <td className="py-1 pr-3 font-mono text-text-on-dark/70 break-all" title={row.paddle_refund_id ?? ""}>
                    {row.paddle_refund_id ? truncate(row.paddle_refund_id, 18) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// "Blacklists" tab (2026-06-03) — admin add/remove wallet blacklist entries.
// Sub-tabs:
//   Mint   — form to add a NEW blacklist entry (wallet + reason + scope[]),
//            admin-signs EIP-191 "NoKLock blacklist add: <wallet>" → POST
//            /v1/admin/blacklist. Clears form + refetches the Minted list
//            on success.
//   Minted — read of GET /v1/admin/blacklist (admin-signed query). Table
//            shows wallet (truncated), reason (truncated), scopes as badges,
//            added_at, added_by, and a [Remove] button per row that opens a
//            confirmation modal → POST /v1/admin/blacklist/:id/remove.
// -----------------------------------------------------------------------------
type BlacklistSubTab = "mint" | "minted";

const BLACKLIST_SUBTAB_LABEL: Record<BlacklistSubTab, string> = {
  mint:   "Mint",
  minted: "Minted",
};

type BlacklistScope = "mint-license" | "use-license" | "heir-add" | "restore-quorum";

const BLACKLIST_SCOPE_LABEL: Record<BlacklistScope, string> = {
  "mint-license":   "Block new license mint",
  "use-license":    "Block existing license use",
  "heir-add":       "Block heir-add",
  "restore-quorum": "Block restore quorum",
};

// LOW-17: per-scope help text rendered as both a native title= tooltip on the
// (i) info icon AND as muted inline help under each checkbox row in the Mint
// sub-tab. Plain-English explanation of what each scope actually blocks
// downstream so an operator picks the right one(s) without consulting docs.
const BLACKLIST_SCOPE_HELP: Record<BlacklistScope, string> = {
  "mint-license":   "Blocks USDC license-NFT mint via paddle-webhook",
  "use-license":    "Blocks license-state reads + refund requests",
  "heir-add":       "Blocks designating new heirs + heir claim flow",
  "restore-quorum": "Blocks restore via quorum vote + owner-self-restore",
};

interface BlacklistEntry {
  readonly id: number;
  readonly wallet: string;
  readonly reason: string;
  readonly scopes: readonly string[];
  readonly addedAtTs: number;
  readonly addedByWallet: string;
  readonly removedAtTs: number | null;
  readonly removedByWallet: string | null;
}

const BLACKLIST_API = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

function AdminBlacklists(): JSX.Element {
  const [sub, setSub] = useState<BlacklistSubTab>("mint");
  // refetchKey lets the Mint tab signal "I just added, the Minted tab should
  // refetch on next mount." Bumped on add-success.
  const [refetchKey, setRefetchKey] = useState(0);
  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b border-bg-surface overflow-x-auto overflow-y-hidden">
        {(Object.keys(BLACKLIST_SUBTAB_LABEL) as BlacklistSubTab[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSub(s)}
            className={
              "px-3 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (sub === s
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {BLACKLIST_SUBTAB_LABEL[s]}
          </button>
        ))}
      </div>
      {sub === "mint" && (
        <AdminBlacklistMint
          onAdded={() => {
            setRefetchKey((k) => k + 1);
            setSub("minted");
          }}
        />
      )}
      {sub === "minted" && <AdminBlacklistMinted refetchKey={refetchKey} />}
    </div>
  );
}

function AdminBlacklistMint({ onAdded }: { readonly onAdded: () => void }): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const [wallet, setWallet] = useState("");
  const [reason, setReason] = useState("");
  const [scopes, setScopes] = useState<Record<BlacklistScope, boolean>>({
    "mint-license":   false,
    "use-license":    false,
    "heir-add":       false,
    "restore-quorum": false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedScopes = (Object.keys(scopes) as BlacklistScope[]).filter((s) => scopes[s]);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErr(null);
    setToast(null);
    const w = wallet.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(w)) {
      setErr("Wallet must be a 0x-prefixed 40-hex-char address.");
      return;
    }
    if (reason.trim().length < 1) {
      setErr("Reason is required.");
      return;
    }
    if (selectedScopes.length === 0) {
      setErr("Pick at least one scope.");
      return;
    }
    setSubmitting(true);
    try {
      const signature = await signMessageAsync({ message: `NoKLock blacklist add: ${w}` });
      const r = await fetch(`${BLACKLIST_API}/admin/blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: w, reason: reason.trim(), scopes: selectedScopes, signature }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        setErr(`Add failed (${r.status}): ${txt || "see server logs"}`);
        return;
      }
      setToast("Blacklist entry added.");
      setWallet("");
      setReason("");
      setScopes({ "mint-license": false, "use-license": false, "heir-add": false, "restore-quorum": false });
      onAdded();
    } catch (e) {
      setErr((e as Error).message ?? "signing failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card space-y-3" onSubmit={(e) => void submit(e)}>
      <h2 className="font-bold font-display">Add wallet to blacklist</h2>
      <label className="block">
        <span className="text-xs text-text-muted">Wallet address (0x…)</span>
        <input
          type="text"
          required
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-text-muted">Reason (required, internal note)</span>
        <textarea
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this wallet being blacklisted?"
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
        />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-xs text-text-muted mb-1">Scopes (pick at least one)</legend>
        {(Object.keys(BLACKLIST_SCOPE_LABEL) as BlacklistScope[]).map((s) => (
          <div key={s} className="space-y-0.5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopes[s]}
                onChange={(e) => setScopes({ ...scopes, [s]: e.target.checked })}
              />
              <span>{BLACKLIST_SCOPE_LABEL[s]}</span>
              <code className="text-[10px] text-text-muted">({s})</code>
              {/* LOW-17: (i) info icon with native tooltip — same text shown
                  inline below for discoverability without hover. */}
              <span
                role="img"
                aria-label={`What "${s}" blocks: ${BLACKLIST_SCOPE_HELP[s]}`}
                title={BLACKLIST_SCOPE_HELP[s]}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-bg-surface text-[10px] text-text-muted cursor-help select-none"
              >
                i
              </span>
            </label>
            <p className="text-[11px] text-text-muted ml-6">{BLACKLIST_SCOPE_HELP[s]}</p>
          </div>
        ))}
      </fieldset>
      {err && <div className="text-rose-300 text-sm">{err}</div>}
      {toast && <div className="text-accent-green text-sm">{toast}</div>}
      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Signing & submitting…" : "Sign & add to blacklist"}
      </button>
    </form>
  );
}

function AdminBlacklistMinted({ refetchKey }: { readonly refetchKey: number }): JSX.Element {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const [rows, setRows] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [includeRemoved, setIncludeRemoved] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function refetch(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      // Shared ops-session signature — one sign covers every admin READ for 24h.
      const cached = await ensureOpsSig(address, signMessageAsync);
      const qs = new URLSearchParams({ msg: cached.msg, sig: cached.sig });
      if (includeRemoved) qs.set("include_removed", "true");
      const r = await fetch(`${BLACKLIST_API}/admin/blacklist?${qs.toString()}`);
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        setErr(`List failed (${r.status}): ${txt || "see server logs"}`);
        setRows([]);
        return;
      }
      const data = (await r.json()) as { entries: BlacklistEntry[] };
      setRows(data.entries ?? []);
    } catch (e) {
      setErr((e as Error).message ?? "list failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refetch();
    // refetchKey + includeRemoved are the legitimate refetch triggers;
    // signMessageAsync is a stable wagmi callback ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey, includeRemoved]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    return r.wallet.toLowerCase().includes(search.trim().toLowerCase());
  });

  async function doRemove(id: number): Promise<void> {
    setRemoving(true);
    setErr(null);
    setToast(null);
    try {
      const signature = await signMessageAsync({ message: `NoKLock blacklist remove: ${id}` });
      const r = await fetch(`${BLACKLIST_API}/admin/blacklist/${id}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        setErr(`Remove failed (${r.status}): ${txt || "see server logs"}`);
        return;
      }
      setToast(`Removed entry #${id}.`);
      setConfirmRemoveId(null);
      await refetch();
    } catch (e) {
      setErr((e as Error).message ?? "remove failed");
    } finally {
      setRemoving(false);
    }
  }

  function truncMid(s: string, head = 6, tail = 4): string {
    if (s.length <= head + tail + 1) return s;
    return `${s.slice(0, head)}…${s.slice(-tail)}`;
  }

  function truncTail(s: string, n = 60): string {
    return s.length > n ? `${s.slice(0, n)}…` : s;
  }

  function fmtTs(ts: number | null): string {
    if (!ts) return "—";
    return new Date(ts * 1000).toISOString().slice(0, 19).replace("T", " ");
  }

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[12rem]">
          <span className="text-xs text-text-muted">Filter by address (substring, case-insensitive)</span>
          <input
            type="text"
            placeholder="0x… or partial"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeRemoved}
            onChange={(e) => setIncludeRemoved(e.target.checked)}
          />
          <span>Show removed</span>
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => void refetch()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {err && <div className="card text-rose-300 text-sm">{err}</div>}
      {toast && <div className="card text-accent-green text-sm">{toast}</div>}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-muted text-sm">No blacklist entries.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-bg-surface">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Wallet</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Scopes</th>
                <th className="py-2 pr-3">Added</th>
                <th className="py-2 pr-3">By</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isRemoved = r.removedAtTs !== null;
                return (
                  <tr key={r.id} className={"border-b border-bg-surface " + (isRemoved ? "opacity-50" : "")}>
                    <td className="py-2 pr-3 font-mono text-text-muted">{r.id}</td>
                    <td className="py-2 pr-3 font-mono text-xs" title={r.wallet}>{truncMid(r.wallet)}</td>
                    <td className="py-2 pr-3" title={r.reason}>{truncTail(r.reason, 60)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {r.scopes.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-bg-deepest border border-bg-surface text-[10px] font-mono">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-text-muted">{fmtTs(r.addedAtTs)}</td>
                    <td className="py-2 pr-3 font-mono text-xs" title={r.addedByWallet}>{truncMid(r.addedByWallet)}</td>
                    <td className="py-2 pr-3 text-xs">
                      {isRemoved ? (
                        <span className="text-text-muted">Removed {fmtTs(r.removedAtTs)}</span>
                      ) : (
                        <span className="text-accent-green">Active</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {!isRemoved && (
                        <button
                          type="button"
                          className="btn btn-danger text-xs"
                          onClick={() => setConfirmRemoveId(r.id)}
                          disabled={removing}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmRemoveId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="card max-w-md w-full space-y-3">
            <h3 className="font-bold font-display">Remove blacklist entry #{confirmRemoveId}?</h3>
            <p className="text-sm text-text-on-dark/80">
              This soft-deletes the entry (sets removed_at_ts + removed_by_wallet). The wallet will no longer be blocked from the configured scopes. You'll be asked to sign "NoKLock blacklist remove: {confirmRemoveId}".
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmRemoveId(null)} disabled={removing}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={() => void doRemove(confirmRemoveId)} disabled={removing}>
                {removing ? "Removing…" : "Sign & remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
