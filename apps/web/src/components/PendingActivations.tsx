// @version 0.3.0 @date 2026-06-11
// 0.3.0 — Daniel 2026-06-11 (Fable HIGH): cancel-flow partial-failure feedback
//         was UNREACHABLE. The success/partial-failure notes were gated on
//         `confirming === row.tokenId`, but doCancel nulls `confirming` + calls
//         refresh(), which drops the acted-on row out of `cancellable` and
//         unmounts its <li> before the note could render — so a "Form B cancel
//         succeeded but on-chain revokeNoK FAILED (SBT still minted to heir)"
//         looked identical to full success. Fix: outcome (success|partial) is
//         now a PERSISTENT component-scope banner that survives the refresh
//         (and renders standalone when the last row drops out). The owner
//         always learns whether the SBT was actually burned.
// @version 0.2.0 @date 2026-06-11
// 0.2.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §7): this
//         banner mounts on the DASHBOARD and used to call signMessageAsync on
//         mount to fetch pending activations — so loading the dashboard popped
//         a wallet signature prompt (every >1h / new UTC day / cache miss; on
//         mobile every signMessage pops Trust). Fixed: refresh() now uses the
//         CACHED ops-session signature only and NEVER prompts — if there is no
//         valid cached sig it stays dormant (the admin establishes the ops
//         session on /admin; this banner then lights up silently). The
//         "Cancel activation" action still signs on explicit click. Also
//         ops-sig TTL 1h → 24h (day-scoped message ⇒ one sign per UTC day).
// @version 0.1.0 @date 2026-06-01
// LAUNCH-BLOCKER 1 (audit ID: launch-blocker-1-owner-cancel-window) — Owner
// Cancel-Window dashboard widget.
//
// Mounted on Dashboard.tsx directly under <HeartbeatReminderCard/> (same
// urgency tier — both are "the system is asking you to act before time runs
// out"). Reads POST /v1/ops/activations-pending (owner-signed), shows every
// pending Activation SBT that has been minted to a heir but whose cancel-
// window has not yet elapsed. For each cancellable row: a "Cancel activation"
// button that walks the owner through:
//   (1) signing the Form B cancel attestation (suppresses the heir email),
//   (2) calling NoKLockSBT.revokeNoK(tokenId) on-chain (burns the SBT).
//
// Why both: cancelling on Form B alone leaves the SBT minted (so the heir
// could still try a direct on-chain claim if they ever find it); revoking on-
// chain alone doesn't stop the off-chain email (the watcher's row is already
// in flight). Both steps together fully neutralise the activation.
//
// If the owner is NOT connected, the component renders nothing (the gate is
// the same as the rest of the Ops Manual surface — license-owner signature).
// If the owner IS connected but has no pending activations, the component
// also renders nothing (zero-attention default — surfaces only when needed).

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useNokRevoke } from "../hooks/useNokRevoke.js";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
// Ops-session signature validity. The signed message is day-scoped
// ("NoKLock ops session: <day>"), so a 24h window = at most one ops sign per
// UTC day across every ops surface (was 1h — caused hourly re-prompts).
const OPS_SIG_TTL_MS = 24 * 60 * 60 * 1000;

interface PendingRow {
  vaultId: string;
  tokenId: string;
  activatedAtTs: number;
  sendAfterTs: number;
  cancelled: boolean;
  cancelledAtTs: number | null;
  secondsUntilSend: number;
  cancellable: boolean;
}

