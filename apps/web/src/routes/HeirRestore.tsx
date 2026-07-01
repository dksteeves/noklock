// @version 0.7.0 @date 2026-06-11
// 0.7.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.9): deleted
//         the separate reconnecting article; the not-connected condition is now
//         `gate.status !== "connected"`. Flag-OFF connect card → shared
//         <WalletGateCard/>; the flag-ON chooser keeps its inline ConnectWallet
//         (one chooser surface, not a second dialog).
// @version 0.6.0 @date 2026-06-05
// 0.6.0 — Daniel 2026-06-05: Migrate off useWalletSettling shim onto
//          useWalletGate directly. The boolean `reconnecting` check is
//          replaced with `gate.status` tri-state: a 'reconnecting' read
//          now renders an INLINE "Reconnecting your wallet…" card under
//          the page chrome (h1 + 8-step strip) instead of replacing the
//          whole wallet slot with <WalletReconnecting/>. The disconnected
//          branch keeps the existing self-custody / managed chooser. The
//          page chrome is preserved across all three gate states so the
//          heir sees the route they navigated to.
// 0.5.1 — Daniel 2026-06-02: ManagedHeirSignin import converted to flag-gated
//          React.lazy() so flag-off bundles tree-shake the managed-mode chunk
//          entirely (addresses adversarial-review finding that bundle was not
//          strictly byte-identical when flag off).
// 0.5.0 — Daniel 2026-06-02: MANAGED-MODE SIGNIN CHOOSER (NL-1 §3.1).
//          When VITE_MANAGED_WALLET_ENABLED === "true" AND the heir has
//          not yet connected a wallet, the page renders a chooser at the
//          TOP of the flow:
//            [Connect existing wallet] [Sign in with email (managed)]
//          The "managed" branch mounts <ManagedHeirSignin/>, which drives
//          Privy login + provisions an embedded EOA + forces the heir
//          through the mandatory <KeyExportCeremony/>. After the ceremony
//          completes the chosen address is exposed via onReady() and
//          stashed in local state; the downstream heir flow (quorum vote,
//          master password, restore) is identical regardless of which
//          wallet kind was chosen — both end up signing EIP-712 and
//          receiving the SBT mint.
//          When the flag is off, the chooser is hidden entirely (dead
//          code at build time via the inline flag check) and the page
//          renders the existing connect-wallet path UNCHANGED.
//          The downstream flow is byte-identical for both wallet kinds:
//          wagmi's `useAccount` reads any externally connected wallet
//          (self-custody path) while `managedAddress` shadow-tracks the
//          Privy embedded EOA address so EIP-712 + SBT mint can target
//          whichever address the heir picked. The `effectiveAddress`
//          local helper resolves to whichever is live.
// 0.4.0 — Daniel 2026-06-01: HONEST FLOW STRIP — adds a top-of-page step
//          strip with explicit Go-offline step + per-card online/offline
//          phase indicators (parity with /restore 0.14.0). Previously the
//          page rendered only "Step N — …" section headers and the
//          new airgap engagement card (added in 0.3.0) was visually a
//          sibling of the other section headers — the strip itself did
//          not exist, so the online→offline boundary was only legible
//          from the section ordering.
//          New strip (8 steps):
//            1 Envelope        (online)
//            2 Collect         (online)
//            3 Vote            (online)
//            4 Wait quorum     (online)
//            5 Go offline      (boundary)
//            6 Unlock          (offline)
//            7 Decrypt+combine (offline)
//            8 Recovered       (offline)
//          The Go-offline step sits AFTER the heir has gathered shares
//          + cast their vote + the quorum attestation has been issued,
//          and BEFORE the master-password unlock. Same engagement flow
//          (enterAirgap + setPhase("ready-restore-passkey")), the strip
//          is just honest about it. No structural change to the
//          underlying Phase machine.
// 0.3.0 — Daniel 2026-06-01: EXPLICIT AIRGAP STEP — parity with /enrol +
//          parity with /restore 0.13.0. Previously `airgapForUnlock()`
//          engaged the airgap SILENTLY when the heir clicked Restore
//          (no user awareness of the "going offline now" moment). The
//          heir-side path matters MORE here: the heir is often a non-
//          technical user on someone else's laptop. They deserve the
//          same deliberate "Go offline now" moment that /enrol gives
//          the original owner.
//
//          New phase `airgap-step` inserted between `ready-restore`
//          (quorum met, attestation in hand) and the master-password
//          card. The new step is a card with:
//            - "Go offline now" title (same copy as /enrol).
//            - Live `isBrowserOnline()` reading subscribed to window
//              online/offline events.
//            - Live `blockedFetchCount()` counter subscribed via
//              `subscribeAirgap()`.
//            - Primary "I am offline — engage airgap" button gated on
//              `isBrowserOnline() === false`.
//            - Secondary "Skip physical disconnect — engage software
//              airgap only" button for users who cannot disconnect.
//            - Both call `enterAirgap()` and advance to
//              `ready-restore-passkey`.
//
//          The master-password + Restore button now lives behind the
//          new phase `ready-restore-passkey`. The legacy
//          `airgapForUnlock()` remains as a defensive no-op safety net
//          inside reconstruct(), but the PRIMARY engagement path is now
//          the explicit user action.
// 0.2.0 — Daniel 2026-06-01: G2-F-8 custody-handoff ceremony (heir mode only).
//          The RestoredPanel now drives a 4-state ceremony machine —
//          `revealing → confirmed → verified → cleared` — so a grieving heir
//          on someone else's laptop can't silently lose the recovery by
//          tabbing away after a single press-and-hold reveal.
//
//          State ladder:
//            revealing  — initial; press-and-hold reveal of bip39 / letter.
//                         No "Done" button; the only forward action is the
//                         "I have written this down on paper / a clean
//                         device" checkbox.
//            confirmed  — checkbox ticked; ceremony reveals a verification
//                         input (first + last word for bip39 and text-kind
//                         sealed-letters; "I have downloaded and saved
//                         this file" gate for binary documents).
//            verified   — user proved custody → setOutput(null) wipes the
//                         in-memory plaintext, transitions to `cleared`.
//            cleared    — green "You're done" panel: "the seed is gone
//                         from this browser; refresh to clear memory."
//
//          Owner self-restore at `/restore` is intentionally NOT touched
//          (per execution plan G2-F-8 §5 "Owner self-restore preservation"
//          — ceremony stays mandatory on `/heir/restore` only). The
//          Restore.tsx route remains at 0.12.0; only this file moves.
//
//          Mirror coverage for the three RestoreOutput.kind branches:
//            bip39          — first + last mnemonic word (lowercase-strict,
//                             trim whitespace).
//            sealed-letter  — text/markdown/html branch: first + last word
//                             of the decoded text (HTML stripped of tags
//                             before word split). Non-text (binary upload)
//                             branch: download-acknowledged gate.
//            document       — binary; download-acknowledged gate.
//
//          On `cleared`, the parent's `onCleared` callback nulls the
//          stored `output`, restores `phase` headroom (stays "done"), and
//          stops the press-and-hold tear-down hazard.
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.4 [mofn-restore-quorum-fix-plan §D.4].
//          Heir-side restore flow. Forces `heirMode=true` into the restore
//          pipeline; refuses to unlock unless the dropped manifest's
//          `quorumPolicy` (if any) is satisfied by a Form-B-signed
//          `QuorumReleaseAttestation` recovered from at least K heir votes.
//
//          Owner-restore at `/restore` stays byte-identical to today.
//          Discriminator: this route always sets `heirMode: true` on the
//          pipeline call. The pipeline's `assertQuorumOrOwnerMode` no-ops
//          when the manifest carries no `quorumPolicy` (legacy / Free /
//          pre-2026-06 vaults) so existing heirs aren't trapped.
//
//          Step ladder (matches plan §D.4):
//            1. Drop `claim-envelope.json` — validate self-signature.
//            2. Drop manifest.json + share files (or paste share URLs).
//            3. Show QuorumStatus strip (votes seen / votes needed).
//            4. Cast vote (sign EIP-712 QuorumRelease, POST to Form B).
//            5. Poll until `quorumMet`.
//            6. Fetch release attestation.
//            7. Type master password.
//            8. Restore button → runRestorePipeline({ heirMode: true,
//                                                     quorumProof: { ... } }).
//
//          The success render reuses Restore.tsx's `RestoredPanel` (same
//          press-and-hold reveal, same download buttons, same kind-aware
//          branching) — there is no UI parity gap with the owner path
//          once the gate is passed.

