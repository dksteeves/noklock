// @version 0.3.0 @date 2026-06-04
// 0.3.0 — Daniel 2026-06-04 deep-dive refactor. Single-source via
//         useWalletGate(). Effect dep changes from (status, address) read
//         off two sources (debounced store + raw wagmi) to (gate.status,
//         gate.address) from ONE hook — wagmi's own useAccount internally.
//         Adversarial-verify concern from the deep dive: "wagmi raw status
//         briefly flips to disconnected on every mount before connector
//         finishes binding — modal could flash on every route nav". Defense
//         in this version: the effect's gate fires the modal ONLY when
//         `gate.status === "connected" && gate.address` — a transient
//         'reconnecting' state (which is what wagmi's mount-time blip maps
//         to under useWalletGate, not 'disconnected') does NOT clear or
//         re-show the modal. setShow(false) only on a real 'disconnected'
//         (first-visit / explicit disconnect) or while no address yet —
//         not on every 'reconnecting' transition.
// 0.2.0 — debounced-store gate (kept in spirit; mechanism replaced).
// 0.1.0 — Top-level wallet-connect-time Terms gate. Mounted ONCE in App.tsx.
//
// Why this lives at App-root: wallet-connect IS the "I'm about to do
// something consequential" signal in NoKLock. Every paid mint, NoK
// designation, heartbeat, escrow claim, recovery init, etc. requires a
// connected wallet — gating at connect-time covers them all with a single
// confirmation. Browsing without a wallet does NOT trigger the modal.

import { useEffect, useState } from "react";
import { TermsGateModal } from "./TermsGateModal.js";
import { readTermsAcceptance } from "../lib/termsAcceptance.js";
import { useWalletGate } from "../hooks/useWalletGate.js";

export function TermsGate(): JSX.Element | null {
  const gate = useWalletGate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only act on the FULLY-SETTLED states. 'reconnecting' is a transient
    // intermediate — don't change `show` from it (a brief reconnecting blip
    // during nav should NOT clear an already-open modal, and a transient
    // reconnecting state on cold load should NOT re-open the modal after
    // user already accepted).
    if (gate.status === "reconnecting") return;

    if (gate.status === "connected" && gate.address) {
      const accepted = readTermsAcceptance();
      setShow(!accepted);
      return;
    }

    // Disconnected — first-visit or explicit disconnect. No address, no
    // modal.
    setShow(false);
  }, [gate.status, gate.address]);

  if (!show || !gate.address) return null;
  return <TermsGateModal walletAddress={gate.address} onAccept={() => setShow(false)} />;
}
