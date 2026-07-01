// @version 0.5.3 @date 2026-05-26
// 0.5.3 — Tiny primitives line in the header (AEAD / Argon2id / Shamir /
//         SHA-256 / secp256k1) with a link to Info → Architecture →
//         Technology #crypto-primitives. Honest, technical-audience callout
//         — answers the "what's actually inside?" question naturally on
//         the page that runs it for real. Pairs with the new "Is NoKLock
//         quantum-safe?" FAQ entry and the Cryptographic primitives card.
// 0.5.2 — Doc-only clarity: the 0.4.0 changelog line below ("scaffolded
//         placeholders … full live demos land next round") is HISTORICAL.
//         Current state: Seed + Letter + Image + Document all run the
//         full live crypto pipeline (BytesDemo). No scaffolds remain.
// 0.5.1 — Image demo: synthetic image is now the current NoKLock logo
//         (logo-192.png) centred on the varying gradient, instead of
//         "NoK"/"Lock" canvas text. Same-origin draw keeps the canvas
//         untainted so toBlob still works; gradient-only fallback on load
//         error. Canvas 96→128px for a sharper logo.
// 0.5.0 — Reveal-first two-phase UX (Daniel). Both SeedDemo and BytesDemo
//         split: "1. Generate test X" creates the synthetic content and
//         surfaces a press-and-hold-to-reveal panel AT THE TOP (peek is
//         optional), then "2. Run the NoKLock demo" runs the crypto
//         pipeline on that already-generated content. Generation no longer
//         buried inside the run; end-state original-vs-recovered reveal
//         retained. setOriginalMnemonic dropped (genMnemonic is canonical).
// 0.4.0 — Round 3 wave 2: tabbed restructure. Four demo contexts share the
//         same Prove-It surface — Seed (live, the existing 8-step demo),
//         Letter / Image / Document (scaffolded placeholders that explain
//         the same pipeline applies; full live demos land next round so the
//         scaffold is honest rather than faked).
// 0.3.0 — much richer per-step technical detail. Each step is rendered as a
//         card with title, timing, and a body of detail lines (params, byte
//         lengths, hex prefixes, etc.) so the user can see exactly what's
//         happening WITHOUT exposing the synthetic mnemonic — the mnemonic
//         stays behind a Hold-to-reveal gesture at the bottom of the page,
//         identical to the Restore flow.
//
// The synthetic seed is generated client-side, used, and then deliberately
// hidden. Hex prefixes/suffixes are shown for ~8 bytes max — never enough
// to recover any secret, just enough to prove "real bytes happened".

import { lazy, Suspense, useState } from "react";
import { bip39, kdf, slip39, aead, manifest } from "@soulchain/crypto-core";
import { useDocumentHead } from "../lib/seo.js";
import { trackEvent } from "../lib/track.js";
import { ConnectExplainer } from "../components/ConnectExplainer.js";
import type { ProveItStepKey } from "../components/ProveItVizPanel.js";

// Lazy-load the viz panel — it pulls all 5 viz modules (~400 KB combined).
// Deferring to when the demo actually has a step to show shrinks the
// initial /prove-it bundle substantially.
const ProveItVizPanel = lazy(() => import("../components/ProveItVizPanel.js").then((m) => ({ default: m.ProveItVizPanel })));

type ProveTab = "seed" | "letter" | "image" | "document";

const TAB_LABEL: Record<ProveTab, string> = {
  seed:     "Seed phrase",
  letter:   "Sealed letter",
  image:    "Image",
  document: "Document",
};

const TAB_SUB: Record<ProveTab, string> = {
  seed:     "12-word mnemonic → master → 3-of-5 shares → restore",
  letter:   "Plain text → AEAD → 3-of-5 shares → restore",
  image:    "≤1 MB image → AEAD → 3-of-5 shares → restore",
  document: "≤1 MB document → AEAD → 3-of-5 shares → restore",
};

interface Line { readonly k: string; readonly v: string; }
interface StepLog {
  readonly key: string;
  readonly title: string;
  readonly ms: number;
  readonly ok: boolean;
  readonly lines: readonly Line[];
}

const TOTAL_STEPS = 8;