import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAccount, useSignTypedData, usePublicClient } from "wagmi";
import type { Hex, Address } from "viem";
import type { VaultManifest } from "@soulchain/crypto-core";
import { manifest as manifestLib } from "@soulchain/crypto-core";
import { ShareUrlAdapter, normaliseShareUrl } from "@soulchain/storage-adapters";
import {
  parseShareJson,
  parseManifestJson,
  runRestorePipeline,
  type ParsedShare,
  type RestoreOutput,
} from "../lib/restore-pipeline.js";
import { MaskedSecret } from "../components/MaskedSecret.js";
import { RichTextView } from "../components/RichTextView.js";
import { ConnectWallet } from "../components/ConnectWallet.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { QuorumStatus } from "../components/QuorumStatus.js";
import {
  parseClaimEnvelope,
  verifyClaimEnvelope,
  type HeirClaimEnvelope,
} from "../lib/heir-claim-envelope.js";
import { castVote, getReleaseAttestation, type ReleaseAttestation } from "../lib/quorum-client.js";
import {
  buildLocalReleaseTypedData,
  deriveLocalReleaseNonce,
  makeVotingHolderReader,
  serializeHeirSignature,
  parseHeirSignatures,
  LOCAL_RELEASE_FIXED_EXPIRY,
  type LocalHeirSignature,
} from "../lib/quorum-local.js";
import { SBT_ADDR } from "../lib/contracts.js";
import { trackEventDurable } from "../lib/track.js";
import {
  enterAirgap,
  leaveAirgap,
  isAirgapped,
  runOnline,
  isBrowserOnline,
  blockedFetchCount,
  subscribeAirgap,
} from "../lib/airgap-manager.js";
// 0.5.0 — Inline managed-wallet flag (matches ManagedWalletProvider pattern
// so Vite/Rollup proves the flag-off branches unreachable and tree-shakes
// the Privy SDK + ManagedHeirSignin chunk entirely).
const MANAGED_WALLET_ENABLED_INLINE: boolean =
  import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true";

// 0.5.1 — Flag-gated React.lazy() so when the flag is OFF the conditional
// evaluates to literal `null` at build time and Rollup DCEs the lazy()
// call + the dynamic import("../components/ManagedHeirSignin.js") chunk
// entirely. Result: flag-off bundle is byte-identical to 0.4.x (modulo
// the Provider Fragment fiber which is unavoidable).
const ManagedHeirSignin = MANAGED_WALLET_ENABLED_INLINE
  ? lazy(() =>
      import("../components/ManagedHeirSignin.js").then((m) => ({
        default: m.ManagedHeirSignin,
      })),
    )
  : null;

// C-11 (pressure-test 2026-06-10): this domain + types MUST be byte-identical
// to the server's VOTE_DOMAIN / VOTE_TYPES (server-form-b quorum.ts:666-686) or
// recoverTypedDataAddress on the server yields a different address than `voter`
// and every heir vote is rejected 401 — permanently bricking M-of-N restore.
// The PWA previously signed name:"NoKLock" with 4 fields; the server expects
// name:"NoKLockQuorum" + verifyingContract + the M/N quorum-policy fields.
const QUORUM_DOMAIN = {
  name: "NoKLockQuorum",
  version: "1",
  chainId: 137,
  verifyingContract: "0x0000000000000000000000000000000000000000",
} as const;

const VOTE_TYPES = {
  QuorumRelease: [
    { name: "vaultId", type: "bytes32" },
    { name: "manifestHash", type: "bytes32" },
    { name: "releaseEpoch", type: "uint64" },
    { name: "M", type: "uint8" },
    { name: "N", type: "uint8" },
    { name: "voter", type: "address" },
  ],
} as const;

type Phase =
  | "envelope"               // 1: waiting for claim-envelope drop
  | "ready-collect"          // 2: envelope verified; gather manifest + shares
  | "vote"                   // 3-4: cast vote
  | "waiting-quorum"         // 5: poll until quorumMet
  | "ready-restore"          // 6: have attestation; ready to engage airgap
  | "ready-restore-passkey"  // 7 (0.3.0): airgap engaged; show master password
  | "done";                  // 8: restored

function bytesToHexLocal(bytes: Uint8Array): Hex {
  let out = "0x";
  for (let i = 0; i < bytes.length; i++) out += bytes[i]!.toString(16).padStart(2, "0");
  return out as Hex;
}

// 0.4.0 — Honest 8-step flow strip with explicit Go-offline boundary.
//   online   = step happens while connected (1-4 — envelope drop +
//              share gather + voting + waiting for quorum, all of
//              which need Form B reachable).
//   boundary = the explicit transition from online to offline (step 5).
//   offline  = step happens after airgap is engaged (6-8).
type HeirStepPhase = "online" | "boundary" | "offline";
const HEIR_STEPS: readonly { n: number; label: string; sub: string; phase: HeirStepPhase }[] = [
  { n: 1, label: "Envelope", sub: "drop your signed claim envelope", phase: "online" },
  { n: 2, label: "Collect", sub: "manifest.json + share files (or URLs)", phase: "online" },
  { n: 3, label: "Vote", sub: "sign your release vote with your heir wallet", phase: "online" },
  { n: 4, label: "Wait quorum", sub: "wait for M-of-N heirs to vote", phase: "online" },
  { n: 5, label: "Go offline", sub: "engage airgap, disconnect Wi-Fi", phase: "boundary" },
  { n: 6, label: "Unlock", sub: "master password (Argon2id)", phase: "offline" },
  { n: 7, label: "Decrypt + combine", sub: "AEAD-decrypt + Shamir combine", phase: "offline" },
  { n: 8, label: "Recovered", sub: "seed / letter / document — local only", phase: "offline" },
];

function HeirPhaseIndicator({ phase }: { readonly phase: HeirStepPhase }): JSX.Element {
  if (phase === "online") {
    return (
      <span
        title="Online phase — runs before airgap is engaged"
        className="inline-flex items-center gap-1 text-[10px] font-mono"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-emerald-300">online</span>
      </span>
    );
  }
  if (phase === "offline") {
    return (
      <span
        title="Offline phase — runs after airgap is engaged"
        className="inline-flex items-center gap-1 text-[10px] font-mono"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden />
        <span className="text-amber-300">offline</span>
      </span>
    );
  }
  return (
    <span
      title="Boundary — engaging the airgap (crossing from online to offline)"
      className="inline-flex items-center gap-1 text-[10px] font-mono"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
      <span aria-hidden className="text-text-on-dark/80">→</span>
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden />
    </span>
  );
}

