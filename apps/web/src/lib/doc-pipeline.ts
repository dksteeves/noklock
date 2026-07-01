// @version 0.5.0 @date 2026-06-01
// 0.5.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//          Doc/letter/image pipeline now honours cryptoBaseline "v3" —
//          same v2 HKDF/AAD chain underneath PLUS per-share filename masks
//          derived from HMAC-SHA256(prk, "filename-mask:" || vaultId ||
//          u32be(idx)). v1/v2 paths byte-identical to today.
// 0.4.1 — F-6 refactor (audit finding f-6-doc-content-aad-centralise):
//         the "noklock-v2/doc-content-aad" prefix string is now imported
//         from kdf.V2_DOC_CONTENT_AAD_PREFIX (where V2_DOMAIN / V2_INFO /
//         V2_AAD_PREFIX already live). One file to bump on a v3 migration.
// 0.4.0 — Daniel 2026-06-01 (AUDIT FIX 1, highest priority): WIPE PARITY
//          with enrol-pipeline 0.4.0. Audit Phase 0→3 surfaced this as the
//          single largest user-confidence gap: marketing on /prove-it/source
//          + Info.tsx claims "every byte derived from your seed is
//          synchronously .fill(0)'d", and enrol-pipeline delivers — but
//          doc-pipeline (letter / document / image vaults) was silently
//          missing EVERY wipeBytes() call. 6 audit findings across 3
//          subsystems flagged it. Letter/doc/image vaults are sold as
//          architecturally identical to seed vaults — they now are.
//          Every Uint8Array derived from the passkey + content key
//          (contentKey itself, master, prk, per-share keys, share
//          plaintexts, signSeed) is synchronously zeroed in try/finally.
//          Master is returned to caller (for passkey-sidecar) — caller
//          wipes per Enrol.tsx pattern.
// 0.3.0 — Tier 1A + 1C: v2 cryptographic baseline (HKDF-derived per-share
// 0.3.0 — Tier 1A + 1C: v2 cryptographic baseline (HKDF-derived per-share
//         AEAD keys + manifest-bound AAD + HKDF-derived Ed25519 sign seed),
//         now the default for new letter/doc/image vaults. The docExt
//         content blob also gets a vault-bound AAD so a content blob lifted
//         from another vault can't decrypt against a forged manifest of
//         this one. Pass `cryptoBaseline: "v1"` to opt out (tests only).
// 0.2.0 — Expose `master` on DocEnrolOutput (parity with enrol-pipeline)
//         so letter/document/image flows can offer the SAME optional
//         WebAuthn passkey sidecar as the seed flow. Pipeline unchanged —
//         master was always computed; it's just no longer discarded.
//
// Doc/sealed-letter pipeline — same architectural shape as enrol-pipeline.ts
// but operates on ARBITRARY bytes (letter UTF-8, will PDF, photo zip, etc.)
// rather than 16/32-byte BIP39 entropy.
//
// Design: classic Shamir-on-key pattern.
//   1. Generate a random 32-byte content_key.
//   2. AEAD-encrypt the plaintext with content_key (single ciphertext blob).
//   3. SLIP-39 split content_key into N shares. (32 bytes is a valid SLIP-39
//      secret size.)
//   4. AEAD-encrypt each key share with a per-share key derived from the
//      passkey via Argon2id + HMAC.
//   5. Manifest signed Ed25519 — captures `kind` ('sealed-letter' | 'document'),
//      mimeType, originalFilename, originalSize, and the encrypted blob inline
//      (since most plaintexts fit comfortably in <100 KB; truly large payloads
//      can spill to an external blob URL but Phase 3 keeps it simple).
//
// The result: same security guarantees as the seed-phrase pipeline — T-of-N
// reconstruction, AEAD tamper-detection, signed manifest, jurisdictional
// share distribution — applied to anything you'd want to leave behind.

import { kdf, slip39, aead, manifest } from "@soulchain/crypto-core";
import type { CipherKind, ShamirSpec, VaultManifest, ShareDescriptor, CryptoBaseline } from "@soulchain/crypto-core";
import { wipeBytes, enforceVaultSizeCap } from "./enrol-pipeline.js";

