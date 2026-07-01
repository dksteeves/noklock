// @version 0.2.0 @date 2026-05-28
// 0.2.0 — Daniel: container was squished top + bottom. Full rewrite for a
//         proper full-bleed recording surface: the SVG sizes to viewport
//         minus the header strip, not to a fixed 460. Chrome-less viz mode
//         disables the outer card padding so the SVG fills cleanly.
//
// /shamir — clean showcase page for the Shamir polynomial viz. No app
// chrome, no navigation, dark background, autoplay loop. Designed so
// Daniel can screen-record (OBS / Loom / iOS native / Chrome record) and
// export a GIF / MP4 for social posts without any UI bleed.
//
// URL params let recordings cycle variants without code changes:
//   /shamir?n=5&k=3&secret=42&speed=0.5&theme=cyan&kind=seed&controls=0

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShamirPolyViz, type ShamirContentKind } from "../components/ShamirPolyViz.js";
import { DemoGate } from "../components/DemoGate.js";

export function ShamirShowcase(): JSX.Element {
  const [params] = useSearchParams();
  const n = clamp(parseInt(params.get("n") ?? "5", 10) || 5, 3, 9);
  const k = clamp(parseInt(params.get("k") ?? "3", 10) || 3, 2, n);
  const secret = clamp(parseInt(params.get("secret") ?? "73", 10) || 73, 5, 95);
  const speed = clamp(parseFloat(params.get("speed") ?? "1") || 1, 0.25, 3);
  const theme = (params.get("theme") === "emerald" ? "emerald" : "cyan") as "cyan" | "emerald";
  const kindParam = (params.get("kind") ?? "seed").toLowerCase();
  const kind: ShamirContentKind = (
    ["seed", "letter", "image", "document", "noise"].includes(kindParam) ? kindParam : "seed"
  ) as ShamirContentKind;
  const showControls = params.get("controls") !== "0";
  const showPresetPicker = params.get("presets") !== "0";

  // Lock body scroll on this route so the captured frame is always the
  // same — no accidental scroll on screen-record.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const accent = theme === "emerald" ? "#10b981" : "#22d3ee";

  return (
    <DemoGate routeName="/shamir">
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, #0b1220 0%, #020617 80%)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Top header strip — title + sub. Compact so the viz gets the room.
          Daniel: the honest framing is K-of-N shares PLUS your password/
          passkey + connected wallet — Shamir is one factor, not all three. */}
      <header style={{ padding: "22px 32px 10px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, fontWeight: 700 }}>
          How Shamir secret sharing actually works
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "#e2e8f0" }}>
          Any <span style={{ color: accent }}>{k}</span> of <span style={{ color: accent }}>{n}</span> shares <span style={{ color: "#94a3b8", fontWeight: 500 }}>+ your password/passkey + connected wallet</span> unlock your vault. Any <span style={{ color: accent }}>{k - 1}</span> shares reveal nothing.
        </div>
        <div style={{ fontSize: 12, marginTop: 6, color: "#64748b" }}>
          One of three factors in NoKLock — this animation focuses on the share-threshold math. Password + wallet are independent layers shown elsewhere.
        </div>
      </header>

      {/* Viz fills the rest of the viewport */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "12px 24px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, height: "100%", display: "flex", flexDirection: "column" }}>
          <ShamirPolyViz
            secret={secret}
            n={n}
            k={k}
            autoPlay
            loop
            speed={speed}
            contentKind={kind}
            theme={theme}
            height={Math.min(620, window.innerHeight - 340)}
            showCaptions
            showLegend
            showControls={showControls}
            showPresetPicker={showPresetPicker}
            chromeless
          />
        </div>
      </div>

      {/* Footer credit (small, off the recording frame if you crop it) */}
      <footer style={{ padding: "6px 24px 14px", textAlign: "center", color: "#64748b", fontSize: 11, flexShrink: 0 }}>
        noklock.app · self-custodial cryptographic backup · /shamir
      </footer>
    </div>
    </DemoGate>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
