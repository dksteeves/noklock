// @version 0.8.1 @date 2026-06-03
// 0.8.1 — Daniel 2026-06-03: MED-enrol-1 fix. `tier` is now a REQUIRED field
//          on EnrolInput (and BuildVaultArgs) — paths that gate on vault-size
//          can no longer silently fall back to the FREE-tier default when the
//          caller forgets to pass it. `runEnrolPipeline` throws at function
//          entry if `tier` is missing/non-numeric. `buildVault` likewise
//          throws if `args.tier` is missing/non-numeric. The previous
//          fallback (`?? 0`) masked caller bugs by quietly applying the 5 MB
//          Free cap to what might be a 25 MB Paid-tier vault — or, worse,
//          quietly allowing a Free user past the cap if the calling site
//          forgot to pass the gate-resolved tier. Required-field-on-input is
//          the contract. The JSDoc on the interface and the helper documents
//          this explicitly so future call sites can't miss it.
// 0.8.0 — Daniel 2026-06-02: Per-tier vault-size cap enforcement (§12.7).
//          NEW exported `VAULT_SIZE_CAP_FREE_BYTES` (5 MB) +
//          `VAULT_SIZE_CAP_PAID_BYTES` (25 MB) constants, `vaultSizeCapBytes(tier)`
//          helper that returns the cap for a given tier id (0 = Free → 5 MB;
//          1..6 paid → 25 MB), `vaultSizeCapMessage()` for a consistent
//          user-facing error string, and `enforceVaultSizeCap(byteLength, tier)`
//          throw-guard. The guard is now called inside `buildVault` against
//          the entropy input (defense-in-depth — seed entropy is tiny so it
//          will never actually trip for the seed flow, but the same helper is
//          imported by Enrol.tsx + doc-pipeline.ts to gate document/image
//          uploads at the file-pick point and at the pipeline boundary).
//          Seed + letter flows are inherently small and not affected; this
//          only matters for the document/image kinds.
// 0.7.0 — Daniel 2026-06-01: G5-A per-share provenance HMAC [noklock-deferred-backlog-execution-plan §G5-A].
//          When `cryptoBaseline === "v3"`, the pipeline now derives a per-share
//          provenance sub-key from the existing v3 PRK and computes a 16-byte
//          HMAC-SHA256 truncated tag bound to (vaultId, shareIndex, ciphertext).
//          The tag is attached to BOTH (a) the on-disk share bundle JSON
//          (as `"prov"`) AND (b) the manifest's share descriptor (as
//          `provenanceB64`) so restore knows the expected value without
//          having to read the share files first. v1/v2 enrolments unchanged
//          (no provenance field emitted → canonicalJson byte-identical →
//          legacy manifestHash preserved → on-chain NoK bindings intact).
//          Builds on the existing v3 baseline rather than introducing a new
//          one, since filename-mask + provenance ship together as a single
//          Premium opt-in.
// 0.6.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.8 [mofn-restore-quorum-fix-plan §D.6/D.8].
//          NEW optional input field `cryptoQuorum?: QuorumPolicy`. When
//          present, the pipeline writes it into the signed manifest as the
//          `quorumPolicy` field (heir-cooperation M-of-N gate, distinct
//          from SLIP-39 T-of-N). Absent on Free-tier enrolments → manifest
//          omits the field entirely → canonicalJson + manifestHash are
//          byte-identical to today (grandfather path). v3 cryptoBaseline
//          plumbing from 0.5.0 untouched.
// 0.5.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//          NEW cryptoBaseline "v3" — when set, each share gets a 20-char
//          base32 filename mask derived from HMAC-SHA256(prk, "filename-
//          mask:" || vaultId || u32be(idx)) truncated to 12 bytes. The
//          mask is BOTH the suggested download filename AND recorded in
//          the manifest's share descriptor (`maskedFilename`) so restore
//          can look the share up. v1/v2 paths are byte-identical to
//          today — the mask is ONLY set when args.baseline === "v3", so
//          legacy vault canonical-JSON + manifestHash stay unchanged.
// 0.4.0 — Daniel 2026-05-31: "go big now" on the memory-wipe question.
//          Every intermediate Uint8Array the pipeline derives from the seed
//          (entropy, prk, per-share keys, shamir share plaintexts, signSeed)
//          is now SYNCHRONOUSLY zeroed via wipeBytes() (Uint8Array.fill(0))
//          the moment it's no longer needed. Master is still RETURNED to
//          the caller (it's needed for the optional WebAuthn passkey
//          sidecar) — caller's responsibility to wipe it when done.
//          Caveat (documented on /prove-it/source): the input MNEMONIC is
//          a JS string passed from the UI; strings cannot be synchronously
//          wiped in browser JS (the spec gives no in-place mutate API).
//          The caller (Enrol.tsx) clears its React state to ""
//          immediately after the pipeline returns, which makes the old
//          string unreferenced and GC-eligible. Same model as every
//          browser-based vault — the airgap firewall is what stops the
//          residual heap from leaving the page during the window.
// 0.3.0 — @date 2026-05-27
// 0.3.0 — Tier 1A + 1C: v2 cryptographic baseline is now the default for
//         NEW vaults. Argon2id(passkey, salt) → master → HKDF-Extract → PRK,
//         then HKDF-Expand for per-share AEAD keys + Ed25519 signing seed.
//         Each share AEAD is bound to (vaultId, shareIndex, cipher) via the
//         AAD, defeating cross-vault share-replay. v1 manifests are still
//         readable by the restore pipeline; this only affects what NEW
//         vaults emit. Setting `cryptoBaseline: "v1"` on the EnrolInput
//         opts out (only used by tests).
// 0.2.1 — Expose the derived `master` on EnrolOutput so the UI can OPTIONALLY
//         wrap an encrypted copy for the WebAuthn passkey sidecar (see
//         lib/webauthn.ts). The pipeline itself is unchanged — master was
//         always computed here; it's just no longer discarded.
//
// Shared enrolment pipeline used by Enrol.tsx and TestProve.tsx. Runs the
// crypto-core stack on a BIP39 mnemonic + a user passkey and produces:
//   1. an array of `EncryptedShareBundle` ready to upload to storage
//   2. a signed `VaultManifest`
//
// This file is the single source of truth for "how a SoulChain vault is built"
// at the call-site level. The crypto-core package is the source of truth for
// the primitives themselves.
//
// 0.2.0 — added optional duress-vault generation. If a `duress` input is
//         supplied, a SECOND parallel pipeline runs against the duress
//         mnemonic + duress passkey, producing decoy shares + manifest.
//         The two vaults are completely independent (different vaultIds,
//         different masters, different shares). They share filename
//         conventions only enough that an attacker can't tell the duress
//         vault apart from the real one on storage inspection.

