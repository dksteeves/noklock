// @version 0.3.0 @date 2026-06-01
// 0.3.0 — Daniel 2026-06-01: phishing-replay close-out (Workflow A.2 re-review).
//         + `getOwnerChallengeNonce(vaultId)` — pulls a server-issued, 5-minute,
//           one-shot challenge nonce from POST /v1/nok/quorum/owner-challenge-nonce
//           BEFORE the wallet signs. The PWA then includes that nonce + the
//           server-authoritative expiresAt in the EIP-712 typed-data so a phished
//           signature cannot be replayed.
//         * `getOwnerSelfRestoreAttestation` signature gains `challengeNonce`
//           (required) — forwarded to Form B which re-validates the row, marks
//           it consumed, then issues the attestation as before.
// 0.2.0 — Daniel 2026-06-01: + `getOwnerSelfRestoreAttestation` — the Form B
//         endpoint that converts an EIP-712 OwnerSelfRestoreChallenge wallet
//         signature into a server-issued `OwnerSelfRestoreAttestation`.
//         Closes the /restore-route heir bypass identified in Workflow A.1:
//         previously the owner-mode path was gated by a forgeable boolean
//         (`ownerAck`); now it requires the caller's connected wallet to
//         sign a typed-data challenge AND that wallet to match the
//         vault's on-record owner (Form B does the lookup). The PWA hands
//         Form B { vaultId, manifestHash, ownerWallet, ownerSig } and on
//         success receives back the attestation shape `restore-pipeline.ts`
//         consumes as `ownerSelfRestoreProof` in `RestoreInput`. On 401
//         "not-recorded-owner" the UI surfaces that to the user and
//         redirects to /heir/restore.
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step 4 [mofn-restore-quorum-fix-plan §D.1].
//         Thin Form B REST client for the heir-quorum endpoints. Mirrors
//         the shape of existing Form B clients (`lib/api.ts`,
//         `useEmailNokMint.ts`). The three endpoints are documented in
//         plan §E.1; this module is the PWA side of that contract.
//
//         Endpoints:
//           POST /v1/nok/quorum/vote                          → castVote
//           GET  /v1/nok/quorum/status                        → getStatus
//           POST /v1/nok/quorum/release-attestation           → getReleaseAttestation
//           POST /v1/nok/quorum/owner-self-restore-attestation → getOwnerSelfRestoreAttestation (0.2.0)
//
//         All requests use fetch() with `credentials: "omit"` (Form B is
//         keyed by EIP-712 signatures, not cookies). Errors are returned
//         as a typed `{ ok: false, status, message }` so the calling UI
//         can render a useful red strip without try/catch noise. No
//         console.log anywhere — failures bubble through the typed
//         result.

import type { Hex, Address } from "viem";

/** Form B base URL. Same env var the rest of the heir-quorum surface
 *  reads (plan §D.1). Falls back to api.noklock.app (the production
 *  Form B host, matching `useEmailNokMint.ts`'s pattern) so a
 *  dev-server miss doesn't blow up the build. */
const BASE: string = (
  (import.meta.env.VITE_FORM_B_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.noklock.app"
).replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// castVote — POST /v1/nok/quorum/vote
// ---------------------------------------------------------------------------

export interface CastVoteArgs {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly releaseEpoch: number;
  // C-11 (pressure-test 2026-06-10): the server binds M+N into the signed
  // QuorumRelease message and recovers over them — the vote body must carry
  // them or recovery yields the wrong address (401) and M-of-N never works.
  readonly M: number;
  readonly N: number;
  readonly voter: Address;
  readonly signature: Hex;
}

export type CastVoteResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly status: number; readonly message: string };

/** Submit a signed EIP-712 `QuorumRelease` vote from a heir wallet.
 *  Form B verifies the signature recovers to `voter` AND that the voter
 *  owns the activation SBT for this vault (RPC `ownerOf`). */
