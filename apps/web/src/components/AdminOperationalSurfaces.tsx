// @version 0.2.2 @date 2026-06-11
// 0.2.2 — Daniel 2026-06-11 (Fable replay finding): ops-session message is now
//         timestamp-based + validity is age-based (no day-bucket match); we
//         forward the cached msg+sig verbatim. Pairs with useOpsLive 0.4.0 +
//         owner-sig.ts 0.4.0 server freshness window.
// @version 0.2.1 @date 2026-06-11
// 0.2.1 — Daniel 2026-06-11 wallet rebuild: ops-session sig TTL 1h → 24h
//         (day-scoped message ⇒ one sign per UTC day), matching useOpsLive
//         0.3.0 + PendingActivations 0.2.0. This panel renders only on /admin
//         (explicit ops context), so it still establishes the session sign on
//         demand — but no longer re-prompts hourly.
// @version 0.2.0 @date 2026-06-01
// 0.2.0 — launch-blocker-3-segment-activity-logging: NEW <SegmentActivityPanel/>
//         section that hits POST /v1/ops/segment-activity-summary (owner-signed,
//         same shape as PendingActivations.tsx — reuses the cached "NoKLock ops
//         session: <day>" sig). Shows aggregate result counts for the last 7
//         days + top-N vaults by tamper count. Powers operator visibility into
//         per-share probing (e.g. a stolen share file + master-password brute
//         force on a single vault would show up as a tamper-count spike).
// 0.1.0 — AdminOperationalSurfaces — Audit Q2 answer. Admin-only structured list of
// every administrative power the deployed contracts expose. Read-only
// visibility (no write actions); operators see what each surface controls,
// the current on-chain state, and what users would see if the surface is
// used. Gated by the existing OwnerOnly wrapper that protects the whole
// Admin route.
//
// Daniel 2026-06-01 picked "on Admin panel only" — full transparency for
// operators (contract owner + Treasury / off-chain admins from
// VITE_OFFCHAIN_ADMIN_ADDRESSES), nothing new on public /info.

import { useCallback, useEffect, useState } from "react";
import { useAccount, useReadContract, useSignMessage } from "wagmi";
import {
  LICENSE_ADDR, SBT_ADDR, ORACLE_ADDR, RECOVERY_ADDR, ESCROW_ADDR, ALERTS_ADDR,
  CHAINLINK_ALERTS_UPKEEP_ID,
  licenseAbi,
} from "../lib/contracts.js";
import { ChainlinkUpkeepStatus } from "./ChainlinkUpkeepStatus.js";
import { InfoTooltip } from "./InfoTooltip.js";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

interface SegActSummary {
  readonly days: number;
  readonly total: number;
  readonly byResult: Record<string, number>;
  readonly topTamperVaults: ReadonlyArray<{ vaultId: string; count: number }>;
}

