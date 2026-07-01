// @version 0.1.0 @date 2026-05-28
// /argon — clean showcase page for the Argon2id memory-hard viz. Mirrors
// /shamir's layout: no app chrome, dark background, autoplay loop, sized
// for screen-recording into GIF/MP4 for social posts.
//
// URL params: /argon?speed=0.5&theme=emerald&controls=0

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ArgonGridViz } from "../components/ArgonGridViz.js";
import { DemoGate } from "../components/DemoGate.js";

export function ArgonShowcase(): JSX.Element {
  const [params] = useSearchParams();
  const speed = clamp(parseFloat(params.get("speed") ?? "1") || 1, 0.25, 3);
  const theme = (params.get("theme") === "emerald" ? "emerald" : "cyan") as "cyan" | "emerald";
  const showControls = params.get("controls") !== "0";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const accent = theme === "emerald" ? "#10b981" : "#22d3ee";

  return (
    <DemoGate routeName="/argon">
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
      <header style={{ padding: "22px 32px 10px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, fontWeight: 700 }}>
          How Argon2id makes brute-force impractical
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, color: "#e2e8f0" }}>
          Your password derives a master key in <span style={{ color: accent }}>~100 ms</span> on one machine —
          <span style={{ color: "#94a3b8", fontWeight: 500 }}> a million guesses needs <span style={{ color: accent }}>64 TB</span> of RAM</span>
        </div>
        <div style={{ fontSize: 12, marginTop: 6, color: "#64748b" }}>
          Memory-hard KDF used by NoKLock. The same algorithm protecting password vaults at 1Password, Bitwarden, KeePassXC.
        </div>
      </header>

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
          <ArgonGridViz
            autoPlay
            loop
            speed={speed}
            theme={theme}
            height={Math.min(580, window.innerHeight - 320)}
            showCaptions
            showControls={showControls}
            chromeless
          />
        </div>
      </div>

      <footer style={{ padding: "6px 24px 14px", textAlign: "center", color: "#64748b", fontSize: 11, flexShrink: 0 }}>
        noklock.app · self-custodial cryptographic backup · /argon
      </footer>
    </div>
    </DemoGate>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