export async function castVote(args: CastVoteArgs): Promise<CastVoteResult> {
  try {
    const r = await fetch(`${BASE}/v1/nok/quorum/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({
        vaultId: args.vaultId,
        manifestHash: args.manifestHash,
        releaseEpoch: args.releaseEpoch,
        M: args.M,
        N: args.N,
        voter: args.voter,
        signature: args.signature,
      }),
    });
    if (!r.ok) {
      const text = await safeText(r);
      return { ok: false, status: r.status, message: text || `vote rejected (${r.status})` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, status: 0, message: (e as Error).message ?? "network error" };
  }
}

// ---------------------------------------------------------------------------
// getStatus — GET /v1/nok/quorum/status?vaultId&manifestHash&M&N
// ---------------------------------------------------------------------------

export interface GetStatusArgs {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly M: number;
  readonly N: number;
}

export interface QuorumStatus {
  readonly votesSeen: number;
  readonly votesNeeded: number;
  readonly voters: readonly Address[];
  readonly quorumMet: boolean;
  readonly oracleHasFired: boolean;
}

/** Poll Form B for the current vote count + voters + on-chain liveness
 *  (oracleHasFired = `activeActivationCount[vaultId] > 0`). Used by the
 *  `QuorumStatus` component on the heir-restore flow. */
export async function getStatus(args: GetStatusArgs): Promise<QuorumStatus> {
  const qs = new URLSearchParams({
    vaultId: args.vaultId,
    manifestHash: args.manifestHash,
    M: String(args.M),
    N: String(args.N),
  });
  const r = await fetch(`${BASE}/v1/nok/quorum/status?${qs.toString()}`, {
    method: "GET",
    credentials: "omit",
  });
  if (!r.ok) {
    const text = await safeText(r);
    throw new Error(text || `quorum status fetch failed (${r.status})`);
  }
  const body = (await r.json()) as Partial<QuorumStatus>;
  return {
    votesSeen: typeof body.votesSeen === "number" ? body.votesSeen : 0,
    votesNeeded: typeof body.votesNeeded === "number" ? body.votesNeeded : args.M,
    voters: Array.isArray(body.voters) ? (body.voters as Address[]) : [],
    quorumMet: body.quorumMet === true,
    oracleHasFired: body.oracleHasFired === true,
  };
}

// ---------------------------------------------------------------------------
// getReleaseAttestation — POST /v1/nok/quorum/release-attestation
// ---------------------------------------------------------------------------

export interface GetReleaseAttestationArgs {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly M: number;
  readonly N: number;
}

export interface ReleaseAttestation {
  readonly signature: Hex;
  readonly signer: Address;
  readonly expiresAt: number;
  readonly nonce: Hex;
}

/** Fetch the EIP-712 `QuorumReleaseAttestation` once quorum is met.
 *  Returns null if Form B reports votes < M (the response status will be
 *  409 in that case). Any other failure throws. */
export async function getReleaseAttestation(
  args: GetReleaseAttestationArgs,
): Promise<ReleaseAttestation | null> {
  const r = await fetch(`${BASE}/v1/nok/quorum/release-attestation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({
      // H-37 (pressure-test 2026-06-10): the server REQUIRES releaseEpoch (else
      // 400). It is the fixed per-(vault,manifest) bucket every heir shares —
      // see HeirRestore.castMyVote. 0 matches what the votes were signed under.
      vaultId: args.vaultId,
      manifestHash: args.manifestHash,
      releaseEpoch: 0,
      M: args.M,
      N: args.N,
    }),
  });
  if (r.status === 409) return null; // votes < M (server contract)
  if (!r.ok) {
    const text = await safeText(r);
    throw new Error(text || `release-attestation fetch failed (${r.status})`);
  }
  // C-10 (pressure-test 2026-06-10): the server returns the attestation NESTED
  // ({ attestation: { signature, signer, expiresAt, nonce, ... } }) at
  // quorum.ts:1342-1353. Parsing it FLAT (body.signature) left every field
  // undefined and threw "malformed", bricking heir M-of-N restore. Unwrap it.
  const raw = (await r.json()) as {
    attestation?: { signature?: string; signer?: string; expiresAt?: number; nonce?: string };
  };
  const a = raw.attestation;
  if (
    !a ||
    typeof a.signature !== "string" ||
    typeof a.signer !== "string" ||
    typeof a.expiresAt !== "number" ||
    typeof a.nonce !== "string"
  ) {
    throw new Error("malformed release-attestation response");
  }
  return {
    signature: a.signature as Hex,
    signer: a.signer as Address,
    expiresAt: a.expiresAt,
    nonce: a.nonce as Hex,
  };
}