import { kdf, slip39, aead, manifest, bip39 } from "@soulchain/crypto-core";
import type { CipherKind, ShamirSpec, VaultManifest, ShareDescriptor, CryptoBaseline, QuorumPolicy } from "@soulchain/crypto-core";

/** 0.4.0 — Synchronously zero a Uint8Array in place. This is a real wipe of
 *  the underlying memory (JS spec guarantees `.fill(0)` writes all elements).
 *  Use the moment a derived key / share / entropy buffer is no longer needed.
 *  Cannot wipe JS strings — no such API exists; strings rely on GC. */
export function wipeBytes(b: Uint8Array | null | undefined): void {
  if (b && b.fill) b.fill(0);
}

// ---------------------------------------------------------------------------
// 0.8.0 — Per-tier vault-size cap (Daniel §12.7).
// ---------------------------------------------------------------------------
// Free tier  → 5 MB plaintext per vault.
// Paid tiers → 25 MB plaintext per vault (Standard annual / Standard lifetime /
//              Premium annual / Premium lifetime — across self-custody + managed).
// Seed + letter kinds are inherently small and won't trip this; document and
// image kinds get gated at the file-pick UI AND at the pipeline boundary
// (defense-in-depth — UI can be bypassed by a malicious client; pipeline
// throw guarantees the invariant).
export const VAULT_SIZE_CAP_FREE_BYTES = 5 * 1024 * 1024;
export const VAULT_SIZE_CAP_PAID_BYTES = 25 * 1024 * 1024;

/** Returns the plaintext-byte cap for the given tier id. Tier 0 = Free → 5 MB;
 *  anything else (1..6 paid) → 25 MB. Unknown/negative tiers fall back to the
 *  conservative Free cap. */
export function vaultSizeCapBytes(tier: number): number {
  if (tier <= 0) return VAULT_SIZE_CAP_FREE_BYTES;
  return VAULT_SIZE_CAP_PAID_BYTES;
}

