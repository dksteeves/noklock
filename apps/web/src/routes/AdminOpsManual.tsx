// @version 0.3.0 @date 2026-05-22
// 0.3.0 — + "Done log" mode (Daniel): lists everything marked done, newest
//         first, with one-click Unmark to move an item back to the live
//         checklist. Three modes now: Static checklist / Live status / Done log.
// Section N — Admin Ops Manual. Modes:
//   • Static checklist — now ACTION-ORIENTED (Daniel 2026-05-22): grouped by
//     STATUS (action-required-now / due-soon / on-schedule / on-trigger)
//     instead of a flat text list, computed from each item's cadence + when
//     you last logged it done. Every item can be assigned to the Human or AI
//     team and handed off with one click — a ready-to-paste Claude prompt for
//     AI tasks, a clean details block for a person. Per-item state is local
//     (lib/opsState.ts). Print kept.
//   • Live status — traffic-light tiles for items with /v1/ops/* endpoints
//     (owner-signed). Chainlink tile tidied (truncated upkeep id + a real
//     "top up" link instead of the overflowing raw number/URL).
// 0.1.0 — initial (static <details> by domain/cadence + live tiles).

import { useMemo, useState } from "react";
import { OpsTile } from "../components/OpsTile.js";
import { useOpsLive } from "../hooks/useOpsLive.js";
import { OPS_CATALOGUE, DOMAIN_LABEL, CADENCE_LABEL, type OpsItem } from "../data/ops-manual.js";
import {
  getItemState, markDone, clearDone, setAssignee, defaultAssignee, computeDue,
  buildClaudePrompt, buildDetails, type Assignee, type DueInfo, type OpsStatus,
} from "../lib/opsState.js";

type Mode = "static" | "live" | "done";

