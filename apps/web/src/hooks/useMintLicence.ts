// @version 0.4.0 @date 2026-06-08
// 0.4.0 — Adopt referral.ts 0.3.0 StoredReferrer union. getStoredReferrer()
//         now returns { kind:'self-custody'|'managed', ... } | null. The
//         on-chain mint flow only applies a contract-level referrer for
//         self-custody (the on-chain path the License contract knows about);
//         managed-mode referrals are attributed off-chain by Form B at the
//         Paddle webhook, so a managed StoredReferrer is IGNORED here —
//         the contract mint path runs unreferred and the managed-side
//         credit is recorded out-of-band. effectivePrice and the exposed
//         `referrer` field narrow to the 0x address (or null) so TierCard
//         and any downstream consumer keep their existing type contract.
// 0.3.0 — WS2b: OPTIONAL swap-to-pay. If `payWith` is set to a non-USDC
//         Polygon token AND a 0x key is configured, the flow first swaps
//         exactly the needed USDC into the wallet (0x allowance-holder,
//         Polygon-only), THEN runs the unchanged approve+mint. payWith
//         null (the default) = byte-identical to before.
// 0.2.1 — Network guard: ensurePolygon() before the approve/mint writes so
//         a wallet on BSC/ETH is switched to Polygon first (kills the
//         "asking for BNB" failure). No contract change.
// 0.2.0 — referral-aware. If a referrer is captured (lib/referral) and is
//         not the connected wallet, the flow approves the DISCOUNTED price
//         (list − refereeDiscountBps) and calls mintLicenceReferred(tier,
//         referrer) instead of mintLicence(tier). `effectivePrice` +
//         `referrer` exposed so TierCard can show the discount.
// 0.1.0 — base 2-tx flow (approve + mintLicence).
//
// useMintLicence — encapsulates the 2-tx flow:
//   1. USDC approve(license-contract, effectivePrice)
//   2. license.mintLicence(tier)  OR  mintLicenceReferred(tier, referrer)
//
// Returns the state machine so a TierCard can render Approve → Mint → Done.

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { erc20Abi, licenseAbi, LICENSE_ADDR, USDC_ADDR, type TierId } from "../lib/contracts.js";
import { getStoredReferrer } from "../lib/referral.js";
import { useEnsurePolygon } from "./useEnsurePolygon.js";
import { quoteToUsdc, isSwapConfigured, isNative } from "../lib/swap.js";

export type MintStep =
  | "idle" | "checking" | "swapping" | "swap-pending"
  | "approving" | "approve-pending" | "minting" | "mint-pending" | "done" | "error";

export interface UseMintLicenceState {
  readonly step: MintStep;
  readonly error: string | null;
  readonly price: bigint | null;
  /** Amount actually charged: list price, or discounted if referred. */
  readonly effectivePrice: bigint | null;
  /** Captured referrer applied to this mint, or null. */
  readonly referrer: `0x${string}` | null;
  readonly allowance: bigint | null;
  readonly txHashApprove: `0x${string}` | null;
  readonly txHashMint: `0x${string}` | null;
  /** Optional: a non-USDC Polygon token to pay with (swapped to USDC at
   *  mint via 0x). null = pay USDC directly (default, unchanged path). */
  readonly payWith: `0x${string}` | null;
  readonly setPayWith: (t: `0x${string}` | null) => void;
  /** True only if a 0x API key is configured — UI gates the token picker. */
  readonly swapConfigured: boolean;
  readonly start: () => Promise<void>;
  readonly reset: () => void;
}