/** Canonical user-facing message when the cap is tripped. Same string in the
 *  UI error toast and the pipeline throw so the user sees a consistent
 *  explanation + upgrade path. */
export function vaultSizeCapMessage(): string {
  return "Vault size cap: 5 MB on Free tier. Upgrade to Standard ($99/yr) for 25 MB. [Upgrade]";
}

/** Defense-in-depth throw guard. Call at the file-pick UI AND at the
 *  pipeline boundary. Throws Error(vaultSizeCapMessage()) when byteLength
 *  exceeds the tier cap. */
export function enforceVaultSizeCap(byteLength: number, tier: number): void {
  const cap = vaultSizeCapBytes(tier);
  if (byteLength > cap) throw new Error(vaultSizeCapMessage());
}

export interface EnrolInput {
  readonly mnemonic: string;             // 12 or 24 BIP39 words (validated)
  readonly passkey: string;              // user-supplied master passphrase (NOT the seed)
  readonly shamir: ShamirSpec;           // e.g. { threshold: 3, total: 5 }
  readonly vaultLabel?: string;          // optional human label, stored in manifest
  /** Cryptographic baseline. Defaults to "v2" — HKDF-derived per-share keys
   *  + manifest-bound AAD + HKDF-derived Ed25519 sign seed. Pass "v3" to
   *  additionally enable randomised filename masks (Premium-tier opt-in;
   *  hides share index from on-disk filenames). Pass "v1" to opt into the
   *  legacy raw-master-as-everything path (tests only). */
  readonly cryptoBaseline?: CryptoBaseline;
  /** Optional M-of-N heir-cooperation quorum policy. When present, the
   *  signed manifest carries `quorumPolicy` and the heir-restore path
   *  enforces the gate. Absent on Free-tier enrolments → manifest is
   *  byte-identical to today (grandfather). Set per the per-tier caps:
   *  Standard M∈[1,2] N∈[1,3]; Premium M∈[1,5] N∈[1,9]. */
  readonly cryptoQuorum?: QuorumPolicy;
  /** 0.8.1 — Caller's effective tier id (post-lapse). REQUIRED (non-optional)
   *  because the pipeline enforces the per-tier vault-size cap (§12.7) and
   *  a silent default would either (a) over-restrict a paid user to the 5 MB
   *  Free cap or (b) under-restrict a Free user past the cap if the wrong
   *  default were chosen. Callers MUST resolve the effective tier from the
   *  Casual-or-better gate BEFORE invoking this pipeline. The pipeline
   *  throws at function entry if this field is missing or non-numeric. Use
   *  0 for Free, 1..6 for the paid tiers. Seed flows are trivially small
   *  (entropy is 16/32 bytes) so this never trips on the seed path; the
   *  cap matters for document/image kinds. */
  readonly tier: number;
}

export interface EncryptedShareBundle {
  readonly index: number;
  readonly cipher: CipherKind;
  readonly iv: Uint8Array;
  readonly cipherText: Uint8Array;
  readonly tag: Uint8Array | undefined;
  readonly plainLen: number;
  /** Suggested filename for downloads / cloud writes (8-char SHA-256 prefix of share id). */
  readonly filename: string;
  /** 0.7.0 — v3 only: 16-byte per-share provenance HMAC (binds vaultId,
   *  shareIndex, ciphertext under the v3 HKDF-derived provenance sub-key).
   *  When present, `shareBundleToJson` emits it as the `"prov"` field; the
   *  manifest's matching share descriptor also carries it as
   *  `provenanceB64`. Absent on v1/v2 shares — the on-disk share JSON
   *  omits the field, preserving byte-identical legacy share files. */
  readonly provenance?: Uint8Array;
}

export interface EnrolOutput {
  readonly vaultId: string;
  readonly manifest: VaultManifest;
  readonly shares: readonly EncryptedShareBundle[];
  /** The Argon2id master for THIS vault. Stays in the browser; used only
   *  if the user opts into a passkey, to wrap an encrypted sidecar copy.
   *  Never transmitted, never persisted by the pipeline. */
  readonly master: Uint8Array;
  /** If a duress input was supplied, the decoy vault — same shape. */
  readonly duress?: {
    readonly vaultId: string;
    readonly manifest: VaultManifest;
    readonly shares: readonly EncryptedShareBundle[];
  };
}