/** Build the v2 AAD that binds a docExt content-blob's AEAD to its specific
 *  vault. Pattern matches buildShareAADv2 in aead.ts but with a different
 *  domain tag so a doc blob can't be replayed as a share or vice versa.
 *  Exported so restore-pipeline.ts can rebuild the same AAD on decrypt.
 *  0.4.1 (F-6) — prefix imported from kdf.V2_DOC_CONTENT_AAD_PREFIX. */
export function buildDocContentAADv2(vaultId: string): Uint8Array {
  const prefix = kdf.V2_DOC_CONTENT_AAD_PREFIX;
  const vBytes = kdf.vaultIdToBytes(vaultId);
  const out = new Uint8Array(prefix.length + vBytes.length);
  out.set(prefix, 0);
  out.set(vBytes, prefix.length);
  return out;
}

export type DocKind = "sealed-letter" | "document";

export interface DocEnrolInput {
  readonly kind: DocKind;
  // H-19/H-22 (pressure-test 2026-06-10): tier is REQUIRED so the doc/image
  // pipeline enforces the per-tier vault-size cap at the pipeline boundary
  // (matching the seed path + the enrol-pipeline.ts:121-123 defense-in-depth
  // claim). Without it the 5MB/25MB cap was only checked at the file-pick UI,
  // which a tampered/scripted client bypasses.
  readonly tier: number;
  readonly plaintext: Uint8Array;
  readonly passkey: string;
  readonly shamir: ShamirSpec;
  readonly mimeType?: string;
  readonly originalFilename?: string;
  readonly label?: string;
  /** Cryptographic baseline. Defaults to "v2" — HKDF-derived per-share keys
   *  + manifest-bound AAD + vault-bound doc-content AAD + HKDF-derived
   *  Ed25519 sign seed. Pass "v1" to opt into the legacy path (tests only). */
  readonly cryptoBaseline?: CryptoBaseline;
}

export interface DocShareBundle {
  readonly index: number;
  readonly cipher: CipherKind;
  readonly iv: Uint8Array;
  readonly cipherText: Uint8Array;
  readonly tag: Uint8Array | undefined;
  readonly plainLen: number;
  readonly filename: string;
}

export interface DocManifestExt {
  readonly kind: DocKind;
  readonly mimeType?: string;
  readonly originalFilename?: string;
  readonly originalSize: number;
  readonly contentCipher: CipherKind;
  readonly contentIvB64: string;
  readonly contentCipherTextB64: string;
  readonly contentTagB64?: string;
}

export interface DocEnrolOutput {
  readonly vaultId: string;
  readonly manifest: VaultManifest & { docExt: DocManifestExt };
  readonly shares: readonly DocShareBundle[];
  /** Argon2id master for THIS vault. Browser-only; used solely if the user
   *  opts into the WebAuthn passkey to wrap an encrypted sidecar copy.
   *  Never transmitted, never persisted by the pipeline. */
  readonly master: Uint8Array;
}

