// @version 0.9.0 @date 2026-06-11
// 0.9.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.3):
//         reconnecting + disconnected branches collapse into ONE
//         <WalletGateCard/> (connect buttons always live) +
//         <ConnectExplainer/>. Store/restore framing line removed from the
//         connected header earlier this session per Daniel.
// @version 0.8.0 @date 2026-06-11
// 0.8.0 — Daniel 2026-06-11: CONNECTED = TRUSTED, NEVER RE-VERIFY (companion
//         to useWalletGate 0.3.0). This page gates purely on gate.status, so
//         the load-bearing fix is in the hook: it now reports 'connected'
//         the instant wagmi holds an address (wagmi exposes the persisted
//         account during its 'reconnecting' status; the old hook discarded
//         it, which is why navigating to /dashboard with a live wallet
//         showed 'Reconnecting your wallet…' and — after the hook's old 10s
//         deadline — a Connect card to a wallet that never disconnected).
//         With 0.3.0: a wallet with a live address renders the dashboard
//         immediately on every entry; 'reconnecting' here is now GENUINELY
//         the no-address-yet cold boot only; 'disconnected' (the only
//         Connect surface) is genuine disconnection. Licence + on-chain
//         reads load their data inline as before — they never block the
//         page. Card copy updated to match ("Connecting to your wallet…").
// @version 0.7.0 @date 2026-06-10
// 0.7.0 — Daniel 2026-06-10: add a persistent refund-info box at the bottom
//         of the connected-wallet dashboard. Two states driven by the
//         /v1/billing/subscription-state response:
//           • paymentMethod === "paddle" → active "Request refund" button
//             routing to /refund (same destination as Settings.tsx 0.9.0).
//           • paymentMethod !== "paddle" (crypto, admin-grant, null/unknown)
//             → greyed/disabled button + one-line non-refundable note +
//             link to /refund-policy.
//         Uses the same endpoint as Refund.tsx and Settings.tsx but reads
//         the CORRECT nested envelope (body.subscription.payment_method,
//         per the 0.4.2 fix in Refund.tsx — Settings.tsx 0.9.0 reads the
//         wrong top-level body.paymentMethod and has that bug; Dashboard
//         reads it correctly from the start). Only renders once wallet is
//         connected; the subscription fetch is best-effort (null → non-
//         refundable state, no error surfaced — quiet fallback). Matches
//         the card styling of the existing Dashboard sections.
// 0.6.0 — migrate off useWalletSettling shim onto useWalletGate directly.
//         The page now reads gate.status's tri-state (connected |
//         reconnecting | disconnected) and renders the page chrome plus
//         an inline indicator for each non-connected state — instead of a
//         full-subtree WalletReconnecting replacement. Reconnecting users
//         see the Dashboard header + framing copy with a small
//         "Reconnecting your wallet…" card where the dashboard content
//         will appear; disconnected users see the existing Connect card +
//         ConnectExplainer (unchanged UX). WalletReconnecting import
//         removed (no longer needed).
// 0.5.0 — launch-blocker-1-owner-cancel-window: mounted new
//         <PendingActivations/> banner directly below <HeartbeatReminderCard/>
//         (same urgency tier). Shows pending NoK activations where the
//         owner-cancel-window has not yet elapsed + walks the owner through
//         signing the Form B cancel attestation AND burning the SBT on-chain
//         in a single click. Hidden when there's nothing to act on (the
//         component returns null when its list is empty — zero-attention
//         default for healthy owners).
// 0.4.1 — FIX-COPY 3: vault-storage scope copy now says
//         "this browser profile" (not "this browser" — same browser,
//         different profile on same laptop = different vault list).
//         Dashboard header parenthetical + Section J framing updated.
// 0.4.0 — Daniel: dashboard reorg + reframe.
//         1) <InheritanceReadiness/> moved from the very top to BELOW the
//            page header (so wallet + subscription-tier appear first), and
//            it now renders as a default-collapsed <details> card so it
//            doesn't dominate the page for users who've already set up.
//         2) Reframed: NoKLock is primarily a store/restore facility — the
//            inheritance layer is OPTIONAL. The component (0.2.0) now shows
//            Track A (Store & restore) and Track B (Add inheritance) side
//            by side; copy in the Dashboard header reinforces this.
// 0.3.0 — Section J "honest 'protected & alive?' cockpit". Bug fix:
//          "Your vaults" card no longer hardcodes "No vaults enrolled…"
//          and IGNORES the real localStorage state — it now reads
//          readVaults() and shows the real count + a per-kind breakdown.
//          Added: heartbeat status (last + grace + Send heartbeat), heir
//          coverage (X of Y vaults have a NoK — via useNokList filtered
//          per vault), Settings defaults read-out (threshold / total
//          shares / grace period), "needs attention" list (overdue
//          heartbeat / vault with no NoK / no test-restore on vault Z),
//          and quick-actions row. Honest framing: "this browser profile,
//          not your device, not your wallet, not synced — recovery is
//          browser-and-device-independent via Restore."
// 0.2.5 — Reconnect guard via useWalletSettling.

