// @version 0.2.0 @date 2026-05-20
// 0.2.0 — ACTIVE PLAN 7: Hybrid-E surface added to the SBT ABI —
//         `designateByEmail`, `rebindFromEscrow`, escrow + license setters,
//         tier-cap views (`nokDesignationCount`, `license`, `escrow`), and
//         new events `NoKDesignatedByEmail`, `NoKReboundFromEscrow`,
//         `EscrowUpdated`, `LicenseUpdated`, `Initialized`. Ownable2Step
//         (`pendingOwner` / `acceptOwnership`). Also brand: "SoulChainSBT"
//         comments → "NoKLockSBT".
// 0.1.0 — Minimal ABI + role/status enums for NoKLockSBT.sol. Three "role"
//         SBTs per NoK per vault: Activation (0) — trigger; Voting (1) —
//         M-of-N voting; Revocation (2) — owner-revoke marker.

import type { Address } from "viem";

export const SBT_ROLE = {
  Activation: 0,
  Voting: 1,
  Revocation: 2,
} as const;
export type SbtRole = typeof SBT_ROLE[keyof typeof SBT_ROLE];

export const SBT_ROLE_NAME: Record<number, string> = {
  0: "Activation",
  1: "Voting",
  2: "Revocation",
};

export const SBT_STATUS = {
  LockedInactive: 0,
  LockedActive: 1,
} as const;
export type SbtStatus = typeof SBT_STATUS[keyof typeof SBT_STATUS];

export const SBT_STATUS_NAME: Record<number, string> = {
  0: "Locked-inactive",
  1: "Locked-active",
};

/** Default per-NoK token URI on IPFS — static placeholder until per-vault
 *  metadata pinning lands. */
export const DEFAULT_NOK_TOKEN_URI = "ipfs://noklock-nok-v1/{id}.json";

