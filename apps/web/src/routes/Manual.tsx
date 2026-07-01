// @version 0.7.0 @date 2026-06-13
// 0.7.0 — Daniel 2026-06-13: FIXED the locale index-drift that left §4.5,
//         §5 (third noklock-cli step), §7.5, §13, §14 and §15 rendering in
//         English for every non-EN locale. Root cause: §4.5 (EN index 4) and
//         §7.5 (EN index 8) were inserted into EN AFTER the positional
//         locale headings/whats arrays were authored, so clone() read every
//         tail section at the wrong EN index. Fix: each locale's
//         headings/whats arrays now have explicit slots at index 4 (§4.5) and
//         index 8 (§7.5), realigning §5..§15 onto their true EN positions.
//         §4.5 + §7.5 themselves now carry FULL translations (DE/FR/PT
//         curated; zh-Hans/hi machine-translation first-pass under the
//         existing doc.draft amber flag); §5 gains its third noklock-cli
//         step in every locale; §15 "Wallet migration after enrolment" now
//         has a translated heading + body in all five locales. notes are
//         re-keyed to EN index ({4} §4.5, {5} §5, {8} §7.5) so the amber
//         share-spreading callout tracks §5 again and §4.5/§7.5 carry their
//         own notes. No funnel-dictionary key change; no route/logic change.
//         The "known locale misalignment cost accepted" note below is now
//         obsolete for these sections — kept for historical context only.
// @version 0.6.2 @date 2026-06-07
// 0.6.2 — Daniel 2026-06-07: NEW §4.5 "Simple route vs maximum security"
//         inserted between §4 (enrol wizard) and §5 (how saving works).
//         Names BOTH routes explicitly so a casual user sees the floor
//         (three local folders on laptop/phone/USB, URL blank, beats a
//         sticky note in a drawer) before the §5 storage-URL pipeline
//         scares them off. Same framing as Landing 0.22.0 + Pricing FAQ
//         + CryptoInheritance Q ("three shares scattered in your own
//         folders already beats a sticky note") — single source of
//         simple-vs-max-security copy now lives consistently across the
//         user-facing surface. EN canonical only; locale clones fall
//         through to EN per the same pattern used for §7.5 (0.3.0) and
//         §15 (0.4.1) — known locale misalignment cost accepted, just
//         like 0.3.0. The new EN index is 4; subsequent EN sections
//         shift +1 in the sections[] array but their visible numeric
//         labels (5./6./7./...) stay the same (renumbered for clarity:
//         the new §4.5 keeps decimal notation so the existing §5..§15
//         text retains its numbering and locale notes:{4} amber callout
//         still tracks §5 correctly — see clone-index math below).
//         NOTE on note-indexing: locale notes:{4} keys reference the
//         §5 share-spreading amber callout (still at EN sections[5] now
//         that §4.5 sits at sections[4]). Clone() resolves note via
//         t.notes[i] where i is the EN sections[] index; since §5
//         moved from i=4 to i=5, the locale notes:{4} entries would
//         attach to the NEW §4.5 instead of §5. We avoid this by
//         giving the new §4.5 its OWN amber note (EN-only) and the
//         locale clones simply pick up EN's note for §5 via the EN
//         fallback path. Net effect: notes:{4} in each locale shows
//         on §4.5 (semantically still about share-spreading, which
//         IS what §4.5 discusses) and §5 falls back to EN note text.
// @version 0.6.1 @date 2026-06-03
// 0.6.1 — Daniel 2026-06-03: Section 5 "How saving & spreading shares
//         really works" gains a third step: noklock-cli (the open-source
//         auto-upload CLI). Same trust story as the existing manual steps;
//         link to GitHub repo for install + audit.
// @version 0.6.0 @date 2026-06-01
// 0.6.0 — NEW Section 2 "Vault use cases — what to actually put in (and why)"
//         inserted at EN index 1. Mounts <VaultUseCases /> (full-detail
//         variant) below per-category prose that frames the "why someone
//         picks this" and "what failure mode it prevents" angle for each of
//         the six catalog rows (crypto/finance, digital identity, hidden
//         places, vital documents, final wishes, recovery codes). Sits high
//         up so users hitting /manual can think through their full storage
//         plan before reading the wizard walkthrough.
//
//         Insertion is index-aware: locale clones (DE/FR/PT/zh/hi) each get
//         a passthrough at headings[1] + whats[1] so their existing entries
//         for §3..§14 don't misalign. Each locale's note key 3 (the §4
//         "spread shares" amber callout) shifts to 4 to track the renumber.
//         New section's heading + prose stays EN across all locales (same
//         EN-fallback pattern as §6.5 in 0.3.0 and §14 in 0.4.1).
//
//         Renderer special-cases section.mount === "vault-use-cases" to drop
//         the <VaultUseCases /> grid in below the per-category context.
// 0.5.0 — Online/offline transition pass (Daniel 2026-06-01). §3 enrol-wizard
//         now spells out which screens are offline (airgap engaged) vs online
//         (distribute step at the end), and a new step "Distribute — upload
//         to storage" is inserted between "Store share locations" and
//         "Test-restore drill" so the user reads the actual on-screen flow
//         that now ends with the network coming back on. §5 restore now
//         splits explicitly into "Gather (online)" + "Force offline" + the
//         existing decrypt steps, matching the new /restore force-offline
//         step. EN canonical; locale clones silently fall back to the
//         English text for the new steps (same pattern as the §14 addition
//         in 0.4.1).
// 0.4.1 — KNOWN-DEFECTS disclosure: appended a new §14 "Wallet migration
//         after enrolment" subsection at the END of the EN doc so locale-
//         clone index alignment is preserved (clone falls back to EN text
//         for the new section in DE/FR/PT/zh/hi). Documents that the OLD
//         wallet remains owner-of-record for quorum-protected vaults until
//         re-enrolment from the new wallet.
// 0.4.0 — M-of-N pre-v0.6 honesty disclosure: per K.BEFORE of the M-of-N
//         Restore Quorum Fix Plan (2026-06-01), all HEIR-quorum claim
//         lines now qualify "M-of-N quorum" with "enforced from v0.6
//         onwards; vaults enrolled before v0.6 remain owner-restorable;
//         re-enrol to upgrade". Today's restore-pipeline has zero
//         heir-cooperation check — single heir with K shares + master
//         password can restore alone — so the bare claim was dishonest.
//         13 inline qualifiers added across 6 locales (en/de/fr/pt/zh/hi)
//         in §3 designate, §9 heir restore (en only — other locales
//         already lacked the multi-heir line), §10 SBT-voting role.
//         Guardian-recovery M-of-N lines untouched (different system, on-
//         chain enforced today). No structural / route / i18n-key change.
// 0.3.0 — launch-blocker-1-owner-cancel-window: new §6.5 "Owner cancel-window
//         on activation" disclosing the 48h (default; env-tunable
//         OWNER_CANCEL_WINDOW_HOURS, 0-168) delay between Chainlink firing
//         the dead-man and the heir-notification email going out. Surfaces
//         from the Dashboard's "Pending activations" widget. Reads the value
//         from lib/cancelWindow.ts (single source of truth).
// 0.2.1 — FIX-COPY 3: vault-storage scope language clarified — vault list
//         is per-browser-profile (not per-device): Chrome vs Firefox on
//         same laptop sees different lists. Updated §8 note + §1 step
//         copy that described scope. EN canonical only.
// 0.2.0 — "Download PDF" button in the header (window.print() → user picks
//         "Save as PDF" in their print dialog). Outer wrapper gains
//         `print-doc` so the print stylesheet in index.css can strip chrome.
// 0.1.2 — §6 + Golden rules: documented the new zero-PII Calendar reminder
//         (download .ics / Google Calendar link from Heartbeat / Settings /
//         Dashboard) so users don't forget to check in. (EN canonical; locale
//         clones keep the existing draft text for now.)
// 0.1.1 — bottom "Start: choose what to protect" CTA localized (was
//         hardcoded English). German guillemets fixed earlier.
// /manual — multilingual, screen-aligned user guide. PURELY ADDITIVE:
// a new route + static content. Touches no enrol/restore/wallet/contract
// logic and no existing i18n — it cannot break existing flows.
//
// Alignment principle: the app UI is English (the legally-binding
// version). Every section here shows the EXACT English screen label the
// user sees on screen (a mono chip) + the route, then explains what to
// do in the selected language. So a non-English user matches the chip to
// what's on their screen and reads the steps in their own language.
//
// Language comes from the existing useT() selector (Footer/Settings).
// zh-Hans + hi are first-pass drafts pending native review (same honest
// stance as the rest of the app). English is authoritative.

import { Link } from "react-router-dom";
import { useT, type Lang } from "../i18n/index.js";
import { LangSelect } from "../components/LangSelect.js";
import { PrintAsPDFButton } from "../components/PrintAsPDFButton.js";
import VaultUseCases from "../components/VaultUseCases.js";
import { useDocumentHead } from "../lib/seo.js";
import { OWNER_CANCEL_WINDOW_HOURS } from "../lib/cancelWindow.js";

interface Step {
  /** EXACT English on-screen label/button the user sees. */
  readonly screen: string;
  /** Localized: what that screen is and what to do. */
  readonly what: string;
}
interface Section {
  readonly heading: string;
  readonly route?: string;
  readonly steps: readonly Step[];
  readonly note?: string;
  /** Optional renderer hook — when set, the section also mounts a live
   *  component below its prose. "vault-use-cases" mounts <VaultUseCases />
   *  (full-detail variant). */
  readonly mount?: "vault-use-cases";
}
interface Doc {
  readonly title: string;
  readonly intro: string;
  readonly draft?: string; // shown for not-yet-native-reviewed locales
  readonly sections: readonly Section[];
}

