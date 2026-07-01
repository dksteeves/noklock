// @version 0.3.0 @date 2026-06-02
// 0.3.0 — Daniel 2026-06-02: Add/Remove passkey now available on the per-vault
//          management surface (not just at initial enrol-time). Symmetric with
//          the optional passkey step in Enrol.tsx 1.7.0+. New helper
//          `removeEnvelopeLocal(vaultId)` clears the cached envelope so the
//          vault falls back to master-password-only unlock on this device.
//          The passkey itself stays registered with the authenticator (harmless
//          — without the envelope blob the PRF secret decrypts nothing).
// 0.2.0 — Daniel 2026-06-01 (AUDIT FIX 2): prfSecret wipe gap. Audit
//          flagged this as load-bearing: Enrol.tsx wipes output.master
//          after wrapMaster(), but the prfSecret derived from the
//          authenticator (which IS the AES-256-GCM key that decrypts the
//          master envelope) was never wiped. Wiping plaintext but leaving
//          the key that decrypts it defeats the entire wipe pass for the
//          passkey-unlock path. Now: wrapMaster + unwrapMaster both wipe
//          prfSecret synchronously in finally. Caller's prfSecret arg is
//          still valid for the call duration; we just wipe our local
//          reference. (Callers that retain their own ref need to wipe
//          separately — flagged in callsite TODOs.)
// 0.1.0 — @date 2026-05-17
//
// Real WebAuthn passkey support — the OPTIONAL second unlock path.
//
// HARD INVARIANT: the master password (Argon2id) remains the sole canonical
// recovery + next-of-kin inheritance secret. A passkey here only wraps an
// ENCRYPTED COPY of the already-derived `master` into a separate sidecar
// artifact. It is additive convenience on the owner's own device(s). It is
// NEVER the only way in: lose/replace the device and the master password
// still restores everything; a next-of-kin always uses the password/shares
// path. The signed manifest and the restore/inheritance pipeline are
// byte-identical with or without a passkey — this module touches neither.
//
// Mechanism: WebAuthn PRF (hmac-secret) extension yields a stable 32-byte
// secret per (credential, salt). We AES-256-GCM-encrypt `master` under that
// secret. Feature-detected; on any unsupported authenticator/browser the UI
// simply doesn't offer a passkey and the password path is unaffected.

import { aead, kdf } from "@soulchain/crypto-core";

const PASSKEY_ARTIFACT = "passkey/v1";
const LS_PREFIX = "noklock.pk."; // localStorage key prefix, by vaultId

export interface PasskeyEnvelope {
  readonly soulchain: typeof PASSKEY_ARTIFACT;
  readonly vaultId: string;
  readonly credentialIdB64: string;
  readonly prfSaltB64: string;
  readonly ivB64: string;
  readonly ctB64: string;
  readonly tagB64?: string;
}

/** True only where WebAuthn is present. PRF support is probed at enrol time
 *  (it cannot be reliably feature-detected up front). */
export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials
  );
}

