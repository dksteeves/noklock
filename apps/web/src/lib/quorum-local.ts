// @version 0.1.0 @date 2026-06-16
// B-2 (disappearance-resilient heir quorum) — Form-B-INDEPENDENT local M-of-N
// release. Shared EIP-712 domain/types so heir wallets SIGN and the restore
// pipeline VERIFIES byte-identically the same `QuorumLocalRelease` message,
// plus the on-chain Voting-holder reader the pipeline uses to confirm each
// signer is a real heir for the vault.
//
// WHY THIS EXISTS (disappearance test, finding B-2): the existing heir-quorum
// path (lib/quorum-client.ts) requires a Form-B-issued QuorumReleaseAttestation
// to decrypt — so if NoKLock / Form B vanish, an M-of-N vault can NEVER be
// restored. This local path removes that dependency entirely: M distinct heir
// wallets each sign ONE shared QuorumLocalRelease tuple, and the restore
// pipeline verifies the signatures + that each signer holds a Voting-role SBT
// for the vault. The ONLY remaining dependency is a Polygon read of the SBT's
// public `hasRoleForVault` mapping — i.e. the chain, which by design outlives
// NoKLock. No Form B, no new contract, no attestor key.
//
// Trust model: this is an ADDITIONAL gate layered on top of possessing
// threshold-many Shamir shares. Clearing it requires M genuine heir-wallet
// signatures whose addresses are on-chain Voting holders — exactly the
// cooperation the M-of-N policy is meant to require — with no central party
// able to issue or withhold a release.

import type { Address, Hex, PublicClient } from "viem";
import { keccak256, concatHex, stringToHex } from "viem";
import { sbtAbi, SBT_ROLE } from "./sbt-contract.js";

/** EIP-712 domain for the LOCAL heir-quorum release. DISTINCT name from
 *  Form B's `NoKLockQuorum` (QuorumReleaseAttestation) so a signature for one
 *  can NEVER be replayed as the other. verifyingContract is the zero address
 *  (Stage 1: no on-chain NoKLockQuorum contract; the on-chain check is the
 *  SBT `hasRoleForVault` read, done off the signed payload). */
export const QUORUM_LOCAL_DOMAIN = {
  name: "NoKLockQuorumLocal",
  version: "1",
  chainId: 137,
  verifyingContract: "0x0000000000000000000000000000000000000000" as Address,
} as const;

export const QUORUM_LOCAL_TYPES = {
  QuorumLocalRelease: [
    { name: "vaultId", type: "bytes32" },
    { name: "manifestHash", type: "bytes32" },
    { name: "M", type: "uint8" },
    { name: "N", type: "uint8" },
    { name: "expiresAt", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

/** Fixed far-future expiry for LOCAL heir-quorum releases (2100-01-01 UTC).
 *  The local path exists for the disappearance scenario — there is NO server
 *  to enforce single-use freshness, and the real gate is M genuine heir-wallet
 *  signatures whose addresses are on-chain Voting holders (layered on top of
 *  possessing threshold-many Shamir shares). A non-expiring release is
 *  therefore by design, and a FIXED constant lets every heir sign the
 *  IDENTICAL tuple with ZERO coordination — each only needs the manifest. The
 *  pipeline still rejects anything past this date, so it is not literally
 *  unbounded. */
export const LOCAL_RELEASE_FIXED_EXPIRY = 4102444800; // 2100-01-01T00:00:00Z

/** Deterministically derive the shared release nonce from (vaultId,
 *  manifestHash) so every heir computes the SAME nonce independently — no
 *  coordinator hand-off of a random nonce. Also binds each signature to THIS
 *  vault+manifest, so a heir signature can never be replayed against a
 *  different vault. */
export function deriveLocalReleaseNonce(vaultId: Hex, manifestHash: Hex): Hex {
  return keccak256(
    concatHex([vaultId, manifestHash, stringToHex("noklock-local-heir-quorum-v1")]),
  );
}

/** Serialise one heir's signature for hand-off to the coordinating heir
 *  (copy/paste or a small file). Compact JSON. */
export function serializeHeirSignature(sig: LocalHeirSignature): string {
  return JSON.stringify({ signer: sig.signer, signature: sig.signature });
}

/** Parse pasted heir-signature blob(s) — a single object OR an array. Tolerant
 *  of surrounding whitespace; throws only on non-JSON. Returns the de-duped
 *  (by signer), shape-valid signatures it could read; malformed entries are
 *  skipped rather than aborting the whole paste. */
export function parseHeirSignatures(raw: string): LocalHeirSignature[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed) as unknown;
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const out: LocalHeirSignature[] = [];
  const seen = new Set<string>();
  for (const e of arr) {
    const obj = e as { signer?: unknown; signature?: unknown };
    const signer = typeof obj?.signer === "string" ? obj.signer : null;
    const signature = typeof obj?.signature === "string" ? obj.signature : null;
    if (!signer || !signature) continue;
    if (!/^0x[0-9a-fA-F]{40}$/.test(signer)) continue;
    if (!/^0x[0-9a-fA-F]+$/.test(signature)) continue;
    const key = signer.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ signer: signer as Address, signature: signature as Hex });
  }
  return out;
}