const EN: Doc = {
  title: "NoKLock — step-by-step user guide",
  intro:
    "This guide walks you through the whole app, screen by screen. The app itself is in English (the legally-binding version); each step below names the exact English label you'll see on screen so you can match it, then explains what to do.",
  sections: [
    {
      heading: "1. Connect your wallet",
      steps: [
        { screen: "Connect wallet", what: "Top-right of every page. Connect any EVM wallet (MetaMask, a hardware wallet via MetaMask/Trust, or WalletConnect). The wallet is only for your on-chain licence and naming your next-of-kin — your vault's encryption secret is a separate offline layer that never touches a wallet." },
        { screen: "Reconnecting wallet…", what: "On return visits you may briefly see this — it means your previous session is being restored. Wait a moment; you do NOT need to reconnect." },
      ],
    },
    {
      heading: "2. Vault use cases — what to actually put in (and why)",
      mount: "vault-use-cases",
      steps: [
        { screen: "—", what: "This is the deep reference for thinking through your full storage plan BEFORE you start enrolling. Most users don't have one secret to protect — they have a stack: a hardware-wallet seed, a list of cloud logins their partner will need to memorialise, a photograph of where the safe-deposit-box key is taped, a sealed letter for each child, and the printed 2FA recovery codes from every account that gates the rest. Each category below has a different failure mode, and each tells you which of the four vault kinds (seed / sealed letter / document / image) you should pick — the live catalog under this section lets you click straight into the right wizard." },
        { screen: "Crypto & Finance Keys", what: "WHY you pick this: there is no support line for a lost BIP-39 seed or a lost exchange recovery code. A single 12-word phrase often gates more wealth than the average estate's house. FAILURE MODE prevented: heir-of-record stares at a Ledger they cannot unlock, an exchange account that auto-archives after dormancy, a password manager whose master key only you knew — and the assets stay frozen forever. Recommended vault kind: seed (high-entropy short strings, designed exactly for BIP-39-sized payloads)." },
        { screen: "Digital Identity & Accounts", what: "WHY you pick this: Apple ID, Google, primary email and the social platforms each have a different deceased-user policy — and most of those windows expire 6-12 months after death. Heirs who don't have the credentials within that window cannot memorialise the profile, recover the photos, or close the subscriptions that keep billing the estate. FAILURE MODE prevented: a lifetime of photos becomes inaccessible behind a forgotten Apple ID; a domain lapses and gets bought out from under the family; Netflix and Adobe quietly drain the estate for years. Recommended vault kind: letter (free-form text — a credentials roster fits naturally)." },
        { screen: "Hidden Places & Physical Hints", what: "WHY you pick this: a thousand-word letter cannot tell your partner which drawer the hardware wallet is in as clearly as an annotated photograph. Safe-deposit boxes, home safes, buried cash, spare keys, the lawyer who holds the original will — these are LOCATIONS, and locations want pictures. FAILURE MODE prevented: heirs cannot find what they don't know is there. Safe-deposit boxes get drilled and the contents auctioned by the state under unclaimed-property laws. Buried cash stays buried. Spare keys help nobody if their location died with you. Recommended vault kind: image (the pipeline encrypts the JPEG/PNG byte-for-byte — captions go in the filename or in a paired letter vault)." },
        { screen: "Vital Documents", what: "WHY you pick this: probate stalls without the originals. \"It's at the lawyer's\" is not the same as \"here is the signed PDF.\" Insurance policies go unclaimed if the heir doesn't know they exist; tax-return penalties accrue when the estate misses its final filing; a business with a dead sole founder and no findable cap table becomes worthless in months. FAILURE MODE prevented: months of executor work hunting for paperwork that should have been one click away, with deadlines passing that turn assets into losses. Recommended vault kind: document (handles PDFs, scans, and multi-page legal files in one sealed payload)." },
        { screen: "Final Wishes & Personal Letters", what: "WHY you pick this: the things you wanted to say, that only you could have said, are the things grieving families default away from when they have no other guidance. Funeral choices get made under pressure. Pets get rehomed to whoever offers first. Ethical wills — the values and stories you wanted carried forward — never get written. FAILURE MODE prevented: a generic service nobody wanted, fights over pets and possessions, and a next generation that never hears what you would have wanted them to know. Released only after the dead-man trigger — the heir reads it in the moment that matters. Recommended vault kind: letter (free-form text, multi-recipient, no length limit that matters in practice)." },
        { screen: "Recovery Codes & Backup Secrets", what: "WHY you pick this: recovery codes are designed to be the only escape hatch when everything else fails — a lost phone, a corrupted hard drive, a bricked laptop with FileVault on. Lose them and the account is gone, and no support process can restore them. They are exactly the kind of high-entropy short string a seed-vault was built to hold. FAILURE MODE prevented: a brand-new phone that cannot pass 2FA into the email that gates every other reset, a BitLocker-encrypted drive nobody can unlock, GPG-encrypted backups whose keys are gone — and the heir is locked out of the digital estate even though they have physical possession of the hardware. Recommended vault kind: seed (short, dense, high-entropy strings — exactly the shape this vault type was tuned for)." },
        { screen: "—", what: "Putting it all together: most enrolled users end up with 3-5 vaults, not 1 — typically a seed vault for crypto, a letter vault for the credentials-and-final-wishes combination, an image vault for the safe-deposit-box / home-safe photos, and a document vault for the signed-PDF estate paperwork. The dead-man's switch is per-WALLET (not per-vault), so one heartbeat covers all of them. Cost-wise, each vault is its own enrolment but they share infrastructure — see /pricing for the current tier model." },
      ],
      note: "The live catalog below shows each of the six categories with the full example list and the urgency / failure-mode reasoning. Click \"Pick this\" on any row to jump straight into the enrol wizard for the matching vault kind.",
    },
    {
      heading: "3. Choose what to protect",
      route: "/enrol",
      steps: [
        { screen: "What are you protecting?", what: "Pick one card: a crypto seed phrase, a sealed letter, a document, or an image. All four run the identical secure pipeline — only what you put in differs." },
      ],
    },
    {
      heading: "4. The enrol wizard (the step strip at the top)",
      route: "/enrol/seed",
      steps: [
        { screen: "Begin", what: "ONLINE. Read the short intro and start. A row of step names is shown at the top so you always know where you are." },
        { screen: "I'm offline — start the airgap", what: "BOUNDARY → goes OFFLINE. Turn off Wi-Fi, mobile data and Bluetooth, then click this. From here the PWA blocks every fetch() from this tab; the device airplane-mode prompt is belt-and-braces. Splitting and encrypting happen with the network blocked — nothing about your secret can leave the device." },
        { screen: "Enter your seed", what: "OFFLINE. Type/paste your 12 or 24-word phrase (or write/upload your letter/document/image). Just testing? Use the small \"fill a throwaway test seed\" link — it generates a fresh valid phrase that controls nothing, so you can practise safely." },
        { screen: "Threshold", what: "OFFLINE. Choose how many shares in total (N) and how many are needed to rebuild it (T). 3-of-5 is the balanced default." },
        { screen: "Set master password", what: "OFFLINE. This derives the encryption key. You MUST remember it — it is the ONLY way you (and your next-of-kin) ever recover the vault. Press and hold the eye icon to check what you typed. It is never pre-filled and never saved." },
        { screen: "Duress (optional)", what: "OFFLINE. Optionally add a decoy vault with a different password. If someone forces you to open it, you give the decoy password and they see a believable throwaway — your real vault stays hidden." },
        { screen: "Splitting + encrypting", what: "OFFLINE. The app does the cryptographic work locally — Argon2id KDF, SLIP-39 split, per-share AEAD, Ed25519 manifest signing. Nothing is uploaded. The pipeline viz on this screen walks you through every step in motion." },
        { screen: "Save share files", what: "OFFLINE — last offline step. Get the encrypted files out of the browser onto disk: \"Save into a folder…\" (Chrome/Edge — writes them straight into a folder you pick) or \"Download all files\". The files are AEAD-sealed already; getting them to disk is the handoff to the online distribute step." },
        { screen: "Distribute — upload to storage", what: "BOUNDARY → goes ONLINE. Reconnect Wi-Fi / mobile data. The app then uploads (or you place) each encrypted share-vault to the storage URL you chose — one share per separate cloud account, or IPFS / Arweave for permanence. Only the AEAD ciphertext crosses the boundary; your seed, master password, and master secret never do. This is the new \"distribute\" step in the pipeline viz." },
        { screen: "Store share locations", what: "ONLINE. Paste each \"anyone with the link\" URL back into NoKLock so the manifest can record where each share lives (only the URL is stored, locally; no OAuth, no API access). Separate accounts is the whole point: one stolen account then leaks only one share, so your secret stays safe." },
        { screen: "Test-restore drill", what: "ONLINE then OFFLINE. Before you trust it, open Restore in another tab and prove your threshold of files + your master password really brings the secret back. The restore route forces its own airgap before decryption — see §6." },
        { screen: "Next-of-kin (optional)", what: "ONLINE (on-chain). Enter your heir's wallet address to mint the inheritance tokens on Polygon. You can also do this later from /nok." },
        { screen: "Vault enrolled ✓", what: "Done. Your secret is split, encrypted offline, and the sealed share-vaults are distributed across the storage you chose." },
      ],
      note: "Online vs offline at a glance — Begin is ONLINE; \"I'm offline — start the airgap\" is the boundary into OFFLINE; every screen up to and including \"Save share files\" runs OFFLINE with the network blocked; \"Distribute — upload to storage\" is the boundary back into ONLINE; everything after (Store locations, Test-restore drill, Next-of-kin, Vault enrolled) is ONLINE. Only AEAD ciphertext ever crosses the boundary in either direction.",
    },
    {
      heading: "4.5. Simple route vs maximum security — pick your floor",
      steps: [
        { screen: "—", what: "NoKLock supports a wide spread between \"better than a sticky note in a drawer\" and \"survives every realistic loss scenario\". The two routes use the SAME cryptographic pipeline — only WHERE the encrypted share files end up differs. You can start simple and graduate to maximum security later without re-enrolling: the share files are portable, the master password and threshold stay the same, you just move (or copy) the files into more places." },
        { screen: "Simple route — three local folders, URL blank", what: "The floor. At the \"Store share locations\" step, leave each URL blank and just place ONE share-vault file into THREE folders you already use every day: one on your laptop (e.g. ~/Documents/noklock/share-A), one on your phone (Files app → On My iPhone / internal storage), and one on a USB stick you keep in a drawer. That's it. No cloud account, no IPFS, no Arweave, no extra signup. A laptop dying + a phone dying + a USB stick getting lost at the same time is what it takes to lose your secret — and even then, the master password is still in your head and any single surviving copy plus K-1 others from anywhere rebuilds the vault. This already beats a written sticky note in a drawer by every measure that matters: the shares are AEAD-sealed (a thief who grabs the laptop sees ciphertext, not a seed), they're geographically spread (laptop bag vs phone in pocket vs drawer), and the dead-man's switch / NoK flow still works the same way." },
        { screen: "Maximum security — cloud accounts / IPFS / Arweave / multiple drives", what: "The ceiling. At the same \"Store share locations\" step, paste a real URL for each share: one Dropbox account, one Google Drive in a different Google identity, one OneDrive on a third email, one IPFS pin, one Arweave permanent-storage upload, one external SSD in a fireproof box, one safe-deposit-box USB. Each share to a SEPARATE account / provider / physical location. Now losing your secret requires the simultaneous failure of multiple independent cloud providers AND the loss of your physical drives AND the loss of every locally-cached copy. This is the configuration for people protecting six-figure-plus crypto, life-insurance-policy-sized estates, or business continuity for a sole-founder company. The /info → Shares model page and /pricing have the full per-tier guidance on how many shares + how many independent locations matches what threat model." },
        { screen: "—", what: "Which to pick: if you've never run NoKLock before, start with the simple route TODAY and graduate later. The simple route enrolment takes about five minutes once you've installed the PWA, and from that moment your secret is safer than it was an hour ago. The maximum-security route adds another 20-40 minutes of signing up to (or logging into) the separate accounts and uploading each share — perfectly worth it for high-value secrets, but \"I'll get to it next weekend\" is exactly how seeds end up living on a sticky note for years. The five-minute floor exists so that \"better than nothing\" is genuinely easy." },
      ],
      note: "If you're choosing between \"simple route now\" and \"maximum security in a few weeks when I get around to it\", pick the simple route now and upgrade later. Three local folders + your master password + the dead-man's switch is already a working inheritance plan; the URL fields and the cloud-account ceremony can be filled in afterwards without re-enrolling.",
    },
    {
      heading: "5. How saving & spreading shares really works",
      route: "/info?tab=shares",
      steps: [
        { screen: "Save into a folder…", what: "Chrome/Edge only: you pick a folder on your computer; all files are written straight in. If that folder is your Dropbox/OneDrive/Drive desktop-sync folder, the cloud's own app syncs them up. NoKLock never talks to your cloud itself." },
        { screen: "Download all files", what: "Any browser: the files download normally and you upload them yourself wherever you want." },
        { screen: "Speed-up (optional): noklock-cli", what: "Open-source command-line tool that auto-uploads to Dropbox today (Google Drive + OneDrive coming). It runs on YOUR computer with YOUR token — NoKLock never sees the token. Same trust story as manual, much faster for 3+ shares. Install + docs: github.com/dksteeves/noklock/tree/main/tools/noklock-cli" },
      ],
      note: "Never put all shares in one folder/account — that removes the protection. One share per separate account.",
    },
    {
      heading: "6. Restore your secret later",
      route: "/restore",
      steps: [
        { screen: "Gather — download K share-vaults", what: "ONLINE. Open your cloud folders / IPFS gateway / Arweave URL, download the share-vault files + manifest.json. The files are AEAD-sealed — downloading them reveals nothing. This is the only online step on the restore side." },
        { screen: "Force offline — re-arm the airgap", what: "BOUNDARY → goes OFFLINE. /restore enforces this before any decryption: the PWA puts itself back into airgap mode (fetch() blocked), and you're prompted to switch the device to airplane mode. Mirror image of the enrol \"I'm offline — start the airgap\" step." },
        { screen: "Drop your share files + manifest.json here", what: "OFFLINE. Drop the files you gathered in (or click to pick). Or paste one share's direct-download link and Fetch — one at a time. There is no \"one folder link\"." },
        { screen: "Vault master password", what: "OFFLINE. Enter the master password you set at enrol. Reconstruction (Ed25519 verify → Argon2id re-derive → AEAD decrypt → SLIP-39 combine → BIP39 reconstruct) runs entirely in your browser with the network blocked. Your secret never leaves the airgap. Refresh the page to clear it from memory afterwards." },
      ],
      note: "Online vs offline at a glance — \"Gather — download K share-vaults\" is the only ONLINE step; everything from \"Force offline\" onwards runs OFFLINE with the network blocked. Mirror image of enrol: enrol = build-offline-then-distribute-online; restore = gather-online-then-rebuild-offline. Only AEAD ciphertext ever crosses the boundary in either direction.",
    },
    {
      heading: "7. Next-of-kin, heartbeat & dead-man's switch",
      route: "/nok",
      steps: [
        { screen: "+ Designate", what: "/nok — add each heir by WALLET (they already have one) or by EMAIL (Hybrid-E — they don't). Each designation mints ONE soulbound Activation NFT (ERC-5192) on Polygon — one heir, one token, one transaction. Wallet-NoK = the token goes to their wallet directly. Email-NoK = held in escrow until the heir completes the walkthrough at /nok-claim/<nonce>. With multiple heirs you can require an M-of-N quorum (e.g. 2-of-3) before inheritance unlocks — that adds a Voting NFT per heir (Premium, from v0.6 onwards — vaults enrolled before v0.6 remain owner-restorable; re-enrol to upgrade; see /pricing for current status)." },
        { screen: "Heartbeat", what: "/heartbeat — check in periodically (free off-chain signed, or a trustless on-chain heartbeat). Each check-in resets your grace-period clock. One heartbeat covers ALL your vaults on this wallet — the dead-man's switch is per-wallet, not per-vault." },
        { screen: "Calendar reminder", what: "/heartbeat, Settings or Dashboard → \"Never forget a heartbeat\": add a recurring reminder to your OWN calendar — download an .ics (Apple Calendar / Outlook / Thunderbird / any app) or use the one-click Google Calendar link, on as many calendars as you like. Zero-PII: NoKLock takes no email and sends nothing; the reminder lives only in your calendar. Pick a cadence comfortably shorter than your grace period so you always have time to check in." },
        { screen: "Dead-man's switch", what: "/dead-man — TWO modes. Safe simulation (default) walks you through what would happen with your live timings, no chain tx. Real test fire fires your actual on-chain switch (typed confirmation required). Honest: once fired, your NoKs WILL inherit." },
      ],
    },
    {
      heading: "7.5. Owner cancel-window on activation",
      route: "/dashboard",
      steps: [
        { screen: "Pending activations", what: `If your dead-man's switch ever fires (Chainlink confirms grace expired + mints an Activation SBT to a heir), the off-chain heir-notification email is held for ${OWNER_CANCEL_WINDOW_HOURS}h BEFORE going out. During that window the Dashboard surfaces a "Pending activations — your cancel window" banner with a countdown. Activations include a ${OWNER_CANCEL_WINDOW_HOURS}h owner cancel-window. False-positive activations (owner missed heartbeat for a benign reason — sick, off-grid, simply forgot) can be aborted by the owner during the window before the heir is notified.` },
        { screen: "Cancel activation", what: "One click does both halves of the cleanup: (1) sign a Form B attestation that suppresses the heir email permanently, then (2) the SBT is burned on-chain via revokeNoK (your wallet pops the tx). Both steps are needed because Form B-only would leave the SBT minted (a heir who finds the token id could still try a direct on-chain claim) and revokeNoK-only would burn the token but the email's already in flight." },
      ],
      note: `The window length is configurable by the operator via env var OWNER_CANCEL_WINDOW_HOURS (defaults to ${OWNER_CANCEL_WINDOW_HOURS}; valid range 0-168, i.e. 1 week max). Once the timer hits zero the cancel-window has elapsed and the heir notification is queued for delivery; from that point the only remaining mitigation is calling revokeNoK on-chain.`,
    },
    {
      heading: "8. Social recovery — guardians (different from NoKs)",
      route: "/recovery",
      steps: [
        { screen: "My guardians", what: "/recovery → My guardians tab. Set 1–9 wallets (M of N) you trust to help you re-take your designation if you ever lose YOUR wallet. Guardians ≠ NoKs: guardians help YOU regain access while you're still alive; NoKs receive your vault after you stop checking in (the dead-man's switch). Same person can play both roles." },
        { screen: "Recover a wallet", what: "/recovery → Recover a wallet tab. If someone you guard for has lost their wallet, initiate or vote on a recovery here. Time-locked + M-of-N gated; the original wallet retains a cancellation window so guardian collusion cannot silently take your account." },
        { screen: "Cancel my recovery", what: "/recovery → Cancel my recovery tab. If you still control the original wallet and someone initiated a recovery on you, cancel it here from inside the time-lock window. This is the defence against guardian collusion." },
      ],
      note: "The guardian-set function is permissionless and self-scoped — each user can ONLY change their OWN guardian list. The on-chain contract enforces this; SolidityScan's free-tier flag on it is a false positive (documented on Info → Contracts).",
    },
    {
      heading: "9. Dashboard cockpit",
      route: "/dashboard",
      steps: [
        { screen: "Heartbeat & grace period", what: "Last heartbeat, time left in grace, traffic-light status (Healthy / Due soon / Overdue). Send-heartbeat button. One heartbeat covers ALL your vaults on this wallet — the switch is per-wallet, not per-vault." },
        { screen: "Your vaults", what: "Real count of vaults sealed in THIS browser profile (per-kind: seed / sealed letter / document/image). Heir coverage line: X of Y vaults have a designated NoK on-chain." },
        { screen: "Needs your attention", what: "Honest nudges: heartbeat overdue / vault with no NoK / no vaults enrolled yet. No fake \"quarterly audit\" — these are the real action items." },
        { screen: "Your defaults", what: "Read-out of your Settings defaults (threshold / total shares / grace period) so the cockpit is one place for state-at-a-glance." },
      ],
      note: "This page lives in THIS browser profile (a different browser, a different browser profile, or another device shows a different list — and the list is not synced anywhere). Restore is the browser-and-device-independent path for vaults enrolled elsewhere.",
    },
    {
      heading: "10. The instruction manual for an heir",
      route: "/nok-claim",
      steps: [
        { screen: "Inheritance claim", what: "/nok-claim/<nonce> — if someone designated YOU as their next-of-kin by email and their dead-man's switch has fired, you'll land here from the activation email. The page walks you through what's happening + the claim. (If you're a designator, share this URL pattern with your heirs in your own succession plan; if you're the heir reading this manual now, the email you received contains the actual link.)" },
        { screen: "Step 1 — connect or create a wallet", what: "If you don't already have a Polygon wallet, install MetaMask (or similar). The NFT goes to that wallet. NoKLock never sees the private key." },
        { screen: "Step 2 — claim my inheritance NFT", what: "One button does it all: NoKLock's server signs a time-limited cryptographic statement proving you are the heir for this email, your wallet sends it to the on-chain escrow, and the escrow burns the placeholder NFT and mints a fresh soulbound (ERC-5192) one to you. Cost: a few cents in MATIC gas." },
        { screen: "What now? — restoring the vault", what: "The NFT alone doesn't decrypt anything. You also need: (1) the MASTER PASSWORD the original owner shared with you ahead of time (NoKLock never had it), and (2) the SHARE FILES or share URLs the owner left with you. Open /restore, drop the shares, type the password — the vault rebuilds. If there were multiple heirs with M-of-N voting (Premium, from v0.6 onwards — see /pricing for current status), the others also need to claim before the vault is released; vaults enrolled before v0.6 remain owner-restorable (re-enrol to upgrade)." },
      ],
      note: "A dedicated plain-language heir guide is published as docs/nok-user-guide.rtf — share it with heirs ahead of time so they know what to expect.",
    },
    {
      heading: "11. Soulbound NFTs (ERC-5192) — your inheritance proof",
      steps: [
        { screen: "—", what: "A NoK designation mints one soulbound Activation NFT on Polygon — the dead-man's-switch trigger. Only M-of-N quorum vaults add a Voting NFT per heir (the heir-cooperation release — enforced from v0.6 onwards; pre-v0.6 vaults remain owner-restorable, re-enrol to upgrade). You can take a designation back any time (revoke). Soulbound (ERC-5192) means non-transferable: the token cannot be sold, moved, stolen, or seized once minted to a wallet." },
        { screen: "—", what: "This is a rare-in-production use of the ERC-5192 standard (published 2022). NoKLock is one of the few systems actually using it for what the standard was designed for — proving on-chain rights that cannot be traded away." },
        { screen: "—", what: "Every NoKLock contract is source-verified on PolygonScan; the full list with addresses lives on Info → Contracts. You can independently verify the SBT token is yours and cannot be transferred away from the heir's wallet." },
      ],
    },
    {
      heading: "12. Settings, info & help",
      route: "/settings",
      steps: [
        { screen: "Settings", what: "/settings — defaults (threshold / total shares / grace period), language, and account help." },
        { screen: "Info", what: "/info — architecture, the share model, security, passkeys, contracts (with the live audit posture for all 5), and the \"Why not keyless?\" explainer." },
        { screen: "Help", what: "/help — practical FAQ and troubleshooting." },
        { screen: "Updates", what: "/updates — owner-signed roll-by-roll change history. Every release we describe what shipped." },
      ],
    },
    {
      heading: "13. Golden rules",
      steps: [
        { screen: "Set master password", what: "Never lose your master password. It is the single canonical key — a lost passkey or dead device can never replace it." },
        { screen: "Store share locations", what: "Keep your shares spread across separate accounts AND make sure your next-of-kin can reach them (location list shared with them outside NoKLock)." },
        { screen: "Heartbeat", what: "Send one any time you remember. A heartbeat once a month or whenever you open the app is plenty for the default 60-day grace. Add the recurring calendar reminder (Heartbeat / Settings / Dashboard) so \"I forgot\" is never the reason your switch fires — zero-PII, it lives only in your own calendar." },
        { screen: "—", what: "English is the authoritative version of every screen and legal text. NoKLock never sees or touches your keys, shares or data. The blockchain is the final word on what's enforced." },
      ],
    },
    {
      heading: "14. Live-Man's Switch — get alerted before a wrongful inheritance",
      route: "/settings",
      steps: [
        { screen: "Live-Man's Switch — alerts", what: "In Settings, below Vault defaults. Set up how NoKLock reaches you WITHOUT opening the app if a guardian recovery is ever started against your wallet, so you can cancel it in time. It's the counterpart to the dead-man's switch — the signal that reaches YOU." },
        { screen: "Save watchers + fund", what: "Register 1-2 wallets you check regularly (NOT this one) and add a little POL. If a recovery starts against you, each watcher gets a tiny on-chain ping — most wallet apps surface an incoming transfer — plus a permanent on-chain record. You fund your own pings, so it works even if NoKLock disappears, and pings can only go to your own wallets." },
        { screen: "Send test alert", what: "Sends a test ping now so you can confirm the incoming transfer shows up in your watcher wallet's app. Turn on incoming-transfer notifications in that wallet so you don't miss the real one." },
        { screen: "Save email (sign)", what: "Optional, off by default — the only thing that ever leaves your device. If you add an email, NoKLock also emails you when a recovery starts against your wallet: reliable delivery, but it depends on NoKLock's server (the wallet ping does not)." },
        { screen: "Review & cancel →", what: "If you're ever alerted and it wasn't you, this opens /recovery where you cancel the recovery from your wallet within the window (1-30 days, default 7). If it was a real loss, do nothing and recovery completes." },
      ],
      note: "A next-of-kin can NEVER trigger your inheritance early — only your own silence past the grace period can. The Live-Man's Switch is about the other case: a guardian social-recovery, which you can always cancel if you know it started.",
    },
    {
      heading: "15. Wallet migration after enrolment",
      steps: [
        { screen: "—", what: "After migrating to a new wallet, your existing quorum-protected vaults still reference your OLD wallet as the owner-of-record. You must either (a) re-enrol each vault from the new wallet, OR (b) keep the old wallet keys secure — they remain the only way to issue an owner-self-restore for those vaults." },
      ],
    },
  ],
};

// ── Translations ───────────────────────────────────────────────────────
// de/fr/pt full; zh-Hans/hi first-pass drafts (flagged). Structure +
// screen labels are identical to EN by design (the screen labels are the
// real English UI text the user sees — they are intentionally NOT
// translated so the user can match them to their screen).

function clone(base: Doc, t: {
  title: string; intro: string; draft?: string;
  headings: readonly string[];
  whats: readonly (readonly string[])[];
  notes: Readonly<Record<number, string>>;
}): Doc {
  return {
    title: t.title,
    intro: t.intro,
    ...(t.draft ? { draft: t.draft } : {}),
    sections: base.sections.map((s, i) => ({
      heading: t.headings[i] ?? s.heading,
      ...(s.route ? { route: s.route } : {}),
      steps: s.steps.map((st, j) => ({ screen: st.screen, what: t.whats[i]?.[j] ?? st.what })),
      ...(t.notes[i] ? { note: t.notes[i] } : {}),
    })),
  };
}

