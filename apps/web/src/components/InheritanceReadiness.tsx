// @version 0.3.0 @date 2026-05-31
// 0.3.0 — Daniel 2026-05-31 (LMS-C): "i thought we had this but now i don't
//          see it". The checklist WAS shipped — but `<details>` defaults
//          to COLLAPSED so users don't see what's still missing. Fix:
//          auto-open the checklist when there's actionable incomplete
//          work (Step 1 not done, OR Step 2 started-but-not-finished).
//          Stay collapsed when fully complete OR when Step 1 done + Step 2
//          never started (the explicit "I'm not adding inheritance" case
//          — don't nag). The full guided-onboarding LMS-C is now this:
//          a pinned, auto-expanded completeness tracker that shows what's
//          still needed per the user's actual on-chain state.
// 0.2.1 — @date 2026-05-27
// 0.2.1 — Daniel: 0.2.0 went too hard with the "Two tracks, your choice"
//         framing. Soften to sequential — same item set, but rendered as
//         one linear list with two section headings: "Step 1 — Protect"
//         (create a vault; optional test-restore drill) followed by
//         "Step 2 — Optionally let someone inherit it" (designate NoK,
//         heartbeat, Live-Man alerts, guardians). Reads as "do this, then
//         this if you want" — not "pick a path". Same collapsible +
//         default-closed posture; closed-summary line lists Step 1 done/
//         not-done + Step 2 progress count.
// 0.2.0 — NoKLock is first a store/restore facility (never lose your
//         seed/letter/doc/image). Inheritance is OPTIONAL — add later or
//         never. Component is a <details> COLLAPSIBLE, default-collapsed,
//         mounted below the Dashboard header (not at top).
// 0.1.0 — Vault setup-COMPLETENESS tracker. Reads on-chain + local state and
//         shows, per step, what's done vs still needed, with a one-tap link
//         to each.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { useNokList } from "../hooks/useNokList.js";
import { readVaults } from "../routes/Vaults.js";
import { ALERTS_ADDR, alertsAbi, ORACLE_ADDR, oracleAbi, RECOVERY_ADDR } from "../lib/contracts.js";
import { recoveryAbi } from "../lib/recovery-contract.js";

const ZERO = "0x0000000000000000000000000000000000000000";
const TEST_RESTORE_KEY = "noklock.testrestore-done";

interface Item {
  readonly label: string;
  readonly href: string;
  readonly done: boolean;
  readonly required: boolean;
  readonly hint: string;
  readonly pending?: boolean;
  readonly onMark?: () => void;
}