export interface DuressInput {
  readonly mnemonic: string;
  readonly passkey: string;
}

export async function runEnrolPipeline(input: EnrolInput, duress?: DuressInput): Promise<EnrolOutput> {
  // 0.8.1 — MED-enrol-1: tier MUST be supplied by the caller. Throwing here
  // (rather than silently falling back to 0/Free) prevents the silent-cap
  // mismatch described in the EnrolInput.tier JSDoc. The runtime check
  // backs up the compile-time non-optional field for JS callers / tests.
  if (typeof input.tier !== "number" || !Number.isFinite(input.tier)) {
    throw new Error("EnrolInput.tier is required (number 0..6) — pass the gate-resolved tier");
  }
  if (!bip39.isValidBip39(input.mnemonic)) {
    throw new Error("Mnemonic failed BIP39 checksum");
  }
  if (input.passkey.length < 8) {
    throw new Error("Passkey must be at least 8 characters");
  }
  const { threshold, total } = input.shamir;
  if (threshold < 2 || total < threshold || total > 9) {
    throw new Error(`Invalid Shamir spec ${threshold}-of-${total}`);
  }

  const entropy = bip39.entropyOf(input.mnemonic);
  const baseline: CryptoBaseline = input.cryptoBaseline ?? "v2";
  let built: BuiltVault;
  try {
    built = await buildVault({
      entropy,
      passkey: input.passkey,
      shamir: input.shamir,
      vaultLabel: input.vaultLabel ?? "",
      baseline,
      tier: input.tier,
      ...(input.cryptoQuorum ? { quorum: input.cryptoQuorum } : {}),
    });
  } finally {
    // 0.4.0 — entropy bytes no longer needed beyond this point. Wipe even
    // on throw so a mid-pipeline failure doesn't leave seed-derived
    // entropy lingering in the local heap.
    wipeBytes(entropy);
  }

  // Duress vault — independent crypto pipeline against the decoy mnemonic
  // + decoy passkey. Same shape on disk so an attacker can't tell which
  // manifest is which without trying both passkeys.
  let duressOut: EnrolOutput["duress"];
  if (duress) {
    if (!bip39.isValidBip39(duress.mnemonic)) {
      throw new Error("Duress mnemonic failed BIP39 checksum");
    }
    if (duress.passkey.length < 8) {
      throw new Error("Duress passkey must be at least 8 characters");
    }
    if (duress.passkey === input.passkey) {
      throw new Error("Duress passkey must be different from the real passkey");
    }
    const duressEntropy = bip39.entropyOf(duress.mnemonic);
    let decoy: BuiltVault;
    try {
      decoy = await buildVault({
        entropy: duressEntropy,
        passkey: duress.passkey,
        shamir: input.shamir,
        vaultLabel: "duress",
        baseline,
        tier: input.tier,
        ...(input.cryptoQuorum ? { quorum: input.cryptoQuorum } : {}),
      });
    } finally {
      wipeBytes(duressEntropy);
    }
    duressOut = { vaultId: decoy.vaultId, manifest: decoy.manifest, shares: decoy.shares };
  }

  return duressOut
    ? { vaultId: built.vaultId, manifest: built.manifest, shares: built.shares, master: built.master, duress: duressOut }
    : { vaultId: built.vaultId, manifest: built.manifest, shares: built.shares, master: built.master };
}

interface BuildVaultArgs {
  readonly entropy: Uint8Array;
  readonly passkey: string;
  readonly shamir: ShamirSpec;
  readonly vaultLabel: string;
  readonly baseline: CryptoBaseline;
  readonly quorum?: QuorumPolicy;
  /** 0.8.1 — Tier id used to enforce the per-tier vault-size cap (§12.7).
   *  REQUIRED. `buildVault` throws if missing/non-numeric — no silent
   *  Free-tier fallback (see MED-enrol-1 / EnrolInput.tier JSDoc). */
  readonly tier: number;
}

interface BuiltVault {
  readonly vaultId: string;
  readonly manifest: VaultManifest;
  readonly shares: readonly EncryptedShareBundle[];
  readonly master: Uint8Array;
}

