// @version 0.11.0 @date 2026-06-11
// 0.11.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.2): the
//          disconnected (Connect card) + reconnecting (busy card) branches
//          collapse into ONE shared <WalletGateCard/> via
//          `if (gate.status !== "connected") return <WalletGateCard/>`. Connect
//          buttons always live (incl. while restoring). Offchain-admin
//          fast-path + tier/whitelist panel UNCHANGED (auth not weakened).
// @version 0.10.0 @date 2026-06-11
// 0.10.0 — Daniel 2026-06-11: CONNECTED = TRUSTED, NEVER RE-VERIFY (companion
//          to useWalletGate 0.3.0, which now surfaces wagmi's address the
//          instant wagmi holds one instead of nulling it during the
//          status-string 'reconnecting' lag). Changes:
//
//          (a) The offchain-admin fast-path (0.9.0) now ALWAYS receives the
//              real address for a live wallet — so admins land on children
//              synchronously on every entry, including document loads.
//          (b) A CONNECTED wallet is never parked behind 'Verifying access…'
//              again. The licence + partner-whitelist queries still load
//              their DATA, but inline: the gate renders the access panel
//              immediately with the connected address visible and a one-line
//              "checking tier/invite list" note where the verdict will
//              appear. No full-card spinner holding the page, no Connect
//              button anywhere near a connected wallet. Auth is NOT
//              weakened: children render only for allowlisted admins or a
//              resolved premium-tier / whitelist verdict.
//          (c) DELETED the 15s stillSettling timeout + Retry/ConnectWallet
//              escape (0.8.1) and the reconnect() poke — band-aids around
//              the hook withholding the address; they could show a Connect
//              button to a wallet that never disconnected. No timer gates a
//              wallet anymore.
//          (d) 'reconnecting' is now genuinely no-address-only (hook
//              guarantee): calm unbounded busy card for the cold-boot
//              window. 'disconnected' (the ONLY Connect surface) is genuine:
//              no address + wagmi's reconnect cycle settled.
// @version 0.9.0 @date 2026-06-07
// 0.9.0 — Daniel-handoff §2.1 + §7.3 locked decision: auto-allow offchain
//         admins on /refer (consistent with OwnerOnly philosophy — admins
//         see admin surfaces instantly, no tier check, no whitelist
//         lookup). NEW optional prop `acceptOffchainAdmin?: boolean`,
//         default TRUE (the most common call site is /refer, where Daniel
//         wants the fast-path). Set to FALSE on any future call site that
//         should remain strictly tier/whitelist gated (e.g. a partner-
//         toolkit-only route that should NOT auto-allow admins). Imports
//         `isOffchainAdmin` from the shared `lib/offchainAdmins.ts`
//         single-source allow-list (handoff §2.3). The fast-path runs
//         AFTER the wallet-gate read (so we have a real address) but
//         BEFORE the still-settling / tier+whitelist branches, so an
//         offchain admin lands on the children immediately with zero
//         "Verifying access…" flash — matching the Treasury-wallet on-
//         /refer bug from the 2026-06-07 audit (would show
//         "Verifying access…" then fall through to not-authorised
//         because Treasury isn't a premium tier or whitelisted partner).
// @version 0.8.1 @date 2026-06-05
// 0.8.1 — Daniel 2026-06-05: same 15s timeout escape pattern as OwnerOnly
//         0.8.1. When stillSettling is true for longer than 15s (wagmi
//         stuck in 'reconnecting', OR licence/flag query never resolves),
//         flip the card to "Could not verify access — Retry" with a
//         button that calls wagmi.reconnect() + refetches the licence
//         + refreshes the partner-whitelist flag. useLicense 0.3.0 now
//         exposes refetch so this works (previously the hook didn't
//         expose it, which is why this fix landed one round after
//         OwnerOnly's). Mobile-fast-resolve case never sees the timeout.
// @version 0.8.0 @date 2026-06-04
// 0.8.0 — Daniel 2026-06-04: same chunk-size-race fix as OwnerOnly 0.8.0.
//         Collapses 'reconnecting' AND 'connected + licence/flag loading'
//         into ONE shared "Verifying access…" card. The chunk-size race
//         against wagmi's async hydration window (~10-200ms) becomes
//         invisible because the user sees the SAME card during both
//         phases. Only swaps to allowed/disallowed UI once both wagmi
//         and the licence + whitelist queries have settled.
// @version 0.7.0 @date 2026-06-04
// 0.7.0 — Daniel 2026-06-04 deep-dive refactor. Single-source via
//         useWalletGate(). Drops useAccount + useWalletStatus dual read.
//         During 'reconnecting' renders a quiet local spinner; during
//         'disconnected' renders ConnectWallet inline; during 'connected'
//         runs the licence/whitelist decision tree as before. No more
//         WalletReconnecting card (its grace + escalation timers are
//         gone in this refactor).
// @version 0.6.0 @date 2026-05-28
// 0.6.0 — Bug #8 STILL HAPPENING (the hard-refresh dialog flashes on every
//         gated-page nav). 0.5.0 gated on wagmi's RAW `status === "disconnected"`,
//         but wagmi still briefly flips through "disconnected" on every fresh
//         mount before the connector finishes binding — long enough for
//         WalletReconnecting's escalation timer to start. Now gates on OUR
//         debounced + hadWallet-aware store via useWalletStatus() — stays
//         "reconnecting" for previously-connected users throughout the bind
//         dance, so the gate never flashes WalletReconnecting on legitimate
//         page nav. (Companion change in OwnerOnly 0.5.0, Admin, and
//         WalletReconnecting 0.7.0 — all reading the same store now.)
// 0.5.0 — gated on wagmi raw `status === "disconnected"`.
// 0.4.0 — Bug #8 (Daniel: "wallet bouncing on gated pages — reconnect
//         attempts happen and fail when I'm already connected"). Root cause:
//         the gate consulted `useWalletSettling()` (a debounced store
//         reading) which can LAG behind wagmi's own `isConnected` by up to
//         800ms on navigation — so the gate would briefly render
//         <WalletReconnecting/> for a user whose wagmi state was already
//         "connected". Fix: check `useAccount().isConnected` directly as the
//         authoritative source. WalletReconnecting only renders when wagmi
//         itself reports !isConnected (i.e. a real disconnected / settling
//         state, not a debounce-lag artefact). Loading the licence/whitelist
//         is shown as a tiny inline pulse on the same page, not as a
//         full-card "checking access" intermediate state.
// 0.3.0 — Daniel: "connected or unconnected but not premium or granted
//         access to partners page should show [the same] box, just state
//         disconnected if wallet not conn." Unified the previously-separate
//         disconnected vs connected-but-no-access screens into one "Two
//         ways in" card; the wallet panel inside it reads "Disconnected" if
//         no wallet, or the connected address + tier otherwise. Also:
//         single not-connected surface uses <WalletReconnecting/> only
//         while wagmi is settling (no more dual-UI flicker — same fix as
//         OwnerOnly 0.3.0). Copy fix: "does the same job better and more
//         securely" (was "without those costs").
// 0.2.0 — Premium-tier OR selected-partner (env-baked whitelist replaced
//         with Form B app_flag).

