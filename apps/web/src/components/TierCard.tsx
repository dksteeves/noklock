// @version 0.5.4 @date 2026-05-22
// 0.5.4 — T-3D-2: the "Referred — discount applied" line no longer shows for
//         the zero-address or self-referral (both reverted on-chain). Fixed at
//         the source in referral.ts 0.2.0 (isValidReferrer filters them in
//         getStoredReferrer), and the display is now gated on isConnected so
//         we never promise a pre-connect discount we can't confirm.
// 0.5.3 — "Pay with another token" is now a curated dropdown of known
//         liquid Polygon tokens (POL/WPOL/ETH/WBTC/USDT/DAI/USDC.e/
//         LINK/AAVE/UNI) with addresses prefilled, + "Other — paste
//         address" escape hatch. Users no longer hunt a contract
//         address. Default = USDC, no swap (unchanged path).
// 0.5.2 — Tiers 4 (Family Office) + 5 (Institutional) gated as "Coming
//         Soon" (was: only 5). They are mintable on-chain but advertised
//         not-for-sale — taking real USDC for them was a lie + a money
//         exploit. Pair with owner setMintable(4,false)/(5,false).
//         Connect: smart connector pick (injected if extension, else
//         WalletConnect) so no-extension/mobile users aren't dead.
// 0.5.1 — mint errors run through humanizeTxError (concise cancelled/
//         failed line, not the raw viem request dump).
// 0.5.0 — WS2b: optional "pay with another Polygon token" — a token-address
//         field that sets useMintLicence.payWith (swapped to USDC at mint
//         via 0x). Only rendered when a 0x key is configured, so with no
//         key this card is byte-identical to before (zero risk).
// 0.4.0 — Referral: shows "Referred — discount applied · you pay X USDC"
//         when a referrer is captured; the mint then routes through
//         mintLicenceReferred via useMintLicence.
// 0.3.0 — Round 3 wave 2: mint button cursor fix. When wallet not connected
//         the button was disabled → browser showed the not-allowed (🚫)
//         cursor on hover. Now: button stays enabled when wallet not
//         connected; label becomes "Connect wallet to mint"; click triggers
//         wallet connect. After connect, button label and behaviour resume
//         the mint flow. The "Connect a wallet to mint" sub-hint is removed
//         (now redundant — the button itself communicates).
// 0.2.0 — Premium / Family Office / Institutional perks get the "Advanced"
//         pill, matching the Advanced ▾ nav-dropdown grouping.

import { useAccount, useConnect } from "wagmi";
import { TIER_DISPLAY_PRICE, TIER_NAME, TIER_PERKS, type TierId } from "../lib/contracts.js";
import { useMintLicence } from "../hooks/useMintLicence.js";
import { humanizeTxError } from "../lib/txError.js";
import { POLYGON_PAY_TOKENS } from "../lib/swap.js";

interface Props {
  readonly tier: TierId;
  readonly highlight?: boolean;
}