// 0.2.0 (launch-blocker-3-segment-activity-logging) — Owner-signed read of
// the 7-day per-share activity rollup. Uses the same cached session sig
// shape as PendingActivations.tsx (msg = "NoKLock ops session: <day>") so
// the operator signs at most once per UTC day across both surfaces.
function SegmentActivityPanel(): JSX.Element | null {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [data, setData] = useState<SegActSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isConnected || !address) return;
    setLoading(true);
    setError(null);
    try {
      // 0.3.0 — age-based validity (no day-bucket match) + timestamp message,
      // matching useOpsLive 0.4.0 + the server freshness window. msg+sig come
      // from cache when fresh, else a fresh timestamp sign; we forward exactly
      // what was signed (no UTC-midnight cliff).
      const cached = JSON.parse(localStorage.getItem("noklock.ops-sig") ?? "null") as
        | { msg?: string; sig?: string; address?: string; signedAt?: number } | null;
      const fresh = !!cached
        && typeof cached.msg === "string"
        && typeof cached.sig === "string"
        && cached.address?.toLowerCase() === address.toLowerCase()
        && !!cached.signedAt
        && Date.now() - cached.signedAt < 24 * 60 * 60 * 1000;
      let msg: string;
      let sig: string;
      if (fresh && cached?.msg && cached?.sig) {
        msg = cached.msg;
        sig = cached.sig;
      } else {
        msg = `NoKLock ops session: ${Math.floor(Date.now() / 1000)}`;
        sig = await signMessageAsync({ message: msg });
        try {
          localStorage.setItem("noklock.ops-sig", JSON.stringify({ msg, sig, signedAt: Date.now(), address }));
        } catch { /* storage blocked — fine */ }
      }
      const r = await fetch(`${API_BASE}/ops/segment-activity-summary`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ msg, sig }),
      });
      const body = await r.json() as SegActSummary | { error?: string };
      if (!r.ok || "error" in body) {
        setError("error" in body ? (body.error ?? `HTTP ${r.status}`) : `HTTP ${r.status}`);
      } else {
        setData(body as SegActSummary);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, signMessageAsync]);

  useEffect(() => { void load(); }, [load]);

  if (!isConnected) return null;

  const tamper = data?.byResult?.tamper ?? 0;
  const aadMismatch = data?.byResult?.aad_mismatch ?? 0;
  const ok = data?.byResult?.ok ?? 0;
  const manifestInvalid = data?.byResult?.manifest_invalid ?? 0;
  const flagged = tamper + aadMismatch + manifestInvalid;
  const alarm = flagged > 0;

  return (
    <div className={`card ${alarm ? "border-amber-500/40" : ""}`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
        <h3 className="font-bold font-display text-lg">Segment activity (last 7 days)</h3>
        <button
          className="text-xs text-accent-cyan hover:underline"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "loading…" : "refresh"}
        </button>
      </div>
      <p className="text-xs text-text-muted mb-3">
        Per-share open-attempt audit. Every restore that hits a vault posts one row per share —
        AEAD/AAD failures show up here as <code>tamper</code> / <code>aad_mismatch</code>.
        A spike on a single vault = somebody is probing it (stolen share + brute-force).
        Zero PII: vault id + share index + result code only. Form B rate-limits to 100 events/vault/hour.
      </p>
      {error && <p className="text-xs text-danger">Couldn't load: {error}</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="rounded bg-bg-surface/40 p-2">
              <div className="text-xs text-text-muted">ok</div>
              <div className="font-mono text-lg text-accent-teal">{ok}</div>
            </div>
            <div className="rounded bg-bg-surface/40 p-2">
              <div className="text-xs text-text-muted">tamper</div>
              <div className={`font-mono text-lg ${tamper > 0 ? "text-amber-300" : "text-text-on-dark"}`}>{tamper}</div>
            </div>
            <div className="rounded bg-bg-surface/40 p-2">
              <div className="text-xs text-text-muted">aad_mismatch</div>
              <div className={`font-mono text-lg ${aadMismatch > 0 ? "text-amber-300" : "text-text-on-dark"}`}>{aadMismatch}</div>
            </div>
            <div className="rounded bg-bg-surface/40 p-2">
              <div className="text-xs text-text-muted">manifest_invalid</div>
              <div className={`font-mono text-lg ${manifestInvalid > 0 ? "text-amber-300" : "text-text-on-dark"}`}>{manifestInvalid}</div>
            </div>
          </div>
          {/* At-a-glance health line (no alerting, no export — just the
              already-computed flagged/total summary so the admin doesn't have
              to add up the four buckets by eye). */}
          <div className={`text-xs mb-3 rounded px-2 py-1.5 ${alarm ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" : "bg-accent-green/10 text-accent-green border border-accent-green/20"}`}>
            {alarm
              ? <>⚠ <strong>{flagged}</strong> flagged open-attempt{flagged === 1 ? "" : "s"} of <span className="font-mono">{ok + flagged}</span> in 7d — investigate the top vault(s) below (stolen-share probing looks like this).</>
              : <>✓ All clear — <span className="font-mono">{ok}</span> clean open-attempt{ok === 1 ? "" : "s"}, zero tamper / aad-mismatch / manifest-invalid in the last 7 days.</>}
          </div>
          {data.topTamperVaults.length > 0 && (
            <div>
              <div className="text-xs text-text-muted mb-1">Top vaults by tamper count (7d):</div>
              <ul className="space-y-1">
                {data.topTamperVaults.map((v) => (
                  <li key={v.vaultId} className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="font-mono break-all">{v.vaultId.slice(0, 20)}…</span>
                    <span className="font-mono text-amber-300">{v.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-text-muted mt-3">
            Total rows: <span className="font-mono">{data.total}</span> across last <span className="font-mono">{data.days}</span> day(s).
          </p>
        </>
      )}
    </div>
  );
}

interface SurfaceRow {
  readonly setting: string;
  readonly value: string | JSX.Element;
  readonly canDo: string;
  readonly whenToUse: string;
  readonly userSees: string;
  readonly hint?: string;
}

function SurfaceTable({ title, address, rows }: { title: string; address: string; rows: SurfaceRow[] }): JSX.Element {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <h3 className="font-bold font-display text-lg">{title}</h3>
        <a href={`https://polygonscan.com/address/${address}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-accent-cyan hover:underline">
          {address.slice(0, 10)}…{address.slice(-8)} ↗
        </a>
      </div>
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="border-b border-bg-surface/40 last:border-0 pb-3 last:pb-0">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="font-mono text-sm text-text-on-dark">
                {r.setting}
                {r.hint && <InfoTooltip hint={r.hint} />}
              </div>
              <div className="text-sm text-text-on-dark/90">{r.value}</div>
            </div>
            <div className="text-[11px] text-text-muted mt-1 space-y-0.5">
              <div><span className="text-amber-300/80">can do:</span> {r.canDo}</div>
              <div><span className="text-amber-300/80">when to use:</span> {r.whenToUse}</div>
              <div><span className="text-amber-300/80">users see:</span> {r.userSees}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminOperationalSurfaces(): JSX.Element {
  // ── Live on-chain reads ────────────────────────────────────────────────
  const { data: licenseOwner } = useReadContract({
    abi: licenseAbi, address: LICENSE_ADDR, functionName: "owner",
    query: { staleTime: Infinity, gcTime: Infinity },
  });
  // `isForwarderLocked` isn't in the imported oracleAbi — operators can check directly
  // on PolygonScan via the link below. (Reading it here would require adding the fn to
  // contracts.ts; keep the operational-surfaces tab read-only-minimal for now.)
  const ownerStr = licenseOwner ? String(licenseOwner) : "loading…";

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold font-display text-xl"><span className="grad">Op Surfaces</span></h2>
        <p className="text-text-muted text-sm mt-1">
          Read-only operator view. Every administrative power the deployed contracts expose, with current on-chain values + what each one controls.
          Audit Q2 (2026-06-01) — admin-only visibility; nothing here is published on the public /info surface.
          Connect with the contract-owner wallet OR an off-chain-admin wallet (Treasury) to view; non-admins don't see the tab.
        </p>
        <p className="text-text-muted text-xs mt-2">
          <span className="text-amber-300">Note:</span> this tab does NOT expose write actions — all owner writes still live in the existing
          admin tools (Whitelist mint, Updates publisher, etc.). This is just visibility.
        </p>
      </div>

      <SurfaceTable
        title="License"
        address={LICENSE_ADDR}
        rows={[
          {
            setting: "owner()",
            value: <span className="font-mono text-[10px]">{ownerStr}</span>,
            canDo: "single wallet that controls every onlyOwner operation across the contract.",
            whenToUse: "rotate via Ownable2Step (2-step: transferOwnership → acceptOwnership).",
            userSees: "owner appears in every Contracts tab + every PolygonScan readout.",
            hint: "Cached forever for the session; License.owner() is immutable for the deployed contract.",
          },
          {
            setting: "adminMint(...)",
            value: "owner-only, on-chain cap",
            canDo: "comped licence grants (free) up to a fixed cap visible on-chain.",
            whenToUse: "press / partners / hackathons / community gifts.",
            userSees: "their wallet shows the tier the next time they connect; no payment record.",
          },
          {
            setting: "setLicense(0x0) on SBT",
            value: "timelock-gated",
            canDo: "DISABLE tier-cap enforcement entirely. Audited-flagged surface.",
            whenToUse: "almost never. Emergency unblock of designation limits if License contract is misbehaving.",
            userSees: "no immediate UI change; the 7-day timelock provides notice but no public alarm.",
            hint: "Audit Q2 marked this surface under-disclosed. Admin panel visibility = visibility of the lever.",
          },
        ]}
      />

      <SurfaceTable
        title="Oracle (dead-man's switch)"
        address={ORACLE_ADDR}
        rows={[
          {
            setting: "setForwarder(...)",
            value: <a href={`https://polygonscan.com/address/${ORACLE_ADDR}#readContract`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline font-mono text-xs">check isForwarderLocked on PolygonScan ↗</a>,
            canDo: "registers the Chainlink Automation forwarder address.",
            whenToUse: "ONCE at deploy. After first set the forwarder is permanently locked.",
            userSees: "the dead-man's switch is fired only by the forwarder; locked = closes the single-tx exploit of owner-swap-then-fire.",
          },
          {
            setting: "setPusher(addr, bool)",
            value: "owner-only",
            canDo: "authorise wallets that can record heartbeats on behalf of users (e.g. Form B).",
            whenToUse: "during server-side heartbeat-pusher onboarding.",
            userSees: "no direct effect; affects whether the off-chain heartbeat path works.",
          },
          {
            setting: "setGracePeriod(wallet, secs)",
            value: "owner-only per-wallet override",
            canDo: "override the default grace period (default = 30 days) for a specific wallet.",
            whenToUse: "if a user needs longer-than-default grace (e.g. retiree on extended travel) and asks.",
            userSees: "their next-of-kin path waits longer before activating.",
          },
          {
            setting: "dequeuePendingActivation(...)",
            value: "owner-only",
            canDo: "remove a misqueued token from the activation queue BEFORE Chainlink fires it.",
            whenToUse: "if a queued activation is known-bad (user reported, fraud, mistake) — owner has a window to defuse.",
            userSees: "specific token doesn't fire when grace elapses; user notified out-of-band.",
          },
          {
            setting: "renounceOwnership()",
            value: "irrevocable",
            canDo: "permanently relinquish owner powers. Owner becomes the zero address.",
            whenToUse: "endgame transition — Oracle becomes fully autonomous, no future tuning possible.",
            userSees: "no UI change at the time of renounce, but no further owner actions can occur. Marketing claim becomes 'truly trustless'.",
          },
        ]}
      />

      <SurfaceTable
        title="SBT (Activation tokens)"
        address={SBT_ADDR}
        rows={[
          {
            setting: "setOracle(...)",
            value: "timelock-gated",
            canDo: "swap which Oracle contract this SBT accepts activations from.",
            whenToUse: "Oracle v2 deploy — the only safe migration path (see NK-V0.6-OracleV2 in pending todos).",
            userSees: "no immediate UI; the new Oracle's heartbeat history takes over after timelock expiry.",
          },
          {
            setting: "setEscrow(...) / setRecovery(...) / setLicense(...)",
            value: "timelock-gated (all 4)",
            canDo: "swap any of the 4 collaborating contracts.",
            whenToUse: "major contract upgrades; collaborator-replacement migrations.",
            userSees: "no immediate UI; cancel paths available before executeXxxChange() fires.",
          },
          {
            setting: "setVaultBindingAttestor(...)",
            value: "owner-only",
            canDo: "rotate the attestor that verifies heir-claim signatures for Hybrid-E.",
            whenToUse: "attestor key compromise; planned rotation; Form B redeploy with new attestor.",
            userSees: "Hybrid-E heirs claim against the new attestor's signature going forward.",
            hint: "Audit Q1 flagged this attestor as under-disclosed — admin-only visibility here per Daniel's Q2 call.",
          },
        ]}
      />

      <SurfaceTable
        title="Recovery"
        address={RECOVERY_ADDR}
        rows={[
          {
            setting: "owner-only attestor + grace-period config",
            value: "see contract",
            canDo: "rotate Recovery's attestor; adjust default grace.",
            whenToUse: "matched to SBT.setVaultBindingAttestor rotations; policy changes.",
            userSees: "guardian-quorum recovery uses the new attestor going forward.",
          },
        ]}
      />

      <SurfaceTable
        title="Escrow (Hybrid-E email NoK)"
        address={ESCROW_ADDR}
        rows={[
          {
            setting: "EIP-712 domain reconciliation",
            value: "read-only check",
            canDo: "verify the deployed Escrow's EIP-712 domain separator matches what Form B expects.",
            whenToUse: "post-deploy sanity check + before any signing-key rotation.",
            userSees: "no direct effect; if mis-aligned, every heir's claim reverts BadAttestor.",
            hint: "Audit Fix-Both (this round) — adds /v1/ops/escrow-domain-check route + boot-time warn.",
          },
          {
            setting: "attestor rotation",
            value: "owner-only",
            canDo: "rotate the attestor signing email-NoK escrow attestations.",
            whenToUse: "attestor compromise or planned rotation.",
            userSees: "future email-NoK claims need the new attestor's signature; existing escrows unchanged.",
          },
        ]}
      />

      <SurfaceTable
        title="Alerts"
        address={ALERTS_ADDR}
        rows={[
          {
            setting: "Live-Man's Switch watchers config",
            value: "self-service per user",
            canDo: "owners ARE users for Alerts — each wallet sets its own watchers + email.",
            whenToUse: "no admin lever required; users configure their own out-of-band alerts.",
            userSees: "the Live-Man's Switch panel in Settings reflects each user's own config.",
          },
        ]}
      />

      <div className="card border-accent-cyan/40">
        <h3 className="font-bold font-display text-lg mb-2">Chainlink Automation upkeep · live</h3>
        <p className="text-xs text-text-muted mb-3">
          The dead-man's switch fires only while this upkeep is funded. Monitor the LINK balance here; if it ever goes red,
          top it up via the same widget the public Prove-It hub shows (anyone can fund — Chainlink permissionless).
        </p>
        <ChainlinkUpkeepStatus />
      </div>

      {/* 2nd upkeep (Daniel 2026-06-15) — NoKLockAlerts / Live-Man's Switch
          log-trigger automation. Renders a "not configured yet" notice until
          VITE_CHAINLINK_ALERTS_UPKEEP_ID is set (the upkeep is registered
          separately from the Oracle one). */}
      <div className="card border-accent-cyan/40">
        <h3 className="font-bold font-display text-lg mb-2">Chainlink Alerts upkeep · live (Live-Man's Switch)</h3>
        <p className="text-xs text-text-muted mb-3">
          The Live-Man's Switch log-trigger keeper that pings your watcher wallets when a recovery starts. Independent
          upkeep from the Oracle dead-man's switch — fund it the same permissionless way.
        </p>
        <ChainlinkUpkeepStatus
          upkeepId={CHAINLINK_ALERTS_UPKEEP_ID}
          label="Chainlink Alerts upkeep · live"
          targetAddr={ALERTS_ADDR}
          targetLabel="Alerts target"
          envVarName="VITE_CHAINLINK_ALERTS_UPKEEP_ID"
          purpose="The Live-Man's Switch pings your watcher wallets as long as this upkeep has LINK."
        />
      </div>

      {/* 0.2.0 (launch-blocker-3-segment-activity-logging) */}
      <SegmentActivityPanel />
    </div>
  );
}