export interface LocalReleaseParams {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly M: number;
  readonly N: number;
  /** Unix seconds. Bounds the collection window; baked into every heir's
   *  signature so a stale signature set cannot be reused after it lapses. */
  readonly expiresAt: number;
  /** 32-byte hex. One shared nonce per release attempt — every heir signs the
   *  SAME nonce so their signatures count toward one threshold. */
  readonly nonce: Hex;
}

/** Build the EIP-712 typed-data an heir wallet signs to cast a LOCAL release
 *  vote. Every heir for one release attempt signs the IDENTICAL tuple, so M
 *  distinct heir signatures over it clear the M-of-N threshold. Pass straight
 *  to `walletClient.signTypedData(buildLocalReleaseTypedData(p))`. */
export function buildLocalReleaseTypedData(p: LocalReleaseParams) {
  return {
    domain: QUORUM_LOCAL_DOMAIN,
    types: QUORUM_LOCAL_TYPES,
    primaryType: "QuorumLocalRelease" as const,
    message: {
      vaultId: p.vaultId,
      manifestHash: p.manifestHash,
      M: p.M,
      N: p.N,
      expiresAt: BigInt(p.expiresAt),
      nonce: p.nonce,
    },
  };
}

/** One heir's contribution to a local release. `signer` is advisory (the
 *  pipeline recovers the address from the signature and, if `signer` is
 *  present, requires it to agree). */
export interface LocalHeirSignature {
  readonly signer: Address;
  readonly signature: Hex;
}

/** The aggregate the restore pipeline consumes as `RestoreInput.localHeirQuorum`. */
export interface LocalHeirQuorum {
  readonly expiresAt: number;
  readonly nonce: Hex;
  readonly signatures: readonly LocalHeirSignature[];
}

/** Reader the pipeline calls per recovered signer: does `signer` hold a
 *  Voting-role SBT for `vaultId`? Injected so the pure-crypto pipeline stays
 *  free of wagmi/RPC imports. */
export type VotingHolderReader = (vaultId: Hex, signer: Address) => Promise<boolean>;

/** Build a `VotingHolderReader` over the deployed SBT's public
 *  `hasRoleForVault(vaultId, Voting, signer)` mapping (non-zero tokenId ⇒
 *  holder). Fails CLOSED (returns false) on any RPC/read error so an
 *  unreadable chain can never be mistaken for a valid holder. The caller is
 *  expected to invoke the resulting reader inside `runOnline()` (the restore
 *  flow is otherwise airgapped). */
export function makeVotingHolderReader(
  publicClient: Pick<PublicClient, "readContract">,
  sbtAddr: Address,
): VotingHolderReader {
  return async (vaultId, signer) => {
    try {
      const tokenId = (await publicClient.readContract({
        address: sbtAddr,
        abi: sbtAbi,
        functionName: "hasRoleForVault",
        args: [vaultId, SBT_ROLE.Voting, signer],
      })) as bigint;
      return BigInt(tokenId) !== 0n;
    } catch {
      return false; // fail closed
    }
  };
}