export function TierCard({ tier, highlight }: Props): JSX.Element {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const tierKey = String(tier);
  const name = TIER_NAME[tierKey] ?? "Tier";
  const price = TIER_DISPLAY_PRICE[tierKey] ?? "—";
  const perks = TIER_PERKS[tierKey] ?? [];

  const { step, error, start, txHashApprove, txHashMint, referrer, effectivePrice, payWith, setPayWith, swapConfigured } = useMintLicence(tier);
  const isFree = tier === 0n;
  // Tiers 4 (Family Office) + 5 (Institutional) are NOT for sale yet —
  // contract still allows mint, so gate the UI (no mint button, shows
  // "Coming Soon") AND owner sets setMintable(4,false)/(5,false) on-chain.
  const isHeld = tier === 4n || tier === 5n;
  // Only surface the discount once connected: useMintLicence derives `referrer`
  // via getStoredReferrer(address), which (since referral.ts 0.2.0) filters the
  // zero-address AND self-referral — both of which the contract reverts at mint.
  // Pre-connect there's no real address to filter self against, so we don't
  // promise a discount we might not honour. (T-3D-2.)
  const referred = !!referrer && isConnected && !isFree && !isHeld;
  const effUsdc = effectivePrice !== null ? (Number(effectivePrice) / 1e6).toFixed(2) : null;
  const inFlight = step === "approving" || step === "approve-pending" || step === "minting" || step === "mint-pending" || step === "checking" || step === "swapping" || step === "swap-pending";

  const cta = (() => {
    if (isFree) return "Active by default";
    if (isHeld) return "Coming Soon";
    if (!isConnected) return "Connect wallet to mint";
    switch (step) {
      case "idle":            return payWith ? "Swap & mint" : "Mint with USDC";
      case "checking":        return "Checking allowance…";
      case "swapping":        return "Confirm token swap…";
      case "swap-pending":    return "Swapping to USDC…";
      case "approving":       return "Approve USDC…";
      case "approve-pending": return "Approval pending…";
      case "minting":         return "Minting NFT…";
      case "mint-pending":    return "Mint pending…";
      case "done":            return "Minted ✓";
      case "error":           return "Retry";
    }
  })();

  function handleClick(): void {
    if (!isConnected) {
      // Pick the right connector: injected only if an extension exists,
      // else WalletConnect (mobile / no-extension). connectors[0] alone
      // is the injected connector and silently no-ops without an extension.
      const hasInjected = typeof window !== "undefined" && !!(window as unknown as { ethereum?: unknown }).ethereum;
      const injected = connectors.find((c) => c.type === "injected");
      const wc = connectors.find((c) => c.type === "walletConnect");
      const pick = (hasInjected && injected) ? injected : (wc ?? injected ?? connectors[0]);
      if (pick) connect({ connector: pick });
      return;
    }
    void start();
  }

  const isAdvancedTier = tier >= 3n; // Premium / Family Office / Institutional
  return (
    <div className={`card flex flex-col ${highlight ? "border-accent-teal" : ""}`}>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold font-display">{name}</h3>
        {highlight && <span className="tier-badge bg-accent-teal/20 text-accent-teal">Recommended</span>}
        {isAdvancedTier && <span className="tier-badge grad font-bold">Advanced</span>}
      </div>
      <div className="text-text-on-dark/80 font-mono text-sm mt-2">{price}</div>
      {referred && effUsdc && (
        <div className="mt-1 text-xs font-mono text-accent-teal">
          Referred — discount applied · you pay {effUsdc} USDC
        </div>
      )}
      <ul className="mt-4 space-y-1 text-sm text-text-muted flex-1">
        {perks.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="text-accent-teal">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      {swapConfigured && !isFree && !isHeld && isConnected && (() => {
        const known = payWith
          ? POLYGON_PAY_TOKENS.find((t) => t.address.toLowerCase() === payWith.toLowerCase())
          : undefined;
        const isCustom = payWith !== null && !known;
        const selectVal = payWith === null ? "" : known ? known.address : "custom";
        return (
          <div className="mt-4 text-xs space-y-2">
            <label className="block text-text-muted">Pay with</label>
            <select
              className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-xs"
              value={selectVal}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") setPayWith(null);
                else if (v === "custom") setPayWith("0x" as `0x${string}`);
                else setPayWith(v as `0x${string}`);
              }}
            >
              <option value="">USDC — pay directly, no swap (default)</option>
              {POLYGON_PAY_TOKENS.map((t) => (
                <option key={t.symbol} value={t.address}>{t.symbol} — {t.name} (swap → USDC)</option>
              ))}
              <option value="custom">Other — paste a Polygon token address…</option>
            </select>
            {isCustom && (
              <>
                <input
                  type="text"
                  placeholder="Token contract address 0x… (on Polygon)"
                  value={payWith === "0x" ? "" : (payWith ?? "")}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    setPayWith((/^0x[a-fA-F0-9]{40}$/.test(v) ? v : v === "" ? "0x" : v) as `0x${string}`);
                  }}
                  className="w-full bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs"
                />
                {!/^0x[a-fA-F0-9]{40}$/.test(payWith ?? "") && (
                  <div className="text-text-muted">Enter a valid Polygon token address, or pick a token / USDC above.</div>
                )}
              </>
            )}
            {payWith !== null && !isCustom && (
              <div className="text-text-muted">You pay in {known ? known.symbol : "the chosen token"} — auto-swapped to exactly the USDC price at mint.</div>
            )}
          </div>
        );
      })()}

      <button
        className={`btn mt-6 ${isHeld ? "btn-secondary" : "btn-primary"}`}
        disabled={isFree || isHeld || inFlight || (!!payWith && !/^0x[a-fA-F0-9]{40}$/.test(payWith))}
        onClick={handleClick}
      >
        {cta}
      </button>

      {(txHashApprove || txHashMint) && (
        <div className="text-xs text-slate-400 mt-3 space-y-1 font-mono">
          {txHashApprove && <div>approve: <PolyTx hash={txHashApprove} /></div>}
          {txHashMint && <div>mint: <PolyTx hash={txHashMint} /></div>}
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 mt-2 break-words">{humanizeTxError(error)}</div>
      )}
    </div>
  );
}

function PolyTx({ hash }: { readonly hash: `0x${string}` }): JSX.Element {
  return (
    <a
      href={`https://polygonscan.com/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-400 hover:underline"
    >
      {hash.slice(0, 10)}…{hash.slice(-6)}
    </a>
  );
}