export function AdminOpsManual(): JSX.Element {
  const [mode, setMode] = useState<Mode>("static");
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold font-display"><span className="grad">Ops Manual</span></h2>
          <p className="text-text-muted text-sm">Daily / weekly / monthly / quarterly / annual / event-triggered / incident-response. One source of truth for every check, action and runbook. Static view never needs network; live view fetches counts via owner-signed /v1/ops/* endpoints.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMode("static")} className={`px-3 py-1.5 rounded text-sm border ${mode === "static" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}>Static checklist</button>
          <button onClick={() => setMode("live")} className={`px-3 py-1.5 rounded text-sm border ${mode === "live" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}>Live status</button>
          <button onClick={() => setMode("done")} className={`px-3 py-1.5 rounded text-sm border ${mode === "done" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}>Done log</button>
        </div>
      </div>

      {mode === "static" && <StaticChecklist />}
      {mode === "live" && <LiveStatus />}
      {mode === "done" && <DoneLog />}
    </div>
  );
}

// Everything marked done — newest first — with one-click unmark (back to live).
function DoneLog(): JSX.Element {
  const [tick, setTick] = useState(0);
  const onChange = (): void => setTick((t) => t + 1);
  const rows = useMemo(() =>
    OPS_CATALOGUE
      .map((it) => ({ it, st: getItemState(it.id) }))
      .filter((r) => !!r.st.lastDoneTs)
      .map((r) => ({ ...r, due: computeDue(r.it, r.st) }))
      .sort((a, b) => (b.st.lastDoneTs ?? 0) - (a.st.lastDoneTs ?? 0)),
  [tick]);

  if (rows.length === 0) {
    return <p className="text-text-muted text-sm">Nothing marked done yet. Tick items in the Static checklist and they'll log here.</p>;
  }
  return (
    <div className="space-y-2 text-sm">
      <p className="text-text-muted text-xs">{rows.length} item{rows.length === 1 ? "" : "s"} logged done. Unmark to move one back to the live checklist.</p>
      {rows.map((r) => (
        <div key={r.it.id} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-text-on-dark">{r.it.title}</strong>
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{DOMAIN_LABEL[r.it.domain]}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{CADENCE_LABEL[r.it.cadence]}</span>
            </div>
            <div className="text-xs text-text-muted mt-0.5">{r.due.lastLabel ?? "done"} · {r.due.label}</div>
          </div>
          <button onClick={() => { clearDone(r.it.id); onChange(); }} className="text-[11px] px-2 py-1 rounded bg-bg-surface text-amber-300 hover:opacity-80 shrink-0">↩ Unmark</button>
        </div>
      ))}
    </div>
  );
}

// -- Static, action-oriented checklist ------------------------------------

const STATUS_BADGE: Record<OpsStatus, { cls: string }> = {
  overdue:   { cls: "bg-danger/20 text-danger" },
  due:       { cls: "bg-amber-500/20 text-amber-300" },
  soon:      { cls: "bg-accent-cyan/20 text-accent-cyan" },
  ok:        { cls: "bg-accent-teal/20 text-accent-teal" },
  ontrigger: { cls: "bg-bg-surface text-text-muted" },
};

function CopyBtn({ label, text, primary }: { readonly label: string; readonly text: string; readonly primary?: boolean }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard blocked */ }
      }}
      className={`text-[11px] px-2 py-1 rounded hover:opacity-80 ${primary ? "bg-accent-cyan/20 text-accent-cyan font-semibold" : "bg-bg-surface text-text-on-dark/80"}`}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function OpsRow({ it, due, assignee, hasDone, onChange }: {
  readonly it: OpsItem;
  readonly due: DueInfo;
  readonly assignee: Assignee;
  readonly hasDone: boolean;
  readonly onChange: () => void;
}): JSX.Element {
  const toggle = (who: Assignee): string =>
    `px-2 py-0.5 ${assignee === who ? "bg-accent-cyan/20 text-accent-cyan font-semibold" : "text-text-muted hover:text-text-on-dark"}`;
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="text-text-on-dark text-sm">{it.title}</strong>
            <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{DOMAIN_LABEL[it.domain]}</span>
            <span className="text-[10px] uppercase tracking-wider text-text-muted bg-bg-surface rounded px-1.5 py-0.5">{CADENCE_LABEL[it.cadence]}</span>
          </div>
          <div className="text-text-muted text-xs mt-1">{it.description}</div>
          {it.expected && <div className="text-text-muted text-xs mt-0.5">expected: {it.expected}</div>}
          {it.action && <div className="text-amber-300/80 text-xs mt-0.5">action: {it.action}</div>}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-[11px] font-bold rounded px-2 py-0.5 ${STATUS_BADGE[due.status].cls}`}>{due.label}</span>
          {due.lastLabel && <div className="text-[10px] text-text-muted mt-1">{due.lastLabel}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-bg-surface/40">
        <div className="inline-flex rounded border border-bg-surface overflow-hidden text-[11px]">
          <button onClick={() => { setAssignee(it.id, "human"); onChange(); }} className={toggle("human")}>Human</button>
          <button onClick={() => { setAssignee(it.id, "ai"); onChange(); }} className={toggle("ai")}>AI</button>
        </div>
        {assignee === "ai" ? (
          <>
            <CopyBtn primary label="Copy Claude prompt" text={buildClaudePrompt(it)} />
            <CopyBtn label="Copy details" text={buildDetails(it)} />
          </>
        ) : (
          <>
            <CopyBtn primary label="Copy task details" text={buildDetails(it)} />
            <CopyBtn label="Copy Claude prompt" text={buildClaudePrompt(it)} />
          </>
        )}
        <button onClick={() => { markDone(it.id); onChange(); }} className="text-[11px] px-2 py-1 rounded bg-accent-teal/15 text-accent-teal hover:opacity-80">✓ Mark done</button>
        {hasDone && <button onClick={() => { clearDone(it.id); onChange(); }} className="text-[11px] text-text-muted hover:underline">reset</button>}
      </div>
    </div>
  );
}

function StaticChecklist(): JSX.Element {
  const [tick, setTick] = useState(0);
  const onChange = (): void => setTick((t) => t + 1);

  const rows = useMemo(() => OPS_CATALOGUE.map((it) => {
    const st = getItemState(it.id);
    return { it, due: computeDue(it, st), assignee: st.assignee ?? defaultAssignee(it), hasDone: !!st.lastDoneTs };
  }), [tick]);

  const groups: { title: string; tone: string; match: (s: OpsStatus) => boolean }[] = [
    { title: "⚠ Action required now", tone: "text-danger", match: (s) => s === "overdue" || s === "due" },
    { title: "Due soon", tone: "text-amber-300", match: (s) => s === "soon" },
    { title: "On schedule", tone: "text-accent-teal", match: (s) => s === "ok" },
    { title: "Event / incident — on trigger", tone: "text-text-muted", match: (s) => s === "ontrigger" },
  ];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <p className="text-text-muted text-xs max-w-3xl">Status is computed from each check's cadence and when you last logged it done. Assign each to your <span className="text-text-on-dark">Human</span> or <span className="text-text-on-dark">AI</span> team, then one-click copy a ready task — a Claude prompt for AI, a details block for a person. All per-item state is local to this browser.</p>
        <button onClick={() => window.print()} className="text-xs text-accent-cyan hover:underline shrink-0">Print</button>
      </div>
      {groups.map((g) => {
        const items = rows.filter((r) => g.match(r.due.status));
        if (items.length === 0) return null;
        return (
          <div key={g.title}>
            <h3 className={`font-bold font-display mb-2 ${g.tone}`}>{g.title} <span className="text-text-muted font-normal">({items.length})</span></h3>
            <div className="grid lg:grid-cols-2 gap-2">
              {items.map((r) => <OpsRow key={r.it.id} it={r.it} due={r.due} assignee={r.assignee} hasDone={r.hasDone} onChange={onChange} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Live tiles -----------------------------------------------------------

interface HealthResp { ok: boolean; version: string; uptimeSec: number; nodeVersion: string; dbBytes: number; sqliteIntegrityOk: boolean }
interface IndexerResp { stream: string; lastBlock: number; headBlock: number; lagBlocks: number; lagSeconds: number }
interface EmailResp { pending: number; failed: number; sentLast24h: number; oldestPendingAgeSec: number; maxAttempts: number }
interface ActResp { days: number; totalActivations: number; activatedVaults: number; lastBlock: number }
interface HbResp { days: number; totalReceived: number; bySource: Record<string, number> }
interface EscrowResp { designated: number; claimed: number; pending: number }
interface RpcResp { ok: boolean; headBlock: number; deepBlockOk: boolean; latencyMs: number }
interface SecretAges { escrowAttestationKeyAgeDays: number | null; internalTriggerTokenAgeDays: number | null }
interface ChainlinkResp { registered: boolean; upkeepId?: string; balanceLink?: number; threshold?: number; paused?: boolean; band?: "ok" | "warn" | "critical"; checkedAt?: number; message?: string }

// Truncate the very long Chainlink upkeep id so the tile doesn't overflow.
function shortMid(s?: string): string {
  if (!s) return "";
  return s.length > 16 ? `${s.slice(0, 6)}…${s.slice(-5)}` : s;
}

function LiveStatus(): JSX.Element {
  const health    = useOpsLive<HealthResp>("/v1/ops/health");
  const indexer   = useOpsLive<IndexerResp>("/v1/ops/indexer-status");
  const email     = useOpsLive<EmailResp>("/v1/ops/email-jobs-summary");
  const activs    = useOpsLive<ActResp>("/v1/ops/activations-summary?days=30");
  const heart     = useOpsLive<HbResp>("/v1/ops/heartbeats-summary?days=7");
  const escrow    = useOpsLive<EscrowResp>("/v1/ops/escrow-bindings");
  const rpc       = useOpsLive<RpcResp>("/v1/ops/rpc-self-test");
  const ages      = useOpsLive<SecretAges>("/v1/ops/secret-ages");
  const chainlink = useOpsLive<ChainlinkResp>("/v1/ops/chainlink-balance");

  return (
    <div className="space-y-3">
      <p className="text-text-muted text-xs">Owner-signed reads. First load prompts your wallet for a one-time session signature (valid 1 hour, cached locally); subsequent tiles reuse it.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <OpsTile title="Form B health" value={health.data?.ok ? "ok" : "—"} band={health.data?.ok ? "ok" : "muted"} sub={health.data ? `uptime ${(health.data.uptimeSec / 3600).toFixed(1)}h · v${health.data.version} · ${(health.data.dbBytes / 1e6).toFixed(1)} MB` : null} loading={health.loading} error={health.error} onRefresh={health.refresh} />

        <OpsTile title="Indexer head-lag (blocks)" value={indexer.data?.lagBlocks ?? "—"} band={!indexer.data ? "muted" : indexer.data.lagBlocks < 200 ? "ok" : indexer.data.lagBlocks < 2000 ? "warn" : "bad"} expected="< 200 blocks" sub={indexer.data ? `~${(indexer.data.lagSeconds / 60).toFixed(0)} min · cursor ${indexer.data.lastBlock.toLocaleString()}` : null} loading={indexer.loading} error={indexer.error} onRefresh={indexer.refresh} />

        <OpsTile title="Email queue (pending / failed)" value={email.data ? `${email.data.pending} / ${email.data.failed}` : "—"} band={!email.data ? "muted" : email.data.failed > 0 ? "bad" : email.data.pending > 10 ? "warn" : "ok"} expected="0 / 0" sub={email.data ? `sent 24h: ${email.data.sentLast24h}; oldest pending ${(email.data.oldestPendingAgeSec / 60).toFixed(0)} min` : null} loading={email.loading} error={email.error} onRefresh={email.refresh} />

        <OpsTile title="NoKActivated (30d)" value={activs.data?.totalActivations ?? "—"} band={!activs.data ? "muted" : activs.data.totalActivations === 0 ? "ok" : "warn"} sub={activs.data ? `across ${activs.data.activatedVaults} vaults · last block ${activs.data.lastBlock.toLocaleString()}` : null} loading={activs.loading} error={activs.error} onRefresh={activs.refresh} />

        <OpsTile title="Heartbeats (7d)" value={heart.data?.totalReceived ?? "—"} band="muted" sub={heart.data ? Object.entries(heart.data.bySource).map(([k, v]) => `${k}: ${v}`).join(" · ") : null} loading={heart.loading} error={heart.error} onRefresh={heart.refresh} />

        <OpsTile title="Escrow bindings (designated / claimed / pending)" value={escrow.data ? `${escrow.data.designated} / ${escrow.data.claimed} / ${escrow.data.pending}` : "—"} band="muted" loading={escrow.loading} error={escrow.error} onRefresh={escrow.refresh} />

        <OpsTile title="Polygon RPC self-test" value={rpc.data?.ok ? "ok" : rpc.data ? "fail" : "—"} band={!rpc.data ? "muted" : rpc.data.ok ? "ok" : "bad"} expected="ok · deep-block-getLogs OK · < 1000 ms" sub={rpc.data ? `head ${rpc.data.headBlock.toLocaleString()} · deep ${rpc.data.deepBlockOk ? "ok" : "PRUNED"} · ${rpc.data.latencyMs} ms` : null} loading={rpc.loading} error={rpc.error} onRefresh={rpc.refresh} />

        <OpsTile title="Secret ages (days)" value={ages.data ? `${ages.data.escrowAttestationKeyAgeDays ?? "?"} / ${ages.data.internalTriggerTokenAgeDays ?? "?"}` : "—"} band={!ages.data ? "muted" : (Math.max(ages.data.escrowAttestationKeyAgeDays ?? 0, ages.data.internalTriggerTokenAgeDays ?? 0) > 90) ? "warn" : "ok"} expected="< 90 days (rotate quarterly)" sub="escrow-attestation-key / internal-trigger-token" loading={ages.loading} error={ages.error} onRefresh={ages.refresh} />

        <OpsTile
          title="Chainlink upkeep LINK balance"
          value={!chainlink.data ? "—" : !chainlink.data.registered ? "unregistered" : `${(chainlink.data.balanceLink ?? 0).toFixed(2)} LINK`}
          band={
            !chainlink.data || !chainlink.data.registered ? "muted" :
            chainlink.data.band === "critical" ? "bad" :
            chainlink.data.band === "warn"     ? "warn" :
            chainlink.data.paused              ? "warn" :
                                                  "ok"
          }
          expected={`> ${chainlink.data?.threshold ?? 3} LINK · paused=false`}
          sub={
            !chainlink.data ? null :
            !chainlink.data.registered ? "Set CHAINLINK_UPKEEP_ID in Form B .env to activate" :
            (
              <span>
                upkeep <span title={chainlink.data.upkeepId} className="font-mono">{shortMid(chainlink.data.upkeepId)}</span> · paused={String(chainlink.data.paused)}
                {" · "}
                <a href={`https://automation.chain.link/polygon/${chainlink.data.upkeepId}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">top up ↗</a>
              </span>
            )
          }
          loading={chainlink.loading} error={chainlink.error} onRefresh={chainlink.refresh}
        />
      </div>
    </div>
  );
}