const DE: Doc = clone(EN, {
  title: "NoKLock — Schritt-für-Schritt-Anleitung",
  intro:
    "Diese Anleitung führt Sie Bildschirm für Bildschirm durch die App. Die App selbst ist auf Englisch (die rechtlich verbindliche Fassung); jeder Schritt nennt die exakte englische Beschriftung, die Sie auf dem Bildschirm sehen, und erklärt dann auf Deutsch, was zu tun ist.",
  // 0.7.0 — index-drift realignment: the headings/whats arrays are positional
  // by EN sections[] index. §4.5 (EN index 4) and §7.5 (EN index 8) were
  // inserted into EN AFTER these arrays were authored, so every tail section
  // drifted. Explicit empty/passthrough slots now sit at index 4 (§4.5) and
  // index 8 (§7.5) so §5..§15 realign onto their true EN positions; §4.5 and
  // §7.5 themselves carry full DE translations below (no longer EN-fallback).
  headings: [
    "1. Wallet verbinden",
    // §2 (0.7.0 DE) Vault use cases — heading + bodies now translated.
    "2. Tresor-Anwendungsfälle — was Sie wirklich hineinlegen sollten (und warum)",
    "3. Wählen, was Sie schützen",
    "4. Der Einrichtungs-Assistent (die Schrittleiste oben)",
    "4.5. Einfacher Weg vs. maximale Sicherheit — wählen Sie Ihre Basis",
    "5. Wie Speichern & Verteilen der Anteile wirklich funktioniert",
    "6. Ihr Geheimnis später wiederherstellen",
    "7. Nächste Angehörige, Lebenszeichen & Totmannschalter",
    "7.5. Eigentümer-Stornofenster bei Aktivierung",
    "8. Soziale Wiederherstellung — Guardians (anders als NoKs)",
    "9. Dashboard-Cockpit",
    "10. Das Handbuch für eine Erbin / einen Erben",
    "11. Seelengebundene NFTs (ERC-5192) — Ihr Erbnachweis",
    "12. Einstellungen, Info & Hilfe",
    "13. Goldene Regeln",
    "14. Lebenszeichen-Schalter — gewarnt werden vor einer fehlerhaften Erbschaft",
    "15. Wallet-Migration nach der Einrichtung",
  ],
  whats: [
    [
      "Oben rechts auf jeder Seite. Verbinden Sie eine EVM-Wallet (MetaMask, Hardware-Wallet über MetaMask/Trust oder WalletConnect). Die Wallet dient nur Ihrer On-Chain-Lizenz und der Benennung Ihrer Angehörigen — das Verschlüsselungsgeheimnis Ihres Tresors ist eine separate Offline-Ebene und berührt nie eine Wallet.",
      "Bei erneutem Besuch sehen Sie dies evtl. kurz — Ihre vorherige Sitzung wird wiederhergestellt. Kurz warten; Sie müssen sich NICHT neu verbinden.",
    ],
    // §2 (NEW 0.7.0 DE translation) Vault use cases — full per-step DE text.
    [
      "Dies ist die ausführliche Referenz, um Ihren vollständigen Speicherplan durchzudenken, BEVOR Sie mit dem Einrichten beginnen. Die meisten Nutzer haben nicht ein einziges zu schützendes Geheimnis — sie haben einen ganzen Stapel: einen Hardware-Wallet-Seed, eine Liste von Cloud-Zugängen, die ihr Partner zum Gedenken braucht, ein Foto, wo der Schlüssel zum Bankschließfach geklebt ist, einen versiegelten Brief für jedes Kind und die gedruckten 2FA-Wiederherstellungscodes jedes Kontos, das den Rest absichert. Jede Kategorie unten hat einen anderen Versagensfall und sagt Ihnen, welche der vier Tresorarten (Seed / versiegelter Brief / Dokument / Bild) Sie wählen sollten — der Live-Katalog unter diesem Abschnitt lässt Sie direkt in den passenden Assistenten klicken.",
      "WARUM Sie dies wählen: Für einen verlorenen BIP-39-Seed oder einen verlorenen Börsen-Wiederherstellungscode gibt es keine Hotline. Eine einzige 12-Wort-Phrase sichert oft mehr Vermögen als das Haus eines durchschnittlichen Nachlasses. VERHINDERTER VERSAGENSFALL: Der Erbe von Rechts wegen starrt auf einen Ledger, den er nicht entsperren kann, ein Börsenkonto, das nach Inaktivität automatisch archiviert wird, einen Passwortmanager, dessen Hauptschlüssel nur Sie kannten — und die Werte bleiben für immer eingefroren. Empfohlene Tresorart: Seed (hochentropische kurze Zeichenketten, exakt für BIP-39-große Inhalte ausgelegt).",
      "WARUM Sie dies wählen: Apple ID, Google, primäre E-Mail und die sozialen Plattformen haben jeweils eine andere Richtlinie für verstorbene Nutzer — und die meisten dieser Fristen laufen 6-12 Monate nach dem Tod ab. Erben, die in diesem Fenster nicht über die Zugangsdaten verfügen, können das Profil nicht zum Gedenken einrichten, die Fotos nicht retten oder die Abos nicht kündigen, die den Nachlass weiter belasten. VERHINDERTER VERSAGENSFALL: Ein Leben voller Fotos wird hinter einer vergessenen Apple ID unzugänglich; eine Domain läuft ab und wird der Familie weggekauft; Netflix und Adobe zehren still jahrelang am Nachlass. Empfohlene Tresorart: Brief (Freitext — eine Zugangsdaten-Liste passt natürlich hinein).",
      "WARUM Sie dies wählen: Ein tausend Worte langer Brief kann Ihrem Partner nicht so klar sagen, in welcher Schublade die Hardware-Wallet liegt, wie ein beschriftetes Foto. Bankschließfächer, Haustresore, vergrabenes Bargeld, Ersatzschlüssel, der Anwalt mit dem Original-Testament — das sind ORTE, und Orte wollen Bilder. VERHINDERTER VERSAGENSFALL: Erben können nicht finden, von dessen Existenz sie nichts wissen. Bankschließfächer werden aufgebohrt und der Inhalt vom Staat nach Fundsachen-Gesetzen versteigert. Vergrabenes Bargeld bleibt vergraben. Ersatzschlüssel helfen niemandem, wenn ihr Ort mit Ihnen gestorben ist. Empfohlene Tresorart: Bild (die Pipeline verschlüsselt das JPEG/PNG byteweise — Bildunterschriften kommen in den Dateinamen oder in einen gekoppelten Brief-Tresor).",
      "WARUM Sie dies wählen: Die Nachlassabwicklung stockt ohne die Originale. «Es ist beim Anwalt» ist nicht dasselbe wie «hier ist das unterschriebene PDF». Versicherungspolicen bleiben ungeltend gemacht, wenn der Erbe von ihnen nicht weiß; Steuer-Strafzuschläge fallen an, wenn der Nachlass die letzte Erklärung verpasst; ein Unternehmen mit einem verstorbenen Alleingründer und keiner auffindbaren Beteiligungstabelle wird binnen Monaten wertlos. VERHINDERTER VERSAGENSFALL: Monatelange Nachlassarbeit auf der Suche nach Unterlagen, die einen Klick entfernt hätten sein sollen, während Fristen verstreichen, die Vermögen in Verluste verwandeln. Empfohlene Tresorart: Dokument (verarbeitet PDFs, Scans und mehrseitige Rechtsdateien in einem versiegelten Inhalt).",
      "WARUM Sie dies wählen: Die Dinge, die Sie sagen wollten und die nur Sie hätten sagen können, sind genau das, wovon sich trauernde Familien ohne andere Anleitung abwenden. Bestattungsentscheidungen werden unter Druck getroffen. Haustiere kommen zu dem, der zuerst zugreift. Ethische Vermächtnisse — die Werte und Geschichten, die Sie weitertragen wollten — werden nie geschrieben. VERHINDERTER VERSAGENSFALL: Eine 08/15-Bestattung, die niemand wollte, Streit um Haustiere und Besitz und eine nächste Generation, die nie erfährt, was Sie ihr mitgeben wollten. Erst nach dem Totmann-Auslöser freigegeben — der Erbe liest ihn im Moment, der zählt. Empfohlene Tresorart: Brief (Freitext, mehrere Empfänger, keine praktisch relevante Längenbegrenzung).",
      "WARUM Sie dies wählen: Wiederherstellungscodes sind als einzige Notluke gedacht, wenn alles andere versagt — ein verlorenes Telefon, eine defekte Festplatte, ein gesperrter Laptop mit aktiviertem FileVault. Verlieren Sie sie, ist das Konto weg, und kein Support-Prozess kann sie wiederherstellen. Sie sind genau die hochentropische kurze Zeichenkette, für die ein Seed-Tresor gebaut wurde. VERHINDERTER VERSAGENSFALL: Ein brandneues Telefon, das die 2FA in die E-Mail nicht passieren kann, die jede andere Rücksetzung absichert, ein BitLocker-verschlüsseltes Laufwerk, das niemand entsperren kann, GPG-verschlüsselte Backups, deren Schlüssel verloren sind — und der Erbe ist vom digitalen Nachlass ausgesperrt, obwohl er die Hardware physisch besitzt. Empfohlene Tresorart: Seed (kurze, dichte, hochentropische Zeichenketten — genau die Form, für die diese Tresorart abgestimmt wurde).",
      "Alles zusammen: Die meisten eingerichteten Nutzer enden mit 3-5 Tresoren, nicht mit 1 — typischerweise ein Seed-Tresor für Krypto, ein Brief-Tresor für die Kombination aus Zugangsdaten und letzten Wünschen, ein Bild-Tresor für die Fotos von Bankschließfach / Haustresor und ein Dokument-Tresor für die unterschriebenen PDF-Nachlassunterlagen. Der Totmannschalter gilt pro WALLET (nicht pro Tresor), sodass ein einziges Lebenszeichen alle abdeckt. Kostenseitig ist jeder Tresor eine eigene Einrichtung, sie teilen sich aber die Infrastruktur — siehe /pricing für das aktuelle Stufenmodell.",
    ],
    ["Wählen Sie eine Karte: Krypto-Seed-Phrase, versiegelter Brief, Dokument oder Bild. Alle vier durchlaufen dieselbe sichere Pipeline — nur die Eingabe unterscheidet sich."],
    [
      "Lesen Sie die kurze Einführung und starten Sie. Oben zeigt eine Reihe von Schrittnamen stets, wo Sie sich befinden.",
      "Schalten Sie WLAN, mobile Daten und Bluetooth aus und klicken Sie dann hier. Aufteilen und Verschlüsseln erfolgen mit blockiertem Netzwerk — nichts über Ihr Geheimnis kann das Gerät verlassen.",
      "Geben Sie Ihre 12- oder 24-Wort-Phrase ein/fügen Sie sie ein (oder schreiben/laden Sie Brief/Dokument/Bild). Nur zum Testen? Nutzen Sie den Link «fill a throwaway test seed» — er erzeugt eine gültige Phrase, die nichts kontrolliert, zum gefahrlosen Üben.",
      "Wählen Sie die Gesamtzahl der Anteile (N) und wie viele zum Wiederherstellen nötig sind (T). 3-von-5 ist die ausgewogene Voreinstellung.",
      "Daraus wird der Schlüssel abgeleitet. Sie MÜSSEN es sich merken — es ist der EINZIGE Weg, wie Sie (und Ihre Angehörigen) den Tresor je wiederherstellen. Halten Sie das Augensymbol gedrückt, um die Eingabe zu prüfen. Es wird nie vorausgefüllt und nie gespeichert.",
      "Optional ein Köder-Tresor mit anderem Passwort. Wird man gezwungen zu öffnen, geben Sie das Köder-Passwort — man sieht ein glaubhaftes Wegwerf-Geheimnis, Ihr echter Tresor bleibt verborgen.",
      "Die App erledigt die Kryptografie lokal. Nichts wird hochgeladen.",
      "Holen Sie die verschlüsselten Dateien aus dem Browser: «Save into a folder…» (Chrome/Edge — direkt in einen gewählten Ordner) oder «Download all files». NoKLock lädt nie in Ihre Cloud — Sie platzieren die Dateien selbst.",
      "Legen Sie JEDEN Anteil in ein ANDERES Cloud-Konto und fügen Sie je eine «anyone with the link»-URL ein. Getrennte Konten sind der Sinn: ein gestohlenes Konto verrät dann nur einen Anteil, Ihr Geheimnis bleibt sicher.",
      "Bevor Sie vertrauen: öffnen Sie Restore in einem anderen Tab und beweisen Sie, dass Ihre Schwelle an Dateien + Ihr Master-Passwort das Geheimnis wirklich zurückholt.",
      "Geben Sie die Wallet-Adresse Ihres Erben ein, um die Erbschafts-Token auf Polygon zu prägen. Auch später über /nok möglich.",
      "Fertig. Ihr Geheimnis ist aufgeteilt, verschlüsselt und offline-sicher.",
    ],
    // §4.5 (EN index 4) — Simple route vs maximum security (NEW DE translation).
    [
      "NoKLock unterstützt eine große Spanne zwischen «besser als ein Notizzettel in der Schublade» und «übersteht jedes realistische Verlust-Szenario». Beide Wege nutzen DIESELBE kryptografische Pipeline — nur WO die verschlüsselten Anteilsdateien landen, unterscheidet sich. Sie können einfach beginnen und später ohne Neu-Einrichtung auf maximale Sicherheit umsteigen: Die Anteilsdateien sind portabel, Master-Passwort und Schwellenwert bleiben gleich, Sie verschieben (oder kopieren) die Dateien nur an mehr Orte.",
      "Die Basis. Lassen Sie beim Schritt «Store share locations» jede URL leer und legen Sie einfach JE eine Anteilsdatei in DREI Ordner, die Sie ohnehin täglich nutzen: einen auf dem Laptop, einen auf dem Telefon und einen auf einem USB-Stick in einer Schublade. Das war's. Kein Cloud-Konto, kein IPFS, kein Arweave, keine zusätzliche Anmeldung. Erst wenn Laptop UND Telefon UND USB-Stick gleichzeitig verloren gehen, ist Ihr Geheimnis weg — und selbst dann ist das Master-Passwort noch in Ihrem Kopf, und jede einzelne überlebende Kopie plus K-1 weitere stellen den Tresor wieder her. Das schlägt einen geschriebenen Notizzettel bereits in jeder Hinsicht: Die Anteile sind AEAD-versiegelt (ein Dieb sieht Chiffretext, keinen Seed), sie sind räumlich verteilt, und Totmannschalter / NoK-Ablauf funktionieren genauso.",
      "Die Decke. Fügen Sie beim selben Schritt «Store share locations» für jeden Anteil eine echte URL ein: ein Dropbox-Konto, ein Google Drive unter einer anderen Google-Identität, ein OneDrive auf einer dritten E-Mail, ein IPFS-Pin, ein Arweave-Upload, eine externe SSD in einer feuerfesten Box, ein USB-Stick im Bankschließfach. Jeder Anteil in ein SEPARATES Konto / einen separaten Anbieter / einen separaten physischen Ort. Jetzt erfordert der Verlust Ihres Geheimnisses das gleichzeitige Versagen mehrerer unabhängiger Cloud-Anbieter UND den Verlust Ihrer physischen Laufwerke UND den Verlust jeder lokal zwischengespeicherten Kopie. Das ist die Konfiguration für sechsstellige Krypto-Bestände, größere Nachlässe oder Geschäftskontinuität eines Einzelgründer-Unternehmens.",
      "Welchen Weg wählen: Wenn Sie NoKLock noch nie verwendet haben, starten Sie HEUTE mit dem einfachen Weg und steigen Sie später auf. Die Einrichtung auf dem einfachen Weg dauert etwa fünf Minuten, sobald die PWA installiert ist — und ab diesem Moment ist Ihr Geheimnis sicherer als noch vor einer Stunde. Der maximale-Sicherheits-Weg fügt weitere 20-40 Minuten hinzu, um sich bei den separaten Konten anzumelden und jeden Anteil hochzuladen — bei wertvollen Geheimnissen absolut lohnenswert, aber «mache ich nächstes Wochenende» ist genau, wie Seeds jahrelang auf einem Notizzettel landen.",
    ],
    // §5 (EN index 5) — How saving works.
    [
      "Nur Chrome/Edge: Sie wählen einen Ordner auf Ihrem Computer; alle Dateien werden direkt hineingeschrieben. Ist es Ihr Dropbox/OneDrive/Drive-Synchronisationsordner, lädt die Cloud-App sie hoch. NoKLock spricht nie selbst mit Ihrer Cloud.",
      "Jeder Browser: Die Dateien werden normal heruntergeladen und Sie laden sie selbst hoch, wohin Sie wollen.",
      "Open-Source-Kommandozeilen-Tool, das heute automatisch zu Dropbox hochlädt (Google Drive + OneDrive folgen). Es läuft auf IHREM Computer mit IHREM Token — NoKLock sieht das Token nie. Gleiche Vertrauensbasis wie manuell, viel schneller bei 3+ Anteilen. Installation + Doku: github.com/dksteeves/noklock/tree/main/tools/noklock-cli",
    ],
    [
      "Öffnen Sie Ihre Cloud-Ordner, laden Sie die Dateien herunter, ziehen Sie sie hinein (oder klicken zum Auswählen). Oder fügen Sie einen direkten Download-Link eines Anteils ein und «Fetch» — einzeln. Es gibt keinen «einen Ordner-Link».",
      "Geben Sie das bei der Einrichtung gesetzte Master-Passwort ein. Die Rekonstruktion läuft komplett im Browser — Ihr Geheimnis verlässt ihn nie. Danach Seite neu laden, um es aus dem Speicher zu löschen.",
    ],
    [
      "/nok — fügen Sie jeden Erben per WALLET (er hat bereits eine) oder per E-MAIL (Hybrid-E — er hat keine) hinzu. Jede Benennung prägt ein einziges seelengebundenes Aktivierungs-NFT (ERC-5192) auf Polygon — ein Erbe, ein Token. Bei mehreren Erben kann ein M-von-N-Quorum (z. B. 2-von-3) verlangt werden, bevor das Erbe freigegeben wird — das fügt pro Erben ein Abstimmungs-NFT hinzu (Premium, ab v0.6 — vor v0.6 angelegte Tresore bleiben vom Eigentümer wiederherstellbar; Neu-Einrichtung erforderlich zum Upgrade; siehe /pricing für aktuellen Status).",
      "/heartbeat — melden Sie sich regelmäßig (kostenlos off-chain oder vertrauensfrei on-chain). Jede Meldung setzt Ihren Schonfrist-Timer zurück. Eine Meldung deckt ALLE Ihre Tresore auf dieser Wallet ab.",
      "/heartbeat, Einstellungen oder Dashboard → «Nie ein Lebenszeichen vergessen»: fügen Sie eine wiederkehrende Erinnerung zu Ihrem EIGENEN Kalender hinzu — .ics-Download (Apple Calendar / Outlook / jede App) oder Ein-Klick Google Calendar. Zero-PII: NoKLock nimmt keine E-Mail und sendet nichts.",
      "/dead-man — ZWEI Modi. Sichere Simulation (Standard) zeigt mit Ihren echten Zeiten, was passieren würde, ohne On-Chain-Tx. Echter Testfeuer auslösen feuert Ihren tatsächlichen On-Chain-Schalter (Tipp-Bestätigung erforderlich). Ehrlich: einmal ausgelöst, ERBEN Ihre Angehörigen.",
    ],
    // §7.5 (EN index 8) — Owner cancel-window on activation (NEW DE translation).
    [
      `Falls Ihr Totmannschalter je auslöst (Chainlink bestätigt, dass die Schonfrist abgelaufen ist, und prägt einem Erben eine Aktivierungs-SBT), wird die Off-Chain-Erben-Benachrichtigungs-E-Mail ${OWNER_CANCEL_WINDOW_HOURS} Stunden ZURÜCKGEHALTEN, BEVOR sie hinausgeht. Während dieses Fensters zeigt das Dashboard ein Banner «Ausstehende Aktivierungen — Ihr Stornofenster» mit einem Countdown. Fehlalarm-Aktivierungen (Eigentümer hat aus harmlosem Grund ein Lebenszeichen verpasst — krank, offline, schlicht vergessen) können vom Eigentümer während des Fensters abgebrochen werden, bevor der Erbe benachrichtigt wird.`,
      "Ein Klick erledigt beide Hälften der Bereinigung: (1) Signieren einer Form-B-Bestätigung, die die Erben-E-Mail dauerhaft unterdrückt, dann (2) wird die SBT on-chain via revokeNoK verbrannt (Ihre Wallet löst die Tx aus). Beide Schritte sind nötig, weil Form-B allein die SBT geprägt ließe (ein Erbe, der die Token-ID findet, könnte weiterhin einen direkten On-Chain-Anspruch versuchen) und revokeNoK allein das Token verbrennen würde, aber die E-Mail bereits unterwegs wäre.",
    ],
    // §7 — Social recovery (NEW translation; previous DE had drifted Settings content here)
    [
      "/recovery → Tab «Meine Guardians». 1-9 Wallets (M von N) festlegen, denen Sie vertrauen, Ihre Benennung wiederzuerlangen, falls Sie IHRE Wallet je verlieren. Guardians ≠ NoKs: Guardians helfen IHNEN, während Sie noch leben; NoKs erben nach der Schonfrist.",
      "/recovery → Tab «Eine Wallet wiederherstellen». Wenn jemand, für den Sie als Guardian fungieren, seine Wallet verloren hat, initiieren oder stimmen Sie hier einer Wiederherstellung zu. Zeitverzögert + M-von-N-gesichert; die Original-Wallet behält ein Stornofenster, sodass Guardian-Kollusion nicht still Ihr Konto übernehmen kann.",
      "/recovery → Tab «Meine Wiederherstellung stornieren». Wenn Sie noch die Original-Wallet kontrollieren und jemand eine Wiederherstellung auf Sie initiiert hat, stornieren Sie sie hier innerhalb des Zeitfensters. Das ist die Verteidigung gegen Guardian-Kollusion.",
    ],
    // §8 — Dashboard cockpit (NEW translation)
    [
      "Letztes Lebenszeichen, verbleibende Zeit in der Schonfrist, Ampel-Status (Gesund / Bald fällig / Überfällig). Lebenszeichen-Senden-Button. Eine Meldung deckt ALLE Ihre Tresore auf dieser Wallet ab.",
      "Echte Anzahl der in DIESEM Browser versiegelten Tresore (pro Art: Seed / versiegelter Brief / Dokument / Bild). Erben-Abdeckungszeile: X von Y Tresoren haben einen benannten NoK on-chain.",
      "Ehrliche Hinweise: Lebenszeichen überfällig / Tresor ohne NoK / noch keine Tresore eingerichtet. Kein gefälschter «vierteljährlicher Audit» — das sind die echten Handlungspunkte.",
      "Auslesung Ihrer Einstellungs-Voreinstellungen (Schwelle / Gesamt-Anteile / Schonfrist), damit das Cockpit der eine Ort für den Zustands-Überblick ist.",
    ],
    // §9 — The instruction manual for an heir (NEW translation)
    [
      "/nok-claim/<nonce> — wenn jemand SIE als Angehörige(n) per E-Mail benannt hat und sein Totmannschalter ausgelöst hat, landen Sie hier über die Aktivierungs-E-Mail. Die Seite führt Sie durch das, was geschieht, und durch den Anspruch.",
      "Falls Sie keine Polygon-Wallet haben, installieren Sie MetaMask (oder ähnlich). Das NFT geht an diese Wallet. NoKLock sieht den privaten Schlüssel nie.",
      "Ein Button erledigt alles: NoKLocks Server signiert eine zeitlich begrenzte kryptografische Aussage, dass Sie Erbe für diese E-Mail sind, Ihre Wallet sendet sie an den On-Chain-Escrow, der Escrow verbrennt das Platzhalter-NFT und prägt Ihnen ein frisches seelengebundenes (ERC-5192). Kosten: wenige Cent MATIC-Gas.",
      "Das NFT allein entschlüsselt nichts. Sie brauchen auch: (1) das MASTER-PASSWORT, das die ursprüngliche Person Ihnen vorab geteilt hat (NoKLock hatte es nie), und (2) die ANTEILSDATEIEN oder Anteils-URLs. Öffnen Sie /restore, ziehen die Anteile ein, geben das Passwort ein — der Tresor wird wiederhergestellt.",
    ],
    // §10 — Soulbound NFTs (NEW translation)
    [
      "Eine NoK-Benennung prägt ein einziges seelengebundenes Aktivierungs-NFT auf Polygon — den Totmannschalter-Trigger. Nur M-von-N-Quorum-Tresore fügen pro Erben ein Abstimmungs-NFT hinzu (die Erben-Kooperations-Freigabe — durchgesetzt ab v0.6; vor v0.6 angelegte Tresore bleiben vom Eigentümer wiederherstellbar, Neu-Einrichtung erforderlich zum Upgrade). Sie können eine Benennung jederzeit zurücknehmen (widerrufen). Seelengebunden (ERC-5192) bedeutet nicht übertragbar: das Token kann nach Prägung an eine Wallet nicht verkauft, verschoben, gestohlen oder beschlagnahmt werden.",
      "Das ist eine seltene Verwendung des ERC-5192-Standards (veröffentlicht 2022) in Produktion. NoKLock ist eines der wenigen Systeme, die ihn tatsächlich für das nutzen, wofür der Standard entwickelt wurde — Nachweis von On-Chain-Rechten, die nicht weggehandelt werden können.",
      "Jeder NoKLock-Vertrag ist quell-verifiziert auf PolygonScan; die vollständige Liste mit Adressen lebt auf Info → Contracts. Sie können unabhängig prüfen, dass das SBT-Token Ihnen gehört und nicht von der Erben-Wallet wegtransferiert werden kann.",
    ],
    // §11 — Settings, info & help (MOVED — was previously at index 6)
    [
      "/settings — Voreinstellungen (Schwelle / Gesamt-Anteile / Schonfrist), Sprache und Konto-Hilfe.",
      "/info — Architektur, Anteils-Modell, Sicherheit, Passkeys, Verträge (mit Live-Audit-Haltung für alle 6) und «Why not keyless?».",
      "/help — praktische FAQ und Fehlerbehebung.",
      "/updates — Eigentümer-signierte Roll-by-Roll-Änderungs-Historie. Mit jedem Release beschreiben wir, was ausgeliefert wurde.",
    ],
    // §12 — Golden rules (MOVED — was previously at index 7)
    [
      "Verlieren Sie nie Ihr Master-Passwort. Es ist der einzige kanonische Schlüssel — ein verlorener Passkey oder ein totes Gerät kann es nie ersetzen.",
      "Halten Sie Ihre Anteile über getrennte Konten verteilt UND sorgen Sie dafür, dass Ihre Angehörigen sie erreichen können (Standortliste außerhalb von NoKLock geteilt).",
      "Senden Sie ein Lebenszeichen, wann immer Sie daran denken. Einmal pro Monat oder beim Öffnen der App reicht für die Standard-60-Tage-Schonfrist. Fügen Sie die wiederkehrende Kalender-Erinnerung (Heartbeat / Einstellungen / Dashboard) hinzu — zero-PII, lebt nur in Ihrem eigenen Kalender.",
      "Englisch ist die verbindliche Fassung jedes Bildschirms und Rechtstextes. NoKLock sieht oder berührt Ihre Schlüssel, Anteile oder Daten nie. Die Blockchain ist das letzte Wort über das, was durchgesetzt wird.",
    ],
    // §13 — Live-Man's Switch (NEW translation)
    [
      "In den Einstellungen, unter Tresor-Voreinstellungen. Richten Sie ein, wie NoKLock Sie erreicht OHNE die App zu öffnen, falls eine Guardian-Wiederherstellung gegen Ihre Wallet je gestartet wird, damit Sie sie rechtzeitig stornieren können. Das Gegenstück zum Totmannschalter — das Signal, das SIE erreicht.",
      "Registrieren Sie 1-2 Wallets, die Sie regelmäßig prüfen (NICHT diese) und fügen Sie etwas POL hinzu. Bei einer Wiederherstellung gegen Sie erhält jeder Watcher einen winzigen On-Chain-Ping — die meisten Wallet-Apps zeigen einen eingehenden Transfer — plus eine dauerhafte On-Chain-Aufzeichnung. Sie finanzieren Ihre eigenen Pings, also funktioniert es, auch wenn NoKLock verschwindet, und Pings können nur an Ihre eigenen Wallets gehen.",
      "Sendet jetzt einen Test-Ping, damit Sie bestätigen können, dass der eingehende Transfer in der App Ihrer Watcher-Wallet erscheint. Aktivieren Sie eingehende-Transfer-Benachrichtigungen in dieser Wallet, damit Sie den echten nicht verpassen.",
      "Optional, standardmäßig aus — das Einzige, was jemals Ihr Gerät verlässt. Wenn Sie eine E-Mail hinzufügen, schickt NoKLock Ihnen auch eine, wenn eine Wiederherstellung gegen Ihre Wallet startet: zuverlässige Zustellung, aber abhängig von NoKLocks Server (der Wallet-Ping nicht).",
      "Falls Sie je gewarnt werden und es nicht Sie waren, öffnet dies /recovery, wo Sie die Wiederherstellung von Ihrer Wallet innerhalb des Zeitfensters (1-30 Tage, Standard 7) stornieren. War es ein echter Verlust, tun Sie nichts und die Wiederherstellung wird abgeschlossen.",
    ],
    // §15 (EN index 16) — Wallet migration after enrolment (NEW DE translation).
    [
      "Nach der Migration auf eine neue Wallet verweisen Ihre bestehenden quorum-geschützten Tresore weiterhin auf Ihre ALTE Wallet als Eigentümer-of-Record. Sie müssen entweder (a) jeden Tresor von der neuen Wallet aus neu einrichten ODER (b) die alten Wallet-Schlüssel sicher aufbewahren — sie bleiben der einzige Weg, eine Eigentümer-Selbst-Wiederherstellung für diese Tresore auszulösen.",
    ],
  ],
  // notes are keyed by EN sections[] index. {1} = §2 vault-use-cases catalog
  // callout, {4} = §4.5 simple-vs-max amber callout, {5} = §5 share-spreading
  // callout, {8} = §7.5 cancel-window note.
  notes: {
    1: "Der Live-Katalog unten zeigt jede der sechs Kategorien mit der vollständigen Beispielliste und der Dringlichkeits- / Versagensfall-Begründung. Klicken Sie bei einer beliebigen Zeile auf «Pick this», um direkt in den Einrichtungs-Assistenten für die passende Tresorart zu springen.",
    4: "Wenn Sie zwischen «einfacher Weg jetzt» und «maximale Sicherheit in ein paar Wochen» wählen, nehmen Sie jetzt den einfachen Weg und rüsten Sie später auf. Drei lokale Ordner + Ihr Master-Passwort + der Totmannschalter sind bereits ein funktionierender Erbschaftsplan; die URL-Felder und die Cloud-Konten-Zeremonie lassen sich danach ohne Neu-Einrichtung nachholen.",
    5: "Legen Sie nie alle Anteile in einen Ordner / ein Konto — das hebt den Schutz auf. Ein Anteil pro getrenntem Konto.",
    8: `Die Fensterlänge ist vom Betreiber per Umgebungsvariable OWNER_CANCEL_WINDOW_HOURS konfigurierbar (Standard ${OWNER_CANCEL_WINDOW_HOURS}; gültiger Bereich 0-168, also max. 1 Woche). Sobald der Timer null erreicht, ist das Stornofenster abgelaufen und die Erben-Benachrichtigung wird zur Zustellung eingereiht; ab diesem Punkt ist die einzige verbleibende Gegenmaßnahme der Aufruf von revokeNoK on-chain.`,
  },
});

