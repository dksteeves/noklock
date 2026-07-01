// @version 0.1.0 @date 2026-06-02
// Off-chain subscription pipe (Daniel-locked 2026-06-02). Renders on the
// Settings page above the existing tier badge. Surfaces:
//   - current tier (from useTierGate — already does the lapse-check)
//   - status pill: Active / Expires in N days / Lapsed / Lifetime / Free
//   - amber banner when status=lapsed (PWA gates as Free; on-chain NFT
//     persists; the user just needs to renew)
//   - "Manage subscription →" link to Paddle hosted-customer-portal
//     (env: VITE_PADDLE_CUSTOMER_PORTAL_URL — placeholder until Daniel's
//     Paddle account exists)
//   - "Renew now" button when expires_at < 14 days OR status=lapsed
//     (env: VITE_PADDLE_CHECKOUT_URL — placeholder until configured)
//
// Both Paddle URLs are intentionally OPT-IN at the env level — the component
// hides the relevant CTAs entirely if the env var is unset, so the build
// before Paddle account setup doesn't surface dead links.

import { useTierGate } from "../hooks/useTierGate.js";
import { useLicense } from "../hooks/useLicense.js";
import { useAccount } from "wagmi";

const PADDLE_PORTAL_URL = (import.meta.env.VITE_PADDLE_CUSTOMER_PORTAL_URL as string | undefined) ?? "";
const PADDLE_CHECKOUT_URL = (import.meta.env.VITE_PADDLE_CHECKOUT_URL as string | undefined) ?? "";

function StatusPill(props: {
  variant: "active" | "lifetime" | "expiring" | "lapsed" | "free";
  label: string;
}): JSX.Element {
  const palette = {
    active:   "bg-emerald-600/25 text-emerald-300 border-emerald-500/40",
    lifetime: "bg-violet-600/25  text-violet-300  border-violet-500/40",
    expiring: "bg-amber-600/25   text-amber-300   border-amber-500/40",
    lapsed:   "bg-red-600/25     text-red-300     border-red-500/40",
    free:     "bg-slate-600/25   text-slate-300   border-slate-500/40",
  }[props.variant];
  return (
    <span className={`tier-badge inline-block px-2 py-0.5 rounded border text-xs font-semibold ${palette}`}>
      {props.label}
    </span>
  );
}

export function SubscriptionStatusCard(): JSX.Element | null {
  const { address } = useAccount();
  const { licence } = useLicense();
  const gate = useTierGate();

  // Disconnected wallet — render nothing (the rest of Settings already
  // handles the disconnected state with its own copy).
  if (!address) return null;

  // No NFT at all — render nothing (Settings doesn't need a "you're Free"
  // card; the Pricing page is where Free → upgrade lives).
  if (!licence || licence.tier === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-bold font-display text-lg mb-1">Subscription</h2>
            <p className="text-sm text-text-on-dark/80">
              You're on the <strong>Free</strong> tier. Upgrade to unlock multi-NoK quorum,
              multi-location, duress vaults, and document inheritance.
            </p>
          </div>
          <a href="/pricing" className="btn btn-secondary text-sm">See plans →</a>
        </div>
      </div>
    );
  }

  const onChainTier = gate.onChainTier;
  const days = gate.daysUntilExpiry;
  const lapsed = gate.subscriptionLapsed;
  const isLifetime = onChainTier === 2 || onChainTier === 6;  // Standard-Lifetime + Lifetime-Premium

  // Status decision tree (purely for the pill + banner copy).
  let pillVariant: "active" | "lifetime" | "expiring" | "lapsed" | "free" = "active";
  let pillLabel = "Active";
  let showRenewCta = false;
  let showLapsedBanner = false;
  let showExpiringSoonNote = false;

  if (lapsed) {
    pillVariant = "lapsed";
    pillLabel = "Lapsed — please renew";
    showRenewCta = true;
    showLapsedBanner = true;
  } else if (isLifetime) {
    pillVariant = "lifetime";
    pillLabel = "Lifetime — no renewal";
  } else if (days !== null && days <= 14) {
    pillVariant = "expiring";
    pillLabel = days <= 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`;
    showRenewCta = true;
    showExpiringSoonNote = true;
  } else if (days !== null) {
    pillLabel = `Active · renews in ${days} days`;
  } else if (!gate.billingReachable) {
    // No Form B status data; we don't lie ("Active" with no source) and we
    // don't cry wolf ("Lapsed?" when we just couldn't reach). Honest.
    pillVariant = "active";
    pillLabel = "Active (off-chain status not loaded)";
  }

  const tierDisplay = onChainTier === gate.tier ? gate.tierName : (licence.name ?? "—");

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="font-bold font-display text-lg mb-1">Subscription</h2>
          <p className="text-sm text-text-on-dark/80">
            Tier: <strong>{tierDisplay}</strong>
            {" · "}
            <StatusPill variant={pillVariant} label={pillLabel} />
          </p>
        </div>
        {PADDLE_PORTAL_URL && (
          <a
            href={PADDLE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-cyan hover:underline"
          >
            Manage subscription →
          </a>
        )}
      </div>

      {showLapsedBanner && (
        <div className="rounded border border-amber-500/50 bg-amber-900/15 p-3 text-sm text-amber-200 mb-3">
          <strong>Your subscription has lapsed.</strong> PWA features are downgraded to Free
          until renewal. Your on-chain NFT is unchanged — re-up to restore access immediately.
        </div>
      )}

      {showExpiringSoonNote && !showLapsedBanner && (
        <p className="text-xs text-amber-300/90 mb-3">
          Your subscription expires soon. Renew now to avoid a feature downgrade.
        </p>
      )}

      <div className="flex gap-2 flex-wrap text-sm">
        {showRenewCta && PADDLE_CHECKOUT_URL && (
          <a
            href={PADDLE_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Renew now →
          </a>
        )}
        {PADDLE_PORTAL_URL && (
          <a
            href={PADDLE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Billing portal →
          </a>
        )}
        {!PADDLE_PORTAL_URL && !PADDLE_CHECKOUT_URL && (
          <p className="text-xs text-text-muted">
            Paddle subscription management is not yet configured for this build. Contact
            <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline ml-1">hello@noklock.app</a>{" "}
            for renewal questions.
          </p>
        )}
      </div>
    </div>
  );
}
