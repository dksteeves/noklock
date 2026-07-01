# NoKLock — self-custodial crypto inheritance

**[noklock.app](https://noklock.app)** lets you pass crypto seed phrases, sealed letters, documents and images to your next-of-kin **without ever giving anyone your keys** — self-custody while you're alive, an automatic on-chain handover when you're not.

> This repository is the **source of the NoKLock web app**, licensed **BUSL-1.1** (source-available). It's here so you can read it, audit it, and **reproduce the deployed build** — confirming the code in your browser is exactly this source. See **[`REPRODUCE.md`](REPRODUCE.md)**. The server (a thin convenience layer that holds no vault data and cannot decrypt anything) is not published.

## What it is

- **Self-custodial.** Encryption (Argon2id key derivation, SLIP-39 Shamir secret-sharing, AEAD) runs in your browser. NoKLock never holds your keys, shares, master password, or vault contents.
- **On-chain dead-man's switch.** Stop checking in for a grace window you choose (default 60 days, up to 365) and Chainlink Automation fires the switch on Polygon. Proof-of-life, never proof-of-death — no one, including NoKLock, can declare you deceased to trigger it.
- **Soulbound NFT heirs (ERC-5192).** Each next-of-kin designation mints non-transferable tokens on Polygon — a rare-in-production use of the standard, and the inheritance record anyone can verify.
- **Survives the vendor.** Recovery is 100% client-side from your own shares; inheritance runs on Polygon, not our servers. If NoKLock disappears, your heirs still inherit.
- **Non-crypto heirs.** Hybrid-E lets you designate an heir by email; they create a wallet at claim time — no seed-phrase knowledge needed up front.
- **Social-engineering-proof.** Multi-NoK M-of-N quorum from independent wallets (up to 5-of-9). A single coerced or phished heir cannot release a vault.
- **Duress-proof (Premium).** An optional decoy vault with its own master password — under coercion you reveal the decoy.
- **Zero-PII.** No email, name, phone, IP, cookies, or per-user analytics. There's no honeypot to leak because there's nothing pooled.

## Verify it yourself

- App: <https://noklock.app>
- How it works (plain answers): <https://noklock.app/crypto-inheritance>
- Architecture, security & all 5 contracts (source-verified): <https://noklock.app/info?tab=contracts>
- Honest comparisons (vs Casa, Vault12, Inheriti, Deadhand): <https://noklock.app/compare>
- Run the real cryptographic pipeline on throwaway data: <https://noklock.app/prove-it>
- **Build it yourself** from this source (clone → build → confirm it's exactly this source): [`REPRODUCE.md`](REPRODUCE.md)
- Heir guide (for next-of-kin): <https://noklock.app/heir>

## Contracts — Polygon mainnet (all source-verified on PolygonScan)

| Contract | Address |
|---|---|
| NoKLockLicense (ERC-1155 · USDC mints · founder cap) | `0x3887922317D891E38546f6714c7757D7fd312057` |
| NoKLockSBT (ERC-721 · ERC-5192 soulbound) | `0x82f4C89935E2fD8228f02462A7aB653dcC2d0Af4` |
| NoKLockOracle (Chainlink dead-man's switch) | `0xF68c65d389724b92F05D1Fe506995b3591Ef458A` |
| NoKLockRecovery (M-of-N guardians · timelock) | `0x81755b80Dc2bcC1F1543671FBDFDf4D76Bc8e5bE` |
| NoKLockEscrow (Hybrid-E email-NoK · EIP-712) | `0xe56F0cC151FD8520B040c3842310Ee865e65D27c` |

## Assurance

- 154 automated contract tests on Solidity 0.8.35, covering every state transition and revert path.
- The code and contracts have been reviewed and audited across multiple independent AI models (of course) — plus a full deploy dress-rehearsal on a local Polygon mainnet fork before broadcast.
- All five contracts source-verified on PolygonScan; deterministic finite-state-machine design with cryptographically-witnessable on-chain state.
- Open bug-bounty programme: verified reports earn a free Lifetime licence; criticals also earn USDC. See <https://noklock.app/info?tab=contracts#bug-bounty>.

## Pricing

Paid in USDC directly on Polygon — no subscription processor. Free tier, annual tiers (Standard / Premium), and one-time **Lifetime** tiers that never renew. Founder pricing is contract-enforced for the first 10,000 paid mints. Full table: <https://noklock.app/pricing>.

## Links

- Web: <https://noklock.app>
- X / Twitter: [@noklock_app](https://x.com/noklock_app)
- Contact: hello@noklock.app
- AI/crawler policy: <https://noklock.app/llms.txt> · <https://noklock.app/ai.txt>

---

*Not financial, legal, tax, or estate advice. The software is provided AS-IS under BUSL-1.1.*
