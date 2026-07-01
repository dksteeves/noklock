# Build it yourself — the code in your browser is this source

NoKLock is self-custodial: you shouldn't have to trust our word about what the app
does. This repository is the **actual application source**, so you (or anyone, or an
AI) can read it, audit it, and build it.

## Build it

```bash
git clone https://github.com/dksteeves/noklock && cd noklock
cp apps/web/.env.public apps/web/.env.production   # the public build config
npm ci                                             # exact deps from the lockfile
npm run build -w apps/web                           # → apps/web/dist
```

The build runs. The app you get is built from **exactly this source** — the same
components, the same cryptographic pipeline, the same airgap firewall that run on
[noklock.app](https://noklock.app).

## Why we don't publish a single "matching hash"

An honest note, because the whole point of this page is honesty. Two things make a
*byte-for-byte* hash of the deployed build non-reproducible for a stranger, and
neither is the application logic:

1. **Two rate-limited client API keys are kept private** (a 0x swap key and a Pimlico
   key). They're not cryptographic secrets — any client-side key is visible in a
   browser — but they're rate-limited, so we don't publish them. Because JS bundlers
   hash-chain their chunks, even a key that only appears in the lazily-loaded payment
   code shifts the top-level bundle hash. So a build *without* those keys is
   functionally identical but not byte-identical.
2. **A build timestamp** is stamped into each build for the version label.

What you **can** verify, exactly and independently:

- **The source itself** — every file that produces the app is in this repo. Read the
  airgap firewall (`apps/web/src/lib/airgap-manager.ts`), the seed-wipe
  (`apps/web/src/lib/enrol-pipeline.ts`), and the crypto pipeline
  (`packages/crypto-core/`), and confirm they are what the app runs.
- **What your browser actually loaded** — [/prove-it/build-matches](https://noklock.app/prove-it/build-matches)
  enumerates, at runtime, every script/style your browser fetched. Compare it to this repo.
- **The on-chain layer, byte-for-byte** — the six smart contracts are
  **source-verified on PolygonScan** (linked from [/prove-it](https://noklock.app/prove-it)).
  That is the immutable, exact-match proof for the inheritance mechanism.

## What's here vs. what isn't

- **Here:** the web app (`apps/web`) and the cryptographic core (`packages/crypto-core`
  — Argon2id, SLIP-39 Shamir, AEAD, Ed25519-signed manifests, on the audited `@noble`
  / `@scure` primitives), plus `packages/storage-adapters`.
- **Not here (by design):** the server (`server-form-b`) — a thin convenience layer
  (IP-privacy RPC proxy, an EIP-712 attestation signer for the email-heir flow, a
  static events indexer). It holds no vault data and cannot decrypt anything. The app's
  self-custody guarantees don't depend on it: recovery is 100% client-side; inheritance
  fires on-chain.

Licensed **BUSL-1.1** (source-available; see `LICENSE`).