interface PendingResponse {
  now: number;
  windowHours: number;
  pending: PendingRow[];
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "elapsed";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTs(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ") + "Z";
}

export function PendingActivations(): JSX.Element | null {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const revoke = useNokRevoke();

  const [data, setData] = useState<PendingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null); // tokenId being cancelled
  const [step, setStep] = useState<"idle" | "signing" | "posting" | "revoking" | "done">("idle");
  const [stepError, setStepError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  // Persistent outcome of the LAST cancel (success OR partial-failure). Held at
  // component scope — NOT per-row — because a completed cancel refreshes the
  // list and the acted-on row drops out of `cancellable`, unmounting its <li>
  // before any per-row message can be read (Fable 2026-06-11: the old per-row
  // done/partial notes were unreachable, so a Form-B-cancel-succeeded-but-
  // on-chain-revoke-FAILED silently looked identical to full success). This
  // banner survives the refresh so the owner always learns the real outcome.
  const [outcome, setOutcome] = useState<{ tokenId: string; kind: "done" | "partial"; message: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!isConnected || !address) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      // The /v1/ops/* GETs use the shared session signature from useOpsLive,
      // but THIS endpoint is POST + we need the signer captured server-side.
      // Re-use the same "NoKLock ops session: <day>" message so the cached
      // session signature is reusable across both shapes.
      // 2026-06-11: NEVER prompt a signature just to render the dashboard. Use
      // the cached ops-session signature if one exists; otherwise stay DORMANT
      // (render nothing). The admin establishes the ops session explicitly on
      // /admin — once cached, this banner lights up silently. The "Cancel
      // activation" action below still signs on the explicit click.
      // 0.4.0 — validity is AGE-based (no day-bucket match), and we forward the
      // CACHED msg+sig verbatim — so a session signed before UTC-midnight keeps
      // working (no cliff) and the timestamp the server validates is the one
      // that was actually signed.
      const cached = JSON.parse(localStorage.getItem("noklock.ops-sig") ?? "null") as
        | { msg?: string; sig?: string; address?: string; signedAt?: number } | null;
      const haveCachedSig = !!cached
        && typeof cached.msg === "string"
        && typeof cached.sig === "string"
        && cached.address?.toLowerCase() === address.toLowerCase()
        && !!cached.signedAt
        && Date.now() - cached.signedAt < OPS_SIG_TTL_MS;
      if (!haveCachedSig || !cached?.sig || !cached?.msg) {
        setData(null);
        setLoading(false);
        return;
      }
      const r = await fetch(`${API_BASE}/ops/activations-pending`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ msg: cached.msg, sig: cached.sig }),
      });
      const body = await r.json() as PendingResponse | { error?: string };
      if (!r.ok || "error" in body) {
        setError("error" in body ? (body.error ?? `HTTP ${r.status}`) : `HTTP ${r.status}`);
      } else {
        setData(body as PendingResponse);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  // Initial load + 30s refresh (faster than other ops tiles — these rows
  // are time-sensitive: missing the window = email already in flight).
  useEffect(() => {
    void refresh();
  }, [refresh, tick]);
  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [isConnected]);

  const cancellable = (data?.pending ?? []).filter((p) => p.cancellable);

  // Hide entirely when there's nothing to act on (zero-attention default).
  if (!isConnected) return null;
  if (loading && !data) return null;
  if (error && !data) return null;
  if (!data) return null;
  // Keep rendering when there's a cancel outcome to surface, even if the last
  // cancellable row has just dropped out of the list (so the banner persists).
  if (cancellable.length === 0 && !outcome) return null;

  async function doCancel(row: PendingRow): Promise<void> {
    setStepError(null);
    setStep("signing");
    try {
      const signedAt = Math.floor(Date.now() / 1000);
      const message = `NoKLock cancel activation\nvault: ${row.vaultId}\ntoken: ${row.tokenId}\nat: ${signedAt}`;
      let ownerSig: string;
      try {
        ownerSig = await signMessageAsync({ message });
      } catch (e) {
        setStepError(e instanceof Error ? e.message : String(e));
        setStep("idle");
        return;
      }
      setStep("posting");
      const r = await fetch(`${API_BASE}/ops/cancel-activation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vaultId: row.vaultId, tokenId: row.tokenId, ownerSig, signedAt }),
      });
      const body = await r.json() as { ok?: boolean; error?: string; advice?: string };
      if (!r.ok || !body.ok) {
        setStepError((body.error ?? `HTTP ${r.status}`) + (body.advice ? ` — ${body.advice}` : ""));
        setStep("idle");
        return;
      }
      // Step 2: burn the SBT on-chain (NoKLockSBT.revokeNoK).
      setStep("revoking");
      try {
        await revoke.revoke({ activation: BigInt(row.tokenId) });
      } catch (e) {
        // Form B cancel already succeeded, so the heir email is suppressed —
        // but the SBT is STILL minted on-chain. Surface this as a PERSISTENT
        // banner: refresh() below drops this row out of `cancellable`, so a
        // per-row note would unmount before the owner could see it.
        setOutcome({
          tokenId: row.tokenId,
          kind: "partial",
          message:
            `Form B cancel succeeded (heir email suppressed), but the on-chain revokeNoK FAILED: ${
              e instanceof Error ? e.message : String(e)
            }. The inheritance SBT is STILL minted to the heir wallet — retry revokeNoK from the Vault page to fully neutralise it.`,
        });
        setStep("idle");
        setConfirming(null);
        void refresh();
        return;
      }
      setOutcome({
        tokenId: row.tokenId,
        kind: "done",
        message: "Cancelled — heir email suppressed and the SBT burned on-chain.",
      });
      setStep("idle");
      setConfirming(null);
      void refresh();
    } catch (e) {
      setStepError(e instanceof Error ? e.message : String(e));
      setStep("idle");
    }
  }

  const outcomeBanner = outcome ? (
    <div
      className={`mt-3 rounded border p-3 text-sm ${
        outcome.kind === "partial"
          ? "border-rose-500/60 bg-rose-500/10 text-rose-200"
          : "border-accent-teal/50 bg-accent-teal/10 text-accent-teal"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{outcome.message}</p>
        <button type="button" className="text-xs underline shrink-0" onClick={() => setOutcome(null)}>
          Dismiss
        </button>
      </div>
    </div>
  ) : null;

  // The last cancellable row was just acted on — show ONLY the outcome banner
  // (no empty "you have pending activations" chrome). Reachable only with an
  // outcome set (the earlier guard returns null for empty + no-outcome).
  if (cancellable.length === 0) {
    return <div className="card border-amber-500/40 border bg-amber-500/10">{outcomeBanner}</div>;
  }

  return (
    <div className="card border-amber-500/40 border bg-amber-500/10">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold font-display text-amber-200">
          Pending activation{cancellable.length === 1 ? "" : "s"} — your cancel window
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
          Owner action available
        </span>
      </div>
      <p className="text-sm text-text-on-dark/90 mt-1">
        Your dead-man's switch fired on-chain and a NoK Activation token was minted to a heir.
        You have <strong>{data.windowHours}h</strong> to cancel this activation BEFORE the heir
        notification email is sent. If you missed a heartbeat for a benign reason
        (sick, off-grid, simply forgot) this is the moment to abort.
      </p>
      <p className="text-xs text-text-muted mt-1">
        Cancelling here suppresses the off-chain heir email; the second step
        burns the SBT on-chain so a heir who finds the token directly can't
        still claim. Both run from one click.
      </p>

      <ul className="mt-3 space-y-2">
        {cancellable.map((row) => (
          <li key={row.tokenId} className="rounded border border-amber-500/30 bg-slate-900/40 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-text-muted text-xs">Vault</div>
                <div className="font-mono text-xs break-all">{row.vaultId.slice(0, 20)}…</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Token ID</div>
                <div className="font-mono">{row.tokenId}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Activated at (Form B)</div>
                <div className="font-mono text-xs">{formatTs(row.activatedAtTs)}</div>
              </div>
              <div>
                <div className="text-text-muted text-xs">Email releases in</div>
                <div className="font-mono text-amber-300">{formatCountdown(row.secondsUntilSend)}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              {confirming === row.tokenId ? (
                <>
                  <button
                    className="btn btn-danger text-sm"
                    onClick={() => void doCancel(row)}
                    disabled={step === "signing" || step === "posting" || step === "revoking"}
                  >
                    {step === "signing" && "Sign attestation…"}
                    {step === "posting" && "Suppressing email…"}
                    {step === "revoking" && "Burning SBT on-chain…"}
                    {(step === "idle" || step === "done") && "Confirm cancel"}
                  </button>
                  <button
                    className="btn btn-secondary text-sm"
                    onClick={() => { setConfirming(null); setStepError(null); setStep("idle"); }}
                    disabled={step === "signing" || step === "posting" || step === "revoking"}
                  >
                    Keep activation
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary text-sm"
                  onClick={() => { setConfirming(row.tokenId); setStepError(null); setStep("idle"); setOutcome(null); }}
                >
                  Cancel activation
                </button>
              )}
            </div>
            {/* In-flight failures (sign/post) keep the row mounted, so the
                per-row error is reachable for those. Completed cancels
                (success OR partial-failure) surface via the persistent
                <outcome> banner below — the row unmounts on refresh. */}
            {confirming === row.tokenId && stepError && (
              <p className="text-xs text-danger mt-2">{stepError}</p>
            )}
          </li>
        ))}
      </ul>

      {outcomeBanner}

      <p className="text-xs text-text-muted mt-3">
        Once the email-release timer hits zero, the cancel window has elapsed
        and the heir notification is queued for delivery. From that point your
        only remaining mitigation is calling <code>NoKLockSBT.revokeNoK(tokenId)</code>{" "}
        on-chain (which burns the SBT but does not retract the email).
      </p>
    </div>
  );
}