function HeirFlowStrip({ activeN }: { readonly activeN: number }): JSX.Element {
  return (
    <ol className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {HEIR_STEPS.map((s) => {
        const isActive = activeN === s.n;
        const isDimmed = !isActive;
        const cls = `rounded-lg border p-2 flex flex-col transition-colors ${
          isActive
            ? "grad-bg text-text-primary border-transparent"
            : isDimmed
            ? "bg-bg-surface/40 border-bg-surface text-text-on-dark/60"
            : "border-bg-surface bg-bg-deepest text-text-on-dark"
        }`;
        return (
          <li key={s.n} className={cls}>
            <div className="flex items-center justify-between gap-1">
              <span className="grad-bg text-text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">{s.n}</span>
              <HeirPhaseIndicator phase={s.phase} />
            </div>
            <span className={`font-display font-bold text-[12px] leading-tight mt-1 ${isActive ? "text-text-primary" : "text-text-on-dark"}`}>{s.label}</span>
            <p className={`text-[10px] mt-1 leading-snug ${isActive ? "text-text-primary/85" : "text-text-muted"}`}>{s.sub}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** 0.4.0 — Map the existing Phase machine to the 8-step strip number. */
function heirActiveStep(phase: Phase, voteSent: boolean, hasOutput: boolean): number {
  if (hasOutput) return 8;
  if (phase === "envelope") return 1;
  if (phase === "ready-collect") return 2;
  if (phase === "vote") return voteSent ? 4 : 3;
  if (phase === "waiting-quorum") return 4;
  if (phase === "ready-restore") return 5;
  if (phase === "ready-restore-passkey") return 6;
  if (phase === "done") return 8;
  return 1;
}

export function HeirRestore(): JSX.Element {
  const { address, isConnected } = useAccount();
  const gate = useWalletGate();
  const { signTypedDataAsync } = useSignTypedData();
  // B-2 — public client for the on-chain Voting-holder read in the local
  // (Form-B-independent) heir-quorum path. Polygon read only; no seed exposure.
  const publicClient = usePublicClient();

  const [phase, setPhase] = useState<Phase>("envelope");
  const [envelope, setEnvelope] = useState<HeirClaimEnvelope | null>(null);
  const [envelopeError, setEnvelopeError] = useState<string | null>(null);
  const [manifests, setManifests] = useState<readonly VaultManifest[]>([]);
  const [shares, setShares] = useState<readonly ParsedShare[]>([]);
  const [passkey, setPasskey] = useState("");
  const [output, setOutput] = useState<RestoreOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);
  const [attestation, setAttestation] = useState<ReleaseAttestation | null>(null);
  const [manifestHashHex, setManifestHashHex] = useState<Hex | null>(null);
  const [voteSent, setVoteSent] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  // B-2 — Form-B-INDEPENDENT local heir quorum. `localSigs` accumulates M
  // distinct heir signatures over the deterministic QuorumLocalRelease tuple
  // (nonce + expiry derived from the manifest, so heirs need no coordination).
  // When >= M are collected, the restore can proceed with NO Form B in the
  // loop — verified on-chain against Voting-role SBT holders.
  const [localOpen, setLocalOpen] = useState(false);
  const [localSigs, setLocalSigs] = useState<readonly LocalHeirSignature[]>([]);
  const [localPaste, setLocalPaste] = useState("");
  const [localBusy, setLocalBusy] = useState(false);
  const [myLocalBlob, setMyLocalBlob] = useState<string | null>(null);
  const [localNote, setLocalNote] = useState<string | null>(null);
  // Lowercased signer addresses confirmed on-chain (Voting holders for this
  // vault). Computed ONLINE before the airgap so the decrypt-time pipeline can
  // verify from the cache with no network — exactly like the Form-B attestation
  // is fetched before going offline.
  const [localVerified, setLocalVerified] = useState<ReadonlySet<string> | null>(null);

  // 0.5.0 — Managed-mode signin state. Tracks the heir's choice between
  // self-custody (existing wagmi connect) and managed (Privy embedded
  // wallet). Both code paths end with an address that signs the EIP-712
  // vote and receives the Activation SBT — the difference is purely the
  // signing surface (browser wallet extension vs Privy hosted modal).
  //   `walletChoice`     — null = user hasn't picked yet; "self" = wagmi
  //                        path; "managed" = Privy path. Only meaningful
  //                        when MANAGED_WALLET_ENABLED_INLINE === true.
  //   `managedAddress`   — set once <ManagedHeirSignin/> fires onReady()
  //                        with the Privy embedded EOA.
  // When the flag is off, both stay at their initial values and the
  // chooser is never rendered — the page behaves byte-identically to
  // 0.4.0.
  const [walletChoice, setWalletChoice] = useState<null | "self" | "managed">(null);
  const [managedAddress, setManagedAddress] = useState<Address | null>(null);

  // 0.3.0 — Live online / blocked-fetch state for the explicit airgap
  // step (parity with /enrol + /restore 0.13.0). isBrowserOnline() alone
  // is read in render and would otherwise go stale — the "engage airgap"
  // button needs to react instantly when the heir disconnects Wi-Fi.
  const [online, setOnline] = useState<boolean>(() => isBrowserOnline());
  useEffect(() => {
    const update = (): void => setOnline(isBrowserOnline());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  const [blockedCount, setBlockedCount] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeAirgap(() => setBlockedCount(blockedFetchCount()));
    return () => { unsubscribe(); };
  }, []);

  /** 0.3.0 — Explicit engage handler used by both engage buttons. Mirrors
   *  /restore 0.13.0 + /enrol 1.0.2 — a deliberate user click, not a
   *  silent unlock-time engagement. */
  function engageAirgapAndAdvance(): void {
    if (!isAirgapped()) enterAirgap();
    setPhase("ready-restore-passkey");
  }

  const wasAirgappedAtMountRef = useRef<boolean>(isAirgapped());
  useEffect(() => {
    return () => {
      if (!wasAirgappedAtMountRef.current && isAirgapped()) {
        leaveAirgap();
      }
      try {
        if (output && (output.kind === "sealed-letter" || output.kind === "document") && output.content?.fill) {
          output.content.fill(0);
        }
      } catch { /* already wiped or gone */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Engage airgap just before the pipeline runs (offline reassembly). */
  const airgapForUnlock = (): void => {
    if (!isAirgapped()) enterAirgap();
  };

  // -------------------------------------------------------------------
  // Step 1 — envelope drop
  // -------------------------------------------------------------------

  async function handleEnvelopeFile(file: File): Promise<void> {
    setEnvelopeError(null);
    try {
      const text = await file.text();
      const parsed = parseClaimEnvelope(text);
      if ("error" in parsed) {
        setEnvelopeError(parsed.error);
        return;
      }
      const ok = await verifyClaimEnvelope(parsed);
      if (!ok) {
        setEnvelopeError("claim-envelope signature does not recover to embedded heirWallet — refusing.");
        return;
      }
      setEnvelope(parsed);
      setPhase("ready-collect");
    } catch (e) {
      setEnvelopeError((e as Error).message);
    }
  }

  const onEnvelopeDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      void handleEnvelopeFile(e.dataTransfer.files[0]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------
  // Steps 2–7 — manifest + share collection + master password
  // -------------------------------------------------------------------

  const handleFiles = useCallback(async (files: FileList | File[]): Promise<void> => {
    setError(null);
    const arr = Array.from(files);
    const newShares: ParsedShare[] = [...shares];
    const newManifests: VaultManifest[] = [...manifests];

    for (const f of arr) {
      try {
        const text = await f.text();
        if (f.name === "manifest.json" || /manifest/i.test(f.name)) {
          const m = parseManifestJson(text);
          if (!newManifests.find((x) => x.vaultId === m.vaultId)) newManifests.push(m);
        } else {
          const share = parseShareJson(text);
          if (!newShares.find((s) => s.index === share.index && s.vaultId === share.vaultId)) {
            newShares.push(share);
          }
        }
      } catch (e) {
        setError(`Failed to parse ${f.name}: ${(e as Error).message}`);
      }
    }
    setManifests(newManifests);
    setShares(newShares);
  }, [manifests, shares]);

  const onCollectDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const onCollectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFiles(e.target.files);
      e.target.value = "";
    }
  }, [handleFiles]);

  async function fetchFromUrl(): Promise<void> {
    const url = urlInput.trim();
    if (!url) return;
    const normalised = normaliseShareUrl(url);
    if (!normalised) {
      setError("URL not recognised, or provider needs manual download — download the file in your browser then drop it above.");
      return;
    }
    setError(null);
    setUrlBusy(true);
    try {
      const adapter = new ShareUrlAdapter();
      const bytes = await adapter.get({ pathOrId: url });
      if (!bytes) {
        setError(`Empty response from ${normalised.provider}`);
        return;
      }
      const text = new TextDecoder().decode(bytes);
      try {
        const obj = JSON.parse(text) as Record<string, unknown>;
        if (obj["soulchain"] === "share/v1") {
          const share = parseShareJson(text);
          if (!shares.find((s) => s.index === share.index && s.vaultId === share.vaultId)) {
            setShares([...shares, share]);
          }
        } else if (obj["version"] !== undefined && obj["shamir"] !== undefined) {
          const m = parseManifestJson(text);
          if (!manifests.find((x) => x.vaultId === m.vaultId)) setManifests([...manifests, m]);
        } else {
          setError("Fetched URL but content is neither a share file nor a manifest.");
        }
      } catch {
        setError("Fetched URL but couldn't parse as JSON.");
      }
      setUrlInput("");
    } catch (e) {
      setError(`Fetch failed: ${(e as Error).message}`);
    } finally {
      setUrlBusy(false);
    }
  }

  /** Locate the manifest that matches the dropped envelope (by vaultId). */
  const matchedManifest: VaultManifest | null = (() => {
    if (!envelope) return null;
    const lower = envelope.vaultId.toLowerCase();
    return manifests.find((m) => `0x${m.vaultId}`.toLowerCase() === lower || m.vaultId.toLowerCase() === lower) ?? null;
  })();

  // Derive manifestHash hex when we have a matched manifest.
  useEffect(() => {
    if (!matchedManifest) { setManifestHashHex(null); return; }
    try {
      const hashBytes = manifestLib.manifestHash(matchedManifest);
      setManifestHashHex(bytesToHexLocal(hashBytes));
    } catch {
      setManifestHashHex(null);
    }
  }, [matchedManifest]);

  // -------------------------------------------------------------------
  // Step 4 — cast vote
  // -------------------------------------------------------------------

  async function castMyVote(): Promise<void> {
    if (!envelope) { setError("Drop your claim-envelope.json first."); return; }
    if (!matchedManifest) { setError("Drop the matching manifest.json first."); return; }
    if (!manifestHashHex) { setError("Couldn't derive manifest hash."); return; }
    if (!address) { setError("Connect your heir wallet first."); return; }
    setError(null);
    setBusy(true);
    try {
      // H-37 (pressure-test 2026-06-10): heirs vote ASYNCHRONOUSLY — often days
      // apart for a real inheritance. A per-second Date.now() epoch put every
      // vote in its own release_epoch bucket, so the server's M-of-N aggregation
      // (GROUP BY ... WHERE release_epoch = ?) never saw two votes together and
      // quorum was never met. The dead-man fires exactly ONCE per wallet
      // (NoKLockOracle.performUpkeep latches AlreadyFired forever), so there is
      // no "second firing cycle" to fence off — a single fixed epoch per
      // (vault, manifest) is safe and is the only way async heirs can share one
      // bucket. Re-enrolment yields a new manifestHash → naturally a new bucket.
      const releaseEpoch = 0; // fixed shared bucket — every heir + the attestation use 0
      const policy = matchedManifest.quorumPolicy;
      if (!policy) { setError("This vault has no quorum policy."); setBusy(false); return; }
      const sig = await signTypedDataAsync({
        domain: QUORUM_DOMAIN,
        types: VOTE_TYPES,
        primaryType: "QuorumRelease",
        message: {
          vaultId: envelope.vaultId,
          manifestHash: manifestHashHex,
          releaseEpoch: BigInt(releaseEpoch),
          M: policy.M,
          N: policy.N,
          voter: address,
        },
      });
      // runOnline: this pre-decrypt vote submission needs the network and
      // exposes no seed — must not be blocked by a leftover tab-wide airgap.
      const result = await runOnline(() => castVote({
        vaultId: envelope.vaultId,
        manifestHash: manifestHashHex,
        releaseEpoch,
        M: policy.M,
        N: policy.N,
        voter: address as Address,
        signature: sig,
      }));
      if (!result.ok) {
        setError(`Vote rejected: ${result.message}`);
        return;
      }
      setVoteSent(true);
      setPhase("waiting-quorum");
    } catch (e) {
      setError((e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  // -------------------------------------------------------------------
  // B-2 — local (Form-B-INDEPENDENT) heir quorum
  // -------------------------------------------------------------------
  // M distinct heir wallets each sign the SAME deterministic
  // QuorumLocalRelease tuple (nonce + expiry derived from the manifest, so no
  // coordination is needed). The restore then verifies the signatures + that
  // each signer holds a Voting-role SBT on-chain — NO Form B, no attestor key.
  // The disappearance-test fix: a quorum vault stays restorable even if NoKLock
  // has vanished.

  /** Merge signatures into the local set, de-duped by signer (one wallet = one
   *  vote — the same rule the pipeline enforces). Any change invalidates the
   *  cached on-chain verification. */
  function mergeLocalSigs(incoming: readonly LocalHeirSignature[]): void {
    setLocalSigs((prev) => {
      const byKey = new Map(prev.map((s) => [s.signer.toLowerCase(), s]));
      for (const s of incoming) byKey.set(s.signer.toLowerCase(), s);
      return Array.from(byKey.values());
    });
    setLocalVerified(null); // set changed → re-verify on-chain
  }

  /** This heir signs the deterministic QuorumLocalRelease with their connected
   *  wallet, appends it to the local set, and surfaces an exportable blob to
   *  hand to the heir running the restore. */
  async function signLocally(): Promise<void> {
    if (!envelope) { setError("Drop your claim-envelope.json first."); return; }
    if (!matchedManifest?.quorumPolicy) { setError("This vault has no quorum policy."); return; }
    if (!manifestHashHex) { setError("Couldn't derive manifest hash."); return; }
    if (!address) { setError("Connect your heir wallet first."); return; }
    setError(null);
    setLocalBusy(true);
    try {
      const policy = matchedManifest.quorumPolicy;
      const nonce = deriveLocalReleaseNonce(envelope.vaultId, manifestHashHex);
      const signature = await signTypedDataAsync(
        buildLocalReleaseTypedData({
          vaultId: envelope.vaultId,
          manifestHash: manifestHashHex,
          M: policy.M,
          N: policy.N,
          expiresAt: LOCAL_RELEASE_FIXED_EXPIRY,
          nonce,
        }),
      );
      const mine: LocalHeirSignature = { signer: address as Address, signature: signature as Hex };
      setMyLocalBlob(serializeHeirSignature(mine));
      mergeLocalSigs([mine]);
      setLocalNote("Your signature was added. Send the blob below to the heir running the restore (or paste theirs here).");
    } catch (e) {
      setError((e as Error).message ?? String(e));
    } finally {
      setLocalBusy(false);
    }
  }

  /** Import other heirs' pasted signature blob(s) — a single object or a JSON
   *  array; malformed entries are skipped. */
  function importLocalPaste(): void {
    setError(null);
    try {
      const parsed = parseHeirSignatures(localPaste);
      if (parsed.length === 0) { setLocalNote("No valid signatures found in that paste."); return; }
      mergeLocalSigs(parsed);
      setLocalPaste("");
      setLocalNote(`Imported ${parsed.length} signature(s).`);
    } catch (e) {
      setError(`Couldn't parse pasted signatures: ${(e as Error).message}`);
    }
  }

  /** Verify, ONLINE (before the airgap), that each collected signer holds a
   *  Voting-role SBT for this vault on-chain. Caches the verified set so the
   *  airgapped decrypt can check from memory with no network. */
  async function verifyLocalOnChain(): Promise<void> {
    if (!envelope || !matchedManifest?.quorumPolicy) return;
    if (!publicClient) { setError("No Polygon connection — reconnect to verify heir signatures on-chain."); return; }
    if (localSigs.length === 0) { setLocalNote("Collect at least one heir signature first."); return; }
    setError(null);
    setLocalBusy(true);
    try {
      const reader = makeVotingHolderReader(publicClient, SBT_ADDR);
      const verified = new Set<string>();
      for (const s of localSigs) {
        const ok = await runOnline(() => reader(envelope.vaultId, s.signer));
        if (ok) verified.add(s.signer.toLowerCase());
      }
      setLocalVerified(verified);
      const M = matchedManifest.quorumPolicy.M;
      setLocalNote(
        verified.size >= M
          ? `✓ ${verified.size} of ${M} required heir signatures verified as on-chain Voting holders — you can go offline and restore.`
          : `Only ${verified.size} of ${M} signatures are on-chain Voting holders. Collect more heir signatures.`,
      );
    } catch (e) {
      setError(`On-chain verification failed: ${(e as Error).message}`);
    } finally {
      setLocalBusy(false);
    }
  }

  // -------------------------------------------------------------------
  // Step 5–6 — poll for attestation
  // -------------------------------------------------------------------

  async function tryFetchAttestation(): Promise<void> {
    if (!envelope || !manifestHashHex || !matchedManifest) return;
    const policy = matchedManifest.quorumPolicy;
    if (!policy) return;
    try {
      const att = await runOnline(() => getReleaseAttestation({
        vaultId: envelope.vaultId,
        manifestHash: manifestHashHex,
        M: policy.M,
        N: policy.N,
      }));
      if (att) {
        setAttestation(att);
        setPhase("ready-restore");
      }
    } catch (e) {
      setError(`Couldn't fetch release attestation: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    if (phase !== "waiting-quorum") return;
    void tryFetchAttestation();
    const id = window.setInterval(() => { void tryFetchAttestation(); }, 15000);
    return () => { window.clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, manifestHashHex, envelope, matchedManifest]);

  // -------------------------------------------------------------------
  // Step 8 — restore
  // -------------------------------------------------------------------

  async function reconstruct(): Promise<void> {
    if (!envelope) { setError("Drop your claim-envelope.json first."); return; }
    if (!matchedManifest) { setError("Drop the matching manifest.json first."); return; }
    if (passkey.length < 1) { setError("Enter the master password the original owner shared with you."); return; }
    const policy = matchedManifest.quorumPolicy;
    // B-2 — local heir quorum is an accepted alternative to the Form-B
    // attestation, but ONLY once the signers have been verified on-chain
    // (online, before the airgap) so the decrypt-time check needs no network.
    const localReady =
      !!policy && !!localVerified && localVerified.size >= policy.M && localSigs.length >= policy.M;
    if (policy && !attestation && !localReady) {
      setError(
        `Heir restore needs EITHER the Form B quorum attestation (wait for heirs to vote) OR ${policy.M} on-chain-verified local heir signatures (open “Form B unavailable?” below — ${localVerified?.size ?? 0}/${policy.M} verified).`,
      );
      return;
    }
    setError(null);
    setBusy(true);
    airgapForUnlock();
    try {
      const quorumProof = attestation
        ? {
            attestation: attestation.signature,
            signer: attestation.signer,
            expiresAt: attestation.expiresAt,
            nonce: attestation.nonce,
          }
        : undefined;
      // B-2 local path — only when there is no Form-B attestation. The
      // signatures were already on-chain-verified into `localVerified` while
      // online, so the reader here is a pure in-memory set lookup (no network
      // during the airgapped decrypt). The pipeline still re-recovers each
      // signer from its signature and enforces the M-of-N threshold + dedup.
      let localHeirQuorum: { expiresAt: number; nonce: Hex; signatures: readonly LocalHeirSignature[] } | undefined;
      let isVotingHolder: ((v: Hex, recovered: Address) => Promise<boolean>) | undefined;
      if (!quorumProof && localReady && policy && manifestHashHex && envelope) {
        const verified = localVerified!;
        localHeirQuorum = {
          expiresAt: LOCAL_RELEASE_FIXED_EXPIRY,
          nonce: deriveLocalReleaseNonce(envelope.vaultId, manifestHashHex),
          signatures: localSigs,
        };
        isVotingHolder = async (_v: Hex, recovered: Address) => verified.has(recovered.toLowerCase());
      }
      const result = await runRestorePipeline({
        manifests: [matchedManifest],
        shares,
        passkey,
        heirMode: true,
        ...(quorumProof ? { quorumProof } : {}),
        ...(localHeirQuorum ? { localHeirQuorum, isVotingHolder } : {}),
      });
      setOutput(result);
      setPhase("done");
      trackEventDurable("restore_run");
    } catch (e) {
      // 0.8.0 traction — count FAILED heir-restore drills too (airgap → durable).
      trackEventDurable("restore_failed");
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function reset(): void {
    setEnvelope(null);
    setEnvelopeError(null);
    setManifests([]);
    setShares([]);
    setPasskey("");
    setOutput(null);
    setError(null);
    setReveal(false);
    setUrlInput("");
    setAttestation(null);
    setVoteSent(false);
    setPhase("envelope");
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold font-display">
          <span className="grad">Heir restore (M-of-N quorum)</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          This is the heir-initiated restore path. It enforces the vault owner's M-of-N quorum policy: a lone heir cannot decrypt the vault until K of N designated heirs have each cast a release vote. Vault owners self-restoring (with shares + master password) should use the standard <Link to="/restore" className="text-accent-cyan underline">/restore</Link> page instead.
        </p>
        {/* 0.4.0 — Honest 8-step strip with explicit Go-offline boundary
            (step 5). Active step is derived from the existing Phase
            machine; no underlying flow change. */}
        <HeirFlowStrip activeN={heirActiveStep(phase, voteSent, !!output)} />
      </div>

      {/* Step 1 — envelope */}
      {phase === "envelope" && (
        <div className="card sensitive-surface">
          <h2 className="font-bold font-display mb-2">Step 1 — drop your claim envelope</h2>
          <p className="text-sm text-text-on-dark/85 mb-3">
            When you completed your NoK claim on the previous page, the app generated a signed <code className="font-mono">claim-envelope.json</code> bound to your heir wallet. Drop it here to begin.
          </p>
          <div
            className="border-2 border-dashed border-bg-surface rounded-lg p-8 text-center cursor-pointer hover:border-accent-teal transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onEnvelopeDrop}
            onClick={() => fileInput.current?.click()}
          >
            <p className="text-text-on-dark/80">Drop claim-envelope.json here, or click to pick</p>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept="application/json,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void handleEnvelopeFile(e.target.files[0]!);
                  e.target.value = "";
                }
              }}
            />
          </div>
          {envelopeError && (
            <div className="mt-3 text-sm text-rose-300 break-words">{envelopeError}</div>
          )}
        </div>
      )}

      {envelope && (
        <div className="card border border-emerald-500/40 bg-emerald-950/10 text-sm text-text-on-dark/90">
          <div className="font-bold text-emerald-300 mb-1">Claim envelope verified</div>
          <div className="font-mono text-xs break-all">
            vault {envelope.vaultId.slice(0, 12)}… · heir {envelope.heirWallet.slice(0, 8)}…{envelope.heirWallet.slice(-4)}
          </div>
        </div>
      )}

      {/* Wallet step (must be connected before voting).
          0.5.0 — when MANAGED_WALLET_ENABLED_INLINE is true and the heir
          has neither connected via wagmi nor picked a managed-mode signin,
          show a chooser at the top of this slot. When the flag is off the
          original card renders unchanged (the literal `&&` chain folds out
          at build time). */}
      {phase !== "envelope" && gate.status !== "connected" && !managedAddress && (
        MANAGED_WALLET_ENABLED_INLINE ? (
          // -- Flag ON: render chooser, then the chosen path. --------------
          <div className="card space-y-4">
            <h2 className="font-bold font-display">How will you sign?</h2>
            <p className="text-sm text-text-on-dark/85">
              Pick how you want to sign the release vote. Both options end
              with you holding the same Activation SBT — the difference is
              the signing surface.
            </p>
            {walletChoice === null && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => setWalletChoice("self")}
                >
                  Connect existing wallet
                </button>
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setWalletChoice("managed")}
                >
                  Sign in with email (managed)
                </button>
              </div>
            )}
            {walletChoice === "self" && (
              <div className="space-y-3">
                <p className="text-sm text-text-on-dark/85">
                  Connect the same wallet you used to claim the inheritance
                  NFT — that's the wallet permitted to vote in the M-of-N
                  quorum.
                </p>
                <ConnectWallet />
                <button
                  type="button"
                  className="text-xs text-text-muted underline"
                  onClick={() => setWalletChoice(null)}
                >
                  Back — pick a different sign-in
                </button>
              </div>
            )}
            {walletChoice === "managed" && ManagedHeirSignin && (
              <div className="space-y-3">
                <Suspense fallback={null}>
                  <ManagedHeirSignin
                    onSignedIn={(addr: `0x${string}`) => setManagedAddress(addr as Address)}
                  />
                </Suspense>
                <button
                  type="button"
                  className="text-xs text-text-muted underline"
                  onClick={() => setWalletChoice(null)}
                >
                  Back — pick a different sign-in
                </button>
              </div>
            )}
          </div>
        ) : (
          // -- Flag OFF: the shared not-connected surface (buttons always live). -
          <WalletGateCard
            title="Connect your heir wallet"
            note="Connect the same wallet you used to claim the inheritance NFT — that's the wallet permitted to vote in the M-of-N quorum."
          />
        )
      )}

      {/* Step 2 — collect manifest + shares */}
      {(phase === "ready-collect" || phase === "vote" || phase === "waiting-quorum" || phase === "ready-restore") && (
        <div className="card sensitive-surface">
          <h2 className="font-bold font-display mb-2">Step 2 — gather manifest + share files</h2>
          <div
            className="border-2 border-dashed border-bg-surface rounded-lg p-8 text-center cursor-pointer hover:border-accent-teal transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCollectDrop}
            onClick={() => fileInput.current?.click()}
          >
            <p className="text-text-on-dark/80">Drop manifest.json + share files, or click to pick</p>
            <input
              ref={fileInput}
              type="file"
              multiple
              className="hidden"
              onChange={onCollectChange}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-bg-surface">
            <div className="text-sm text-text-muted mb-2">…or paste a share URL one at a time:</div>
            <div className="flex gap-2">
              <input
                type="url"
                className="flex-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.dropbox.com/scl/... or https://drive.google.com/file/d/..."
                spellCheck={false}
                autoComplete="off"
              />
              <button className="btn btn-secondary text-sm" disabled={urlBusy || !urlInput.trim()} onClick={() => void fetchFromUrl()}>
                {urlBusy ? "Fetching…" : "Fetch"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-muted mb-1">Manifest(s) loaded</div>
              {manifests.length === 0 ? (
                <div className="text-text-muted">— not loaded</div>
              ) : (
                <div className="space-y-1">
                  {manifests.map((m) => (
                    <div key={m.vaultId} className="font-mono text-accent-green break-all">
                      ✓ vault {m.vaultId.slice(0, 12)}… · {m.shamir.threshold}-of-{m.shamir.total}
                      {m.quorumPolicy && (
                        <span className="ml-1 text-amber-300">· quorum {m.quorumPolicy.M}-of-{m.quorumPolicy.N}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-text-muted mb-1">Shares loaded</div>
              <div className="font-mono">
                {shares.length}
                {shares.length > 0 && (
                  <div className="text-xs mt-1 text-text-muted break-all">
                    indices: {shares.map((s) => s.index).sort((a, b) => a - b).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {phase === "ready-collect" && matchedManifest && isConnected && (
            <div className="flex gap-3 mt-4">
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={() => setPhase("vote")}
              >
                Continue to vote
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — quorum status + vote */}
      {(phase === "vote" || phase === "waiting-quorum" || phase === "ready-restore") && envelope && manifestHashHex && matchedManifest?.quorumPolicy && (
        <div className="card space-y-3">
          <h2 className="font-bold font-display">Step 3 — quorum status</h2>
          <QuorumStatus
            vaultId={envelope.vaultId}
            manifestHash={manifestHashHex}
            M={matchedManifest.quorumPolicy.M}
            N={matchedManifest.quorumPolicy.N}
          />
          {!voteSent && phase === "vote" && (
            <div>
              <p className="text-sm text-text-on-dark/85 mb-2">
                Sign your release vote with your heir wallet. Form B verifies the signature recovers to your wallet and that your wallet holds the matching Activation SBT.
              </p>
              <button className="btn btn-primary" disabled={busy || !isConnected} onClick={() => void castMyVote()}>
                {busy ? "Signing…" : "Sign my release vote"}
              </button>
            </div>
          )}
          {voteSent && (
            <p className="text-sm text-emerald-300">Your vote was recorded. Waiting for the remaining heirs to vote — this strip refreshes every 15 s.</p>
          )}

          {/* B-2 — Form-B-INDEPENDENT local heir quorum (disappearance fix) */}
          <div className="mt-2 border-t border-white/10 pt-3">
            <button
              type="button"
              className="text-xs underline text-text-on-dark/70 hover:text-text-on-dark"
              onClick={() => setLocalOpen((v) => !v)}
            >
              {localOpen ? "▾" : "▸"} Form B unavailable? Release this vault with a local heir quorum (no NoKLock needed)
            </button>
            {localOpen && matchedManifest?.quorumPolicy && (
              <div className="mt-3 space-y-3 text-sm">
                <p className="text-text-on-dark/85">
                  If NoKLock can't be reached, the heirs can release the vault entirely on their own.{" "}
                  {matchedManifest.quorumPolicy.M} of {matchedManifest.quorumPolicy.N} heir wallets each
                  sign locally; the restore verifies the signatures <strong>and</strong> that each signer
                  holds a Voting NFT for this vault <strong>on-chain</strong> — no server, no attestor key.
                  The only thing it needs is a Polygon connection to read the chain (done now, before you go
                  offline). Each heir runs this page, clicks “Sign locally”, and sends their one-line blob to
                  whoever is doing the restore.
                </p>

                <button
                  className="btn btn-secondary"
                  disabled={localBusy || !isConnected}
                  onClick={() => void signLocally()}
                >
                  {localBusy ? "Working…" : "Sign locally with my heir wallet"}
                </button>

                {myLocalBlob && (
                  <div>
                    <div className="text-xs text-text-muted mb-1">Your signature — send this to the heir running the restore:</div>
                    <textarea
                      readOnly
                      className="input w-full font-mono text-xs h-16"
                      value={myLocalBlob}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                      className="btn btn-ghost text-xs mt-1"
                      onClick={() => { void navigator.clipboard?.writeText(myLocalBlob); setLocalNote("Copied your signature to the clipboard."); }}
                    >
                      Copy
                    </button>
                  </div>
                )}

                <div>
                  <div className="text-xs text-text-muted mb-1">Paste other heirs’ signature blobs (one object or a JSON array):</div>
                  <textarea
                    className="input w-full font-mono text-xs h-16"
                    value={localPaste}
                    onChange={(e) => setLocalPaste(e.target.value)}
                    placeholder={'{"signer":"0x…","signature":"0x…"}'}
                  />
                  <button
                    className="btn btn-secondary text-xs mt-1"
                    disabled={localBusy || localPaste.trim().length === 0}
                    onClick={importLocalPaste}
                  >
                    Import heir signatures
                  </button>
                </div>

                <div className="rounded bg-white/5 border border-white/10 p-2">
                  <div className="text-xs">
                    Collected: <span className="font-mono">{localSigs.length}</span> / {matchedManifest.quorumPolicy.M} needed
                    {localVerified && (
                      <> · <span className="font-mono">{localVerified.size}</span> verified on-chain</>
                    )}
                  </div>
                  {localSigs.length > 0 && (
                    <ul className="mt-1 text-[11px] font-mono break-all text-text-on-dark/70 space-y-0.5">
                      {localSigs.map((s) => (
                        <li key={s.signer}>
                          {localVerified ? (localVerified.has(s.signer.toLowerCase()) ? "✓ " : "✗ ") : "• "}
                          {s.signer}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      className="btn btn-secondary text-xs"
                      disabled={localBusy || localSigs.length === 0}
                      onClick={() => void verifyLocalOnChain()}
                    >
                      {localBusy ? "Verifying…" : "Verify heir signatures on-chain"}
                    </button>
                    {localVerified && localVerified.size >= matchedManifest.quorumPolicy.M && (
                      <button className="btn btn-primary text-xs" onClick={() => setPhase("ready-restore")}>
                        Continue to go offline &amp; restore →
                      </button>
                    )}
                  </div>
                </div>

                {localNote && <p className="text-xs text-accent-green">{localNote}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 0.3.0 — Step 4 (NEW): explicit airgap engagement.
          Quorum has been met + attestation is in hand. Before the heir
          types the master password, force the same deliberate "Go offline
          now" moment that /enrol gives the original owner and /restore
          0.13.0 gives the owner-self-restore path. */}
      {phase === "ready-restore" && matchedManifest && (
        <div className="card sensitive-surface space-y-3 border-l-4 border-l-amber-400">
          <div className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Step 5 of 8 · boundary</div>
          <h2 className="font-bold font-display">Step 5 — go offline now</h2>
          <p className="text-sm text-text-on-dark/85">
            NoKLock is about to reassemble the vault locally. For maximum safety, disconnect your Wi-Fi (or unplug your ethernet) and close any tabs you do not trust. The browser tab also installs a software airgap that blocks every outbound network call — but physical disconnect is belt-and-braces.
          </p>
          <div className="text-sm">
            Browser online?{" "}
            <span className="font-mono">
              {online ? (
                <span className="text-danger">yes — turn it off</span>
              ) : (
                <span className="text-accent-green">no ✓</span>
              )}
            </span>
          </div>
          {isAirgapped() && (
            <div className="p-2 rounded bg-accent-green/10 border border-accent-green/40 text-xs">
              <strong className="text-accent-green">Software airgap engaged.</strong>{" "}
              <span className="font-mono">Fetches blocked since engaged: {blockedCount}</span>
              {blockedCount === 0
                ? <span className="text-accent-green"> ✓ no calls leaked</span>
                : <span className="text-amber-400"> — investigate before continuing</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              className="btn btn-primary"
              disabled={online}
              onClick={engageAirgapAndAdvance}
            >
              I am offline — engage airgap
            </button>
            <button
              className="btn btn-secondary text-sm"
              onClick={engageAirgapAndAdvance}
            >
              Skip physical disconnect — engage software airgap only
            </button>
          </div>
          <p className="text-xs text-text-muted">
            The software airgap intercepts every fetch / XHR / WebSocket / EventSource / SendBeacon / Worker / Service-Worker / WebRTC channel — but a compromised browser can still leak via a renderer exploit. Physical disconnect closes that gap.
          </p>
        </div>
      )}

      {/* Step 5 (was 4) — master password + restore.
          0.3.0 — gated on `ready-restore-passkey` (post-airgap). */}
      {phase === "ready-restore-passkey" && matchedManifest && (
        <div className="card sensitive-surface space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Step 6 of 8 · offline</div>
          <h2 className="font-bold font-display">Step 6 — master password &amp; restore</h2>
          <div className="card border border-emerald-500/40 bg-emerald-950/10 text-xs text-emerald-200">
            <strong>Airgap engaged ✓</strong> — all outbound network calls are being intercepted.
            <span className="font-mono ml-2">Blocked since engaged: {blockedCount}</span>
          </div>
          <p className="text-sm text-text-on-dark/85">
            Quorum is met — enter the master password the original owner shared with you. Reassembly is offline; nothing leaves this browser.
          </p>
          <div>
            <label className="block text-sm text-slate-400 mb-1" htmlFor="heir-restore-passkey">Vault master password</label>
            <MaskedSecret id="heir-restore-passkey" value={passkey} onChange={setPasskey} />
          </div>
          <div className="flex gap-3">
            <button
              className="btn btn-primary"
              disabled={busy || shares.length === 0 || passkey.length < 1}
              onClick={() => void reconstruct()}
            >
              {busy ? "Reconstructing…" : "Restore vault"}
            </button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
        </div>
      )}

      {error && <div className="card border-rose-500 text-rose-300 break-words">{error}</div>}

      {output && (
        <RestoredPanel
          output={output}
          reveal={reveal}
          setReveal={setReveal}
          onCleared={() => {
            // G2-F-8 custody ceremony: heir confirmed custody → wipe
            // in-memory plaintext. RestoredPanel renders its own green
            // "you're done" card from this point.
            try {
              if (
                output &&
                (output.kind === "sealed-letter" || output.kind === "document") &&
                output.content?.fill
              ) {
                output.content.fill(0);
              }
            } catch { /* already wiped */ }
            setOutput(null);
            setReveal(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * G2-F-8 custody-handoff ceremony state.
 *
 *   revealing  — initial: press-and-hold reveal, no Done yet.
 *   confirmed  — checkbox ticked; show first+last word (or download gate).
 *   verified   — user proved custody; parent wipes output → "cleared".
 *   cleared    — parent set output to null; we render only the green
 *                "you're done" card. (RestoredPanel does NOT render in
 *                "cleared" because the parent unmounts it when output
 *                goes null; the green card is rendered by HeirRestore
 *                inline via the same component, mounted with a synthetic
 *                stub output.) In practice we transition through
 *                verified → onCleared() → unmount, and a separate
 *                <CustodyDonePanel/> is rendered as the panel itself
 *                so its lifecycle is independent of the now-null output.
 *
 * Notes:
 *  - For bip39 we split on whitespace; mnemonic-clean, no punctuation.
 *  - For sealed-letter with text/markdown/html we decode bytes and
 *    strip HTML tags (very light: regex). First + last token wins.
 *  - For binary `document` and non-text sealed-letters we drop the
 *    word-verification step; the "verified" gate is the user pressing
 *    "I have downloaded and saved this file" AFTER the download button.
 *  - Lowercase-strict + trim whitespace on word compare.
 */
type CustodyPhase = "revealing" | "confirmed" | "verified" | "cleared";

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ");
}

/** Split a text blob into lowercase-trimmed word tokens. */
function tokenise(s: string): readonly string[] {
  return s
    .replace(/[^A-Za-z0-9À-ɏ'-]+/g, " ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/** Compute (first, last) verification words from a RestoreOutput, or null
 *  if the output is binary / unsuitable for word-based verification. */
function getVerificationWords(output: RestoreOutput): { readonly first: string; readonly last: string } | null {
  if (output.kind === "bip39") {
    const tokens = tokenise(output.mnemonic);
    if (tokens.length < 2) return null;
    return { first: tokens[0]!, last: tokens[tokens.length - 1]! };
  }
  // sealed-letter / document
  const isText = output.mimeType === "text/plain" || output.mimeType === "text/markdown";
  const isHtml = output.mimeType === "text/html";
  if (output.kind !== "sealed-letter" || (!isText && !isHtml)) return null;
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(output.content);
  } catch {
    return null;
  }
  const plain = isHtml ? stripHtml(decoded) : decoded;
  const tokens = tokenise(plain);
  if (tokens.length < 2) return null;
  return { first: tokens[0]!, last: tokens[tokens.length - 1]! };
}

// -----------------------------------------------------------------------
// RestoredPanel — duplicated from Restore.tsx so this route is self-
// contained (Restore.tsx doesn't export it). When that helper is
// promoted to a shared module in a later refactor, this duplicate goes
// away. The render contract is identical: kind-aware press-and-hold
// reveal + optional download fallback.
// -----------------------------------------------------------------------

function RestoredPanel({ output, reveal, setReveal, onCleared }: {
  readonly output: RestoreOutput;
  readonly reveal: boolean;
  readonly setReveal: (b: boolean) => void;
  readonly onCleared: () => void;
}): JSX.Element {
  // G2-F-8 custody ceremony local state.
  const [custodyPhase, setCustodyPhase] = useState<CustodyPhase>("revealing");
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
  const [wrote, setWrote] = useState(false);
  const [firstWord, setFirstWord] = useState("");
  const [lastWord, setLastWord] = useState("");
  const [downloadAcknowledged, setDownloadAcknowledged] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [verifyErr, setVerifyErr] = useState<string | null>(null);

  const verifyWords = getVerificationWords(output);
  const canWordVerify = verifyWords !== null;

  // Track the first reveal so the ceremony advances out of "revealing".
  useEffect(() => {
    if (reveal && !hasRevealedOnce) setHasRevealedOnce(true);
  }, [reveal, hasRevealedOnce]);

  const meta = (
    <div className="text-sm text-slate-400 mb-3">
      Used shares: {output.usedShareIndices.join(", ")}
      {output.tamperFlags.length > 0 && (
        <span className="text-amber-400"> · Tampered/wrong-password on: {output.tamperFlags.join(", ")}</span>
      )}
    </div>
  );

  function attemptVerify(): void {
    setVerifyErr(null);
    if (canWordVerify) {
      const f = firstWord.trim().toLowerCase();
      const l = lastWord.trim().toLowerCase();
      if (f !== verifyWords!.first || l !== verifyWords!.last) {
        setVerifyErr("Those words don't match. Re-reveal and check carefully — case and spelling are ignored, but the word itself must match.");
        return;
      }
    } else {
      if (!(downloaded && downloadAcknowledged)) {
        setVerifyErr("Download the file and confirm you've saved it before continuing.");
        return;
      }
    }
    setCustodyPhase("verified");
    // verified is a transient state — emit the cleared callback so the
    // parent wipes the in-memory plaintext, then settle locally on
    // "cleared" for the green panel.
    onCleared();
    setCustodyPhase("cleared");
  }

  // ---- branch: cleared ------------------------------------------------
  if (custodyPhase === "cleared") {
    return (
      <div className="card border-emerald-500 bg-emerald-950/20">
        <h2 className="font-bold text-emerald-400 mb-2">You're done ✓</h2>
        <p className="text-sm text-emerald-100/90">
          The recovered material has been wiped from this browser tab. Refresh the page to clear any residual memory. NoKLock does not retain a copy.
        </p>
        <p className="text-xs text-slate-400 mt-3">
          If you didn't actually capture it — close this tab WITHOUT refreshing, find a clean device, and restart the heir-restore flow with the same envelope + shares + master password.
        </p>
      </div>
    );
  }

  // ---- branch: bip39 mnemonic ----------------------------------------
  if (output.kind === "bip39") {
    return (
      <div className="card border-emerald-500">
        <h2 className="font-bold text-emerald-400 mb-2">Seed restored ✓</h2>
        {meta}
        <div
          className="sensitive-surface select-none cursor-pointer"
          onMouseDown={() => setReveal(true)}
          onMouseUp={() => setReveal(false)}
          onMouseLeave={() => setReveal(false)}
          onTouchStart={() => setReveal(true)}
          onTouchEnd={() => setReveal(false)}
        >
          {reveal ? (
            <pre className="font-mono whitespace-pre-wrap break-words text-emerald-200">{output.mnemonic}</pre>
          ) : (
            <div className="text-slate-400 text-center py-6">Press and hold to reveal seed</div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Once revealed, copy this seed straight into a fresh wallet on a clean device. NoKLock does not retain it.
        </p>

        {/* Custody ceremony — bip39 */}
        <CustodyCeremony
          custodyPhase={custodyPhase}
          setCustodyPhase={setCustodyPhase}
          hasRevealedOnce={hasRevealedOnce}
          wrote={wrote}
          setWrote={setWrote}
          canWordVerify={canWordVerify}
          firstWord={firstWord}
          setFirstWord={setFirstWord}
          lastWord={lastWord}
          setLastWord={setLastWord}
          downloaded={downloaded}
          downloadAcknowledged={downloadAcknowledged}
          setDownloadAcknowledged={setDownloadAcknowledged}
          verifyErr={verifyErr}
          attemptVerify={attemptVerify}
          revealPrompt="reveal the seed"
        />
      </div>
    );
  }

  // ---- branch: sealed-letter / document ------------------------------
  const docOutput = output as Extract<RestoreOutput, { kind: "sealed-letter" | "document" }>;
  const isText = docOutput.mimeType === "text/plain" || docOutput.mimeType === "text/markdown";
  const isHtml = docOutput.mimeType === "text/html";
  const kindLabel = docOutput.kind === "sealed-letter" ? "Sealed letter" : "Document";
  const decodedText = isText && docOutput.kind === "sealed-letter"
    ? new TextDecoder().decode(docOutput.content)
    : null;
  const decodedHtml = isHtml && docOutput.kind === "sealed-letter"
    ? new TextDecoder().decode(docOutput.content)
    : null;

  function downloadFile(): void {
    const blob = new Blob([docOutput.content as BlobPart], { type: docOutput.mimeType ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = docOutput.mimeType === "text/html" ? ".html" : docOutput.mimeType === "text/plain" ? ".txt" : ".bin";
    a.download = docOutput.originalFilename ?? `noklock-${docOutput.kind}-${docOutput.matchedVaultId.slice(0, 8)}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    // For non-text/binary branches, downloading counts as a "reveal" — the
    // bytes have left the sandbox, ceremony must advance from here.
    if (!canWordVerify) setHasRevealedOnce(true);
  }

  return (
    <div className="card border-emerald-500">
      <h2 className="font-bold text-emerald-400 mb-2">{kindLabel} restored ✓</h2>
      {meta}
      <div className="text-xs text-slate-400 mb-3">
        {output.originalFilename && <span>Original: <code className="font-mono">{output.originalFilename}</code> · </span>}
        {output.mimeType && <span><code className="font-mono">{output.mimeType}</code> · </span>}
        <span>{output.content.byteLength} bytes</span>
      </div>

      {decodedHtml !== null ? (
        <>
          <div
            className="sensitive-surface select-none cursor-pointer"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal ? (
              <RichTextView html={decodedHtml} className="text-emerald-100 text-sm" />
            ) : (
              <div className="text-slate-400 text-center py-6">Press and hold to reveal letter</div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary text-sm" onClick={downloadFile}>Download as file</button>
          </div>
        </>
      ) : decodedText !== null ? (
        <>
          <div
            className="sensitive-surface select-none cursor-pointer"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal ? (
              <pre className="font-mono whitespace-pre-wrap break-words text-emerald-200 text-sm">{decodedText}</pre>
            ) : (
              <div className="text-slate-400 text-center py-6">Press and hold to reveal letter</div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary text-sm" onClick={downloadFile}>Download as file</button>
          </div>
        </>
      ) : (
        <div className="text-center py-6 border border-dashed border-bg-surface rounded">
          <p className="text-text-on-dark/80 text-sm mb-3">
            {output.kind === "sealed-letter"
              ? "This sealed letter was uploaded as a non-text file. Download to open in your preferred editor."
              : "Document decrypted. Download to open in your preferred editor."}
          </p>
          <button className="btn btn-primary" onClick={downloadFile}>
            Download {output.originalFilename ?? `${output.kind}.bin`}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Decrypted bytes live in this browser tab only. NoKLock does not retain the plaintext.
      </p>

      {/* Custody ceremony — sealed-letter / document */}
      <CustodyCeremony
        custodyPhase={custodyPhase}
        setCustodyPhase={setCustodyPhase}
        hasRevealedOnce={hasRevealedOnce}
        wrote={wrote}
        setWrote={setWrote}
        canWordVerify={canWordVerify}
        firstWord={firstWord}
        setFirstWord={setFirstWord}
        lastWord={lastWord}
        setLastWord={setLastWord}
        downloaded={downloaded}
        downloadAcknowledged={downloadAcknowledged}
        setDownloadAcknowledged={setDownloadAcknowledged}
        verifyErr={verifyErr}
        attemptVerify={attemptVerify}
        revealPrompt={output.kind === "sealed-letter" ? "reveal or download the letter" : "download the file"}
      />
    </div>
  );
}

/**
 * G2-F-8 — shared ceremony UI rendered inside each kind-aware
 * RestoredPanel branch. Drives `revealing → confirmed → verified` (the
 * `cleared` state is rendered separately, after `output` is nulled by
 * the parent).
 */
function CustodyCeremony(props: {
  readonly custodyPhase: CustodyPhase;
  readonly setCustodyPhase: (p: CustodyPhase) => void;
  readonly hasRevealedOnce: boolean;
  readonly wrote: boolean;
  readonly setWrote: (b: boolean) => void;
  readonly canWordVerify: boolean;
  readonly firstWord: string;
  readonly setFirstWord: (s: string) => void;
  readonly lastWord: string;
  readonly setLastWord: (s: string) => void;
  readonly downloaded: boolean;
  readonly downloadAcknowledged: boolean;
  readonly setDownloadAcknowledged: (b: boolean) => void;
  readonly verifyErr: string | null;
  readonly attemptVerify: () => void;
  readonly revealPrompt: string;
}): JSX.Element {
  const {
    custodyPhase, setCustodyPhase, hasRevealedOnce, wrote, setWrote,
    canWordVerify, firstWord, setFirstWord, lastWord, setLastWord,
    downloaded, downloadAcknowledged, setDownloadAcknowledged,
    verifyErr, attemptVerify, revealPrompt,
  } = props;

  return (
    <div className="mt-5 pt-4 border-t border-bg-surface space-y-3">
      <div className="text-sm font-bold text-amber-300">Custody handoff</div>
      <p className="text-xs text-slate-300/90">
        This may be the only chance to capture the recovery — once this tab
        closes, the decrypted material is gone. Walk through the steps below
        before you navigate away.
      </p>

      {/* Step a — reveal (just visual feedback; the press-and-hold
          surface above is the real control) */}
      <div className="text-xs">
        <span className={hasRevealedOnce ? "text-emerald-300" : "text-slate-400"}>
          {hasRevealedOnce ? "✓" : "1."} Press and hold above to {revealPrompt}.
        </span>
      </div>

      {/* Step b — checkbox confirm */}
      <label
        className={`flex items-start gap-2 text-sm ${hasRevealedOnce ? "text-text-on-dark" : "text-slate-500"}`}
      >
        <input
          type="checkbox"
          className="mt-1"
          checked={wrote}
          disabled={!hasRevealedOnce}
          onChange={(e) => {
            setWrote(e.target.checked);
            if (e.target.checked && custodyPhase === "revealing") setCustodyPhase("confirmed");
            if (!e.target.checked && custodyPhase === "confirmed") setCustodyPhase("revealing");
          }}
        />
        <span>
          I have written this down on paper, or saved it on a clean device that the original owner trusted.
        </span>
      </label>

      {/* Step c — verify */}
      {custodyPhase !== "revealing" && (
        <div className="mt-2 space-y-2">
          {canWordVerify ? (
            <>
              <div className="text-xs text-slate-300/90">
                Confirm by typing the <strong>first</strong> and <strong>last</strong> word you just captured (case and whitespace are ignored):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className="bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
                  placeholder="first word"
                  value={firstWord}
                  onChange={(e) => setFirstWord(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <input
                  type="text"
                  className="bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
                  placeholder="last word"
                  value={lastWord}
                  onChange={(e) => setLastWord(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-slate-300/90">
                Binary files can't be word-verified — confirm you've downloaded the file and saved it somewhere safe:
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={downloadAcknowledged}
                  disabled={!downloaded}
                  onChange={(e) => setDownloadAcknowledged(e.target.checked)}
                />
                <span className={downloaded ? "text-text-on-dark" : "text-slate-500"}>
                  {downloaded
                    ? "I have downloaded the file and saved a copy somewhere I trust."
                    : "Press the Download button above first."}
                </span>
              </label>
            </>
          )}
          {verifyErr && (
            <div className="text-xs text-rose-300">{verifyErr}</div>
          )}
          <button
            className="btn btn-primary text-sm"
            disabled={!wrote || (canWordVerify ? !firstWord.trim() || !lastWord.trim() : !(downloaded && downloadAcknowledged))}
            onClick={attemptVerify}
          >
            I have it — clear this browser
          </button>
        </div>
      )}
    </div>
  );
}
