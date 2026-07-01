// @version 0.4.1 @date 2026-06-08
// 0.4.1 — Daniel 2026-06-08 (handoff §3 positioning sweep): "Zero server-side
//         data" card body rewritten to name BOTH simple route (local folders)
//         and maximum-security route (own cloud accounts). Matches the simple-
//         vs-max framing now used across Landing 0.22.0 + Enrol Step B +
//         Pricing FAQ + CryptoInheritance Q + Help Q5 + Info §3.1/§3.2.
// 0.4.0 — Daniel: "Why our architecture and technology choices matter
//         should be in a new tab under architecture titled 'Why it matters'
//         with that content move to the new tab, no collapse needed any
//         more and imp. info prominent but not in the way .. and this
//         allows you to expand beyond the 4 points to anther 2 or 4 as
//         we have a lot to say :)". Un-collapsed (no <details>). Expanded
//         from 4 → 9 differentiator cards. New cards: Argon2id memory-
//         hard derivation, Hybrid-E email path for non-crypto heirs,
//         Live-Man's Switch, Quantum-immune content layer, Source-
//         verified open-source contracts.
// 0.3.0 — IP block folded inside the collapsible.
// 0.2.0 — Renamed heading + collapsible.
// 0.1.0 — Differentiator callout.

import { Link } from "react-router-dom";
import { PATENT_DESCRIPTION, useLivePatentLeader } from "../lib/patentNotice.js";

interface Diff {
  readonly title: string;
  readonly what: string;
  readonly why: string;
}