import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { Link } from "react-router-dom";
import { useLicense } from "../hooks/useLicense.js";
import { useNokList } from "../hooks/useNokList.js";
import { useHeartbeat } from "../hooks/useHeartbeat.js";
import { HeartbeatReminderCard } from "../components/HeartbeatReminderCard.js";
import { PendingActivations } from "../components/PendingActivations.js";
import { ChainlinkLowBalanceBanner } from "../components/ChainlinkUpkeepStatus.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { ConnectExplainer } from "../components/ConnectExplainer.js";
import { InheritanceReadiness } from "../components/InheritanceReadiness.js";
import { readVaults } from "./Vaults.js";
import { ORACLE_ADDR, oracleAbi } from "../lib/contracts.js";
import { BRAND_NAME } from "../lib/brand.js";

const SETTINGS_KEY = "noklock.settings"; // existing Settings store key

interface StoredSettings {
  readonly threshold?: number;
  readonly totalShares?: number;
  readonly graceDays?: number;
}

function readSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredSettings;
  } catch { return {}; }
}

export function Dashboard(): JSX.Element {
  const gate = useWalletGate();
  const address = gate.address;
  const isConnected = gate.status === "connected";
  const { licence, loading: licenceLoading } = useLicense();
  const vaults = useMemo(() => readVaults(), []);
  const settings = useMemo(() => readSettings(), []);
  const nok = useNokList();
  const hb = useHeartbeat();

  // On-chain reads.
  const contractsLive = ORACLE_ADDR !== "0x0000000000000000000000000000000000000000";
  const { data: lastHb } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "lastHeartbeat",
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsLive, refetchInterval: 30_000 },
  });
  const { data: graceOverride } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "gracePeriodOverride",
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsLive, refetchInterval: 60_000 },
  });

  // Heartbeat status — grace = override if set, else DEFAULT 60 days.
  const lastHbTs = lastHb ? Number((lastHb as readonly [bigint, number])[0]) : 0;
  const graceSec = Number(graceOverride ?? 0) || 60 * 24 * 60 * 60;
  const nowSec = Math.floor(Date.now() / 1000);
  const elapsed = lastHbTs > 0 ? nowSec - lastHbTs : 0;
  const timeLeft = lastHbTs > 0 ? Math.max(0, graceSec - elapsed) : graceSec;
  const heartbeatBand: "healthy" | "due-soon" | "overdue" =
    lastHbTs === 0 ? "due-soon" : elapsed >= graceSec ? "overdue" : timeLeft < graceSec * 0.2 ? "due-soon" : "healthy";

  // Per-kind vault counts.
  const counts = useMemo(() => {
    const c = { seed: 0, letter: 0, document: 0 };
    for (const v of vaults) {
      if (v.kind === "seed") c.seed++;
      else if (v.kind === "letter") c.letter++;
      else if (v.kind === "document") c.document++;
    }
    return c;
  }, [vaults]);

  // Heir coverage — count of vaults that have at least one NoK Activation.
  const heirCoverage = useMemo(() => {
    if (nok.loading) return null;
    const vaultsWithNok = new Set<string>();
    for (const e of nok.entries) {
      vaultsWithNok.add(e.vaultId.toLowerCase());
    }
    let covered = 0;
    for (const v of vaults) {
      // vaultId in localStorage is the canonical string; nok list uses 0x-padded bytes32.
      // Compare both shapes — if either form matches, count it.
      const a = v.vaultId.toLowerCase();
      const aPad = a.startsWith("0x") ? a : "0x" + a.padStart(64, "0");
      if (vaultsWithNok.has(a) || vaultsWithNok.has(aPad)) covered++;
    }
    return { covered, total: vaults.length };
  }, [nok.loading, nok.entries, vaults]);

  // "Needs attention" — honest nudges replacing the fake "quarterly audit".
  const needsAttention = useMemo<string[]>(() => {
    const items: string[] = [];
    if (heartbeatBand === "overdue") items.push("Your heartbeat is overdue — send one or your switch will fire when Chainlink Automation polls next.");
    if (heartbeatBand === "due-soon" && lastHbTs > 0) items.push("Your heartbeat is due soon — consider sending one before grace runs out.");
    if (vaults.length > 0 && heirCoverage && heirCoverage.covered < heirCoverage.total) items.push(`${heirCoverage.total - heirCoverage.covered} of your vaults have no designated NoK on-chain. Inheritance won't fire for those.`);
    if (vaults.length === 0) items.push("No vaults enrolled in this browser yet. Open Enrol to seal your first one.");
    return items;
  }, [heartbeatBand, lastHbTs, vaults.length, heirCoverage]);

  // 0.9.0 — NOT connected (genuine disconnection OR no-address-yet boot). ONE
  // surface: WalletGateCard (connect buttons always live). A wallet with a
  // live address reports 'connected' and never reaches here. ConnectExplainer
  // is educational content below the card, not a competing dialog.
  if (gate.status !== "connected") {
    return (
      <div className="space-y-4">
        <WalletGateCard
          title="Connect a wallet to see your dashboard"
          note={`${BRAND_NAME} identifies you by wallet address — no email, no password. Connecting is read-only — it shares your address, nothing else.`}
        />
        <ConnectExplainer />
      </div>
    );
  }

  // Defensive — TypeScript narrowing: at this point gate.status === "connected"
  // and address is defined. The isConnected local stays true.
  if (!isConnected) return null as unknown as JSX.Element;

  return (
    <div className="space-y-6">
      {/* Home-screen LINK alert (Daniel 2026-06-15) — renders nothing unless the
          dead-man's-switch upkeep's LINK is LOW/CRITICAL, then prompts anyone to
          top it up permissionlessly so the switch never silently dies. */}
      <ChainlinkLowBalanceBanner />

      {/* Top — wallet + licence + framing */}
      <div className="card">
        <h1 className="text-2xl font-bold font-display"><span className="grad">Dashboard</span></h1>
        <p className="text-text-muted text-sm mt-1">
          This page lives in <strong>this browser profile</strong> (a different browser or profile on the same laptop shows a different list — recovery is browser-and-device-independent via <Link to="/restore" className="text-accent-cyan underline">Restore</Link>).
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-muted">Wallet</div>
            <div className="font-mono break-all">{address}</div>
          </div>
          <div>
            <div className="text-text-muted">Subscription tier</div>
            <div className="font-bold">{licenceLoading ? "Reading on-chain…" : licence?.name ?? "Free"}</div>
            {!licenceLoading && (
              <Link to="/pricing" className="text-xs text-accent-cyan underline">View pricing / upgrade</Link>
            )}
          </div>
        </div>
      </div>

      {/* Vault-setup tracker (Track A + Track B) — collapsed by default */}
      <InheritanceReadiness />

      {/* Heartbeat — the centrepiece */}
      <div className="card">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-bold font-display">Heartbeat &amp; grace period</h2>
          <span className={`text-xs font-bold uppercase tracking-wider ${heartbeatBand === "healthy" ? "text-accent-teal" : heartbeatBand === "due-soon" ? "text-amber-400" : "text-danger"}`}>
            {heartbeatBand === "healthy" ? "Healthy" : heartbeatBand === "due-soon" ? "Due soon" : "Overdue"}
          </span>
        </div>
        <p className="text-text-muted text-sm mt-1">
          One heartbeat covers <strong>all your vaults on this wallet</strong> — the switch is per-wallet, not per-vault.
        </p>
        <table className="text-sm mt-3">
          <tbody>
            <tr><td className="text-text-muted pr-3 py-0.5">Last heartbeat</td><td className="font-mono">{lastHbTs > 0 ? new Date(lastHbTs * 1000).toISOString().slice(0, 16).replace("T", " ") + "Z" : "never"}</td></tr>
            <tr><td className="text-text-muted pr-3 py-0.5">Grace period</td><td className="font-mono">{Math.round(graceSec / 86400)} days{graceOverride && Number(graceOverride) > 0 ? " (custom)" : " (default)"}</td></tr>
            <tr><td className="text-text-muted pr-3 py-0.5">Time left in grace</td><td className="font-mono">{lastHbTs > 0 ? formatDuration(timeLeft) : "—"}</td></tr>
          </tbody>
        </table>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button className="btn btn-primary text-sm" onClick={() => void hb.signAndPost()} disabled={hb.step === "posting" || hb.step === "sending-onchain"}>
            {hb.step === "posting" || hb.step === "sending-onchain" ? "Sending…" : "Send heartbeat"}
          </button>
          <Link to="/heartbeat" className="btn btn-secondary text-sm">Heartbeat page →</Link>
        </div>
      </div>

      {/* Vaults summary — fixes the hardcoded "No vaults" bug */}
      <div className="card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold font-display">Your vaults</h2>
          <Link to="/vaults" className="text-xs text-accent-cyan underline">View / manage →</Link>
        </div>
        {vaults.length === 0 ? (
          <>
            <p className="text-text-muted text-sm mt-1">
              Nothing enrolled in this browser yet. Protect a seed phrase, a sealed letter, a document or an image — split, encrypted and offline-safe.
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Link to="/enrol" className="btn btn-primary text-sm">Enrol your first vault</Link>
              <Link to="/restore" className="btn btn-secondary text-sm">…or Restore a vault from shares</Link>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Already enrolled vaults on another browser/device? They don't show here (we hold no server record of your vaults). Use <Link to="/restore" className="text-accent-cyan underline">Restore</Link> with your shares + master password — that works on any device.
            </p>
          </>
        ) : (
          <>
            <p className="text-text-muted text-sm mt-1">
              {vaults.length} vault{vaults.length === 1 ? "" : "s"} sealed in this browser. <span className="text-accent-cyan">{counts.seed}</span> seed, <span className="text-amber-300">{counts.letter}</span> sealed-letter, <span className="text-violet-300">{counts.document}</span> document/image.
            </p>
            {heirCoverage && (
              <p className="text-sm mt-2">
                Heir coverage: <strong className="text-text-on-dark">{heirCoverage.covered} of {heirCoverage.total} vaults have a designated NoK on-chain</strong>.
              </p>
            )}
            <div className="mt-3 flex gap-2 flex-wrap">
              <Link to="/vaults" className="btn btn-secondary text-sm">Manage vaults</Link>
              <Link to="/nok" className="btn btn-secondary text-sm">Manage NoKs</Link>
              <Link to="/enrol" className="text-xs text-accent-cyan underline self-center">+ enrol another</Link>
            </div>
          </>
        )}
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div className="card border-amber-500/30 border bg-amber-500/5">
          <h2 className="text-xl font-bold font-display mb-2 text-amber-200">Needs your attention</h2>
          <ul className="text-sm text-text-on-dark/90 space-y-1">
            {needsAttention.map((n, i) => (
              <li key={i} className="flex gap-2"><span className="text-amber-400">·</span><span>{n}</span></li>
            ))}
          </ul>
        </div>
      )}

      <HeartbeatReminderCard />
      {/* LAUNCH-BLOCKER 1: owner cancel-window. Hidden when no pending
          activations need owner attention (component returns null). */}
      <PendingActivations />

      {/* Defaults readout — Daniel-requested */}
      <div className="card">
        <h2 className="text-xl font-bold font-display mb-2">Your defaults</h2>
        <p className="text-text-muted text-sm mb-3">
          From <Link to="/settings" className="text-accent-cyan underline">Settings</Link>. Change them there.
        </p>
        <table className="text-sm">
          <tbody>
            <tr><td className="text-text-muted pr-4 py-0.5">Threshold (T)</td><td className="font-mono">{settings.threshold ?? "2"}</td></tr>
            <tr><td className="text-text-muted pr-4 py-0.5">Total shares (N)</td><td className="font-mono">{settings.totalShares ?? "3"}</td></tr>
            <tr><td className="text-text-muted pr-4 py-0.5">Grace period</td><td className="font-mono">{settings.graceDays ? `${settings.graceDays} days` : "60 days (default)"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction to="/enrol" title="Enrol" body="Seal a new vault" />
        <QuickAction to="/restore" title="Restore" body="Rebuild from shares" />
        <QuickAction to="/nok" title="NoK" body="Manage heirs (wallet or email)" />
        <QuickAction to="/prove-it" title="Prove-It" body="Try the whole pipeline on test data" />
      </div>

      {/* Refund info — persistent, two-state: Paddle → active button; crypto/admin-grant → greyed */}
      <DashboardRefundBox address={address} />
    </div>
  );
}