function rnd(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

// TS 5.7: Uint8Array<ArrayBufferLike> doesn't structurally satisfy the DOM
// BufferSource type. These byte arrays ARE valid BufferSource at runtime;
// the cast is purely to satisfy the lib.dom WebAuthn signatures.
function buf(u: Uint8Array): BufferSource {
  return u as unknown as BufferSource;
}

function prfFirst(cred: PublicKeyCredential): Uint8Array {
  const ext = cred.getClientExtensionResults() as {
    prf?: { results?: { first?: ArrayBuffer | Uint8Array } };
  };
  const first = ext.prf?.results?.first;
  if (!first) {
    throw new Error(
      "This passkey/authenticator doesn't support the PRF extension that passkey-unlock needs — Windows Hello on Windows 10 is a common one that doesn't; an external security key (e.g. a YubiKey) usually does, so you can retry with one. Nothing is lost either way: your master password unlocks this vault on every device, so you can safely skip the passkey and keep going.",
    );
  }
  return new Uint8Array(first instanceof Uint8Array ? first : new Uint8Array(first));
}

/** Create a new platform passkey and return its credential id + the fresh
 *  PRF salt + the derived 32-byte PRF secret. The salt is random per vault. */
export async function enrollPasskey(
  vaultLabel: string,
): Promise<{ credentialId: Uint8Array; prfSalt: Uint8Array; prfSecret: Uint8Array }> {
  if (!isPasskeySupported()) throw new Error("Passkeys aren't available on this device.");
  const prfSalt = rnd(32);
  const cred = (await navigator.credentials.create({
    publicKey: {
      rp: { name: "NoKLock", id: location.hostname },
      user: { id: buf(rnd(16)), name: `vault:${vaultLabel || "noklock"}`, displayName: "NoKLock vault" },
      challenge: buf(rnd(32)),
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
      timeout: 60_000,
      extensions: { prf: { eval: { first: buf(prfSalt) } } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("Passkey creation was cancelled.");
  const credentialId = new Uint8Array(cred.rawId);
  // Some authenticators only return PRF on get(), not create() — fetch it
  // explicitly so we fail loudly here (at opt-in) rather than at restore.
  const prfSecret = await getPrfSecret(credentialId, prfSalt);
  return { credentialId, prfSalt, prfSecret };
}

/** Re-derive the same 32-byte PRF secret for an existing credential + salt. */
export async function getPrfSecret(credentialId: Uint8Array, prfSalt: Uint8Array): Promise<Uint8Array> {
  if (!isPasskeySupported()) throw new Error("Passkeys aren't available on this device.");
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: buf(rnd(32)),
      allowCredentials: [{ type: "public-key", id: buf(credentialId) }],
      userVerification: "preferred",
      timeout: 60_000,
      extensions: { prf: { eval: { first: buf(prfSalt) } } } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null;
  if (!assertion) throw new Error("Passkey unlock was cancelled.");
  return prfFirst(assertion);
}

/** Wrap `master` under the PRF secret → a portable, signature-free sidecar.
 *  0.2.0 — synchronously wipes the LOCAL prfSecret reference after use.
 *  Caller's separate ref (e.g. in enrollPasskey's destructuring) is also
 *  wiped at the Enrol.tsx call-site (1.10.0+). */
export async function wrapMaster(
  vaultId: string,
  master: Uint8Array,
  credentialId: Uint8Array,
  prfSalt: Uint8Array,
  prfSecret: Uint8Array,
): Promise<PasskeyEnvelope> {
  try {
    const r = await aead.encrypt({ kind: "AES-256-GCM", key: prfSecret, plaintext: master });
    return {
      soulchain: PASSKEY_ARTIFACT,
      vaultId,
      credentialIdB64: kdf.b64Encode(credentialId),
      prfSaltB64: kdf.b64Encode(prfSalt),
      ivB64: kdf.b64Encode(r.iv),
      ctB64: kdf.b64Encode(r.cipherText),
      ...(r.tag ? { tagB64: kdf.b64Encode(r.tag) } : {}),
    };
  } finally {
    // 0.2.0 — prfSecret IS the AES-256-GCM key that decrypts the master
    // envelope. Wipe immediately after encrypt; callers wipe their copies
    // separately.
    if (prfSecret?.fill) prfSecret.fill(0);
  }
}

/** Unwrap `master` from a sidecar by re-deriving the PRF secret via WebAuthn.
 *  0.2.0 — synchronously wipes the freshly-derived prfSecret in finally so
 *  it can't linger in heap after we've used it to decrypt the master. */
export async function unwrapMaster(env: PasskeyEnvelope): Promise<Uint8Array> {
  const credentialId = kdf.b64Decode(env.credentialIdB64);
  const prfSalt = kdf.b64Decode(env.prfSaltB64);
  const prfSecret = await getPrfSecret(credentialId, prfSalt);
  try {
    return await aead.decrypt({
      kind: "AES-256-GCM",
      key: prfSecret,
      iv: kdf.b64Decode(env.ivB64),
      cipherText: kdf.b64Decode(env.ctB64),
      ...(env.tagB64 ? { tag: kdf.b64Decode(env.tagB64) } : {}),
    });
  } finally {
    if (prfSecret?.fill) prfSecret.fill(0);
  }
}

export function parsePasskeyEnvelope(text: string): PasskeyEnvelope {
  const o = JSON.parse(text) as Record<string, unknown>;
  if (o["soulchain"] !== PASSKEY_ARTIFACT) throw new Error("Not a NoKLock passkey-unlock file");
  return o as unknown as PasskeyEnvelope;
}

export function envelopeToJson(env: PasskeyEnvelope): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(env, null, 2));
}

// Same-device convenience: cache the sidecar so the user doesn't need the
// file on the browser they enrolled on. It is NOT a recovery path (the PRF
// secret never leaves the authenticator; this blob is useless without it).
export function cacheEnvelopeLocal(env: PasskeyEnvelope): void {
  try {
    localStorage.setItem(LS_PREFIX + env.vaultId, JSON.stringify(env));
  } catch {
    /* storage blocked — user keeps the downloaded file instead */
  }
}

export function loadEnvelopeLocal(vaultId: string): PasskeyEnvelope | null {
  try {
    const v = localStorage.getItem(LS_PREFIX + vaultId);
    return v ? (JSON.parse(v) as PasskeyEnvelope) : null;
  } catch {
    return null;
  }
}

// 0.3.0 — Drop the cached envelope for a vault. The passkey itself remains
// registered with the authenticator (we can't programmatically delete platform
// credentials), but without the envelope blob the PRF secret has nothing to
// decrypt — the vault falls back to master-password-only unlock on this
// device. Used by VaultDetail's "Remove passkey" affordance.
export function removeEnvelopeLocal(vaultId: string): void {
  try {
    localStorage.removeItem(LS_PREFIX + vaultId);
  } catch {
    /* storage blocked — nothing to remove */
  }
}

export function anyLocalEnvelope(): PasskeyEnvelope | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) {
        const v = localStorage.getItem(k);
        if (v) return JSON.parse(v) as PasskeyEnvelope;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}
