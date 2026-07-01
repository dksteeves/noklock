// @version 0.1.0 @date 2026-05-26
// "Refer & Share" contest — config + Telegram post body + 30-second pitch
// generators. A DROP-IN LAYER on top of NoKLock's existing on-chain referral
// program: the partner already earns USDC commission on every paid licence
// minted under their referrer wallet (mintLicenceReferred → 10% of the
// buyer's payment, on-chain, paid in USDC at mint). This
// module just lets them pre-commit a slice of those earnings to a community
// pool, with the on-chain referral events as the verifiable proof.
//
// Honour-system payout: the partner pays out manually from their earned USDC.
// The trust layer is on-chain: anyone in their group can independently verify
// signups + earnings on PolygonScan (the partner's address page shows incoming
// USDC), so the pool size isn't a claim — it's a calculation.

export type SharePct = 2.5 | 5 | 7.5;

export type Distribution =
  | { kind: "equal" }
  | { kind: "raffle"; winners: number }
  | { kind: "weighted" };

/** Free-text prize description (with a few presets the UI prefills). The user
 *  may say "2 Premium Lifetime licences + remainder in USDC" or anything else
 *  — kept as a string so any combination is expressible without a complex prize
 *  config UI. */
export type PrizeDescription = string;

export interface ContestConfig {
  /** Partner's community / group name, e.g. "DegenDAO". */
  readonly groupName: string;
  /** Partner's referrer wallet address (the on-chain proof anchor). */
  readonly referrerWallet: string;
  /** Slice of earned referral USDC that goes to the pool. */
  readonly sharePct: SharePct;
  /** Qualified signups required before the pool pays out. */
  readonly triggerCount: number;
  /** Human description of the prize. */
  readonly prize: PrizeDescription;
  /** How the pool is split when the trigger fires. */
  readonly distribution: Distribution;
  /** Optional current signup count (the partner edits before each post). */
  readonly currentCount?: number;
}

/** A short polygonscan link that any group member can use to independently
 *  verify the partner's incoming USDC commission. The address-page token-
 *  transfers tab shows every payment in, so the pool size is calculable from
 *  public chain data. */
export function polygonscanAddressUrl(addr: string): string {
  return `https://polygonscan.com/address/${addr}#tokentxns`;
}

export function describeDistribution(d: Distribution): string {
  switch (d.kind) {
    case "equal":
      return "split equally across all qualified signups";
    case "raffle":
      return d.winners === 1
        ? "a 1-winner random raffle of the full pool"
        : `a random raffle of ${d.winners} winners`;
    case "weighted":
      return "weighted by sub-referrals (members who brought the most signups win more)";
  }
}

/** The Telegram group-post body. Same shape as ChannelTemplate.body so it
 *  drops into the existing Marketing → Channels "Share to Telegram" affordance
 *  and the prefilled-share URL. Honest, no hype, mirrors the structure Daniel
 *  drafted. */
export function buildContestPostBody(cfg: ContestConfig): string {
  const groupName = (cfg.groupName || "Our group").trim();
  const wallet = (cfg.referrerWallet || "0x…").trim();
  const distrText = describeDistribution(cfg.distribution);
  const counter = typeof cfg.currentCount === "number" ? `${cfg.currentCount} / ${cfg.triggerCount}` : `0 / ${cfg.triggerCount}`;
  return [
    `🔒 NoKLock × ${groupName} — Community Reward Drop`,
    ``,
    `NoKLock = Self-custodial seed store & restore, chain-protected. You keep the keys; the chain holds the proof. (Inheritance comes free on top.)`,
    ``,
    `Every paid licence minted under our group wallet earns the group referral USDC. I'm putting ${cfg.sharePct}% of every cent of that into a community pool.`,
    ``,
    `When we hit ${cfg.triggerCount} signups, the pool pays out as: ${cfg.prize.trim() || "[prize TBD]"} — ${distrText}.`,
    ``,
    `No signup form. No email. Just mint under our referrer wallet ${wallet} and you're in.`,
    ``,
    `Pool size live & verifiable on-chain: ${polygonscanAddressUrl(wallet)}`,
    ``,
    `Current count: ${counter}.`,
  ].join("\n");
}

/** The "why a community owner should care" 30-second pitch — what the partner
 *  pastes into a DM when explaining the offer to a group admin. */
export function buildContestPitch(cfg: ContestConfig): string {
  return [
    `It costs you nothing upfront. Every payout comes from referral USDC you only earn because your community signed up — you can't be out of pocket.`,
    ``,
    `The math: anyone visiting your link gets 10% off; you earn 10% of what they pay, paid on-chain in USDC the moment they mint. No claim step, no NoKLock custody — it's a direct USDC transfer from the buyer to your wallet. Lifetime-tier signups are a one-time payout (USDC sits in your wallet, no churn). Yearly tiers can pay you again when the same member renews through a referral link — they're permanently locked to you on-chain as their first referrer. The contest only takes a slice (${cfg.sharePct}%) of these earnings.`,
    ``,
    `And the on-chain proof removes the single biggest objection ("does he actually pay out?") — the numbers are public, your wallet is public, the math is automatic.`,
    ``,
    `Verify any time on Polygon: ${polygonscanAddressUrl(cfg.referrerWallet || "0x…")}`,
  ].join("\n");
}
