// @version 2.14.0 @date 2026-06-08
// 2.14.0 — Daniel 2026-06-08: Step B "Two routes" callout now keyed via
//          useT() — enrol.shareUrl.twoRoutes.{headline,simple,max,urlsNote}.
//          Was inline EN; non-EN locales were showing EN tail. The
//          inline `recommended list` <Link> and the dynamic KIND_NOUN
//          interpolation were lifted out: the link is rendered below as
//          a discrete row so the keyed body stays a flat translatable
//          string. Cloned into all 6 locales (en/de/fr/pt/zh-Hans/hi) as
//          machine-translation starting point.
// @version 2.13.0 @date 2026-06-06
// 2.13.0 — Daniel 2026-06-06: Step B "Two routes" simple-vs-max-security
//          callout added to the airgap step. Frames the airgap choice as
//          a spectrum rather than a binary: "Simple" route (online enrol,
//          three shares scattered into the user's own folders — already
//          beats a sticky note) vs "Max security" route (full airgap,
//          dead-machine boot, single-use OS). Reduces friction for users
//          who bounce off the airgap requirement while keeping the
//          max-security path equally prominent for the security-conscious
//          cohort. Matches the simple-vs-max framing landed the same day
//          in Pricing FAQ 0.9.6 + CryptoInheritance 0.3.1 + Landing 0.22.0.
// @version 2.12.0 @date 2026-06-04
// 2.12.0 — Daniel 2026-06-04: OPTIONAL "free tools" checkpoint card inserted
//          between welcome and airgap. New Step value "free-tools-checkpoint"
//          extends the wizard to 14 steps. The card surfaces two external
//          free-tier survivorship tools the user should set up alongside
//          NoKLock:
//            * Apple Digital Legacy — https://support.apple.com/en-us/HT212360
//            * Google Inactive Account Manager — https://myaccount.google.com/inactive
//          Heading: "Before you enrol — set these up too (free, ~5 min each,
//          optional)." Each row has a name, one-line description and a
//          "Set up →" external link (target="_blank" rel="noopener noreferrer").
//          Two terminal buttons: "Mark as done — continue" + "I will do these
//          later — skip" — both transition to "airgap". The user's choice
//          persists to localStorage under `noklock.enrol-free-tools-acknowledged`
//          as { status: "done" | "skipped", at: <unix-ms> }; on subsequent
//          enrolments, if the key already exists, the wizard SKIPS this step
//          and goes straight from "welcome" to "airgap" — so users don't see
//          the card every time. The "Begin" button on welcome remains; it now
//          either advances to "free-tools-checkpoint" (first time) or directly
//          to "airgap" (already acknowledged). Step strip updated (TITLES /
//          STEP_SUB / STEP_STATE all gain the new key); FlowSteps grid still
//          renders a clean 14-step layout (the component scales row-count from
//          step count). No new dependencies; pure JSX + localStorage.
// @version 2.11.0 @date 2026-06-03
// 2.11.0 — Daniel 2026-06-03: CliUploadModal wired into "Save shares" step.
//          Third button "⚡ Generate noklock-cli upload command" appears next
//          to existing "Save into folder…" + "Download all files" (only when
//          `output` is set i.e. shares have been generated). Modal renders
//          via cliModalOpen state at the end of the main return tree (after
//          walletSwitchedModal). Daniel-locked design from
//          docs/enrol-cli-integration-spec-20260603.md:
//          - Pre-filled command modal — token never enters the PWA tab.
//          - Always-on inline consent checkbox EVERY enrol session (no
//            localStorage memory of prior consent).
//          - Copy-to-clipboard gated on checkbox.
//          - ESC closes; "Cancel — I'll upload manually" closes; modal is
//            informational, not destructive.
//          Existing manual paths unchanged.
// @version 2.10.0 @date 2026-06-03
// 2.10.0 — LOW-7 FIX (Daniel 2026-06-03): manifest hash was computed twice
//         without cross-verification — once in writeAllAndAdvance (for the
//         vault-index entry's `manifestHash` field) and once in doMintNok
//         (for the SBT mint payload). Same algorithm, same inputs, but two
//         derivations and zero verification, so any future divergence
//         (manifestObj mutated between write + mint, hashing-lib regression
//         on one call site only, serialisation-order drift) would silently
//         desynchronise the on-chain SBT from the on-disk vault. Fix:
//         (a) new `manifestHashRef = useRef<string | null>(null)` at
//             component scope (a fingerprint, not rendered UI → ref not
//             state); (b) writeAllAndAdvance computes the canonical hex
//             ONCE, stashes it in the ref, and uses it for the index
//             entry; (c) doMintNok reads from the ref AND recomputes,
//             then asserts byte-equality before calling `mint.mint(...)`.
//             On mismatch: setError + throw — the existing try/finally
//             clears isSubmitting and the user sees the loud error rather
//             than a silently-divergent on-chain SBT. If the ref is null
//             (defence in depth: a code path that hits doMintNok without
//             going through writeAllAndAdvance), we fall back to the
//             fresh recompute.
// 2.9.0 — MED-enrol-2 FIX (Daniel 2026-06-03): airgap step was re-entrable.
//         Symptom: the three `leaveAirgap()` call sites (Back-from-content,
//         Skip-to-done, Continue-to-done) could each fire more than once if
//         the user navigated back-and-forth across the airgap boundary mid
//         enrol — the airgap manager would unhook + rehook + unhook again
//         in the same session, defeating the "engaged once, witnessed once"
//         contract the airgap manager assumes for the blocked-fetch ledger
//         (each engage/leave cycle resets `blockedFetchCount()` and dwarfs
//         the legitimate post-engage witness window). Fix: introduce two
//         component-scope refs — `airgapEngagedAt` (set on enterAirgap, the
//         single moment we transition online→airgapped) and `airgapLeftAt`
//         (set on the FIRST leave). A new `leaveAirgapOnce()` helper guards
//         the underlying `leaveAirgap()` call: it bails when no engagement
//         has happened yet (defensive — leave-before-engage is a programmer
//         error) AND when a leave has already been recorded (the actual
//         bug). All three former direct `leaveAirgap()` call sites now go
//         through `leaveAirgapOnce()`. Doc: airgap engagement is single-use
//         per enrol session. A user who wants a second engagement must
//         restart the wizard from `/enrol`.
// 2.8.0 — AD1.7 FIX (Daniel 2026-06-03): wallet-switch-mid-flow not
//         detected. Symptom: the user begins an enrolment connected to
//         wallet A, gets to the NoK-designate step, switches the wallet
//         extension to account B (deliberately or via a sticky pane),
//         then clicks "Mint NoK SBTs" — the SBT write(s) were being
//         submitted FROM wallet B even though the entire vault context
//         (manifest, share files, vault-index entry, completion marker)
//         was built under wallet A. The on-chain inheritance tuple ended
//         up disconnected from the user's recorded vault history. Fix
//         has two parts:
//         (a) Vault-creator wallet capture. The connected address at the
//             moment the encryption pipeline finishes
//             (writeAllAndAdvance — when the vault genuinely EXISTS on
//             disk) is stamped into sessionStorage keyed by vaultId via
//             new `vaultCreatorKey(vaultId)` + `readVaultCreator` /
//             `writeVaultCreator` helpers. Read back at mint time.
//         (b) Pre-tx verify. `doMintNok` now compares the freshly-read
//             `connectedAddr` against the captured vault-creator address
//             before calling `mint.mint(...)`. On mismatch we OPEN a
//             new <WalletSwitchedModal/> that names both addresses, with
//             two paths out: "Switch back" (closes the modal so the user
//             can change the wallet in their extension + retry) or
//             "Restart enrol" (clears completion marker + nav to /enrol
//             so the user re-builds the vault under the wallet they
//             actually mean to use).
//         The hook-side of this fix lives in useNokMint 0.3.0
//         (useAccountEffect + per-write guard), which adds defence in
//         depth for swaps that occur AFTER doMintNok has already passed
//         the pre-tx verify — e.g. a swap between the Activation tx
//         being signed and the Voting tx popup mounting. The two layers
//         together close the AD1.7 hole top + bottom.
// 2.7.0 — AD1.6 FIX (Daniel 2026-06-03): form state persists across
//         browser back/forward navigation. Symptom: a user finishes an
//         enrolment, navigates away, then hits back/forward — the wizard
//         was remounting at step "welcome" with a fresh state and would
//         happily walk the user through a SECOND enrolment for the same
//         kind/wallet, silently producing a different vaultId. Fix: on
//         successful writeAllAndAdvance, persist a completion marker
//         { vaultId, step, completedAt } in sessionStorage keyed by a
//         stable `enrolSessionKey(kind, walletAddr)`. On mount, the
//         component reads sessionStorage; if a completion marker exists
//         for the current kind/wallet, render a "Already enrolled —
//         restore at /restore" block instead of restarting the wizard
//         from welcome. The marker survives back/forward in the SAME
//         tab/session (sessionStorage scope) but does NOT leak across
//         tabs or persist after the browser closes — by design, since a
//         "restart enrol" is legitimate in a new session. A NEW
//         beforeunload handler clears sensitive ephemeral state
//         (seed, dSeed, passkey, dPasskey, dText) but KEEPS the
//         completion marker, so refresh / back-button does not leak the
//         secret strings into another reload but the user still sees
//         the "already enrolled" gate. The existing unmount cleanup
//         (2.6.x) keeps doing its job; this is additive.
// 2.6.1 — H20 FIX (Daniel 2026-06-03): debounce the NoK mint submit on
//         the Enrol wizard's final "nok-designate" step. The button's
//         `disabled` clause already keyed off `mint.step !== "idle" &&
//         "done" && "error"`, but there was a brief window between the
//         click and the underlying useNokMint hook flipping out of
//         "idle" (validators, the doMintNok await of mint.mint(...), the
//         wallet popup mounting) where a rapid double-click / touch
//         double-tap could re-enter doMintNok() and queue a duplicate
//         3-SBT mint. New `isSubmitting` state at component scope is
//         flipped synchronously at doMintNok() entry, re-entrant calls
//         return immediately, and a try/finally clears the flag whether
//         the mint succeeds or throws. Button `disabled` ORs the new
//         flag onto the existing condition so the visual state still
//         tracks the underlying hook progression after submit.
// 2.6.0 — H19 FIX (Daniel 2026-06-03): doMintNok wallet-shape check now
//         delegates to the shared `isValidEthAddress` helper in
//         src/lib/validators.ts (introduced in H18, extended here) instead
//         of inlining its own /^0x[a-fA-F0-9]{40}$/ regex. The helper
//         trims leading/trailing whitespace before matching — previously
//         a paste of "0xABC…123\n" or " 0xABC…123" would fail with the
//         opaque "Invalid NoK wallet" toast even though the address was
//         correct, sending Daniel back to manually re-strip the paste.
//         Behaviour change: trims; everything else identical. No new
//         tier-gate logic. See validators.ts 0.2.0 header for the full
//         set of hex-shape helpers and the rationale for centralising.
// 2.5.0 — H2 FIX (Daniel 2026-06-03): vault-index recording failure was
//          silently swallowed. Previously `writeAllAndAdvance` wrapped the
//          `recordVaultInIndex(...)` call in `try { ... } catch { /* index
//          is best-effort */ }` — which meant a localStorage quota error,
//          a serialisation throw, or any other index-write failure left the
//          user with vault files on disk but NO entry in `/vaults`. The
//          vault would appear lost until a manual restore from share files
//          surfaced it again. Now: (1) the catch logs the underlying error
//          via `console.error("[enrol] recordVaultInIndex failed", e)` so
//          DevTools / error reporters can see it, and (2) sets a new
//          `indexWarning` state that renders a non-blocking amber toast on
//          the next step ("share-urls") with the verbatim copy from the H2
//          spec: "Vault saved but local index entry failed — won't appear
//          in /vaults unless you restore it manually." The toast is
//          dismissible and does NOT block progression — the vault files
//          themselves are already written, so the user can still finish
//          enrolment and complete the test-restore drill. Index is still
//          best-effort; we just stopped lying about it.
// 2.4.0 — H1 FIX (Daniel 2026-06-03): make the test-restore drill skip
//          EXPLICIT, not silent. Previously the test-restore step exposed
//          only "Drill passed → designate NoK" + Back; a user could (and did)
//          advance without ever proving the share files actually rebuild the
//          vault. Daniel's call was "don't force it" — the drill is still
//          skippable, but the skip is now a deliberate, audited act:
//            (1) NEW "Skip drill" secondary button on the test-restore step.
//            (2) Opens TestRestoreSkipModal explaining the risk in plain
//                English ("you might find out at the worst possible moment
//                that something is wrong") + the recovery path (you can
//                come back to /restore later to drill any time).
//            (3) Modal Continue button is DISABLED until an "I understand I
//                am choosing to skip this verification step" checkbox is
//                ticked — no accidental dismissals.
//            (4) On confirm: persist
//                  enrolSkipChoice = "test-restore-skipped:" + Date.now()
//                to a new localStorage key `noklock.enrol-skip-choices`
//                (sibling to noklock.vault-index, keyed by vaultId) so the
//                choice is recallable at restore-time / audit / future
//                inheritance-readiness checks.
//            (5) Fires a Form B audit beacon: POST /v1/track with
//                  { action: "enrol-skip-confirmed", scope: "test-restore",
//                    vaultId, kind, at }
//                via the existing fire-and-forget sendBeacon primitive.
//                Never blocks; never throws; mirrors postSegmentActivity()
//                shape in src/lib/track.ts.
//          Modal text is the verbatim copy from the H1 spec. The "Drill
//          passed → designate NoK" primary CTA is unchanged so the happy
//          path is untouched. Mood: gentle but unambiguous; the user owns
//          the decision and the record of having made it.
// 2.3.0 — Daniel 2026-06-02: Per-tier vault-size cap (§12.7) at the
//          file-upload UI. Free tier rejects files > 5 MB; paid tiers
//          (Casual/Standard/Lifetime/Premium) reject > 25 MB. Surface a
//          clear error with an inline upgrade CTA: "Vault size cap: 5 MB on
//          Free tier. Upgrade to Casual ($19/mo) for 25 MB. [Upgrade]". The
//          check runs on both the main file picker AND the duress decoy
//          picker (document + image kinds). Seed + letter kinds are
//          inherently small and not affected. Cap helper imported from
//          enrol-pipeline 0.8.0 so UI + pipeline boundary share the same
//          constants + message string (defense-in-depth — pipeline throws
//          if the UI is bypassed).
// 2.2.0 — Daniel 2026-06-02: welcome step gains a short "install the PWA
//          locally" paragraph. Two real reasons, no marketing fluff: every
//          page is cached locally so nothing has to load over the network
//          once you airgap (perf + offline-completeness), and the install
//          gives the browser a stable identity for the airgap manager to
//          harden against (security). Points the user at the URL-bar /
//          browser-menu install affordance — we don't try to fake-trigger
//          the install prompt from inside the wizard.
// 2.1.0 — Daniel 2026-06-01: per-step online/offline/boundary indicator on the
//          FlowSteps strip (pairs with FlowSteps 0.3.0). Each card now shows a
//          small badge in the top-right: green dot = ONLINE, yellow dot =
//          OFFLINE, split dot = BOUNDARY (transition). Mapping for all four
//          kinds (seed / letter / document / image — they share TITLES so the
//          map is one record): 1 Welcome = online; 2 Go offline = boundary;
//          3 Content = offline; 4 Threshold = offline; 5 Master password =
//          offline; 6 Duress (offer) = offline; 7 Duress decoy = offline;
//          8 Splitting + encrypting = offline; 9 Save share files = offline;
//          10 Store share locations = boundary (back online to distribute);
//          11 Test-restore drill = offline; 12 Next-of-kin = online (on-chain
//          NoK mint); 13 Done = online. Telegraphs the air-gap topology at a
//          glance and matches the visual language of the Restore Phase-3 strip.
// 2.0.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.6 [mofn-restore-quorum-fix-plan §D.6].
//          NEW second slider on the threshold-select step — `M` (heirs
//          required to release) + companion `N_heirs` (total heirs). It is
//          SEPARATE from the existing T/N share-threshold slider:
//            T-of-N shares = share-loss / share-availability protection
//            M-of-N heirs  = heir-cooperation protection (released on
//                            heir-restore via Form B QuorumReleaseAttestation;
//                            Stage 2 will swap in on-chain NoKLockQuorum).
//          The picker is HIDDEN on Free tier (no quorum, single-heir cap
//          on-chain) → cryptoQuorum is NOT passed to runEnrolPipeline and
//          the manifest stays byte-identical to today (grandfather). The
//          picker is CAPPED per tier: Standard M∈[1,2] N∈[1,3] (default
//          2/3); Premium / Lifetime-Premium / Family / Institutional
//          M∈[1,5] N∈[1,9] (default 2/3). Chosen M/N are plumbed into
//          runEnrolPipeline as `cryptoQuorum: { M, N, schemeId:
//          "claims-quorum-v1" }`; enrol-pipeline 0.6.0 writes it into the
//          signed manifest as `quorumPolicy`.
// 1.10.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//          NEW Premium-tier vaults default to cryptoBaseline "v3" — the
//          new baseline that adds randomised per-share filename masks on
//          top of the v2 HKDF/AAD chain. Wallets without the Premium-tier
//          feature gate (anything other than `documents` perk = Free /
//          Standard / Standard-Lifetime) stay on v2, so existing vault
//          flow + manifestHash are byte-identical. Both seed and
//          document/letter/image flows are wired.
// 1.9.0 — Daniel 2026-05-31: memory-wipe go-big landed alongside
//          enrol-pipeline.ts 0.4.0. (1) After the pipeline completes,
//          immediately drop React refs to seed / duress-seed / passkeys /
//          duress text (setX("")) so the strings become GC-eligible. (2)
//          After WebAuthn passkey wraps the master, synchronously
//          .fill(0) the master Uint8Array — it's persisted in the
//          encrypted envelope and no longer needed in memory. (3) Unmount
//          cleanup useEffect that fires on route nav / browser close —
//          drops all seed/passkey refs + wipes any lingering master
//          buffer. Honest explainer of the JS memory model on
//          /prove-it/source (strings cannot be synchronously wiped — no
//          JS API exists — but every DERIVED Uint8Array is now wiped).
// 1.8.0 — Stores manifestHash into the local vault index at enrol (same
//         hash doMintNok uses) so the new per-vault page can prefill
//         "Add NoK" with no hand-copying.
// 1.7.0 — Passkey honesty/discoverability (Daniel: saw nothing about
//         2FA/passkeys; my "Windows lacks WebAuthn" answer was wrong).
//         Master-password step now states plainly: no 2FA by design +
//         optional passkey comes later at the save step (PRF-capable
//         authenticator only). The save-step passkey card is NO LONGER
//         silently hidden when unsupported — it shows an honest note,
//         so it never reads as missing. PRF-fail message reassures the
//         master password still fully protects the vault.
// 1.6.0 — Vault-created analytics now fires when the vault is actually
//         WRITTEN (writeAllAndAdvance), once, not at the optional final
//         "done" screen. Daniel created a seed vault end-to-end and the
//         counter stayed 0 because he didn't click through the last
//         optional screens. (Live-tested: Form B accepts the events.)
// 1.5.0 — Document & image vaults are now HARD-GATED on the connected
//         wallet's on-chain Premium licence (Daniel: an honour-system
//         that "can still proceed" is just an advertised exploit). The
//         soft "free allowance / can still proceed" notice is GONE; a
//         non-Premium wallet gets a block screen (connect / see pricing
//         / pick another type) before the wizard renders. Seed (all
//         tiers) + sealed-letter (Free's 1) are unaffected. Removed the
//         now-dead KIND_FEATURE map + FeatureKey import.
// 1.4.0 — Veracity: the Free-tier notice claimed "a free allowance"
//         (Daniel: nothing of the sort exists / is counted / is shown).
//         Truth: NoKLock is self-custodial and never meters usage — there
//         is NO quota/counter/cap; the tier is honour-based. Copy now
//         says exactly that. Also emits "paid_tier_use" on a completed
//         paid (NoK-capable) enrolment so paid vaults show in Admin
//         stats next to free ones.
// 1.3.0 — "fill a throwaway test seed" helper now shows ONLY for the
//         contract-owner wallet (was visible to all users). NoK-mint
//         errors run through humanizeTxError (concise cancelled/failed).
// 1.2.0 — Share distribution: "Download share files" step renamed to
//         "Save share files" + plain explanation that getting the
//         encrypted files OUT is an enrol step (restore is the reverse).
//         Added a one-click "Save into a folder…" (File System Access,
//         Chrome/Edge) so files are written straight into a folder you
//         pick — no manual drag-out — with a download fallback. The
//         "Paste share URLs" step now offers TWO modes: Recommended
//         (one share per separate account — preserves the threshold
//         security promise) and Quick (one shared folder — simplest,
//         with an explicit single-point-of-compromise warning). Default
//         = spread. (Daniel item a / a1, "both, user chooses".)
// 1.1.0 — Seed step: explanatory invalid message + "fill a throwaway
//         test seed" generator (testers had no valid BIP39 phrase to
//         proceed). MaskedSecret for the real + duress master password:
//         hard anti-autofill (no prepopulation / no leak) + press-and-
//         hold eye to reveal. Image wording singular ("Upload your
//         image") to match document/letter + body text.
// 1.0.2 — Airgap step now reacts LIVE to online/offline (window events) —
//         the "I'm offline — start the airgap" button was gated on
//         isBrowserOnline() read in render with no listener, so it stayed
//         greyed even after the device went offline. Pairs with the PWA
//         navigateFallback fix (offline reload now serves the app).
// 1.0.1 — WS-H: emit a zero-PII "free_tier_use" event when a Free-tier
//         (no-NoK) enrolment completes. No PII; aggregate counter only.
// 1.0.0 — WS-A FLOW PARITY. Enrol is now ONE parameterized wizard. Seed,
//         Letter, Document and Image all run the IDENTICAL machine:
//         Welcome -> Go offline (airgap) -> Provide content -> Threshold ->
//         Set master password -> Duress (optional) -> Duress decoy ->
//         Splitting+encrypting -> Download share files -> Paste share URLs
//         -> Test-restore drill -> Next-of-kin (optional) -> Done. Only the
//         "Provide content" step differs by kind. Seed uses the proven
//         entropy pipeline (runEnrolPipeline, UNCHANGED); letter/document/
//         image use runDocPipeline (now master-exposing) with the SAME
//         airgap, duress, passkey, share-URL, test-restore + NoK steps.
//         Replaces the old flat EnrolLetter/EnrolDocument (no airgap, no
//         step strip, "passkey" misnomer) — that disparity is the defect
//         this fixes; "truly air-gapped" + "document inheritance is live"
//         are now true for every kind.
// (history) prior 0.6.x seed-only wizard — see git.