export const sbtAbi = [
  // Read
  { type: "function", name: "ownerOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "locked", stateMutability: "pure", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "nextTokenId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "activeActivationCount", stateMutability: "view", inputs: [{ name: "vaultId", type: "bytes32" }], outputs: [{ type: "uint64" }] },
  { type: "function", name: "nokDesignationCount", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint32" }] },
  // B-2 (disappearance-resilient heir quorum) — public mapping auto-getter
  // hasRoleForVault[vaultId][role][wallet] → tokenId (0 = not a holder).
  // Used to verify a LOCAL heir-quorum signer holds a Voting-role SBT for the
  // vault on-chain, with NO Form B in the loop (see lib/quorum-local.ts).
  { type: "function", name: "hasRoleForVault", stateMutability: "view", inputs: [{ name: "vaultId", type: "bytes32" }, { name: "role", type: "uint8" }, { name: "wallet", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "oracle", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "recoveryModule", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "escrow", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "license", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  {
    type: "function",
    name: "meta",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "vaultId", type: "bytes32" },
      { name: "ownerWallet", type: "address" },
      { name: "role", type: "uint8" },
      { name: "status", type: "uint8" },
      { name: "mintedAt", type: "uint64" },
      { name: "manifestHash", type: "bytes32" },
    ],
  },

  // Write — designation paths
  // 0.3.0 — C-05 vault-binding attestation. `vaultBindingSig` / `…ExpiresAt`
  // / `…Nonce` are pass-through optional inputs. Pre-attestor-set, callers
  // pass empty bytes / 0 / 0x00…; the on-chain `_checkVaultBinding` no-ops
  // when `vaultBindingAttestor == address(0)`. Once the off-chain signer
  // ships and the owner sets the attestor, the PWA must fetch a fresh
  // signed `VaultBinding` from Form B per mint and pass it here.
  {
    type: "function",
    name: "mintNoK",
    stateMutability: "nonpayable",
    inputs: [
      { name: "nokWallet", type: "address" },
      { name: "vaultId", type: "bytes32" },
      { name: "role", type: "uint8" },
      { name: "manifestHash", type: "bytes32" },
      { name: "tokenUri", type: "string" },
      { name: "vaultBindingSig", type: "bytes" },
      { name: "vaultBindingExpiresAt", type: "uint64" },
      { name: "vaultBindingNonce", type: "bytes32" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "designateByEmail",
    stateMutability: "nonpayable",
    inputs: [
      { name: "vaultId", type: "bytes32" },
      { name: "emailHash", type: "bytes32" },
      { name: "role", type: "uint8" },
      { name: "manifestHash", type: "bytes32" },
      { name: "tokenUri", type: "string" },
      { name: "vaultBindingSig", type: "bytes" },
      { name: "vaultBindingExpiresAt", type: "uint64" },
      { name: "vaultBindingNonce", type: "bytes32" },
    ],
    outputs: [{ type: "uint256" }],
  },
  { type: "function", name: "revokeNoK", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [] },
  // rebindFromEscrow is escrow-only — included so the ABI surface is
  // complete but the PWA does not call it.
  {
    type: "function",
    name: "rebindFromEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "oldTokenId", type: "uint256" },
      { name: "newNokWallet", type: "address" },
      { name: "newTokenUri", type: "string" },
    ],
    outputs: [{ type: "uint256" }],
  },

  // Owner admin
  { type: "function", name: "setOracle", stateMutability: "nonpayable", inputs: [{ name: "newOracle", type: "address" }], outputs: [] },
  { type: "function", name: "setRecoveryModule", stateMutability: "nonpayable", inputs: [{ name: "newModule", type: "address" }], outputs: [] },
  { type: "function", name: "setEscrow", stateMutability: "nonpayable", inputs: [{ name: "newEscrow", type: "address" }], outputs: [] },
  { type: "function", name: "setLicense", stateMutability: "nonpayable", inputs: [{ name: "newLicense", type: "address" }], outputs: [] },

  // Ownable2Step
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pendingOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "newOwner", type: "address" }], outputs: [] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },

  // Events
  {
    type: "event",
    name: "NoKMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "nokWallet", type: "address", indexed: true },
      { name: "ownerWallet", type: "address", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: false },
      { name: "role", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NoKDesignatedByEmail",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "emailHash", type: "bytes32", indexed: true },
      { name: "ownerWallet", type: "address", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: false },
      { name: "role", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NoKActivated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "NoKRevoked",
    inputs: [{ name: "tokenId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "NoKRecovered",
    inputs: [
      { name: "oldTokenId", type: "uint256", indexed: true },
      { name: "newTokenId", type: "uint256", indexed: true },
      { name: "newNokWallet", type: "address", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NoKReboundFromEscrow",
    inputs: [
      { name: "oldTokenId", type: "uint256", indexed: true },
      { name: "newTokenId", type: "uint256", indexed: true },
      { name: "newNokWallet", type: "address", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EscrowUpdated",
    inputs: [
      { name: "oldEscrow", type: "address", indexed: false },
      { name: "newEscrow", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "LicenseUpdated",
    inputs: [
      { name: "oldLicense", type: "address", indexed: false },
      { name: "newLicense", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "oracle", type: "address", indexed: true },
    ],
  },
] as const;

/** Pack a 32-byte hex string into a 0x-prefixed bytes32 literal. */
export function asBytes32(hex: string): `0x${string}` {
  const clean = hex.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error("asBytes32: not hex");
  if (clean.length > 64) throw new Error("asBytes32: more than 32 bytes");
  return ("0x" + clean.padStart(64, "0")) as `0x${string}`;
}

/** Format a token-id from a chain-read result. */
export function fmtTokenId(id: bigint | number | string): string {
  return typeof id === "bigint" ? id.toString() : String(id);
}

export interface SbtMeta {
  readonly vaultId: `0x${string}`;
  readonly ownerWallet: Address;
  readonly role: number;
  readonly status: number;
  readonly mintedAt: bigint;
  readonly manifestHash: `0x${string}`;
}
