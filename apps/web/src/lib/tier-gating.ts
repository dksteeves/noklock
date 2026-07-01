// @version 0.1.0 @date 2026-06-08
// 0.1.0 — Single source of truth for the vault-kind → minimum-tier map.
//
//         Daniel 2026-06-08: surfaced UX gap — the chooser tiles + the
//         /info Use-Cases catalog never labelled Document and Image
//         vaults as Premium-only on the default-layout cards, so a Free
//         or Standard user could land in a flow they'd be blocked from
//         and only discover the gate at the wizard.
//
//         This helper centralises the kind → minimum-tier mapping so
//         EnrolChooser, the Enrol welcome guard, and VaultUseCases all
//         derive their badges + lock predicates from the SAME data. The
//         contract-side gate stays in useTierGate (`has("documents")`).
//         This file is the *display + UX* sibling: which label to show,
//         which CTA, and a tiny predicate the chooser uses.
//
//         If a future tier adds a NEW gated kind (or moves an existing
//         kind across tiers), update VAULT_KIND_MIN_TIER here and every
//         badge in the UI updates with it.

import type { VaultBestKind } from "../components/VaultUseCases.js";

/* -------------------------------------------------------------------------
   Tier-id constants (mirror contracts.ts TIER but as `number` for ergonomics)
   ------------------------------------------------------------------------- */

export const TIER_FREE     = 0;
export const TIER_STANDARD = 1;
export const TIER_PREMIUM  = 3;

/* -------------------------------------------------------------------------
   VAULT_KIND_MIN_TIER — the per-kind minimum-tier map
   ------------------------------------------------------------------------- */

/** Minimum tier-id required to enrol each vault kind.
 *
 *  Aligns with contracts.ts TIER_PERKS + useTierGate's TIER_FEATURES:
 *    - seed   → FREE (Free gets 1 seed-or-letter vault per nokLimitForTier)
 *    - letter → FREE (Free gets 1 seed-or-letter vault — STANDARD adds both)
 *    - document → PREMIUM (gated by `documents` feature in useTierGate)
 *    - image    → PREMIUM (same `documents` gate)
 *
 *  Daniel's directive 2026-06-08: this is the ONLY place we encode the
 *  minimum-tier per kind. Do not duplicate this map in component files. */
export const VAULT_KIND_MIN_TIER: Readonly<Record<VaultBestKind, number>> = {
  seed:     TIER_FREE,
  letter:   TIER_FREE,
  document: TIER_PREMIUM,
  image:    TIER_PREMIUM,
};

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

/** True if a wallet currently on `userTier` can enrol the named vault kind. */
export function isVaultKindAllowed(kind: VaultBestKind, userTier: number): boolean {
  return userTier >= VAULT_KIND_MIN_TIER[kind];
}

/** UX badge label rendered as a small pill next to each kind in the chooser
 *  + use-case catalog + Enrol welcome guard.
 *
 *    FREE     → null  (no badge — "available to everyone" is the default,
 *                     contrast with the amber Premium pill is what carries
 *                     the meaning)
 *    STANDARD → "Standard+"
 *    PREMIUM  → "Premium+"
 *
 *  null is a deliberate signal — the caller decides whether to render a
 *  neutral "Included on Free" chip or simply omit the slot. */
export function tierBadgeLabel(kind: VaultBestKind): string | null {
  const minTier = VAULT_KIND_MIN_TIER[kind];
  if (minTier <= TIER_FREE)     return null;
  if (minTier <= TIER_STANDARD) return "Standard+";
  return "Premium+";
}

/** Human-readable name of the minimum tier required for the kind. Used in
 *  long-form CTAs ("Requires Premium — upgrade at /pricing"). */
export function minTierName(kind: VaultBestKind): string {
  const minTier = VAULT_KIND_MIN_TIER[kind];
  if (minTier <= TIER_FREE)     return "Free";
  if (minTier <= TIER_STANDARD) return "Standard";
  return "Premium";
}

/** Tailwind classes for the tier badge, in the same vocabulary as the
 *  existing DenseRow amber pill (VaultUseCases.tsx:744). Free returns null. */
export function tierBadgeClasses(kind: VaultBestKind): string | null {
  const minTier = VAULT_KIND_MIN_TIER[kind];
  if (minTier <= TIER_FREE)     return null;
  if (minTier <= TIER_STANDARD) return "bg-sky-600/30 text-sky-300 border border-sky-500/40";
  return "bg-amber-600/30 text-amber-300 border border-amber-500/40";
}