import { useState, useEffect, useRef } from "react";
import { MaskedSecret } from "../components/MaskedSecret.js";
import { InfoTooltip } from "../components/InfoTooltip.js";
import { EnrolProcessMap } from "../components/EnrolProcessMap.js";
import { RichTextEditor } from "../components/RichTextEditor.js";
import { sanitizeHtml, htmlHasText } from "../lib/sanitizeHtml.js";
import { isPasskeySupported, enrollPasskey, wrapMaster, cacheEnvelopeLocal, envelopeToJson } from "../lib/webauthn.js";
import { enterAirgap, leaveAirgap, isBrowserOnline, blockedFetchCount, subscribeAirgap, isAirgapped } from "../lib/airgap-manager.js";
import { bip39 } from "@soulchain/crypto-core";
import { runEnrolPipeline, shareBundleToJson, manifestToJson, vaultSizeCapBytes, vaultSizeCapMessage } from "../lib/enrol-pipeline.js";
import { runDocPipeline, docShareBundleToJson, docManifestToJson, type DocKind } from "../lib/doc-pipeline.js";
import { manifest as manifestLib } from "@soulchain/crypto-core";
import { LocalFileAdapter, detectProvider, normaliseShareUrl, PROVIDERS } from "@soulchain/storage-adapters";
import { recordVaultInIndex } from "./Vaults.js";
import { useNokMint } from "../hooks/useNokMint.js";
import { useTierGate } from "../hooks/useTierGate.js";
import { useT } from "../i18n/index.js";
import { ConnectWallet } from "../components/ConnectWallet.js";
import { CliUploadModal } from "../components/CliUploadModal.js";
import { ShareYourVault } from "../components/ShareYourVault.js";
import { trackEvent, trackEventDurable, type TrackEventName } from "../lib/track.js";
import { humanizeTxError } from "../lib/txError.js";
import { isValidEthAddress } from "../lib/validators.js";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { licenseAbi, LICENSE_ADDR } from "../lib/contracts.js";
import type { Address } from "viem";

export type EnrolKind = "seed" | "letter" | "document" | "image";

type Step =
  | "welcome" | "free-tools-checkpoint" | "airgap" | "content" | "threshold-select" | "passkey"
  | "duress-offer" | "duress-entry" | "running" | "download"
  | "share-urls" | "test-restore" | "nok-designate" | "done";

/** 2.7.0 (AD1.6) — sessionStorage completion marker. Keyed by
 *  `enrolSessionKey(kind, walletAddr)` so back/forward in the same
 *  browser session sees the prior completion and gates re-enrolment.
 *  Cleared by sessionStorage scope (tab close), NOT by tab refresh —
 *  refresh is the exact case this fix is for. */
interface EnrolCompletionMarker {
  readonly vaultId: string;
  readonly step: Step;
  readonly completedAt: number; // epoch ms
}

/** Stable sessionStorage key for the AD1.6 completion gate. Wallet may
 *  be undefined (user never connected) — we still gate on the kind so a
 *  guest who finished a Free seed-vault enrolment doesn't get walked
 *  through a second one on back/forward. Lowercased to match wagmi's
 *  checksum-agnostic address handling elsewhere in this file. */
function enrolSessionKey(kind: EnrolKind, walletAddr: string | undefined): string {
  const addr = (walletAddr ?? "anon").toLowerCase();
  return `noklock.enrol-session.${kind}.${addr}`;
}

function readEnrolMarker(kind: EnrolKind, walletAddr: string | undefined): EnrolCompletionMarker | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(enrolSessionKey(kind, walletAddr));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EnrolCompletionMarker>;
    if (
      typeof parsed.vaultId !== "string" ||
      typeof parsed.step !== "string" ||
      typeof parsed.completedAt !== "number"
    ) return null;
    return parsed as EnrolCompletionMarker;
  } catch {
    return null;
  }
}

function writeEnrolMarker(kind: EnrolKind, walletAddr: string | undefined, marker: EnrolCompletionMarker): void {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(enrolSessionKey(kind, walletAddr), JSON.stringify(marker));
  } catch {
    // sessionStorage quota / disabled — non-fatal, gate just won't fire on back/forward.
  }
}

/** 2.8.0 (AD1.7) — sessionStorage key for the vault-creator wallet
 *  capture. Per-vault (NOT per-kind) because each enrolment produces a
 *  fresh `vaultId` and we want the pre-tx verify to bind the SBT mint
 *  to the *specific* vault's creator, not the most recent enrolment for
 *  that kind. Cleared on tab close (sessionStorage scope). */
function vaultCreatorKey(vaultId: string): string {
  return `noklock.vault-creator.${vaultId}`;
}

function writeVaultCreator(vaultId: string, walletAddr: string): void {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(vaultCreatorKey(vaultId), walletAddr.toLowerCase());
  } catch {
    // sessionStorage quota / disabled — non-fatal; the pre-tx verify
    // simply won't fire and falls back to the in-hook AD1.7 guard.
  }
}

function readVaultCreator(vaultId: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(vaultCreatorKey(vaultId));
  } catch {
    return null;
  }
}

const CONTENT_TITLE: Record<EnrolKind, string> = {
  seed: "Enter your seed",
  letter: "Write or upload your letter",
  document: "Upload your document",
  image: "Upload your image",
};

function stepTitles(kind: EnrolKind): Record<Step, string> {
  return {
    welcome: "Welcome",
    "free-tools-checkpoint": "Free tools (optional)",
    airgap: "Go offline",
    content: CONTENT_TITLE[kind],
    "threshold-select": "Threshold",
    passkey: "Set master password",
    "duress-offer": "Duress (optional)",
    "duress-entry": "Duress decoy",
    running: "Splitting + encrypting",
    download: "Save share files",
    "share-urls": "Store share locations",
    "test-restore": "Test-restore drill",
    "nok-designate": "Next-of-kin (optional)",
    done: "Done",
  };
}

// 0.x (Daniel 2026-06-15) — STEP_SUB / STEP_STATE removed: the process strip is
// now the self-contained <EnrolProcessMap/>, which owns its own curated display
// model (phases, per-step actor/optional/connectivity). The 13-step Step union
// still drives the wizard state machine + the per-step h1 (TITLES).

const KIND_NOUN: Record<EnrolKind, string> = {
  seed: "crypto seed phrase",
  letter: "sealed letter",
  document: "document",
  image: "image",
};
// Document & image vaults are a Premium-tier capability. There is no
// way to meter off-chain client-side files, so this is HARD-GATED on the
// connected wallet's on-chain licence (not an honour-system nudge):
// non-Premium simply cannot run the document/image wizard. Seed (base
// case, all tiers) and sealed-letter (Free includes 1) are NOT gated.
const ACCEPTED: Record<"letter" | "document" | "image", string> = {
  letter: ".txt,.rtf,.doc,.docx,.md,.pdf",
  document: ".txt,.rtf,.doc,.docx,.md,.pdf,.csv,.json,.zip",
  image: "image/*,.zip",
};