export async function runDocPipeline(input: DocEnrolInput): Promise<DocEnrolOutput> {
  if (input.passkey.length < 8) throw new Error("Passkey must be at least 8 characters");
  const { threshold, total } = input.shamir;
  if (threshold < 2 || total < threshold || total > 9) throw new Error(`Invalid Shamir spec ${threshold}-of-${total}`);
  if (input.plaintext.byteLength === 0) throw new Error("Empty payload");
  // H-19/H-22: enforce the per-tier vault-size cap at the pipeline boundary
  // (defense-in-depth — the file-pick UI gate can be bypassed by a tampered
  // client). Throws BEFORE any Argon2id / AEAD work runs.
  enforceVaultSizeCap(input.plaintext.byteLength, input.tier);

  const baseline: CryptoBaseline = input.cryptoBaseline ?? "v2";

  // 0.4.0 — every Uint8Array derived here registers below for the finally
  // wipe. contentKey, prk, per-share derived keys, share plaintexts, sign
  // seed are all wiped synchronously the moment they're no longer needed.
  // master is RETURNED to the caller (for the optional WebAuthn passkey
  // sidecar) — caller's responsibility per Enrol.tsx pattern.
  const contentKey = crypto.getRandomValues(new Uint8Array(32));
  const salt = kdf.generateSalt();
  const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
  const master = await kdf.deriveMaster(input.passkey, kdfParams);
  let prk: Uint8Array | null = null;
  const derivedKeys: Uint8Array[] = [];   // per-share keys (v2)
  let signSeed: Uint8Array | null = null;

  try {
    // v2 + v3: HKDF-Extract once; subkeys + AAD per artefact (+ filename
    // mask on v3). v1: master IS everything.
    const useHkdf = baseline === "v2" || baseline === "v3";
    prk = useHkdf ? kdf.hkdfExtract(salt, master) : null;

    // Determine vaultId early so the AAD bindings can reference it.
    const vaultId = await makeVaultId(master, input.label ?? input.kind);

    // AEAD-encrypt the plaintext with the content key.
    const contentCipher: CipherKind = aead.pickCipher(contentKey, 0);
    const contentAAD = prk ? buildDocContentAADv2(vaultId) : undefined;
    const contentEnc = await aead.encrypt({
      kind: contentCipher,
      key: contentKey,
      plaintext: input.plaintext,
      ...(contentAAD ? { aad: contentAAD } : {}),
    });

    // Shamir-split the content key. (contentKey wiped by finally.)
    const shamirShares = slip39.split(contentKey, threshold, total);

    // AEAD-encrypt each share. v2: per-share HKDF key + vault-bound share AAD.
    const bundles: DocShareBundle[] = [];
    const descriptors: ShareDescriptor[] = [];

    for (const sh of shamirShares) {
      const selectorSource = prk ?? master;
      const cipher = aead.pickCipher(selectorSource, sh.index);
      const key = prk ? aead.deriveShareKeyV2(prk, sh.index) : master;
      if (prk) derivedKeys.push(key); // v2 per-share key is ours to wipe; v1 reuses master (caller-owned)
      const shareAAD = prk ? aead.buildShareAADv2(vaultId, sh.index, cipher) : undefined;
      const r = await aead.encrypt({
        kind: cipher,
        key,
        plaintext: sh.bytes,
        ...(shareAAD ? { aad: shareAAD } : {}),
      });
      // v3: filename = `{20-char-base32-mask}.json`; index hidden from disk.
      // v1/v2: legacy `dshare-{idx}-{8-hex}.json` (deterministic, visible).
      let filename: string;
      let maskedFilename: string | undefined;
      if (baseline === "v3" && prk) {
        maskedFilename = kdf.deriveFilenameMaskV3(prk, vaultId, sh.index);
        filename = `${maskedFilename}.json`;
      } else {
        filename = await makeShareFilename(master, sh.index);
      }
      bundles.push({
        index: sh.index,
        cipher,
        iv: r.iv,
        cipherText: r.cipherText,
        tag: r.tag,
        plainLen: sh.bytes.byteLength,
        filename,
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
      });
      // 0.4.0 — wipe per-share plaintext immediately after encrypt; the
      // ciphertext lives on in `bundles`, the share plaintext does not.
      wipeBytes(sh.bytes);
    }

    const docExt: DocManifestExt = {
      kind: input.kind,
      ...(input.mimeType ? { mimeType: input.mimeType } : {}),
      ...(input.originalFilename ? { originalFilename: input.originalFilename } : {}),
      originalSize: input.plaintext.byteLength,
      contentCipher,
      contentIvB64: kdf.b64Encode(contentEnc.iv),
      contentCipherTextB64: kdf.b64Encode(contentEnc.cipherText),
      ...(contentEnc.tag ? { contentTagB64: kdf.b64Encode(contentEnc.tag) } : {}),
    };

    // FIX (2026-06-10, pressure-test discovery): docExt MUST be part of the
    // signed payload. The prior code signed `baseManifest` (no docExt) then
    // attached docExt AFTER signing (`{ ...signed, docExt }`). But
    // restore-pipeline's verifyManifest() canonical-JSONs the WHOLE manifest
    // (docExt included) minus the two signature fields — so verification ran
    // over a different payload than was signed and ALWAYS failed with
    // "manifest signature failed". Result: every letter/document/image vault
    // was unrecoverable. Including docExt in the signed object both fixes the
    // verify mismatch AND binds the inline content blob into the signature
    // (a forged/swapped docExt now breaks the signature, not just the AEAD).
    const baseManifest = {
      version: 1 as const,
      vaultId,
      createdAt: Math.floor(Date.now() / 1000),
      shamir: input.shamir,
      kdf: kdfParams,
      shares: descriptors,
      docExt,
      ...(baseline === "v2" ? { cryptoBaseline: "v2" as const } : {}),
      ...(baseline === "v3" ? { cryptoBaseline: "v3" as const } : {}),
    };

    // v2: sign with HKDF-derived Ed25519 seed (ours to wipe). v1: master IS
    // the seed (caller-owned, not wiped here).
    signSeed = prk ? (await manifest.keypairFromPRKv2(prk)).priv : null;
    const signedSeed = signSeed ?? master;
    const signed = await manifest.signManifest(
      baseManifest as unknown as Parameters<typeof manifest.signManifest>[0],
      signedSeed,
    );

    return {
      vaultId,
      manifest: signed as VaultManifest & { docExt: DocManifestExt },
      shares: bundles,
      master,
    };
  } finally {
    // 0.4.0 — synchronous wipe of every Uint8Array we derived. Order
    // doesn't matter; each is independent. master is RETURNED — caller
    // owns wipe after sidecar wrap (parity with enrol-pipeline pattern).
    wipeBytes(contentKey);
    if (prk) wipeBytes(prk);
    for (const k of derivedKeys) wipeBytes(k);
    if (signSeed) wipeBytes(signSeed);
  }
}