const FR: Doc = clone(EN, {
  title: "NoKLock — guide d'utilisation pas à pas",
  intro:
    "Ce guide vous accompagne écran par écran. L'application est en anglais (la version juridiquement contraignante) ; chaque étape indique le libellé anglais exact que vous voyez à l'écran, puis explique en français quoi faire.",
  // 0.7.0 — index-drift realignment (see DE note). Empty/passthrough slots at
  // EN index 4 (§4.5) and 8 (§7.5); §4.5 + §7.5 now carry full FR text.
  headings: [
    "1. Connecter votre portefeuille",
    // §2 (0.7.0 FR) Vault use cases — heading + bodies now translated.
    "2. Cas d'usage du coffre — quoi y mettre réellement (et pourquoi)",
    "3. Choisir ce que vous protégez",
    "4. L'assistant d'enregistrement (la barre d'étapes en haut)",
    "4.5. Voie simple vs sécurité maximale — choisissez votre socle",
    "5. Comment l'enregistrement & la répartition des parts fonctionnent vraiment",
    "6. Restaurer votre secret plus tard",
    "7. Proches, signal de vie & interrupteur d'homme mort",
    "7.5. Fenêtre d'annulation du propriétaire à l'activation",
    "8. Récupération sociale — guardians (différents des NoKs)",
    "9. Cockpit du tableau de bord",
    "10. Le manuel pour un héritier",
    "11. NFTs liés à l'âme (ERC-5192) — votre preuve d'héritage",
    "12. Réglages, infos & aide",
    "13. Règles d'or",
    "14. Live-Man's Switch — être prévenu·e avant un héritage erroné",
    "15. Migration de portefeuille après l'enregistrement",
  ],
  whats: [
    [
      "En haut à droite de chaque page. Connectez un portefeuille EVM (MetaMask, un portefeuille matériel via MetaMask/Trust, ou WalletConnect). Le portefeuille ne sert qu'à votre licence on-chain et à désigner vos proches — le secret de chiffrement de votre coffre est une couche hors-ligne distincte qui ne touche jamais un portefeuille.",
      "Lors d'une revisite, ceci peut s'afficher brièvement — votre session précédente est restaurée. Patientez ; vous n'avez PAS à vous reconnecter.",
    ],
    // §2 (NEW 0.7.0 FR translation) Vault use cases — full per-step FR text.
    [
      "Ceci est la référence détaillée pour réfléchir à votre plan de stockage complet AVANT de commencer à enrôler. La plupart des utilisateurs n'ont pas un seul secret à protéger — ils ont une pile : un seed de portefeuille matériel, une liste d'identifiants cloud que leur partenaire devra mémorialiser, une photo de l'endroit où la clé du coffre bancaire est scotchée, une lettre scellée pour chaque enfant, et les codes de récupération 2FA imprimés de chaque compte qui verrouille le reste. Chaque catégorie ci-dessous a un mode de défaillance différent, et chacune vous indique laquelle des quatre sortes de coffre (seed / lettre scellée / document / image) choisir — le catalogue en direct sous cette section vous permet de cliquer directement vers le bon assistant.",
      "POURQUOI vous le choisissez : il n'existe aucune ligne d'assistance pour un seed BIP-39 perdu ou un code de récupération d'échange perdu. Une seule phrase de 12 mots verrouille souvent plus de richesse que la maison d'une succession moyenne. MODE DE DÉFAILLANCE évité : l'héritier en titre fixe un Ledger qu'il ne peut déverrouiller, un compte d'échange qui s'archive automatiquement après inactivité, un gestionnaire de mots de passe dont la clé maître n'était connue que de vous — et les actifs restent gelés pour toujours. Sorte de coffre recommandée : seed (chaînes courtes à haute entropie, conçues exactement pour des charges utiles de taille BIP-39).",
      "POURQUOI vous le choisissez : Apple ID, Google, l'email principal et les plateformes sociales ont chacun une politique différente pour les utilisateurs décédés — et la plupart de ces fenêtres expirent 6-12 mois après le décès. Les héritiers qui n'ont pas les identifiants dans ce délai ne peuvent mémorialiser le profil, récupérer les photos, ni résilier les abonnements qui continuent de facturer la succession. MODE DE DÉFAILLANCE évité : une vie de photos devient inaccessible derrière un Apple ID oublié ; un domaine expire et est racheté au nez de la famille ; Netflix et Adobe vident discrètement la succession pendant des années. Sorte de coffre recommandée : lettre (texte libre — une liste d'identifiants y tient naturellement).",
      "POURQUOI vous le choisissez : une lettre de mille mots ne peut pas dire à votre partenaire dans quel tiroir se trouve le portefeuille matériel aussi clairement qu'une photo annotée. Coffres bancaires, coffres domestiques, argent enterré, clés de rechange, l'avocat qui détient le testament original — ce sont des LIEUX, et les lieux veulent des images. MODE DE DÉFAILLANCE évité : les héritiers ne peuvent trouver ce dont ils ignorent l'existence. Les coffres bancaires sont percés et leur contenu vendu aux enchères par l'État au titre des lois sur les biens non réclamés. L'argent enterré reste enterré. Les clés de rechange n'aident personne si leur emplacement est mort avec vous. Sorte de coffre recommandée : image (le pipeline chiffre le JPEG/PNG octet par octet — les légendes vont dans le nom de fichier ou dans un coffre lettre apparié).",
      "POURQUOI vous le choisissez : la succession s'enlise sans les originaux. « C'est chez l'avocat » n'est pas la même chose que « voici le PDF signé ». Les polices d'assurance restent non réclamées si l'héritier ignore leur existence ; les pénalités de déclaration fiscale s'accumulent quand la succession manque sa déclaration finale ; une entreprise avec un fondateur unique décédé et aucune table de capitalisation trouvable devient sans valeur en quelques mois. MODE DE DÉFAILLANCE évité : des mois de travail d'exécuteur à chercher des papiers qui auraient dû être à un clic, avec des échéances qui passent et transforment des actifs en pertes. Sorte de coffre recommandée : document (gère PDFs, scans et fichiers juridiques multi-pages dans une seule charge utile scellée).",
      "POURQUOI vous le choisissez : les choses que vous vouliez dire, que vous seul·e pouviez dire, sont celles que les familles en deuil évitent par défaut quand elles n'ont aucune autre indication. Les choix funéraires se font sous pression. Les animaux sont confiés au premier venu. Les testaments éthiques — les valeurs et histoires que vous vouliez transmettre — ne s'écrivent jamais. MODE DE DÉFAILLANCE évité : un service générique que personne ne voulait, des disputes sur les animaux et les biens, et une génération suivante qui n'entend jamais ce que vous auriez voulu lui faire savoir. Libéré seulement après le déclencheur d'homme mort — l'héritier le lit au moment qui compte. Sorte de coffre recommandée : lettre (texte libre, multi-destinataires, sans limite de longueur réellement contraignante).",
      "POURQUOI vous le choisissez : les codes de récupération sont conçus pour être la seule issue de secours quand tout le reste échoue — un téléphone perdu, un disque dur corrompu, un portable verrouillé avec FileVault activé. Perdez-les et le compte est perdu, et aucun processus d'assistance ne peut les restaurer. Ils sont exactement le genre de chaîne courte à haute entropie pour laquelle un coffre seed a été conçu. MODE DE DÉFAILLANCE évité : un téléphone tout neuf qui ne peut passer la 2FA vers l'email qui verrouille toute autre réinitialisation, un disque chiffré BitLocker que personne ne peut déverrouiller, des sauvegardes chiffrées GPG dont les clés ont disparu — et l'héritier est exclu de la succession numérique alors même qu'il possède physiquement le matériel. Sorte de coffre recommandée : seed (chaînes courtes, denses, à haute entropie — exactement la forme pour laquelle ce type de coffre a été réglé).",
      "Mettre le tout ensemble : la plupart des utilisateurs enrôlés finissent avec 3-5 coffres, pas 1 — typiquement un coffre seed pour la crypto, un coffre lettre pour la combinaison identifiants-et-dernières-volontés, un coffre image pour les photos du coffre bancaire / coffre domestique, et un coffre document pour les papiers de succession en PDF signé. L'interrupteur d'homme mort est par PORTEFEUILLE (pas par coffre), donc un seul signal de vie les couvre tous. Côté coût, chaque coffre est son propre enrôlement mais ils partagent l'infrastructure — voir /pricing pour le modèle de niveaux actuel.",
    ],
    ["Choisissez une carte : phrase seed crypto, lettre scellée, document ou image. Les quatre suivent le même pipeline sécurisé — seule l'entrée diffère."],
    [
      "Lisez la courte introduction et démarrez. Une rangée de noms d'étapes en haut indique toujours où vous en êtes.",
      "Coupez le Wi-Fi, les données mobiles et le Bluetooth, puis cliquez ici. Le découpage et le chiffrement se font réseau bloqué — rien sur votre secret ne peut quitter l'appareil.",
      "Saisissez/collez votre phrase de 12 ou 24 mots (ou rédigez/téléversez lettre/document/image). Juste un test ? Utilisez le lien « fill a throwaway test seed » — il génère une phrase valide qui ne contrôle rien, pour s'exercer sans risque.",
      "Choisissez le nombre total de parts (N) et combien sont nécessaires pour reconstituer (T). 3-sur-5 est l'équilibre par défaut.",
      "Cela dérive la clé. Vous DEVEZ vous en souvenir — c'est le SEUL moyen pour vous (et vos proches) de récupérer le coffre. Maintenez l'icône œil pour vérifier la saisie. Jamais pré-rempli, jamais enregistré.",
      "Optionnel : un coffre leurre avec un autre mot de passe. Si l'on vous force à ouvrir, donnez le mot de passe leurre — on voit un secret crédible jetable, votre vrai coffre reste caché.",
      "L'application fait la cryptographie en local. Rien n'est téléversé.",
      "Sortez les fichiers chiffrés du navigateur : « Save into a folder… » (Chrome/Edge — directement dans un dossier choisi) ou « Download all files ». NoKLock ne téléverse jamais vers votre cloud — vous placez les fichiers vous-même.",
      "Placez CHAQUE part dans un compte cloud DIFFÉRENT et collez chaque URL « anyone with the link ». Des comptes séparés sont tout l'intérêt : un compte volé ne révèle qu'une part, votre secret reste sûr.",
      "Avant de faire confiance : ouvrez Restore dans un autre onglet et prouvez que votre seuil de fichiers + votre mot de passe maître ramènent vraiment le secret.",
      "Saisissez l'adresse du portefeuille de votre héritier pour créer les jetons d'héritage sur Polygon. Possible aussi plus tard via /nok.",
      "Terminé. Votre secret est découpé, chiffré et à l'abri hors-ligne.",
    ],
    // §4.5 (EN index 4) — Voie simple vs sécurité maximale (NOUVELLE traduction FR).
    [
      "NoKLock couvre un large éventail entre « mieux qu'un post-it dans un tiroir » et « survit à tout scénario de perte réaliste ». Les deux voies utilisent le MÊME pipeline cryptographique — seul l'endroit OÙ aboutissent les fichiers de parts chiffrés diffère. Vous pouvez commencer simple et passer plus tard à la sécurité maximale sans ré-enrôler : les fichiers de parts sont portables, le mot de passe maître et le seuil restent identiques, vous déplacez (ou copiez) simplement les fichiers vers plus d'endroits.",
      "Le socle. À l'étape « Store share locations », laissez chaque URL vide et placez simplement UN fichier de part dans TROIS dossiers que vous utilisez déjà tous les jours : un sur votre ordinateur portable, un sur votre téléphone et un sur une clé USB rangée dans un tiroir. C'est tout. Aucun compte cloud, aucun IPFS, aucun Arweave, aucune inscription supplémentaire. Il faut perdre simultanément l'ordinateur ET le téléphone ET la clé USB pour perdre votre secret — et même alors, le mot de passe maître est toujours dans votre tête, et toute copie survivante plus K-1 autres reconstruisent le coffre. Cela dépasse déjà un post-it écrit sur tous les plans qui comptent : les parts sont scellées par AEAD (un voleur voit du chiffré, pas un seed), elles sont géographiquement réparties, et l'interrupteur d'homme mort / le flux NoK fonctionnent de la même manière.",
      "Le plafond. À cette même étape « Store share locations », collez une vraie URL pour chaque part : un compte Dropbox, un Google Drive sous une autre identité Google, un OneDrive sur un troisième email, un pin IPFS, un téléversement permanent Arweave, un SSD externe dans une boîte ignifuge, une clé USB au coffre-fort bancaire. Chaque part vers un compte / fournisseur / lieu physique SÉPARÉ. Désormais, perdre votre secret exige la défaillance simultanée de plusieurs fournisseurs cloud indépendants ET la perte de vos disques physiques ET la perte de chaque copie mise en cache localement. C'est la configuration pour protéger de la crypto à six chiffres, des successions importantes, ou la continuité d'une entreprise à fondateur unique.",
      "Laquelle choisir : si vous n'avez jamais utilisé NoKLock, commencez AUJOURD'HUI par la voie simple et évoluez plus tard. L'enregistrement par la voie simple prend environ cinq minutes une fois la PWA installée, et dès cet instant votre secret est plus sûr qu'il y a une heure. La voie sécurité maximale ajoute 20-40 minutes pour s'inscrire aux comptes séparés et téléverser chaque part — totalement justifié pour des secrets de grande valeur, mais « je m'en occuperai le week-end prochain » est exactement comment des seeds finissent des années sur un post-it.",
    ],
    // §5 (EN index 5) — Comment l'enregistrement fonctionne.
    [
      "Chrome/Edge seulement : vous choisissez un dossier sur votre ordinateur ; tous les fichiers y sont écrits directement. Si c'est votre dossier de synchro Dropbox/OneDrive/Drive, l'app cloud les téléverse. NoKLock ne parle jamais lui-même à votre cloud.",
      "Tout navigateur : les fichiers se téléchargent normalement et vous les téléversez vous-même où vous voulez.",
      "Outil en ligne de commande open-source qui téléverse automatiquement vers Dropbox aujourd'hui (Google Drive + OneDrive à venir). Il s'exécute sur VOTRE ordinateur avec VOTRE jeton — NoKLock ne voit jamais le jeton. Même histoire de confiance que le manuel, bien plus rapide pour 3+ parts. Installation + docs : github.com/dksteeves/noklock/tree/main/tools/noklock-cli",
    ],
    [
      "Ouvrez vos dossiers cloud, téléchargez les fichiers, déposez-les (ou cliquez pour choisir). Ou collez le lien de téléchargement direct d'une part et « Fetch » — une à la fois. Il n'y a pas de « lien de dossier unique ».",
      "Saisissez le mot de passe maître défini à l'enregistrement. La reconstruction se fait entièrement dans le navigateur — votre secret n'en sort jamais. Rechargez la page ensuite pour l'effacer de la mémoire.",
    ],
    [
      "/nok — ajoutez chaque héritier par PORTEFEUILLE (il en a déjà un) ou par EMAIL (Hybrid-E — il n'en a pas). Chaque désignation crée un seul NFT d'Activation lié à l'âme (ERC-5192) sur Polygon — un héritier, un jeton. Avec plusieurs héritiers, exigez un quorum M-sur-N (ex. 2-sur-3) avant déblocage — cela ajoute un NFT de Vote par héritier (Premium, à partir de v0.6 — les coffres créés avant v0.6 restent récupérables par le propriétaire ; ré-enrôler pour activer ; voir /pricing pour l'état actuel).",
      "/heartbeat — signalez-vous régulièrement (gratuit hors-chaîne, ou sans confiance on-chain). Chaque signalement réinitialise votre minuteur d'inactivité. Un signal couvre TOUS vos coffres sur ce portefeuille.",
      "/heartbeat, Réglages ou Tableau de bord → « Ne jamais oublier un signal » : ajoutez un rappel récurrent à VOTRE propre calendrier — .ics (Apple Calendar / Outlook / autre) ou lien Google Calendar. Zéro-PII : NoKLock ne prend aucun email et n'envoie rien.",
      "/dead-man — DEUX modes. Simulation sûre (défaut) montre ce qui se passerait avec vos vrais délais, sans tx on-chain. Tir réel déclenche votre véritable interrupteur on-chain (confirmation tapée requise). Honnête : une fois déclenché, vos proches HÉRITENT.",
    ],
    // §7.5 (EN index 8) — Fenêtre d'annulation du propriétaire (NOUVELLE traduction FR).
    [
      `Si votre interrupteur d'homme mort se déclenche un jour (Chainlink confirme l'expiration du délai de grâce + crée une SBT d'Activation pour un héritier), l'email hors-chaîne de notification de l'héritier est retenu pendant ${OWNER_CANCEL_WINDOW_HOURS} h AVANT son envoi. Pendant cette fenêtre, le tableau de bord affiche une bannière « Activations en attente — votre fenêtre d'annulation » avec un compte à rebours. Les activations par faux positif (le propriétaire a manqué un signal pour une raison bénigne — malade, hors réseau, simplement oublié) peuvent être interrompues par le propriétaire pendant la fenêtre, avant que l'héritier ne soit notifié.`,
      "Un clic effectue les deux moitiés du nettoyage : (1) signer une attestation Form B qui supprime définitivement l'email de l'héritier, puis (2) la SBT est brûlée on-chain via revokeNoK (votre portefeuille déclenche la tx). Les deux étapes sont nécessaires car Form B seul laisserait la SBT créée (un héritier qui trouve l'identifiant du jeton pourrait tenter une réclamation on-chain directe) et revokeNoK seul brûlerait le jeton mais l'email serait déjà en route.",
    ],
    // §7 — Social recovery / guardians (NEW)
    [
      "/recovery → onglet « Mes guardians ». Définissez 1-9 portefeuilles (M de N) auxquels vous faites confiance pour vous aider à reprendre votre désignation si vous perdez VOTRE portefeuille. Guardians ≠ NoKs : les guardians VOUS aident pendant que vous êtes en vie.",
      "/recovery → onglet « Récupérer un portefeuille ». Si quelqu'un dont vous êtes guardian a perdu son portefeuille, initiez ou votez ici. Verrouillé dans le temps + M-de-N ; le portefeuille d'origine conserve une fenêtre d'annulation.",
      "/recovery → onglet « Annuler ma récupération ». Si vous contrôlez encore le portefeuille d'origine et que quelqu'un a initié une récupération sur vous, annulez-la ici dans la fenêtre. Défense contre la collusion des guardians.",
    ],
    // §8 — Dashboard cockpit (NEW)
    [
      "Dernier signal de vie, temps restant en grâce, statut feu tricolore (Sain / Bientôt dû / En retard). Bouton envoi-signal. Un signal couvre TOUS vos coffres sur ce portefeuille.",
      "Nombre réel de coffres scellés dans CE navigateur (par type : seed / lettre / document / image). Couverture héritiers : X de Y coffres ont un NoK désigné on-chain.",
      "Rappels honnêtes : signal en retard / coffre sans NoK / aucun coffre. Pas de faux « audit trimestriel » — ce sont les vraies actions.",
      "Lecture de vos préférences de Réglages (seuil / parts totales / délai de grâce) pour que le cockpit soit l'unique endroit d'aperçu d'état.",
    ],
    // §9 — Instruction manual for an heir (NEW)
    [
      "/nok-claim/<nonce> — si quelqu'un VOUS a désigné·e comme proche par email et que son interrupteur d'homme mort s'est déclenché, vous arrivez ici depuis l'email d'activation. La page vous guide à travers ce qui se passe et la réclamation.",
      "Si vous n'avez pas de portefeuille Polygon, installez MetaMask (ou similaire). Le NFT va à ce portefeuille. NoKLock ne voit jamais la clé privée.",
      "Un bouton fait tout : le serveur NoKLock signe une déclaration cryptographique limitée dans le temps prouvant que vous êtes l'héritier·ère pour cet email, votre portefeuille l'envoie à l'escrow on-chain, l'escrow brûle le NFT placeholder et vous en émet un frais lié à l'âme (ERC-5192). Coût : quelques centimes de gas MATIC.",
      "Le NFT seul ne déchiffre rien. Vous avez aussi besoin de : (1) le MOT DE PASSE MAÎTRE que la personne d'origine vous a partagé à l'avance (NoKLock ne l'a jamais eu), et (2) les FICHIERS DE PARTS ou URLs. Ouvrez /restore, déposez les parts, tapez le mot de passe — le coffre se reconstruit.",
    ],
    // §10 — Soulbound NFTs (NEW)
    [
      "Une désignation NoK émet un seul NFT d'Activation lié à l'âme sur Polygon — le déclencheur d'homme mort. Seuls les coffres à quorum M-sur-N ajoutent un NFT de Vote par héritier (la libération coopérative des héritiers — appliquée à partir de v0.6 ; les coffres pré-v0.6 restent récupérables par le propriétaire, ré-enrôler pour activer). Vous pouvez reprendre une désignation à tout moment (révoquer). Lié à l'âme (ERC-5192) = non-transférable : le jeton ne peut être vendu, déplacé, volé ou saisi une fois émis vers un portefeuille.",
      "C'est un usage rare en production du standard ERC-5192 (publié 2022). NoKLock est l'un des rares systèmes à l'utiliser réellement pour ce pour quoi le standard a été conçu — prouver des droits on-chain qui ne peuvent être échangés.",
      "Chaque contrat NoKLock est source-vérifié sur PolygonScan ; la liste complète avec adresses est sur Info → Contracts. Vous pouvez vérifier indépendamment que le jeton SBT vous appartient et ne peut être transféré du portefeuille de l'héritier.",
    ],
    // §11 — Settings, info & help (MOVED — was at index 6)
    [
      "/settings — réglages par défaut (seuil / parts totales / délai de grâce), langue et aide au compte.",
      "/info — architecture, modèle de parts, sécurité, passkeys, contrats (avec posture d'audit live pour les 6) et « Why not keyless? ».",
      "/help — FAQ pratique et dépannage.",
      "/updates — historique des changements rouleau-par-rouleau signé par le propriétaire. Chaque release nous décrivons ce qui a été livré.",
    ],
    // §12 — Golden rules (MOVED — was at index 7)
    [
      "Ne perdez jamais votre mot de passe maître. C'est l'unique clé canonique — un passkey perdu ou un appareil mort ne peut jamais le remplacer.",
      "Gardez vos parts réparties sur des comptes séparés ET assurez-vous que vos proches peuvent y accéder (liste d'emplacements partagée hors NoKLock).",
      "Envoyez un signal quand vous y pensez. Une fois par mois ou à l'ouverture de l'app suffit pour la grâce de 60 jours par défaut. Ajoutez le rappel calendrier récurrent — zéro-PII, ne vit que dans votre propre calendrier.",
      "L'anglais est la version contraignante de chaque écran et texte légal. NoKLock ne voit ni ne touche jamais vos clés, parts ou données. La blockchain est le dernier mot sur ce qui est appliqué.",
    ],
    // §13 — Live-Man's Switch (NEW)
    [
      "Dans Réglages, sous Préférences de coffre. Configurez comment NoKLock vous joint SANS ouvrir l'app si une récupération guardian est jamais lancée contre votre portefeuille, pour que vous puissiez l'annuler à temps. Le contrepoint de l'interrupteur d'homme mort — le signal qui VOUS atteint.",
      "Enregistrez 1-2 portefeuilles que vous surveillez régulièrement (PAS celui-ci) et ajoutez un peu de POL. Si une récupération démarre contre vous, chaque watcher reçoit un petit ping on-chain — la plupart des apps portefeuille montrent un transfert entrant — plus un enregistrement on-chain permanent. Vous financez vos propres pings, donc ça marche même si NoKLock disparaît.",
      "Envoie un ping test maintenant pour confirmer que le transfert entrant apparaît dans l'app de votre portefeuille watcher. Activez les notifications de transfert entrant dans ce portefeuille pour ne pas manquer le vrai.",
      "Optionnel, désactivé par défaut — la seule chose qui quitte jamais votre appareil. Si vous ajoutez un email, NoKLock vous écrit aussi quand une récupération démarre contre votre portefeuille : livraison fiable, mais dépend du serveur NoKLock (le ping portefeuille non).",
      "Si vous êtes prévenu·e et ce n'était pas vous, ceci ouvre /recovery où vous annulez la récupération depuis votre portefeuille dans la fenêtre (1-30 jours, défaut 7). Si c'était une vraie perte, ne faites rien et la récupération s'achève.",
    ],
    // §15 (EN index 16) — Migration de portefeuille (NOUVELLE traduction FR).
    [
      "Après une migration vers un nouveau portefeuille, vos coffres protégés par quorum existants référencent toujours votre ANCIEN portefeuille comme propriétaire de référence. Vous devez soit (a) ré-enrôler chaque coffre depuis le nouveau portefeuille, SOIT (b) conserver en sécurité les clés de l'ancien portefeuille — elles restent le seul moyen d'émettre une auto-restauration du propriétaire pour ces coffres.",
    ],
  ],
  // notes keyed by EN sections[] index: {1} §2 vault-use-cases catalog, {4}
  // §4.5, {5} §5, {8} §7.5.
  notes: {
    1: "Le catalogue en direct ci-dessous montre chacune des six catégories avec la liste d'exemples complète et le raisonnement urgence / mode de défaillance. Cliquez sur « Pick this » sur n'importe quelle ligne pour sauter directement dans l'assistant d'enrôlement de la sorte de coffre correspondante.",
    4: "Si vous hésitez entre « voie simple maintenant » et « sécurité maximale dans quelques semaines », prenez la voie simple maintenant et améliorez plus tard. Trois dossiers locaux + votre mot de passe maître + l'interrupteur d'homme mort constituent déjà un plan d'héritage fonctionnel ; les champs d'URL et la cérémonie des comptes cloud peuvent être remplis ensuite sans ré-enrôler.",
    5: "Ne mettez jamais toutes les parts dans un seul dossier / compte — cela supprime la protection. Une part par compte séparé.",
    8: `La durée de la fenêtre est configurable par l'opérateur via la variable d'environnement OWNER_CANCEL_WINDOW_HOURS (par défaut ${OWNER_CANCEL_WINDOW_HOURS} ; plage valide 0-168, soit 1 semaine max). Une fois le minuteur à zéro, la fenêtre d'annulation est écoulée et la notification de l'héritier est mise en file d'attente ; à partir de là, la seule mitigation restante est d'appeler revokeNoK on-chain.`,
  },
});

