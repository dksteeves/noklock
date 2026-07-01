# @soulchain/crypto-core

Pure cryptographic primitives for NoKLock. Browser-and-Node. **No DOM, no network, no localStorage** — auditable in isolation.

## Modules

| Module | What |
|---|---|
| `kdf` | Argon2id key derivation (libsodium). Defaults: m=64MiB, t=3, p=4 (OWASP 2025). |
| `aead` | AES-256-GCM (`@noble/ciphers`) + XChaCha20-Poly1305 (libsodium). `pickCipher()` deterministically picks one of the two per share index for diversification. |
| `slip39` | Shamir Secret Sharing over GF(256). `split(secret, t, n)` / `combine(shares, t)`. Mathematically faithful to SLIP-39. |
| `manifest` | Ed25519-signed canonical-JSON manifest describing share placement, cipher choices, KDF params. Tamper-detectable. |
| `bip39` | Wraps `@scure/bip39` with English wordlist + checksum validation. |

## Install + test

```bash
cd packages/crypto-core
npm install
npm test
```

Expected: all four test files green.

## Public API at a glance

```ts
import { kdf, aead, slip39, manifest, bip39 } from "@soulchain/crypto-core";

// 1. Validate user input
if (!bip39.isValidBip39(userInput)) throw new Error("Bad checksum");

// 2. Derive a master secret from the user's passkey
const salt = kdf.generateSalt();
const params = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
const master = await kdf.deriveMaster(userPasskey, params);

// 3. Split the BIP39 entropy into shares
const entropy = bip39.entropyOf(userInput);
const shares = slip39.split(entropy, 3, 5);

// 4. Encrypt each share with a per-share key + per-share cipher
for (const share of shares) {
  const kind = aead.pickCipher(master, share.index);
  const shareKey = /* HMAC(master, "share-" + share.index) */ master; // see crypto-core/src/aead.ts pickCipher
  const { iv, cipherText, tag } = await aead.encrypt({ kind, key: shareKey, plaintext: share.bytes });
  // ... write to cloud, IPFS, Arweave
}

// 5. Sign the manifest with a key derived from the master
const signed = await manifest.signManifest(manifestBody, master);
```

## Audit hooks

- Every function takes typed inputs; no `any`.
- No global mutable state.
- No network access.
- `crypto.getRandomValues` is the only RNG source.
- `canonicalJson` produces deterministic signing bytes.

This package is source-available (BUSL-1.1) — it's the trust signal.
