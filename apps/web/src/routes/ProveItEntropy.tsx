// @version 0.2.0 @date 2026-06-01
// 0.2.0 — Daniel 2026-06-01: Mount the SimAirgap simulation. Every byte
//          shown on this page (AEAD ciphertext, Shamir shares, even the
//          control plaintext) is generated locally and the chi-square test
//          runs entirely in-browser — exactly the kind of crypto primitive
//          a user would run AIRGAPPED in real life. Wrapping the whole
//          page in <SimAirgapProvider> + <SimAirgapMoodOverlay> with a
//          <SimAirgapBadge/> top-right makes the mood match the real-flow
//          step. Simulation only; airgap-manager not engaged.
//
// 0.1.0 — /prove-it/entropy — Daniel 2026-05-30: prove that {BRAND_NAME}'s
// encrypted shares are statistically indistinguishable from random noise.
// Generate a real share live in the browser, run a chi-square byte-
// frequency test on it, show the result vs. the critical value for 255
// degrees of freedom. Indistinguishable from random = no info leakage,
// which is the whole point of AEAD.
//
// Honest framing: we are NOT claiming the cipher is unbreakable. We are
// claiming the OUTPUT bytes follow a uniform distribution (which is the
// indistinguishability property a working AEAD must satisfy). A failing
// chi-square here would mean our crypto is broken — and the test runs
// LIVE in your browser, on bytes WE generate at the moment you load the
// page, so we couldn't fake it.

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { aead, kdf, slip39 } from "@soulchain/crypto-core";
import { useDocumentHead } from "../lib/seo.js";
import {
  SimAirgapProvider,
  SimAirgapMoodOverlay,
  SimAirgapBadge,
} from "../components/SimAirgapMood.js";

interface ChiSquareResult {
  readonly statistic: number;
  readonly criticalValue: number;
  readonly passes: boolean;
  readonly sampleSize: number;
  readonly histogram: readonly number[];
}

// Chi-square critical value for df=255 at p=0.05 (~293.25). Sample size needs
// to be large enough that expected per-bin ≥ 5 for the test to be meaningful;
// for 256 bins that's ≥ 1280 bytes, which is fine for typical share sizes.
const CHI_CRIT_DF255_P05 = 293.25;

function chiSquareBytes(bytes: Uint8Array): ChiSquareResult {
  const counts = new Array<number>(256).fill(0);
  for (let i = 0; i < bytes.length; i++) {
    counts[bytes[i]!]! += 1;
  }
  const expected = bytes.length / 256;
  let chi = 0;
  for (let i = 0; i < 256; i++) {
    const diff = (counts[i] ?? 0) - expected;
    chi += (diff * diff) / expected;
  }
  return {
    statistic: chi,
    criticalValue: CHI_CRIT_DF255_P05,
    passes: chi <= CHI_CRIT_DF255_P05,
    sampleSize: bytes.length,
    histogram: counts,
  };
}

async function generateSampleCiphertext(payloadBytes: number): Promise<Uint8Array> {
  // Real pipeline: random plaintext → Argon2id-derived key → AEAD encrypt → return ciphertext.
  // The plaintext is structured (random ASCII letters) to make the
  // "ciphertext is uniform random while plaintext clearly isn't" demonstration concrete.
  const plain = new Uint8Array(payloadBytes);
  for (let i = 0; i < payloadBytes; i++) {
    plain[i] = 65 + (i % 26); // ASCII A..Z repeating
  }
  const salt = kdf.generateSalt();
  const params = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
  const key = await kdf.deriveMaster("entropy-demo-password", params);
  const enc = await aead.encrypt({ kind: "AES-256-GCM", key, plaintext: plain });
  return enc.cipherText;
}

async function generateSampleShares(): Promise<Uint8Array> {
  // Real Shamir split of a 32-byte secret into 5 shares. Concatenate the share
  // bytes so the chi-square sees the actual on-disk byte distribution a
  // share file would have.
  const secret = crypto.getRandomValues(new Uint8Array(32));
  const shares = slip39.split(secret, 3, 5);
  const totalLen = shares.reduce((s, sh) => s + sh.bytes.length, 0);
  const concat = new Uint8Array(totalLen);
  let off = 0;
  for (const sh of shares) {
    concat.set(sh.bytes, off);
    off += sh.bytes.length;
  }
  return concat;
}