function QuickAction({ to, title, body }: { readonly to: string; readonly title: string; readonly body: string }): JSX.Element {
  return (
    <Link to={to} className="card hover:border-accent-cyan transition-colors">
      <h3 className="font-bold font-display mb-1">{title}</h3>
      <p className="text-text-muted text-xs">{body}</p>
    </Link>
  );
}

function formatDuration(sec: number): string {
  if (sec <= 0) return "—";
  const days = Math.floor(sec / 86400);
  if (days >= 2) return `${days} days`;
  const hours = Math.floor(sec / 3600);
  if (hours >= 2) return `${hours} h ${Math.floor((sec % 3600) / 60)} min`;
  const mins = Math.floor(sec / 60);
  return `${mins} min ${sec % 60} s`;
}

// ---------------------------------------------------------------------------
// DashboardRefundBox — 0.7.0 (Daniel 2026-06-10)
// Persistent two-state refund surface at the bottom of the dashboard.
// Reads /v1/billing/subscription-state using the CORRECT nested envelope
// (body.subscription.payment_method — per Refund.tsx 0.4.2 fix). Two states:
//   • paymentMethod === "paddle" → active "Request a refund" link → /refund
//   • everything else (crypto, admin-grant, null, unreachable) → greyed
//     disabled button + one-line "non-refundable" note + /refund-policy link.
// Best-effort fetch: on network error / disconnect → shows greyed state quietly.
// ---------------------------------------------------------------------------