import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ConnectWallet } from "./ConnectWallet.js";
import { useLicense } from "../hooks/useLicense.js";
import { useFlag } from "../hooks/useFlag.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { isOffchainAdmin } from "../lib/offchainAdmins.js";
import { BRAND_NAME } from "../lib/brand.js";
import {
  decidePartnerAccess,
  parsePartnerWhitelist,
  tierName,
  PARTNER_WHITELIST_FLAG_KEY,
} from "../lib/partnerAccess.js";

// 0.12.0 (Daniel 2026-06-15) — cache the resolved access verdict per wallet so a
// RETURNING allowed user (e.g. a Premium owner) renders the toolkit INSTANTLY on
// the next load / refresh / tab-switch, instead of re-reading the chain for
// several seconds and flashing a "checking / buy-Premium" gate every single
// time. useLicense's react-query cache is in-memory and dies on every refresh;
// this localStorage verdict survives it. The fresh on-chain verdict ALWAYS runs
// in the background and corrects the cache — this only removes the flash, it does
// not grant access (the ContestBuilder is a pure UI tool; any real on-chain
// action stays tier-enforced).
const ACCESS_CACHE_KEY = (addr: string): string => `noklock.partner-access.${addr.toLowerCase()}`;
function readCachedAccess(addr: string): boolean | null {
  try {
    const v = typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_CACHE_KEY(addr)) : null;
    return v === "1" ? true : v === "0" ? false : null;
  } catch { return null; }
}
function writeCachedAccess(addr: string, allowed: boolean): void {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(ACCESS_CACHE_KEY(addr), allowed ? "1" : "0"); } catch { /* ignore */ }
}