// ---------------------------------------------------------------------------
// getOwnerSelfRestoreAttestation — POST /v1/nok/quorum/owner-self-restore-attestation
// ---------------------------------------------------------------------------

export interface GetOwnerSelfRestoreAttestationArgs {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly ownerWallet: Address;
  /** EIP-712 signature over OwnerSelfRestoreChallenge(vaultId, manifestHash,
   *  ownerWallet, challengeNonce, challengeExpiresAt) produced by the
   *  connected wallet. Form B recovers the signer from this signature and
   *  refuses to issue an attestation unless the recovered address equals the
   *  on-record owner for `vaultId` AND the challenge nonce is still valid
   *  (known, not yet consumed, not expired). 0.3.0 — the typed-data was
   *  expanded with challengeNonce + challengeExpiresAt to close a phishing-
   *  replay defect: previously the no-nonce signature could be replayed
   *  indefinitely after a single phish. */
  readonly ownerSig: Hex;
  /** 0.3.0 — Fresh server-issued challenge nonce obtained via
   *  `getOwnerChallengeNonce` BEFORE the wallet signed. Form B re-looks-up
   *  the row, validates unconsumed + unexpired, derives the server-
   *  authoritative `challengeExpiresAt` from the persisted row (the client
   *  doesn't get to forge expiry into the signature), then marks the row
   *  consumed on success. */
  readonly challengeNonce: Hex;
}

// ---------------------------------------------------------------------------
// getOwnerChallengeNonce — POST /v1/nok/quorum/owner-challenge-nonce
// ---------------------------------------------------------------------------

export interface OwnerChallengeNonce {
  readonly nonce: Hex;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly vaultId: Hex;
}

export type GetOwnerChallengeNonceResult =
  | OwnerChallengeNonce
  | { readonly error: string };

/** 0.3.0 — Pull a fresh, server-issued, single-use, 5-minute challenge nonce
 *  from Form B BEFORE the wallet signs. The PWA includes both the nonce and
 *  the server-authoritative `expiresAt` in the EIP-712 typed-data so a
 *  phished signature cannot be replayed (the server side will reject the
 *  signed message as unknown / consumed / expired on the second call). */
