// @version 0.1.0 @date 2026-05-23
// Reddit answer templates for the Marketing tab (Daniel: get the offsite copy
// ONLINE). Value-first, with disclosure — never astroturf. Use in genuinely
// relevant threads only; tweak per thread.

export const REDDIT_RULES: readonly string[] = [
  "Disclose. Lead with \"full disclosure, I work on NoKLock\" — astroturf once and the brand is radioactive on Reddit/CT forever.",
  "Value first. Answer the actual question; mention NoKLock as ONE option alongside the real alternatives (Casa, Vault12, …).",
  "Don't paste verbatim into ten threads — tweak each to the specific question.",
  "Account: u/Spirited_Future_4682. Good subs: r/CryptoCurrency, r/Bitcoin, r/ethereum, r/CryptoSecurity, and estate-planning crossovers.",
];

export interface RedditAnswer { readonly id: string; readonly forThread: string; readonly body: string }

export const REDDIT_ANSWERS: readonly RedditAnswer[] = [
  {
    id: "what-happens-when-i-die",
    forThread: "\"What happens to my crypto when I die?\" / \"How do I leave crypto to my family?\"",
    body: `This is the problem almost no one plans for until it's too late. Your options, roughly:

1. Hand someone your seed early — solves death, creates a "they can rob you today" problem.
2. A custodian / multisig service (Casa, Vault12, Unchained) — they help your heirs, but you're trusting a company with a key and usually paying a yearly subscription forever.
3. Self-custodial inheritance — your heirs get access only after you stop checking in, without you handing over keys while you're alive.

Whatever you choose: split the seed (Shamir / SLIP-39) so no single location is a jackpot, store the pieces where your heirs can actually reach them, and test the recovery before you trust it. Most "lost crypto" isn't hacks — it's heirs who had no idea what to do.

Full disclosure: I work on NoKLock, which does the self-custodial-inheritance version (on-chain dead-man's switch on Polygon, soulbound-NFT heirs, an email path for non-crypto family, works even if we shut down). Happy to answer questions — and genuinely, Casa/Vault12 are solid if you'd rather have a human-run service. The important thing is that you set something up.`,
  },
  {
    id: "casa-vault12-alternative",
    forThread: "\"Casa / Vault12 alternative?\" / \"cheaper or more self-custodial option?\"",
    body: `Depends what's bugging you about them. Casa is a polished collaborative-multisig service but it co-holds a key and it's a perpetual subscription; Vault12 is no-KYC and approachable but the whole flow lives inside their app.

If you want it fully self-custodial + on a public chain (so it survives the vendor), look at on-chain dead-man's-switch designs. Full disclosure I work on one (NoKLock) — one-time Lifetime option instead of a subscription, mints a soulbound NFT as the on-chain inheritance record, has a duress/decoy vault, and an email path for heirs who don't use crypto. There's also Inheriti and Deadhand at the lighter/cheaper end. Pick on: do you want a human service (Casa), an app (Vault12), or a vendor-independent on-chain trigger (the dead-man's-switch products).`,
  },
  {
    id: "dead-man-switch",
    forThread: "\"Is a dead-man's switch for crypto a good idea?\" / \"how do they work?\"",
    body: `The good ones are "proof-of-life, not proof-of-death": nothing fires because someone claims you died — it fires only if YOU stop checking in for a window you set. So the failure mode is "I forgot to check in," which you mitigate with a long grace window (months) + a calendar reminder, not "a relative declared me dead to grab my coins."

Watch for: is it actually self-custodial, or does the company hold a key? Does it survive the company shutting down? Can a single heir trigger it alone, or does it need an M-of-N quorum? (Full disclosure, I work on NoKLock, which is on the self-custodial / on-chain / M-of-N end — but those are the right questions to ask of any of them.)`,
  },
];