const DASHBOARD_REFUND_API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.noklock.app").replace(/\/+$/, "");

type DashboardPaymentMethod = "paddle" | "crypto" | null;

function DashboardRefundBox({ address }: { readonly address: `0x${string}` | undefined }): JSX.Element {
  const [paymentMethod, setPaymentMethod] = useState<DashboardPaymentMethod | "loading">("loading");

  useEffect(() => {
    if (!address) {
      setPaymentMethod(null);
      return;
    }
    let cancelled = false;
    setPaymentMethod("loading");
    void (async () => {
      try {
        const r = await fetch(
          `${DASHBOARD_REFUND_API_BASE}/v1/billing/subscription-state?wallet=${encodeURIComponent(address)}`,
        );
        if (!r.ok) {
          if (!cancelled) setPaymentMethod(null);
          return;
        }
        // Read from the correct nested envelope (body.subscription.payment_method).
        // The Refund.tsx 0.4.2 fix confirmed the top-level body.paymentMethod is
        // always undefined — the value lives inside body.subscription.payment_method.
        const body = (await r.json()) as {
          subscription?: { payment_method?: unknown };
        };
        if (cancelled) return;
        const raw = body.subscription?.payment_method;
        const pm: DashboardPaymentMethod =
          raw === "paddle" ? "paddle" : raw === "crypto" ? "crypto" : null;
        setPaymentMethod(pm);
      } catch {
        if (!cancelled) setPaymentMethod(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const isPaddle = paymentMethod === "paddle";
  const isLoading = paymentMethod === "loading";

  return (
    <div className="card space-y-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="text-xl font-bold font-display">Refund</h2>
        {!isLoading && !isPaddle && (
          <span className="text-xs text-text-muted">
            {paymentMethod === "crypto"
              ? "Crypto (on-chain) — non-refundable"
              : "Admin-granted or no paid subscription — non-refundable"}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-text-muted">Checking subscription…</p>
      ) : isPaddle ? (
        <>
          <p className="text-sm text-text-on-dark/90">
            You subscribed via card (Paddle). You have a statutory 14-day right
            of withdrawal. Use the refund page to check eligibility and submit
            a request.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/refund"
              className="inline-flex items-center justify-center rounded-md bg-accent-cyan text-bg-base font-bold px-4 py-2 hover:opacity-90 text-sm"
            >
              Request a refund
            </Link>
            <Link
              to="/refund-policy"
              className="inline-flex items-center justify-center rounded-md border border-accent-cyan text-accent-cyan font-bold px-4 py-2 hover:bg-accent-cyan/10 text-sm"
            >
              Refund Policy
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-text-on-dark/80">
            Crypto and admin-granted licences are non-refundable — on-chain
            transactions are irreversible. Case-by-case credit may apply.{" "}
            <Link to="/refund-policy" className="text-accent-cyan hover:underline">
              Read the Refund Policy →
            </Link>
          </p>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex items-center justify-center rounded-md border border-bg-surface bg-bg-deepest text-text-muted font-bold px-4 py-2 cursor-not-allowed text-sm opacity-60"
            title="Not available — crypto and admin-granted licences are non-refundable"
          >
            Request a refund
          </button>
        </>
      )}
    </div>
  );
}