export function PartnerAccessGate({
  children,
  acceptOffchainAdmin = true,
}: {
  readonly children: ReactNode;
  /**
   * 0.9.0 — when true (default), offchain admins (per the env-baked
   * VITE_OFFCHAIN_ADMIN_ADDRESSES allow-list parsed in lib/offchainAdmins.ts)
   * get a fast-path that skips the tier + whitelist check entirely and
   * lands them on `children` immediately. Per handoff §2.1 + locked
   * decision §7.3, default-true is correct on /refer; future call sites
   * that should remain strictly tier/whitelist gated (e.g. partner-
   * toolkit-only routes that intentionally must NOT auto-allow admins)
   * pass `acceptOffchainAdmin={false}` explicitly.
   */
  readonly acceptOffchainAdmin?: boolean;
}): JSX.Element {
  // 0.7.0 — single-source via useWalletGate (replaces useAccount +
  // useWalletStatus dual-read race that caused the page-nav flash).
  const gate = useWalletGate();
  const address = gate.address;
  const { licence, loading: licenceLoading } = useLicense();
  const { value: rawWhitelist, loading: flagLoading } = useFlag(PARTNER_WHITELIST_FLAG_KEY, "");

  // ── 1. Offchain-admin fast-path (handoff §2.1 + §7.3 locked decision).
  // SYNCHRONOUS allowlist check of the connected address. useWalletGate
  // 0.3.0 guarantees `address` is populated whenever wagmi holds a live
  // address — including the document-load window where the status string is
  // still 'reconnecting' — so an admin lands on children immediately on
  // EVERY entry. `isOffchainAdmin(undefined)` returns false, so this is a
  // no-op for non-admins and the genuine no-address boot window. ──
  if (acceptOffchainAdmin && isOffchainAdmin(address)) {
    return <>{children}</>;
  }

  const connected = gate.status === "connected";
  const loading = licenceLoading || flagLoading;
  const whitelist = parsePartnerWhitelist(rawWhitelist || null);
  const decision = connected && !loading
    ? decidePartnerAccess({ address, tier: licence?.tier ?? 0, whitelist })
    : null;

  // Optimistic cache (see ACCESS_CACHE_KEY note): last-known verdict for this
  // wallet, + persist the fresh verdict whenever it resolves.
  const cachedAllowed = address ? readCachedAccess(address) : null;
  const freshAllowed = decision ? decision.allowed : null;
  useEffect(() => {
    if (address && freshAllowed !== null) writeCachedAccess(address, freshAllowed);
  }, [address, freshAllowed]);

  // ── ALLOWED — live, with a small unlocked badge so the partner sees their
  // access path. ──
  if (decision?.allowed) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 px-3 py-2 text-xs text-accent-green/90 flex items-center justify-between gap-3">
          <span>
            ✓ Toolkit unlocked —
            {decision.reason === "premium-tier"     && <> Premium-tier licence ({tierName(decision.tier)}).</>}
            {decision.reason === "selected-partner" && <> selected-partner invitation.</>}
          </span>
          <span className="font-mono text-[10px] text-text-muted">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
        </div>
        {children}
      </div>
    );
  }

  // ── OPTIMISTIC — a returning wallet we last verified as ALLOWED, while the
  // fresh on-chain verdict is still loading → render the toolkit IMMEDIATELY
  // (no flash, no re-verify wait). If the fresh verdict comes back not-allowed
  // it demotes to the locked preview below. This is the fix for "I'm Premium but
  // get gated on every load/refresh". ──
  if (connected && loading && cachedAllowed === true) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 px-3 py-2 text-xs text-accent-green/90 flex items-center justify-between gap-3">
          <span>✓ Toolkit unlocked.</span>
          <span className="font-mono text-[10px] text-text-muted">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
        </div>
        {children}
      </div>
    );
  }

  // ── CHECKING — connected, verdict still loading, no positive cache → a calm
  // NEUTRAL note. Critically NOT the locked/offer preview, so a Premium user
  // never sees "buy Premium" while their tier is merely loading. ──
  if (connected && loading) {
    return (
      <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 px-4 py-3 text-sm text-text-muted" aria-busy="true">
        Checking your access… your wallet stays connected — this is just your on-chain licence tier loading.
      </div>
    );
  }

  // ── LOCKED — Daniel 2026-06-15: this page IS public + directly linkable. Show
  // the WHOLE toolkit (readable, not blurred) but INERT — buttons greyed — with a
  // small red-bordered reminder of the qualifications above it. No big overlay, no
  // separate public page. Premium buyers + invited partners go live instantly on
  // connect; community owners get Premium FREE on joining (→ Lifetime at 10
  // signups). The cobrand card builder (the other subtab) stays fully live. ──
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-rose-500/40 bg-rose-950/15 px-3 py-2.5 text-xs space-y-2">
        <p className="text-text-on-dark/90">
          <strong className="text-rose-300">Locked</strong> — the contest builder needs a connected wallet with <strong>Premium</strong> (or a partner invite). You can read the whole thing below; the buttons go live the moment you qualify.
        </p>
        <p className="text-text-on-dark/80">
          <strong className="text-accent-cyan">Community owners:</strong> join {BRAND_NAME} and you get <strong>Premium free</strong> (which unlocks this) → <strong>Premium Lifetime at 10 signups</strong>.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          {!connected ? (
            <ConnectWallet />
          ) : (
            <span className="font-mono text-[10px] text-text-muted">connected {address?.slice(0, 6)}…{address?.slice(-4)} · {tierName(decision?.tier ?? 0)}</span>
          )}
          <Link to="/pricing" className="text-accent-cyan hover:underline">See Premium →</Link>
          <a href="https://calendly.com/noklockapp/30min" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">Book a call ↗</a>
        </div>
      </div>
      {/* Daniel 2026-06-16: the toolkit stays INTERACTIVE for everyone — the
          Partner Playbook (and the cobrand/contest planning tools) must work for
          not-connected users to build interest. The red reminder above states
          the qualifications; the live referral EARNINGS still need a Premium /
          invited wallet on-chain, but the planning docs work for all. */}
      <div>
        {children}
      </div>
    </div>
  );
}