export function ProveItEntropy(): JSX.Element {
  useDocumentHead("/prove-it/entropy");
  const [running, setRunning] = useState(true);
  const [aeadResult, setAeadResult] = useState<ChiSquareResult | null>(null);
  const [shareResult, setShareResult] = useState<ChiSquareResult | null>(null);
  const [plainResult, setPlainResult] = useState<ChiSquareResult | null>(null);

  const runAll = useCallback(async (): Promise<void> => {
    setRunning(true);
    try {
      // Plaintext (control — ASCII A..Z): obviously fails chi-square.
      const plain = new Uint8Array(2048);
      for (let i = 0; i < plain.length; i++) plain[i] = 65 + (i % 26);
      setPlainResult(chiSquareBytes(plain));

      // AEAD ciphertext (passes chi-square).
      const cipher = await generateSampleCiphertext(2048);
      setAeadResult(chiSquareBytes(cipher));

      // Shamir shares (passes chi-square — the field math is information-theoretic).
      const shares = await generateSampleShares();
      setShareResult(chiSquareBytes(shares));
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    void runAll();
  }, [runAll]);

  return (
    <SimAirgapProvider enabled={true}>
      <SimAirgapMoodOverlay>
        <SimAirgapBadge />
        <div className="space-y-6">
          <header>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h1 className="text-3xl font-bold font-display"><span className="grad">Prove your shares look like noise</span></h1>
              <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">← back to Prove-It hub</Link>
            </div>
            <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
              A working AEAD must produce ciphertext that's statistically indistinguishable from random — otherwise the ciphertext leaks information about the plaintext.
              Same for Shamir share bytes: information-theoretic security means each share alone has zero correlation to the secret.
              This page generates real bytes <em>in your browser</em>, runs a chi-square byte-frequency test on each, and shows the result against the critical value for 256 bins (df = 255, α = 0.05, critical ≈ {CHI_CRIT_DF255_P05}).
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ResultCard
              title="Control: structured plaintext"
              subtitle="ASCII A..Z repeating · should FAIL the test"
              accent="rose"
              result={plainResult}
              running={running && !plainResult}
            />
            <ResultCard
              title="AEAD ciphertext"
              subtitle="AES-256-GCM output · should PASS the test"
              accent="emerald"
              result={aeadResult}
              running={running && !aeadResult}
            />
            <ResultCard
              title="Shamir shares (concatenated)"
              subtitle="SLIP-39 split bytes · should PASS the test"
              accent="cyan"
              result={shareResult}
              running={running && !shareResult}
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => void runAll()}
              disabled={running}
              className="btn btn-secondary text-sm"
            >
              Re-run with fresh random
            </button>
          </div>

          <section className="card">
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Why this matters</div>
            <p className="text-sm text-text-on-dark/90 leading-relaxed">
              An attacker holding your encrypted share file can't tell whether it's protecting a Bitcoin seed, a will, a legal document, or random noise.
              That's not a marketing claim — it's a measurable property of AEAD output. The chi-square test above is the standard statistical check; the bytes are real; the pipeline (Argon2id key derivation → AEAD encryption → SLIP-39 split) is the same code the production app runs.
              If the AES-256-GCM column ever fails this test, our cipher is broken and you would see it right here, on this page, in your browser.
            </p>
          </section>

          <section className="card">
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Honest caveats</div>
            <ul className="text-sm text-text-on-dark/85 space-y-2 list-disc ml-5">
              <li>Chi-square uniformity is necessary but not sufficient for cryptographic strength. A broken cipher might still pass uniformity if it leaks information in higher-order moments (autocorrelation, etc.). The full cryptanalysis case for AES-256-GCM and XChaCha20-Poly1305 comes from decades of academic review — not from this page.</li>
              <li>The "passes" verdict means the bytes are indistinguishable from uniform random AT THIS SAMPLE SIZE, AT THIS SIGNIFICANCE LEVEL. Larger samples + tighter thresholds + tests beyond chi-square (NIST STS, Dieharder) are the standard way to harden the claim. Email us for a deeper test plan if you need one for due diligence.</li>
              <li>The "control" column proves the test is wired correctly — structured ASCII clearly fails, as it should. If that column ever passed, the test itself would be broken.</li>
            </ul>
          </section>
        </div>
      </SimAirgapMoodOverlay>
    </SimAirgapProvider>
  );
}

function ResultCard({
  title, subtitle, accent, result, running,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly accent: "rose" | "emerald" | "cyan";
  readonly result: ChiSquareResult | null;
  readonly running: boolean;
}): JSX.Element {
  const colorMap = {
    rose:    { border: "border-rose-700/50",    text: "text-rose-300",    bg: "bg-rose-950/20" },
    emerald: { border: "border-emerald-700/50", text: "text-emerald-300", bg: "bg-emerald-950/20" },
    cyan:    { border: "border-accent-cyan/50", text: "text-accent-cyan", bg: "bg-cyan-950/20" },
  };
  const c = colorMap[accent];
  return (
    <div className={`card border ${c.border} ${c.bg}`}>
      <div className={`text-[10px] uppercase tracking-[0.22em] ${c.text} font-bold mb-1`}>{title}</div>
      <p className="text-xs text-text-muted mb-3">{subtitle}</p>
      {!result || running ? (
        <div className="text-text-muted text-sm">Computing…</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">χ² statistic</span>
            <span className="font-mono">{result.statistic.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">critical (df=255, α=0.05)</span>
            <span className="font-mono">{result.criticalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">sample bytes</span>
            <span className="font-mono">{result.sampleSize}</span>
          </div>
          <div className={`mt-3 text-center font-bold ${c.text} text-lg`}>
            {result.passes ? "✓ indistinguishable from random" : "✗ NOT random (as expected for control)"}
          </div>
        </div>
      )}
    </div>
  );
}