const PT: Doc = clone(EN, {
  title: "NoKLock — guia de utilização passo a passo",
  intro:
    "Este guia acompanha-o ecrã a ecrã. A aplicação está em inglês (a versão juridicamente vinculativa); cada passo indica o rótulo inglês exato que vê no ecrã e depois explica em português o que fazer.",
  // 0.7.0 — index-drift realignment (see DE note). Empty/passthrough slots at
  // EN index 4 (§4.5) and 8 (§7.5); §4.5 + §7.5 now carry full PT text.
  headings: [
    "1. Ligar a sua carteira",
    // §2 (0.7.0 PT) Vault use cases — heading + bodies now translated.
    "2. Casos de uso do cofre — o que colocar de facto (e porquê)",
    "3. Escolher o que proteger",
    "4. O assistente de registo (a barra de passos no topo)",
    "4.5. Via simples vs segurança máxima — escolha a sua base",
    "5. Como guardar & distribuir as partes funciona realmente",
    "6. Restaurar o seu segredo mais tarde",
    "7. Familiares, sinal de vida & interruptor de homem morto",
    "7.5. Janela de cancelamento do proprietário na ativação",
    "8. Recuperação social — guardians (diferentes dos NoKs)",
    "9. Cockpit do painel",
    "10. O manual para um herdeiro",
    "11. NFTs vinculados à alma (ERC-5192) — a sua prova de herança",
    "12. Definições, informação & ajuda",
    "13. Regras de ouro",
    "14. Live-Man's Switch — ser alertado/a antes de uma herança errada",
    "15. Migração de carteira após o registo",
  ],
  whats: [
    [
      "Canto superior direito de cada página. Ligue uma carteira EVM (MetaMask, carteira de hardware via MetaMask/Trust, ou WalletConnect). A carteira só serve para a sua licença on-chain e para nomear os seus familiares — o segredo de cifragem do seu cofre é uma camada offline separada que nunca toca numa carteira.",
      "Em revisitas pode ver isto brevemente — a sua sessão anterior está a ser restaurada. Aguarde; NÃO precisa de voltar a ligar.",
    ],
    // §2 (NEW 0.7.0 PT translation) Vault use cases — full per-step PT text.
    [
      "Esta é a referência detalhada para pensar todo o seu plano de armazenamento ANTES de começar a inscrever. A maioria dos utilizadores não tem um único segredo a proteger — tem uma pilha: uma seed de carteira de hardware, uma lista de credenciais cloud que o parceiro vai precisar de memorializar, uma fotografia de onde está colada a chave do cofre bancário, uma carta selada para cada filho e os códigos de recuperação 2FA impressos de cada conta que protege o resto. Cada categoria abaixo tem um modo de falha diferente e cada uma diz-lhe qual das quatro espécies de cofre (seed / carta selada / documento / imagem) deve escolher — o catálogo em direto sob esta secção deixa-o clicar diretamente para o assistente certo.",
      "PORQUÊ escolher isto: não há linha de apoio para uma seed BIP-39 perdida ou um código de recuperação de exchange perdido. Uma única frase de 12 palavras protege muitas vezes mais riqueza do que a casa de uma herança média. MODO DE FALHA evitado: o herdeiro de direito fica a olhar para um Ledger que não consegue desbloquear, uma conta de exchange que se auto-arquiva após inatividade, um gestor de palavras-passe cuja chave mestra só você conhecia — e os ativos ficam congelados para sempre. Espécie de cofre recomendada: seed (cadeias curtas de alta entropia, concebidas exatamente para cargas do tamanho BIP-39).",
      "PORQUÊ escolher isto: Apple ID, Google, email principal e as plataformas sociais têm cada uma uma política diferente para utilizadores falecidos — e a maioria dessas janelas expira 6-12 meses após a morte. Herdeiros que não tenham as credenciais nessa janela não conseguem memorializar o perfil, recuperar as fotos, nem cancelar as subscrições que continuam a debitar a herança. MODO DE FALHA evitado: uma vida de fotos torna-se inacessível por trás de um Apple ID esquecido; um domínio expira e é comprado debaixo do nariz da família; Netflix e Adobe drenam silenciosamente a herança durante anos. Espécie de cofre recomendada: carta (texto livre — uma lista de credenciais cabe naturalmente).",
      "PORQUÊ escolher isto: uma carta de mil palavras não consegue dizer ao seu parceiro em que gaveta está a carteira de hardware tão claramente como uma fotografia anotada. Cofres bancários, cofres domésticos, dinheiro enterrado, chaves suplentes, o advogado que guarda o testamento original — são LOCAIS, e os locais querem imagens. MODO DE FALHA evitado: os herdeiros não conseguem encontrar o que não sabem que existe. Cofres bancários são furados e o conteúdo leiloado pelo Estado ao abrigo das leis de bens não reclamados. O dinheiro enterrado fica enterrado. As chaves suplentes não ajudam ninguém se a sua localização morreu consigo. Espécie de cofre recomendada: imagem (a pipeline cifra o JPEG/PNG byte a byte — as legendas vão no nome do ficheiro ou num cofre carta emparelhado).",
      "PORQUÊ escolher isto: o inventário paralisa sem os originais. «Está no advogado» não é o mesmo que «aqui está o PDF assinado». Apólices de seguro ficam por reclamar se o herdeiro não souber que existem; penalizações fiscais acumulam-se quando a herança falha a declaração final; um negócio com um fundador único falecido e nenhuma tabela de capitalização localizável fica sem valor em meses. MODO DE FALHA evitado: meses de trabalho de cabeça-de-casal à procura de papelada que devia estar a um clique, com prazos a passar que transformam ativos em perdas. Espécie de cofre recomendada: documento (lida com PDFs, digitalizações e ficheiros legais de várias páginas numa só carga selada).",
      "PORQUÊ escolher isto: as coisas que queria dizer, que só você poderia ter dito, são aquelas de que as famílias em luto se afastam por defeito quando não têm outra orientação. As escolhas fúnebres são feitas sob pressão. Os animais são entregues a quem se oferece primeiro. Os testamentos éticos — os valores e histórias que queria transmitir — nunca chegam a ser escritos. MODO DE FALHA evitado: um serviço genérico que ninguém quis, brigas por animais e bens, e uma geração seguinte que nunca ouve o que você teria querido que soubessem. Libertado só após o gatilho de homem morto — o herdeiro lê-a no momento que importa. Espécie de cofre recomendada: carta (texto livre, vários destinatários, sem limite de comprimento que importe na prática).",
      "PORQUÊ escolher isto: os códigos de recuperação são concebidos para ser a única saída de emergência quando tudo o resto falha — um telefone perdido, um disco corrompido, um portátil bloqueado com FileVault ativado. Perca-os e a conta desaparece, e nenhum processo de apoio os pode restaurar. São exatamente o tipo de cadeia curta de alta entropia para que um cofre seed foi construído. MODO DE FALHA evitado: um telefone novo em folha que não consegue passar a 2FA para o email que protege todas as outras reposições, um disco cifrado com BitLocker que ninguém consegue desbloquear, backups cifrados com GPG cujas chaves desapareceram — e o herdeiro fica trancado fora da herança digital mesmo tendo a posse física do hardware. Espécie de cofre recomendada: seed (cadeias curtas, densas, de alta entropia — exatamente a forma para que este tipo de cofre foi afinado).",
      "Juntando tudo: a maioria dos utilizadores inscritos acaba com 3-5 cofres, não 1 — tipicamente um cofre seed para cripto, um cofre carta para a combinação de credenciais-e-últimos-desejos, um cofre imagem para as fotos do cofre bancário / cofre doméstico e um cofre documento para a papelada de herança em PDF assinado. O interruptor de homem morto é por CARTEIRA (não por cofre), por isso um único sinal de vida cobre todos. Em termos de custo, cada cofre é a sua própria inscrição mas partilham infraestrutura — ver /pricing para o modelo de níveis atual.",
    ],
    ["Escolha um cartão: frase-semente cripto, carta selada, documento ou imagem. Os quatro seguem o mesmo pipeline seguro — só a entrada difere."],
    [
      "Leia a breve introdução e comece. Uma fila de nomes de passos no topo mostra sempre onde está.",
      "Desligue Wi-Fi, dados móveis e Bluetooth e depois clique aqui. A divisão e a cifragem decorrem com a rede bloqueada — nada sobre o seu segredo pode sair do dispositivo.",
      "Escreva/cole a sua frase de 12 ou 24 palavras (ou escreva/carregue carta/documento/imagem). Só a testar? Use a ligação « fill a throwaway test seed » — gera uma frase válida que não controla nada, para praticar com segurança.",
      "Escolha o número total de partes (N) e quantas são necessárias para reconstruir (T). 3-de-5 é o equilíbrio padrão.",
      "Isto deriva a chave. TEM de a memorizar — é a ÚNICA forma de você (e os seus familiares) recuperarem o cofre. Mantenha premido o ícone do olho para verificar o que escreveu. Nunca é pré-preenchida nem guardada.",
      "Opcional: um cofre-isco com outra palavra-passe. Se o forçarem a abrir, dá a palavra-passe-isco — veem um segredo descartável credível, o seu cofre real fica oculto.",
      "A aplicação faz a criptografia localmente. Nada é carregado.",
      "Tire os ficheiros cifrados do navegador: « Save into a folder… » (Chrome/Edge — diretamente para uma pasta escolhida) ou « Download all files ». O NoKLock nunca carrega para a sua cloud — coloca os ficheiros você mesmo.",
      "Coloque CADA parte numa conta cloud DIFERENTE e cole cada URL « anyone with the link ». Contas separadas são o objetivo: uma conta roubada revela apenas uma parte, o seu segredo continua seguro.",
      "Antes de confiar: abra o Restore noutro separador e prove que o seu limiar de ficheiros + a sua palavra-passe mestra trazem mesmo o segredo de volta.",
      "Introduza o endereço da carteira do seu herdeiro para cunhar os tokens de herança na Polygon. Também é possível mais tarde em /nok.",
      "Concluído. O seu segredo está dividido, cifrado e seguro offline.",
    ],
    // §4.5 (EN index 4) — Via simples vs segurança máxima (NOVA tradução PT).
    [
      "O NoKLock abrange um amplo espetro entre « melhor do que um post-it numa gaveta » e « sobrevive a qualquer cenário realista de perda ». As duas vias usam o MESMO pipeline criptográfico — só ONDE os ficheiros de partes cifrados acabam é que difere. Pode começar simples e passar mais tarde para a segurança máxima sem reinscrever: os ficheiros de partes são portáteis, a palavra-passe mestra e o limiar mantêm-se iguais, basta mover (ou copiar) os ficheiros para mais sítios.",
      "A base. No passo « Store share locations », deixe cada URL em branco e coloque simplesmente UM ficheiro de parte em TRÊS pastas que já usa todos os dias: uma no portátil, uma no telemóvel e uma numa pen USB guardada numa gaveta. É tudo. Sem conta cloud, sem IPFS, sem Arweave, sem registo adicional. É preciso perder o portátil E o telemóvel E a pen USB ao mesmo tempo para perder o segredo — e mesmo assim a palavra-passe mestra continua na sua cabeça, e qualquer cópia sobrevivente mais K-1 outras reconstroem o cofre. Isto já supera um post-it escrito por todas as medidas que importam: as partes estão seladas com AEAD (um ladrão vê texto cifrado, não uma seed), estão distribuídas geograficamente, e o interruptor de homem morto / fluxo NoK funcionam da mesma forma.",
      "O teto. No mesmo passo « Store share locations », cole um URL real para cada parte: uma conta Dropbox, um Google Drive noutra identidade Google, um OneDrive num terceiro email, um pin IPFS, um carregamento permanente Arweave, um SSD externo numa caixa à prova de fogo, uma pen USB num cofre bancário. Cada parte para uma conta / fornecedor / local físico SEPARADO. Agora perder o segredo exige a falha simultânea de vários fornecedores cloud independentes E a perda dos seus discos físicos E a perda de todas as cópias em cache local. Esta é a configuração para proteger cripto de seis dígitos, heranças de grande dimensão ou continuidade de negócio de uma empresa de fundador único.",
      "Qual escolher: se nunca usou o NoKLock, comece HOJE pela via simples e evolua mais tarde. O registo pela via simples demora cerca de cinco minutos depois de instalar a PWA, e a partir desse momento o seu segredo está mais seguro do que há uma hora. A via de segurança máxima acrescenta mais 20-40 minutos para se registar nas contas separadas e carregar cada parte — perfeitamente válido para segredos de elevado valor, mas « trato disso no próximo fim de semana » é exatamente como as seeds acabam anos num post-it.",
    ],
    // §5 (EN index 5) — Como guardar funciona.
    [
      "Só Chrome/Edge: escolhe uma pasta no seu computador; todos os ficheiros são escritos diretamente lá. Se for a pasta de sincronização Dropbox/OneDrive/Drive, a app da cloud carrega-os. O NoKLock nunca fala com a sua cloud.",
      "Qualquer navegador: os ficheiros descarregam normalmente e você carrega-os onde quiser.",
      "Ferramenta de linha de comandos open-source que hoje carrega automaticamente para o Dropbox (Google Drive + OneDrive a caminho). Corre no SEU computador com o SEU token — o NoKLock nunca vê o token. Mesma história de confiança que o manual, muito mais rápido para 3+ partes. Instalação + docs: github.com/dksteeves/noklock/tree/main/tools/noklock-cli",
    ],
    [
      "Abra as suas pastas cloud, descarregue os ficheiros, arraste-os (ou clique para escolher). Ou cole o link de descarga direta de uma parte e « Fetch » — um de cada vez. Não existe « um link de pasta ».",
      "Introduza a palavra-passe mestra definida no registo. A reconstrução decorre inteiramente no navegador — o seu segredo nunca sai dele. Recarregue a página depois para a apagar da memória.",
    ],
    [
      "/nok — adicione cada herdeiro por CARTEIRA (já tem uma) ou por EMAIL (Hybrid-E — não tem). Cada designação cunha UM NFT de Ativação vinculado à alma (ERC-5192) em Polygon — um herdeiro, um token. Com vários herdeiros pode exigir um quórum M-de-N (ex. 2-de-3) antes do desbloqueio — isso adiciona um NFT de Voto por herdeiro (Premium, a partir da v0.6 — cofres criados antes da v0.6 permanecem restauráveis pelo proprietário; reinscrever para ativar; ver /pricing para o estado atual).",
      "/heartbeat — registe-se periodicamente (grátis off-chain, ou sem confiança on-chain). Cada registo reinicia o seu temporizador. Um sinal cobre TODOS os seus cofres nesta carteira.",
      "/heartbeat, Definições ou Painel → « Nunca esquecer um sinal »: adicione um lembrete recorrente ao SEU próprio calendário — .ics (Apple Calendar / Outlook / qualquer app) ou link Google Calendar. Zero-PII: NoKLock não recebe email e não envia nada.",
      "/dead-man — DOIS modos. Simulação segura (padrão) mostra o que aconteceria com os seus tempos reais, sem tx on-chain. Disparo real ativa o seu interruptor on-chain real (confirmação digitada exigida). Honesto: uma vez disparado, os seus familiares HERDAM.",
    ],
    // §7.5 (EN index 8) — Janela de cancelamento do proprietário (NOVA tradução PT).
    [
      `Se o seu interruptor de homem morto alguma vez disparar (a Chainlink confirma que o período de graça expirou + cunha uma SBT de Ativação a um herdeiro), o email off-chain de notificação do herdeiro é retido durante ${OWNER_CANCEL_WINDOW_HOURS} h ANTES de sair. Durante essa janela, o painel mostra um banner « Ativações pendentes — a sua janela de cancelamento » com uma contagem decrescente. Ativações por falso positivo (o proprietário falhou um sinal por uma razão benigna — doente, sem rede, simplesmente esqueceu-se) podem ser abortadas pelo proprietário durante a janela, antes de o herdeiro ser notificado.`,
      "Um clique faz ambas as metades da limpeza: (1) assinar uma atestação Form B que suprime permanentemente o email do herdeiro, depois (2) a SBT é queimada on-chain via revokeNoK (a sua carteira despoleta a tx). Ambos os passos são necessários porque o Form B sozinho deixaria a SBT cunhada (um herdeiro que encontre o id do token poderia ainda tentar uma reclamação on-chain direta) e o revokeNoK sozinho queimaria o token mas o email já estaria a caminho.",
    ],
    // §7 — Social recovery / guardians (NEW)
    [
      "/recovery → separador « Os meus guardians ». Defina 1-9 carteiras (M de N) em que confia para o/a ajudar a recuperar a sua designação se perder a SUA carteira. Guardians ≠ NoKs: guardians ajudam-no/a enquanto está vivo/a.",
      "/recovery → separador « Recuperar uma carteira ». Se alguém de quem é guardian perdeu a carteira, inicie ou vote aqui. Bloqueado no tempo + M-de-N; a carteira original mantém uma janela de cancelamento.",
      "/recovery → separador « Cancelar a minha recuperação ». Se ainda controla a carteira original e alguém iniciou uma recuperação contra si, cancele-a aqui dentro da janela. Defesa contra a conluio dos guardians.",
    ],
    // §8 — Dashboard cockpit (NEW)
    [
      "Último sinal de vida, tempo restante na graça, semáforo (Saudável / Em breve / Atrasado). Botão enviar-sinal. Um sinal cobre TODOS os seus cofres nesta carteira.",
      "Contagem real de cofres selados NESTE navegador (por tipo: seed / carta / documento / imagem). Cobertura de herdeiros: X de Y cofres têm um NoK designado on-chain.",
      "Avisos honestos: sinal atrasado / cofre sem NoK / sem cofres. Sem falso « auditoria trimestral » — são os itens reais.",
      "Leitura das suas predefinições (limiar / partes totais / período de graça) para que o cockpit seja o único ponto de visão de estado.",
    ],
    // §9 — Instruction manual for an heir (NEW)
    [
      "/nok-claim/<nonce> — se alguém o/a designou como familiar por email e o seu interruptor disparou, aterra aqui via email de ativação. A página acompanha-o/a através do que está a acontecer e da reclamação.",
      "Se não tem carteira Polygon, instale MetaMask (ou similar). O NFT vai para essa carteira. O NoKLock nunca vê a chave privada.",
      "Um botão faz tudo: o servidor NoKLock assina uma declaração criptográfica limitada no tempo provando que é herdeiro/a para este email, a sua carteira envia-a ao escrow on-chain, o escrow queima o NFT placeholder e cunha-lhe um novo vinculado à alma (ERC-5192). Custo: cêntimos de gás MATIC.",
      "O NFT sozinho não desencripta nada. Precisa também: (1) da PALAVRA-PASSE MESTRA que o/a originador/a partilhou consigo antecipadamente (NoKLock nunca a teve), e (2) dos FICHEIROS DE PARTES ou URLs. Abra /restore, largue as partes, escreva a palavra-passe — o cofre reconstrói-se.",
    ],
    // §10 — Soulbound NFTs (NEW)
    [
      "Uma designação NoK cunha UM NFT de Ativação vinculado à alma em Polygon — o disparo de homem morto. Apenas cofres com quórum M-de-N adicionam um NFT de Voto por herdeiro (a libertação cooperativa dos herdeiros — aplicado a partir da v0.6; cofres pré-v0.6 permanecem restauráveis pelo proprietário, reinscrever para ativar). Pode revogar uma designação a qualquer momento. Vinculado à alma (ERC-5192) = não-transferível: o token não pode ser vendido, movido, roubado ou apreendido após ser cunhado numa carteira.",
      "É um uso raro em produção do padrão ERC-5192 (publicado 2022). NoKLock é dos poucos sistemas a usá-lo para o fim para o qual o padrão foi desenhado — provar direitos on-chain que não podem ser negociados.",
      "Cada contrato NoKLock é fonte-verificada em PolygonScan; a lista completa com endereços está em Info → Contracts. Pode verificar independentemente que o token SBT lhe pertence e não pode ser transferido para fora da carteira do herdeiro.",
    ],
    // §11 — Settings, info & help (MOVED — was at index 6)
    [
      "/settings — predefinições (limiar / partes totais / período de graça), idioma e ajuda da conta.",
      "/info — arquitetura, modelo de partes, segurança, passkeys, contratos (com postura de auditoria live para todos os 6) e « Why not keyless? ».",
      "/help — FAQ prático e resolução de problemas.",
      "/updates — histórico de alterações roll-by-roll assinado pelo proprietário. Em cada release descrevemos o que foi entregue.",
    ],
    // §12 — Golden rules (MOVED — was at index 7)
    [
      "Nunca perca a sua palavra-passe mestra. É a única chave canónica — uma passkey perdida ou um dispositivo morto nunca a podem substituir.",
      "Mantenha as suas partes distribuídas por contas separadas E garanta que os seus familiares lhes conseguem aceder (lista de localizações partilhada fora do NoKLock).",
      "Envie um sinal quando se lembrar. Uma vez por mês ou ao abrir a app chega para a graça padrão de 60 dias. Adicione o lembrete recorrente do calendário — zero-PII, vive apenas no seu próprio calendário.",
      "O inglês é a versão vinculativa de cada ecrã e texto legal. O NoKLock nunca vê nem toca nas suas chaves, partes ou dados. A blockchain é a palavra final sobre o que é executado.",
    ],
    // §13 — Live-Man's Switch (NEW)
    [
      "Em Definições, sob Predefinições do cofre. Configure como o NoKLock o/a contacta SEM abrir a app se alguma vez for iniciada uma recuperação guardian contra a sua carteira, para que possa cancelá-la a tempo. Contraponto do interruptor de homem morto — o sinal que CHEGA até si.",
      "Registe 1-2 carteiras que verifica regularmente (NÃO esta) e adicione um pouco de POL. Se uma recuperação iniciar contra si, cada watcher recebe um pequeno ping on-chain — a maioria das apps mostra uma transferência recebida — mais um registo on-chain permanente. Financia os seus próprios pings, portanto funciona mesmo se o NoKLock desaparecer.",
      "Envia um ping de teste agora para confirmar que a transferência recebida aparece na app da sua carteira watcher. Ative notificações de transferências recebidas nessa carteira para não perder a verdadeira.",
      "Opcional, desligado por padrão — a única coisa que alguma vez sai do seu dispositivo. Se adicionar um email, o NoKLock também lhe escreve quando uma recuperação inicia contra a sua carteira: entrega fiável, mas depende do servidor NoKLock (o ping da carteira não).",
      "Se for alertado/a e não foi você, isto abre /recovery onde cancela a recuperação a partir da sua carteira dentro da janela (1-30 dias, padrão 7). Se foi uma perda real, não faça nada e a recuperação completa-se.",
    ],
    // §15 (EN index 16) — Migração de carteira (NOVA tradução PT).
    [
      "Depois de migrar para uma nova carteira, os seus cofres protegidos por quórum existentes continuam a referenciar a sua carteira ANTIGA como proprietário de registo. Tem de (a) reinscrever cada cofre a partir da nova carteira OU (b) manter as chaves da carteira antiga em segurança — continuam a ser a única forma de emitir uma auto-restauração do proprietário para esses cofres.",
    ],
  ],
  // notes keyed by EN sections[] index: {1} §2 vault-use-cases catalog, {4}
  // §4.5, {5} §5, {8} §7.5.
  notes: {
    1: "O catálogo em direto abaixo mostra cada uma das seis categorias com a lista de exemplos completa e o raciocínio de urgência / modo de falha. Clique em « Pick this » em qualquer linha para saltar diretamente para o assistente de inscrição da espécie de cofre correspondente.",
    4: "Se está indeciso entre « via simples agora » e « segurança máxima daqui a umas semanas », escolha a via simples agora e melhore depois. Três pastas locais + a sua palavra-passe mestra + o interruptor de homem morto já são um plano de herança funcional; os campos de URL e a cerimónia das contas cloud podem ser preenchidos depois sem reinscrever.",
    5: "Nunca ponha todas as partes numa só pasta / conta — isso remove a proteção. Uma parte por conta separada.",
    8: `A duração da janela é configurável pelo operador via a variável de ambiente OWNER_CANCEL_WINDOW_HOURS (padrão ${OWNER_CANCEL_WINDOW_HOURS}; intervalo válido 0-168, ou seja, 1 semana no máximo). Quando o temporizador chega a zero, a janela de cancelamento expirou e a notificação do herdeiro é colocada em fila para entrega; a partir daí, a única mitigação restante é chamar revokeNoK on-chain.`,
  },
});