export function InheritanceReadiness(): JSX.Element | null {
  const { address, isConnected } = useAccount();
  const vaults = useMemo(() => readVaults(), []);
  const nok = useNokList();
  const [testRestoreDone, setTestRestoreDone] = useState<boolean>(() => {
    try { return localStorage.getItem(TEST_RESTORE_KEY) === "1"; } catch { return false; }
  });

  const alertsLive = ALERTS_ADDR !== ZERO;
  const oracleLive = ORACLE_ADDR !== ZERO;
  const recoveryLive = RECOVERY_ADDR !== ZERO;

  const { data: lastHb } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "lastHeartbeat",
    args: address ? [address] : undefined,
    query: { enabled: !!address && oracleLive },
  });
  const { data: watchers } = useReadContract({
    address: ALERTS_ADDR, abi: alertsAbi, functionName: "getWatchers",
    args: address ? [address] : undefined,
    query: { enabled: !!address && alertsLive },
  });
  const { data: guardians } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "getGuardians",
    args: address ? [address] : undefined,
    query: { enabled: !!address && recoveryLive },
  });

  function markTestRestore(): void {
    try { localStorage.setItem(TEST_RESTORE_KEY, "1"); } catch { /* ignore */ }
    setTestRestoreDone(true);
  }

  if (!isConnected) return null;

  const hasVault = vaults.length > 0;
  const hasNok = !nok.loading && (nok.entries?.length ?? 0) > 0;
  const hbDone = !!lastHb && Number((lastHb as readonly [bigint, number])[0]) > 0;
  const watcherCount = ((watchers as readonly string[] | undefined) ?? []).length;
  const alertsDone = alertsLive && watcherCount > 0;
  const guardianCount = ((guardians as readonly string[] | undefined) ?? []).length;
  const guardiansDone = guardianCount > 0;

  // TRACK A — Store & restore (the foundation). Once Track A is done, NoKLock
  // is delivering its primary job: a safe, recoverable place for a seed /
  // letter / document / image. Inheritance is irrelevant unless the user
  // chooses to layer it on.
  const trackAItems: Item[] = [
    { label: "Create your first vault", href: "/enrol", done: hasVault, required: true,
      hint: "Split + encrypt a seed phrase, sealed letter, document or image. The moment this is done you have a working store-and-restore facility — usable on its own, immediately, without ever adding an heir." },
    { label: "Run a test-restore drill", href: "/restore", done: testRestoreDone, required: false, onMark: markTestRestore,
      hint: "Prove you can actually rebuild a vault from your shares + master password BEFORE you ever need to. Then mark it done here." },
  ];

  // TRACK B — Inheritance (optional layer). Layer on top of Track A whenever
  // the user wants; existing vaults are unchanged.
  const trackBItems: Item[] = [
    { label: "Designate a next-of-kin", href: "/nok", done: hasNok, required: true,
      hint: "Add an heir by WALLET (they already have one) or by EMAIL (Hybrid-E — they don't). For higher stakes, designate several for an M-of-N quorum." },
    { label: "Send your first heartbeat", href: "/heartbeat", done: hbDone, required: true,
      hint: "Arms the dead-man's switch. One check-in proves you're alive; while you check in within the grace period, nothing changes." },
    { label: "Set up Live-Man's Switch alerts", href: "/live-mans-switch", done: alertsDone, required: false, pending: !alertsLive,
      hint: alertsLive
        ? "Register a wallet you watch (+ optional email) so you're warned out-of-band if a recovery is ever started against you — and can cancel it in time."
        : "Activates with the next on-chain deploy." },
    { label: "Add guardians for self-recovery", href: "/recovery", done: guardiansDone, required: false,
      hint: "If YOU lose access to your own wallet, an M-of-N guardian quorum can recover your designation — with a cancellation window you control." },
  ];

  const trackAReq = trackAItems.filter((i) => i.required);
  const trackADone = trackAReq.filter((i) => i.done).length;
  const trackAReady = trackADone === trackAReq.length;

  const trackBReq = trackBItems.filter((i) => i.required && !i.pending);
  const trackBDone = trackBReq.filter((i) => i.done).length;
  const trackBReady = trackBReq.length > 0 && trackBDone === trackBReq.length;
  const trackBStarted = trackBItems.some((i) => i.done);

  const summary =
    trackAReady && trackBReady ? "Step 1 ✓ · Step 2 ✓"
    : trackAReady && trackBStarted ? `Step 1 ✓ · Step 2 (optional) ${trackBDone}/${trackBReq.length}`
    : trackAReady ? "Step 1 ✓ · Step 2 (optional) — not started"
    : "Step 1 — create your first vault";

  const borderTone =
    trackAReady && trackBReady ? "border-accent-green/50"
    : trackAReady ? "border-bg-surface"
    : "border-amber-500/40";

  // 0.3.0 — Auto-expand when there's actionable work, collapse when there
  // isn't. The "Step 1 done + Step 2 not started" case is intentional opt-out
  // (user picked store-only, no inheritance) → stay collapsed, don't nag.
  const shouldExpand = !trackAReady || (trackBStarted && !trackBReady);

  return (
    <details {...(shouldExpand ? { open: true } : {})} className={`card ${borderTone} group`}>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold font-display flex-1 min-w-0">
          <span className="grad">Vault setup</span>
          <span className="text-text-muted text-xs font-normal ml-2">— protect first, then optionally let someone inherit it</span>
        </h2>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono text-text-muted">{summary}</span>
          <span className="text-accent-cyan text-xl shrink-0 group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3 text-xs text-text-on-dark/85">
          Most people just want to make sure they can't lose access to a seed phrase / letter / document / image — and that nobody else can either. That's <strong>Step&nbsp;1</strong>. <strong>Step&nbsp;2</strong> is optional: if you also want someone to be able to claim it when you're gone, you layer the inheritance pieces on top — now, later, or never.
        </div>

        <div>
          <h3 className="font-bold font-display text-sm mb-2">
            <span className="grad">Step 1 — Protect</span>
            <span className="text-xs text-text-muted ml-2 font-normal">{trackAReady ? "✓ done" : "the foundation"}</span>
          </h3>
          <ItemList items={trackAItems} />
        </div>

        <div>
          <h3 className="font-bold font-display text-sm mb-2">
            <span className="grad">Step 2 — Optionally let someone inherit it</span>
            <span className="text-xs text-text-muted ml-2 font-normal">{trackBReady ? "✓ done" : trackBStarted ? `${trackBDone}/${trackBReq.length} essentials` : "optional · add now or later"}</span>
          </h3>
          <p className="text-xs text-text-muted mb-2">Adds an heir on-chain + the dead-man's switch. Your Step&nbsp;1 vaults are unchanged.</p>
          <ItemList items={trackBItems} />
        </div>
      </div>
    </details>
  );
}

function ItemList({ items }: { readonly items: readonly Item[] }): JSX.Element {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-start gap-3 border-b border-bg-surface/30 pb-2 last:border-0">
          <span className={`mt-0.5 text-lg leading-none ${it.done ? "text-accent-green" : it.pending ? "text-text-muted" : it.required ? "text-amber-300" : "text-text-muted"}`}>
            {it.done ? "✓" : it.pending ? "•" : "○"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className={it.done ? "text-text-on-dark/70 line-through" : "text-text-on-dark"}>{it.label}</span>
              {!it.required && <span className="text-[10px] uppercase tracking-wider text-text-muted ml-2">optional</span>}
              {it.pending && <span className="text-[10px] uppercase tracking-wider text-text-muted ml-2">soon</span>}
            </div>
            <div className="text-[11px] text-text-muted leading-tight mt-0.5">{it.hint}</div>
          </div>
          {!it.done && (
            <div className="flex items-center gap-2 shrink-0">
              <Link to={it.href} className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">{it.pending ? "Learn more" : "Set up →"}</Link>
              {it.onMark && <button onClick={it.onMark} className="text-[11px] text-text-muted hover:underline">mark done</button>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