interface WizShare { readonly index: number; readonly filename: string; readonly json: Uint8Array; }
interface WizVault {
  readonly vaultId: string;
  readonly shares: readonly WizShare[];
  readonly manifestJson: Uint8Array;
  readonly manifestObj: Parameters<typeof manifestLib.manifestHash>[0];
}
interface WizOut extends WizVault {
  readonly master: Uint8Array;
  readonly duress?: WizVault;
}

export function Enrol({ kind }: { readonly kind: EnrolKind }): JSX.Element {
  const TITLES = stepTitles(kind);
  const [step, setStep] = useState<Step>("welcome");

  // Content (per kind)
  const [seed, setSeed] = useState("");
  const [letterMode, setLetterMode] = useState<"compose" | "upload">("compose");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [passkey, setPasskey] = useState("");
  const [threshold, setThreshold] = useState(3);
  const [total, setTotal] = useState(5);

  // 2.0.0 — M-of-N heir-cooperation quorum (plan §D.6). Separate from the
  // T-of-N share-threshold above. Defaults: 2-of-3 (matches Standard cap +
  // Premium baseline marketing). Caps applied by tier on the widget below;
  // Free tier hides the picker entirely (no quorum, single-heir on-chain).
  const [quorumM, setQuorumM] = useState(2);
  const [quorumNHeirs, setQuorumNHeirs] = useState(3);
  // 0.4.0 (Daniel 2026-06-16) — quorum is now OPT-IN, even on paid tiers.
  // Default OFF → no quorumPolicy in the manifest → each heir gets ONE token
  // (Activation only). Only when the owner turns this on does the vault become
  // M-of-N and each heir also get a Voting token.
  const [quorumEnabled, setQuorumEnabled] = useState(false);

  const [duressOn, setDuressOn] = useState(false);
  const [dSeed, setDSeed] = useState("");
  const [dText, setDText] = useState("");
  const [dFile, setDFile] = useState<File | null>(null);
  const [dPasskey, setDPasskey] = useState("");

  const [pkState, setPkState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [pkErr, setPkErr] = useState<string | null>(null);

  const [output, setOutput] = useState<WizOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 2.6.1 (H20) — synchronous re-entry guard for doMintNok(). Flipped
  // at function entry, cleared in finally. Re-entrant clicks (double-
  // tap, double-click) return immediately so the wallet isn't prompted
  // twice and useNokMint isn't run in parallel.
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 2.5.0 (H2) — non-blocking warning surfaced when recordVaultInIndex
  // fails. Vault files are already on disk by the time this fires; the
  // user can dismiss + continue. Cleared whenever the user dismisses.
  const [indexWarning, setIndexWarning] = useState<string | null>(null);
  const [cliModalOpen, setCliModalOpen] = useState<boolean>(false);

  // 0.5.0 — Unmount cleanup. When the user navigates away (back button,
  // route change, browser close), drop ALL seed/passkey-related React
  // refs AND wipe any lingering Uint8Array buffers (master) we still
  // hold. The strings become unreferenced and GC-eligible; the bytes are
  // synchronously zeroed. Honestly explained on /prove-it/source.
  useEffect(() => {
    return () => {
      setSeed("");
      setDSeed("");
      setPasskey("");
      setDPasskey("");
      setText("");
      setDText("");
      // master buffer (if we still have it — passkey-unlock path wipes it
      // already; this catches the case where user leaves before that).
      try { output?.master?.fill(0); } catch { /* already wiped or gone */ }
    };
    // intentionally NOT including `output` in deps — we only want this to
    // fire on actual unmount, not on every output state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nokWallet, setNokWallet] = useState("");
  const mint = useNokMint();
  const gate = useTierGate();
  const { t } = useT();

  // 2.7.0 (AD1.6) — prior-enrolment gate. Read sessionStorage on mount
  // (and whenever the connected wallet flips) to detect a completion
  // marker for the current { kind, wallet } pair. If we find one, the
  // wizard renders the "Already enrolled — restore at /restore" block
  // INSTEAD of restarting at welcome. State is a React snapshot so the
  // gate updates immediately when we WRITE the marker too (post
  // writeAllAndAdvance success).
  const { address: connectedAddrForMarker } = useAccount();
  const [priorEnrolment, setPriorEnrolment] = useState<EnrolCompletionMarker | null>(
    () => readEnrolMarker(kind, undefined),
  );
  useEffect(() => {
    setPriorEnrolment(readEnrolMarker(kind, connectedAddrForMarker));
  }, [kind, connectedAddrForMarker]);

  // 2.7.0 (AD1.6) — beforeunload handler. Refresh / tab navigation
  // away clears SENSITIVE ephemeral state (seed strings, passkeys,
  // duress secrets) but PRESERVES the completion marker. This way:
  //   - back/forward → marker survives → user sees the gate, not a
  //     half-finished wizard with stale plaintext seed.
  //   - secrets are NOT left to be deserialised by a back-button cache
  //     restore in browsers that do that for form state.
  // Note: React's controlled inputs already make a back-restore unable
  // to repopulate the textarea without going through state, but
  // belt-and-braces — we explicitly wipe at the JS boundary too.
  useEffect(() => {
    const onBeforeUnload = (): void => {
      try {
        setSeed("");
        setDSeed("");
        setPasskey("");
        setDPasskey("");
        setText("");
        setDText("");
      } catch {
        // ignore — React may already be tearing down.
      }
      // intentionally do NOT clear the sessionStorage marker here.
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // 2.4.0 — H1 fix: explicit test-restore skip. Modal-open flag for
  // <TestRestoreSkipModal/> rendered below at the test-restore step. On
  // confirm we persist the skip choice + fire the audit beacon.
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  // 2.8.0 (AD1.7) — wallet-switched modal state. Populated by doMintNok
  // when the pre-tx verify finds the connected wallet differs from the
  // address that created this vault. `vaultCreator` is the address
  // captured at enrol-pipeline completion (writeAllAndAdvance);
  // `nowConnected` is the address right now per wagmi useAccount.
  // Cleared when the modal is dismissed or the user restarts enrol.
  const [walletSwitchedModal, setWalletSwitchedModal] = useState<
    null | { vaultCreator: string; nowConnected: string | undefined }
  >(null);

  // 2.8.0 (AD1.7) — second-line defence: react to the hook flipping to
  // "stale" mid-flow (a swap detected by useNokMint's useAccountEffect
  // AFTER doMintNok's pre-tx verify already passed). Open the same
  // modal so the user gets the same recovery affordances regardless of
  // which AD1.7 layer caught the swap. mint.staleReason carries both
  // addresses (started-with + now-connected).
  // We only open if the modal isn't already shown so we don't clobber a
  // user mid-interaction (e.g. they already clicked "Switch back").
  useEffect(() => {
    if (mint.step === "stale" && mint.staleReason && !walletSwitchedModal) {
      setWalletSwitchedModal({
        vaultCreator: mint.staleReason.startedWith.toLowerCase(),
        nowConnected: mint.staleReason.nowConnected?.toLowerCase(),
      });
    }
    // intentionally exclude walletSwitchedModal from deps — we only want
    // this to fire when the hook state transitions into "stale", not
    // every time the modal opens / closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint.step, mint.staleReason]);

  // 2.0.0 — Per-tier caps for the M-of-N heir-cooperation quorum picker.
  // Source of truth = the marketing-locked tier matrix (plan §D.6 + §G):
  //   Free       — picker HIDDEN; quorumPolicy NOT written; on-chain NoK
  //                cap = 1 so the gate doesn't apply.
  //   Standard / Std-Lifetime (tiers 1,2) — M∈[1,2], N_heirs∈[1,3], default 2/3.
  //   Premium+ (tiers 3,4,5,6) — M∈[1,5], N_heirs∈[1,9], default 2/3.
  // The widget caps below clamp slider INPUT so the user can never exceed
  // their tier. The plumbing into runEnrolPipeline also short-circuits to
  // undefined when Free — that double-protects against UI smuggling.
  const quorumTierCap: {
    readonly show: boolean;
    readonly maxM: number;
    readonly maxNHeirs: number;
    readonly tierLabel: string;
  } = (() => {
    if (gate.tier === 0) return { show: false, maxM: 1, maxNHeirs: 1, tierLabel: "Free" };
    if (gate.tier === 1 || gate.tier === 2) return { show: true, maxM: 2, maxNHeirs: 3, tierLabel: "Standard" };
    return { show: true, maxM: 5, maxNHeirs: 9, tierLabel: "Premium" };
  })();

  // 2.0.0 — Clamp M / N_heirs whenever the tier (and so the cap) changes.
  // Slider inputs also clamp on edit, but the user may have moved the
  // sliders BEFORE the on-chain licence finished loading; this keeps the
  // values in-range if the cap drops once the licence resolves.
  useEffect(() => {
    setQuorumNHeirs((n) => Math.max(1, Math.min(quorumTierCap.maxNHeirs, n)));
    setQuorumM((m) => Math.max(1, Math.min(quorumTierCap.maxM, m)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quorumTierCap.maxM, quorumTierCap.maxNHeirs]);

  const [shareUrls, setShareUrls] = useState<readonly string[]>([]);
  const [pickedProviders, setPickedProviders] = useState<readonly string[]>([]);

  // Owner-only override: normal users are HARD-LIMITED to the secure
  // spread (one share per separate account). The contract-owner wallet
  // (same gate as /admin) may switch to the single-shared-folder path to
  // test it — that path is never offered to users (it removes the
  // threshold-split protection: one compromised folder = whole vault).
  const { address: connectedAddr } = useAccount();
  const { data: ownerAddr } = useReadContract({ abi: licenseAbi, address: LICENSE_ADDR, functionName: "owner" });
  const isOwner = !!connectedAddr && !!ownerAddr && connectedAddr.toLowerCase() === ownerAddr.toString().toLowerCase();
  const [ownerFolderMode, setOwnerFolderMode] = useState(false);
  const [folderUrl, setFolderUrl] = useState("");
  const [savedToFolder, setSavedToFolder] = useState(false);

  const [airgapConfirmed, setAirgapConfirmed] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeAirgap(() => setBlockedCount(blockedFetchCount()));
    return () => { unsubscribe(); };
  }, []);

  // 2.9.0 — MED-enrol-2 guard: airgap engagement is single-use per enrol
  // session. `airgapEngagedAt` records the (one) moment we transitioned
  // online → airgapped via enterAirgap(); `airgapLeftAt` records the (one)
  // moment we transitioned back via leaveAirgap(). leaveAirgapOnce()
  // wraps the underlying airgap-manager call: it no-ops if no engagement
  // has happened yet (defensive — leave-before-engage is a programmer
  // error), and it no-ops if a leave has already been recorded (the bug
  // this guard exists to prevent: a user toggling back/forward across the
  // airgap boundary mid-flow). Refs (not state) because these are guard
  // tokens, not rendered UI — we don't want a re-render on each set.
  const airgapEngagedAt = useRef<number | null>(null);
  const airgapLeftAt = useRef<number | null>(null);
  function engageAirgapOnce(): void {
    if (airgapEngagedAt.current !== null) return; // already engaged this session
    airgapEngagedAt.current = Date.now();
    airgapLeftAt.current = null; // reset paired guard for the (single) cycle
    enterAirgap();
  }
  function leaveAirgapOnce(): void {
    if (airgapEngagedAt.current === null) return; // never engaged — nothing to leave
    if (airgapLeftAt.current !== null) return;    // already left — single-use
    airgapLeftAt.current = Date.now();
    leaveAirgap();
  }

  // Funnel signal: a user actually entered the Enrol wizard for some kind.
  // Pair with free_tier_use / paid_tier_use (which fire at completion) to
  // compute drop-off. Fires once per mount per browser/day per kind via the
  // shared client-deduped helper. Zero-PII, gated by isExcluded().
  useEffect(() => { trackEvent("enrol_started"); }, []);

  // 0.9.0 FUNNEL instrumentation (Daniel 2026-06-15) — fire a per-step
  // checkpoint once per step per session so the Admin funnel shows WHERE
  // enrolment leaks (started → airgap → content → [auto split] → shares →
  // drill → nok → completed). Durable: the offline (airgapped) checkpoints
  // survive to the next online boot, so a bail mid-flow is still captured.
  const firedStepBeacons = useRef<Set<TrackEventName>>(new Set());
  useEffect(() => {
    const map: Partial<Record<Step, TrackEventName>> = {
      airgap: "enrol_reached_airgap",
      content: "enrol_reached_content",
      "share-urls": "enrol_reached_shares",
      "test-restore": "enrol_reached_drill",
      "nok-designate": "enrol_reached_nok",
    };
    const ev = map[step];
    if (ev && !firedStepBeacons.current.has(ev)) {
      firedStepBeacons.current.add(ev);
      trackEventDurable(ev);
    }
  }, [step]);

  // Live online/offline so the airgap step reacts the instant the device
  // is disconnected (isBrowserOnline() alone is read in render and would
  // otherwise go stale — the "start the airgap" button stayed greyed).
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

  // WS-H: count a created vault (zero-PII aggregate, no per-user state).
  // Fired ONCE when the vault is actually written (see writeAllAndAdvance)
  // — NOT at the final "done" screen: a fully-created vault where the
  // user didn't click through the optional last steps was never counted
  // (Daniel: created a seed vault end-to-end, analytics stayed 0). Free =
  // the no-NoK path; paid = NoK-capable (Standard+).
  const vaultEventSent = useRef(false);

  // 2.10.0 — LOW-7 FIX (Daniel 2026-06-03): manifest hash was computed
  // independently in writeAllAndAdvance (for the vault index entry) AND
  // in doMintNok (for the SBT mint payload). Two derivations of the same
  // canonical hash from the same manifest object — same algorithm, same
  // inputs — but no cross-check, so a divergence (a future code path
  // mutating manifestObj between write + mint, a subtle hashing-lib bump
  // on one call site only, a serialisation-order regression) would
  // silently desynchronise the on-chain SBT from the on-disk vault.
  // Fix: compute ONCE in writeAllAndAdvance (the moment the vault genuinely
  // exists on disk), stash in this ref, read in doMintNok. doMintNok ALSO
  // recomputes from manifestObj and ASSERTS byte-equality with the stored
  // value — throw on mismatch so we surface the bug loud rather than mint
  // a divergent SBT. Ref (not state) because the value is a fingerprint
  // we read at submit time, not rendered UI.
  const manifestHashRef = useRef<string | null>(null);

  const passkeyValid = passkey.length >= 8;
  const dPasskeyValid = dPasskey.length >= 8 && dPasskey !== passkey;

  function contentValid(s: string, m: "compose" | "upload", t: string, f: File | null): boolean {
    if (kind === "seed") return bip39.isValidBip39(s);
    if (kind === "letter") return m === "compose" ? htmlHasText(t) : !!f;
    return !!f; // document | image
  }
  const mainValid = contentValid(seed, letterMode, text, file);
  const duressValid = contentValid(dSeed, "compose", dText, dFile) && dPasskeyValid;

  const docKind = kind === "document" || kind === "image";

  // 2.3.0 — Per-tier vault-size cap (§12.7). Helper reads the effective tier
  // from useTierGate (post-lapse) and returns the cap in bytes — Free → 5 MB,
  // paid → 25 MB. Same helper called at both file pickers (main + duress)
  // and the same canonical error message as the pipeline-boundary throw.
  const sizeCapBytes = vaultSizeCapBytes(gate.tier);
  const sizeCapMb = Math.round(sizeCapBytes / (1024 * 1024));

  /** Validate a picked file against the per-tier cap. On accept, sets the
   *  caller's file slot and clears any prior cap error. On reject, leaves
   *  the slot empty and surfaces the canonical message via setError. */
  function pickFileWithCap(f: File | null, setSlot: (f: File | null) => void): void {
    if (!f) { setSlot(null); return; }
    if (f.size > sizeCapBytes) {
      setSlot(null);
      setError(vaultSizeCapMessage());
      return;
    }
    setError(null);
    setSlot(f);
  }

  function bytesAndMeta(t: string, f: File | null, asHtml = false): Promise<{ plaintext: Uint8Array; mimeType?: string; originalFilename?: string; label: string }> {
    if (kind === "letter" && letterMode === "compose") {
      // Rich compose stores sanitized HTML (mimeType text/html); the decoy
      // letter stays plain text. Restore renders text/html via RichTextView,
      // and legacy text/plain letters keep their existing <pre> reader.
      const body = asHtml ? sanitizeHtml(t) : t;
      return Promise.resolve({
        plaintext: new TextEncoder().encode(body),
        mimeType: asHtml ? "text/html" : "text/plain",
        label: `letter-${new Date().toISOString().slice(0, 10)}`,
      });
    }
    if (!f) return Promise.reject(new Error("Pick a file first"));
    return f.arrayBuffer().then((ab) => ({
      plaintext: new Uint8Array(ab),
      mimeType: f.type || "application/octet-stream",
      originalFilename: f.name,
      label: `${kind}-${f.name.slice(0, 32)}`,
    }));
  }

  async function runPipeline(): Promise<void> {
    setError(null);
    setStep("running");
    try {
      // 1.10.0 — LAUNCH-BLOCKER 2: Premium-tier vaults default to cryptoBaseline
      // "v3" (randomised filename masks). Premium ↔ `documents` perk in the
      // tier-gate. Non-Premium wallets stay on v2 so their manifestHash is
      // byte-identical to today's flow (legacy vaults grandfather).
      const baselineForNewVault = gate.has("documents") ? ("v3" as const) : ("v2" as const);
      // 2.0.0 — M-of-N quorum plumbing. Free tier (no quorum widget shown)
      // passes NO cryptoQuorum → manifest omits `quorumPolicy` → manifestHash
      // byte-identical to today (grandfather). Standard+/Premium+ pass the
      // chosen { M, N_heirs } with the canonical scheme id.
      const cryptoQuorum = quorumTierCap.show && quorumEnabled
        ? { M: quorumM, N: quorumNHeirs, schemeId: "claims-quorum-v1" as const }
        : undefined;
      if (kind === "seed") {
        const duress = duressOn ? { mnemonic: dSeed, passkey: dPasskey } : undefined;
        const r = await runEnrolPipeline({ mnemonic: seed, passkey, shamir: { threshold, total }, cryptoBaseline: baselineForNewVault, tier: gate.tier, ...(cryptoQuorum ? { cryptoQuorum } : {}) }, duress);
        const main: WizVault = {
          vaultId: r.vaultId,
          manifestObj: r.manifest,
          manifestJson: manifestToJson(r.manifest),
          shares: r.shares.map((sh) => ({ index: sh.index, filename: sh.filename, json: shareBundleToJson(sh, r.vaultId) })),
        };
        const wiz: WizOut = r.duress
          ? { ...main, master: r.master, duress: {
              vaultId: r.duress.vaultId,
              manifestObj: r.duress.manifest,
              manifestJson: manifestToJson(r.duress.manifest),
              shares: r.duress.shares.map((sh) => ({ index: sh.index, filename: sh.filename, json: shareBundleToJson(sh, r.duress!.vaultId) })),
            } }
          : { ...main, master: r.master };
        setOutput(wiz);
        // 0.5.0 — Memory-wipe go-big: drop React's references to seed +
        // duress-seed + passkeys the moment the pipeline has consumed them.
        // The strings are GC-eligible immediately; combined with the
        // synchronous Uint8Array wipes inside enrol-pipeline.ts (entropy,
        // prk, per-share keys, share plaintexts, signSeed), this minimises
        // the lifetime of any seed-derived material in the heap. See
        // /prove-it/source for the honest JS memory model explainer.
        setSeed("");
        setDSeed("");
        setPasskey("");
        setDPasskey("");
      } else {
        const docKind: DocKind = kind === "letter" ? "sealed-letter" : "document";
        const meta = await bytesAndMeta(text, file, true);
        const r = await runDocPipeline({
          kind: docKind, tier: gate.tier, plaintext: meta.plaintext, passkey, shamir: { threshold, total },
          ...(meta.mimeType ? { mimeType: meta.mimeType } : {}),
          ...(meta.originalFilename ? { originalFilename: meta.originalFilename } : {}),
          label: meta.label,
          cryptoBaseline: baselineForNewVault,
        });
        const main: WizVault = {
          vaultId: r.vaultId,
          manifestObj: r.manifest,
          manifestJson: docManifestToJson(r.manifest),
          shares: r.shares.map((sh) => ({ index: sh.index, filename: sh.filename, json: docShareBundleToJson(sh, r.vaultId, docKind) })),
        };
        let duress: WizVault | undefined;
        if (duressOn) {
          const dmeta = await bytesAndMeta(dText, dFile);
          const dr = await runDocPipeline({
            kind: docKind, tier: gate.tier, plaintext: dmeta.plaintext, passkey: dPasskey, shamir: { threshold, total },
            ...(dmeta.mimeType ? { mimeType: dmeta.mimeType } : {}),
            ...(dmeta.originalFilename ? { originalFilename: dmeta.originalFilename } : {}),
            label: dmeta.label,
            cryptoBaseline: baselineForNewVault,
          });
          duress = {
            vaultId: dr.vaultId,
            manifestObj: dr.manifest,
            manifestJson: docManifestToJson(dr.manifest),
            shares: dr.shares.map((sh) => ({ index: sh.index, filename: sh.filename, json: docShareBundleToJson(sh, dr.vaultId, docKind) })),
          };
        }
        setOutput(duress ? { ...main, master: r.master, duress } : { ...main, master: r.master });
        // 0.5.0 — Same memory-wipe approach as the seed path: drop React
        // references to passkeys + duress text/file as soon as the pipeline
        // has consumed them. The plaintext for doc/letter kinds came from
        // a File or textarea — those are released when the component cleans
        // them up. (See /prove-it/source.)
        setPasskey("");
        setDPasskey("");
        setDText("");
      }
      setStep("download");
    } catch (e) {
      setError((e as Error).message);
      setStep(duressOn ? "duress-entry" : "passkey");
    }
  }

  async function writeVault(adapter: LocalFileAdapter, v: WizVault): Promise<void> {
    for (const sh of v.shares) {
      await adapter.put({ path: `noklock/${v.vaultId}/${sh.filename}`, bytes: sh.json, contentType: "application/json" });
    }
    await adapter.put({ path: `noklock/${v.vaultId}/manifest.json`, bytes: v.manifestJson, contentType: "application/json" });
  }

  async function writeAllAndAdvance(adapter: LocalFileAdapter): Promise<void> {
    if (!output) return;
    await writeVault(adapter, output);
    if (output.duress) await writeVault(adapter, output.duress);
    // 2.10.0 (LOW-7) — compute the canonical manifest hash ONCE here,
    // the moment the vault genuinely exists on disk. Stashed in
    // manifestHashRef for doMintNok to read at SBT-mint time so the
    // on-chain payload is byte-identical to the index entry written
    // below. doMintNok asserts equality on a recompute, so any future
    // divergence throws loud rather than silently minting a desynced SBT.
    const manifestHashHex = "0x" + Array.from(manifestLib.manifestHash(output.manifestObj)).map((b) => b.toString(16).padStart(2, "0")).join("");
    manifestHashRef.current = manifestHashHex;
    try {
      recordVaultInIndex({
        vaultId: output.vaultId,
        kind: (kind === "seed" ? "seed" : kind === "letter" ? "letter" : "document") as never,
        label: `${KIND_NOUN[kind]} ${new Date().toLocaleDateString()}`,
        summary: `${threshold}-of-${total}`,
        // Same hash the SBT mint uses (see doMintNok) — stored so the
        // per-vault page can prefill "Add NoK" with zero hand-copying.
        manifestHash: manifestHashHex,
      } as never);
    } catch (e) {
      // 2.5.0 (H2) — index is best-effort but failure is NOT silent any
      // more. Log so DevTools / error reporters pick it up; surface a
      // non-blocking warning the user actually sees on the next step.
      // Vault files are already written, so we keep advancing.
      console.error("[enrol] recordVaultInIndex failed", e);
      setIndexWarning(
        "Vault saved but local index entry failed — won't appear in /vaults unless you restore it manually.",
      );
    }
    // The vault is now actually written → count it once, here (NOT at the
    // optional final screen). Zero-PII aggregate; free vs paid by NoK tier.
    if (!vaultEventSent.current) {
      vaultEventSent.current = true;
      // 0.8.0 traction — DURABLE: this fires the moment the vault hits disk,
      // which for an airgapped user is OFFLINE (sendBeacon would silently drop
      // it). trackEventDurable queues it and replays on reconnect so FREE-tier
      // vaults — which mint nothing on-chain — are still counted. vault_created
      // is the tier-agnostic "a vault exists" signal; the free/paid split is
      // kept for the funnel; enrol_completed pairs with enrol_started.
      trackEventDurable(gate.has("nok") ? "paid_tier_use" : "free_tier_use");
      trackEventDurable("vault_created");
      trackEventDurable("enrol_completed");
    }
    // 2.7.0 (AD1.6) — persist the completion marker in sessionStorage so
    // back/forward in this tab session lands on the "already enrolled"
    // gate instead of restarting the wizard. Keyed by { kind, wallet }
    // so each kind / connected wallet is gated independently. Wallet
    // may be undefined (anon) — that's fine, key falls back to "anon".
    const marker: EnrolCompletionMarker = {
      vaultId: output.vaultId,
      step: "share-urls",
      completedAt: Date.now(),
    };
    writeEnrolMarker(kind, connectedAddrForMarker, marker);
    setPriorEnrolment(marker);
    // 2.8.0 (AD1.7) — stamp the connected wallet at the exact moment
    // the vault genuinely exists on disk. doMintNok will compare this
    // captured address against the connected address at mint time and
    // refuse to broadcast if they differ. We use connectedAddrForMarker
    // (which is the same useAccount address used for the AD1.6 marker)
    // — if the user is anon at this point we DO NOT write a creator,
    // because the verify branch then has nothing to compare against and
    // the user will be required to connect a wallet before minting
    // (existing useNokMint guard `!address → "Connect a wallet first"`).
    if (connectedAddrForMarker) {
      writeVaultCreator(output.vaultId, connectedAddrForMarker);
    }
    setStep("share-urls"); // record where the files went next; then test-restore
  }

  // Per-file browser download (every browser).
  async function downloadAll(): Promise<void> {
    if (!output) return;
    try {
      await writeAllAndAdvance(new LocalFileAdapter());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Chrome/Edge: pick a LOCAL folder; NoKLock writes every file straight
  // into it (no save-each). If that folder is a desktop-synced cloud
  // folder, the cloud's own app syncs it up — NoKLock never touches the
  // cloud itself.
  async function saveToFolder(): Promise<void> {
    if (!output) return;
    const adapter = new LocalFileAdapter();
    try {
      await adapter.authenticate(); // opens the directory picker
      await writeAllAndAdvance(adapter);
      setSavedToFolder(true);
    } catch (e) {
      const msg = (e as Error).message ?? String(e);
      if (/abort/i.test(msg)) return; // user cancelled the picker — no error
      setError(msg);
    }
  }

  // OPTIONAL real WebAuthn passkey — wraps an encrypted copy of master into
  // a sidecar. Additive only; master password stays recovery/inheritance root.
  async function addPasskey(): Promise<void> {
    if (!output) return;
    setPkErr(null);
    setPkState("working");
    try {
      const { credentialId, prfSalt, prfSecret } = await enrollPasskey(output.vaultId.slice(0, 8));
      const env = await wrapMaster(output.vaultId, output.master, credentialId, prfSalt, prfSecret);
      cacheEnvelopeLocal(env);
      await new LocalFileAdapter().put({
        path: `noklock/${output.vaultId}/passkey-unlock.json`,
        bytes: envelopeToJson(env),
        contentType: "application/json",
      });
      // 0.5.0 — Master is now wrapped + persisted in the encrypted envelope.
      // The raw bytes are no longer needed in memory. Wipe the buffer
      // synchronously and drop the React ref. (Envelope re-derives master
      // from passkey when needed.)
      output.master.fill(0);
      setPkState("done");
    } catch (e) {
      setPkErr((e as Error).message ?? String(e));
      setPkState("error");
    }
  }

  async function doMintNok(): Promise<void> {
    // H20 (2.6.1): synchronous re-entry guard. Returns immediately on a
    // double-click / re-entrant call so the wallet doesn't get prompted
    // twice and useNokMint isn't run in parallel.
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!output) return;
      // H19 (2.6.0): shared validator — trims whitespace then enforces
      // 0x + 40-hex shape. See src/lib/validators.ts 0.2.0.
      if (!isValidEthAddress(nokWallet)) { setError("Invalid NoK wallet"); return; }
      // 2.8.0 (AD1.7) — pre-tx wallet-creator verify. If the connected
      // address differs from the address that built this vault, we
      // refuse to call useNokMint and surface a modal instead. The
      // creator was written in writeAllAndAdvance the moment the vault
      // existed on disk — see vaultCreatorKey() / writeVaultCreator().
      // If there is no captured creator (anon enrolment, sessionStorage
      // disabled), we fall through to the in-hook AD1.7 useAccountEffect
      // guard which is still active.
      const creator = readVaultCreator(output.vaultId);
      if (creator) {
        const now = connectedAddr ? connectedAddr.toLowerCase() : undefined;
        if (!now || now !== creator) {
          setWalletSwitchedModal({ vaultCreator: creator, nowConnected: now });
          return;
        }
      }
      setError(null);
      // 2.10.0 (LOW-7) — single source of truth for manifest hash. The
      // canonical value is computed once in writeAllAndAdvance and stashed
      // in manifestHashRef. We READ from the ref; if the ref is missing
      // (defence in depth — a code path that calls doMintNok without going
      // through writeAllAndAdvance first), fall back to a fresh compute.
      // We ALSO recompute here and assert byte-equality with the stored
      // value: any divergence means the manifest object mutated between
      // write + mint, or the hashing library is producing different output
      // for the same input — both bugs we want to surface LOUD rather than
      // mint a divergent SBT that the on-disk vault can't authenticate
      // against. Throwing here aborts the mint via the existing try/finally
      // (clears isSubmitting) and setError surfaces the message to the user.
      const mhashRecomputed = "0x" + Array.from(manifestLib.manifestHash(output.manifestObj)).map((b) => b.toString(16).padStart(2, "0")).join("");
      const mhashStored = manifestHashRef.current;
      if (mhashStored !== null && mhashStored !== mhashRecomputed) {
        const msg = `Manifest hash mismatch — stored ${mhashStored.slice(0, 10)}… recomputed ${mhashRecomputed.slice(0, 10)}…. Refusing to mint a divergent SBT.`;
        setError(msg);
        throw new Error(msg);
      }
      const mhash = mhashStored ?? mhashRecomputed;
      // 0.4.0 — single heir = ONE token. Mint the Voting token ONLY when this
      // vault carries an M-of-N quorumPolicy (read from the just-signed
      // manifest — the authoritative source). A quorum vault MUST get Voting
      // per heir or the quorum can never be met; a non-quorum vault gets just
      // the Activation token. Revocation is dropped entirely (it gated nothing).
      await mint.mint({
        nokWallet: nokWallet.trim() as Address,
        vaultId: output.vaultId,
        manifestHash: mhash,
        quorum: !!output.manifestObj.quorumPolicy,
      });
      // 0.8.0 traction — a next-of-kin was just designated on-chain. Fired
      // app-side so it counts immediately (the Form B indexer catches the mint
      // event independently for the permanent on-chain history). Durable in
      // case the broadcast happened from a flaky connection. Zero-PII.
      trackEventDurable("nok_designated");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalFiles = output ? output.shares.length + (output.duress?.shares.length ?? 0) + (output.duress ? 2 : 1) : 0;
  const canPickFolder = typeof window !== "undefined" && "showDirectoryPicker" in window;

  // HARD GATE — document & image vaults require a Premium licence on the
  // connected wallet. Off-chain client-side files can't be metered, so
  // this is enforced (the app refuses), NOT an honour-system nudge.
  // Checked here, before the wizard renders, so there is no "proceed
  // anyway" path. Seed + sealed-letter are unaffected.
  // 2.7.0 (AD1.6) — prior-enrolment gate. If a completion marker exists
  // for this { kind, wallet } pair in sessionStorage, show the "already
  // enrolled" block instead of remounting the wizard at welcome. This
  // catches browser back/forward in the same tab: the user finished an
  // enrolment, navigated away, hit back — without this gate the wizard
  // happily walked them through a SECOND enrolment for the same vault
  // context, producing a separate vaultId and wasting on-chain spend on
  // the duplicate NoK mint. Marker is sessionStorage-scoped, so opening
  // a new tab / new session is still a clean start by design. Explicit
  // "Start a new enrolment anyway" escape hatch clears the marker.
  if (priorEnrolment && step === "welcome") {
    return (
      <div className="card max-w-xl mx-auto mt-8 space-y-4">
        <h1 className="text-2xl font-bold font-display text-center"><span className="grad">Already enrolled</span></h1>
        <p className="text-text-on-dark/85 text-sm">
          You've already completed a {KIND_NOUN[kind]} enrolment in this browser
          session (vault <span className="font-mono">{priorEnrolment.vaultId.slice(0, 10)}…</span>,
          finished {new Date(priorEnrolment.completedAt).toLocaleTimeString()}). To
          access it again, head to <Link to="/restore" className="text-accent-cyan underline">/restore</Link>{" "}
          rather than running the wizard a second time — re-enrolling would create
          a separate vault with a different id.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/restore" className="btn btn-primary">Go to /restore</Link>
          <Link to="/vaults" className="btn btn-secondary">My vaults</Link>
          <button
            type="button"
            className="btn btn-ghost text-xs"
            onClick={() => {
              try {
                window.sessionStorage.removeItem(enrolSessionKey(kind, connectedAddrForMarker));
              } catch { /* ignore */ }
              setPriorEnrolment(null);
            }}
          >
            Start a new enrolment anyway
          </button>
        </div>
      </div>
    );
  }

  if (docKind && !gate.has("documents")) {
    return (
      <div className="card max-w-xl mx-auto mt-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold font-display"><span className="grad">A Premium feature</span></h1>
        {gate.loading ? (
          <p className="text-text-muted text-sm">Checking your on-chain licence…</p>
        ) : (
          <>
            <p className="text-text-on-dark/85 text-sm">
              {KIND_NOUN[kind] === "image" ? "Image" : "Document"} vaults are part of <strong>Premium</strong>.
              NoKLock is fully self-custodial — it never sees your encrypted files, so it can't meter usage.
              Rather than pretend a limit we can't enforce, this is gated on your wallet's on-chain licence:
              you need a Premium licence to create one.
            </p>
            <p className="text-text-muted text-xs">
              Seed-phrase vaults and one sealed letter are available on every tier, including Free.
            </p>
            {!connectedAddr && (
              <div className="flex justify-center"><ConnectWallet /></div>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/pricing" className="btn btn-primary">See Premium pricing</Link>
              <Link to="/enrol" className="btn btn-secondary">← choose another type</Link>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <Link to="/enrol" className="text-sm text-accent-cyan hover:underline">← back to context picker</Link>
        <h1 className="text-2xl font-bold font-display mt-2"><span className="grad">{TITLES[step]}</span></h1>
        <p className="text-xs text-text-muted mt-1">Protecting: {KIND_NOUN[kind]}</p>
        <div className="mt-4">
          <EnrolProcessMap activeId={step} />
        </div>
      </div>

      {error && <div className="card border-danger border text-danger break-words">{error}</div>}

      {step === "welcome" && (
        <div className="card">
          <p>You're about to split your {KIND_NOUN[kind]} into several encrypted shares, of which a chosen <em>threshold</em> can reconstruct it. You set the exact numbers at the <strong>Threshold</strong> step coming up — your starting defaults are configurable on the <Link to="/settings" className="text-accent-cyan underline">Settings</Link> page. Every step runs offline in your browser. Optional: a duress decoy, and on-chain Next-of-Kin designation.</p>
          <p className="mt-3 text-sm text-text-on-dark/85">
            <strong className="text-text-on-dark">Install NoKLock as a local app first.</strong>{" "}
            Two reasons: every page is then cached on your device, so nothing has to load over the network the moment you airgap; and the install gives the browser a stable identity that the airgap manager can harden against. Faster and safer in one step — look for the install icon in your URL bar, or under your browser menu.
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => {
              // 2.12.0 — If the user has already acknowledged the optional
              // free-tools checkpoint (either "done" or "skipped") in a prior
              // enrol, skip straight to airgap. Otherwise pause on the new
              // checkpoint card so they can see / set up Apple Digital Legacy
              // + Google Inactive Account Manager.
              const ack = readFreeToolsAck();
              setStep(ack ? "airgap" : "free-tools-checkpoint");
            }}
          >Begin</button>
        </div>
      )}

      {step === "free-tools-checkpoint" && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Before you enrol — set these up too (free, ~5 min each, optional).</h2>
          <p className="text-sm text-text-on-dark/85 mb-4">
            NoKLock covers your secrets cryptographically; these two free vendor tools cover the rest of your digital life (Apple iCloud, Google account + Gmail + Drive + YouTube, etc.) by letting nominated contacts request access after a long inactivity window. They complement NoKLock — not replace it.
          </p>

          <div className="space-y-3">
            <div className="rounded border border-bg-surface p-3 bg-bg-deepest/40">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[16rem]">
                  <div className="font-bold text-text-on-dark">Apple Digital Legacy</div>
                  <div className="text-sm text-text-on-dark/80 mt-1">
                    Nominate up to 5 Legacy Contacts who can request access to your iCloud data (photos, notes, messages, files) after Apple confirms your passing.
                  </div>
                </div>
                <a
                  href="https://support.apple.com/en-us/HT212360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm whitespace-nowrap"
                >Set up &rarr;</a>
              </div>
            </div>

            <div className="rounded border border-bg-surface p-3 bg-bg-deepest/40">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[16rem]">
                  <div className="font-bold text-text-on-dark">Google Inactive Account Manager</div>
                  <div className="text-sm text-text-on-dark/80 mt-1">
                    Tell Google what to do with your Gmail, Drive, Photos and YouTube data after a configurable inactivity window (3–18 months) — including notifying up to 10 trusted contacts.
                  </div>
                </div>
                <a
                  href="https://myaccount.google.com/inactive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm whitespace-nowrap"
                >Set up &rarr;</a>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted mt-4">
            Your choice is remembered locally so you won't see this card again on future enrolments. You can revisit either link from the Info pages at any time.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              className="btn btn-primary"
              onClick={() => { persistFreeToolsAck("done"); setStep("airgap"); }}
            >Mark as done &mdash; continue</button>
            <button
              className="btn btn-secondary"
              onClick={() => { persistFreeToolsAck("skipped"); setStep("airgap"); }}
            >I will do these later &mdash; skip</button>
          </div>
        </div>
      )}

      {step === "airgap" && (
        <div className="card sensitive-surface">
          <h2 className="font-bold mb-2 font-display">Switch to airplane mode</h2>
          <p className="text-sm mb-3">Disconnect Wi-Fi + cellular before continuing. The airgap manager blocks all network calls during enrolment as belt-and-braces — for your seed, letter, document or image alike.</p>
          <div className="text-sm mb-3">
            Browser online? <span className="font-mono">{online ? <span className="text-danger">yes — turn it off</span> : <span className="text-accent-green">no ✓</span>}</span>
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer mb-3">
            <input type="checkbox" checked={airgapConfirmed} onChange={(e) => setAirgapConfirmed(e.target.checked)} className="mt-1 accent-accent-teal" />
            <span className="text-text-on-dark/90">I confirm my device is offline. Wi-Fi is off. Cellular data is off. Bluetooth is off (no wireless tethering). My browser is showing offline.</span>
          </label>
          {isAirgapped() && (
            <div className="mt-3 mb-3 p-2 rounded bg-accent-green/10 border border-accent-green/40 text-xs">
              <strong className="text-accent-green">Airgap engaged.</strong>{" "}
              <span className="font-mono">Fetches blocked since engaged: {blockedCount}</span>
              {blockedCount === 0 ? <span className="text-accent-green"> ✓ no calls leaked</span> : <span className="text-amber-400"> — investigate before continuing</span>}
            </div>
          )}
          <button className="btn btn-primary mt-2" disabled={online || !airgapConfirmed} onClick={() => { engageAirgapOnce(); setStep("content"); }}>
            I'm offline — start the airgap
          </button>
        </div>
      )}

      {step === "content" && (
        <div className="card sensitive-surface">
          <h2 className="font-bold mb-2 font-display">{CONTENT_TITLE[kind]}</h2>

          {kind === "seed" && (
            <>
              <textarea className="w-full bg-bg-deepest border border-bg-surface rounded p-3 font-mono text-sm" rows={4} value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="abandon abandon abandon ..." spellCheck={false} autoComplete="off" />
              <div className="text-sm mt-2">
                {seed.trim() === "" ? (
                  <span className="text-text-muted">Paste a 12 or 24-word BIP39 recovery phrase — works for any chain (Bitcoin, Ethereum, Solana, and more). Backing up a raw private key or keystore file instead? Use a Document vault.</span>
                ) : bip39.isValidBip39(seed) ? (
                  <span className="text-accent-green">Valid BIP39 phrase ✓</span>
                ) : (
                  <span className="text-danger">Not a valid BIP39 phrase — check spelling, word count (12 or 24), and that every word is from the BIP39 list. A random set of words won't pass the checksum.</span>
                )}
              </div>
              {isOwner && (
                <p className="text-xs text-text-muted mt-2">
                  Owner test only — don't use a real wallet for a drill —{" "}
                  <button
                    type="button"
                    className="text-accent-cyan underline"
                    onClick={() => setSeed(bip39.entropyToWords(crypto.getRandomValues(new Uint8Array(16))))}
                  >
                    fill a throwaway test seed
                  </button>{" "}
                  (a freshly generated 12-word phrase that controls nothing).
                </p>
              )}
            </>
          )}

          {kind === "letter" && (
            <>
              <nav className="flex gap-2 mb-3">
                <button className={`px-3 py-1 rounded text-sm ${letterMode === "compose" ? "grad-bg text-text-primary font-bold" : "bg-bg-surface text-text-on-dark/80"}`} onClick={() => setLetterMode("compose")}>Compose</button>
                <button className={`px-3 py-1 rounded text-sm ${letterMode === "upload" ? "grad-bg text-text-primary font-bold" : "bg-bg-surface text-text-on-dark/80"}`} onClick={() => setLetterMode("upload")}>Upload</button>
              </nav>
              {letterMode === "compose" ? (
                <RichTextEditor valueHtml={text} onChange={setText} placeholder="Dear…" minHeight={240} />
              ) : (
                <input type="file" accept={ACCEPTED.letter} onChange={(e) => pickFileWithCap(e.target.files?.[0] ?? null, setFile)} className="block w-full text-sm" />
              )}
            </>
          )}

          {(kind === "document" || kind === "image") && (
            <>
              <input type="file" accept={ACCEPTED[kind]} onChange={(e) => pickFileWithCap(e.target.files?.[0] ?? null, setFile)} className="block w-full text-sm" />
              {file && <div className="text-xs text-text-muted mt-1">{file.name} · {file.type || "file"} · {(file.size / (1024 * 1024)).toFixed(2)} MB</div>}
              <p className="text-xs text-text-muted mt-2">
                Your tier ({gate.tierName}) cap: <strong className="text-text-on-dark">{sizeCapMb} MB</strong> per vault.
                {gate.tier === 0 && <> <Link to="/pricing" className="text-accent-cyan underline">Upgrade to Standard ($99/yr) for 25 MB</Link>.</>}
                {" "}Binary files are preserved as-is and returned to your next-of-kin in their original format.
              </p>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary" onClick={() => { leaveAirgapOnce(); setStep("airgap"); }}>Back</button>
            <button className="btn btn-primary" disabled={!mainValid} onClick={() => setStep("threshold-select")}>Continue</button>
          </div>
        </div>
      )}

      {step === "threshold-select" && (
        <div className="card">
          <h2 className="font-bold mb-3 font-display">How many shares, and how many to recover?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-text-muted">Total shares (N)<InfoTooltip hint="How many encrypted shares are created. Each goes to a separate location (cloud / device / person). More shares = more redundancy and geographic spread." /></span>
              <input type="number" min={3} max={9} value={total} onChange={(e) => setTotal(Math.min(9, Math.max(3, parseInt(e.target.value || "5", 10))))} className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono" />
            </label>
            <label className="block">
              <span className="text-sm text-text-muted">Threshold to recover (T)<InfoTooltip hint="How many of the N shares are needed to rebuild it. Lower = easier for you to recover; higher = harder for an attacker. Common: 3-of-5." /></span>
              <input type="number" min={2} max={total} value={threshold} onChange={(e) => setThreshold(Math.min(total, Math.max(2, parseInt(e.target.value || "3", 10))))} className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono" />
            </label>
          </div>
          <p className="text-sm text-text-muted mt-3">Common: <code>3-of-5</code> (balanced), <code>2-of-3</code> (light), <code>5-of-9</code> (paranoid).</p>

          {/* 2.0.0 — M-of-N HEIR-COOPERATION quorum (plan §D.6). Distinct
              from the T-of-N share-availability threshold above. Hidden on
              Free tier (no quorum, single-heir cap on-chain). */}
          {quorumTierCap.show && (
            <div className="mt-6 pt-5 border-t border-bg-surface">
              <h3 className="font-bold mb-1 font-display text-base">How many heirs must cooperate to release?</h3>
              <div className="mb-3 p-3 rounded bg-bg-surface text-xs text-text-on-dark/80 border border-bg-surface">
                <strong className="text-text-on-dark">These are two independent dials.</strong>{" "}
                <em>T-of-N shares</em> = your share-loss protection (above — what's needed to
                cryptographically reassemble the vault). <em>M-of-N heirs</em> = your
                heir-cooperation protection (below — how many designated heirs must each
                sign off before NoKLock releases the recovery to them). They are independent:
                you can run e.g. 3-of-5 shares with a 2-of-3 heir quorum. One stolen heir
                wallet cannot release your vault alone.
              </div>

              {/* 0.4.0 (Daniel 2026-06-16) — quorum is OPT-IN. OFF by default →
                  one heir, one token. Only when ON does each heir get a Voting
                  token + the M-of-N release gate apply. */}
              <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={quorumEnabled}
                  onChange={(e) => { setQuorumEnabled(e.target.checked); if (e.target.checked && quorumNHeirs < 2) setQuorumNHeirs(2); }}
                  className="accent-accent-teal w-4 h-4"
                />
                <span className="text-sm text-text-on-dark">Require several heirs to cooperate before release (M-of-N quorum)</span>
              </label>

              {!quorumEnabled && (
                <div className="p-3 rounded bg-bg-surface/60 text-xs text-text-on-dark/80 border border-bg-surface">
                  <strong className="text-text-on-dark">Single heir — one token.</strong> Each next-of-kin you designate gets <strong>one</strong> Activation token, and any one of them can claim independently. Turn on the quorum above only if you want to require multiple heirs to sign off together (that adds a Voting token per heir).
                </div>
              )}

              {quorumEnabled && (<>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-text-muted">
                    Total heirs (N){" "}
                    <InfoTooltip hint="How many next-of-kin you'll designate on-chain. Each gets their own Activation SBT. More heirs = more redundancy + larger committee for release." />
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={quorumTierCap.maxNHeirs}
                    value={quorumNHeirs}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(quorumTierCap.maxNHeirs, parseInt(e.target.value || "3", 10)));
                      setQuorumNHeirs(v);
                      if (quorumM > v) setQuorumM(v);
                    }}
                    className="block w-full mt-1 accent-accent-teal"
                  />
                  <div className="mt-1 font-mono text-sm text-accent-cyan">N = {quorumNHeirs} <span className="text-text-muted text-xs">(max {quorumTierCap.maxNHeirs})</span></div>
                </label>
                <label className="block">
                  <span className="text-sm text-text-muted">
                    M (heirs required to release){" "}
                    <InfoTooltip hint="How many of the N designated heirs must each sign off before release. M=1 = any one heir can release alone (no quorum protection). M=N = all heirs must agree (most resistance to coercion of one heir, least resistance to one heir going dark). 2-of-3 is the common balanced choice." />
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={Math.min(quorumTierCap.maxM, quorumNHeirs)}
                    value={Math.min(quorumM, quorumNHeirs)}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(quorumTierCap.maxM, quorumNHeirs, parseInt(e.target.value || "2", 10)));
                      setQuorumM(v);
                    }}
                    className="block w-full mt-1 accent-accent-teal"
                  />
                  <div className="mt-1 font-mono text-sm text-accent-cyan">M = {Math.min(quorumM, quorumNHeirs)} <span className="text-text-muted text-xs">(max {Math.min(quorumTierCap.maxM, quorumNHeirs)})</span></div>
                </label>
              </div>
              <p className="text-sm text-text-muted mt-3">
                You picked <code>{Math.min(quorumM, quorumNHeirs)}-of-{quorumNHeirs}</code> heirs.
                Your tier ({quorumTierCap.tierLabel}) caps this at <code>{quorumTierCap.maxM}-of-{quorumTierCap.maxNHeirs}</code>.
                {quorumTierCap.tierLabel === "Standard" && <> Upgrade to <Link to="/pricing" className="text-accent-cyan underline">Premium</Link> for up to 5-of-9.</>}
              </p>
              {/* Implications warning per the chosen M/N (Daniel 2026-06-16). */}
              <div className="mt-3 p-3 rounded bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90">
                <strong>What {Math.min(quorumM, quorumNHeirs)}-of-{quorumNHeirs} means:</strong>{" "}
                {Math.min(quorumM, quorumNHeirs) >= quorumNHeirs
                  ? <>ALL {quorumNHeirs} heirs must sign to release. Most resistant to any one heir being coerced — but if even one heir is lost, unreachable, or uncooperative, the others <strong>cannot</strong> release the vault.</>
                  : Math.min(quorumM, quorumNHeirs) <= 1
                  ? <>ANY single heir can release alone — no cooperation required. Easiest to claim, but offers <strong>no</strong> protection if one heir is coerced or goes rogue.</>
                  : <>Any {Math.min(quorumM, quorumNHeirs)} of your {quorumNHeirs} heirs must sign together — a balanced choice: it survives {quorumNHeirs - Math.min(quorumM, quorumNHeirs)} heir(s) being lost, while still requiring genuine cooperation. Each heir gets a Voting token in addition to their Activation token.</>}
              </div>
              </>)}
            </div>
          )}

          {!quorumTierCap.show && (
            <div className="mt-6 pt-5 border-t border-bg-surface p-3 rounded bg-bg-surface text-xs text-text-on-dark/80">
              <strong className="text-text-on-dark">Heir quorum:</strong> Free tier supports
              ONE next-of-kin (single-heir restore). Multi-heir M-of-N quorum is a{" "}
              <strong>Standard+</strong> feature — <Link to="/pricing" className="text-accent-cyan underline">see pricing</Link>.
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary" onClick={() => setStep("content")}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep("passkey")}>Continue</button>
          </div>
        </div>
      )}

      {step === "passkey" && (
        <div className="card sensitive-surface">
          <h2 className="font-bold mb-2 font-display">Set a vault master password</h2>
          <p className="text-sm mb-3">Derives the encryption key. You MUST remember this — without it the shares can't be combined back into your {KIND_NOUN[kind]}. It is the single key for you AND your next-of-kin.</p>
          <div className="mb-3 p-3 rounded bg-bg-surface text-xs text-text-on-dark/80 border border-bg-surface">
            <strong className="text-text-on-dark">No 2FA, by design.</strong> There is no SMS or app code — a lost second factor would permanently destroy recovery and inheritance, so it's deliberately not offered. Optionally, <strong>after</strong> this (on the "Save share files" step) you can add a device passkey (Face/Touch/Windows Hello/security key) for faster unlock on that one device, if its authenticator supports it. The master password always works regardless and is never replaced.
          </div>
          <MaskedSecret value={passkey} onChange={setPasskey} />
          <div className="text-sm mt-2">{passkeyValid ? <span className="text-accent-green">at least 8 chars ✓</span> : <span className="text-text-muted">minimum 8 characters</span>}</div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary" onClick={() => setStep("threshold-select")}>Back</button>
            <button className="btn btn-primary" disabled={!passkeyValid} onClick={() => setStep("duress-offer")}>Continue</button>
          </div>
        </div>
      )}

      {step === "duress-offer" && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Add a duress decoy?</h2>
          <p className="text-sm mb-3">
            <strong>What it is:</strong> a SECOND vault enrolled in parallel, unlocked by a different master password. If someone coerces you (the <em>$5 wrench attack</em>), you give them the duress master password — they see a believable but throwaway {KIND_NOUN[kind]}. Your real vault stays untouched and indistinguishable from the decoy on disk.
          </p>
          <p className="text-sm mb-3 text-text-muted">You'll need a decoy {KIND_NOUN[kind]} (something real but low-value you can afford to give up) and a different master password.</p>
          {!gate.has("duress") && (
            <div className="mb-3 p-3 rounded border border-accent-teal/40 bg-bg-surface text-xs">
              <strong className="text-text-on-dark">Your tier ({gate.tierName}):</strong> duress decoy is a <strong>{gate.minTierFor("duress")}</strong> feature — the kind of high-paranoia defence the Premium tier exists for. <Link to="/pricing" className="text-accent-cyan underline">Upgrade to Premium</Link>, or skip and continue without a decoy.
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary" onClick={() => { setDuressOn(false); void runPipeline(); }}>Skip — straight to enrol</button>
            <button className="btn btn-primary" disabled={!gate.has("duress")} onClick={() => { setDuressOn(true); setStep("duress-entry"); }}>Add a duress decoy</button>
          </div>
        </div>
      )}

      {step === "duress-entry" && (
        <div className="card sensitive-surface">
          <h2 className="font-bold mb-2 font-display">Duress decoy</h2>
          <p className="text-sm mb-3 text-text-muted">A throwaway decoy {KIND_NOUN[kind]} + a master password that <strong>must differ</strong> from your real one.</p>

          {kind === "seed" && (
            <>
              <label className="block text-sm mb-1">Duress mnemonic (12 or 24 words)</label>
              <textarea className="w-full bg-bg-deepest border border-bg-surface rounded p-3 font-mono text-sm" rows={3} value={dSeed} onChange={(e) => setDSeed(e.target.value)} spellCheck={false} autoComplete="off" />
              <div className="text-xs mt-1">Checksum: {bip39.isValidBip39(dSeed) ? <span className="text-accent-green">valid ✓</span> : <span className="text-danger">invalid</span>}</div>
            </>
          )}
          {kind === "letter" && (
            <>
              <label className="block text-sm mb-1">Decoy letter</label>
              <textarea className="w-full bg-bg-deepest border border-bg-surface rounded p-3 text-sm" rows={6} value={dText} onChange={(e) => setDText(e.target.value)} placeholder="A believable but throwaway letter…" />
            </>
          )}
          {(kind === "document" || kind === "image") && (
            <>
              <label className="block text-sm mb-1">Decoy {KIND_NOUN[kind]}</label>
              <input type="file" accept={ACCEPTED[kind]} onChange={(e) => pickFileWithCap(e.target.files?.[0] ?? null, setDFile)} className="block w-full text-sm" />
            </>
          )}

          <label className="block text-sm mb-1 mt-4">Duress master password</label>
          <MaskedSecret value={dPasskey} onChange={setDPasskey} />
          <div className="text-xs mt-1">{dPasskeyValid ? <span className="text-accent-green">≥ 8 chars and differs from real master password ✓</span> : <span className="text-text-muted">must be ≥ 8 chars and DIFFERENT from your real master password</span>}</div>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary" onClick={() => setStep("duress-offer")}>Back</button>
            <button className="btn btn-primary" disabled={!duressValid} onClick={() => void runPipeline()}>Enrol both vaults</button>
          </div>
        </div>
      )}

      {step === "running" && (
        <div className="card"><p>Splitting + encrypting{duressOn ? " (twice — real + duress)" : ""}… this runs entirely offline in your browser.</p></div>
      )}

      {step === "download" && output && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Step A — save your encrypted share files</h2>
          <p className="text-sm mb-2">Vault ID: <code className="text-accent-cyan">{output.vaultId.slice(0, 16)}…</code></p>
          {output.duress && <p className="text-sm mb-2 text-text-muted">Duress vault enrolled too — saved alongside, indistinguishable on disk.</p>}
          <div className="mb-3 p-3 rounded bg-bg-surface text-xs text-text-on-dark/80">
            <strong className="text-text-on-dark">Why a "save" step is part of enrolment:</strong> NoKLock just split and
            encrypted your {KIND_NOUN[kind]} entirely inside this browser. Those {totalFiles} encrypted
            files now have to <em>leave</em> the browser so you can store them in your own places. (Restore
            is the exact reverse — you bring these files back in. This is not the restore step.) NoKLock
            cannot upload to your cloud for you — it writes the files to your computer; <em>you</em> place
            them where you want in Step&nbsp;B.
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {canPickFolder && (
              <button className="btn btn-primary" onClick={() => void saveToFolder()}>
                {savedToFolder ? "Saved into folder ✓ — pick again" : "Save into a folder…"}
              </button>
            )}
            <button className={`btn ${canPickFolder ? "btn-secondary" : "btn-primary"}`} onClick={() => void downloadAll()}>Download all files</button>
            {output && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCliModalOpen(true)}
              >
                ⚡ Generate noklock-cli upload command
              </button>
            )}
          </div>
          {canPickFolder && (
            <p className="text-xs text-text-muted mt-2">
              <strong className="text-accent-cyan">Laziest route (one click, no manual upload):</strong> "Save into a folder…" (Chrome/Edge) writes all {totalFiles} files into one folder you pick.
              <strong className="text-text-on-dark/90"> Pick your Dropbox / OneDrive / Google&nbsp;Drive desktop-sync folder and the cloud app uploads them for you automatically</strong> — that's the whole distribution step done, no per-file dragging.
            </p>
          )}
          {/* Always rendered (never silently hidden — that read as
              "missing"/hallucinated). Shows the add button when WebAuthn
              is present, otherwise an honest unavailable note. */}
          <div className="mt-4 p-3 rounded border border-bg-surface bg-bg-panel text-sm">
            <div className="font-bold mb-1">Optional: add a passkey on this device</div>
            <p className="text-text-muted text-xs mb-2">
              A convenience for faster unlock on <em>this</em> device (Face ID / Touch ID / Windows Hello / a security key). It does <strong>not</strong> replace your master password — that + your shares stay the only way you and your next-of-kin recover the vault, and there is deliberately <strong>no 2FA</strong>. Needs an authenticator that supports the WebAuthn PRF extension; if yours doesn't, the add won't complete and that's fine. <Link to="/info?tab=passkeys" className="text-accent-cyan underline">How passkeys work</Link>
            </p>
            {isPasskeySupported() ? (
              <>
                <button className="btn btn-secondary text-xs" disabled={pkState === "working" || pkState === "done"} onClick={() => void addPasskey()}>
                  {pkState === "working" ? "Follow your device prompt…" : pkState === "done" ? "Passkey added ✓" : "Add passkey unlock"}
                </button>
                {pkState === "done" && <p className="text-accent-green text-xs mt-2">Saved on this device + a <code>passkey-unlock.json</code> downloaded. Keep that file with your manifest to enable passkey unlock on another device.</p>}
                {pkErr && (
                  <div className="text-xs mt-2 p-2 rounded border border-amber-500/40 bg-amber-500/5 text-amber-200">
                    <p>{pkErr}</p>
                    <p className="mt-1 text-text-muted">Your options: retry with an external security key, or just press <strong>Continue</strong> below and skip it — the passkey is purely optional and your master password is the full key on every device.</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-text-muted text-xs">This browser doesn't expose the WebAuthn API, so a passkey can't be added here. Nothing is lost — your master password is the full key on every device.</p>
            )}
          </div>
          {!gate.has("multi-location") && (
            <div className="mt-4 p-3 rounded bg-bg-surface text-xs text-text-muted">
              <strong className="text-text-on-dark">Free tier:</strong> up to THREE share locations — enough for a working 2-of-3 restore. Upgrade to <Link to="/pricing" className="text-accent-cyan underline">Standard</Link> for a wider spread.
            </div>
          )}
        </div>
      )}

      {step === "share-urls" && output && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Step B — store your share locations</h2>

          {/* 2.5.0 (H2) — non-blocking amber toast surfaced if
              recordVaultInIndex() threw in writeAllAndAdvance(). Vault
              files are already on disk; this just tells the user the
              local /vaults shortcut entry didn't land. Dismissible. */}
          {indexWarning && (
            <div
              role="status"
              aria-live="polite"
              className="mb-3 p-2 rounded bg-amber-400/10 border border-amber-400/40 text-xs text-amber-300 flex items-start gap-2"
            >
              <span className="flex-1">
                <strong className="text-amber-200">Heads up:</strong> {indexWarning}
              </span>
              <button
                type="button"
                className="text-amber-200 hover:text-amber-100 underline shrink-0"
                onClick={() => setIndexWarning(null)}
                aria-label="Dismiss warning"
              >
                Dismiss
              </button>
            </div>
          )}

          {!ownerFolderMode ? (
            <>
              {/* 2026-06-06 (Daniel) — surface the SIMPLE vs MAX-security
                  spectrum up front so users don't bounce off "need an
                  IPFS account" complexity.
                  2.14.0 (Daniel 2026-06-08) — keyed via useT(): headline /
                  simple / max / urlsNote. Was inline EN; non-EN locales
                  were showing EN tail in the middle of Step B. The
                  recommended-list link is now rendered as a short trailing
                  line so the keyed body stays a flat translatable string. */}
              <div className="mb-4 rounded-lg border border-accent-cyan/30 bg-bg-deepest/40 p-3 text-sm">
                <div className="font-bold text-text-on-dark mb-1"><span className="grad">{t("enrol.shareUrl.twoRoutes.headline")}</span></div>
                <p className="text-text-on-dark/85 mb-2">
                  {t("enrol.shareUrl.twoRoutes.simple")}
                </p>
                <p className="text-text-on-dark/85">
                  {t("enrol.shareUrl.twoRoutes.max")}
                </p>
                <p className="text-text-on-dark/70 text-xs mt-1">
                  <Link to="/info?tab=shares" className="text-accent-cyan underline">{t("nav.info")} → shares</Link>
                </p>
                <p className="text-text-muted text-xs mt-2">
                  {t("enrol.shareUrl.twoRoutes.urlsNote")}
                </p>
              </div>
              <DiversityNudge picks={pickedProviders} />
              {/* (c) bulk-open (Daniel 2026-06-15) — opens each picked provider's
                  drive/file-manager in a tab so you can drop the already-saved
                  files without hunting for each one. */}
              {(() => {
                const openable = Array.from(new Set(pickedProviders.map((p) => pickFor(p).openUrl).filter((u): u is string => !!u)));
                if (openable.length === 0) return null;
                return (
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-secondary text-xs"
                      onClick={() => { for (const u of openable) window.open(u, "_blank", "noopener,noreferrer"); }}
                    >
                      Open my {openable.length} provider{openable.length === 1 ? "" : "s"} ↗
                    </button>
                    <span className="text-[11px] text-text-muted">opens each picked provider's drive in a tab so you can drop the saved files</span>
                  </div>
                );
              })()}
              <div className="space-y-3">
                {output.shares.map((sh, i) => (
                  <ShareUrlRow
                    key={sh.filename}
                    shareIndex={sh.index}
                    filename={sh.filename}
                    value={shareUrls[i] ?? ""}
                    onChange={(v) => { const copy = [...shareUrls]; copy[i] = v; setShareUrls(copy); }}
                    pick={pickedProviders[i] ?? ""}
                    onPickChange={(p) => { const copy = [...pickedProviders]; copy[i] = p; setPickedProviders(copy); }}
                    free={!gate.has("multi-location")}
                    slot={i}
                    allUrls={shareUrls}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 p-3 rounded bg-danger/15 border border-danger/40 text-xs text-danger">
                <strong>Owner test mode — single shared folder.</strong> All {totalFiles} files in one
                "anyone with the link" folder. If that one folder/account is compromised, the <em>entire</em>
                vault is recoverable by the attacker — this removes the threshold-split protection and is
                never offered to normal users. For your testing only.
              </div>
              <p className="text-xs text-text-muted mb-2">
                Create one folder in your cloud, set it to "anyone with the link", drop all {totalFiles} files
                in it, paste the folder link here. (Restore is still file-drop — open the folder, download the
                files, drop them into Restore. There is no "restore from one folder link".)
              </p>
              <input
                type="url"
                className="w-full bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs"
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                placeholder="https://… (one shared-folder link)"
                spellCheck={false}
                autoComplete="off"
              />
            </>
          )}

          {isOwner && (
            <label className="mt-4 flex items-center gap-2 text-xs text-amber-300">
              <input type="checkbox" checked={ownerFolderMode} onChange={(e) => setOwnerFolderMode(e.target.checked)} />
              Owner test: use one shared folder instead of per-account spread (not shown to users)
            </label>
          )}

          {/* H-15 (pressure-test 2026-06-10): block advancing unless at least
              `threshold` share locations are non-empty. The prior Continue had
              NO validation, so a vault could be "enrolled" with zero recorded
              share URLs — unrecoverable, with the loss only discovered at
              restore. A vault with fewer locations than its M-of-N threshold
              can never be reconstructed. */}
          {(() => {
            const filled = ownerFolderMode
              ? (folderUrl.trim() !== "" ? output.shares.length : 0)
              : output.shares.filter((_, i) => (shareUrls[i] ?? "").trim() !== "").length;
            const enough = filled >= threshold;
            return (
              <>
                {!enough && (
                  <p className="text-xs text-danger mt-3">
                    Add at least {threshold} share location{threshold === 1 ? "" : "s"} before continuing — a vault
                    with fewer recorded locations than its {threshold}-of-{total} threshold can never be restored.
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <button className="btn btn-secondary" onClick={() => setStep("download")}>Back</button>
                  <button className="btn btn-primary" disabled={!enough} onClick={() => {
                    persistShareUrls(
                      output.vaultId,
                      ownerFolderMode
                        ? output.shares.map((sh) => ({ shareIndex: sh.index, url: folderUrl.trim() }))
                        : output.shares.map((sh, i) => ({ shareIndex: sh.index, url: shareUrls[i] ?? "" })),
                    );
                    setStep("test-restore");
                  }}>Continue →</button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {step === "test-restore" && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Test-restore drill</h2>
          <p className="text-sm mb-3">Open <Link to="/restore" className="text-accent-cyan underline">Restore</Link> in a new tab. Drag in any {threshold} share files + the manifest. Enter your real master password. Verify your {KIND_NOUN[kind]} comes back. (Also try it WITHOUT any passkey file — the master password alone must always work.)</p>
          <div className="flex gap-3 flex-wrap">
            <button className="btn btn-secondary" onClick={() => setStep("download")}>Back to downloads</button>
            <button className="btn btn-primary" onClick={() => setStep("nok-designate")}>Drill passed → designate NoK</button>
            {/* 2.4.0 — H1 fix: explicit skip path. Opens TestRestoreSkipModal
                rather than advancing silently. Daniel's call: "don't force"
                the drill, but make the skip a deliberate, audited act. */}
            <button className="btn btn-ghost" onClick={() => setSkipModalOpen(true)}>Skip drill</button>
          </div>
          {skipModalOpen && (
            <TestRestoreSkipModal
              vaultId={output?.vaultId ?? ""}
              kind={kind}
              onCancel={() => setSkipModalOpen(false)}
              onConfirm={() => {
                setSkipModalOpen(false);
                setStep("nok-designate");
              }}
            />
          )}
        </div>
      )}

      {step === "nok-designate" && output && (
        <div className="card">
          <h2 className="font-bold mb-2 font-display">Next-of-kin (optional)</h2>
          <p className="text-sm mb-3">Mint inheritance SBTs on Polygon. One Activation token per heir (M-of-N quorum vaults add a Voting token per heir). Do it now or later via <Link to="/nok" className="text-accent-cyan underline">/nok</Link>.</p>
          {!gate.has("nok") && (
            <div className="mb-3 p-3 rounded bg-bg-surface text-xs">
              <strong className="text-text-on-dark">Free tier:</strong> NoK / inheritance is a {gate.minTierFor("nok")}-tier feature. Your vault still restores by you, alone. <Link to="/pricing" className="text-accent-cyan underline">Upgrade</Link> to designate a next-of-kin.
            </div>
          )}
          <label className="block text-sm mb-1">NoK wallet address</label>
          <input type="text" className="w-full bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" value={nokWallet} onChange={(e) => setNokWallet(e.target.value)} placeholder="0x..." disabled={!gate.has("nok")} />
          <div className="flex gap-3 mt-4 flex-wrap items-center">
            <button className="btn btn-primary text-sm" disabled={isSubmitting || !gate.has("nok") || (mint.step !== "idle" && mint.step !== "done" && mint.step !== "error" && mint.step !== "stale")} onClick={() => void doMintNok()}>
              {mintLabel(mint.step) ?? "Mint NoK SBTs"}
            </button>
            <button className="btn btn-secondary text-sm" onClick={() => { leaveAirgapOnce(); setStep("done"); }}>Skip → done</button>
            {mint.step === "done" && <button className="btn btn-secondary text-sm" onClick={() => { leaveAirgapOnce(); setStep("done"); }}>Continue → done</button>}
          </div>
          {(mint.txHashes.activation || mint.txHashes.voting) && (
            <div className="text-xs text-text-muted mt-3 space-y-0.5 font-mono">
              {mint.txHashes.activation && <div>activation: {tx(mint.txHashes.activation)}</div>}
              {mint.txHashes.voting && <div>voting: {tx(mint.txHashes.voting)}</div>}
            </div>
          )}
          {mint.error && <div className="text-sm text-danger mt-2 break-words">{humanizeTxError(mint.error)}</div>}
        </div>
      )}

      {step === "done" && (
        <div className="card border-accent-green border-2">
          <h2 className="font-bold mb-2 font-display"><span className="grad">Vault enrolled ✓</span></h2>
          <p className="text-sm">Your {KIND_NOUN[kind]} is split, encrypted and offline-safe. See all vaults at <Link to="/vaults" className="text-accent-cyan underline">/vaults</Link>. Manage NoKs at <Link to="/nok" className="text-accent-cyan underline">/nok</Link>. Practice the inheritance trigger on <Link to="/dead-man" className="text-accent-cyan underline">/dead-man</Link>.</p>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-bg-deepest/40 p-3">
            <p className="text-sm text-text-on-dark/90"><strong>A vault alone can't be inherited yet.</strong> Finish making it inheritance-ready — designate a next-of-kin, send a heartbeat, and set up out-of-band alerts. Your checklist tracks what's left:</p>
            <Link to="/dashboard" className="btn btn-primary text-sm mt-2 inline-block">Open your readiness checklist →</Link>
          </div>
          {/* Share CTA (Daniel 2026-06-15) — ONLY on this success screen, never
              on the test-restore drill. Carries the user's own referral link. */}
          <ShareYourVault kind={kind} isPremium={gate.has("nok")} refAddress={connectedAddr} />
        </div>
      )}

      {/* 2.8.0 (AD1.7) — wallet-switched-mid-flow modal. Opened by
          doMintNok's pre-tx verify OR by useNokMint 0.3.0's stale state
          (the latter wired through the staleReason effect just above).
          Two ways out: switch back (close + retry under the original
          wallet) or restart enrol (clear completion marker + nav
          /enrol so the wizard re-builds the vault under the wallet the
          user actually means to use). */}
      {walletSwitchedModal && (
        <WalletSwitchedModal
          vaultCreator={walletSwitchedModal.vaultCreator}
          nowConnected={walletSwitchedModal.nowConnected}
          onClose={() => {
            setWalletSwitchedModal(null);
            // also reset the hook if it had flipped to "stale" — so the
            // button label / disabled gate go back to a clean state.
            if (mint.step === "stale") mint.reset();
          }}
          onRestart={() => {
            // Clear the AD1.6 completion marker for this kind / wallet
            // so the "already enrolled" gate doesn't immediately re-fire
            // when the user lands back on /enrol. Vault-creator marker
            // also dropped (this vault is being abandoned in this tab).
            try {
              if (output) {
                window.sessionStorage.removeItem(vaultCreatorKey(output.vaultId));
              }
              window.sessionStorage.removeItem(enrolSessionKey(kind, connectedAddrForMarker));
            } catch { /* sessionStorage disabled — non-fatal */ }
            setWalletSwitchedModal(null);
            mint.reset();
            window.location.assign("/enrol");
          }}
        />
      )}
      {cliModalOpen && output && (
        <CliUploadModal
          vaultId={output.vaultId}
          shareFilenames={output.shares.map((s) => s.filename)}
          onClose={() => setCliModalOpen(false)}
        />
      )}
    </div>
  );
}

interface PickEntry { readonly id: string; readonly label: string; readonly openUrl: string; readonly placeholder: string; }

// 0.x (Daniel 2026-06-15) — openUrl now deep-links to the provider's FILE
// MANAGER / drive (where you actually drop the share file), not the marketing
// homepage — so "open ↗" lands you one step from the upload. Falls back to the
// provider home where no stable drive URL exists.
const PICKS: readonly PickEntry[] = [
  { id: "",             label: "— pick a provider —", openUrl: "",                                  placeholder: "(pick a provider first or paste any share URL)" },
  { id: "google-drive", label: "Google Drive",        openUrl: "https://drive.google.com/drive/my-drive", placeholder: "https://drive.google.com/file/d/..." },
  { id: "dropbox",      label: "Dropbox",             openUrl: "https://www.dropbox.com/home",      placeholder: "https://www.dropbox.com/scl/..." },
  { id: "onedrive",     label: "OneDrive",            openUrl: "https://onedrive.live.com/",        placeholder: "https://1drv.ms/..." },
  { id: "pcloud",       label: "pCloud",              openUrl: "https://my.pcloud.com/#page=filemanager", placeholder: "https://my.pcloud.com/publink/..." },
  { id: "mega",         label: "MEGA",                openUrl: "https://mega.nz/fm",                placeholder: "https://mega.nz/file/...#KEY" },
  { id: "mediafire",    label: "MediaFire",           openUrl: "https://www.mediafire.com/myfiles", placeholder: "https://www.mediafire.com/file/..." },
  { id: "box",          label: "Box",                 openUrl: "https://app.box.com/folder/0",      placeholder: "https://app.box.com/s/..." },
  { id: "filen",        label: "Filen",               openUrl: "https://app.filen.io/",             placeholder: "https://filen.io/d/..." },
  { id: "internxt",     label: "Internxt",            openUrl: "https://drive.internxt.com/",        placeholder: "https://drive.internxt.com/sh/file/..." },
  { id: "yandex",       label: "Yandex Disk",         openUrl: "https://disk.yandex.com/client/disk", placeholder: "https://disk.yandex.com/d/..." },
  { id: "pinata",       label: "IPFS via Pinata",     openUrl: "https://app.pinata.cloud/",         placeholder: "https://gateway.pinata.cloud/ipfs/Qm..." },
  { id: "arweave",      label: "Arweave (ArDrive)",   openUrl: "https://app.ardrive.io/",           placeholder: "https://arweave.net/{txid}" },
  { id: "other",        label: "Other / paste URL",   openUrl: "",                                  placeholder: "https://..." },
];

function pickFor(id: string): PickEntry { return PICKS.find((p) => p.id === id) ?? PICKS[0]!; }

function DiversityNudge({ picks }: { readonly picks: readonly string[] }): JSX.Element | null {
  const selected = picks.filter((p) => p && p !== "other");
  if (selected.length < 2) return null;
  const counts = new Map<string, number>();
  for (const p of selected) counts.set(p, (counts.get(p) ?? 0) + 1);
  const dupes = [...counts.entries()].filter(([, n]) => n > 1);
  if (dupes.length === 0) return null;
  return (
    <div className="mb-4 p-3 rounded bg-amber-500/10 border border-amber-500/40 text-sm text-amber-200">
      <strong>Diversity nudge:</strong> {dupes.map(([id, n]) => `${pickFor(id).label} × ${n}`).join(", ")}.
      The whole point of Shamir is jurisdictional + provider spread. Use different providers (or at minimum different accounts) so a single account compromise can't hit threshold.
    </div>
  );
}

function ShareUrlRow({
  shareIndex, filename, value, onChange, pick, onPickChange, free, slot, allUrls,
}: {
  readonly shareIndex: number; readonly filename: string; readonly value: string;
  readonly onChange: (v: string) => void; readonly pick: string;
  readonly onPickChange: (p: string) => void; readonly free: boolean;
  readonly slot: number; readonly allUrls: readonly string[];
}): JSX.Element {
  const disabled = free && slot > 2;
  const detected = value ? detectProvider(value) : null;
  const normalised = value ? normaliseShareUrl(value) : null;
  const provDescriptor = detected ? PROVIDERS.find((p) => p.id === detected) : null;
  const picked = pickFor(pick);
  const hostname = (() => { try { return value ? new URL(value).hostname.toLowerCase() : ""; } catch { return ""; } })();
  const sameProviderSiblings = hostname
    ? allUrls.filter((u, i) => { if (i === slot || !u) return false; try { return new URL(u).hostname.toLowerCase() === hostname; } catch { return false; } })
    : [];
  const showSameAccountWarning = sameProviderSiblings.length > 0;

  function onPickAndOpen(id: string): void {
    onPickChange(id);
    const entry = pickFor(id);
    if (entry.openUrl) window.open(entry.openUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`p-3 rounded border ${disabled ? "border-bg-surface bg-bg-surface/40 opacity-50" : "border-bg-surface bg-bg-deepest"}`}>
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <span className="text-sm font-mono">share {shareIndex} · <span className="text-text-muted">{filename}</span></span>
        <div className="flex items-center gap-2">
          <select value={pick} onChange={(e) => onPickAndOpen(e.target.value)} disabled={disabled} className="bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-xs">
            {PICKS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          {picked.openUrl && <a href={picked.openUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-cyan hover:underline">open ↗</a>}
        </div>
      </div>
      {(provDescriptor || (detected === "generic" && value) || (normalised === null && value)) && (
        <div className="text-xs mb-1">
          {provDescriptor && <span className="text-accent-green">↳ detected: {provDescriptor.displayName}</span>}
          {detected === "generic" && value && <span className="text-accent-cyan">↳ generic URL (will try direct fetch)</span>}
          {normalised === null && value && <span className="text-danger">↳ provider needs manual download at restore</span>}
        </div>
      )}
      <input type="url" className="w-full bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs" value={value} onChange={(e) => onChange(e.target.value)} placeholder={disabled ? "(locked — Free tier allows 3 locations; upgrade to Standard for all)" : picked.placeholder} disabled={disabled} spellCheck={false} autoComplete="off" />
      {showSameAccountWarning && (
        <div className="mt-2 p-2 rounded bg-danger/15 border border-danger/40 text-xs text-danger">
          <strong>Same provider used elsewhere.</strong> Multiple shares at <code className="font-mono">{hostname}</code> are fine ONLY if they're in different accounts. Same account = a single compromise gives the attacker {sameProviderSiblings.length + 1} shares, defeating the threshold split. Use different accounts or providers.
        </div>
      )}
    </div>
  );
}

const SHARE_URLS_KEY = "soulchain.share-urls";
function persistShareUrls(vaultId: string, urls: readonly { shareIndex: number; url: string }[]): void {
  try {
    const raw = localStorage.getItem(SHARE_URLS_KEY);
    const list = raw ? (JSON.parse(raw) as { vaultId: string; urls: { shareIndex: number; url: string }[]; updatedAt: number }[]) : [];
    const filtered = list.filter((v) => v.vaultId !== vaultId);
    filtered.push({ vaultId, urls: urls.map((u) => ({ ...u })), updatedAt: Date.now() });
    localStorage.setItem(SHARE_URLS_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

// 2.12.0 — Persistence for the optional "free tools" checkpoint card
// (Apple Digital Legacy + Google Inactive Account Manager). Cross-vault
// (NOT keyed by vaultId) — once the user has acknowledged the card by
// either marking the tools as done or explicitly skipping them, we don't
// re-prompt on later enrolments. Stored as
//   { status: "done" | "skipped", at: <unix-ms> }
// so admin audit / future "you skipped these — set them up" nudges have
// the same shape as the rest of the enrol-skip telemetry.
const FREE_TOOLS_KEY = "noklock.enrol-free-tools-acknowledged";
interface FreeToolsAck {
  readonly status: "done" | "skipped";
  readonly at: number;
}
function readFreeToolsAck(): FreeToolsAck | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(FREE_TOOLS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FreeToolsAck;
    if (parsed && (parsed.status === "done" || parsed.status === "skipped") && typeof parsed.at === "number") {
      return parsed;
    }
    return null;
  } catch { return null; }
}
function persistFreeToolsAck(status: "done" | "skipped"): void {
  try {
    if (typeof localStorage === "undefined") return;
    const payload: FreeToolsAck = { status, at: Date.now() };
    localStorage.setItem(FREE_TOOLS_KEY, JSON.stringify(payload));
  } catch { /* ignore */ }
}

// 2.4.0 — H1 fix: parallel sibling of noklock.vault-index recording any
// explicit "I chose to skip" decisions the user made during enrolment.
// Today there's one (test-restore-skipped); the schema is { vaultId,
// choice: "test-restore-skipped:<unix-ms>", at } so future skips can land
// here without churning the key. Restore-time UI / inheritance-readiness
// checks can read this to surface "you skipped the drill — run it now"
// nudges; admin audit can correlate against on-chain mint events.
const ENROL_SKIP_KEY = "noklock.enrol-skip-choices";
interface EnrolSkipChoice {
  readonly vaultId: string;
  readonly choice: string;            // e.g. "test-restore-skipped:<unix-ms>"
  readonly at: number;                // unix-ms wall-clock at confirmation
}
function persistEnrolSkipChoice(vaultId: string, choice: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(ENROL_SKIP_KEY);
    const list: EnrolSkipChoice[] = raw ? (JSON.parse(raw) as EnrolSkipChoice[]) : [];
    // Last-write-wins per (vaultId, choice-prefix). The prefix is everything
    // before the trailing ":<timestamp>" — so re-confirming an already-recorded
    // skip just refreshes the timestamp rather than appending duplicates.
    const prefix = choice.split(":")[0] ?? choice;
    const filtered = list.filter((e) => !(e.vaultId === vaultId && (e.choice.split(":")[0] ?? e.choice) === prefix));
    filtered.push({ vaultId, choice, at: Date.now() });
    localStorage.setItem(ENROL_SKIP_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

// 2.4.0 — H1 fix: Form B audit beacon. Mirrors postSegmentActivity()'s
// sendBeacon/fetch-keepalive shape (src/lib/track.ts). Never blocks the
// user; never throws; private-mode / network-down safely swallow. Server
// route POST /v1/track accepts { action, scope, vaultId, kind, at } and
// appends to the enrol-skip audit log.
function postEnrolSkipAudit(args: {
  readonly action: string;
  readonly scope: string;
  readonly vaultId: string;
  readonly kind: string;
}): void {
  try {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
    const body = JSON.stringify({ ...args, at: Date.now() });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(`${API_BASE}/track`, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(`${API_BASE}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => { /* swallow — audit must never break enrol */ });
  } catch { /* swallow */ }
}

/** 2.4.0 — H1 fix: explicit test-restore skip modal. Replaces the silent
 *  "Drill passed → designate NoK" pass-through with a deliberate, audited
 *  act. Continue is DISABLED until the "I understand" checkbox is ticked
 *  so accidental clicks can't dismiss it. onConfirm() persists the choice
 *  locally + fires the Form B audit beacon BEFORE handing back to the
 *  wizard so the network beacon races the route change. */
function TestRestoreSkipModal({
  vaultId, kind, onCancel, onConfirm,
}: {
  readonly vaultId: string;
  readonly kind: EnrolKind;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}): JSX.Element {
  const [understood, setUnderstood] = useState(false);

  function handleConfirm(): void {
    // Persist the choice locally (vault-index-adjacent) and fire the audit
    // beacon. Both are fire-and-forget; never block the wizard advance.
    persistEnrolSkipChoice(vaultId, `test-restore-skipped:${Date.now()}`);
    postEnrolSkipAudit({
      action: "enrol-skip-confirmed",
      scope: "test-restore",
      vaultId,
      kind,
    });
    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="skip-modal-title">
      <div className="card max-w-lg w-full border border-amber-500/50 bg-bg-deepest">
        <h3 id="skip-modal-title" className="font-bold font-display mb-2 text-amber-300">Skip the test-restore drill?</h3>
        <p className="text-sm mb-4 text-text-on-dark/90">
          Test-restore proves your shares actually work. Skipping means you might
          find out at the worst possible moment that something is wrong. You can
          come back and test-restore later from <Link to="/restore" className="text-accent-cyan underline">/restore</Link>.
        </p>
        <label className="flex items-start gap-2 text-sm mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-1"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
          />
          <span>I understand I am choosing to skip this verification step</span>
        </label>
        <div className="flex gap-3 flex-wrap justify-end">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel — I'll drill</button>
          <button
            className="btn btn-primary"
            disabled={!understood}
            onClick={handleConfirm}
          >
            Continue without drilling
          </button>
        </div>
      </div>
    </div>
  );
}

/** 2.8.0 (AD1.7) — wallet-switched-mid-flow modal. Surfaced when the
 *  connected EOA at mint time differs from the EOA that built the vault
 *  (or when useNokMint's useAccountEffect catches a swap during the
 *  3-tx sequence). Two affordances: "Switch back" closes the modal so
 *  the user can change their wallet extension to the original account
 *  and click Mint again; "Restart enrol" clears the in-progress vault's
 *  completion marker + creator stamp and nav's to /enrol so the user
 *  rebuilds the vault under the wallet they actually want bound to it.
 *  Both addresses are rendered in full so the user can confirm which is
 *  which (truncating mid-address loses the auditability point). */
function WalletSwitchedModal({
  vaultCreator, nowConnected, onClose, onRestart,
}: {
  readonly vaultCreator: string;
  readonly nowConnected: string | undefined;
  readonly onClose: () => void;
  readonly onRestart: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="wallet-switched-title">
      <div className="card max-w-lg w-full border border-amber-500/50 bg-bg-deepest">
        <h3 id="wallet-switched-title" className="font-bold font-display mb-2 text-amber-300">Wallet changed from original</h3>
        <p className="text-sm mb-3 text-text-on-dark/90">
          This vault was created under one wallet, but a different wallet is
          connected right now. Minting the NoK SBTs from the new wallet would
          leave the on-chain inheritance tuple bound to a wallet that doesn't
          match the vault you just enrolled. Switch back to the original
          wallet, or restart enrol to rebuild the vault under the wallet you
          mean to use.
        </p>
        <div className="text-xs font-mono mb-4 space-y-1">
          <div><span className="text-text-muted">Vault created under:</span> <span className="break-all text-accent-cyan">{vaultCreator}</span></div>
          <div><span className="text-text-muted">Now connected:</span> <span className="break-all text-amber-300">{nowConnected ?? "(no wallet connected)"}</span></div>
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <button className="btn btn-secondary" onClick={onRestart}>Restart enrol</button>
          <button className="btn btn-primary" onClick={onClose}>Switch back — I'll retry</button>
        </div>
      </div>
    </div>
  );
}

function mintLabel(step: string): string | null {
  switch (step) {
    case "minting-activation": return "Minting your heir's token…";
    case "minting-voting":     return "Minting the voting token (quorum)…";
    case "done":               return "Minted ✓";
    case "stale":              return "Wallet changed — review";
    default: return null;
  }
}

function tx(hash: `0x${string}`): JSX.Element {
  return <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{hash.slice(0, 10)}…{hash.slice(-6)}</a>;
}

// MaskedSecret moved to components/MaskedSecret.js (shared with Restore,
// which previously used a plain pre-fillable <input type=password>).