export function docShareBundleToJson(b: DocShareBundle, vaultId: string, kind: DocKind): Uint8Array {
  const obj = {
    soulchain: "share/v1",
    vaultId,
    kind,
    index: b.index,
    cipher: b.cipher,
    iv: kdf.b64Encode(b.iv),
    ct: kdf.b64Encode(b.cipherText),
    ...(b.tag ? { tag: kdf.b64Encode(b.tag) } : {}),
    plainLen: b.plainLen,
  };
  return new TextEncoder().encode(JSON.stringify(obj, null, 2));
}

export function docManifestToJson(m: VaultManifest & { docExt: DocManifestExt }): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(m, null, 2));
}

async function makeShareFilename(master: Uint8Array, shareIndex: number): Promise<string> {
  const buf = new Uint8Array(master.byteLength + 16);
  buf.set(master, 0);
  buf.set(new TextEncoder().encode(`:dshare:${shareIndex}`), master.byteLength);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  const hex = Array.from(digest).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `dshare-${shareIndex}-${hex.slice(0, 8)}.json`;
}

async function makeVaultId(master: Uint8Array, label: string): Promise<string> {
  // FIX (2026-06-10, pressure-test discovery): size the buffer off the
  // ACTUAL UTF-8 byte length of the ":docvault:"+label suffix. The prior
  // `master.byteLength + label.length + 8` reserved only 8 bytes for a
  // 10-byte ASCII prefix (`":docvault:"`), so `.set()` overflowed by 2
  // for every label — a hard RangeError that broke ALL letter/document/
  // image vault creation. It also used `label.length` (UTF-16 units), so
  // any multi-byte (e.g. non-ASCII filename) label would under-size further.
  const suffix = new TextEncoder().encode(":docvault:" + label);
  const buf = new Uint8Array(master.byteLength + suffix.length);
  buf.set(master, 0);
  buf.set(suffix, master.byteLength);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  return Array.from(digest.slice(0, 16)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
