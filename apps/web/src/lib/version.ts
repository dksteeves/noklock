// @version 0.1.0 @date 2026-05-15
// Public display version. Decoupled from package.json / build hash.
// Daniel's call 2026-05-15: present "v1.0.0" externally regardless of
// internal package versions until a deliberate brand-visible bump is decided.
//
// Internal build hash is still surfaced separately by App.tsx /
// AboutBox.tsx — that's what tells QA which exact bundle is running.

export const PUBLIC_VERSION = "1.0.0";

/** ISO-8601 launch date — current mainnet contract bundle deployed. Hand-edit
 *  on rebrand or material change. 2026-05-22: the final 5-contract bundle
 *  (License/SBT/Oracle/Recovery/Escrow, Ownable2Step, Solidity 0.8.35) went
 *  live, superseding the original 2026-05-15 4-contract set. */
export const DEPLOY_DATE = "2026-05-22";

/** Build hash injected at vite build (vite-env.d.ts declares __BUILD_VERSION__). */
export function getBuildHash(): string {
  try {
    const g = globalThis as unknown as { __BUILD_VERSION__?: string };
    if (typeof __BUILD_VERSION__ !== "undefined") return __BUILD_VERSION__;
    if (typeof g.__BUILD_VERSION__ === "string") return g.__BUILD_VERSION__;
  } catch {
    /* swallow */
  }
  return "dev";
}