async function buildVault(args: BuildVaultArgs): Promise<BuiltVault> {
  // 0.8.1 — MED-enrol-1: tier is contractually required at this boundary.
  // The runtime check guards JS callers / tests that may have bypassed the
  // TypeScript non-optional field. NO silent fallback to Free — see the
  // EnrolInput.tier and BuildVaultArgs.tier JSDoc for the rationale.
  if (typeof args.tier !== "number" || !Number.isFinite(args.tier)) {
    throw new Error("buildVault: args.tier is required (number 0..6) — refusing to apply silent Free-tier default");
  }
  // 0.8.0 — Per-tier vault-size cap (§12.7) defense-in-depth check. The
  // file-pick UI also enforces this, but a malicious / tampered client
  // could bypass the UI; throwing here guarantees the invariant at the
  // pipeline boundary. For the seed-pipeline path, entropy is 16/32 bytes
  // and will never trip; the same helper is called by Enrol.tsx for the
  // document/image kinds where it matters.
  enforceVaultSizeCap(args.entropy.byteLength, args.tier);

  // Derive master from passkey + fresh salt.
  const salt = kdf.generateSalt();
  const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
  const master = await kdf.deriveMaster(args.passkey, kdfParams);

  // v2 + v3: derive a PRK from master + salt and use it for all subkeys.
  // v1: master IS everything. v3 inherits the entire v2 derivation chain
  // and additionally derives a per-share filename mask from the same PRK.
  const useHkdf = args.baseline === "v2" || args.baseline === "v3";
  const prk = useHkdf ? kdf.hkdfExtract(salt, master) : null;

  // Split.
  const shamirShares = slip39.split(args.entropy, args.shamir.threshold, args.shamir.total);

  // Vault id is computed from master + label (deterministic per master).
  const vaultId = await makeVaultId(master, args.vaultLabel);

  // Encrypt + assemble per-share descriptors. v2 derives a per-share key via
  // HKDF and binds AEAD AAD to (vaultId, shareIndex, cipher); v1 uses the
  // raw master as the key with no AAD. v3 ALSO computes a per-share
  // provenance HMAC tag (16 bytes) bound to (vaultId, shareIndex,
  // ciphertext) so restore can reject forged share files before AEAD.
  const bundles: EncryptedShareBundle[] = [];
  const descriptors: ShareDescriptor[] = [];
  for (const sh of shamirShares) {
    const selectorSource = prk ?? master;
    const cipher = aead.pickCipher(selectorSource, sh.index);
    const key = prk ? aead.deriveShareKeyV2(prk, sh.index) : master;
    const aad = prk ? aead.buildShareAADv2(vaultId, sh.index, cipher) : undefined;
    const r = await aead.encrypt({ kind: cipher, key, plaintext: sh.bytes, ...(aad ? { aad } : {}) });

    // v3: filename = `{20-char-base32-mask}.json`, index hidden from disk.
    // v1/v2: legacy `share-{idx}-{8-hex}.json` (deterministic, index visible).
    // The mask is recorded in the manifest's share descriptor on v3 only,
    // so v1/v2 canonicalJson is byte-identical to pre-v3 behaviour.
    let filename: string;
    let maskedFilename: string | undefined;
    if (args.baseline === "v3" && prk) {
      maskedFilename = kdf.deriveFilenameMaskV3(prk, vaultId, sh.index);
      filename = `${maskedFilename}.json`;
    } else {
      filename = await makeShareFilename(master, sh.index);
    }

    // 0.7.0 — v3 per-share provenance HMAC (G5-A). Derive a dedicated
    // sub-key from the same PRK (HKDF info is domain-separated from the
    // share AEAD key), then sign (vaultId, shareIndex, ciphertext) into a
    // 16-byte truncated HMAC-SHA256 tag. Tag is attached to BOTH the
    // bundle (→ on-disk share JSON via `"prov"`) AND the descriptor
    // (→ manifest's `provenanceB64`) so restore knows the expected value
    // without first reading the share file.
    let provenance: Uint8Array | undefined;
    let provenanceB64: string | undefined;
    let provKey: Uint8Array | undefined;
    if (args.baseline === "v3" && prk) {
      provKey = aead.deriveShareProvenanceKeyV3(prk, sh.index);
      provenance = aead.signShareProvenanceV3(provKey, vaultId, sh.index, r.cipherText);
      provenanceB64 = kdf.b64Encode(provenance);
    }

    bundles.push({
      index: sh.index,
      cipher,
      iv: r.iv,
      cipherText: r.cipherText,
      tag: r.tag,
      plainLen: sh.bytes.byteLength,
      filename,
      ...(provenance ? { provenance } : {}),
    });
    descriptors.push({
      index: sh.index,
      cipher,
      ivB64: kdf.b64Encode(r.iv),
      cipherTextB64: kdf.b64Encode(r.cipherText),
      ...(r.tag ? { tagB64: kdf.b64Encode(r.tag) } : {}),
      compressedLen: r.cipherText.byteLength,
      originalLen: sh.bytes.byteLength,
      ...(maskedFilename ? { maskedFilename } : {}),
      ...(provenanceB64 ? { provenanceB64 } : {}),
    });
    // 0.4.0 — Wipe per-share derived key (v2) + share plaintext bytes. The
    // share PLAINTEXT (sh.bytes) is the Shamir share material — keep it
    // around and an attacker who can read the heap can reconstruct the
    // master with K shares. Wipe ciphertext stays in `bundles` and is fine.
    if (prk) wipeBytes(key);  // v1 reuses `master` so don't wipe; caller owns that
    // 0.7.0 — Wipe the v3 provenance sub-key once the tag is computed.
    // The tag itself stays in `bundles`/`descriptors` (it's just a MAC).
    if (provKey) wipeBytes(provKey);
    wipeBytes(sh.bytes);
  }

  // Sign with the appropriate Ed25519 seed. v2 derives a dedicated sign seed
  // via HKDF from the PRK; v1 uses the master directly as the Ed25519 seed.
  const signSeed = prk ? (await manifest.keypairFromPRKv2(prk)).priv : master;
  const signed = await manifest.signManifest({
    version: 1,
    vaultId,
    createdAt: Math.floor(Date.now() / 1000),
    shamir: args.shamir,
    // 0.6.0 — quorumPolicy placed AFTER the shamir block in source for
    // canonical-JSON READABILITY. Key order does NOT affect the manifest
    // hash (canonicalJson sorts keys), but keeping it next to the related
    // share-threshold spec keeps the manifest readable on disk.
    ...(args.quorum ? { quorumPolicy: args.quorum } : {}),
    kdf: kdfParams,
    shares: descriptors,
    ...(args.baseline === "v2" ? { cryptoBaseline: "v2" as const } : {}),
    ...(args.baseline === "v3" ? { cryptoBaseline: "v3" as const } : {}),
  }, signSeed);

  // 0.4.0 — Wipe HKDF PRK + Ed25519 sign seed (v2 only; v1 sign seed === master
  // which is returned to the caller, so leave that one). Manifest is signed;
  // these derived secrets are no longer needed.
  if (prk) {
    wipeBytes(prk);
    wipeBytes(signSeed);
  }

  return { vaultId, manifest: signed, shares: bundles, master };
}

