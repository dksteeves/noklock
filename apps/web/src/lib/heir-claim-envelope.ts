// @version 0.2.0 @date 2026-06-03
// 0.2.0 — 2026-06-03: MED-envelope-1 — strict length validators for the
//         two bytes32 fields (vaultId, manifestHash). Reject truncated
//         hex like "0xab" / "0xcd" that the previous open-ended
//         `/^0x[0-9a-fA-F]+$/` regex accepted. A truncated bytes32 silently
//         right-pads in viem during recoverTypedDataAddress and would let
//         a malformed envelope pass parse + reach the EIP-712 verify step
//         where it could either spuriously recover or open a domain-
//         confusion footgun. We now enforce exactly 32 bytes (66 chars
//         including the "0x" prefix). signature stays open-length (65-byte
//         ECDSA sigs are the norm, but EIP-1271 / future schemes may vary).
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step 5 [mofn-restore-quorum-fix-plan §D.1].
//         A signed claim envelope written client-side at the moment a heir
//         completes `NokClaim.tsx::requestAttestationAndClaim`. The
//         envelope is the unambiguous "I am a HEIR for this vault"
//         credential the heir-restore route consumes — `detectRestoreMode`
//         (lib/restore-mode.ts) returns "heir" whenever a parsed-and-valid
//         envelope is supplied, regardless of explicit mode flags.
//
//         EIP-712 domain mirrors `useHeartbeat.ts` (name="NoKLock",
//         version="1", chainId=137 / Polygon mainnet) so a wallet that
//         already prompted for Heartbeat doesn't re-confirm the chain
//         identity. The primaryType "HeirClaimEnvelope" is namespaced
//         per the EIP-712 spec — recover from a vote / heartbeat sig
//         won't collide.
//
//         The signature recovers to `heirWallet` — `verifyClaimEnvelope`
//         enforces that and is the gate `HeirRestore.tsx` will run on
//         drop. There is NO server-side persistence of envelopes; they
//         are a portable artifact the heir keeps with their share files.

import { recoverTypedDataAddress } from "viem";
import type { Hex, Address } from "viem";

const DOMAIN = {
  name: "NoKLock",
  version: "1",
  chainId: 137, // Polygon mainnet — swap to 80002 for Amoy testnet at config time.
} as const;

const TYPES = {
  HeirClaimEnvelope: [
    { name: "vaultId", type: "bytes32" },
    { name: "activationTokenId", type: "uint256" },
    { name: "manifestHash", type: "bytes32" },
    { name: "heirWallet", type: "address" },
    { name: "createdAt", type: "uint64" },
  ],
} as const;

const PRIMARY_TYPE = "HeirClaimEnvelope" as const;
const ARTIFACT_TAG = "heir-claim-envelope/v1" as const;

export interface HeirClaimEnvelope {
  readonly soulchain?: typeof ARTIFACT_TAG;
  readonly vaultId: Hex;
  readonly activationTokenId: string; // uint256 as decimal string (JSON-safe)
  readonly heirWallet: Address;
  readonly createdAt: number; // unix seconds
  readonly signature: Hex;
  readonly manifestHash: Hex;
}

export interface GenerateClaimEnvelopeArgs {
  readonly vaultId: Hex;
  readonly activationTokenId: string;
  readonly manifestHash: Hex;
  readonly heirWallet: Address;
  /** Heir's wallet `signTypedData` (from wagmi's `useSignTypedData`).
   *  Kept generic so this module doesn't import wagmi directly. */
  readonly signTypedData: (args: {
    readonly domain: typeof DOMAIN;
    readonly types: typeof TYPES;
    readonly primaryType: typeof PRIMARY_TYPE;
    readonly message: {
      readonly vaultId: Hex;
      readonly activationTokenId: bigint;
      readonly manifestHash: Hex;
      readonly heirWallet: Address;
      readonly createdAt: bigint;
    };
  }) => Promise<Hex>;
}

/** Sign + assemble a heir-claim envelope using the connected heir wallet.
 *  Called at the end of `NokClaim.tsx::requestAttestationAndClaim` (plan
 *  §D.5) so each heir gets a downloadable `claim-envelope.json` paired
 *  with their share file. */
