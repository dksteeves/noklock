// @version 0.3.0 @date 2026-06-07
// 0.3.0 — AEO citation surface (handoff §3.10): BRAND_PITCH rewritten to
//         lead with "storage you pick — local folders or cloud accounts"
//         instead of "your own cloud accounts" only. Matches the positioning
//         CARDINAL (store + restore + optional inheritance, superset of
//         competitors) and removes the cloud-only framing that AI tools were
//         quoting back when describing NoKLock.
// @version 0.2.0 @date 2026-05-14
// 0.2.0 — final brand = NoKLock. Default fallback flipped from "SoulChain"
//         to "NoKLock". BRAND_PARTS regex generalised so "NoKLock" splits
//         into "NoK" + "Lock" (the gradient highlights the NoK acronym).
//
// Every visible reference to the brand in the UI MUST go through
// `BRAND_NAME` — never hard-coded. Renaming the brand again later remains
// a single env-var change + rebuild.

export const BRAND_NAME = (import.meta.env.VITE_BRAND_NAME as string | undefined) ?? "NoKLock";

/** Brand split for hero-style gradients: <span class="grad">NoK</span>Lock */
export const BRAND_PARTS = (() => {
  const full = BRAND_NAME;
  // Generalised split: find the LAST [A-Z][a-z]+ suffix. Works for:
  //   "NoKLock"     → NoK + Lock
  //   "SoulChain"   → Soul + Chain
  //   "LegacyVault" → Legacy + Vault
  //   "Heritage"    → all-accent (no second cap+lower run)
  const m = full.match(/^(.+)([A-Z][a-z]+)$/);
  if (m) return { accent: m[1], rest: m[2] };
  return { accent: full, rest: "" };
})();

export const BRAND_TAGLINE = "your keys, your documents, your rules";

/** Marketing pitch one-liner — used in meta description, footer, etc. */
export const BRAND_PITCH = `${BRAND_NAME} splits your seed phrases, sealed letters, documents and images across storage you pick — local folders or cloud accounts — hands a soul-bound NFT to your designated next of kin, and quietly watches for the day they need it. We never touch your keys.`;