async function makeShareFilename(master: Uint8Array, shareIndex: number): Promise<string> {
  // SHA-256(master || ":share:" || index) → first 8 hex chars.
  const buf = new Uint8Array(master.byteLength + 16);
  buf.set(master, 0);
  buf.set(new TextEncoder().encode(`:share:${shareIndex}`), master.byteLength);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  const hex = Array.from(digest).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `share-${shareIndex}-${hex.slice(0, 8)}.json`;
}

async function makeVaultId(master: Uint8Array, label: string): Promise<string> {
  const buf = new Uint8Array(master.byteLength + label.length + 8);
  buf.set(master, 0);
  buf.set(new TextEncoder().encode(":vault:" + label), master.byteLength);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  return Array.from(digest.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Serialise an EncryptedShareBundle to the canonical JSON we write to storage. */
export function shareBundleToJson(b: EncryptedShareBundle, vaultId: string): Uint8Array {
  const obj = {
    soulchain: "share/v1",
    vaultId,
    index: b.index,
    cipher: b.cipher,
    iv: kdf.b64Encode(b.iv),
    ct: kdf.b64Encode(b.cipherText),
    ...(b.tag ? { tag: kdf.b64Encode(b.tag) } : {}),
    plainLen: b.plainLen,
    // 0.7.0 — v3 only: per-share provenance HMAC (16 bytes, base64). When
    // absent the field is omitted entirely so v1/v2 share files remain
    // byte-identical to pre-v3 emissions.
    ...(b.provenance ? { prov: kdf.b64Encode(b.provenance) } : {}),
  };
  return new TextEncoder().encode(JSON.stringify(obj, null, 2));
}

export function manifestToJson(m: VaultManifest): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(m, null, 2));
}
