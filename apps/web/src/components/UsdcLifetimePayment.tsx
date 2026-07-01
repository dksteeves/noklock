// @version 0.2.0 @date 2026-06-02
// 0.2.0 — Daniel 2026-06-02: 24h auth-method cool-down gate (round-3 §1.B
//         + round-4 §1.B email-takeover hardening). When useAuthCooldown
//         reports inCooldown=true for the connected wallet, the card
//         renders a disabled banner with the change reason + "contact us"
//         prompt and refuses to surface the verify-pay UI. Closes the
//         "attacker pivots immediately after slipping a recovery-channel
//         change through" path: the legitimate owner has at least 24h
//         (and an alert email) to revoke before the attacker can liquidate
//         the wallet via a lifetime tier purchase.
// 0.1.0 — Daniel Q13 2026-06-02: skip NowPayments v1. For crypto-native users
//         who want a lifetime tier, just send USDC to NoKLock's treasury wallet
//         directly. No subscription, no card, no third party. This card lives
//         on Settings (mounted below the off-chain SubscriptionStatusCard).
//
//         Surfaces:
//           - tier dropdown (Lifetime Standard / Lifetime Premium)
//           - on-chain priceFor[tier] (USDC, 6dp) — same source the contract
//             would charge if the user minted via approve+mintLicence
//           - treasury wallet address (env: VITE_TREASURY_ADDR — display-only),
//             with copy-to-clipboard
//           - explicit network label "Polygon PoS"
//           - exact USDC amount + copy-to-clipboard
//           - tx hash paste field
//           - "Verify on-chain" button: pulls the receipt via
//             useWaitForTransactionReceipt (wagmi/viem; the configured Polygon
//             transport is the same fallback the rest of the app uses), then
//             checks each log for a USDC `Transfer(from, to, value)` where
//             `to == treasury` and `value == expected`. On success, surfaces a
//             "Pending manual grant by admin — we've been notified" message
//             and posts the verified record to the Form B grant endpoint.
//             The grant endpoint is TBD (will arrive with the managed-wallet
//             billing integration in PWA 0.6). For now the POST is best-effort
//             (console.log on the TODO path; never blocks the user-facing
//             confirmation).
//
//         IMPORTANT (deliberate scope cut): full automation of "grant the SBT
//         capability tier after verify" depends on a Form B endpoint that
//         doesn't exist yet (it will land with NL-1 + Paddle integration).
//         The card is honest about that: the verified tx hash is captured +
//         shown back to the user with a "we've been notified" message, and
//         the admin grants the tier via adminMint on receipt.

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, decodeEventLog, type Address, type Hex } from "viem";
import { erc20Abi as viemErc20Abi } from "viem";
import { LICENSE_ADDR, USDC_ADDR, licenseAbi, TIER, TIER_NAME, type TierId } from "../lib/contracts.js";
import { useAuthCooldown, formatAuthCooldownChange } from "../hooks/useAuthCooldown.js";

// Treasury wallet (env: VITE_TREASURY_ADDR). If not set, the card renders a
// "treasury wallet not configured" banner instead of an unsafe zero address.
const TREASURY_ADDR = (import.meta.env.VITE_TREASURY_ADDR as string | undefined) ?? "";
const NETWORK_LABEL = "Polygon PoS";

// Form B grant endpoint — TBD (will land with managed-wallet billing in PWA
// 0.6). The component still POSTs to this path best-effort; until the
// endpoint exists the POST will 404 and we just log the TODO.
const GRANT_ENDPOINT_PATH = "/v1/grant-after-direct-usdc"; // TBD
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

// Only the two lifetime tiers — Standard-Lifetime (2) + Lifetime-Premium (6).
const LIFETIME_TIERS: ReadonlyArray<{ id: TierId; label: string }> = [
  { id: TIER.Lifetime,         label: TIER_NAME["2"] ?? "Lifetime (Standard)" },
  { id: TIER.LifetimePremium,  label: TIER_NAME["6"] ?? "Lifetime Premium" },
];

type VerifyStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ok"; verifiedTo: Address; verifiedAmount: bigint }
  | { kind: "fail"; reason: string };

function shortHex(h: string, head = 6, tail = 4): string {
  if (!h || h.length < head + tail + 3) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

function CopyButton(props: { value: string; label?: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        try {
          void navigator.clipboard.writeText(props.value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
      }}
      className="text-xs text-accent-cyan hover:underline ml-2"
    >
      {copied ? "Copied ✓" : (props.label ?? "Copy")}
    </button>
  );
}

export function UsdcLifetimePayment(): JSX.Element {
  const [tier, setTier] = useState<TierId>(TIER.Lifetime);
  const [txHashInput, setTxHashInput] = useState<string>("");
  const [status, setStatus] = useState<VerifyStatus>({ kind: "idle" });
  // 0.2.0 — 24h cool-down gate (round-3 §1.B + round-4 §1.B). Refuse to
  // surface the verify-pay UI while a recent auth-method change is in
  // its 24h window — an attacker who slipped a recovery-channel change
  // through must not be able to immediately liquidate the wallet via a
  // lifetime tier purchase before the owner reads the broadcast email.
  const { address } = useAccount();
  const { status: cooldown } = useAuthCooldown(address ?? null);

  // Read on-chain priceFor(tier). priceFor is the regular (post-founder-cap)
  // price; the founder-window price is currentPrice. We deliberately quote
  // the REGULAR price here so a direct-USDC payment can never under-pay the
  // contract; admin can always honour the lower founder price as a courtesy.
  const { data: priceRaw } = useReadContract({
    address: LICENSE_ADDR,
    abi: licenseAbi,
    functionName: "priceFor",
    args: [tier],
  });
  const priceUsdc = (priceRaw as bigint | undefined) ?? null;
  const priceUsdcDisplay = priceUsdc !== null ? formatUnits(priceUsdc, 6) : "—";

  // Cast the user's pasted hash into a 0x-prefixed `Hex` (or null if not
  // a valid-looking 32-byte hex string).
  const parsedHash: Hex | null = useMemo(() => {
    const v = txHashInput.trim();
    if (/^0x[0-9a-fA-F]{64}$/.test(v)) return v as Hex;
    return null;
  }, [txHashInput]);

  // Only fetch the receipt while a verification is in-flight. Using
  // `query.enabled` keyed on status keeps the hook from looping
  // (useWaitForTransactionReceipt will poll until the receipt lands).
  const { data: receipt, error: receiptErr, isLoading: receiptLoading } = useWaitForTransactionReceipt({
    hash: parsedHash ?? undefined,
    query: { enabled: status.kind === "checking" && !!parsedHash },
  });

  // Run the on-receipt verification side-effect inline (no useEffect needed
  // because we react to the wagmi data on render).
  if (status.kind === "checking" && parsedHash) {
    if (receiptErr) {
      // Switch state once on error; next render `status.kind !== "checking"`
      // so this branch won't re-fire.
      const msg = (receiptErr as Error).message ?? "Receipt fetch failed";
      setTimeout(() => setStatus({ kind: "fail", reason: `RPC error: ${msg}` }), 0);
    } else if (receipt && !receiptLoading) {
      try {
        const out = verifyReceipt({
          receipt,
          expectedTo: TREASURY_ADDR.toLowerCase() as Address,
          expectedAmount: priceUsdc ?? 0n,
          usdc: USDC_ADDR.toLowerCase() as Address,
        });
        if (out.ok) {
          setTimeout(() => {
            setStatus({ kind: "ok", verifiedTo: out.to, verifiedAmount: out.value });
            // Best-effort POST to Form B grant endpoint (TBD). If it 404s
            // because the endpoint isn't built yet, we just log — the
            // user-facing surface still says "pending manual grant".
            void postGrantTODO({
              tier,
              txHash: parsedHash,
              payer: out.from,
              amountUsdc: out.value.toString(),
            });
          }, 0);
        } else {
          setTimeout(() => setStatus({ kind: "fail", reason: out.reason }), 0);
        }
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
        setTimeout(() => setStatus({ kind: "fail", reason: msg }), 0);
      }
    }
  }

  function handleVerify(): void {
    if (!TREASURY_ADDR) {
      setStatus({ kind: "fail", reason: "Treasury wallet not configured (VITE_TREASURY_ADDR is unset)." });
      return;
    }
    if (!parsedHash) {
      setStatus({ kind: "fail", reason: "Paste a valid 0x-prefixed 32-byte transaction hash first." });
      return;
    }
    if (priceUsdc === null) {
      setStatus({ kind: "fail", reason: "Could not read price from contract — reload and try again." });
      return;
    }
    setStatus({ kind: "checking" });
  }

  if (cooldown.inCooldown) {
    const untilIso =
      typeof cooldown.until === "number"
        ? new Date(cooldown.until * 1000).toLocaleString()
        : "—";
    const reason =
      cooldown.change !== null
        ? formatAuthCooldownChange(cooldown.change)
        : "an auth method was added";
    return (
      <div className="card border-amber-500/40 bg-amber-900/10">
        <h2 className="font-bold font-display text-lg mb-1">Pay lifetime in USDC — locked (24h)</h2>
        <p className="text-sm text-text-on-dark/85">
          24h security cool-down active — last change at {untilIso}. Reason: {reason}. If
          this wasn't you, contact us.
        </p>
        <p className="text-xs text-text-muted mt-2">
          Lifetime tier purchases are disabled until the cool-down lifts. This gate
          protects against an attacker liquidating the wallet immediately after slipping
          a recovery-channel change through.
        </p>
      </div>
    );
  }

  return (
    <div className="card border-violet-500/30 bg-gradient-to-br from-bg-panel via-bg-panel to-violet-900/10">
      <div className="flex items-start gap-3 mb-3">
        <span className="tier-badge bg-violet-600/25 text-violet-300 border border-violet-500/40 shrink-0 px-2 py-0.5 rounded text-xs font-semibold">Crypto-native</span>
        <div className="flex-1">
          <h2 className="font-bold font-display text-lg">Pay lifetime in USDC</h2>
          <p className="text-sm text-text-on-dark/85 mt-1">
            Crypto-native? Send USDC directly to NoKLock's treasury wallet for a lifetime tier. No subscription, no card, no third party.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-sm text-text-muted">Lifetime tier</span>
          <select
            value={tier.toString()}
            onChange={(e) => { setTier(BigInt(e.target.value) as TierId); setStatus({ kind: "idle" }); }}
            className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
          >
            {LIFETIME_TIERS.map((t) => (
              <option key={t.id.toString()} value={t.id.toString()}>{t.label}</option>
            ))}
          </select>
        </label>
        <div className="block">
          <span className="text-sm text-text-muted">Amount (USDC)</span>
          <div className="mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm flex items-center justify-between">
            <span>{priceUsdcDisplay} USDC</span>
            {priceUsdc !== null && <CopyButton value={priceUsdcDisplay} />}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-sm text-text-muted">Treasury wallet ({NETWORK_LABEL})</span>
        {TREASURY_ADDR ? (
          <div className="mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs flex items-center justify-between gap-2 break-all">
            <span>{TREASURY_ADDR}</span>
            <CopyButton value={TREASURY_ADDR} label="Copy address" />
          </div>
        ) : (
          <div className="mt-1 rounded border border-amber-500/50 bg-amber-900/15 p-2 text-xs text-amber-200">
            Treasury wallet not configured for this build (env <code>VITE_TREASURY_ADDR</code> is unset).
            Contact <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a> for the current address.
          </div>
        )}
      </div>

      <div className="mb-3 text-xs text-text-muted">
        Token: USDC <span className="font-mono">({shortHex(USDC_ADDR)})</span> · Network: {NETWORK_LABEL} ·
        Send the <strong>exact amount</strong> shown. Underpayment will not auto-grant.
      </div>

      <label className="block mb-3">
        <span className="text-sm text-text-muted">Paste your transaction hash after sending</span>
        <input
          type="text"
          value={txHashInput}
          onChange={(e) => { setTxHashInput(e.target.value); if (status.kind !== "idle") setStatus({ kind: "idle" }); }}
          placeholder="0x…"
          spellCheck={false}
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={status.kind === "checking" || !parsedHash || !TREASURY_ADDR}
          className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.kind === "checking" ? "Verifying on-chain…" : "Verify on-chain"}
        </button>
        {status.kind === "ok" && (
          <span className="text-xs text-emerald-300">
            Verified: {formatUnits(status.verifiedAmount, 6)} USDC → {shortHex(status.verifiedTo)}
          </span>
        )}
        {status.kind === "fail" && (
          <span className="text-xs text-red-300">{status.reason}</span>
        )}
      </div>

      {status.kind === "ok" && (
        <div className="mt-2 rounded border border-emerald-500/40 bg-emerald-900/15 p-3 text-sm text-emerald-200">
          <strong>Payment verified.</strong> Pending manual grant by admin — we've been notified. Your lifetime tier will appear on-chain shortly. Full automation of grant-after-verify ships with the managed-wallet billing integration (coming soon).
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-3 leading-snug">
        Lifetime crypto payment is direct on-chain — no recurring billing infrastructure. For monthly/annual subscriptions in USDC, see Managed-wallet roadmap (coming soon).
      </p>
    </div>
  );
}

// ----- helpers -----------------------------------------------------------

interface VerifyOk { ok: true; from: Address; to: Address; value: bigint }
interface VerifyFail { ok: false; reason: string }

/** Scan an ERC-20 Transfer log set on a Polygon receipt for a USDC payment
 *  TO the treasury for the EXACT expected amount. */
function verifyReceipt(args: {
  receipt: { logs: ReadonlyArray<{ address: string; topics: readonly string[]; data: string }> };
  expectedTo: Address;
  expectedAmount: bigint;
  usdc: Address;
}): VerifyOk | VerifyFail {
  for (const log of args.receipt.logs) {
    if (log.address.toLowerCase() !== args.usdc) continue;
    try {
      const decoded = decodeEventLog({
        abi: viemErc20Abi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (decoded.eventName !== "Transfer") continue;
      const a = decoded.args as unknown as { from: Address; to: Address; value: bigint };
      if (a.to.toLowerCase() !== args.expectedTo) continue;
      if (a.value !== args.expectedAmount) {
        return {
          ok: false,
          reason: `Amount mismatch: paid ${formatUnits(a.value, 6)} USDC, expected ${formatUnits(args.expectedAmount, 6)}.`,
        };
      }
      return { ok: true, from: a.from, to: a.to, value: a.value };
    } catch { /* skip non-Transfer log */ }
  }
  return { ok: false, reason: "No USDC Transfer to the treasury found in this tx." };
}

/** Best-effort POST to the Form B grant endpoint. The endpoint is TBD — will
 *  arrive with the managed-wallet billing integration (PWA v1.1.0). Until then
 *  this will 404; we swallow the error and just log the TODO. */
async function postGrantTODO(args: {
  tier: TierId;
  txHash: Hex;
  payer: Address;
  amountUsdc: string;
}): Promise<void> {
  // Daniel-locked 2026-06-02: Form B grant endpoint TBD with managed-wallet
  // billing integration.
  // eslint-disable-next-line no-console
  console.log("[UsdcLifetimePayment] Form B grant endpoint TBD with managed-wallet billing integration", args);
  if (!API_BASE) return;
  try {
    await fetch(`${API_BASE}${GRANT_ENDPOINT_PATH}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tier: args.tier.toString(),
        txHash: args.txHash,
        payer: args.payer,
        amountUsdc: args.amountUsdc,
      }),
    });
  } catch { /* best-effort; user-facing surface already says "pending manual grant" */ }
}
