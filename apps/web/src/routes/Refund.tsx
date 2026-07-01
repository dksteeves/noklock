// @version 0.5.0 @date 2026-06-11
// 0.5.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.5): the
//         self-custody connect card becomes <WalletGateCard/> (buttons always
//         live); the spinner-dim wrapper + bottom "Reconnecting…" line +
//         `reconnecting` local removed. Two-card layout (self-custody +
//         managed NL-2) preserved. Connected refund flow UNCHANGED.
// @version 0.4.4 @date 2026-06-05
// 0.4.4 — Daniel 2026-06-05: migrate off the useWalletSettling shim onto
//         useWalletGate() directly. The disconnected/reconnecting branch
//         was already a two-card layout (0.4.4-pre, see render block); the
//         migration replaces the legacy boolean `reconnecting` with the
//         unified gate's tri-state (connected | reconnecting | disconnected)
//         so this route reads from the same single-source hook every other
//         gated route now uses. No UI/behaviour change — `gate.status ===
//         "reconnecting"` still renders the two-card chrome with disabled
//         buttons + the muted "Reconnecting your wallet…" line, and
//         `gate.status === "disconnected"` renders the same two-card chrome
//         with the live ConnectWallet button. The connected branch uses
//         gate.address (covers self-custody now, managed in NL-2) but
//         keeps wagmi's useAccount for signMessageAsync — signing path
//         migrates separately when NL-2 managed signing lands.
// @version 0.4.3 @date 2026-06-04
// 0.4.3 — Daniel 2026-06-04: title-ternary fallthrough fix. Even with 0.4.2's
//         nested-read fix in place, when the server returns the H23 redacted
//         stub `{ wallet, found: false, signature_required: true }` (which
//         happens for EVERY unsigned subscription-state GET — billing.ts
//         hardened with H23 sometime after 0.4.2 was written) OR when the
//         wallet has no subscription_state row at all (admin-grant), body
//         .subscription is undefined → state.paymentMethod is null → both
//         isFiat AND isCrypto are false → the title ternary fell through to
//         "Refund already on file" by DEFAULT, mislabelling every admin /
//         crypto-grant / unsigned-GET caller. Fix: add a `paymentMethod ===
//         null` branch that renders "Nothing to refund" (the honest label
//         for "no subscription_state row found"). Body text + buttons
//         unchanged for that branch — the contact-refunds email path is
//         still surfaced. H23 signing of the GET (so a real Paddle user
//         can actually see their subscription + file a refund) is a
//         separate follow-up — this fix only addresses the visible title
//         mislabelling for admin / no-subscription wallets.
// @version 0.4.2 @date 2026-06-04
// 0.4.2 — Daniel 2026-06-04 REAL ROOT CAUSE of "Refund already on file"
//         showing for every wallet (admin + crypto + Paddle): the client
//         was reading `body.paymentMethod` from the /v1/billing/subscription-
//         state response, but the server (billing.ts) returns payment_method
//         NESTED inside `body.subscription.payment_method`. Top-level
//         `paymentMethod` does not exist in the response, so `body.paymentMethod`
//         was ALWAYS undefined → state.paymentMethod = null → neither isFiat
//         nor isCrypto was ever true → the CryptoOrUsedCard title's ternary
//         cascade defaulted to "Refund already on file" by FALLTHROUGH (not
//         because a row actually existed). 0.4.1's alreadyRequested gate was
//         dead code (paymentMethod was always null, so the gate was always
//         false anyway — the title rendered "already on file" regardless).
//         Fix: read all the subscription fields from the NESTED envelope:
//           paymentMethod    ← body.subscription.payment_method
//           subscribedAt     ← body.subscription.created_at_ts
//           tier             ← body.subscription.tier
//           refundRequestedAt — server doesn't surface this; stays null
//           refundEligibleUntil, refundStatus, allPaymentMethods are at the
//           top level on the server side, unchanged.
//         alreadyRequested gate stays (it's still right) but now actually
//         sees the correct paymentMethod value.
// @version 0.4.1 @date 2026-06-04
// 0.4.1 — Daniel 2026-06-04 admin-wallet refund-pre-empt bug fix. The admin
//         wallet (Lifetime Premium granted to self, never paid via Paddle)
//         was hitting "Refund already on file" because a stale refund_requests
//         row existed (probably from testing) and the alreadyRequested gate
//         only checked refundStatus !== "none" regardless of payment_method.
//         Fix: gate now requires paymentMethod === "paddle" AND refundStatus
//         !== "none". A non-Paddle wallet (crypto OR admin-grant) always sees
//         the MODE B (non-refundable) card. Stale refund row doesn't pre-empt.
//         Daniel also runs the DB cleanup separately (DELETE the stale row).
// @version 0.4.0 @date 2026-06-03
// 0.4.0 — LOW-14 fix (Daniel-locked 2026-06-03): the refund-request signed
//         message previously bound only to (wallet, timestamp, nonce). It did
//         NOT bind to the specific subscription the refund was being filed
//         against — so a phished signature could in principle be replayed
//         against a DIFFERENT subscription_state row than the one the user
//         thought they were authorising (e.g. one created after the wallet
//         upgrades tiers). This round:
//           (a) The loaded subscription state now carries the server-issued
//               `subscriptionId` (the subscription_state.rowid surfaced as
//               `subscription.id` in /v1/billing/subscription-state).
//           (b) The signed EIP-191 message becomes
//                 "REFUND-REQUEST:<wallet>:<sub_id>:<timestamp>:<nonce>"
//               and the POST body now carries `subscriptionId` alongside the
//               existing { wallet, timestamp, nonce, signature, reason }.
//           (c) The server (billing.ts 0.13.0) recovers the signer using the
//               SAME message string and additionally confirms the wallet's
//               CURRENT highest-tier subscription_state.rowid matches the
//               body's claimed subscriptionId. Mismatch → 401 (re-fetch state
//               + re-sign is the cure).
//         Submit is gated on `subscriptionId !== null` in addition to the
//         existing `!nonce` guard so a sign-prompt cannot fire before the
//         subscription state has loaded.
// 0.3.0 — MED-refund-mixed fix (Daniel-locked 2026-06-03): a wallet with a
//         MIXED purchase history (e.g. Tier-3 paid by Paddle + Tier-1 paid in
//         crypto) was previously rendered as MODE A (fiat cooling-off form)
//         because the GET /v1/billing/subscription-state read only surfaced
//         the highest-tier row's payment_method. The user would sign a
//         refund, Form B would correctly refund the Paddle tier, BUT the
//         wallet would retain its crypto-paid tier with no warning that the
//         crypto portion was non-refundable. Two changes this round:
//           (a) SubscriptionState now carries an optional
//               `allPaymentMethods: string[]` field (new in server billing.ts
//               0.10.0 — distinct payment methods across EVERY subscription
//               row for the wallet, e.g. ["paddle"], ["crypto"], or
//               ["paddle","crypto"] when mixed).
//           (b) The MODE A gate now additionally requires
//               !allPaymentMethods.includes("crypto") — so a mixed wallet
//               falls through to MODE B (CryptoOrUsedCard) with a NEW
//               mixed-payment warning ("You have both fiat and crypto
//               purchases — the crypto portion is non-refundable") so the
//               user knows the refund they're filing only covers the fiat
//               portion. Backward-compatible: if the server omits the field
//               (rolled back / pre-0.10.0), allPaymentMethods is undefined
//               and the prior single-method behaviour is preserved.
// 0.2.0 — AD1.5 fix: CSRF/nonce protection for the refund-request signature.
//         The prior signed message "REFUND-REQUEST:<wallet>:<timestamp>" was
//         anchored only to the wallet + a client-supplied unix timestamp
//         within a 5-minute window — a phished signature could be replayed
//         AND a malicious dApp could pre-cook the exact refund message and
//         trick the user into signing at any time. This round:
//           (a) On mount, fetch a fresh nonce from GET /v1/billing/refund-
//               nonce (returns { nonce, issued_at_ts, expires_at_ts,
//               ttl_seconds }). The nonce lives in component state and is
//               woven into the signed message.
//           (b) The signed message becomes
//               "REFUND-REQUEST:<wallet>:<timestamp>:<nonce>" — Form B's
//               refund-request handler validates the nonce exists in the
//               new refund_nonces table, is unused, and was issued within
//               the last 10 minutes; marks it used atomically on success.
//           (c) submitFiatRefund() refuses to sign if the nonce has not yet
//               loaded — the button stays disabled until the GET completes
//               (the existing "submit disabled while busy" pathway covers
//               this — busy now includes "loading nonce" via SubmitState).
//           (d) After a successful submission OR a server-side rejection
//               that may have consumed the nonce, we refresh by fetching a
//               new one so a retry can succeed.
// 0.1.2 — AD1.4 fix: validate refund reason before submission. Textarea now
//         enforces minLength=5 and submit button is disabled until the trimmed
//         reason has at least 5 characters (in addition to the confirm box).
//         Prevents empty / whitespace-only refund reasons from being POSTed.
// 0.1.1 — H10 fix: Refund success card now appends dynamic per-user
//         remaining-days text after the i18n key string, computed from
//         subscription.refundEligibleUntil. Format:
//         "<i18n string> (<n> days remaining)" with muted span.
// 0.1.0 — Initial wallet-gated refund-request route at /refund.
//
// Two-mode render driven by GET /v1/billing/subscription-state?wallet=<addr>:
//   MODE A — fiat (Paddle) purchases within the 14-day cooling-off window
//            and not already requested. Statutory EU-style right-of-withdrawal
//            form: reason textarea + confirm checkbox + EIP-191 personal_sign
//            over "REFUND-REQUEST:<wallet>:<timestamp>". POST to
//            /v1/billing/refund-request with { wallet, reason, signature,
//            timestamp }. On 200 → success card explaining Paddle initiates
//            within 1-2 business days; funds arrive within 14 calendar days
//            (issuer-dependent) at original payment method, with link to
//            /refund-policy.
//   MODE B — crypto purchases (on-chain final), OR Paddle purchases where
//            refundStatus is already set (pending/approved/rejected/refunded).
//            Shows the case-by-case credit notice + refunds@noklock.app
//            contact + current subscription details (tier / subscribedAt /
//            refund state) + link to /refund-policy.
//
// Both modes always surface a link to /refund-policy (the full policy text).
// Wallet-gated: disconnected wallet shows a ConnectWallet prompt instead.
//
// SEO meta hook: useDocumentHead("/refund") — falls through to index.html
// static meta until a matching ROUTE_SEO entry lands in lib/seo.ts.
//
// i18n: all user-facing strings keyed under the refund.* namespace in en.ts;
// other locales fall back through the standard en passthrough.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";
import { useT } from "../i18n/index.js";