const ZH: Doc = clone(EN, {
  title: "NoKLock — 分步使用指南",
  intro:
    "本指南逐屏引导您。应用本身为英文（具有法律效力的版本）；每一步都给出您在屏幕上看到的确切英文标签，然后用中文说明该做什么。",
  draft: "中文为初版翻译，正由母语者校对中。如有疑义，以英文界面为准。",
  // 0.7.0 — index-drift realignment (see DE note). Empty/passthrough slots at
  // EN index 4 (§4.5) and 8 (§7.5); §4.5 + §7.5 now carry ZH draft text
  // (machine-translation first-pass — covered by the doc.draft amber flag).
  headings: [
    "1. 连接钱包",
    // §2 (0.7.0 ZH machine-translation first-pass — TODO native review; covered
    // by the doc.draft amber flag) Vault use cases — heading + bodies translated.
    "2. 保险库用例——到底该放什么（以及为什么）",
    "3. 选择要保护的内容",
    "4. 登记向导（顶部步骤条）",
    "4.5. 简单路线 vs 最高安全——选择您的底线",
    "5. 保存与分散份额的真实机制",
    "6. 日后恢复您的秘密",
    "7. 亲属、生命信号与死亡开关",
    "7.5. 激活时的所有者取消窗口",
    "8. 社会恢复——监护人（与亲属不同）",
    "9. 仪表盘驾驶舱",
    "10. 继承人指南",
    "11. 灵魂绑定 NFT（ERC-5192）——您的继承凭证",
    "12. 设置、信息与帮助",
    "13. 黄金法则",
    "14. Live-Man's Switch——在错误继承之前被警示",
    "15. 登记后的钱包迁移",
  ],
  whats: [
    [
      "每个页面右上角。连接任意 EVM 钱包（MetaMask、通过 MetaMask/Trust 的硬件钱包，或 WalletConnect）。钱包仅用于您的链上许可和指定亲属——您保险库的加密秘密是独立的离线层，永不接触钱包。",
      "再次访问时可能短暂看到此提示——正在恢复您之前的会话。请稍候；您无需重新连接。",
    ],
    // §2 (NEW 0.7.0 ZH machine-translation first-pass — TODO native review;
    // covered by the doc.draft amber flag) Vault use cases — full per-step text.
    [
      "这是在开始登记之前，用来通盘思考完整存储计划的深度参考。多数用户要保护的不止一个秘密——而是一整叠：一个硬件钱包助记词、一份伴侣日后需要纪念化处理的云端登录清单、一张标明保险箱钥匙贴在哪里的照片、给每个孩子的一封密封信件，以及守护其余一切的每个账户的打印版 2FA 恢复码。下面每个类别都有不同的失败模式，并告诉您应选择四种保险库中的哪一种（助记词 / 密封信件 / 文档 / 图片）——本节下方的实时目录可让您直接点入对应的向导。",
      "为何选择它：丢失的 BIP-39 助记词或丢失的交易所恢复码没有任何客服热线。一句 12 个单词的助记词所守护的财富，往往超过一份普通遗产中的房产。所防止的失败模式：法定继承人面对一个无法解锁的 Ledger、一个在长期不活动后自动归档的交易所账户、一个只有您知道主密钥的密码管理器——资产从此永远冻结。推荐的保险库类型：助记词（高熵短字符串，正是为 BIP-39 大小的载荷而设计）。",
      "为何选择它：Apple ID、Google、主邮箱以及各社交平台对已故用户各有不同政策——而其中多数时限在去世后 6-12 个月内到期。未能在此期限内取得凭据的继承人，无法纪念化处理账号、找回照片，也无法取消那些持续向遗产扣费的订阅。所防止的失败模式：一生的照片被锁在一个被遗忘的 Apple ID 之后无法访问；一个域名过期后被人从家人手中抢注；Netflix 和 Adobe 多年来悄悄掏空遗产。推荐的保险库类型：信件（自由文本——一份凭据名册可自然容纳）。",
      "为何选择它：一封千言万语的信，也不如一张带注释的照片那样清楚地告诉伴侣硬件钱包在哪个抽屉里。保险箱、家用保险柜、埋藏的现金、备用钥匙、保管遗嘱原件的律师——这些都是“位置”，而位置需要图片。所防止的失败模式：继承人无法找到他们根本不知道存在的东西。保险箱被钻开，内容物依据无人认领财产法被国家拍卖。埋藏的现金继续埋藏。若备用钥匙的位置随您而逝，它对谁都无用。推荐的保险库类型：图片（流程会逐字节加密 JPEG/PNG——说明文字写入文件名或配对的信件保险库）。",
      "为何选择它：没有原件，遗产认证就会卡住。“在律师那里”不等于“这是已签字的 PDF”。若继承人不知道保单存在，保险便无人认领；遗产错过最终申报时税务罚款便会累积；一家独资创始人已故、又找不到股权表的企业，几个月内就会一文不值。所防止的失败模式：执行人耗费数月寻找本应一键可得的文件，而期限一一错过，把资产变成损失。推荐的保险库类型：文档（在单个密封载荷中处理 PDF、扫描件和多页法律文件）。",
      "为何选择它：那些您想说、且只有您能说的话，正是悲痛的家人在没有其他指引时会默默回避的内容。葬礼选择在压力下做出。宠物被交给最先来认领的人。道德遗嘱——您想传承的价值观与故事——永远不会被写下。所防止的失败模式：一场没人想要的千篇一律的仪式、为宠物与财物的争吵，以及一代人永远听不到您本想让他们知道的话。仅在死亡开关触发后才发布——继承人会在最关键的时刻读到它。推荐的保险库类型：信件（自由文本、多收件人、实际上没有有意义的长度限制）。",
      "为何选择它：恢复码的设计本就是在其他一切都失败时的唯一逃生口——手机丢失、硬盘损坏、开启 FileVault 的笔记本变砖。一旦丢失，账户就没了，任何客服流程都无法恢复。它们正是助记词保险库为之而生的那种高熵短字符串。所防止的失败模式：一部全新手机无法通过 2FA 进入那个守护其他所有重置的邮箱、一个无人能解锁的 BitLocker 加密驱动器、密钥已丢失的 GPG 加密备份——继承人即便实际持有硬件，也被锁在数字遗产之外。推荐的保险库类型：助记词（短、密、高熵的字符串——正是这种保险库类型所调校的形态）。",
      "把一切整合起来：多数完成登记的用户最终拥有 3-5 个保险库，而非 1 个——通常是一个用于加密资产的助记词保险库、一个用于凭据与遗愿组合的信件保险库、一个用于保险箱 / 家用保险柜照片的图片保险库，以及一个用于已签字 PDF 遗产文件的文档保险库。死亡开关是按“钱包”计（而非按保险库计），因此一次生命信号即可覆盖全部。在费用方面，每个保险库各自登记，但它们共享基础设施——当前的分级模式见 /pricing。",
    ],
    ["选择一张卡片：加密助记词、密封信件、文档或图片。四者运行完全相同的安全流程——只是输入不同。"],
    [
      "阅读简短介绍并开始。顶部的一排步骤名始终显示您所在位置。",
      "关闭 Wi-Fi、移动数据和蓝牙，然后点击此处。拆分与加密在断网状态下进行——关于您秘密的任何信息都无法离开设备。",
      "输入/粘贴您的 12 或 24 词助记词（或撰写/上传信件/文档/图片）。只是测试？使用「fill a throwaway test seed」链接——它生成一个不控制任何资产的有效助记词，可安全练习。",
      "选择份额总数（N）以及重建所需的份额数（T）。3-of-5 为均衡默认值。",
      "由此派生加密密钥。您必须牢记它——这是您（及您的亲属）恢复保险库的唯一方式。按住眼睛图标可查看输入。它从不预填、从不保存。",
      "可选：用另一密码的诱饵保险库。若被胁迫打开，给出诱饵密码——对方看到可信的一次性秘密，您的真实保险库仍然隐藏。",
      "应用在本地完成加密运算。不上传任何内容。",
      "将加密文件取出浏览器：「Save into a folder…」（Chrome/Edge——直接写入您选择的文件夹）或「Download all files」。NoKLock 从不上传到您的云——文件由您自己放置。",
      "将每个份额放入不同的云账户，并粘贴每个「anyone with the link」链接。分开账户正是要点：一个账户被盗也只泄露一个份额，您的秘密仍然安全。",
      "在信任之前：在另一标签页打开 Restore，证明您的阈值数量的文件 + 您的主密码确实能找回秘密。",
      "输入继承人的钱包地址，在 Polygon 上铸造继承代币。也可稍后通过 /nok 进行。",
      "完成。您的秘密已被拆分、加密并离线安全保存。",
    ],
    // §4.5 (EN index 4) — 简单路线 vs 最高安全（中文初版翻译，受 doc.draft 标记覆盖）。
    [
      "NoKLock 支持从「胜过抽屉里的便条」到「能挺过任何现实的丢失情形」之间的广阔区间。两条路线使用相同的加密流程——区别只在于加密后的份额文件最终放在哪里。您可以先简单上手，日后无需重新登记即可升级到最高安全：份额文件是可移植的，主密码和阈值保持不变，您只需将文件移动（或复制）到更多地方。",
      "底线。在「Store share locations」步骤，将每个 URL 留空，只需把一份份额文件分别放入您每天已在使用的三个文件夹：一个在笔记本电脑上，一个在手机上，一个在抽屉里的 U 盘上。就这样。无需云账户、无需 IPFS、无需 Arweave、无需额外注册。只有当笔记本电脑、手机和 U 盘同时丢失，才会丢失您的秘密——即便如此，主密码仍在您脑中，任意一份幸存副本加上其他 K-1 份即可重建保险库。从每一项重要指标看，这已胜过手写便条：份额经 AEAD 密封（窃贼看到的是密文，而非助记词）、在地理上分散、死亡开关 / 亲属流程照常运作。",
      "上限。在同一「Store share locations」步骤，为每份份额粘贴一个真实 URL：一个 Dropbox 账户、一个使用不同 Google 身份的 Google Drive、一个第三个邮箱的 OneDrive、一个 IPFS pin、一个 Arweave 永久存储上传、一块放在防火盒里的外置 SSD、一个保险箱里的 U 盘。每份份额放入独立的账户 / 提供商 / 物理位置。如今要丢失您的秘密，需要多个独立云提供商同时失效、且您的物理硬盘丢失、且每一份本地缓存副本丢失。这是为保护六位数以上加密资产、规模较大的遗产或单一创始人公司的业务连续性而设的配置。",
      "如何选择：如果您从未用过 NoKLock，今天就从简单路线开始，日后再升级。安装 PWA 后，简单路线的登记约需五分钟，从那一刻起您的秘密就比一小时前更安全。最高安全路线需额外 20-40 分钟来注册（或登录）各个独立账户并上传每份份额——对高价值秘密完全值得，但「我下周末再弄」正是助记词在便条上一放就是数年的原因。",
    ],
    // §5 (EN index 5) — 保存机制。
    [
      "仅 Chrome/Edge：您选择计算机上的一个文件夹；所有文件直接写入其中。若该文件夹是您的 Dropbox/OneDrive/Drive 同步文件夹，云端自家应用会上传。NoKLock 从不自行与您的云通信。",
      "任意浏览器：文件正常下载，由您自己上传到任意位置。",
      "开源命令行工具，目前自动上传到 Dropbox（Google Drive + OneDrive 即将支持）。它在您自己的计算机上以您自己的令牌运行——NoKLock 从不看到该令牌。信任机制与手动相同，处理 3 份以上份额时快得多。安装 + 文档：github.com/dksteeves/noklock/tree/main/tools/noklock-cli",
    ],
    [
      "打开您的云文件夹，下载文件，拖入（或点击选择）。或粘贴某个份额的直接下载链接并「Fetch」——一次一个。没有「单一文件夹链接」。",
      "输入登记时设置的主密码。重建完全在浏览器内进行——您的秘密绝不离开浏览器。之后刷新页面以从内存中清除。",
    ],
    [
      "/nok — 按钱包（已有）或按邮箱（Hybrid-E——没有）添加每位继承人。每次指定都会在 Polygon 上铸造三枚灵魂绑定 NFT（ERC-5192）：激活、投票、撤销。多位继承人时可要求法定人数（如 2-of-3）才解锁（Premium，自 v0.6 起——v0.6 之前创建的保险库仍可由所有者恢复；重新登记以升级；参见 /pricing 了解当前状态）。",
      "/heartbeat — 定期签到（链下免费，或链上无需信任）。每次签到都会重置宽限期计时器。一次签到覆盖此钱包上的所有保险库。",
      "/heartbeat、设置或仪表盘 → 「永不忘记签到」：在您自己的日历中添加循环提醒——.ics（Apple Calendar / Outlook / 任意应用）或 Google Calendar 一键链接。零 PII：NoKLock 不收邮件也不发邮件。",
      "/dead-man — 两种模式。安全模拟（默认）使用您的真实时间展示会发生什么，无链上交易。真实触发会触发您实际的链上开关（需键入确认）。诚实地说：一旦触发，您的亲属将继承。",
    ],
    // §7.5 (EN index 8) — 所有者取消窗口（中文初版翻译）。
    [
      `如果您的死亡开关被触发（Chainlink 确认宽限期已到期并向继承人铸造一枚激活 SBT），链下的继承人通知邮件会被扣留 ${OWNER_CANCEL_WINDOW_HOURS} 小时后才发出。在该窗口期内，仪表盘会显示带倒计时的「待处理激活——您的取消窗口」横幅。误报激活（所有者因良性原因错过签到——生病、离线、单纯忘记）可由所有者在窗口期内、在通知继承人之前中止。`,
      "一次点击完成两半清理：(1) 签署一份永久抑制继承人邮件的 Form B 证明，然后 (2) 通过 revokeNoK 在链上销毁该 SBT（由您的钱包发起交易）。两步都必需，因为仅 Form B 会让 SBT 保持已铸造状态（找到代币 id 的继承人仍可尝试直接链上领取），而仅 revokeNoK 会销毁代币但邮件已在发送途中。",
    ],
    // §7 — Social recovery / guardians (NEW)
    [
      "/recovery → 「我的监护人」标签。设置 1-9 个钱包（M of N），您信任他们在您丢失自己钱包时帮助您找回指定身份。监护人 ≠ 亲属：监护人在您活着时帮您；亲属在宽限期后继承。",
      "/recovery → 「恢复钱包」标签。如果您是其监护人的某人丢失了钱包，在这里发起或投票。时间锁 + M-of-N；原钱包保留取消窗口。",
      "/recovery → 「取消我的恢复」标签。如果您仍控制原钱包而有人发起了对您的恢复，在窗口期内从这里取消。这是对监护人共谋的防御。",
    ],
    // §8 — Dashboard cockpit (NEW)
    [
      "上次签到、宽限期剩余时间、红绿灯状态（健康 / 即将到期 / 逾期）。发送签到按钮。一次签到覆盖此钱包上的所有保险库。",
      "在此浏览器中密封的保险库的真实数量（按类型：助记词 / 信件 / 文档 / 图像）。继承人覆盖率：Y 个保险库中 X 个有链上指定的 NoK。",
      "诚实的提醒：签到逾期 / 无 NoK 的保险库 / 尚未注册保险库。没有虚假的「季度审计」——这些是真正的行动项。",
      "您的设置默认值（阈值 / 总份额 / 宽限期）的读出，让驾驶舱成为状态总览的唯一位置。",
    ],
    // §9 — Instruction manual for an heir (NEW)
    [
      "/nok-claim/<nonce> — 如果有人通过邮箱将您指定为亲属，且其死亡开关已触发，您会通过激活邮件到达此处。页面引导您了解正在发生的事情和领取流程。",
      "如果您没有 Polygon 钱包，请安装 MetaMask（或类似产品）。NFT 将进入该钱包。NoKLock 永远不会看到私钥。",
      "一个按钮搞定一切：NoKLock 的服务器签署有时限的密码学声明，证明您是此邮箱的继承人；您的钱包将其发送到链上托管合约；托管合约销毁占位 NFT 并向您铸造新的灵魂绑定（ERC-5192）。费用：几美分 MATIC gas。",
      "NFT 本身不解密任何内容。您还需要：(1) 原始持有人事先与您共享的主密码（NoKLock 从未有过），(2) 份额文件或份额 URL。打开 /restore，拖入份额，键入密码——保险库重建。",
    ],
    // §10 — Soulbound NFTs (NEW)
    [
      "每次 NoK 指定都会在 Polygon 上铸造三枚灵魂绑定 NFT：激活（死亡开关触发器）、投票（M-of-N 法定人数——自 v0.6 起强制执行；v0.6 之前的保险库仍可由所有者恢复，重新登记以升级）、撤销（让您收回）。灵魂绑定（ERC-5192）= 不可转让：代币一旦铸造到钱包就无法被出售、移动、盗窃或扣押。",
      "这是 ERC-5192 标准（2022 年发布）在生产中的罕见使用。NoKLock 是少数真正按照标准设计意图使用它的系统之一——证明无法被交易的链上权利。",
      "每个 NoKLock 合约在 PolygonScan 上源验证；带地址的完整列表位于 Info → Contracts。您可以独立验证 SBT 代币属于您，且无法从继承人钱包转出。",
    ],
    // §11 — Settings, info & help (MOVED — was at index 6)
    [
      "/settings — 默认值（阈值 / 总份额 / 宽限期）、语言和账户帮助。",
      "/info — 架构、份额模型、安全、通行密钥、合约（带所有 6 个的实时审计姿态）以及「Why not keyless?」说明。",
      "/help — 实用常见问题与故障排除。",
      "/updates — 所有者签名的版本变更历史。每次发布我们都描述交付了什么。",
    ],
    // §12 — Golden rules (MOVED — was at index 7)
    [
      "永不丢失您的主密码。它是唯一的规范密钥——丢失的通行密钥或损坏的设备都无法替代它。",
      "让您的份额分散在不同账户，并确保您的亲属能够取用（位置列表在 NoKLock 之外共享）。",
      "记得时就发送签到。每月一次或每次打开应用时都足以支持默认 60 天宽限期。添加循环日历提醒——零 PII，只存在于您自己的日历中。",
      "英文是每个屏幕和法律文本的约束性版本。NoKLock 从不查看或接触您的密钥、份额或数据。区块链是执行内容的最终裁决。",
    ],
    // §13 — Live-Man's Switch (NEW)
    [
      "在设置中，保险库默认值下方。配置 NoKLock 如何在不打开应用的情况下与您联系，以便在监护人恢复对您的钱包发起时您可以及时取消。死亡开关的对应——到达您的信号。",
      "注册 1-2 个您经常检查的钱包（不是此钱包）并添加一些 POL。如果发起对您的恢复，每个观察者会收到一个微小的链上 ping——大多数钱包应用会显示转入——加上一条永久的链上记录。您资助自己的 ping，所以即使 NoKLock 消失也能运行。",
      "现在发送测试 ping，以便确认您的观察者钱包应用中显示转入。在该钱包中启用转入通知，以免错过真正的。",
      "可选，默认关闭——唯一离开您设备的东西。如果添加邮箱，NoKLock 在对您钱包发起恢复时也会发邮件：可靠投递，但依赖于 NoKLock 服务器（钱包 ping 不依赖）。",
      "如果您被警示而不是您本人操作，这会打开 /recovery 让您在窗口（1-30 天，默认 7 天）内从钱包取消恢复。如果是真实丢失，什么都不做，恢复就会完成。",
    ],
    // §15 (EN index 16) — 登记后的钱包迁移（中文初版翻译）。
    [
      "迁移到新钱包后，您现有的受法定人数保护的保险库仍将您的旧钱包引用为登记所有者。您必须 (a) 从新钱包重新登记每个保险库，或 (b) 妥善保管旧钱包的密钥——它们仍是为这些保险库发起所有者自助恢复的唯一方式。",
    ],
  ],
  // notes keyed by EN sections[] index: {1} §2 vault-use-cases catalog (TODO
  // native review), {4} §4.5, {5} §5, {8} §7.5.
  notes: {
    1: "下方的实时目录展示六个类别中的每一个，并附完整示例清单及紧迫性 / 失败模式的推理。在任意行上点击「Pick this」，即可直接跳入对应保险库类型的登记向导。",
    4: "如果您在「现在走简单路线」和「过几周再做最高安全」之间犹豫，请现在就走简单路线，日后再升级。三个本地文件夹 + 您的主密码 + 死亡开关已经是一个可用的继承计划；URL 字段和云账户流程可在之后无需重新登记地补上。",
    5: "切勿将所有份额放入同一文件夹/账户——那会消除保护。每个份额放在一个独立账户。",
    8: `窗口时长可由运营方通过环境变量 OWNER_CANCEL_WINDOW_HOURS 配置（默认 ${OWNER_CANCEL_WINDOW_HOURS}；有效范围 0-168，即最多 1 周）。一旦计时器归零，取消窗口即结束，继承人通知将排队投递；从那一刻起，唯一剩下的缓解措施是在链上调用 revokeNoK。`,
  },
});