export async function getOwnerChallengeNonce(
  vaultId: Hex,
): Promise<GetOwnerChallengeNonceResult> {
  try {
    const r = await fetch(`${BASE}/v1/nok/quorum/owner-challenge-nonce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({ vaultId }),
    });
    if (!r.ok) {
      const text = await safeText(r);
      return { error: text || `owner-challenge-nonce fetch failed (${r.status})` };
    }
    const body = (await r.json()) as Partial<OwnerChallengeNonce>;
    if (
      typeof body.nonce !== "string" ||
      typeof body.issuedAt !== "number" ||
      typeof body.expiresAt !== "number" ||
      typeof body.vaultId !== "string"
    ) {
      return { error: "malformed owner-challenge-nonce response" };
    }
    return {
      nonce: body.nonce as Hex,
      issuedAt: body.issuedAt,
      expiresAt: body.expiresAt,
      vaultId: body.vaultId as Hex,
    };
  } catch (e) {
    return { error: (e as Error).message ?? "network error" };
  }
}

/** The attestation shape Form B issues — identical to the
 *  `ownerSelfRestoreProof` field on `RestoreInput` in restore-pipeline.ts.
 *  Re-typed here (rather than imported) to keep this client module
 *  framework-flavoured + circular-import-free; the pipeline checks the
 *  full shape at runtime anyway. */
export interface OwnerSelfRestoreAttestation {
  readonly attestation: Hex;
  readonly signer: Address;
  readonly expiresAt: number;
  readonly nonce: Hex;
  readonly ownerWallet: Address;
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
}

export type GetOwnerSelfRestoreAttestationResult =
  | { readonly attestation: OwnerSelfRestoreAttestation }
  | { readonly error: string };

/** Convert a wallet-signed OwnerSelfRestoreChallenge into a Form-B-issued
 *  OwnerSelfRestoreAttestation. Returns `{ attestation }` on success or
 *  `{ error }` on any failure (HTTP error, malformed body, network).
 *  Specifically, a 401 with message "not-recorded-owner" surfaces as
 *  `error: "not-recorded-owner"` so the calling UI can show the specific
 *  "this wallet is not the recorded owner" branch + nudge toward
 *  /heir/restore. */
export async function getOwnerSelfRestoreAttestation(
  args: GetOwnerSelfRestoreAttestationArgs,
): Promise<GetOwnerSelfRestoreAttestationResult> {
  try {
    const r = await fetch(`${BASE}/v1/nok/quorum/owner-self-restore-attestation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({
        vaultId: args.vaultId,
        manifestHash: args.manifestHash,
        ownerWallet: args.ownerWallet,
        ownerSig: args.ownerSig,
        challengeNonce: args.challengeNonce,
      }),
    });
    if (r.status === 401) {
      const text = await safeText(r);
      // Pass the server's exact message through if present so the UI can
      // discriminate "not-recorded-owner" vs other 401 modes — incl. the
      // new "unknown-challenge-nonce" path added in 0.3.0.
      return { error: text || "not-recorded-owner" };
    }
    if (r.status === 409) {
      const text = await safeText(r);
      // 0.3.0 — single-use challenge nonce was already consumed (e.g. a
      // duplicate click after Form B accepted). Surface verbatim so the UI
      // can re-fetch a fresh nonce and prompt the user to try again.
      return { error: text || "nonce-already-consumed" };
    }
    if (r.status === 410) {
      const text = await safeText(r);
      // 0.3.0 — challenge nonce 5-minute window expired before the wallet
      // signed. UI re-fetches a fresh nonce on "try again".
      return { error: text || "nonce-expired" };
    }
    if (!r.ok) {
      const text = await safeText(r);
      return { error: text || `owner-self-restore attestation rejected (${r.status})` };
    }
    // C-03/C-09 (pressure-test 2026-06-10): the server returns the attestation
    // NESTED with the signature under `signature` ({ attestation: { signature,
    // signer, expiresAt, nonce, vaultId, manifestHash, ownerWallet } }) at
    // quorum.ts:1746-1756. Parsing it FLAT left every field undefined and
    // returned "malformed", so a quorum-protected owner could NEVER self-restore
    // (happy path bricked). Unwrap and map the server's `signature` → our
    // `attestation` field.
    const raw = (await r.json()) as {
      attestation?: {
        signature?: string; signer?: string; expiresAt?: number; nonce?: string;
        ownerWallet?: string; vaultId?: string; manifestHash?: string;
      };
    };
    const a = raw.attestation;
    if (
      !a ||
      typeof a.signature !== "string" ||
      typeof a.signer !== "string" ||
      typeof a.expiresAt !== "number" ||
      typeof a.nonce !== "string" ||
      typeof a.ownerWallet !== "string" ||
      typeof a.vaultId !== "string" ||
      typeof a.manifestHash !== "string"
    ) {
      return { error: "malformed owner-self-restore attestation response" };
    }
    return {
      attestation: {
        attestation: a.signature as Hex,
        signer: a.signer as Address,
        expiresAt: a.expiresAt,
        nonce: a.nonce as Hex,
        ownerWallet: a.ownerWallet as Address,
        vaultId: a.vaultId as Hex,
        manifestHash: a.manifestHash as Hex,
      },
    };
  } catch (e) {
    return { error: (e as Error).message ?? "network error" };
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return "";
  }
}