const API_BASE = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "");

type PaymentMethod = "paddle" | "crypto" | null;
type RefundStatus = "none" | "pending" | "approved" | "rejected" | "refunded";

interface SubscriptionState {
  readonly paymentMethod: PaymentMethod;
  readonly subscribedAt: number | null;
  readonly tier: number;
  readonly refundEligibleUntil: number | null;
  readonly refundRequestedAt: number | null;
  readonly refundStatus: RefundStatus;
  // MED-refund-mixed (0.3.0): distinct payment methods across ALL the
  // wallet's subscription_state rows (NOT just the highest tier surfaced
  // in `paymentMethod`). Used to detect the mixed-payment case — when the
  // highest tier is Paddle but a lower tier was paid in crypto, MODE A is
  // suppressed and MODE B renders with a mixed-warning. Optional for
  // backward-compat with pre-0.10.0 server builds that omit the field.
  readonly allPaymentMethods?: readonly string[];
  // LOW-14 (0.4.0): the server-issued subscription identifier (subscription_
  // state.rowid). Woven into the refund-request EIP-191 message so a phished
  // signature cannot be replayed against a different subscription_state row
  // (e.g. one created after a tier upgrade). Null when the server response
  // does not surface it (pre-0.13.0 server) — submit stays disabled in that
  // case so we never sign an under-specified message.
  readonly subscriptionId: number | null;
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; state: SubscriptionState }
  | { kind: "error"; message: string };