// 0.5.4 @date 2026-05-30 — Archived as TestProveLegacy. The v2 dashboard
// at /prove-it/math is now the canonical Prove-It page. This route is
// preserved at /prove-it-legacy for back-compat with any shared links.
export function TestProveLegacy(): JSX.Element {
  useDocumentHead("/prove-it");
  const [tab, setTab] = useState<ProveTab>("seed");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Prove It</span></h1>
        <p className="text-text-on-dark/80 text-sm mt-2 max-w-2xl">
          Runs the actual NoKLock crypto pipeline on throwaway test data, in your browser, right now. Pick a content type below — same pipeline, different input.
        </p>
        <p className="text-text-muted text-xs mt-2 max-w-2xl">
          Primitives in play: <span className="font-mono">XChaCha20-Poly1305</span> / <span className="font-mono">AES-256-GCM</span> (AEAD), <span className="font-mono">Argon2id</span> (KDF), <span className="font-mono">Shamir SLIP-39</span> (threshold), <span className="font-mono">SHA-256</span> (manifest binding), <span className="font-mono">secp256k1</span> (on-chain signing). Full breakdown + post-quantum posture: <a href="/info?tab=architecture&amp;sub=technology#crypto-primitives" className="text-accent-cyan hover:underline">Architecture → Technology</a>.
        </p>
      </header>

      <ConnectExplainer />

      <div className="flex gap-1 border-b border-bg-surface overflow-x-auto">
        {(Object.keys(TAB_LABEL) as ProveTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (tab === t
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted -mt-3 font-mono">{TAB_SUB[tab]}</p>

      {tab === "seed" && <SeedDemo />}
      {tab !== "seed" && <BytesDemo key={tab} kind={tab} />}
    </div>
  );
}

function SeedDemo(): JSX.Element {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<readonly StepLog[]>([]);
  const [currentStepLabel, setCurrentStepLabel] = useState<string>("");
  const [genEntropy, setGenEntropy] = useState<Uint8Array | null>(null);
  const [genMnemonic, setGenMnemonic] = useState<string | null>(null);
  const [revealTop, setRevealTop] = useState(false);
  const [finalMnemonic, setFinalMnemonic] = useState<string | null>(null);
  const [match, setMatch] = useState<boolean | null>(null);
  const [reveal, setReveal] = useState(false);

  const append = (l: StepLog): void => setLogs((prev) => [...prev, l]);
  const completedSteps = logs.length;
  const percent = running ? Math.min(100, Math.round((completedSteps / TOTAL_STEPS) * 100)) : (match !== null ? 100 : 0);

  // Phase A — generate the throwaway test seed only. No crypto runs yet; the
  // user can peek (or not) via the hold-to-reveal panel before the demo.
  function generate(): void {
    const ent = crypto.getRandomValues(new Uint8Array(16)); // 128-bit → 12 words
    const mnemonic = bip39.entropyToWords(ent);
    const okBip = bip39.isValidBip39(mnemonic);
    setGenEntropy(ent);
    setGenMnemonic(mnemonic);
    setRevealTop(false);
    setFinalMnemonic(null);
    setMatch(null);
    setReveal(false);
    setCurrentStepLabel("");
    setLogs([{
      key: "gen", title: "Generated 12-word test seed", ms: 0, ok: okBip,
      lines: [
        { k: "entropy bytes",   v: `${ent.length} (128 bits)` },
        { k: "BIP39 wordlist",  v: "English · 2048 words" },
        { k: "checksum",        v: okBip ? "valid ✓" : "INVALID" },
        { k: "mnemonic",        v: "[hold-to-reveal panel above]" },
      ],
    }]);
  }

  // Phase B — run the full pipeline on the already-generated seed.
  async function runDemo(): Promise<void> {
    if (!genEntropy || !genMnemonic) return;
    trackEvent("prove_it_run");
    const ent = genEntropy;
    const mnemonic = genMnemonic;
    setRunning(true);
    setLogs((prev) => prev.slice(0, 1)); // keep the gen step, drop any prior demo run
    setFinalMnemonic(null);
    setMatch(null);
    setReveal(false);
    setCurrentStepLabel("Starting…");

    // Yield a paint so the spinner UI shows BEFORE the CPU-heavy Argon2id hits.
    await new Promise((r) => setTimeout(r, 30));
    let t = 0;

    try {
      // ─── Step 2: BIP39 checksum ──────────────────────────────
      setCurrentStepLabel("Verifying BIP39 checksum…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const okBip = bip39.isValidBip39(mnemonic);
      append({
        key: "valid", title: "BIP39 checksum verified", ms: round(performance.now() - t), ok: okBip,
        lines: [
          { k: "word count",      v: `${bip39.wordCount(mnemonic)}` },
          { k: "checksum bits",   v: "4 (12-word seed)" },
          { k: "result",          v: okBip ? "valid ✓" : "INVALID" },
        ],
      });

      // ─── Step 3: Argon2id master derivation ──────────────────
      setCurrentStepLabel("Deriving master via Argon2id (m=64MiB, t=3, p=4) — ~250 ms…");
      await new Promise((r) => setTimeout(r, 20));
      t = performance.now();
      const salt = kdf.generateSalt();
      const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
      const master = await kdf.deriveMaster(mnemonic, kdfParams);
      append({
        key: "kdf", title: "Argon2id master derived", ms: round(performance.now() - t), ok: master.length === 32,
        lines: [
          { k: "algorithm",       v: "argon2id (RFC 9106)" },
          { k: "memory",          v: `${kdfParams.memKiB.toLocaleString()} KiB (64 MiB)` },
          { k: "time cost",       v: `t=${kdfParams.timeCost}` },
          { k: "parallelism",     v: `p=${kdfParams.parallelism}` },
          { k: "salt",            v: hexPreview(salt) },
          { k: "output bytes",    v: `${master.length}` },
          { k: "master fp",       v: await fingerprint(master, 4) },
        ],
      });

      // ─── Step 4: SLIP-39 / Shamir split over GF(256) ─────────
      setCurrentStepLabel("Splitting with SLIP-39 Shamir 3-of-5 over GF(256)…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const shares = slip39.split(ent, 3, 5);
      append({
        key: "split", title: "SLIP-39 Shamir split", ms: round(performance.now() - t), ok: shares.length === 5,
        lines: [
          { k: "threshold",       v: "3" },
          { k: "total shares",    v: "5" },
          { k: "field",           v: "GF(256) · poly x^8+x^4+x^3+x+1" },
          { k: "share 1",         v: `index=${shares[0]!.index} · ${shares[0]!.bytes.length} bytes` },
          { k: "share 2",         v: `index=${shares[1]!.index} · ${shares[1]!.bytes.length} bytes` },
          { k: "share 3",         v: `index=${shares[2]!.index} · ${shares[2]!.bytes.length} bytes` },
          { k: "share 4",         v: `index=${shares[3]!.index} · ${shares[3]!.bytes.length} bytes` },
          { k: "share 5",         v: `index=${shares[4]!.index} · ${shares[4]!.bytes.length} bytes` },
        ],
      });

      // ─── Step 5: per-share AEAD ──────────────────────────────
      setCurrentStepLabel("Encrypting each share with rotating AEAD ciphers…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const encShares: { kind: string; cipherText: Uint8Array; iv: Uint8Array; tag?: Uint8Array; index: number; bytes: Uint8Array }[] = [];
      const cipherLines: Line[] = [];
      for (const sh of shares) {
        const kind = aead.pickCipher(master, sh.index);
        const r = await aead.encrypt({ kind, key: master, plaintext: sh.bytes });
        encShares.push({ kind, cipherText: r.cipherText, iv: r.iv, ...(r.tag ? { tag: r.tag } : {}), index: sh.index, bytes: sh.bytes });
        const ivBits = r.iv.length * 8;
        const tagDesc = r.tag ? `tag=${r.tag.length * 8}bit` : "tag=inline";
        cipherLines.push({ k: `share ${sh.index}`, v: `${kind} · IV=${ivBits}bit · ${tagDesc} · ct=${r.cipherText.length} bytes` });
      }
      append({
        key: "enc", title: "Per-share AEAD encryption", ms: round(performance.now() - t), ok: encShares.length === 5,
        lines: [
          { k: "cipher mix",      v: "AES-256-GCM + XChaCha20-Poly1305 (random per share)" },
          ...cipherLines,
        ],
      });

      // ─── Step 6: Ed25519 manifest sign ───────────────────────
      setCurrentStepLabel("Signing the manifest (Ed25519)…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const manifestBody = {
        version: 1 as const,
        vaultId: kdf.b64Encode(crypto.getRandomValues(new Uint8Array(16))).slice(0, 32),
        createdAt: Math.floor(Date.now() / 1000),
        shamir: { threshold: 3, total: 5 },
        kdf: kdfParams,
        shares: shares.map((sh, i) => ({
          index: sh.index,
          cipher: encShares[i]!.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
          ivB64: kdf.b64Encode(encShares[i]!.iv),
          cipherTextB64: kdf.b64Encode(encShares[i]!.cipherText),
          ...(encShares[i]!.tag ? { tagB64: kdf.b64Encode(encShares[i]!.tag!) } : {}),
          compressedLen: encShares[i]!.cipherText.length,
          originalLen: sh.bytes.length,
        })),
      };
      const signed = await manifest.signManifest(manifestBody, master);
      const sigOk = await manifest.verifyManifest(signed);
      const sigBytes = kdf.b64Decode(signed.signatureB64);
      const pubBytes = kdf.b64Decode(signed.signerPubB64);
      const mfBytes = new TextEncoder().encode(JSON.stringify(signed)).length;
      append({
        key: "manifest", title: "Manifest signed (Ed25519)", ms: round(performance.now() - t), ok: sigOk,
        lines: [
          { k: "signer pubkey",   v: `${hexPreview(pubBytes)} (${pubBytes.length} bytes)` },
          { k: "signature",       v: `${sigBytes.length} bytes` },
          { k: "manifest size",   v: `${mfBytes.toLocaleString()} bytes JSON` },
          { k: "verify",          v: sigOk ? "passes ✓" : "FAILED" },
        ],
      });

      // ─── Step 7: decrypt + reconstruct ───────────────────────
      setCurrentStepLabel("Decrypting + reconstructing from 3 of 5 shares…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const decryptedShares = await Promise.all(encShares.map(async (es) => ({
        index: es.index,
        bytes: await aead.decrypt({
          kind: es.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
          key: master,
          iv: es.iv,
          cipherText: es.cipherText,
          ...(es.tag ? { tag: es.tag } : {}),
        }),
      })));
      const picked = decryptedShares.slice(0, 3); // 3 of 5
      const recoveredEntropy = slip39.combine(picked, 3);
      const recoveredMnemonic = bip39.entropyToWords(recoveredEntropy);
      append({
        key: "restore", title: "Reconstructed from 3 of 5 shares", ms: round(performance.now() - t), ok: true,
        lines: [
          { k: "shares used",     v: picked.map((p) => p.index).join(", ") },
          { k: "AEAD verifies",   v: `${decryptedShares.length} of ${encShares.length} passed` },
          { k: "interpolation",   v: "Lagrange at x=0 in GF(256)" },
          { k: "entropy out",     v: `${recoveredEntropy.length} bytes` },
        ],
      });

      // ─── Step 8: compare ─────────────────────────────────────
      setCurrentStepLabel("Comparing original vs. recovered, byte-for-byte…");
      await new Promise((r) => setTimeout(r, 0));
      const equal = recoveredMnemonic === mnemonic;
      setFinalMnemonic(recoveredMnemonic);
      setMatch(equal);
      append({
        key: "compare", title: equal ? "Round-trip match ✓" : "Round-trip MISMATCH ✗",
        ms: 0, ok: equal,
        lines: [
          { k: "original ",       v: "[hidden — Hold-to-reveal]" },
          { k: "recovered",       v: "[hidden — Hold-to-reveal]" },
          { k: "byte-for-byte",   v: equal ? "identical ✓" : "DIFFER" },
        ],
      });
    } catch (e) {
      append({
        key: "error", title: "Error", ms: 0, ok: false,
        lines: [ { k: "message", v: (e as Error).message } ],
      });
    } finally {
      setRunning(false);
      setCurrentStepLabel("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-bold font-display"><span className="grad">Seed-phrase pipeline</span></h2>
        <p className="text-text-on-dark/80 mt-2 text-sm">
          Two steps. First generate a throwaway 12-word test seed in this browser — peek at it (or don't) via the hold-to-reveal panel. Then run the full NoKLock pipeline on it and watch it round-trip back byte-identical.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="btn btn-primary" onClick={generate} disabled={running}>
            1. Generate test seed
          </button>
          <button className="btn btn-secondary" onClick={() => void runDemo()} disabled={running || !genMnemonic}>
            {running ? "Running…" : "2. Run the NoKLock demo"}
          </button>
        </div>
      </div>

      {genMnemonic && (
        <div className="card">
          <h3 className="font-bold font-display mb-1"><span className="grad">Your synthetic test seed</span></h3>
          <p className="text-sm text-text-muted mb-3">
            Generated locally, never sent anywhere. Peeking is optional — press and hold to see it, release to hide. This is the value the demo below will protect and round-trip.
          </p>
          <div
            className="sensitive-surface select-none cursor-pointer text-sm"
            onMouseDown={() => setRevealTop(true)}
            onMouseUp={() => setRevealTop(false)}
            onMouseLeave={() => setRevealTop(false)}
            onTouchStart={() => setRevealTop(true)}
            onTouchEnd={() => setRevealTop(false)}
          >
            {revealTop ? (
              <pre className="font-mono whitespace-pre-wrap break-words text-accent-cyan">{genMnemonic}</pre>
            ) : (
              <div className="text-text-muted text-center py-6">Press and hold to reveal the test seed</div>
            )}
          </div>
        </div>
      )}

      {(running || logs.length > 1 || match !== null) && (
        <div className="card">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-display"><span className="grad">{running ? "In progress" : "Complete"}</span></span>
            <span className="text-xs font-mono text-text-muted">
              {completedSteps} / {TOTAL_STEPS} steps · {percent}%
            </span>
          </div>
          <div className="h-2 bg-bg-deepest rounded overflow-hidden border border-bg-surface">
            <div
              className="h-full transition-all duration-300 ease-out grad-bg"
              style={{ width: `${percent}%` }}
            />
          </div>
          {currentStepLabel && (
            <div className="text-xs text-text-muted mt-2 font-mono">{currentStepLabel}</div>
          )}
        </div>
      )}

      {/* Pipeline visualisation — shows the current step's viz above the
          per-step log cards. Shamir is wired in today; other step vizzes
          ship across coming sessions. The panel renders even when idle
          (showing "gen" placeholder) so the affordance is discoverable
          before clicking "Run demo". */}
      {(running || logs.length >= 1 || match !== null) && (
        <Suspense fallback={<div className="card text-center text-text-muted text-sm">Loading pipeline viz…</div>}>
          <ProveItVizPanel
            stepKey={(logs[logs.length - 1]?.key ?? "gen") as ProveItStepKey}
            running={running}
            stepData={new Map(logs.map((l) => [l.key, l.lines]))}
          />
        </Suspense>
      )}

      {logs.map((s, i) => (
        <StepCard key={`${s.key}-${i}`} step={s} />
      ))}

      {match !== null && (
        <div className={`card ${match ? "border-accent-green border-2" : "border-danger border-2"}`}>
          <h2 className="font-bold mb-2 font-display">
            {match
              ? <span className="grad">Round-trip success — your eyes only</span>
              : <span className="text-danger">Round-trip FAILED</span>}
          </h2>
          <p className="text-sm text-text-muted mb-3">
            Press and hold to reveal the original synthetic seed next to the recovered one. They've never left your machine; this is just confirmation for your eyes.
          </p>
          <div
            className="sensitive-surface select-none cursor-pointer text-sm"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal && genMnemonic && finalMnemonic ? (
              <div className="font-mono space-y-3">
                <div>
                  <div className="text-text-muted mb-1">original (synthetic)</div>
                  <pre className="whitespace-pre-wrap break-words text-accent-cyan">{genMnemonic}</pre>
                </div>
                <div>
                  <div className="text-text-muted mb-1">recovered (after split + restore)</div>
                  <pre className="whitespace-pre-wrap break-words text-accent-green">{finalMnemonic}</pre>
                </div>
              </div>
            ) : (
              <div className="text-text-muted text-center py-6">Press and hold to reveal both seeds side-by-side</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Bytes-pipeline demo — same crypto-core pipeline as Seed, but takes a
// content blob (letter/image/doc bytes) and a generated passkey instead of
// a BIP39 mnemonic. AEAD-encrypts the content with the master, SLIP-39
// splits the master, per-share AEAD wraps, manifest signs. Round-trip:
// combine 3-of-5 shares → master → AEAD-decrypt content → byte compare.
// -----------------------------------------------------------------------

const BYTES_TOTAL_STEPS = 9;

interface BytesProfile {
  readonly label: string;          // "sealed letter" / "image" / "document"
  readonly contentLabel: string;   // "letter text" / "image bytes" / "document bytes"
  readonly mime?: string;          // for image rendering
}

const BYTES_PROFILES: Record<Exclude<ProveTab, "seed">, BytesProfile> = {
  letter:   { label: "Sealed letter", contentLabel: "letter text" },
  image:    { label: "Image",          contentLabel: "image bytes", mime: "image/png" },
  document: { label: "Document",       contentLabel: "document bytes" },
};

function generateSyntheticLetter(): { bytes: Uint8Array; text: string } {
  const stamp = new Date().toISOString();
  const text =
    `Dear future me,\n\n` +
    `If you are reading this, NoKLock's pipeline worked. The content of this letter\n` +
    `was encrypted in your own browser, split via SLIP-39 into 5 shares, of which\n` +
    `any 3 can rebuild it. NoKLock never saw a single byte.\n\n` +
    `Generated: ${stamp}\n` +
    `Threshold: 3-of-5\n` +
    `— end of test letter —`;
  return { bytes: new TextEncoder().encode(text), text };
}

function generateSyntheticImage(): Promise<{ bytes: Uint8Array; dataUrl: string }> {
  return new Promise((resolve) => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;
    // Varying gradient background — deterministic per call, visibly distinct
    // between runs so each test image is unique.
    const seed = Math.floor(Math.random() * 256);
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0,   `hsl(${seed},          80%, 50%)`);
    grad.addColorStop(0.5, `hsl(${(seed + 90)  % 360}, 80%, 50%)`);
    grad.addColorStop(1,   `hsl(${(seed + 180) % 360}, 80%, 50%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const finish = (): void => {
      c.toBlob(async (blob) => {
        if (!blob) {
          resolve({ bytes: new Uint8Array(0), dataUrl: "" });
          return;
        }
        const buf = new Uint8Array(await blob.arrayBuffer());
        const dataUrl = await new Promise<string>((res) => {
          const fr = new FileReader();
          fr.onload = () => res(typeof fr.result === "string" ? fr.result : "");
          fr.readAsDataURL(blob);
        });
        resolve({ bytes: buf, dataUrl });
      }, "image/png");
    };

    // Draw the current NoKLock logo (same-origin → canvas stays untainted)
    // centred over the gradient, aspect-preserved. If it fails to load,
    // fall back to the gradient alone rather than blocking the demo.
    const logo = new Image();
    logo.onload = () => {
      const maxW = 96, maxH = 96;
      const r = Math.min(maxW / logo.width, maxH / logo.height);
      const w = logo.width * r;
      const h = logo.height * r;
      ctx.drawImage(logo, (128 - w) / 2, (128 - h) / 2, w, h);
      finish();
    };
    logo.onerror = () => finish();
    logo.src = "/logo-192.png";
  });
}

function generateSyntheticDocument(): { bytes: Uint8Array; text: string } {
  const stamp = new Date().toISOString();
  const paragraphs = [
    "LAST WILL AND TESTAMENT — TEST DOCUMENT, NOT BINDING",
    `Drawn: ${stamp}`,
    "",
    "I direct that all my crypto assets, sealed letters, and digital documents",
    "be inheritable via the NoKLock dead-man's switch I have configured on the",
    "Polygon mainnet contract suite.",
    "",
    "My designated next of kin shall be granted the soul-bound NFT triggers",
    "necessary to retrieve the share-URL manifest and reconstruct my master",
    "secret using any 3 of 5 shares stored in their respective cloud locations.",
    "",
    "This document is encrypted client-side with a master-password-derived key,",
    "AEAD-tagged for tamper detection, and round-tripped through SLIP-39 to",
    "prove the pipeline. The bytes you see decrypted at the end MUST match",
    "byte-for-byte the bytes encrypted at the start.",
    "",
    "— end of test document —",
  ];
  const text = paragraphs.join("\n");
  return { bytes: new TextEncoder().encode(text), text };
}

function generatePasskey(): string {
  // 16 bytes hex → 32-char passkey. Strong, throwaway, only used inside this demo.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function BytesDemo({ kind }: { readonly kind: Exclude<ProveTab, "seed"> }): JSX.Element {
  const profile = BYTES_PROFILES[kind];
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<readonly StepLog[]>([]);
  const [currentStepLabel, setCurrentStepLabel] = useState<string>("");
  const [genContent, setGenContent] = useState<Uint8Array | null>(null);
  const [genPasskey, setGenPasskey] = useState<string | null>(null);
  const [revealTop, setRevealTop] = useState(false);
  const [match, setMatch] = useState<boolean | null>(null);
  const [reveal, setReveal] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [recoveredText, setRecoveredText] = useState<string | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [recoveredDataUrl, setRecoveredDataUrl] = useState<string | null>(null);

  const append = (l: StepLog): void => setLogs((prev) => [...prev, l]);
  const completedSteps = logs.length;
  const percent = running
    ? Math.min(100, Math.round((completedSteps / BYTES_TOTAL_STEPS) * 100))
    : (match !== null ? 100 : 0);

  // Phase A — generate the throwaway content + passkey only. No crypto runs
  // yet; the user can peek (or not) at the content before the demo.
  async function generate(): Promise<void> {
    setRevealTop(false);
    setMatch(null);
    setReveal(false);
    setOriginalText(null);
    setRecoveredText(null);
    setOriginalDataUrl(null);
    setRecoveredDataUrl(null);
    setCurrentStepLabel("");

    let contentBytes: Uint8Array;
    let contentPreview: string;
    if (kind === "letter") {
      const { bytes, text } = generateSyntheticLetter();
      contentBytes = bytes; contentPreview = text;
      setOriginalText(text);
    } else if (kind === "image") {
      const { bytes, dataUrl } = await generateSyntheticImage();
      contentBytes = bytes; contentPreview = `(image data, ${bytes.length} bytes)`;
      setOriginalDataUrl(dataUrl);
    } else {
      const { bytes, text } = generateSyntheticDocument();
      contentBytes = bytes; contentPreview = text;
      setOriginalText(text);
    }
    const passkey = generatePasskey();
    setGenContent(contentBytes);
    setGenPasskey(passkey);
    setLogs([{
      key: "gen", title: `Generated synthetic ${profile.contentLabel}`, ms: 0, ok: true,
      lines: [
        { k: "content size",   v: `${contentBytes.length} bytes` },
        { k: "content preview", v: contentPreview.length > 80 ? contentPreview.slice(0, 77) + "…" : contentPreview },
        { k: "master password",        v: "[synthetic, only used in this demo]" },
        { k: "master password length", v: `${passkey.length} chars` },
      ],
    }]);
  }

  // Phase B — run the full pipeline on the already-generated content.
  async function runDemo(): Promise<void> {
    if (!genContent || !genPasskey) return;
    trackEvent("prove_it_run");
    const contentBytes = genContent;
    const passkey = genPasskey;
    setRunning(true);
    setLogs((prev) => prev.slice(0, 1)); // keep the gen step, drop any prior demo run
    setMatch(null);
    setReveal(false);
    setRecoveredText(null);
    setRecoveredDataUrl(null);
    setCurrentStepLabel("Starting…");

    await new Promise((r) => setTimeout(r, 30));
    let t = 0;

    try {
      // ─── Step 2: Argon2id master derivation ──────────────────
      setCurrentStepLabel("Deriving master via Argon2id (m=64MiB, t=3, p=4) — ~250 ms…");
      await new Promise((r) => setTimeout(r, 20));
      t = performance.now();
      const salt = kdf.generateSalt();
      const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
      const master = await kdf.deriveMaster(passkey, kdfParams);
      append({
        key: "kdf", title: "Argon2id master derived", ms: round(performance.now() - t), ok: master.length === 32,
        lines: [
          { k: "input",          v: "master password (string)" },
          { k: "params",         v: "m=64 MiB · t=3 · p=4 · 32B output" },
          { k: "salt",           v: `${salt.length} random bytes · ${hexPreview(salt)}` },
          { k: "master out",     v: `${master.length} bytes` },
        ],
      });

      // ─── Step 3: AEAD encrypt content with master ─────────────
      setCurrentStepLabel(`AEAD-encrypting ${profile.contentLabel} with master…`);
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const contentCipher = await aead.encrypt({
        kind: "AES-256-GCM",
        key: master,
        plaintext: contentBytes,
      });
      append({
        key: "content-enc", title: `${profile.contentLabel} AEAD-encrypted`, ms: round(performance.now() - t), ok: true,
        lines: [
          { k: "cipher",         v: "AES-256-GCM" },
          { k: "plaintext in",   v: `${contentBytes.length} bytes` },
          { k: "iv",             v: `${contentCipher.iv.length} random bytes` },
          { k: "ciphertext out", v: `${contentCipher.cipherText.length} bytes` },
          { k: "auth tag",       v: contentCipher.tag ? `${contentCipher.tag.length} bytes (separate)` : "appended" },
        ],
      });

      // ─── Step 4: SLIP-39 split master into 5 shares ───────────
      setCurrentStepLabel("Splitting master into 5 Shamir shares (3-of-5)…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const shares = slip39.split(master, 3, 5);
      append({
        key: "split", title: "Master split into 5 shares", ms: round(performance.now() - t), ok: true,
        lines: [
          { k: "scheme",          v: "SLIP-39 over GF(256), byte-parallel" },
          { k: "threshold",       v: "3 of 5" },
          { k: "share size",      v: `${shares[0]!.bytes.length} bytes each` },
          { k: "security",        v: "Information-theoretic — 2 shares reveal NOTHING" },
        ],
      });

      // ─── Step 5: Per-share AEAD wrap ──────────────────────────
      setCurrentStepLabel("AEAD-wrapping each share with a per-share cipher…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const encShares = await Promise.all(shares.map(async (s) => {
        const cipherKind = aead.pickCipher(master, s.index);
        const enc = await aead.encrypt({ kind: cipherKind, key: master, plaintext: s.bytes });
        return { index: s.index, kind: cipherKind, iv: enc.iv, cipherText: enc.cipherText, tag: enc.tag };
      }));
      append({
        key: "wrap", title: "Per-share AEAD wrap", ms: round(performance.now() - t), ok: true,
        lines: [
          { k: "ciphers",        v: encShares.map((e) => `${e.index}:${e.kind === "AES-256-GCM" ? "GCM" : "XChaCha"}`).join(", ") },
          { k: "wrapped sizes",  v: encShares.map((e) => e.cipherText.length).join(", ") + " bytes" },
        ],
      });

      // ─── Step 6: Manifest sign + verify ───────────────────────
      setCurrentStepLabel("Signing the manifest (Ed25519)…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const manifestBody = {
        version: 1 as const,
        vaultId: kdf.b64Encode(crypto.getRandomValues(new Uint8Array(16))).slice(0, 32),
        createdAt: Math.floor(Date.now() / 1000),
        shamir: { threshold: 3, total: 5 },
        kdf: kdfParams,
        shares: shares.map((sh, i) => ({
          index: sh.index,
          cipher: encShares[i]!.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
          ivB64: kdf.b64Encode(encShares[i]!.iv),
          cipherTextB64: kdf.b64Encode(encShares[i]!.cipherText),
          ...(encShares[i]!.tag ? { tagB64: kdf.b64Encode(encShares[i]!.tag!) } : {}),
          compressedLen: encShares[i]!.cipherText.length,
          originalLen: sh.bytes.length,
        })),
      };
      const signed = await manifest.signManifest(manifestBody, master);
      const sigOk = await manifest.verifyManifest(signed);
      const sigBytes = kdf.b64Decode(signed.signatureB64);
      const pubBytes = kdf.b64Decode(signed.signerPubB64);
      append({
        key: "manifest", title: sigOk ? "Manifest signed + verified ✓" : "Manifest sign/verify FAILED ✗",
        ms: round(performance.now() - t), ok: sigOk,
        lines: [
          { k: "algorithm",       v: "Ed25519 over canonical-JSON" },
          { k: "public key",      v: `${pubBytes.length} bytes · ${hexPreview(pubBytes)}` },
          { k: "signature",       v: `${sigBytes.length} bytes · ${hexPreview(sigBytes)}` },
          { k: "self-verify",     v: sigOk ? "passed ✓" : "FAILED" },
        ],
      });

      // ─── Step 7: AEAD-decrypt 3 shares + SLIP-39 combine ─────
      setCurrentStepLabel("Decrypting 3 shares and reconstructing master…");
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const decryptedShares = await Promise.all(encShares.map(async (es) => ({
        index: es.index,
        bytes: await aead.decrypt({
          kind: es.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
          key: master,
          iv: es.iv,
          cipherText: es.cipherText,
          ...(es.tag ? { tag: es.tag } : {}),
        }),
      })));
      const picked = decryptedShares.slice(0, 3);
      const recoveredMaster = slip39.combine(picked, 3);
      append({
        key: "restore-master", title: "Master reconstructed from 3 of 5", ms: round(performance.now() - t), ok: recoveredMaster.length === 32,
        lines: [
          { k: "shares used",    v: picked.map((p) => p.index).join(", ") },
          { k: "interpolation",  v: "Lagrange at x=0 in GF(256)" },
          { k: "master out",     v: `${recoveredMaster.length} bytes` },
        ],
      });

      // ─── Step 8: AEAD-decrypt content with recovered master ───
      setCurrentStepLabel(`AEAD-decrypting ${profile.contentLabel} with recovered master…`);
      await new Promise((r) => setTimeout(r, 0));
      t = performance.now();
      const recoveredBytes = await aead.decrypt({
        kind: "AES-256-GCM",
        key: recoveredMaster,
        iv: contentCipher.iv,
        cipherText: contentCipher.cipherText,
        ...(contentCipher.tag ? { tag: contentCipher.tag } : {}),
      });
      append({
        key: "content-dec", title: `${profile.contentLabel} AEAD-decrypted`, ms: round(performance.now() - t), ok: true,
        lines: [
          { k: "cipher",          v: "AES-256-GCM" },
          { k: "plaintext out",   v: `${recoveredBytes.length} bytes` },
          { k: "auth tag",        v: "verified ✓" },
        ],
      });

      // ─── Step 9: byte-for-byte compare ────────────────────────
      setCurrentStepLabel("Comparing original vs. recovered bytes…");
      await new Promise((r) => setTimeout(r, 0));
      const equal = recoveredBytes.length === contentBytes.length &&
        recoveredBytes.every((b, i) => b === contentBytes[i]);
      if (kind === "letter" || kind === "document") {
        setRecoveredText(new TextDecoder().decode(recoveredBytes));
      } else if (kind === "image") {
        const blob = new Blob([recoveredBytes as BlobPart], { type: "image/png" });
        const url = await new Promise<string>((res) => {
          const fr = new FileReader();
          fr.onload = () => res(typeof fr.result === "string" ? fr.result : "");
          fr.readAsDataURL(blob);
        });
        setRecoveredDataUrl(url);
      }
      setMatch(equal);
      append({
        key: "compare", title: equal ? "Round-trip match ✓" : "Round-trip MISMATCH ✗",
        ms: 0, ok: equal,
        lines: [
          { k: "original size",   v: `${contentBytes.length} bytes` },
          { k: "recovered size",  v: `${recoveredBytes.length} bytes` },
          { k: "byte-for-byte",   v: equal ? "identical ✓" : "DIFFER" },
        ],
      });
    } catch (e) {
      append({
        key: "error", title: "Error", ms: 0, ok: false,
        lines: [ { k: "message", v: (e as Error).message } ],
      });
    } finally {
      setRunning(false);
      setCurrentStepLabel("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-bold font-display"><span className="grad">{profile.label} pipeline</span></h2>
        <p className="text-text-on-dark/80 mt-2 text-sm">
          Two steps. First generate a throwaway {profile.contentLabel} + master password in this browser — peek at it (or don't) via the hold-to-reveal panel. Then run the full encrypt → split → wrap → sign → restore → decrypt pipeline and watch it come back byte-identical.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="btn btn-primary" onClick={() => void generate()} disabled={running}>
            1. Generate test {kind}
          </button>
          <button className="btn btn-secondary" onClick={() => void runDemo()} disabled={running || !genContent}>
            {running ? "Running…" : "2. Run the NoKLock demo"}
          </button>
        </div>
      </div>

      {genContent && (
        <div className="card">
          <h3 className="font-bold font-display mb-1"><span className="grad">Your synthetic {profile.contentLabel}</span></h3>
          <p className="text-sm text-text-muted mb-3">
            Generated locally, never sent anywhere. Peeking is optional — press and hold to see it, release to hide. This is what the demo below will protect and round-trip.
          </p>
          <div
            className="sensitive-surface select-none cursor-pointer text-sm"
            onMouseDown={() => setRevealTop(true)}
            onMouseUp={() => setRevealTop(false)}
            onMouseLeave={() => setRevealTop(false)}
            onTouchStart={() => setRevealTop(true)}
            onTouchEnd={() => setRevealTop(false)}
          >
            {revealTop ? (
              kind === "image" && originalDataUrl ? (
                <div className="text-center">
                  <img src={originalDataUrl} alt="original" className="w-32 h-32 rounded border border-bg-surface mx-auto" />
                </div>
              ) : originalText ? (
                <pre className="font-mono whitespace-pre-wrap break-words text-accent-cyan max-h-64 overflow-auto text-xs">{originalText}</pre>
              ) : (
                <div className="text-text-muted text-center py-6">No content to reveal.</div>
              )
            ) : (
              <div className="text-text-muted text-center py-6">Press and hold to reveal the test {profile.contentLabel}</div>
            )}
          </div>
        </div>
      )}

      {(running || logs.length > 1 || match !== null) && (
        <div className="card">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-display"><span className="grad">{running ? "In progress" : "Complete"}</span></span>
            <span className="text-xs font-mono text-text-muted">
              {completedSteps} / {BYTES_TOTAL_STEPS} steps · {percent}%
            </span>
          </div>
          <div className="h-2 bg-bg-deepest rounded overflow-hidden border border-bg-surface">
            <div className="h-full transition-all duration-300 ease-out grad-bg" style={{ width: `${percent}%` }} />
          </div>
          {currentStepLabel && (
            <div className="text-xs text-text-muted mt-2 font-mono">{currentStepLabel}</div>
          )}
        </div>
      )}

      {/* Pipeline viz panel — same as SeedDemo's. Daniel 2026-05-28:
          "is the prove it graphic on all 4 types or just seed phrase?".
          Now on all 4. */}
      {(running || logs.length >= 1 || match !== null) && (
        <Suspense fallback={<div className="card text-center text-text-muted text-sm">Loading pipeline viz…</div>}>
          <ProveItVizPanel
            stepKey={(logs[logs.length - 1]?.key ?? "gen") as ProveItStepKey}
            running={running}
            stepData={new Map(logs.map((l) => [l.key, l.lines]))}
          />
        </Suspense>
      )}

      {logs.map((s, i) => (
        <StepCard key={`${s.key}-${i}`} step={s} />
      ))}

      {match !== null && (
        <div className={`card ${match ? "border-accent-green border-2" : "border-danger border-2"}`}>
          <h2 className="font-bold mb-2 font-display">
            {match
              ? <span className="grad">Round-trip success — original = recovered, byte-for-byte</span>
              : <span className="text-danger">Round-trip FAILED</span>}
          </h2>
          <p className="text-sm text-text-muted mb-3">
            Press and hold below to reveal the synthetic content for visual comparison.
          </p>
          <div
            className="sensitive-surface select-none cursor-pointer text-sm"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal ? (
              kind === "image" && originalDataUrl && recoveredDataUrl ? (
                <div className="flex flex-wrap gap-6 justify-center">
                  <div className="text-center">
                    <div className="text-text-muted text-xs mb-2">original</div>
                    <img src={originalDataUrl} alt="original" className="w-32 h-32 rounded border border-bg-surface" />
                  </div>
                  <div className="text-center">
                    <div className="text-text-muted text-xs mb-2">recovered</div>
                    <img src={recoveredDataUrl} alt="recovered" className="w-32 h-32 rounded border border-bg-surface" />
                  </div>
                </div>
              ) : (originalText && recoveredText) ? (
                <div className="font-mono space-y-3 text-xs">
                  <div>
                    <div className="text-text-muted mb-1">original (synthetic)</div>
                    <pre className="whitespace-pre-wrap break-words text-accent-cyan max-h-64 overflow-auto">{originalText}</pre>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1">recovered (after encrypt + split + restore + decrypt)</div>
                    <pre className="whitespace-pre-wrap break-words text-accent-green max-h-64 overflow-auto">{recoveredText}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-text-muted text-center py-6">No content to reveal.</div>
              )
            ) : (
              <div className="text-text-muted text-center py-6">Press and hold to reveal</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ step }: { readonly step: StepLog }): JSX.Element {
  return (
    <div className={`card ${step.ok ? "" : "border-danger border"}`}>
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-bold font-display">
          <span className={step.ok ? "grad" : "text-danger"}>{step.ok ? "✓" : "✗"} {step.title}</span>
        </h3>
        {step.ms > 0 && <span className="text-xs font-mono text-text-muted">{step.ms} ms</span>}
      </div>
      <table className="w-full text-sm font-mono">
        <tbody>
          {step.lines.map((line, i) => (
            <tr key={i} className="border-t border-bg-surface first:border-t-0">
              <td className="py-1 pr-4 text-text-muted whitespace-nowrap align-top">{line.k}</td>
              <td className="py-1 break-all">{line.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function round(ms: number): number {
  return Math.round(ms * 10) / 10;
}

function hexPreview(bytes: Uint8Array): string {
  // Show first 4 + last 4 bytes as hex with ellipsis. Enough to prove
  // "real bytes happened" without giving away any secret material.
  const n = bytes.length;
  if (n <= 8) return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const head = Array.from(bytes.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const tail = Array.from(bytes.slice(-4)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${head}…${tail} (${n} bytes)`;
}

async function fingerprint(bytes: Uint8Array, prefixBytes: number): Promise<string> {
  // SHA-256 → first N bytes as hex. NOT a secret; just a stable display tag.
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  return Array.from(digest.slice(0, prefixBytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