export function useMintLicence(tier: TierId): UseMintLicenceState {
  const { address } = useAccount();
  const [step, setStep] = useState<MintStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txApprove, setTxApprove] = useState<`0x${string}` | null>(null);
  const [txMint, setTxMint] = useState<`0x${string}` | null>(null);
  const [payWith, setPayWith] = useState<`0x${string}` | null>(null);

  // referral.ts 0.3.0 returns a discriminated union. The contract path only
  // understands self-custody 0x referrers; managed NK-MGMT-* codes are
  // Form-B / Paddle-webhook territory, so we narrow here and ignore the
  // managed branch for on-chain mint purposes.
  const stored = getStoredReferrer(address ?? null);
  const referrer: `0x${string}` | null =
    stored && stored.kind === "self-custody" ? stored.address : null;

  // H-29/H-36 (pressure-test 2026-06-10): read currentPrice, NOT priceFor.
  // The contract charges currentPrice(tier) at mint (founderCapRemaining>0 ?
  // priceForFounder : priceFor — NoKLockLicense.sol:337-339,387,433). priceFor
  // is the REGULAR price only; during the 10,000-mint founder window it differs
  // from what is actually charged, so the buyer was shown + approved the wrong
  // (higher) amount. contracts.ts:240-241 explicitly warns to use currentPrice.
  const { data: price } = useReadContract({
    address: LICENSE_ADDR,
    abi: licenseAbi,
    functionName: "currentPrice",
    args: [tier],
  });

  const { data: discountBps } = useReadContract({
    address: LICENSE_ADDR,
    abi: licenseAbi,
    functionName: "refereeDiscountBps",
    query: { enabled: !!referrer },
  });

  const listPrice = (price as bigint | undefined) ?? null;
  const effectivePrice: bigint | null =
    listPrice === null
      ? null
      : referrer
      ? listPrice - (listPrice * BigInt((discountBps as number | undefined) ?? 0)) / 10_000n
      : listPrice;

  const { data: allowance } = useReadContract({
    address: USDC_ADDR,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, LICENSE_ADDR] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { ensurePolygon } = useEnsurePolygon();

  useWaitForTransactionReceipt({ hash: txApprove ?? undefined });
  useWaitForTransactionReceipt({ hash: txMint ?? undefined });

  const start = useCallback(async () => {
    if (!address) { setError("Connect a wallet first"); setStep("error"); return; }
    if (effectivePrice === null) { setError("Reading price… try again"); setStep("error"); return; }

    setError(null);
    setStep("checking");

    try {
      await ensurePolygon();

      // Optional swap-to-pay: turn the user's chosen Polygon token into
      // exactly the USDC needed, into their wallet, BEFORE the normal
      // approve+mint. payWith null (default) skips this whole block.
      if (payWith && payWith.toLowerCase() !== USDC_ADDR.toLowerCase() && isSwapConfigured()) {
        setStep("swapping");
        const q = await quoteToUsdc({ sellToken: payWith, usdcOut: effectivePrice, taker: address });
        if (!isNative(payWith) && q.allowanceTarget) {
          const ah = await writeContractAsync({
            address: payWith,
            abi: erc20Abi,
            functionName: "approve",
            args: [q.allowanceTarget, q.sellAmount],
          });
          await waitForTx(ah);
        }
        setStep("swap-pending");
        const sh = await sendTransactionAsync({ to: q.to, data: q.data, value: q.value });
        await waitForTx(sh);
      }

      const cur = (allowance as bigint | undefined) ?? 0n;
      if (cur < effectivePrice) {
        setStep("approving");
        const hash = await writeContractAsync({
          address: USDC_ADDR,
          abi: erc20Abi,
          functionName: "approve",
          args: [LICENSE_ADDR, effectivePrice],
        });
        setTxApprove(hash);
        setStep("approve-pending");
        // Allow a beat for the receipt to land; wagmi's useWaitForTransactionReceipt is observed via the badge in the UI.
        await waitForTx(hash);
      }

      setStep("minting");
      const hashMint = referrer
        ? await writeContractAsync({
            address: LICENSE_ADDR,
            abi: licenseAbi,
            functionName: "mintLicenceReferred",
            args: [tier, referrer],
          })
        : await writeContractAsync({
            address: LICENSE_ADDR,
            abi: licenseAbi,
            functionName: "mintLicence",
            args: [tier],
          });
      setTxMint(hashMint);
      setStep("mint-pending");
      await waitForTx(hashMint);
      setStep("done");
    } catch (e) {
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [address, allowance, effectivePrice, referrer, tier, writeContractAsync, ensurePolygon, payWith, sendTransactionAsync]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setTxApprove(null);
    setTxMint(null);
  }, []);

  return {
    step,
    error,
    price: listPrice,
    effectivePrice,
    referrer,
    allowance: (allowance as bigint | undefined) ?? null,
    txHashApprove: txApprove,
    txHashMint: txMint,
    payWith,
    setPayWith,
    swapConfigured: isSwapConfigured(),
    start,
    reset,
  };
}

// Minimal poll-by-receipt fallback in case useWaitForTransactionReceipt's
// auto-refresh hasn't fired yet by the time we kick off the next step.
async function waitForTx(_hash: `0x${string}`): Promise<void> {
  await new Promise((r) => setTimeout(r, 1500));
}