type SubmitState =
  | { kind: "idle" }
  | { kind: "signing" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function formatTimestamp(secs: number | null): string {
  if (!secs || !Number.isFinite(secs)) return "—";
  try {
    return new Date(secs * 1000).toUTCString();
  } catch {
    return "—";
  }
}

function statusPillClass(status: RefundStatus): string {
  switch (status) {
    case "pending":  return "bg-amber-600/25 text-amber-300 border-amber-500/40";
    case "approved": return "bg-emerald-600/25 text-emerald-300 border-emerald-500/40";
    case "refunded": return "bg-violet-600/25 text-violet-300 border-violet-500/40";
    case "rejected": return "bg-red-600/25 text-red-300 border-red-500/40";
    default:         return "bg-slate-600/25 text-slate-300 border-slate-500/40";
  }
}

export function Refund(): JSX.Element {
  useDocumentHead("/refund");
  const { t } = useT();
  const wagmi = useAccount();
  const gate = useWalletGate();
  const { signMessageAsync } = useSignMessage();

  // 0.4.4: derive the legacy locals (address / isConnected / reconnecting)
  // from the unified gate so the rest of the file body is unchanged. Use
  // gate.address as the canonical source (covers NL-2 managed) and fall
  // back to wagmi.address only as a belt-and-braces during the NL-1
  // self-custody-only window. isConnected is the gate's tri-state
  // "connected" mapped to a boolean; reconnecting is the tri-state
  // "reconnecting" mapped to a boolean (the same shape useWalletSettling
  // used to return).
  const address = gate.address ?? wagmi.address;
  const isConnected = gate.status === "connected";

  const [load, setLoad] = useState<LoadState>({ kind: "idle" });
  const [reason, setReason] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });

  // AD1.5 (0.2.0): server-issued single-use nonce woven into the EIP-191
  // signed message so a phished signature cannot be replayed. Fetched on
  // mount from GET /v1/billing/refund-nonce; refreshed after submit so a
  // retry can succeed without a route remount.
  const [nonce, setNonce] = useState<string | null>(null);

  // AD1.5 (0.2.0): fetch a fresh CSRF/replay nonce once the route mounts.
  // We pull it independent of the wallet state — the GET is pre-auth and
  // the nonce-to-wallet binding is enforced by the EIP-191 signature at
  // submit time, not at issue time. If the network fails we leave nonce
  // null and the submit button stays disabled (handled in onSubmit guard).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/v1/billing/refund-nonce`);
        if (!r.ok) return;
        const body = (await r.json()) as { nonce?: unknown };
        if (cancelled) return;
        if (typeof body.nonce === "string" && body.nonce.length > 0) {
          setNonce(body.nonce);
        }
      } catch {
        /* swallow — submit guard handles missing nonce */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch subscription state once a wallet is connected.
  useEffect(() => {
    if (!isConnected || !address) {
      setLoad({ kind: "idle" });
      return;
    }
    let cancelled = false;
    setLoad({ kind: "loading" });
    void (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/v1/billing/subscription-state?wallet=${encodeURIComponent(address)}`,
        );
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          if (cancelled) return;
          setLoad({ kind: "error", message: `Subscription lookup failed (${r.status})${text ? `: ${text.slice(0, 200)}` : ""}` });
          return;
        }
        const body = (await r.json()) as Partial<SubscriptionState> & {
          subscription?: {
            id?: unknown;
            payment_method?: unknown;
            tier?: unknown;
            created_at_ts?: unknown;
          };
        };
        if (cancelled) return;
        // MED-refund-mixed (0.3.0): pass-through of the new
        // allPaymentMethods array. Optional / defensive — if the server is
        // older than billing.ts 0.10.0 and omits the field, we leave it
        // undefined and the mixed-detection short-circuits to the prior
        // single-method behaviour.
        const rawMethods = (body as { allPaymentMethods?: unknown }).allPaymentMethods;
        const allPaymentMethods: readonly string[] | undefined = Array.isArray(rawMethods)
          ? rawMethods.filter((m): m is string => typeof m === "string")
          : undefined;
        // LOW-14 (0.4.0): read subscription.id from the nested envelope the
        // server returns (subscription_state.rowid surfaced as
        // `subscription.id`). Defensive: if the server is older than
        // billing.ts 0.13.0 the field may be missing — null falls through and
        // submit stays disabled so we never sign an under-specified message.
        const subIdRaw = body.subscription?.id;
        const subscriptionId =
          typeof subIdRaw === "number" && Number.isFinite(subIdRaw) && subIdRaw > 0
            ? Math.floor(subIdRaw)
            : null;
        // 0.4.2 fix (Daniel 2026-06-04): subscription scalar fields live
        // INSIDE body.subscription on the server response, NOT at top level.
        // The previous read of body.paymentMethod / body.subscribedAt /
        // body.tier was always undefined → state.paymentMethod always null
        // → title fallthrough to "Refund already on file" for every wallet.
        const sub = body.subscription;
        const subPaymentMethod =
          sub && typeof sub.payment_method === "string" ? sub.payment_method : null;
        const subTier = sub && typeof sub.tier === "number" ? sub.tier : 0;
        const subCreatedAt =
          sub && typeof sub.created_at_ts === "number" ? sub.created_at_ts : null;
        const state: SubscriptionState = {
          paymentMethod: (subPaymentMethod ?? null) as PaymentMethod,
          subscribedAt: subCreatedAt,
          tier: subTier,
          refundEligibleUntil:
            typeof body.refundEligibleUntil === "number" ? body.refundEligibleUntil : null,
          refundRequestedAt:
            typeof body.refundRequestedAt === "number" ? body.refundRequestedAt : null,
          refundStatus: (body.refundStatus ?? "none") as RefundStatus,
          allPaymentMethods,
          subscriptionId,
        };
        setLoad({ kind: "loaded", state });
      } catch (e) {
        if (cancelled) return;
        setLoad({ kind: "error", message: e instanceof Error ? e.message : String(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  // AD1.5 (0.2.0): refresh the CSRF/replay nonce after a failed submit so
  // the user can retry without a route remount. Server-side the prior nonce
  // is already marked used (or unknown), so a retry with the same value
  // would 401. Best-effort — if this fails the button stays disabled (the
  // existing guard on `!nonce` blocks submit) and the user can refresh.
  async function refreshNonce(): Promise<void> {
    try {
      const r = await fetch(`${API_BASE}/v1/billing/refund-nonce`);
      if (!r.ok) {
        setNonce(null);
        return;
      }
      const body = (await r.json()) as { nonce?: unknown };
      if (typeof body.nonce === "string" && body.nonce.length > 0) {
        setNonce(body.nonce);
      } else {
        setNonce(null);
      }
    } catch {
      setNonce(null);
    }
  }

  async function submitFiatRefund(): Promise<void> {
    if (!address) return;
    if (!confirmed) return;
    if (reason.trim().length < 5) return;
    // AD1.5 (0.2.0): bail if the nonce hasn't loaded yet — the EIP-191
    // message MUST include the server-issued nonce or Form B will 401.
    if (!nonce) return;
    // LOW-14 (0.4.0): bail if the subscription state hasn't loaded yet, or
    // the server didn't surface subscription.id — the EIP-191 message MUST
    // include the subscription id or Form B (billing.ts 0.13.0) will 401.
    if (load.kind !== "loaded") return;
    const subscriptionId = load.state.subscriptionId;
    if (subscriptionId === null) return;
    setSubmit({ kind: "signing" });
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      // C-02 (pressure-test 2026-06-10): sign over the LOWERCASED wallet. The
      // server recovers over clampWallet() = toLowerCase (billing.ts:557-561),
      // and EIP-191 hashes the exact UTF-8 bytes — a checksummed address in the
      // signed message produces a different digest than the lowercased one the
      // server rebuilds, so every fiat refund-request 401'd. Align the client.
      const signWallet = (address ?? "").toLowerCase();
      const message = `REFUND-REQUEST:${signWallet}:${subscriptionId}:${timestamp}:${nonce}`;
      const signature = await signMessageAsync({ message });
      setSubmit({ kind: "submitting" });
      const r = await fetch(`${API_BASE}/v1/billing/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: signWallet,
          subscriptionId,
          reason: reason.trim(),
          signature,
          timestamp,
          nonce,
        }),
      });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        setSubmit({
          kind: "error",
          message: `Refund request failed (${r.status})${text ? `: ${text.slice(0, 240)}` : ""}`,
        });
        // AD1.5: the failed attempt may have consumed the nonce server-side
        // (the atomic UPDATE marks used_at_ts BEFORE the refund_requests
        // INSERT errors fire). Fetch a fresh one so retry can succeed.
        void refreshNonce();
        return;
      }
      setSubmit({ kind: "success" });
    } catch (e) {
      setSubmit({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
      // AD1.5: same retry rationale on a thrown sign/network error — the
      // server-side outcome is unknown, so refresh to be safe.
      void refreshNonce();
    }
  }

  // --- Render -----------------------------------------------------------

  // Wallet not connected.
  // 0.4.4 (Daniel 2026-06-04) — two-card disconnected layout. Was a single
  // "Connect the wallet that paid" card; now offers BOTH self-custody and
  // managed-wallet paths side-by-side so a future NL-2 managed user sees
  // their option exists. The managed-wallet button is greyed out + labelled
  // "Available in NL-2" until the flag flip. Subscription page itself still
  // requires a connection (current architecture); the two-card design is
  // purely the disconnected-state UX.
  //
  // The 'reconnecting' state renders the SAME two-card chrome with both
  // buttons disabled + a small "Reconnecting your wallet…" line, instead of
  // the full WalletReconnecting card. This keeps the page chrome stable
  // across the wagmi-hydration boundary so the user doesn't see a subtree
  // swap on every hard refresh.
  if (!isConnected || !address) {
    return (
      <article className="max-w-3xl mx-auto space-y-6 py-4">
        <Header t={t} />
        <div className="grid md:grid-cols-2 gap-4">
          <WalletGateCard
            title={t("refund.connect.selfCustody.title", "Connect the wallet that paid")}
            note={t(
              "refund.connect.selfCustody.body",
              "Self-custody users — connect the wallet that minted your licence. Refund eligibility is keyed to that wallet.",
            )}
          />

          <div className="card space-y-3 opacity-70">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold">{t("refund.connect.managed.title", "Log in (managed wallet)")}</h2>
              <span className="tier-badge bg-amber-600/40 text-amber-300 text-[10px]">NL-2</span>
            </div>
            <p className="text-sm text-text-on-dark/80">
              {t(
                "refund.connect.managed.body",
                "Managed-wallet users (Privy / passkey / email-link) — log in to view your subscription and refund options. Available in NL-2.",
              )}
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-md border border-bg-surface bg-bg-deepest text-text-muted font-bold px-4 py-2 cursor-not-allowed"
              aria-disabled="true"
              title={t("refund.connect.managed.disabledTitle", "Available in NL-2")}
            >
              {t("refund.connect.managed.button", "Log in — available in NL-2")}
            </button>
          </div>
        </div>

        <PolicyLink t={t} />
      </article>
    );
  }

  if (load.kind === "loading" || load.kind === "idle") {
    return (
      <article className="max-w-3xl mx-auto space-y-6 py-4">
        <Header t={t} />
        <div className="card">
          <p className="text-sm text-text-on-dark/80">
            {t("refund.loading", "Looking up your subscription…")}
          </p>
        </div>
      </article>
    );
  }

  if (load.kind === "error") {
    return (
      <article className="max-w-3xl mx-auto space-y-6 py-4">
        <Header t={t} />
        <div className="card border border-red-500/40 bg-red-900/15 space-y-2">
          <h2 className="text-lg font-bold text-red-300">{t("refund.error.title", "Could not load subscription")}</h2>
          <p className="text-sm text-red-200">{load.message}</p>
          <p className="text-xs text-text-muted">
            {t(
              "refund.error.fallback",
              "If this keeps failing, email refunds@noklock.app with your wallet address and we will sort it manually.",
            )}
          </p>
          <PolicyLink t={t} />
        </div>
      </article>
    );
  }

  const state = load.state;
  const now = Math.floor(Date.now() / 1000);
  const inWindow =
    state.refundEligibleUntil !== null && now < state.refundEligibleUntil;
  const isFiat = state.paymentMethod === "paddle";
  const isCrypto = state.paymentMethod === "crypto";
  const refundUntouched = state.refundStatus === "none";

  // MED-refund-mixed (0.3.0): a wallet whose HIGHEST tier is Paddle-paid but
  // who ALSO has any crypto-paid tier (lower tier paid in USDC etc) must
  // NOT see MODE A — the refund would only cover the Paddle tier, the
  // crypto tier stays active, and the user would have no way to know that
  // from a cooling-off form. Detect mixed via the server's new
  // `allPaymentMethods` array and force MODE B with a mixed-warning when
  // crypto is anywhere in the user's purchase history. Defensive: if the
  // server omits the field (pre-0.10.0 rollback), `mixedWithCrypto` is
  // false and the prior single-method gate behaviour is preserved.
  const mixedWithCrypto =
    isFiat &&
    state.allPaymentMethods !== undefined &&
    state.allPaymentMethods.includes("crypto");

  // MODE A — fiat (Paddle) + within window + no prior request + NOT mixed.
  const showFiatForm = isFiat && inWindow && refundUntouched && !mixedWithCrypto;

  return (
    <article className="max-w-3xl mx-auto space-y-6 py-4">
      <Header t={t} />

      <SubscriptionSummary state={state} t={t} />

      {showFiatForm ? (
        <FiatRefundCard
          state={state}
          reason={reason}
          setReason={setReason}
          confirmed={confirmed}
          setConfirmed={setConfirmed}
          submit={submit}
          nonceReady={nonce !== null}
          subscriptionReady={state.subscriptionId !== null}
          onSubmit={submitFiatRefund}
          t={t}
        />
      ) : (
        <CryptoOrUsedCard
          state={state}
          isCrypto={isCrypto}
          mixedWithCrypto={mixedWithCrypto}
          t={t}
        />
      )}

      <PolicyLink t={t} />
    </article>
  );
}