const DIFFS: readonly Diff[] = [
  {
    title: "On-chain finite state machine",
    what: "Every vault is in exactly one state (alive → due-soon → in-grace → activated → claimed) and that state lives on Polygon.",
    why: "With every other inheritance product, “are you alive? has inheritance triggered?” is a flag in the vendor’s private database — you can’t see it, can’t audit it, and must trust them not to flip it (or even to still exist). With NoKLock, you or your heir read the exact state from any block explorer: no dashboard, no permission, no trust. If NoKLock vanished tomorrow, the truth is still on-chain and your heir can still act on it.",
  },
  {
    title: "Full key custody — we structurally can’t touch your keys",
    what: "Your keys and your vault’s encryption secret are created and used only on your device. NoKLock never holds them — not even a shard.",
    why: "Anyone who holds your keys (or a piece of them) is a target: hacked, subpoenaed, frozen, or bankrupt with your assets inside — that’s how custodial “recovery” services fail. NoKLock can’t be that weak link because it never has the keys. It’s a property of how the app is built, not a policy you have to believe.",
  },
  {
    title: "Zero server-side data beyond where you put it",
    what: "Your encrypted recovery shares live in storage YOU pick — local folders or your own cloud accounts. We keep no central database of users’ secrets.",
    why: "You can’t breach, leak, or be forced to hand over a database that doesn’t exist. If NoKLock’s servers were fully compromised, an attacker would find nothing about your vault — because your vault isn’t there. Your recovery doesn’t depend on us being online, solvent, or honest.",
  },
  {
    title: "Soulbound NFT inheritance trigger (ERC-5192)",
    what: "Your heir’s right to inherit is a non-transferable token minted to their wallet.",
    why: "Unlike a normal NFT it can’t be sold, moved, stolen, or seized — and it’s verifiable on-chain. The right to your estate isn’t a row someone can quietly edit; it’s a token only the contract’s rules can move.",
  },
  {
    title: "Memory-hard password derivation (Argon2id)",
    what: "Your master key is derived via Argon2id — 64 MiB of RAM and ~100 ms on your machine per attempt. The same algorithm used by 1Password, Bitwarden and KeePassXC.",
    why: "A weak password is the single most common failure of every encrypted system in existence. Argon2id makes that failure economically uneconomic: cracking a 7-character password at 1 million guesses/sec is suddenly cracking it at 10 guesses/sec, with 64 TB of RAM required to parallelise. The attacker’s economics rule out attempts that would have been trivial against plain SHA-256.",
  },
  {
    title: "Hybrid-E email path — your heir doesn’t need a wallet",
    what: "Designate an heir by email. When inheritance triggers, they receive instructions to mint a wallet and claim — supervised end-to-end by an on-chain escrow attestation.",
    why: "Most heirs are not crypto-native. Every other inheritance product either assumes they are (most fail their non-crypto family) or hands the keys to a custodian to deliver (worst of both worlds). Hybrid-E gives the non-crypto heir the same end-to-end security as the rest of the protocol — without ever asking them to learn crypto in advance.",
  },
  {
    title: "Live-Man’s Switch — the heartbeat works in both directions",
    what: "If anyone ever initiates a guardian recovery against one of your wallets, you receive an out-of-band alert at your other registered watcher wallets (and optionally your email) the moment the on-chain event fires.",
    why: "Without this, a guardian-recovery attack only fails if you happen to check the dashboard during the cancellation window. The Live-Man’s Switch closes the gap: structurally independent of the wallet under attack, on-chain, self-funded — so even if NoKLock disappears, your alerts keep firing.",
  },
  {
    title: "Quantum-immune content layer",
    what: "Your vault’s actual content is protected by Argon2id + Shamir + AEAD. Shamir secret sharing is information-theoretic — provably immune to quantum attack.",
    why: "The most-quoted post-quantum concern (“Q-day breaks crypto inheritance”) doesn’t apply to NoKLock’s vault contents. The wallet-signing layer (secp256k1) is Shor-vulnerable like every EVM and Bitcoin wallet — that risk is the same here as on any other chain product, and the chains will hard-fork to PQ signatures long before Q-day is a live threat. Meanwhile, the math behind your vault’s contents is provably unbreakable.",
  },
  {
    title: "Source-verified on Polygon",
    what: "All six NoKLock contracts (License, SBT, Oracle, Recovery, Escrow, Alerts) have their source published and bytecode-matched on PolygonScan. The PWA is BUSL-1.1 source-visible.",
    why: "Anyone can read the code that runs your inheritance — not a marketing description of it. That includes an attacker probing for vulnerabilities (yes — open code is more secure code, because everyone audits), an heir wanting to verify the contract really does what we claim, or a competitor wanting to build the same thing (good — we welcome it; the moat is the composition, not the code). If you can’t verify the code, you’re trusting a description.",
  },
];

export function WhyItMatters(): JSX.Element {
  const { leader } = useLivePatentLeader();
  return (
    <section className="space-y-5">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-2"><span className="grad">Why our architecture and technology choices matter</span></h2>
        <p className="text-text-on-dark/85 text-sm">
          Nine properties of NoKLock that read like jargon on a comparison table — and the plain-English consequence of each. The "what" line is the property; the <span className="text-accent-green font-semibold">"why it matters"</span> line is the specific bad thing that can&apos;t happen to you.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {DIFFS.map((d) => (
          <div key={d.title} className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-4">
            <h3 className="font-bold font-display text-accent-cyan mb-1">{d.title}</h3>
            <p className="text-xs text-text-muted mb-2">{d.what}</p>
            <p className="text-sm text-text-on-dark/90"><span className="text-accent-green font-semibold">Why it matters: </span>{d.why}</p>
          </div>
        ))}
      </div>

      {/* IP block — sits beneath the differentiators, above the CTA. */}
      <div className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 p-4">
        <h3 className="font-bold font-display text-accent-cyan mb-1">IP — what we&apos;ve protected</h3>
        <p className="text-sm text-text-on-dark/90">
          <strong>{leader}</strong>, covering {PATENT_DESCRIPTION}
        </p>
      </div>

      <div className="text-center pt-2">
        <Link to="/pricing" className="btn btn-primary text-sm">Lifetime Security — see pricing →</Link>
      </div>
    </section>
  );
}