export async function generateClaimEnvelope(
  args: GenerateClaimEnvelopeArgs,
): Promise<HeirClaimEnvelope> {
  const createdAt = Math.floor(Date.now() / 1000);
  const signature = await args.signTypedData({
    domain: DOMAIN,
    types: TYPES,
    primaryType: PRIMARY_TYPE,
    message: {
      vaultId: args.vaultId,
      activationTokenId: BigInt(args.activationTokenId),
      manifestHash: args.manifestHash,
      heirWallet: args.heirWallet,
      createdAt: BigInt(createdAt),
    },
  });
  return {
    soulchain: ARTIFACT_TAG,
    vaultId: args.vaultId,
    activationTokenId: args.activationTokenId,
    manifestHash: args.manifestHash,
    heirWallet: args.heirWallet,
    createdAt,
    signature,
  };
}

/** Parse a serialised claim envelope (the contents of a dropped
 *  `claim-envelope.json`). Returns either the envelope or a typed error
 *  so the calling UI can show a precise red strip. */
export function parseClaimEnvelope(text: string): HeirClaimEnvelope | { readonly error: string } {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(text) as Record<string, unknown>;
  } catch (e) {
    return { error: `not valid JSON: ${(e as Error).message}` };
  }

  if (obj.soulchain !== undefined && obj.soulchain !== ARTIFACT_TAG) {
    return { error: `not a heir-claim envelope (soulchain="${String(obj.soulchain)}")` };
  }

  const vaultId = obj.vaultId;
  const activationTokenId = obj.activationTokenId;
  const heirWallet = obj.heirWallet;
  const createdAt = obj.createdAt;
  const signature = obj.signature;
  const manifestHash = obj.manifestHash;

  // bytes32 fields MUST be exactly 32 bytes (64 hex chars + "0x" prefix = 66
  // total). Truncated hex silently right-pads in viem's EIP-712 encoder which
  // would defeat the verify gate — reject at parse so the dropzone UI shows
  // a precise red strip instead of a downstream signature-mismatch.
  if (typeof vaultId !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(vaultId)) {
    return { error: "missing or malformed vaultId (expected 32-byte hex)" };
  }
  if (typeof activationTokenId !== "string" || activationTokenId.length === 0) {
    return { error: "missing or malformed activationTokenId" };
  }
  if (typeof heirWallet !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(heirWallet)) {
    return { error: "missing or malformed heirWallet" };
  }
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) {
    return { error: "missing or malformed createdAt" };
  }
  if (typeof signature !== "string" || !/^0x[0-9a-fA-F]+$/.test(signature)) {
    return { error: "missing or malformed signature" };
  }
  if (typeof manifestHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(manifestHash)) {
    return { error: "missing or malformed manifestHash (expected 32-byte hex)" };
  }

  return {
    soulchain: ARTIFACT_TAG,
    vaultId: vaultId as Hex,
    activationTokenId,
    heirWallet: heirWallet as Address,
    createdAt,
    signature: signature as Hex,
    manifestHash: manifestHash as Hex,
  };
}

/** Recover the signer from the envelope's EIP-712 signature + verify it
 *  equals the embedded `heirWallet`. Returns true iff the envelope is
 *  self-consistent (signer === heirWallet). DOES NOT cross-check vault
 *  ownership or SBT possession — that's the heir-restore route's job
 *  (it RPC-reads `ownerOf(activationTokenId)` and compares). */
export async function verifyClaimEnvelope(env: HeirClaimEnvelope): Promise<boolean> {
  try {
    const recovered = await recoverTypedDataAddress({
      domain: DOMAIN,
      types: TYPES,
      primaryType: PRIMARY_TYPE,
      message: {
        vaultId: env.vaultId,
        activationTokenId: BigInt(env.activationTokenId),
        manifestHash: env.manifestHash,
        heirWallet: env.heirWallet,
        createdAt: BigInt(env.createdAt),
      },
      signature: env.signature,
    });
    return recovered.toLowerCase() === env.heirWallet.toLowerCase();
  } catch {
    return false;
  }
}
