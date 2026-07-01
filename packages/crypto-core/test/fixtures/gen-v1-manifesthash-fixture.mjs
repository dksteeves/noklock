// One-shot generator: prints the v1 manifestHash hex for the canonical
// deterministic v1 manifest fixture used by manifest.test.ts. Run once to
// capture the hex; pin the printed value as `EXPECTED_V1_HASH_HEX` in the
// test. If the test ever asserts mismatch, manifest serialisation drifted.

import { signManifest, manifestHash, MANIFEST_VERSION } from "../../src/manifest.js";

const v1Body = {
  version: MANIFEST_VERSION,
  vaultId: "0123456789abcdef0123456789abcdef",
  createdAt: 1_800_000_000,
  shamir: { threshold: 3, total: 5 },
  kdf: {
    algo: "argon2id",
    memKiB: 65536,
    timeCost: 3,
    parallelism: 4,
    saltB64: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    outBytes: 32,
  },
  shares: [
    {
      index: 1,
      cipher: "AES-256-GCM",
      ivB64: "AAECAwQFBgcICQoL",
      cipherTextB64: "ZGVhZGJlZWY=",
      tagB64: "AAECAwQFBgcICQoLDA0ODw==",
      compressedLen: 4,
      originalLen: 4,
      storageHint: "dropbox",
    },
  ],
};

const seed = new Uint8Array(32); // all-zero seed → deterministic Ed25519 key
const signed = await signManifest(v1Body, seed);
const hash = manifestHash(signed);
const hex = Array.from(hash).map((b) => b.toString(16).padStart(2, "0")).join("");
console.log(hex);
