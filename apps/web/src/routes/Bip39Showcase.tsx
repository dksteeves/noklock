// @version 0.1.0 @date 2026-05-28
// /bip39 — clean showcase for Bip39Viz (covers gen + valid pipeline steps).

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Bip39Viz } from "../components/Bip39Viz.js";
import { DemoGate } from "../components/DemoGate.js";

export function Bip39Showcase(): JSX.Element {
  const [params] = useSearchParams();
  const speed = Math.max(0.25, Math.min(3, parseFloat(params.get("speed") ?? "1") || 1));
  const theme = (params.get("theme") === "emerald" ? "emerald" : "cyan") as "cyan" | "emerald";
  const showControls = params.get("controls") !== "0";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const accent = theme === "emerald" ? "#10b981" : "#22d3ee";

  return (
    <DemoGate routeName="/bip39">
    <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at center, #0b1220 0%, #020617 80%)", color: "#e2e8f0", display: "flex", flexDirection: "column", zIndex: 9999 }}>
      <header style={{ padding: "22px 32px 10px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, fontWeight: 700 }}>How a BIP-39 mnemonic is born</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "#e2e8f0" }}>128 bits of entropy → 12 words → checksum verified. <span style={{ color: accent }}>Universal mnemonic standard since 2013.</span></div>
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 1400, height: "100%", display: "flex", flexDirection: "column" }}>
          <Bip39Viz autoPlay loop speed={speed} theme={theme} height={Math.min(540, window.innerHeight - 320)} showCaptions showControls={showControls} chromeless />
        </div>
      </div>
      <footer style={{ padding: "6px 24px 14px", textAlign: "center", color: "#64748b", fontSize: 11, flexShrink: 0 }}>noklock.app · self-custodial cryptographic backup · /bip39</footer>
    </div>
    </DemoGate>
  );
}