// --- Sub-components -----------------------------------------------------

function Header(props: { readonly t: (k: string, f?: string) => string }): JSX.Element {
  return (
    <header>
      <h1 className="text-4xl font-bold font-display">
        <span className="grad">{props.t("refund.h1", "Request a refund")}</span>
      </h1>
      <p className="text-text-muted mt-2">
        {props.t(
          "refund.subtitle",
          `${BRAND_NAME} refunds — statutory cooling-off for fiat purchases; case-by-case credit for crypto purchases.`,
        )}
      </p>
    </header>
  );
}

function PolicyLink(props: { readonly t: (k: string, f?: string) => string }): JSX.Element {
  return (
    <p className="text-sm text-text-muted">
      <Link to="/refund-policy" className="text-accent-cyan hover:underline">
        {props.t("refund.policyLink", "Read the full Refund Policy →")}
      </Link>
    </p>
  );
}

function SubscriptionSummary(props: {
  readonly state: SubscriptionState;
  readonly t: (k: string, f?: string) => string;
}): JSX.Element {
  const { state, t } = props;
  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-bold">{t("refund.summary.title", "Your subscription")}</h2>
      <ul className="text-sm text-text-on-dark/90 space-y-1">
        <li>
          <strong>{t("refund.summary.tier", "Tier")}:</strong> {state.tier}
        </li>
        <li>
          <strong>{t("refund.summary.method", "Payment method")}:</strong>{" "}
          {state.paymentMethod === "paddle"
            ? t("refund.summary.method.paddle", "Card / fiat (Paddle)")
            : state.paymentMethod === "crypto"
              ? t("refund.summary.method.crypto", "Crypto (USDC on Polygon)")
              : t("refund.summary.method.unknown", "Unknown")}
        </li>
        <li>
          <strong>{t("refund.summary.subscribedAt", "Subscribed at")}:</strong> {formatTimestamp(state.subscribedAt)}
        </li>
        {state.refundEligibleUntil !== null && (
          <li>
            <strong>{t("refund.summary.eligibleUntil", "Refund eligible until")}:</strong>{" "}
            {formatTimestamp(state.refundEligibleUntil)}
          </li>
        )}
        {state.refundRequestedAt !== null && (
          <li>
            <strong>{t("refund.summary.requestedAt", "Refund requested at")}:</strong>{" "}
            {formatTimestamp(state.refundRequestedAt)}
          </li>
        )}
        <li>
          <strong>{t("refund.summary.status", "Refund status")}:</strong>{" "}
          <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${statusPillClass(state.refundStatus)}`}>
            {state.refundStatus}
          </span>
        </li>
      </ul>
    </div>
  );
}

function FiatRefundCard(props: {
  readonly state: SubscriptionState;
  readonly reason: string;
  readonly setReason: (v: string) => void;
  readonly confirmed: boolean;
  readonly setConfirmed: (v: boolean) => void;
  readonly submit: SubmitState;
  // AD1.5 (0.2.0): true once the server-issued CSRF/replay nonce has
  // landed in state. The submit button stays disabled while false so the
  // user cannot trigger a signing prompt for an under-specified message.
  readonly nonceReady: boolean;
  // LOW-14 (0.4.0): true once the server-issued subscription id has landed
  // in state. The submit button stays disabled while false so the user
  // cannot trigger a signing prompt for a message that omits the sub id.
  readonly subscriptionReady: boolean;
  readonly onSubmit: () => void | Promise<void>;
  readonly t: (k: string, f?: string) => string;
}): JSX.Element {
  const { state, reason, setReason, confirmed, setConfirmed, submit, nonceReady, subscriptionReady, onSubmit, t } = props;

  if (submit.kind === "success") {
    const nowSecs = Math.floor(Date.now() / 1000);
    const remainingDays =
      state.refundEligibleUntil !== null
        ? Math.max(0, Math.ceil((state.refundEligibleUntil - nowSecs) / 86400))
        : null;
    return (
      <div className="card border border-emerald-500/40 bg-emerald-900/15 space-y-3">
        <h2 className="text-xl font-bold text-emerald-300">
          {t("refund.fiat.success.title", "Refund request received")}
        </h2>
        <p className="text-sm text-emerald-100">
          {t(
            "refund.fiat.success.body",
            "Paddle initiates the refund within 1-2 business days; funds arrive at your original payment method within 14 calendar days (issuer-dependent, typically 3-10 business days for cards).",
          )}
          {remainingDays !== null && (
            <>
              {" "}
              <span className="text-text-muted">({remainingDays} days remaining)</span>
            </>
          )}
        </p>
        <p className="text-xs text-text-muted">
          {t(
            "refund.fiat.success.note",
            "You will receive a confirmation email from our payment processor when funds are released to your card.",
          )}
        </p>
        <Link to="/refund-policy" className="text-accent-cyan hover:underline text-sm">
          {t("refund.policyLink", "Read the full Refund Policy →")}
        </Link>
      </div>
    );
  }

  const busy = submit.kind === "signing" || submit.kind === "submitting";

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {t("refund.fiat.title", "14-day cooling-off refund (fiat purchase)")}
        </h2>
        <p className="text-sm text-text-on-dark/80 mt-1">
          {t(
            "refund.fiat.intro",
            `You paid by card via Paddle and you are still within the statutory 14-day cooling-off window (eligible until ${formatTimestamp(state.refundEligibleUntil)}). You can request a full refund here — no questions asked.`,
          )}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="refund-reason" className="block text-sm font-semibold">
          {t("refund.fiat.reason.label", "Reason (optional but helpful)")}
        </label>
        <textarea
          id="refund-reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          minLength={5}
          maxLength={2000}
          placeholder={t(
            "refund.fiat.reason.placeholder",
            "Tell us why so we can fix it — e.g. didn't work for me, wrong tier, changed my mind.",
          )}
          className="w-full rounded border border-bg-surface bg-bg-base/40 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
        />
        <span>
          {t(
            "refund.fiat.confirm",
            "I confirm I am the wallet owner and I want to cancel my subscription and receive a refund to the original payment method.",
          )}
        </span>
      </label>

      {submit.kind === "error" && (
        <div className="rounded border border-red-500/40 bg-red-900/15 p-3 text-sm text-red-200">
          {submit.message}
        </div>
      )}

      <button
        type="button"
        onClick={() => { void onSubmit(); }}
        disabled={!confirmed || reason.trim().length < 5 || busy || !nonceReady || !subscriptionReady}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submit.kind === "signing"
          ? t("refund.fiat.submit.signing", "Sign in your wallet…")
          : submit.kind === "submitting"
            ? t("refund.fiat.submit.submitting", "Submitting…")
            : !nonceReady || !subscriptionReady
              ? t("refund.fiat.submit.preparing", "Preparing secure request…")
              : t("refund.fiat.submit.idle", "Submit refund request")}
      </button>

      <p className="text-xs text-text-muted">
        {t(
          "refund.fiat.signNote",
          "Your wallet will be asked to sign a plain message to prove ownership. No transaction is sent on-chain; signing is free.",
        )}
      </p>
    </div>
  );
}

function CryptoOrUsedCard(props: {
  readonly state: SubscriptionState;
  readonly isCrypto: boolean;
  // MED-refund-mixed (0.3.0): true when the highest tier is Paddle-paid but
  // a lower tier was paid in crypto. We render a mixed-payment warning at
  // the top of the card so the user understands the refund-by-email path
  // covers only the fiat portion (the crypto portion stays on-chain final).
  readonly mixedWithCrypto: boolean;
  readonly t: (k: string, f?: string) => string;
}): JSX.Element {
  const { state, isCrypto, mixedWithCrypto, t } = props;
  // 0.4.0 fix (Daniel 2026-06-04): only pre-empt with "Refund already on file"
  // when the wallet ACTUALLY PAID via Paddle. A stale refund_requests row on a
  // crypto-paid OR admin-granted wallet should NOT block the MODE B (non-
  // refundable) card. The admin wallet (Lifetime Premium granted by self,
  // never paid) was tripping this gate and showing "already on file" instead
  // of the correct crypto/admin-grant card.
  const alreadyRequested = state.paymentMethod === "paddle" && state.refundStatus !== "none";

  // 0.4.3 — distinguish (a) actual prior-refund-on-file (paymentMethod=paddle
  // + refundStatus !== "none") from (b) no subscription_state row at all
  // (paymentMethod === null, e.g. admin-grant / H23-redacted unsigned GET).
  // Without this, both cases rendered "Refund already on file" by ternary
  // fallthrough, which is wrong + confusing for case (b).
  const noSubscription = state.paymentMethod === null;
  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-bold">
        {mixedWithCrypto
          ? t("refund.mixed.title", "Mixed fiat + crypto purchases")
          : isCrypto
            ? t("refund.crypto.title", "Crypto purchases are on-chain final")
            : noSubscription
              ? t("refund.none.title", "Nothing to refund")
              : t("refund.used.title", "Refund already on file")}
      </h2>

      {mixedWithCrypto && (
        <div className="rounded border border-amber-500/40 bg-amber-900/15 p-3 text-sm text-amber-100">
          {t(
            "refund.mixed.warning",
            "You have both fiat and crypto purchases — the crypto portion is non-refundable on-chain. Email refunds@noklock.app and we will refund the fiat (Paddle) portion of your subscription; the crypto-paid tier(s) remain on-chain final.",
          )}
        </div>
      )}

      {isCrypto ? (
        <p className="text-sm text-text-on-dark/90">
          {t(
            "refund.crypto.body",
            "Crypto purchases: on-chain transactions are final but case-by-case credit may apply — contact refunds@noklock.app.",
          )}
        </p>
      ) : noSubscription ? (
        <p className="text-sm text-text-on-dark/90">
          {t(
            "refund.none.body",
            "No paid subscription is on record for this wallet. If you believe this is an error or you paid recently and the record is missing, contact refunds@noklock.app with the wallet address + payment reference and reason for refund request.",
          )}
        </p>
      ) : (
        <p className="text-sm text-text-on-dark/90">
          {t(
            "refund.used.body",
            `A refund request is already on record for this wallet (status: ${state.refundStatus}). Any further questions: refunds@noklock.app.`,
          )}
        </p>
      )}

      {!alreadyRequested && isCrypto && (
        <p className="text-xs text-text-muted">
          {t(
            "refund.crypto.note",
            "Include your wallet address, the transaction hash of the USDC payment, and a one-line description of what went wrong. We aim to reply within 2 business days.",
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <a
          href="mailto:refunds@noklock.app"
          className="inline-flex items-center justify-center rounded-md border border-accent-cyan text-accent-cyan font-bold px-4 py-2 hover:bg-accent-cyan/10"
        >
          {t("refund.contact.button", "Contact refunds@noklock.app")}
        </a>
        <Link
          to="/refund-policy"
          className="inline-flex items-center justify-center rounded-md bg-accent-cyan text-bg-base font-bold px-4 py-2 hover:opacity-90"
        >
          {t("refund.policy.button", "Read the Refund Policy")}
        </Link>
      </div>
    </div>
  );
}
