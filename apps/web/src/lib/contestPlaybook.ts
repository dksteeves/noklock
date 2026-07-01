// @version 0.1.0 @date 2026-05-26
// Per-partner playbook for the "Refer & Share" contest. The partner receives
// (or copies) this as a single markdown doc telling them:
//   1. what the campaign is + how the on-chain mechanic works (no trust);
//   2. the artifacts they have (announcement card PNG, group post body, pitch);
//   3. step-by-step how to run it end-to-end (set up, post, track, pay out);
//   4. how anyone in their group can verify earnings + pool size on-chain;
//   5. compliance notes (honour-system payout, no NoKLock custody, taxes).
//
// Markdown so it pastes cleanly into Telegram/Notion/Google Docs/email — and
// downloads as a .md file the partner can keep or share with co-admins.

import type { ContestConfig } from "./contestTemplate.js";
import { describeDistribution, polygonscanAddressUrl, buildContestPostBody, buildContestPitch } from "./contestTemplate.js";

export function buildContestPlaybook(cfg: ContestConfig): string {
  const groupName = (cfg.groupName || "Our group").trim();
  const wallet = (cfg.referrerWallet || "0x…").trim();
  const distrText = describeDistribution(cfg.distribution);
  const postBody = buildContestPostBody(cfg);
  const pitch = buildContestPitch(cfg);
  const today = new Date().toISOString().slice(0, 10);

  return `# NoKLock × ${groupName} — Refer & Share Playbook
*Generated ${today}*

---

## 1. What this campaign is (60 seconds)

You run a community. NoKLock is self-custodial crypto inheritance — source-verified on Polygon. The mechanic is simple: visiting your referral link gets the buyer **10% off**, and you earn **10% of what they pay** in USDC, **on-chain the moment they mint, no claim step**. NoKLock licences include lifetime tiers (paid once — the USDC sits in your wallet, no churn) and yearly tiers. The contract permanently locks each member to you as their first referrer (\`referredBy\`), so when they re-purchase or renew through a referral link you're credited again automatically.

**Refer & Share** is a drop-in layer on top of that. You pre-commit a slice of those earnings to a community pool, and when enough of your community has signed up, the pool pays out as a prize. **You can't be out of pocket** — every dollar that goes into the pool is a dollar you only earned because your community signed up.

The trust layer is on-chain. Anyone in your group can independently calculate the pool size by looking at incoming USDC to your wallet. Nothing to trust — math.

---

## 2. Your contest configuration

| Knob | Setting |
|---|---|
| Group | **${groupName}** |
| Referrer wallet | \`${wallet}\` |
| Pool share | **${cfg.sharePct}%** of earned referral USDC |
| Trigger | **${cfg.triggerCount}** qualified signups |
| Prize | ${cfg.prize.trim() || "_(set before posting)_"} |
| Distribution | ${distrText} |

**Qualified signup** = a paid licence mint under your referrer wallet (Free-tier mints don't count — they earn no commission). NoKLock's first-referrer lock is permanent on-chain (\`referredBy[user]\` is set on the first referred mint and can never be changed by anyone else), so the same member coming back through your link for a yearly renewal continues to credit you 10% of what they pay. Plain renewals (the user mints directly without a referral link) currently only credit you on the first referred mint — for yearly tiers this means the value of the lock comes from re-engagement through your link; for lifetime tiers it's a single payout regardless. (A future PWA pass will auto-route renewals through the referral path when \`referredBy\` is set, so plain renewals will start auto-paying you too.)

---

## 3. Artifacts you have

1. **Announcement card** — a 1200×675 PNG cobranded card (your logo × NoKLock). Use as the image in your Telegram group post, X post, channel banner, or wherever. Downloaded from the Partner Card builder in NoKLock Admin.
2. **Group post body** — the Telegram message announcing the contest (this doc, §4).
3. **Admin pitch** — the 30-second explainer you DM to other group admins or co-organisers (§5).
4. **On-chain verify link** — \`${polygonscanAddressUrl(wallet)}\` — shows every incoming USDC payment to your wallet. Pin this where your group can find it; it's the proof.

---

## 4. The Telegram group post (ready to send)

Copy this body verbatim and post in your group (along with the announcement card PNG):

\`\`\`
${postBody}
\`\`\`

Edit \`Current count\` before each re-post so it stays accurate. You can read the live count off your wallet's PolygonScan page — count the USDC \`Transfer\` events from the NoKLock License contract.

---

## 5. The admin / co-organiser pitch (for DMs)

Use this when explaining the offer to another group admin or a co-founder:

\`\`\`
${pitch}
\`\`\`

---

## 6. How to run it end-to-end

### Setup (one-time, ~10 minutes)
1. **Get your referrer wallet ready.** Use any wallet you control. The address above (\`${wallet}\`) is the one we baked into your card + posts; if you change wallets, regenerate this playbook and the card.
2. **Save the announcement card PNG.** Download from the Partner Card builder. Keep a copy.
3. **Pin the on-chain verify link** in your Telegram group description or pinned message.
4. **Post the announcement** (§4). Attach the PNG. Pin the post.

### During the contest (weekly, ~5 minutes)
1. **Check your wallet's PolygonScan page** (\`${polygonscanAddressUrl(wallet)}\`). Count incoming USDC \`Transfer\` events from the NoKLock License contract — that's your qualified-signup count.
2. **Update the \`Current count\` in your pinned post** (or re-post the message with the new count). Optional: post a weekly "${cfg.sharePct}% pool is now $X — Y / ${cfg.triggerCount} signups" update. Builds momentum.
3. **Recognise referrers publicly.** If you can see which wallets are minting (they're public on-chain), shout out big drivers. Doesn't have to be names — wallet stubs work.

### When the trigger fires
1. **Verify the count** one more time on PolygonScan.
2. **Snapshot the qualified signups** — list each minting wallet (filter the License contract's \`LicenceMinted\` events by your referrer address; we can give you the exact filter if you ask).
3. **Calculate the pool**: ${cfg.sharePct}% of your total earned referral USDC since you posted the contest. Pay out via:
   - **${distrText}**, per your contest config above;
   - if the prize includes NoKLock licences, mint them from your wallet using the licenced mintLicence(adminMint) flow — that costs you nothing if NoKLock has whitelisted you, otherwise mint at full price and the recipients get the licence anyway (your call);
   - if the prize includes USDC, send directly from your wallet to the winners.
4. **Post the payout txs in the group.** Every transaction is public — putting the hashes in chat closes the loop and builds trust for the next round.

### After the contest
- **Run it again with a bigger trigger.** A successful round demonstrates the model, retains member attention, and gives you fresh USDC to seed the next pool. (Note: prize-licence recipients become NoKLock users in their own right — they'll refer their own friends and earn for themselves, NOT for you. The contest's value to you is community engagement + retention, not a recursive referral pyramid.)
- **Adjust the share % up** if your community is small but high-trust; **down** if it's huge and you want each pool to be smaller and more frequent.

---

## 7. Verifiability (the "does he actually pay out?" answer)

Anyone in your group can do this independently — no trust required:

1. Open \`${polygonscanAddressUrl(wallet)}\` in any browser.
2. Filter to ERC-20 token transfers, contract = USDC (\`0x3c499c…3359\` on Polygon).
3. Sum the \`Transfer\` events INTO your wallet that originated from the NoKLock License contract. That's the partner's earned commission.
4. Multiply by **${cfg.sharePct}%** → that's the pool size.
5. When the trigger fires, the partner's payout txs go on-chain — searchable on the same page.

The numbers are public, the wallet is public, the math is automatic. Nothing to trust.

---

## 8. Notes & compliance

- **Honour system.** NoKLock doesn't custody contest funds — the partner does. The on-chain audit trail is the accountability layer. If a partner welches, the group can see it instantly and the partnership ends.
- **Not custodial.** NoKLock never touches the partner's wallet or pool funds. We provide the referral mechanic + the templates; the partner runs their contest.
- **Free-tier signups don't count.** They earn no commission, so they're not in the pool math. Only paid licences (Standard / Premium / Lifetime) qualify.
- **Tax.** Earnings + payouts are between the partner, their community, and their local tax authority. Not legal/tax advice; consult your accountant.
- **No spam.** Run this in your OWN community where it's on-topic and welcome. NoKLock isn't responsible for posts in third-party groups.

---

## 9. Questions / iteration

Need a custom variant (e.g. multi-round, tiered prizes, milestone bonuses)? Reply to the partnership thread and we'll work it through. The 4-knob template above covers ~90% of community contests; the rest is bespoke.

You can also reach the NoKLock team + other partners directly on Telegram:
- Channel (announcements): https://t.me/noklock_app
- Group (chat, invite link): https://t.me/+OGgwnHraxbs1MmU0
- X: https://x.com/noklock_app
- Email: hello@noklock.app

— NoKLock partnerships
`;
}