const HI: Doc = clone(EN, {
  title: "NoKLock — चरण-दर-चरण उपयोगकर्ता मार्गदर्शिका",
  intro:
    "यह मार्गदर्शिका आपको स्क्रीन-दर-स्क्रीन ले जाती है। ऐप स्वयं अंग्रेज़ी में है (कानूनी रूप से मान्य संस्करण); प्रत्येक चरण वह सटीक अंग्रेज़ी लेबल बताता है जो आप स्क्रीन पर देखते हैं, फिर हिन्दी में समझाता है कि क्या करना है।",
  draft: "हिन्दी अनुवाद प्रारंभिक है, मूल वक्ता द्वारा समीक्षा लंबित। संदेह होने पर अंग्रेज़ी इंटरफ़ेस मान्य है।",
  // 0.7.0 — index-drift realignment (see DE note). Empty/passthrough slots at
  // EN index 4 (§4.5) and 8 (§7.5); §4.5 + §7.5 now carry HI draft text
  // (machine-translation first-pass — covered by the doc.draft amber flag).
  headings: [
    "1. अपना वॉलेट कनेक्ट करें",
    // §2 (0.7.0 HI machine-translation first-pass — TODO native review; covered
    // by the doc.draft amber flag) Vault use cases — heading + bodies translated.
    "2. वॉल्ट उपयोग-प्रसंग — असल में क्या रखें (और क्यों)",
    "3. चुनें कि आप क्या सुरक्षित कर रहे हैं",
    "4. नामांकन विज़ार्ड (ऊपर की चरण-पट्टी)",
    "4.5. सरल मार्ग बनाम अधिकतम सुरक्षा — अपनी न्यूनतम सीमा चुनें",
    "5. शेयर सहेजना और बाँटना वास्तव में कैसे काम करता है",
    "6. बाद में अपना रहस्य पुनर्स्थापित करें",
    "7. परिजन, जीवन-संकेत और डेड-मैन स्विच",
    "7.5. सक्रियण पर स्वामी रद्दीकरण विंडो",
    "8. सामाजिक रिकवरी — गार्जियन (परिजनों से भिन्न)",
    "9. डैशबोर्ड कॉकपिट",
    "10. उत्तराधिकारी के लिए मार्गदर्शिका",
    "11. सोल-बाउंड NFTs (ERC-5192) — आपका उत्तराधिकार प्रमाण",
    "12. सेटिंग्स, जानकारी और सहायता",
    "13. स्वर्णिम नियम",
    "14. Live-Man's Switch — गलत उत्तराधिकार से पहले चेतावनी पाएँ",
    "15. नामांकन के बाद वॉलेट माइग्रेशन",
  ],
  whats: [
    [
      "हर पृष्ठ के ऊपर-दाएँ। कोई भी EVM वॉलेट कनेक्ट करें (MetaMask, MetaMask/Trust के ज़रिए हार्डवेयर वॉलेट, या WalletConnect)। वॉलेट केवल आपके ऑन-चेन लाइसेंस और परिजन नामित करने के लिए है — आपके वॉल्ट का एन्क्रिप्शन रहस्य एक अलग ऑफ़लाइन परत है जो वॉलेट को कभी नहीं छूती।",
      "दोबारा आने पर यह संक्षेप में दिख सकता है — आपका पिछला सत्र पुनर्स्थापित हो रहा है। प्रतीक्षा करें; आपको फिर से कनेक्ट करने की ज़रूरत नहीं।",
    ],
    // §2 (NEW 0.7.0 HI machine-translation first-pass — TODO native review;
    // covered by the doc.draft amber flag) Vault use cases — full per-step text.
    [
      "यह नामांकन शुरू करने से पहले अपनी पूरी भंडारण योजना सोच-समझकर तय करने हेतु विस्तृत संदर्भ है। अधिकांश उपयोगकर्ताओं के पास सुरक्षित करने को एक रहस्य नहीं — बल्कि एक पूरा ढेर होता है: एक हार्डवेयर-वॉलेट सीड, क्लाउड लॉगिन की एक सूची जिसे साथी को आगे संभालना होगा, एक तस्वीर कि सेफ-डिपॉज़िट-बॉक्स की चाबी कहाँ चिपकी है, हर बच्चे के लिए एक सीलबंद पत्र, और हर खाते के मुद्रित 2FA रिकवरी कोड जो बाकी सबकी रक्षा करते हैं। नीचे दी हर श्रेणी का विफलता-तरीका अलग है, और हर एक बताती है कि चार वॉल्ट प्रकारों (सीड / सीलबंद पत्र / दस्तावेज़ / छवि) में से कौन-सा चुनें — इस अनुभाग के नीचे का लाइव कैटलॉग आपको सीधे सही विज़ार्ड में क्लिक करने देता है।",
      "क्यों चुनें: खोई हुई BIP-39 सीड या खोए हुए एक्सचेंज रिकवरी कोड के लिए कोई सहायता-लाइन नहीं है। एक अकेला 12-शब्द वाक्यांश अक्सर औसत संपत्ति के घर से अधिक धन की रक्षा करता है। रोका गया विफलता-तरीका: कानूनी उत्तराधिकारी ऐसे Ledger को घूरता रह जाता है जिसे वह खोल नहीं सकता, एक एक्सचेंज खाता जो निष्क्रियता के बाद स्वतः संग्रहीत हो जाता है, एक पासवर्ड प्रबंधक जिसकी मास्टर कुंजी केवल आप जानते थे — और संपत्तियाँ हमेशा के लिए जमी रह जाती हैं। अनुशंसित वॉल्ट प्रकार: सीड (उच्च-एन्ट्रॉपी छोटी स्ट्रिंग्स, ठीक BIP-39 आकार के पेलोड के लिए बनी)।",
      "क्यों चुनें: Apple ID, Google, मुख्य ईमेल और सोशल प्लेटफ़ॉर्म, प्रत्येक की मृत-उपयोगकर्ता नीति अलग है — और इनमें से अधिकांश समय-सीमाएँ मृत्यु के 6-12 महीने बाद समाप्त हो जाती हैं। जिन उत्तराधिकारियों के पास उस अवधि में क्रेडेंशियल नहीं होते, वे प्रोफ़ाइल को आगे संभाल नहीं सकते, तस्वीरें नहीं निकाल सकते, या उन सदस्यताओं को बंद नहीं कर सकते जो संपत्ति से शुल्क लेती रहती हैं। रोका गया विफलता-तरीका: जीवन भर की तस्वीरें एक भूले हुए Apple ID के पीछे दुर्गम हो जाती हैं; एक डोमेन समाप्त होकर परिवार के सामने ही खरीद लिया जाता है; Netflix और Adobe वर्षों तक चुपचाप संपत्ति खाली करते रहते हैं। अनुशंसित वॉल्ट प्रकार: पत्र (मुक्त-रूप पाठ — क्रेडेंशियल की सूची स्वाभाविक रूप से समा जाती है)।",
      "क्यों चुनें: हज़ार शब्दों का पत्र भी आपके साथी को इतनी स्पष्टता से नहीं बता सकता कि हार्डवेयर वॉलेट किस दराज़ में है, जितनी एक टिप्पणी सहित तस्वीर बता सकती है। सेफ-डिपॉज़िट बॉक्स, घरेलू तिजोरियाँ, गाड़ा हुआ नकद, अतिरिक्त चाबियाँ, वह वकील जिसके पास मूल वसीयत है — ये स्थान हैं, और स्थानों को तस्वीरें चाहिए। रोका गया विफलता-तरीका: उत्तराधिकारी वह नहीं खोज सकते जिसके होने का उन्हें पता ही नहीं। सेफ-डिपॉज़िट बॉक्स ड्रिल कर खोले जाते हैं और सामग्री राज्य द्वारा बेदावा-संपत्ति कानूनों के तहत नीलाम कर दी जाती है। गाड़ा हुआ नकद गड़ा ही रहता है। यदि अतिरिक्त चाबियों का स्थान आपके साथ ही चला गया तो वे किसी के काम नहीं आतीं। अनुशंसित वॉल्ट प्रकार: छवि (पाइपलाइन JPEG/PNG को बाइट-दर-बाइट एन्क्रिप्ट करती है — कैप्शन फ़ाइल नाम में या जोड़े गए पत्र वॉल्ट में जाते हैं)।",
      "क्यों चुनें: मूल दस्तावेज़ों के बिना प्रोबेट अटक जाता है। «यह वकील के पास है» और «यह रहा हस्ताक्षरित PDF» एक बात नहीं। यदि उत्तराधिकारी को पता ही न हो तो बीमा पॉलिसियाँ बेदावा रह जाती हैं; जब संपत्ति अपना अंतिम कर-विवरण चूकती है तो दंड जुड़ते जाते हैं; एक मृत एकल-संस्थापक वाला व्यवसाय, जिसकी कैप टेबल न मिले, महीनों में मूल्यहीन हो जाता है। रोका गया विफलता-तरीका: निष्पादक के महीनों उस कागज़ात की खोज में बीत जाते हैं जो एक क्लिक दूर होना चाहिए था, और समय-सीमाएँ बीतती जाती हैं जो संपत्तियों को हानि में बदल देती हैं। अनुशंसित वॉल्ट प्रकार: दस्तावेज़ (एक सीलबंद पेलोड में PDF, स्कैन और बहु-पृष्ठ कानूनी फ़ाइलें संभालता है)।",
      "क्यों चुनें: जो बातें आप कहना चाहते थे, और जो केवल आप ही कह सकते थे, वही हैं जिनसे शोकाकुल परिवार बिना किसी और मार्गदर्शन के स्वतः हट जाते हैं। अंत्येष्टि के निर्णय दबाव में लिए जाते हैं। पालतू जानवर जो पहले माँगे उसे सौंप दिए जाते हैं। नैतिक वसीयतें — वे मूल्य और कहानियाँ जो आप आगे ले जाना चाहते थे — कभी लिखी ही नहीं जातीं। रोका गया विफलता-तरीका: एक ऐसी सामान्य सेवा जो किसी को नहीं चाहिए थी, पालतू और सामान को लेकर झगड़े, और अगली पीढ़ी जो कभी नहीं सुन पाती कि आप उन्हें क्या बताना चाहते थे। केवल डेड-मैन ट्रिगर के बाद जारी — उत्तराधिकारी इसे ठीक उसी क्षण पढ़ता है जब वह मायने रखता है। अनुशंसित वॉल्ट प्रकार: पत्र (मुक्त-रूप पाठ, बहु-प्राप्तकर्ता, व्यवहार में कोई मायने रखने वाली लंबाई-सीमा नहीं)।",
      "क्यों चुनें: रिकवरी कोड इसी के लिए बने हैं कि जब बाकी सब विफल हो जाए तब वही एकमात्र निकास द्वार हों — खोया हुआ फ़ोन, खराब हार्ड ड्राइव, FileVault चालू किया हुआ बंद पड़ा लैपटॉप। इन्हें खो दें तो खाता चला जाता है, और कोई सहायता-प्रक्रिया उन्हें वापस नहीं ला सकती। ये ठीक वही उच्च-एन्ट्रॉपी छोटी स्ट्रिंग हैं जिनके लिए सीड-वॉल्ट बनाया गया था। रोका गया विफलता-तरीका: एक बिल्कुल नया फ़ोन जो उस ईमेल में 2FA पार नहीं कर सकता जो बाकी हर रीसेट की रक्षा करता है, एक BitLocker-एन्क्रिप्टेड ड्राइव जिसे कोई खोल नहीं सकता, GPG-एन्क्रिप्टेड बैकअप जिनकी कुंजियाँ खो चुकी हैं — और उत्तराधिकारी डिजिटल संपत्ति से बाहर बंद रह जाता है, भले ही हार्डवेयर भौतिक रूप से उसके पास हो। अनुशंसित वॉल्ट प्रकार: सीड (छोटी, सघन, उच्च-एन्ट्रॉपी स्ट्रिंग्स — ठीक वही रूप जिसके लिए यह वॉल्ट प्रकार बनाया गया है)।",
      "सब कुछ जोड़कर: अधिकांश नामांकित उपयोगकर्ता अंत में 3-5 वॉल्ट के साथ रहते हैं, 1 के साथ नहीं — आम तौर पर क्रिप्टो के लिए एक सीड वॉल्ट, क्रेडेंशियल-और-अंतिम-इच्छाओं के संयोजन के लिए एक पत्र वॉल्ट, सेफ-डिपॉज़िट-बॉक्स / घरेलू तिजोरी की तस्वीरों के लिए एक छवि वॉल्ट, और हस्ताक्षरित-PDF संपत्ति कागज़ात के लिए एक दस्तावेज़ वॉल्ट। डेड-मैन स्विच प्रति-वॉलेट है (प्रति-वॉल्ट नहीं), इसलिए एक ही जीवन-संकेत सभी को कवर करता है। लागत की दृष्टि से, प्रत्येक वॉल्ट अपना अलग नामांकन है पर वे अवसंरचना साझा करते हैं — मौजूदा स्तर मॉडल के लिए /pricing देखें।",
    ],
    ["एक कार्ड चुनें: क्रिप्टो सीड फ़्रेज़, सीलबंद पत्र, दस्तावेज़ या छवि। चारों एक ही सुरक्षित पाइपलाइन चलाते हैं — केवल इनपुट भिन्न है।"],
    [
      "संक्षिप्त परिचय पढ़ें और शुरू करें। ऊपर चरण-नामों की एक पंक्ति हमेशा बताती है कि आप कहाँ हैं।",
      "Wi-Fi, मोबाइल डेटा और Bluetooth बंद करें, फिर यहाँ क्लिक करें। विभाजन और एन्क्रिप्शन नेटवर्क अवरुद्ध रहते हुए होते हैं — आपके रहस्य के बारे में कुछ भी डिवाइस से बाहर नहीं जा सकता।",
      "अपना 12 या 24-शब्द वाक्यांश लिखें/पेस्ट करें (या पत्र/दस्तावेज़/छवि लिखें/अपलोड करें)। केवल परीक्षण? « fill a throwaway test seed » लिंक का उपयोग करें — यह एक मान्य वाक्यांश बनाता है जो कुछ भी नियंत्रित नहीं करता, सुरक्षित अभ्यास हेतु।",
      "शेयरों की कुल संख्या (N) और पुनर्निर्माण हेतु आवश्यक संख्या (T) चुनें। 3-में-5 संतुलित डिफ़ॉल्ट है।",
      "इससे कुंजी व्युत्पन्न होती है। आपको इसे अवश्य याद रखना है — यही एकमात्र तरीका है जिससे आप (और आपके परिजन) वॉल्ट पुनर्प्राप्त करते हैं। दर्ज सामग्री जाँचने हेतु आँख आइकन दबाए रखें। यह कभी पूर्व-भरा या सहेजा नहीं जाता।",
      "वैकल्पिक: अलग पासवर्ड वाला छद्म वॉल्ट। यदि कोई खोलने को बाध्य करे, छद्म पासवर्ड दें — वे एक विश्वसनीय फेंकने योग्य रहस्य देखते हैं, आपका असली वॉल्ट छिपा रहता है।",
      "ऐप क्रिप्टोग्राफ़ी स्थानीय रूप से करता है। कुछ भी अपलोड नहीं होता।",
      "एन्क्रिप्टेड फ़ाइलें ब्राउज़र से निकालें: « Save into a folder… » (Chrome/Edge — चुने फ़ोल्डर में सीधे) या « Download all files »। NoKLock आपकी क्लाउड पर कभी अपलोड नहीं करता — फ़ाइलें आप स्वयं रखते हैं।",
      "प्रत्येक शेयर एक अलग क्लाउड खाते में रखें और प्रत्येक « anyone with the link » URL पेस्ट करें। अलग खाते ही मूल बात है: एक चोरी हुआ खाता केवल एक शेयर उजागर करता है, आपका रहस्य सुरक्षित रहता है।",
      "भरोसा करने से पहले: दूसरे टैब में Restore खोलें और सिद्ध करें कि आपकी सीमा-संख्या फ़ाइलें + आपका मास्टर पासवर्ड वास्तव में रहस्य वापस लाते हैं।",
      "Polygon पर उत्तराधिकार टोकन ढालने हेतु अपने उत्तराधिकारी का वॉलेट पता दर्ज करें। बाद में /nok से भी संभव।",
      "पूर्ण। आपका रहस्य विभाजित, एन्क्रिप्टेड और ऑफ़लाइन-सुरक्षित है।",
    ],
    // §4.5 (EN index 4) — सरल मार्ग बनाम अधिकतम सुरक्षा (हिन्दी प्रारंभिक अनुवाद, doc.draft से आच्छादित)।
    [
      "NoKLock «दराज़ में रखे एक नोट से बेहतर» और «हर यथार्थवादी हानि-परिदृश्य को झेल जाए» के बीच एक विस्तृत दायरा समर्थित करता है। दोनों मार्ग एक ही क्रिप्टोग्राफ़िक पाइपलाइन उपयोग करते हैं — केवल यह भिन्न है कि एन्क्रिप्टेड शेयर फ़ाइलें कहाँ पहुँचती हैं। आप सरल से शुरू कर सकते हैं और बाद में बिना पुनः नामांकन के अधिकतम सुरक्षा तक बढ़ सकते हैं: शेयर फ़ाइलें पोर्टेबल हैं, मास्टर पासवर्ड और सीमा वही रहती है, आप बस फ़ाइलों को और स्थानों पर ले जाते (या कॉपी करते) हैं।",
      "न्यूनतम सीमा। «Store share locations» चरण पर, प्रत्येक URL खाली छोड़ें और बस एक शेयर फ़ाइल को तीन ऐसे फ़ोल्डरों में रखें जिन्हें आप पहले से रोज़ उपयोग करते हैं: एक लैपटॉप पर, एक फ़ोन पर, और एक दराज़ में रखी USB ड्राइव पर। बस इतना ही। कोई क्लाउड खाता नहीं, कोई IPFS नहीं, कोई Arweave नहीं, कोई अतिरिक्त साइनअप नहीं। अपना रहस्य खोने के लिए लैपटॉप और फ़ोन और USB ड्राइव का एक साथ खोना आवश्यक है — और तब भी मास्टर पासवर्ड आपके दिमाग़ में है, और कोई भी एक बची हुई प्रति तथा अन्य K-1 प्रतियाँ वॉल्ट पुनर्निर्मित कर देती हैं। यह हर मायने में लिखे नोट से बेहतर है: शेयर AEAD-सीलबंद हैं (चोर को सिफरटेक्स्ट दिखता है, सीड नहीं), वे भौगोलिक रूप से बँटे हैं, और डेड-मैन स्विच / NoK प्रवाह वैसे ही काम करते हैं।",
      "अधिकतम सीमा। उसी «Store share locations» चरण पर, प्रत्येक शेयर के लिए एक वास्तविक URL पेस्ट करें: एक Dropbox खाता, अलग Google पहचान वाला एक Google Drive, तीसरे ईमेल पर एक OneDrive, एक IPFS pin, एक Arweave स्थायी-संग्रह अपलोड, अग्नि-रोधक बॉक्स में एक बाहरी SSD, बैंक लॉकर में एक USB। प्रत्येक शेयर एक अलग खाते / प्रदाता / भौतिक स्थान पर। अब आपका रहस्य खोने के लिए कई स्वतंत्र क्लाउड प्रदाताओं की एक साथ विफलता और आपकी भौतिक ड्राइव की हानि और हर स्थानीय कैश्ड प्रति की हानि आवश्यक है। यह छह-अंकीय से अधिक क्रिप्टो, बड़ी विरासतों, या एकल-संस्थापक कंपनी की व्यावसायिक निरंतरता की रक्षा करने वालों के लिए विन्यास है।",
      "कौन-सा चुनें: यदि आपने पहले कभी NoKLock नहीं चलाया, आज ही सरल मार्ग से शुरू करें और बाद में बढ़ें। PWA इंस्टॉल करने के बाद सरल मार्ग का नामांकन लगभग पाँच मिनट लेता है, और उस क्षण से आपका रहस्य एक घंटे पहले की तुलना में अधिक सुरक्षित है। अधिकतम सुरक्षा मार्ग अलग खातों में साइन अप करने और प्रत्येक शेयर अपलोड करने हेतु अतिरिक्त 20-40 मिनट जोड़ता है — उच्च-मूल्य रहस्यों के लिए पूर्णतः उचित, परंतु «मैं अगले सप्ताहांत कर लूँगा» ठीक वही है जिससे सीड वर्षों तक एक नोट पर पड़े रह जाते हैं।",
    ],
    // §5 (EN index 5) — सहेजना कैसे काम करता है।
    [
      "केवल Chrome/Edge: आप अपने कंप्यूटर पर एक फ़ोल्डर चुनते हैं; सभी फ़ाइलें सीधे उसमें लिखी जाती हैं। यदि वह आपका Dropbox/OneDrive/Drive सिंक फ़ोल्डर है, तो क्लाउड का अपना ऐप उन्हें अपलोड करता है। NoKLock स्वयं आपकी क्लाउड से कभी बात नहीं करता।",
      "कोई भी ब्राउज़र: फ़ाइलें सामान्य रूप से डाउनलोड होती हैं और आप उन्हें जहाँ चाहें स्वयं अपलोड करते हैं।",
      "ओपन-सोर्स कमांड-लाइन टूल जो आज Dropbox पर स्वतः अपलोड करता है (Google Drive + OneDrive जल्द आ रहे)। यह आपके अपने कंप्यूटर पर आपके अपने टोकन से चलता है — NoKLock टोकन कभी नहीं देखता। मैन्युअल जैसी ही भरोसे की कहानी, 3+ शेयरों के लिए बहुत तेज़। इंस्टॉल + दस्तावेज़: github.com/dksteeves/noklock/tree/main/tools/noklock-cli",
    ],
    [
      "अपने क्लाउड फ़ोल्डर खोलें, फ़ाइलें डाउनलोड करें, खींचकर डालें (या चुनने हेतु क्लिक करें)। या किसी शेयर का सीधा-डाउनलोड लिंक पेस्ट कर « Fetch » — एक बार में एक। « एकल फ़ोल्डर लिंक » नहीं होता।",
      "नामांकन में सेट किया मास्टर पासवर्ड दर्ज करें। पुनर्निर्माण पूरी तरह ब्राउज़र में होता है — आपका रहस्य उसे कभी नहीं छोड़ता। बाद में स्मृति से हटाने हेतु पृष्ठ पुनः लोड करें।",
    ],
    [
      "/nok — प्रत्येक उत्तराधिकारी को वॉलेट से (पहले से है) या ईमेल से (Hybrid-E — नहीं है) जोड़ें। प्रत्येक नामांकन Polygon पर तीन सोल-बाउंड NFT (ERC-5192) ढालता है: सक्रियण, मतदान, निरसन। कई उत्तराधिकारियों पर कोरम (जैसे 2-में-3) आवश्यक कर सकते हैं (Premium, v0.6 से आगे — v0.6 से पूर्व नामांकित वॉल्ट स्वामी द्वारा पुनर्प्राप्त करने योग्य रहते हैं; अपग्रेड हेतु पुनः नामांकन करें; वर्तमान स्थिति के लिए /pricing देखें)।",
      "/heartbeat — समय-समय पर चेक-इन करें (मुफ़्त ऑफ़-चेन, या भरोसा-रहित ऑन-चेन)। हर चेक-इन आपका टाइमर रीसेट करता है। एक चेक-इन इस वॉलेट के सभी वॉल्ट को कवर करता है।",
      "/heartbeat, सेटिंग्स या डैशबोर्ड → «चेक-इन कभी न भूलें»: अपने ही कैलेंडर में आवर्ती अनुस्मारक जोड़ें — .ics (Apple Calendar / Outlook / कोई भी ऐप) या Google Calendar एक-क्लिक लिंक। शून्य-PII: NoKLock कोई ईमेल नहीं लेता और कुछ नहीं भेजता।",
      "/dead-man — दो मोड। सुरक्षित अनुकरण (डिफ़ॉल्ट) आपके वास्तविक समय के साथ दिखाता है कि क्या होगा, ऑन-चेन ट्रांज़ैक्शन के बिना। वास्तविक ट्रिगर आपका वास्तविक ऑन-चेन स्विच दागता है (टाइप पुष्टि आवश्यक)। ईमानदारी से: एक बार दागे जाने पर, आपके परिजन उत्तराधिकार पाएँगे।",
    ],
    // §7.5 (EN index 8) — स्वामी रद्दीकरण विंडो (हिन्दी प्रारंभिक अनुवाद)।
    [
      `यदि आपका डेड-मैन स्विच कभी दागा जाता है (Chainlink पुष्टि करता है कि छूट-अवधि समाप्त हो गई + किसी उत्तराधिकारी को एक सक्रियण SBT ढालता है), तो ऑफ़-चेन उत्तराधिकारी-सूचना ईमेल बाहर जाने से पहले ${OWNER_CANCEL_WINDOW_HOURS} घंटे रोका जाता है। उस विंडो के दौरान डैशबोर्ड पर एक उलटी-गिनती के साथ «लंबित सक्रियण — आपकी रद्दीकरण विंडो» बैनर दिखता है। झूठे-सकारात्मक सक्रियण (स्वामी ने किसी सौम्य कारण से चेक-इन चूका — बीमार, ऑफ़-ग्रिड, बस भूल गया) को स्वामी विंडो के दौरान, उत्तराधिकारी को सूचित किए जाने से पहले, रद्द कर सकता है।`,
      "एक क्लिक सफ़ाई के दोनों भाग करता है: (1) एक Form B प्रमाणन साइन करना जो उत्तराधिकारी ईमेल को स्थायी रूप से दबाता है, फिर (2) SBT को revokeNoK के ज़रिए ऑन-चेन जलाया जाता है (आपका वॉलेट tx दागता है)। दोनों चरण आवश्यक हैं क्योंकि केवल Form B से SBT ढला रह जाएगा (टोकन id पाने वाला उत्तराधिकारी सीधे ऑन-चेन दावा आज़मा सकता है) और केवल revokeNoK से टोकन जल जाएगा पर ईमेल पहले ही निकल चुका होगा।",
    ],
    // §7 — Social recovery / guardians (NEW)
    [
      "/recovery → «मेरे गार्जियन» टैब। 1-9 वॉलेट सेट करें (M of N) जिन पर आप भरोसा करते हैं कि वे आपकी अपनी वॉलेट खोने पर आपका नामांकन वापस पाने में मदद करें। गार्जियन ≠ परिजन: गार्जियन आपके जीवित रहते आपकी मदद करते हैं।",
      "/recovery → «वॉलेट पुनर्प्राप्त करें» टैब। यदि कोई जिसके आप गार्जियन हैं अपनी वॉलेट खो चुका है, यहाँ आरंभ करें या वोट दें। समय-लॉक + M-of-N; मूल वॉलेट के पास रद्दीकरण विंडो रहती है।",
      "/recovery → «मेरी रिकवरी रद्द करें» टैब। यदि आप अभी भी मूल वॉलेट नियंत्रित करते हैं और किसी ने आप पर रिकवरी आरंभ की है, विंडो के अंदर इसे यहाँ से रद्द करें। गार्जियन साजिश के विरुद्ध रक्षा।",
    ],
    // §8 — Dashboard cockpit (NEW)
    [
      "अंतिम चेक-इन, छूट-अवधि में शेष समय, ट्रैफिक-लाइट स्थिति (स्वस्थ / जल्द देय / अतिदेय)। चेक-इन भेजें बटन। एक चेक-इन इस वॉलेट के सभी वॉल्ट को कवर करता है।",
      "इस ब्राउज़र में सील किए गए वॉल्ट की वास्तविक संख्या (प्रकार के अनुसार: सीड / पत्र / दस्तावेज़ / छवि)। उत्तराधिकारी कवरेज: Y वॉल्ट में से X में ऑन-चेन नामित NoK है।",
      "ईमानदार सुझाव: चेक-इन अतिदेय / NoK के बिना वॉल्ट / कोई वॉल्ट नहीं। कोई नकली «तिमाही ऑडिट» नहीं — ये असली कार्य आइटम हैं।",
      "आपकी सेटिंग्स डिफ़ॉल्ट का पठन (सीमा / कुल शेयर / छूट-अवधि) ताकि कॉकपिट स्थिति की झलक के लिए एक स्थान हो।",
    ],
    // §9 — Instruction manual for an heir (NEW)
    [
      "/nok-claim/<nonce> — यदि किसी ने आपको ईमेल से परिजन नामित किया और उनका डेड-मैन स्विच ट्रिगर हो गया, तो आप सक्रियण ईमेल से यहाँ पहुँचते हैं। पृष्ठ आपको बताता है क्या हो रहा है और दावा प्रक्रिया।",
      "यदि आपके पास Polygon वॉलेट नहीं है, MetaMask (या समान) इंस्टॉल करें। NFT उस वॉलेट में जाता है। NoKLock निजी कुंजी कभी नहीं देखता।",
      "एक बटन सब कुछ करता है: NoKLock का सर्वर समय-सीमित क्रिप्टोग्राफ़िक कथन साइन करता है कि आप इस ईमेल के उत्तराधिकारी हैं; आपका वॉलेट इसे ऑन-चेन एस्क्रो को भेजता है; एस्क्रो प्लेसहोल्डर NFT जलाता है और आपको नया सोल-बाउंड (ERC-5192) ढालता है। लागत: कुछ सेंट MATIC गैस।",
      "NFT अकेले कुछ डिक्रिप्ट नहीं करता। आपको चाहिए: (1) मास्टर पासवर्ड जो मूल व्यक्ति ने आपसे पहले साझा किया (NoKLock के पास कभी नहीं था), और (2) शेयर फ़ाइलें या शेयर URLs। /restore खोलें, शेयर डालें, पासवर्ड टाइप करें — वॉल्ट पुनर्निर्माण होता है।",
    ],
    // §10 — Soulbound NFTs (NEW)
    [
      "प्रत्येक NoK नामांकन Polygon पर तीन सोल-बाउंड NFT ढालता है: सक्रियण (डेड-मैन ट्रिगर), मतदान (M-of-N कोरम — v0.6 से आगे प्रवर्तित; v0.6 से पूर्व वॉल्ट स्वामी द्वारा पुनर्प्राप्त करने योग्य रहते हैं, अपग्रेड हेतु पुनः नामांकन करें), निरसन (आपको वापस लेने देता है)। सोल-बाउंड (ERC-5192) = गैर-हस्तांतरणीय: वॉलेट में ढले जाने के बाद टोकन को बेचा, स्थानांतरित, चुराया या जब्त नहीं किया जा सकता।",
      "यह उत्पादन में ERC-5192 मानक (2022 में प्रकाशित) का दुर्लभ उपयोग है। NoKLock उन कुछ प्रणालियों में से एक है जो वास्तव में मानक के मूल इरादे के लिए इसे उपयोग करती हैं — ऑन-चेन अधिकार सिद्ध करना जिनका व्यापार नहीं हो सकता।",
      "प्रत्येक NoKLock अनुबंध PolygonScan पर स्रोत-सत्यापित है; पतों के साथ पूरी सूची Info → Contracts पर है। आप स्वतंत्र रूप से सत्यापित कर सकते हैं कि SBT टोकन आपका है और उत्तराधिकारी की वॉलेट से बाहर स्थानांतरित नहीं हो सकता।",
    ],
    // §11 — Settings, info & help (MOVED — was at index 6)
    [
      "/settings — डिफ़ॉल्ट (सीमा / कुल शेयर / छूट-अवधि), भाषा और खाता सहायता।",
      "/info — आर्किटेक्चर, शेयर मॉडल, सुरक्षा, पासकी, अनुबंध (सभी 6 के लिए लाइव ऑडिट स्थिति) और « Why not keyless? »।",
      "/help — व्यावहारिक सामान्य प्रश्न और समस्या-समाधान।",
      "/updates — स्वामी-साइन किया हुआ रोल-बाय-रोल परिवर्तन इतिहास। हर रिलीज़ हम वर्णन करते हैं क्या भेजा गया।",
    ],
    // §12 — Golden rules (MOVED — was at index 7)
    [
      "अपना मास्टर पासवर्ड कभी न खोएँ। यह एकमात्र प्रामाणिक कुंजी है — खोई पासकी या मृत डिवाइस इसे कभी प्रतिस्थापित नहीं कर सकती।",
      "अपने शेयर अलग-अलग खातों में बँटे रखें और सुनिश्चित करें कि आपके परिजन उन तक पहुँच सकें (स्थान सूची NoKLock के बाहर साझा की गई)।",
      "जब याद आए तब चेक-इन भेजें। डिफ़ॉल्ट 60-दिन छूट-अवधि के लिए महीने में एक बार या ऐप खोलने पर पर्याप्त है। आवर्ती कैलेंडर अनुस्मारक जोड़ें — शून्य-PII, केवल आपके अपने कैलेंडर में रहता है।",
      "हर स्क्रीन और कानूनी पाठ का बाध्यकारी संस्करण अंग्रेज़ी है। NoKLock आपकी कुंजियाँ, शेयर या डेटा कभी नहीं देखता या छूता। ब्लॉकचेन वही है जो लागू होता है उसका अंतिम शब्द।",
    ],
    // §13 — Live-Man's Switch (NEW)
    [
      "सेटिंग्स में, वॉल्ट डिफ़ॉल्ट के नीचे। कॉन्फ़िगर करें कि NoKLock ऐप खोले बिना आपसे कैसे संपर्क करे यदि आपकी वॉलेट के विरुद्ध गार्जियन रिकवरी कभी शुरू हो, ताकि आप समय रहते उसे रद्द कर सकें। डेड-मैन स्विच का प्रतिरूप — संकेत जो आप तक पहुँचता है।",
      "1-2 वॉलेट पंजीकृत करें जिन्हें आप नियमित जाँचते हैं (यह नहीं) और थोड़ा POL जोड़ें। यदि आप पर रिकवरी शुरू होती है, प्रत्येक वॉचर को एक छोटा ऑन-चेन पिंग मिलता है — अधिकांश वॉलेट ऐप्स इनकमिंग ट्रांसफ़र दिखाते हैं — साथ ही स्थायी ऑन-चेन रिकॉर्ड। आप अपने पिंग्स को फंड करते हैं, इसलिए NoKLock गायब हो जाए तब भी काम करता है।",
      "अभी एक टेस्ट पिंग भेजता है ताकि आप पुष्टि कर सकें कि आपकी वॉचर वॉलेट ऐप में इनकमिंग ट्रांसफ़र दिखता है। उस वॉलेट में इनकमिंग-ट्रांसफ़र सूचनाएँ चालू करें ताकि असली से चूकें नहीं।",
      "वैकल्पिक, डिफ़ॉल्ट बंद — एकमात्र चीज़ जो कभी आपके डिवाइस से निकलती है। यदि आप ईमेल जोड़ते हैं, NoKLock आपकी वॉलेट के विरुद्ध रिकवरी शुरू होने पर आपको ईमेल भी भेजता है: विश्वसनीय वितरण, लेकिन NoKLock के सर्वर पर निर्भर (वॉलेट पिंग नहीं)।",
      "यदि आप कभी सूचित होते हैं और यह आप नहीं थे, यह /recovery खोलता है जहाँ आप विंडो (1-30 दिन, डिफ़ॉल्ट 7) के अंदर अपनी वॉलेट से रिकवरी रद्द करते हैं। यदि वास्तविक हानि थी, कुछ न करें और रिकवरी पूरी हो जाती है।",
    ],
    // §15 (EN index 16) — वॉलेट माइग्रेशन (हिन्दी प्रारंभिक अनुवाद)।
    [
      "नए वॉलेट में माइग्रेट करने के बाद, आपके मौजूदा कोरम-संरक्षित वॉल्ट अब भी आपके पुराने वॉलेट को रिकॉर्ड-स्वामी के रूप में संदर्भित करते हैं। आपको या तो (a) प्रत्येक वॉल्ट को नए वॉलेट से पुनः नामांकित करना होगा, या (b) पुराने वॉलेट की कुंजियाँ सुरक्षित रखनी होंगी — वे उन वॉल्ट के लिए स्वामी-स्व-पुनर्स्थापन जारी करने का एकमात्र तरीका बनी रहती हैं।",
    ],
  ],
  // notes keyed by EN sections[] index: {1} §2 vault-use-cases catalog (TODO
  // native review), {4} §4.5, {5} §5, {8} §7.5.
  notes: {
    1: "नीचे का लाइव कैटलॉग छह श्रेणियों में से प्रत्येक को पूरी उदाहरण सूची तथा तात्कालिकता / विफलता-तरीका तर्क के साथ दिखाता है। किसी भी पंक्ति पर «Pick this» क्लिक करें ताकि संबंधित वॉल्ट प्रकार के नामांकन विज़ार्ड में सीधे पहुँच जाएँ।",
    4: "यदि आप «अभी सरल मार्ग» और «कुछ हफ़्तों में अधिकतम सुरक्षा» के बीच चुन रहे हैं, अभी सरल मार्ग चुनें और बाद में उन्नत करें। तीन स्थानीय फ़ोल्डर + आपका मास्टर पासवर्ड + डेड-मैन स्विच पहले से एक कार्यशील उत्तराधिकार योजना है; URL फ़ील्ड और क्लाउड-खाता प्रक्रिया बाद में बिना पुनः नामांकन भरी जा सकती है।",
    5: "सभी शेयर एक ही फ़ोल्डर/खाते में कभी न रखें — इससे सुरक्षा समाप्त हो जाती है। प्रति अलग खाता एक शेयर।",
    8: `विंडो की अवधि ऑपरेटर द्वारा env चर OWNER_CANCEL_WINDOW_HOURS से कॉन्फ़िगर की जा सकती है (डिफ़ॉल्ट ${OWNER_CANCEL_WINDOW_HOURS}; मान्य सीमा 0-168, यानी अधिकतम 1 सप्ताह)। टाइमर के शून्य पहुँचते ही रद्दीकरण विंडो समाप्त हो जाती है और उत्तराधिकारी सूचना वितरण हेतु कतार में लग जाती है; उस बिंदु से एकमात्र शेष उपाय ऑन-चेन revokeNoK कॉल करना है।`,
  },
});

const DOCS: Record<Lang, Doc> = { en: EN, de: DE, fr: FR, pt: PT, "zh-Hans": ZH, hi: HI };

const START_CTA: Record<Lang, string> = {
  en: "→ Start: choose what to protect",
  de: "→ Loslegen: wählen Sie, was Sie schützen",
  fr: "→ Commencer : choisissez ce que vous protégez",
  pt: "→ Começar: escolha o que proteger",
  "zh-Hans": "→ 开始：选择要保护的内容",
  hi: "→ शुरू करें: चुनें कि आप क्या सुरक्षित कर रहे हैं",
};

export function Manual(): JSX.Element {
  useDocumentHead("/manual");
  const { lang } = useT();
  const doc = DOCS[lang] ?? EN;

  return (
    <div className="space-y-6 max-w-3xl mx-auto print-doc">
      <header className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold font-display"><span className="grad">{doc.title}</span></h1>
          <div className="flex items-center gap-2 flex-wrap">
            <PrintAsPDFButton compact />
            <LangSelect compact stayOnPage />
          </div>
        </div>
        <p className="text-text-on-dark/85 text-sm mt-3">{doc.intro}</p>
        {doc.draft && (
          <p className="text-xs text-amber-300 mt-2">{doc.draft}</p>
        )}
        <nav className="mt-4 flex flex-wrap gap-2 text-xs" aria-label="Contents">
          {doc.sections.map((s, i) => (
            <a key={i} href={`#sec-${i}`} className="px-2 py-1 rounded bg-bg-surface text-text-on-dark/80 hover:text-accent-cyan">
              {s.heading}
            </a>
          ))}
        </nav>
      </header>

      {doc.sections.map((s, i) => (
        <section key={i} id={`sec-${i}`} className="card scroll-mt-24">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <h2 className="text-xl font-bold font-display"><span className="grad">{s.heading}</span></h2>
            {s.route && (
              <Link to={s.route} className="text-xs text-accent-cyan hover:underline font-mono">{s.route}</Link>
            )}
          </div>
          <ol className="space-y-3">
            {s.steps.map((st, j) => (
              <li key={j} className="grid sm:grid-cols-[12rem_1fr] gap-2 sm:gap-4">
                <div className="text-xs">
                  <span className="text-text-muted">on screen:</span>{" "}
                  <code className="text-accent-cyan break-words">{st.screen}</code>
                </div>
                <p className="text-sm text-text-on-dark/85 leading-relaxed">{st.what}</p>
              </li>
            ))}
          </ol>
          {s.note && (
            <div className="mt-3 p-3 rounded bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200">
              {s.note}
            </div>
          )}
          {s.mount === "vault-use-cases" && (
            <div className="mt-6">
              <VaultUseCases />
            </div>
          )}
        </section>
      ))}

      <div className="card text-center text-sm text-text-muted">
        <Link to="/enrol" className="text-accent-cyan hover:underline">{START_CTA[lang] ?? START_CTA.en}</Link>
      </div>
    </div>
  );
}
