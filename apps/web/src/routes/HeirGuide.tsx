// @version 0.8.0 @date 2026-06-13
// 0.8.0 — Daniel 2026-06-13: the "When you are ready" closing box was the last
//         hardcoded-English surface on this page (heading, body paragraph, and
//         the three button labels — "Full app guide", "Learn more about
//         NoKLock", "Email us" — all rendered EN in every locale because they
//         sat outside the Doc clone() model with no per-lang table). Lifted
//         each string into per-lang lookup tables (READY_HEADING /
//         READY_BODY_PREFIX / READY_BODY_SUFFIX / READY_BTN_MANUAL /
//         READY_BTN_INFO / READY_BTN_EMAIL), same Record<Lang,string> pattern
//         as the existing READ_FULL_GUIDE / AUTHORITATIVE_NOTE header tables.
//         DE/FR/PT curated; zh-Hans/hi machine-translation first-pass (the
//         calm AUTHORITATIVE_NOTE "English is authoritative" footnote already
//         covers the draft caveat for this page since 0.3.0, so no per-string
//         draft warning is re-added). The /nok-claim/<nonce> route token is
//         now inlined into the body-prefix string (universal) and the
//         noklock.app/heir link stays a real <Link> framed by prefix/suffix.
// @version 0.7.1 @date 2026-06-08
// 0.7.1 — Daniel 2026-06-08 (positioning sweep): §7 "If your phone or laptop
//         dies during recovery" bullet now leads with "local folders or
//         storage providers" so it satisfies the positioning.test.ts
//         storage-agnostic frame (was cloud-only-reading "in the storage
//         providers the designator picked"). Body-copy fix only; the
//         operational point (any device works, no device-pair) is unchanged.
// @version 0.7.0 @date 2026-06-07
// 0.7.0 — Daniel 2026-06-07 (handoff §3.5): §3 Thing 4 "The share files"
//         rewritten across all six locales (EN/DE/FR/PT/zh-Hans/HI). The
//         old copy implied share files are ONLY cloud-stored. Reality: the
//         designator can hand the heir local folders on a laptop/phone/USB
//         OR cloud links — both are first-class. New copy leads with "could
//         be local folders … OR cloud links" so the heir does not waste
//         time hunting for cloud accounts that may not exist. Each locale
//         keeps its native voice from the existing translations.
// @version 0.6.1 @date 2026-06-05
// 0.6.1 — Daniel 2026-06-05: §7 "What if I do not have everything?" gains
//         a "If your phone or laptop dies during recovery" bullet. The
//         share files live in storage providers, not on the device, so
//         the heir continues recovery from any other device. Explicitly
//         contrasts with Secure-Element-locked products (no device-pair,
//         no replacement procedure). Locale clones unchanged — EN body
//         falls through for de/fr/pt/zh-Hans/hi (these locales already
//         had partial coverage; the new bullet falls back to EN).
// @version 0.6.0 @date 2026-06-01
// 0.6.0 — Online/offline transition pass (Daniel 2026-06-01): §4 step-by-step
//         now labels each restore step ONLINE or OFFLINE so the heir
//         understands the boundary that the /restore route enforces. New
//         compact "Step 1 (online): collect K share-vault files. Step 2
//         (go offline): enter master password, restore seed." summary added
//         to the top of §4. Locale clones unchanged: the EN body for §4
//         falls through for de/fr/pt/zh-Hans/hi (these locales already had
//         partial coverage; the unaffected §4 body strings continue to
//         translate; the new lead-in line falls back to EN).
// 0.5.0 — M-of-N pre-v0.6 honesty disclosure: section 5 ("multiple heirs")
//         in all six locales (EN/DE/FR/PT/zh-Hans/HI) now appends the
//         "(Premium, from v0.6 onwards — see /pricing for current status)"
//         qualifier to the M-of-N voting claim. The pre-v0.6 cohort remains
//         single-heir-restorable by their owner; re-enrol upgrades them.
//         Matches K.BEFORE row of mofn-restore-quorum-fix-plan.md.
// 0.4.0 — launch-blocker-1-owner-cancel-window: section 1 now discloses the
//         owner-cancel-window. If you received this email it means the owner
//         had OWNER_CANCEL_WINDOW_HOURS (default 48h, env-tunable 0-168) to
//         abort the activation as a false-positive and did not. Reads value
//         from lib/cancelWindow.ts (single source of truth). Reassures the
//         heir that the email isn't a hair-trigger fire.
// 0.3.0 — Daniel (HARD-CORRECTED): drop ALL "translation pending native
//         review" / draft-flag warnings. They were never approved and they
//         hedge a stance Daniel doesn't want hedged. Replaced with a
//         single calm "English is the authoritative version; other
//         languages are provided for convenience" footnote (matches the
//         Manual approach). Per-locale clone() still works exactly as it
//         did — untranslated bodies silently fall back to the English
//         original. No public "draft" wording anywhere.
// 0.2.0 — Daniel: same translation method + delivery as Manual.tsx. Switched
//         from "EN with locale-fallback" to the same clone()-with-arrays
//         pattern Manual.tsx uses: per-locale headings/body arrays, EN
//         authoritative. de/fr/pt fully translate the four highest-priority
//         heir-orientation sections (1 What happened / 2 Is this real /
//         3 What you need / 4 Step-by-step) — the rest fall back to EN
//         inside the same Doc. Added "Download PDF" button (window.print())
//         + /manual link (full user guide). Outer wrapper takes `print-doc`
//         so the print stylesheet in index.css strips chrome.
// 0.1.0 — /heir — public, permanent, plain-language guide for next-of-kin.
//
// PURPOSE: gives the heir a place to LAND BEFORE clicking the claim link in
// their activation email. Answers the questions a grieving, possibly-non-
// crypto-savvy first-time-NoKLock-visitor will have: "what is this", "is it
// real", "what do I need to do", "is this a scam", "what if I don't have
// everything".
//
// DESIGN INVARIANTS:
//   - No wallet connect required (public).
//   - No tracking, no email collection, no popups.
//   - Plain-language calm tone (heir may be grieving).
//   - Followed by the claim flow at /nok-claim/<nonce> when ready.
//   - Linked from: activation email, NokClaim ("first time? read this"),
//     Manual heir section, Footer.

import { Link } from "react-router-dom";
import { useT, type Lang } from "../i18n/index.js";
import { LangSelect } from "../components/LangSelect.js";
import { PrintAsPDFButton } from "../components/PrintAsPDFButton.js";
import { useDocumentHead } from "../lib/seo.js";
import { OWNER_CANCEL_WINDOW_HOURS } from "../lib/cancelWindow.js";

interface Section {
  readonly id: string;
  readonly heading: string;
  readonly body: readonly string[];
  readonly tag?: "info" | "warn" | "ok";
}

interface Doc {
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly Section[];
}

const EN_SECTIONS: readonly Section[] = [
  {
    id: "what-just-happened",
    heading: "1. What just happened",
    tag: "info",
    body: [
      "Someone you knew set up NoKLock as a way to pass on a digital secret to you. That secret could be a crypto wallet seed phrase, a sealed letter, a document, or an image. They named you as their next-of-kin and chose how long their absence had to last before the system released what they left for you to you.",
      "That period has now lapsed — they have stopped checking in for the full grace period they configured (typically 60 days). NoKLock's on-chain dead-man's switch has fired automatically, and an inheritance NFT has been queued up for you to claim.",
      `Activations include a ${OWNER_CANCEL_WINDOW_HOURS}h owner cancel-window. False-positive activations (owner missed heartbeat for a benign reason — sick, off-grid, simply forgot) can be aborted by the owner during the window before the heir is notified. The fact that you received this email means the cancel-window has already elapsed without the owner aborting — i.e. they had ${OWNER_CANCEL_WINDOW_HOURS}h to abort and did not. This is not a hair-trigger fire.`,
      "Take your time. There is no rush. The system will not expire for 30 days from the moment your activation email was sent. You can read this guide first, ask someone you trust, verify everything below, and then proceed.",
    ],
  },
  {
    id: "is-this-real",
    heading: "2. Is this real, or a scam?",
    tag: "warn",
    body: [
      "Healthy reaction. Phishing emails are everywhere. Here is how to check this is real:",
      "(1) The email you received came FROM an @noklock.app address. Check the sender header in your email client. If it came from somewhere else, ignore it.",
      "(2) The claim link in the email goes to noklock.app/nok-claim/<a long hex string>. Hover over the link (do not click yet) and verify the address shown begins with https://noklock.app/. If it points anywhere else, ignore it.",
      "(3) You can independently verify NoKLock exists and is what it claims to be. Open polygonscan.com in a separate browser tab. Search for the NoKLockEscrow contract address (printed on this site at /info → Contracts tab). You will see the actual deployed Solidity source code, line by line. It is not a website's story — it is the verified protocol.",
      "(4) NoKLock cannot charge you anything. There is no payment to claim. The only cost you might pay is a tiny amount of MATIC for blockchain gas (about a few cents). Anyone asking you for money beyond that is a scammer.",
      "(5) NoKLock cannot pressure you. If you do nothing, nothing happens to you. The system has no power over you beyond what you choose to do.",
      "If you are still unsure: email hello@noklock.app and ask.",
    ],
  },
  {
    id: "what-you-need",
    heading: "3. What you will need",
    tag: "ok",
    body: [
      "Before you click the claim link, gather these four things. You can pause this process at any time — none of them have to be ready in the next 5 minutes.",
      "Thing 1 — The activation email itself. It contains a one-time claim link. Keep it open in a tab.",
      "Thing 2 — A crypto wallet on the Polygon network. If you do not already have one: install Trust Wallet (free) on your phone from the App Store or Play Store. Open it, create a new wallet, write down the seed phrase on PAPER (never type it into a website), and store the paper somewhere safe. The inheritance NFT will arrive in this wallet.",
      "Thing 3 — The master password. The person who designated you should have shared this with you outside NoKLock — in person, in writing, in a sealed letter, via a trusted intermediary, or some way you arranged together. NoKLock has never seen this password and cannot recover it for you. If you do not have it, see section 7 below.",
      "Thing 4 — The share files. Encrypted files the designator stored somewhere YOU can reach — could be local folders on a laptop/phone/USB they handed to you, OR cloud links (Dropbox / Google Drive / OneDrive / IPFS / Arweave). You will need a threshold number of them (typically 3 of 5 — they will have told you the exact count). See section 7 if you do not have all of them.",
    ],
  },
  {
    id: "step-by-step",
    heading: "4. Step-by-step — claim and restore",
    tag: "ok",
    body: [
      "The short version, just two halves: Step 1 (online) — collect the K share-vault files the designator left for you. Step 2 (go offline) — enter the master password on the Restore page; the secret is rebuilt in your browser with the network blocked.",
      "Step 1. ONLINE. Open the claim link from your activation email. The page that opens (the /nok-claim/<nonce> page) walks you through the on-chain claim itself.",
      "Step 2. ONLINE. Connect your wallet using the Connect button. Approve the connection request inside your wallet app.",
      "Step 3. ONLINE. Click Claim. Your wallet will pop up a transaction-approval screen showing a tiny gas cost (a few cents in MATIC). Approve it. NoKLock's server signs a cryptographic attestation that you are the rightful claimant; your wallet sends that attestation to the escrow contract; the escrow burns the original NFT (held for you in safekeeping) and mints a fresh one to your wallet. The whole thing takes about 30 seconds and costs about $0.05.",
      "Step 4. ONLINE. You now own the inheritance NFT. This NFT alone does not contain the secret — it is your on-chain proof that you are the designated heir. The actual secret is restored separately using the master password + share files.",
      "Step 5. ONLINE. Open noklock.app/restore in a new tab. Download the K share-vault files from wherever the designator stored them (cloud links / IPFS / Arweave). The files are encrypted — downloading them reveals nothing.",
      "Step 6. BOUNDARY → goes OFFLINE. The Restore page asks you to go offline (turn Wi-Fi / mobile data off, switch the device to airplane mode). This re-arms the airgap before any decryption begins. Drop the share files into the Restore page; if they were given as cloud links you should have downloaded them in step 5 before going offline.",
      "Step 7. OFFLINE. Type the master password the designator shared with you.",
      "Step 8. OFFLINE. Click Restore. The secret is reconstructed entirely inside your browser with the network blocked — NoKLock servers never see it. Depending on what was protected, you will see: a 12 or 24 word seed phrase (a crypto wallet), the text of a sealed letter, a downloadable document, or an image.",
      "Refresh the Restore page when you are done to clear the secret from browser memory. You can reconnect to the network once you are off the Restore page.",
    ],
  },
  {
    id: "multi-nok",
    heading: "5. What if there are multiple heirs?",
    tag: "info",
    body: [
      "Some users designate multiple next-of-kin with an M-of-N voting requirement (e.g. 2-of-3) (Premium, from v0.6 onwards — see /pricing for current status). This is a defence against any one heir being coerced into releasing the inheritance early or alone. Vaults enrolled before v0.6 remain owner-restorable; re-enrol to upgrade.",
      "If you are one of multiple heirs, your claim alone does not release the vault. After you claim your NFT, the contract waits for the required number of OTHER heirs to also claim and sign a release. Once the threshold is met, the inheritance unlocks for the group.",
      "If you do NOT recognise the other named heirs, or you suspect someone is pressuring another heir to sign — STOP and email hello@noklock.app. Multi-heir setups exist precisely so that a single compromised or coerced heir cannot release the inheritance. If you believe one of your co-heirs is in distress, the right answer is to refuse to sign, not to override their distress.",
      "The Restore page will tell you if the group is still waiting for more votes.",
    ],
  },
  {
    id: "soulbound-nft",
    heading: "6. The inheritance NFT — what it is",
    tag: "info",
    body: [
      "The NFT you receive is a soulbound NFT (ERC-5192 standard). Three properties matter for you:",
      "(1) It is non-transferable. It cannot be sold, traded, moved to another wallet, stolen, or seized by anyone. Once minted to your wallet, it stays there forever (or until you actively burn it).",
      "(2) It has no monetary market value as a token. It is not a tradable collectible. Its value is what it represents: cryptographic proof on a public blockchain that you are the designated heir.",
      "(3) It is the public, on-chain record of your designation. If you ever need to prove inheritance — to an attorney, an exchange, a court — the NFT in your wallet plus the public Polygon transaction log is the documentation.",
      "Keep the wallet that holds the NFT. If you lose access to that wallet, you lose proof of designation. (You may still be able to access the secret via the share files + master password regardless, but the on-chain proof is gone.)",
    ],
  },
  {
    id: "missing-pieces",
    heading: "7. What if I do not have everything?",
    tag: "warn",
    body: [
      "If you do not have the master password: NoKLock cannot recover it for you. The password was set by the designator and only they ever knew it. Check anywhere they may have left it for you — a safety deposit box, a sealed letter, an attorney, a trusted friend, a will, the page of a book they may have referred to. Without the master password, the share files alone cannot reconstruct the secret. This is a deliberate design decision (the master password is the canonical key).",
      "If you do not have enough share files: you need at least the threshold number (usually 3 of 5, sometimes 2 of 3 or 5 of 9 — the manifest.json file states the exact number). Below threshold, the secret cannot be reconstructed. The designator chose their share locations themselves; ask anyone who might have been given a share to share their copy.",
      "If you do not have a wallet and cannot install one: you can use any computer or phone with a wallet app or extension. There is no NoKLock-specific wallet — any standard Polygon wallet works (MetaMask, Trust Wallet, Coinbase Wallet, etc.). If you genuinely cannot, email hello@noklock.app and we will help find a solution.",
      "If your phone or laptop dies during the recovery: the share files live in local folders or storage providers the designator picked (could be a USB stick, a laptop folder, a cloud account, or a mix), not on your device. Get to any other device (phone, laptop, library computer, a friend's), open this guide again at noklock.app/heir, repeat sections 4–6 from there. The master password and the threshold number of share files are what matter; the device is interchangeable. There is no device-pairing step, no Secure Enclave key tied to a specific phone, no replacement procedure to call about.",
      "If you are reading this 31+ days after the activation email: the one-time nonce in your claim link has expired. The NFT is still designated to you on-chain — email hello@noklock.app and we can re-issue a fresh attestation link.",
      "If you are unsure whether to proceed (e.g. you suspect the designator did not intend this, family disputes, legal questions): NoKLock has no opinion on these. Pause, consult a lawyer or family member, and proceed only when you are sure. Nothing happens automatically just because you have read this page.",
    ],
  },
  {
    id: "what-noklock-cannot-do",
    heading: "8. What NoKLock cannot do — your safety boundaries",
    tag: "ok",
    body: [
      "NoKLock has no way to charge you any money beyond your own gas cost (~$0.05). There is no fee, no subscription, no premium upgrade required to claim. If anyone (a website, an email, a person) asks you to pay NoKLock for the claim itself, it is a scam.",
      "NoKLock cannot reveal anything about the designator's other affairs — their bank accounts, their other assets, their other wallets. NoKLock holds nothing about them beyond what was put into the vault you are about to receive.",
      "NoKLock cannot pressure you, hold a deadline over you, or take anything from you. If you ignore this email entirely, nothing happens to you. The system is one-way: it gives you a key, you choose whether to use it.",
      "NoKLock cannot see what is inside your vault. Even after you have restored it, the contents are decrypted only inside your browser. We do not, cannot, and will not know what the designator left you.",
      "NoKLock cannot help you with what the secret IS for. If the vault contains a crypto seed phrase that gives you access to a wallet, what you do with that wallet is your decision. We have no role beyond delivering it to you in the form the designator left it.",
    ],
  },
  {
    id: "after-claim",
    heading: "9. After you have claimed and restored — what next?",
    tag: "ok",
    body: [
      "If the secret was a crypto seed phrase: transfer the funds in that wallet to a fresh wallet you control as soon as you safely can. The deceased may have shared this seed phrase with the original NoKLock setup process — there is no evidence it was leaked, but a fresh wallet under your sole control is best practice. Consider moving funds to a hardware wallet if the amount warrants it.",
      "If the secret was a sealed letter or a document: read it. Save a copy somewhere secure. The Restore page is purely temporary — refresh and the data is gone.",
      "Tell your own next-of-kin. If you are designated as someone else's heir today, consider designating your own — life is unpredictable. /enrol on this site.",
      "You do not need to keep using NoKLock. Your job here is done. The inheritance NFT stays in your wallet as the permanent on-chain record; nothing else is required from you.",
      "Optional: send a thank-you note to hello@noklock.app — or feedback on what was confusing, what was unclear, what could have been better. We listen and improve.",
    ],
  },
  {
    id: "verify-noklock",
    heading: "10. Verify NoKLock independently",
    tag: "info",
    body: [
      "NoKLock is a small team (one person, fully transparent). The protocol is autonomous on-chain code, not promises. You can verify independently:",
      "(1) The smart contracts on Polygon. Visit /info → Contracts on this site for every NoKLock contract address, each linking to PolygonScan where you can read the verified Solidity source.",
      "(2) The audit posture. /info → Contracts also lists the test counts (154/154 forge tests), the audit history (multiple independent AI reviews across two external passes plus internal self-review, SolidityScan reviews on every contract, full deploy dress-rehearsal on a local Polygon fork before broadcast), and walks through every red flag a security scanner might raise with a line-by-line explanation.",
      "(3) The architecture. /info → Architecture explains every claim NoKLock makes (Self-custodial, Air-gapped, Tamper-proof, Spoof-proof, Social-engineering-proof, Duress-proof, NoKLock-proof) with the cryptographic basis for each.",
      "(4) The bug bounty. /info → Contracts → Bug Bounty: verified bug reports earn a free Lifetime licence; critical findings earn USDC payouts. We want eyes on the code.",
      "Email hello@noklock.app for anything else. Take whatever time you need.",
    ],
  },
];

const EN: Doc = {
  title: "If you are reading this, you have been designated as a next-of-kin",
  intro:
    "This guide is for you — the heir. If you have received an inheritance activation email from NoKLock, or someone has told you to expect one, read this page first. It explains in plain language what happened, what you need, and exactly what to do. Take your time. There is no rush.",
  sections: EN_SECTIONS,
};

// ── Translations ───────────────────────────────────────────────────────
// Same delivery as Manual.tsx: per-locale headings + body arrays, partial
// (sections 1-4) for de/fr/pt; remainder falls back to EN inside the same
// Doc so the heir always sees the full guide. zh-Hans / hi carry the
// "draft pending native review" flag (matches Manual.tsx posture).

function clone(base: Doc, t: {
  title: string; intro: string;
  headings: Readonly<Record<number, string>>;
  bodies: Readonly<Record<number, readonly string[]>>;
}): Doc {
  return {
    title: t.title,
    intro: t.intro,
    sections: base.sections.map((s, i) => ({
      id: s.id,
      heading: t.headings[i] ?? s.heading,
      body: t.bodies[i] ?? s.body,
      ...(s.tag ? { tag: s.tag } : {}),
    })),
  };
}

const DE: Doc = clone(EN, {
  title: "Wenn Sie dies lesen, wurden Sie als nächste Angehörige benannt",
  intro:
    "Diese Anleitung ist für Sie — die Erbin oder den Erben. Wenn Sie eine NoKLock-Erbschafts-Aktivierungs-E-Mail erhalten haben oder Ihnen jemand gesagt hat, eine zu erwarten, lesen Sie zuerst diese Seite. Sie erklärt in einfacher Sprache, was geschehen ist, was Sie benötigen und was genau zu tun ist. Nehmen Sie sich Zeit. Es eilt nicht.",
  headings: {
    0: "1. Was gerade geschehen ist",
    1: "2. Ist das echt oder Betrug?",
    2: "3. Was Sie benötigen werden",
    3: "4. Schritt für Schritt — beanspruchen und wiederherstellen",
    4: "5. Was ist, wenn es mehrere Erben gibt?",
    5: "6. Das Erbschafts-NFT — was es ist",
    6: "7. Was, wenn ich nicht alles habe?",
    7: "8. Was NoKLock NICHT tun kann — Ihre Sicherheitsgrenzen",
    8: "9. Nach dem Anspruch und der Wiederherstellung — wie geht es weiter?",
    9: "10. NoKLock unabhängig verifizieren",
  },
  bodies: {
    0: [
      "Jemand, den Sie kannten, hat NoKLock eingerichtet, um Ihnen ein digitales Geheimnis zu hinterlassen. Das kann eine Krypto-Seed-Phrase, ein versiegelter Brief, ein Dokument oder ein Bild sein. Sie wurden als nächste Angehörige benannt; festgelegt wurde auch, wie lange die Abwesenheit dauern musste, bevor das System Ihnen freigibt, was hinterlassen wurde.",
      "Diese Frist ist nun verstrichen — die Person hat sich die volle konfigurierte Schonfrist (in der Regel 60 Tage) nicht mehr gemeldet. NoKLocks On-Chain-Totmannschalter hat automatisch ausgelöst, und ein Erbschafts-NFT steht für Sie zum Abruf bereit.",
      "Lassen Sie sich Zeit. Es eilt nicht. Das System läuft erst 30 Tage nach dem Versand Ihrer Aktivierungs-E-Mail ab. Sie können diese Anleitung zuerst lesen, eine Vertrauensperson fragen, alles unten verifizieren und dann fortfahren.",
    ],
    1: [
      "Gesunde Reaktion. Phishing-E-Mails sind überall. So prüfen Sie, dass dies echt ist:",
      "(1) Die E-Mail kam von einer @noklock.app-Adresse. Prüfen Sie den Absender-Header. Stammt sie von woanders, ignorieren.",
      "(2) Der Anspruchs-Link führt zu noklock.app/nok-claim/<lange Hex-Zeichenfolge>. Bewegen Sie den Mauszeiger darüber (noch nicht klicken) und prüfen Sie, dass die angezeigte Adresse mit https://noklock.app/ beginnt. Andernfalls ignorieren.",
      "(3) Sie können NoKLock unabhängig prüfen. Öffnen Sie polygonscan.com in einem separaten Tab. Suchen Sie die NoKLockEscrow-Adresse (auf dieser Seite unter /info → Contracts). Sie sehen den tatsächlich eingesetzten Solidity-Quellcode Zeile für Zeile. Das ist keine Werbung — das ist das verifizierte Protokoll.",
      "(4) NoKLock kann Ihnen nichts in Rechnung stellen. Es gibt keine Zahlung, um zu beanspruchen. Die einzigen Kosten sind ein winziger Betrag MATIC für Blockchain-Gas (wenige Cent). Wer Geld darüber hinaus verlangt, ist ein Betrüger.",
      "(5) NoKLock kann Sie zu nichts zwingen. Wenn Sie nichts tun, passiert Ihnen nichts. Das System hat keine Macht über Sie außer dem, was Sie selbst wählen.",
      "Im Zweifel: E-Mail an hello@noklock.app.",
    ],
    2: [
      "Bevor Sie den Anspruchs-Link anklicken, sammeln Sie diese vier Dinge. Sie können jederzeit pausieren — keines muss in 5 Minuten bereit sein.",
      "Ding 1 — Die Aktivierungs-E-Mail selbst. Sie enthält einen Einmal-Anspruchs-Link. Lassen Sie sie in einem Tab offen.",
      "Ding 2 — Eine Krypto-Wallet im Polygon-Netzwerk. Falls Sie noch keine haben: installieren Sie Trust Wallet (kostenlos) auf Ihrem Telefon aus dem App Store / Play Store. Öffnen, neue Wallet erstellen, Seed-Phrase auf PAPIER notieren (niemals in eine Website tippen) und sicher verwahren. Das Erbschafts-NFT landet in dieser Wallet.",
      "Ding 3 — Das Master-Passwort. Die Person, die Sie benannt hat, sollte es Ihnen außerhalb von NoKLock mitgeteilt haben — persönlich, schriftlich, in einem versiegelten Brief, über eine Vertrauensperson oder auf eine andere vereinbarte Weise. NoKLock hat dieses Passwort nie gesehen und kann es nicht für Sie wiederherstellen. Falls Sie es nicht haben, siehe Abschnitt 7 unten.",
      "Ding 4 — Die Anteilsdateien. Verschlüsselte Dateien, die die benennende Person an einem Ort hinterlegt hat, den SIE erreichen können — entweder lokale Ordner auf einem Laptop/Telefon/USB-Stick, den sie Ihnen übergeben hat, ODER Cloud-Links (Dropbox / Google Drive / OneDrive / IPFS / Arweave). Sie brauchen eine Schwellen-Anzahl davon (typisch 3 von 5 — Ihnen wurde die genaue Anzahl mitgeteilt). Siehe Abschnitt 7, falls nicht alle vorhanden.",
    ],
    3: [
      "Schritt 1. Öffnen Sie den Anspruchs-Link aus Ihrer Aktivierungs-E-Mail. Die geöffnete Seite (/nok-claim/<nonce>) führt Sie durch den On-Chain-Anspruch.",
      "Schritt 2. Verbinden Sie Ihre Wallet über den Connect-Button. Bestätigen Sie die Verbindungsanfrage in Ihrer Wallet-App.",
      "Schritt 3. Klicken Sie auf Claim. Ihre Wallet öffnet ein Bestätigungs-Fenster mit winzigen Gas-Kosten (wenige Cent in MATIC). Bestätigen Sie. NoKLocks Server signiert eine kryptografische Bescheinigung, dass Sie rechtmäßig sind; Ihre Wallet sendet sie an den Escrow-Vertrag; der Escrow verbrennt das ursprüngliche NFT und prägt Ihnen ein frisches. Das Ganze dauert ca. 30 Sekunden und kostet etwa 0,05 $.",
      "Schritt 4. Sie besitzen nun das Erbschafts-NFT. Dieses NFT enthält allein nicht das Geheimnis — es ist Ihr On-Chain-Nachweis, dass Sie die benannte Erbin/der benannte Erbe sind. Das eigentliche Geheimnis wird separat über Master-Passwort + Anteilsdateien wiederhergestellt.",
      "Schritt 5. Öffnen Sie noklock.app/restore in einem neuen Tab.",
      "Schritt 6. Ziehen Sie die Anteilsdateien auf die Restore-Seite. Falls Cloud-Links: jeden Link öffnen, Datei herunterladen, auf Restore ziehen.",
      "Schritt 7. Geben Sie das Master-Passwort ein, das die Person Ihnen mitgeteilt hat.",
      "Schritt 8. Klicken Sie auf Restore. Das Geheimnis wird vollständig in Ihrem Browser rekonstruiert — NoKLock-Server sehen es nie. Je nach Inhalt sehen Sie: eine 12- oder 24-Wort-Phrase (Krypto-Wallet), den Text eines versiegelten Briefs, ein herunterladbares Dokument oder ein Bild.",
      "Laden Sie die Restore-Seite anschließend neu, um das Geheimnis aus dem Browser-Speicher zu löschen.",
    ],
    4: [
      "Manche Personen benennen mehrere Angehörige mit einer M-von-N-Abstimmungsanforderung (z. B. 2 von 3) (Premium, ab v0.6 — siehe /pricing für den aktuellen Stand). Das ist ein Schutz davor, dass ein einzelner Erbe gezwungen werden könnte, das Erbe vorzeitig oder allein freizugeben. Vor v0.6 angelegte Tresore bleiben durch den Eigentümer wiederherstellbar; eine Neu-Einschreibung rüstet sie auf.",
      "Wenn Sie einer von mehreren Erben sind, gibt Ihr Anspruch allein den Tresor nicht frei. Nach dem Anspruch des NFT wartet der Vertrag, bis die erforderliche Anzahl ANDERER Erben ebenfalls einen Anspruch erhebt und eine Freigabe unterzeichnet. Sobald die Schwelle erreicht ist, wird das Erbe für die Gruppe freigegeben.",
      "Falls Sie die anderen benannten Erben NICHT kennen oder vermuten, dass jemand einen Miterben unter Druck setzt — STOPP, und schreiben Sie an hello@noklock.app. Mehr-Erben-Setups existieren gerade deshalb, damit ein einzelner kompromittierter oder gezwungener Erbe das Erbe nicht freigeben kann. Wenn Sie glauben, ein Miterbe ist in Not, ist die richtige Antwort, die Unterschrift zu verweigern — nicht, sich darüber hinwegzusetzen.",
      "Die Restore-Seite zeigt Ihnen, wenn die Gruppe noch auf weitere Stimmen wartet.",
    ],
    5: [
      "Das NFT, das Sie erhalten, ist ein seelengebundenes NFT (Standard ERC-5192). Drei Eigenschaften sind für Sie wichtig:",
      "(1) Es ist nicht übertragbar. Es kann nicht verkauft, gehandelt, in eine andere Wallet verschoben, gestohlen oder beschlagnahmt werden. Einmal an Ihre Wallet geprägt, bleibt es dort für immer (oder bis Sie es aktiv verbrennen).",
      "(2) Es hat keinen monetären Marktwert als Token. Es ist kein handelbares Sammlerstück. Sein Wert ist, was es repräsentiert: kryptografischer Nachweis auf einer öffentlichen Blockchain, dass Sie der benannte Erbe sind.",
      "(3) Es ist die öffentliche, On-Chain-Aufzeichnung Ihrer Benennung. Wenn Sie jemals die Erbschaft nachweisen müssen — gegenüber einem Anwalt, einer Börse, einem Gericht — sind das NFT in Ihrer Wallet plus das öffentliche Polygon-Transaktionsprotokoll die Dokumentation.",
      "Behalten Sie die Wallet mit dem NFT. Wenn Sie den Zugriff darauf verlieren, verlieren Sie den Benennungsnachweis. (Sie können das Geheimnis möglicherweise trotzdem über die Anteilsdateien + das Master-Passwort wiederherstellen, aber der On-Chain-Nachweis ist weg.)",
    ],
    6: [
      "Falls Sie das Master-Passwort nicht haben: NoKLock kann es nicht für Sie wiederherstellen. Das Passwort wurde von der benennenden Person gesetzt; nur sie kannte es. Suchen Sie an Orten, wo es hinterlegt sein könnte — Bankschließfach, versiegelter Brief, Anwalt, Vertrauensperson, Testament, Seite eines bestimmten Buches. Ohne Master-Passwort können die Anteilsdateien allein das Geheimnis nicht rekonstruieren. Das ist eine bewusste Designentscheidung (das Master-Passwort ist der kanonische Schlüssel).",
      "Falls Sie nicht genügend Anteilsdateien haben: Sie brauchen mindestens die Schwellen-Anzahl (üblich 3 von 5, manchmal 2 von 3 oder 5 von 9 — die manifest.json-Datei nennt die exakte Zahl). Unter der Schwelle kann das Geheimnis nicht rekonstruiert werden. Die benennende Person hat die Speicherorte selbst gewählt; fragen Sie alle, die einen Anteil erhalten haben könnten, nach ihrer Kopie.",
      "Falls Sie keine Wallet haben und keine installieren können: Sie können jeden Computer oder jedes Telefon mit einer Wallet-App / Erweiterung verwenden. Es gibt keine NoKLock-spezifische Wallet — jede Standard-Polygon-Wallet funktioniert (MetaMask, Trust Wallet, Coinbase Wallet usw.). Falls wirklich nicht möglich, E-Mail an hello@noklock.app — wir helfen, eine Lösung zu finden.",
      "Falls Sie dies 31+ Tage nach der Aktivierungs-E-Mail lesen: die einmalige Nonce in Ihrem Anspruchs-Link ist abgelaufen. Das NFT ist on-chain weiterhin für Sie bestimmt — E-Mail an hello@noklock.app und wir stellen einen frischen Bescheinigungs-Link aus.",
      "Falls Sie unsicher sind, ob Sie fortfahren sollen (z. B. Verdacht, dass die benennende Person dies nicht beabsichtigt hat, Familienstreit, juristische Fragen): NoKLock hat dazu keine Meinung. Pausieren Sie, fragen Sie Anwalt oder Familienmitglieder, fahren Sie nur fort, wenn Sie sicher sind. Nichts geschieht automatisch, nur weil Sie diese Seite gelesen haben.",
    ],
    7: [
      "NoKLock kann Ihnen kein Geld in Rechnung stellen, abgesehen von Ihren eigenen Gas-Kosten (~0,05 $). Es gibt keine Gebühr, kein Abonnement, kein Premium-Upgrade für den Anspruch. Wer auch immer (eine Website, eine E-Mail, eine Person) Sie zur Zahlung für den Anspruch selbst auffordert, ist ein Betrüger.",
      "NoKLock kann nichts über die anderen Angelegenheiten der benennenden Person preisgeben — Bankkonten, sonstige Vermögenswerte, andere Wallets. NoKLock hält nichts über sie, außer was in den Tresor gelegt wurde, den Sie gleich erhalten.",
      "NoKLock kann Sie nicht unter Druck setzen, Ihnen keine Frist auferlegen, nichts von Ihnen nehmen. Ignorieren Sie diese E-Mail vollständig, passiert Ihnen nichts. Das System ist einseitig: es gibt Ihnen einen Schlüssel, Sie entscheiden, ob Sie ihn nutzen.",
      "NoKLock kann nicht sehen, was in Ihrem Tresor ist. Auch nach der Wiederherstellung wird der Inhalt nur in Ihrem Browser entschlüsselt. Wir wissen nicht, können nicht wissen und werden nie wissen, was Ihnen hinterlassen wurde.",
      "NoKLock kann Ihnen nicht helfen, WOFÜR das Geheimnis ist. Wenn der Tresor eine Krypto-Seed-Phrase enthält, die Zugriff auf eine Wallet gibt, ist Ihre Entscheidung, was Sie mit dieser Wallet tun. Wir haben keine Rolle über die Übergabe in der Form hinaus, die die benennende Person hinterließ.",
    ],
    8: [
      "Falls das Geheimnis eine Krypto-Seed-Phrase war: überweisen Sie die Mittel dieser Wallet so bald wie sicher möglich auf eine frische, von Ihnen kontrollierte Wallet. Die verstorbene Person hat diese Seed-Phrase möglicherweise mit dem ursprünglichen NoKLock-Setup geteilt — es gibt keinen Hinweis auf ein Leck, aber eine frische Wallet unter Ihrer alleinigen Kontrolle ist Best Practice. Erwägen Sie eine Hardware-Wallet, wenn der Betrag es rechtfertigt.",
      "Falls das Geheimnis ein versiegelter Brief oder ein Dokument war: lesen Sie es. Speichern Sie eine Kopie sicher. Die Restore-Seite ist rein temporär — Neu laden und die Daten sind weg.",
      "Sagen Sie Ihren eigenen Angehörigen Bescheid. Wenn Sie heute als jemandes Erbe benannt sind, erwägen Sie, Ihre eigenen Erben zu benennen — das Leben ist unvorhersehbar. /enrol auf dieser Seite.",
      "Sie müssen NoKLock nicht weiter nutzen. Ihre Aufgabe hier ist erledigt. Das Erbschafts-NFT bleibt in Ihrer Wallet als dauerhafter On-Chain-Nachweis; nichts Weiteres wird von Ihnen verlangt.",
      "Optional: schicken Sie eine kurze Dankesnachricht an hello@noklock.app — oder Feedback dazu, was verwirrend war, was unklar war, was besser hätte sein können. Wir hören zu und verbessern.",
    ],
    9: [
      "NoKLock ist ein kleines Team (eine Person, vollständig transparent). Das Protokoll ist autonomer On-Chain-Code, keine Versprechen. Sie können unabhängig verifizieren:",
      "(1) Die Smart Contracts auf Polygon. Besuchen Sie /info → Contracts auf dieser Seite für jede NoKLock-Vertragsadresse, jeweils mit Link zu PolygonScan, wo Sie den verifizierten Solidity-Quellcode lesen können.",
      "(2) Die Audit-Haltung. /info → Contracts listet auch die Testzahlen (154/154 Forge-Tests), die Audit-Geschichte (mehrere unabhängige KI-Überprüfungen in zwei externen Durchgängen plus interne Selbstprüfung, SolidityScan-Bewertungen für jeden Vertrag, vollständige Deploy-Generalprobe auf einem lokalen Polygon-Fork vor Broadcast) und erklärt jede potenzielle Red Flag eines Sicherheits-Scanners Zeile für Zeile.",
      "(3) Die Architektur. /info → Architecture erklärt jeden Anspruch, den NoKLock macht (Selbstverwahrend, Air-gapped, Manipulationssicher, Spoofing-sicher, Social-Engineering-sicher, Duress-sicher, NoKLock-sicher) mit der kryptografischen Grundlage für jeden.",
      "(4) Das Bug-Bounty-Programm. /info → Contracts → Bug Bounty: verifizierte Fehlerberichte verdienen eine kostenlose Lifetime-Lizenz; kritische Funde verdienen USDC-Auszahlungen. Wir wollen Augen auf dem Code.",
      "E-Mail an hello@noklock.app für alles andere. Nehmen Sie sich die Zeit, die Sie brauchen.",
    ],
  },
});

const FR: Doc = clone(EN, {
  title: "Si vous lisez ceci, vous avez été désigné·e comme proche",
  intro:
    "Ce guide est pour vous — l'héritier·ère. Si vous avez reçu un courriel d'activation d'héritage de NoKLock, ou si quelqu'un vous a dit d'en attendre un, lisez cette page d'abord. Elle explique en langage simple ce qui s'est passé, ce dont vous avez besoin et exactement quoi faire. Prenez votre temps. Rien ne presse.",
  headings: {
    0: "1. Ce qui vient de se passer",
    1: "2. Est-ce vrai ou une arnaque ?",
    2: "3. Ce dont vous aurez besoin",
    3: "4. Pas à pas — réclamer et restaurer",
    4: "5. Et s'il y a plusieurs héritiers ?",
    5: "6. Le NFT d'héritage — ce que c'est",
    6: "7. Et si je n'ai pas tout ?",
    7: "8. Ce que NoKLock NE peut PAS faire — vos limites de sécurité",
    8: "9. Après la réclamation et la restauration — quelles suites ?",
    9: "10. Vérifier NoKLock indépendamment",
  },
  bodies: {
    0: [
      "Quelqu'un que vous connaissiez a configuré NoKLock pour vous transmettre un secret numérique. Cela peut être une phrase seed crypto, une lettre scellée, un document ou une image. Cette personne vous a désigné·e comme proche et a choisi la durée d'absence requise avant que le système ne vous libère ce qu'elle a laissé.",
      "Cette période est maintenant écoulée — elle a cessé de se signaler pendant toute la période de grâce configurée (généralement 60 jours). L'interrupteur d'homme mort on-chain de NoKLock s'est déclenché automatiquement, et un NFT d'héritage est en attente pour vous.",
      "Prenez votre temps. Rien ne presse. Le système n'expirera que 30 jours après l'envoi de votre courriel d'activation. Vous pouvez lire ce guide, demander à une personne de confiance, vérifier tout ci-dessous, puis procéder.",
    ],
    1: [
      "Réaction saine. Les courriels d'hameçonnage sont partout. Voici comment vérifier que c'est réel :",
      "(1) Le courriel provient d'une adresse @noklock.app. Vérifiez l'en-tête de l'expéditeur dans votre client mail. Si l'origine est autre, ignorez.",
      "(2) Le lien de réclamation mène à noklock.app/nok-claim/<longue chaîne hex>. Survolez le lien (ne cliquez pas encore) et vérifiez que l'adresse commence par https://noklock.app/. Sinon, ignorez.",
      "(3) Vous pouvez vérifier NoKLock indépendamment. Ouvrez polygonscan.com dans un onglet séparé. Cherchez l'adresse du contrat NoKLockEscrow (affichée sur ce site dans /info → Contracts). Vous verrez le code source Solidity réellement déployé, ligne par ligne. Ce n'est pas un argumentaire — c'est le protocole vérifié.",
      "(4) NoKLock ne peut rien vous facturer. Aucun paiement pour réclamer. Le seul coût est un peu de MATIC pour le gaz (quelques centimes). Quiconque demande davantage est un escroc.",
      "(5) NoKLock ne peut pas vous mettre la pression. Si vous ne faites rien, rien ne vous arrive. Le système n'a aucun pouvoir sur vous au-delà de ce que vous choisissez de faire.",
      "Toujours incertain·e : écrivez à hello@noklock.app.",
    ],
    2: [
      "Avant de cliquer sur le lien de réclamation, réunissez ces quatre choses. Vous pouvez mettre en pause à tout moment — aucune n'a à être prête dans les 5 prochaines minutes.",
      "Chose 1 — Le courriel d'activation lui-même. Il contient un lien de réclamation unique. Gardez-le ouvert dans un onglet.",
      "Chose 2 — Un portefeuille crypto sur le réseau Polygon. Si vous n'en avez pas encore : installez Trust Wallet (gratuit) sur votre téléphone via l'App Store ou Play Store. Ouvrez-le, créez un nouveau portefeuille, notez la phrase seed sur PAPIER (ne la tapez jamais sur un site web), et rangez le papier en lieu sûr. Le NFT d'héritage arrivera dans ce portefeuille.",
      "Chose 3 — Le mot de passe maître. La personne qui vous a désigné·e doit vous l'avoir transmis hors de NoKLock — en personne, par écrit, dans une lettre scellée, via un intermédiaire de confiance, ou par un autre moyen convenu. NoKLock n'a jamais vu ce mot de passe et ne peut pas le récupérer pour vous. Si vous ne l'avez pas, voir section 7 ci-dessous.",
      "Chose 4 — Les fichiers de parts. Fichiers chiffrés que la personne désignante a déposés quelque part où VOUS pouvez les atteindre — soit dans des dossiers locaux sur un ordinateur/téléphone/clé USB qu'elle vous a remis, SOIT via des liens cloud (Dropbox / Google Drive / OneDrive / IPFS / Arweave). Il vous faut un nombre seuil de parts (typiquement 3 sur 5 — le nombre exact vous aura été indiqué). Voir section 7 si vous n'avez pas tout.",
    ],
    3: [
      "Étape 1. Ouvrez le lien de réclamation depuis votre courriel d'activation. La page qui s'ouvre (/nok-claim/<nonce>) vous guide à travers la réclamation on-chain.",
      "Étape 2. Connectez votre portefeuille via le bouton Connect. Approuvez la demande de connexion dans votre app portefeuille.",
      "Étape 3. Cliquez sur Claim. Votre portefeuille affichera un écran d'approbation avec un coût de gaz minime (quelques centimes en MATIC). Approuvez. Le serveur NoKLock signe une attestation cryptographique vous confirmant comme demandeur·euse légitime ; votre portefeuille l'envoie au contrat d'escrow ; l'escrow brûle le NFT initial et vous en émet un frais. L'ensemble dure ~30 secondes et coûte ~0,05 $.",
      "Étape 4. Vous possédez désormais le NFT d'héritage. Ce NFT seul ne contient pas le secret — c'est votre preuve on-chain d'être l'héritier·ère désigné·e. Le secret réel se restaure séparément via mot de passe maître + parts.",
      "Étape 5. Ouvrez noklock.app/restore dans un nouvel onglet.",
      "Étape 6. Déposez les fichiers de parts sur la page Restore. Si vous avez reçu des liens cloud : ouvrez chacun, téléchargez le fichier, déposez-le sur Restore.",
      "Étape 7. Saisissez le mot de passe maître que la personne vous a partagé.",
      "Étape 8. Cliquez sur Restore. Le secret se reconstruit entièrement dans votre navigateur — les serveurs NoKLock ne le voient jamais. Selon ce qui a été protégé, vous verrez : une phrase de 12 ou 24 mots (portefeuille crypto), le texte d'une lettre scellée, un document téléchargeable ou une image.",
      "Rechargez la page Restore une fois terminé pour effacer le secret de la mémoire du navigateur.",
    ],
    4: [
      "Certaines personnes désignent plusieurs proches avec une exigence de vote M-sur-N (ex. 2 sur 3) (Premium, à partir de v0.6 — voir /pricing pour le statut actuel). C'est une défense contre tout héritier qui serait contraint de libérer l'héritage prématurément ou seul. Les coffres créés avant v0.6 restent restaurables par leur propriétaire ; ré-inscrivez-vous pour mettre à niveau.",
      "Si vous êtes l'un de plusieurs héritiers, votre réclamation seule ne libère pas le coffre. Après votre réclamation du NFT, le contrat attend que le nombre requis d'AUTRES héritiers réclament aussi et signent une libération. Une fois le seuil atteint, l'héritage s'ouvre pour le groupe.",
      "Si vous ne reconnaissez PAS les autres héritiers nommés, ou si vous soupçonnez que quelqu'un pousse un co-héritier à signer — STOP, et écrivez à hello@noklock.app. Les configurations multi-héritiers existent précisément pour qu'un seul héritier compromis ou contraint ne puisse libérer l'héritage. Si vous pensez qu'un co-héritier est en détresse, la bonne réponse est de refuser de signer, pas de passer outre.",
      "La page Restore indique si le groupe attend encore d'autres votes.",
    ],
    5: [
      "Le NFT que vous recevez est un NFT lié à l'âme (standard ERC-5192). Trois propriétés comptent pour vous :",
      "(1) Il est non-transférable. Il ne peut être vendu, échangé, déplacé vers un autre portefeuille, volé ou saisi. Une fois émis vers votre portefeuille, il y reste pour toujours (ou jusqu'à ce que vous le brûliez activement).",
      "(2) Il n'a aucune valeur marchande monétaire en tant que jeton. Ce n'est pas un objet de collection échangeable. Sa valeur tient à ce qu'il représente : preuve cryptographique sur une blockchain publique que vous êtes l'héritier·ère désigné·e.",
      "(3) C'est l'enregistrement public on-chain de votre désignation. Si vous devez un jour prouver l'héritage — à un avocat, une plateforme, un tribunal — le NFT dans votre portefeuille plus le journal de transactions public Polygon font la documentation.",
      "Conservez le portefeuille qui détient le NFT. Si vous en perdez l'accès, vous perdez la preuve de désignation. (Vous pourrez peut-être encore accéder au secret via les fichiers de parts + mot de passe maître, mais la preuve on-chain sera partie.)",
    ],
    6: [
      "Si vous n'avez pas le mot de passe maître : NoKLock ne peut pas le récupérer pour vous. Le mot de passe a été fixé par la personne désignante et seule elle le connaissait. Cherchez partout où elle aurait pu le laisser — coffre-fort, lettre scellée, avocat, ami de confiance, testament, page d'un livre. Sans le mot de passe maître, les fichiers de parts seuls ne peuvent reconstruire le secret. C'est une décision de conception délibérée (le mot de passe maître est la clé canonique).",
      "Si vous n'avez pas assez de fichiers de parts : il vous faut au moins le nombre seuil (généralement 3 sur 5, parfois 2 sur 3 ou 5 sur 9 — le fichier manifest.json indique le nombre exact). En dessous du seuil, le secret ne peut être reconstruit. La personne désignante a choisi elle-même les emplacements ; demandez à tous ceux qui pourraient en avoir un de partager leur copie.",
      "Si vous n'avez pas de portefeuille et ne pouvez en installer : vous pouvez utiliser n'importe quel ordinateur ou téléphone avec une app/extension de portefeuille. Il n'y a pas de portefeuille NoKLock-spécifique — n'importe quel portefeuille Polygon standard fonctionne (MetaMask, Trust Wallet, Coinbase Wallet, etc.). Si vraiment impossible, écrivez à hello@noklock.app et nous chercherons une solution.",
      "Si vous lisez ceci 31+ jours après le courriel d'activation : la nonce unique de votre lien de réclamation a expiré. Le NFT vous reste destiné on-chain — écrivez à hello@noklock.app et nous réémettrons un lien d'attestation frais.",
      "Si vous n'êtes pas sûr·e de procéder (ex. vous soupçonnez que la personne désignante ne le voulait pas, disputes familiales, questions juridiques) : NoKLock n'a pas d'opinion là-dessus. Pause, consultez un avocat ou un membre de la famille, et procédez seulement si vous êtes sûr·e. Rien ne se passe automatiquement parce que vous avez lu cette page.",
    ],
    7: [
      "NoKLock n'a aucun moyen de vous facturer au-delà de votre propre coût de gaz (~0,05 $). Aucun frais, aucun abonnement, aucune mise à niveau premium n'est requise pour réclamer. Si quiconque (site, courriel, personne) vous demande de payer NoKLock pour la réclamation elle-même, c'est une arnaque.",
      "NoKLock ne peut rien révéler sur les autres affaires de la personne désignante — comptes bancaires, autres actifs, autres portefeuilles. NoKLock ne détient rien sur elle au-delà de ce qui a été mis dans le coffre que vous êtes sur le point de recevoir.",
      "NoKLock ne peut pas vous mettre la pression, vous imposer une date limite ou vous prendre quoi que ce soit. Si vous ignorez complètement ce courriel, rien ne vous arrive. Le système est à sens unique : il vous donne une clé, vous choisissez de l'utiliser.",
      "NoKLock ne peut pas voir ce qu'il y a dans votre coffre. Même après restauration, le contenu est déchiffré uniquement dans votre navigateur. Nous ne savons pas, ne pouvons pas et ne saurons jamais ce que la personne désignante vous a laissé.",
      "NoKLock ne peut pas vous aider à utiliser ce À QUOI sert le secret. Si le coffre contient une phrase seed crypto donnant accès à un portefeuille, ce que vous faites de ce portefeuille est votre décision. Nous n'avons d'autre rôle que vous le livrer dans la forme laissée par la personne désignante.",
    ],
    8: [
      "Si le secret était une phrase seed crypto : transférez les fonds de ce portefeuille vers un nouveau portefeuille que vous contrôlez, dès que c'est sécuritaire. La personne décédée a peut-être partagé cette phrase seed avec le processus de configuration NoKLock initial — il n'y a pas de preuve de fuite, mais un portefeuille frais sous votre seul contrôle est la meilleure pratique. Envisagez un portefeuille matériel si le montant le justifie.",
      "Si le secret était une lettre scellée ou un document : lisez-le. Sauvegardez une copie en lieu sûr. La page Restore est purement temporaire — rechargez et les données disparaissent.",
      "Parlez-en à vos propres proches. Si vous êtes désigné·e aujourd'hui comme l'héritier·ère de quelqu'un, envisagez de désigner les vôtres — la vie est imprévisible. /enrol sur ce site.",
      "Vous n'avez pas à continuer d'utiliser NoKLock. Votre travail ici est terminé. Le NFT d'héritage reste dans votre portefeuille comme enregistrement on-chain permanent ; rien d'autre n'est requis de vous.",
      "Optionnel : envoyez un mot de remerciement à hello@noklock.app — ou des retours sur ce qui était confus, peu clair, ce qui aurait pu être meilleur. Nous écoutons et améliorons.",
    ],
    9: [
      "NoKLock est une petite équipe (une personne, entièrement transparente). Le protocole est du code on-chain autonome, pas des promesses. Vous pouvez vérifier indépendamment :",
      "(1) Les smart contracts sur Polygon. Visitez /info → Contracts sur ce site pour chaque adresse de contrat NoKLock, chacune liée à PolygonScan où vous pouvez lire le code source Solidity vérifié.",
      "(2) La posture d'audit. /info → Contracts liste aussi les nombres de tests (154/154 forge tests), l'historique d'audit (plusieurs revues IA indépendantes en deux passes externes plus auto-revue interne, SolidityScan sur chaque contrat, répétition complète du déploiement sur un fork Polygon local avant le broadcast) et explique chaque drapeau rouge qu'un scanner de sécurité pourrait lever, ligne par ligne.",
      "(3) L'architecture. /info → Architecture explique chaque revendication que NoKLock fait (Auto-conservation, Air-gapped, Inviolable, Anti-usurpation, Anti-ingénierie-sociale, Anti-contrainte, NoKLock-proof) avec la base cryptographique de chacune.",
      "(4) Le bug bounty. /info → Contracts → Bug Bounty : les rapports de bugs vérifiés gagnent une licence Lifetime gratuite ; les trouvailles critiques gagnent des paiements USDC. Nous voulons des yeux sur le code.",
      "Écrivez à hello@noklock.app pour le reste. Prenez le temps qu'il vous faut.",
    ],
  },
});

const PT: Doc = clone(EN, {
  title: "Se está a ler isto, foi designado/a como familiar próximo",
  intro:
    "Este guia é para si — o/a herdeiro/a. Se recebeu um e-mail de ativação de herança da NoKLock, ou alguém lhe disse para esperar um, leia esta página primeiro. Explica em linguagem simples o que aconteceu, o que precisa e exatamente o que fazer. Tome o seu tempo. Não há pressa.",
  headings: {
    0: "1. O que acabou de acontecer",
    1: "2. Isto é real ou uma fraude?",
    2: "3. O que vai precisar",
    3: "4. Passo a passo — reclamar e restaurar",
    4: "5. E se houver vários herdeiros?",
    5: "6. O NFT de herança — o que é",
    6: "7. E se não tiver tudo?",
    7: "8. O que a NoKLock NÃO pode fazer — os seus limites de segurança",
    8: "9. Após reclamar e restaurar — e depois?",
    9: "10. Verificar a NoKLock de forma independente",
  },
  bodies: {
    0: [
      "Alguém que conhecia configurou a NoKLock para lhe transmitir um segredo digital. Esse segredo pode ser uma frase-semente cripto, uma carta selada, um documento ou uma imagem. Designou-o/a como familiar próximo e escolheu quanto tempo de ausência teria de passar antes de o sistema lhe libertar o que deixou.",
      "Esse período já expirou — deixou de se registar durante todo o período de graça configurado (tipicamente 60 dias). O interruptor de homem morto on-chain da NoKLock disparou automaticamente, e um NFT de herança está em espera para si reclamar.",
      "Tome o seu tempo. Não há pressa. O sistema só expirará 30 dias após o envio do seu e-mail de ativação. Pode ler este guia, perguntar a alguém de confiança, verificar tudo abaixo e depois prosseguir.",
    ],
    1: [
      "Reação saudável. Os e-mails de phishing estão por todo lado. Veja como verificar que isto é real:",
      "(1) O e-mail veio de um endereço @noklock.app. Verifique o cabeçalho do remetente. Se veio de outro lado, ignore.",
      "(2) O link de reclamação vai para noklock.app/nok-claim/<longa cadeia hex>. Passe o rato sobre o link (não clique ainda) e verifique que começa por https://noklock.app/. Se apontar para outro lado, ignore.",
      "(3) Pode verificar a NoKLock de forma independente. Abra polygonscan.com num separador. Procure o endereço do contrato NoKLockEscrow (apresentado neste site em /info → Contracts). Verá o código Solidity efetivamente em produção, linha por linha. Não é a história de um site — é o protocolo verificado.",
      "(4) A NoKLock não lhe pode cobrar nada. Não há pagamento para reclamar. O único custo é uma quantia mínima de MATIC para gás (cêntimos). Quem pedir mais é um burlão.",
      "(5) A NoKLock não o/a pode pressionar. Se não fizer nada, nada lhe acontece. O sistema não tem poder sobre si além do que escolher fazer.",
      "Em caso de dúvida: e-mail a hello@noklock.app.",
    ],
    2: [
      "Antes de clicar no link de reclamação, reúna estas quatro coisas. Pode pausar a qualquer momento — nenhuma tem de estar pronta nos próximos 5 minutos.",
      "Coisa 1 — O próprio e-mail de ativação. Contém um link de reclamação único. Mantenha-o aberto num separador.",
      "Coisa 2 — Uma carteira cripto na rede Polygon. Se ainda não tem uma: instale a Trust Wallet (gratuita) no telemóvel a partir da App Store ou Play Store. Abra, crie uma nova carteira, anote a frase-semente em PAPEL (nunca a escreva num site) e guarde o papel em local seguro. O NFT de herança chegará a esta carteira.",
      "Coisa 3 — A palavra-passe mestra. A pessoa que o/a designou deve tê-la partilhado consigo fora da NoKLock — pessoalmente, por escrito, em carta selada, via intermediário de confiança ou de outra forma acordada. A NoKLock nunca viu esta palavra-passe e não a pode recuperar. Se não a tem, ver secção 7 abaixo.",
      "Coisa 4 — Os ficheiros de partes. Ficheiros cifrados que a pessoa designante guardou num sítio a que VOCÊ pode chegar — podem estar em pastas locais num portátil/telemóvel/USB que lhe entregou, OU em links cloud (Dropbox / Google Drive / OneDrive / IPFS / Arweave). Precisa de um número-limiar deles (tipicamente 3 de 5 — terá sido informado/a do número exato). Ver secção 7 se não os tiver todos.",
    ],
    3: [
      "Passo 1. Abra o link de reclamação do seu e-mail de ativação. A página que abre (/nok-claim/<nonce>) acompanha-o/a através da reclamação on-chain.",
      "Passo 2. Ligue a sua carteira pelo botão Connect. Aprove o pedido de ligação na sua app de carteira.",
      "Passo 3. Clique em Claim. A sua carteira mostrará um ecrã de aprovação com um custo mínimo de gás (cêntimos em MATIC). Aprove. O servidor da NoKLock assina uma atestação criptográfica de que é o/a reclamante legítimo/a; a sua carteira envia-a ao contrato de escrow; o escrow queima o NFT original e cunha-lhe um novo. Demora ~30 segundos e custa ~0,05 $.",
      "Passo 4. Agora é dono/a do NFT de herança. Este NFT sozinho não contém o segredo — é a sua prova on-chain de ser o/a herdeiro/a designado/a. O segredo real é restaurado separadamente via palavra-passe mestra + ficheiros de partes.",
      "Passo 5. Abra noklock.app/restore num novo separador.",
      "Passo 6. Largue os ficheiros de partes na página Restore. Se foram dados como links cloud: abra cada link, descarregue o ficheiro, largue-o em Restore.",
      "Passo 7. Escreva a palavra-passe mestra que lhe foi partilhada.",
      "Passo 8. Clique em Restore. O segredo é reconstruído inteiramente no seu navegador — os servidores NoKLock nunca o veem. Conforme o que foi protegido, verá: uma frase de 12 ou 24 palavras (carteira cripto), o texto de uma carta selada, um documento descarregável ou uma imagem.",
      "Recarregue a página Restore quando terminar para apagar o segredo da memória do navegador.",
    ],
    4: [
      "Alguns utilizadores designam vários familiares com um requisito de votação M-de-N (ex. 2-de-3) (Premium, a partir de v0.6 — ver /pricing para o estado atual). É uma defesa contra qualquer herdeiro ser coagido a libertar a herança prematuramente ou sozinho. Os cofres inscritos antes de v0.6 continuam restauráveis pelo proprietário; volte a inscrever para atualizar.",
      "Se é um de vários herdeiros, a sua reclamação sozinha não liberta o cofre. Após reclamar o NFT, o contrato espera que o número necessário de OUTROS herdeiros também reclame e assine uma libertação. Atingido o limiar, a herança abre-se ao grupo.",
      "Se NÃO reconhece os outros herdeiros nomeados, ou suspeita que alguém pressiona outro herdeiro a assinar — PARE e escreva para hello@noklock.app. Configurações multi-herdeiros existem precisamente para que um único herdeiro comprometido ou coagido não possa libertar a herança. Se acha que um co-herdeiro está em apuros, a resposta certa é recusar assinar, não passar por cima.",
      "A página Restore indica se o grupo ainda aguarda mais votos.",
    ],
    5: [
      "O NFT que recebe é um NFT vinculado à alma (norma ERC-5192). Três propriedades são importantes para si:",
      "(1) É não-transferível. Não pode ser vendido, trocado, movido para outra carteira, roubado ou apreendido. Uma vez cunhado na sua carteira, fica lá para sempre (ou até o queimar ativamente).",
      "(2) Não tem valor monetário de mercado como token. Não é uma coleção negociável. O seu valor está no que representa: prova criptográfica numa blockchain pública de que é o/a herdeiro/a designado/a.",
      "(3) É o registo público on-chain da sua designação. Se alguma vez precisar de provar herança — a um advogado, exchange, tribunal — o NFT na sua carteira mais o registo público de transações Polygon é a documentação.",
      "Mantenha a carteira que contém o NFT. Se perder o acesso, perde a prova de designação. (Poderá ainda assim aceder ao segredo via ficheiros de partes + palavra-passe mestra, mas a prova on-chain desaparece.)",
    ],
    6: [
      "Se não tem a palavra-passe mestra: a NoKLock não a pode recuperar por si. A palavra-passe foi definida pela pessoa designante e só ela a conhecia. Procure em qualquer sítio onde possa tê-la deixado — cofre, carta selada, advogado, amigo de confiança, testamento, página de um livro. Sem a palavra-passe mestra, os ficheiros de partes sozinhos não podem reconstruir o segredo. É uma decisão deliberada (a palavra-passe mestra é a chave canónica).",
      "Se não tem ficheiros de partes suficientes: precisa pelo menos do número-limiar (geralmente 3-de-5, por vezes 2-de-3 ou 5-de-9 — o ficheiro manifest.json indica o número exato). Abaixo do limiar, o segredo não pode ser reconstruído. A pessoa designante escolheu ela própria os locais; peça a todos os que possam ter recebido uma parte para partilhar a cópia.",
      "Se não tem carteira e não consegue instalar: pode usar qualquer computador ou telemóvel com app/extensão de carteira. Não há carteira NoKLock-específica — qualquer carteira Polygon padrão funciona (MetaMask, Trust Wallet, Coinbase Wallet, etc.). Se mesmo assim não conseguir, escreva para hello@noklock.app e ajudamos a encontrar solução.",
      "Se está a ler isto 31+ dias após o e-mail de ativação: a nonce única do seu link de reclamação expirou. O NFT continua designado para si on-chain — escreva para hello@noklock.app e emitimos um link de atestação fresco.",
      "Se não tem a certeza se deve prosseguir (ex. suspeita que o designante não pretendia isto, disputas familiares, questões jurídicas): a NoKLock não tem opinião. Pause, consulte advogado ou família, e prossiga apenas quando tiver a certeza. Nada acontece automaticamente só por ter lido esta página.",
    ],
    7: [
      "A NoKLock não tem forma de lhe cobrar dinheiro além do seu custo de gás (~0,05 $). Não há taxa, subscrição ou upgrade premium necessário para reclamar. Se alguém (site, e-mail, pessoa) lhe pedir para pagar à NoKLock pela reclamação em si, é fraude.",
      "A NoKLock não pode revelar nada sobre os outros assuntos da pessoa designante — contas bancárias, outros activos, outras carteiras. A NoKLock não tem nada sobre ela além do que foi colocado no cofre que está prestes a receber.",
      "A NoKLock não pode pressioná-lo/a, impor-lhe um prazo ou tirar-lhe nada. Se ignorar este e-mail por completo, nada lhe acontece. O sistema é unidirecional: dá-lhe uma chave, você decide se a usa.",
      "A NoKLock não pode ver o que está dentro do seu cofre. Mesmo após restaurar, o conteúdo é desencriptado apenas no seu navegador. Não sabemos, não podemos e nunca saberemos o que a pessoa designante lhe deixou.",
      "A NoKLock não o/a pode ajudar com PARA QUE serve o segredo. Se o cofre contém uma frase-semente cripto que dá acesso a uma carteira, o que faz com essa carteira é decisão sua. Não temos papel além de a entregar na forma que a pessoa designante deixou.",
    ],
    8: [
      "Se o segredo era uma frase-semente cripto: transfira os fundos dessa carteira para uma carteira nova que controle, assim que for seguro. A pessoa falecida pode ter partilhado esta frase com o processo de configuração inicial da NoKLock — não há prova de fuga, mas uma carteira nova só sua é a melhor prática. Considere uma carteira de hardware se o valor o justificar.",
      "Se o segredo era uma carta selada ou documento: leia-o. Guarde uma cópia segura. A página Restore é puramente temporária — recarregue e os dados desaparecem.",
      "Diga aos seus próprios familiares. Se hoje é o/a herdeiro/a de alguém, considere designar os seus — a vida é imprevisível. /enrol neste site.",
      "Não precisa de continuar a usar a NoKLock. O seu trabalho aqui está feito. O NFT de herança fica na sua carteira como registo on-chain permanente; nada mais é exigido de si.",
      "Opcional: envie uma nota de agradecimento para hello@noklock.app — ou feedback sobre o que foi confuso, pouco claro, o que poderia ter sido melhor. Ouvimos e melhoramos.",
    ],
    9: [
      "A NoKLock é uma equipa pequena (uma pessoa, totalmente transparente). O protocolo é código on-chain autónomo, não promessas. Pode verificar de forma independente:",
      "(1) Os smart contracts em Polygon. Visite /info → Contracts neste site para cada endereço de contrato NoKLock, cada um ligando ao PolygonScan onde pode ler o código Solidity verificado.",
      "(2) A postura de auditoria. /info → Contracts lista também as contagens de testes (154/154 forge tests), o histórico de auditoria (várias revisões IA independentes em duas passes externas mais auto-revisão interna, SolidityScan em cada contrato, ensaio completo de deploy num fork Polygon local antes do broadcast) e explica linha-a-linha cada bandeira vermelha que um scanner de segurança possa levantar.",
      "(3) A arquitetura. /info → Architecture explica cada afirmação que a NoKLock faz (Autocustódia, Air-gapped, À-prova-de-adulteração, À-prova-de-falsificação, À-prova-de-engenharia-social, À-prova-de-coação, NoKLock-proof) com a base criptográfica de cada uma.",
      "(4) O bug bounty. /info → Contracts → Bug Bounty: relatórios de bugs verificados ganham uma licença Lifetime gratuita; descobertas críticas ganham pagamentos USDC. Queremos olhos no código.",
      "Escreva para hello@noklock.app para tudo o resto. Tome o tempo que precisar.",
    ],
  },
});

const ZH: Doc = clone(EN, {
  title: "若您正在阅读这页，您已被指定为亲属继承人",
  intro:
    "本指南为您而写——继承人。如您已收到 NoKLock 的继承激活邮件，或有人告知您将会收到，请先阅读本页。它以简明语言解释发生了什么、您需要什么以及具体该做什么。请慢慢来。不必着急。",
  headings: {
    0: "1. 刚才发生了什么",
    1: "2. 这是真的还是骗局？",
    2: "3. 您将需要什么",
    3: "4. 分步操作——领取与恢复",
    4: "5. 如果有多位继承人怎么办？",
    5: "6. 继承 NFT——是什么",
    6: "7. 如果我不齐怎么办？",
    7: "8. NoKLock 不能做什么——您的安全边界",
    8: "9. 领取并恢复之后——下一步是什么？",
    9: "10. 独立验证 NoKLock",
  },
  bodies: {
    0: [
      "您认识的某人设置了 NoKLock，以便将一份数字秘密传给您。该秘密可能是加密助记词、密封信件、文档或图像。他/她将您指定为亲属，并设定了在系统将所留之物释放给您之前需要多长的失联期。",
      "该期限现已届满——他/她在配置的完整宽限期（通常 60 天）内未再签到。NoKLock 的链上死亡开关已自动触发，一枚继承 NFT 已为您准备好领取。",
      "请慢慢来。不必着急。系统在您的激活邮件发送之时起 30 天内不会过期。您可以先阅读本指南，请信任的人帮忙判断，核对下方一切，然后再继续。",
    ],
    1: [
      "这是健康的反应。钓鱼邮件随处可见。如何核实其为真：",
      "(1) 您收到的邮件来自 @noklock.app 地址。请在邮件客户端中查看发件人。若来自其他地方，请忽略。",
      "(2) 邮件中的领取链接指向 noklock.app/nok-claim/<一长串十六进制>。将鼠标悬停于该链接（先不要点击），核实地址以 https://noklock.app/ 开头。若指向其他地方，请忽略。",
      "(3) 您可独立核实 NoKLock。请在另一标签页打开 polygonscan.com，搜索 NoKLockEscrow 合约地址（本站 /info → Contracts 中已列出）。您将看到实际部署的 Solidity 源代码，逐行可阅。这不是网站的说辞——这是经核验的协议。",
      "(4) NoKLock 无法向您收取费用。领取无需付款。您可能支付的只是极小额 MATIC 作为链上 Gas（约几美分）。要求超出此金额者皆为骗徒。",
      "(5) NoKLock 无法对您施压。若您什么都不做，对您没有任何影响。系统对您的权力仅限于您自己选择去做的事。",
      "仍不确定：请邮件至 hello@noklock.app。",
    ],
    2: [
      "在点击领取链接之前，请准备这四样东西。您可随时暂停——它们不必在 5 分钟内全部就绪。",
      "第一项——激活邮件本身。其中包含一次性领取链接。请在标签页中保持打开。",
      "第二项——Polygon 网络的加密钱包。若尚无：在手机的 App Store 或 Play Store 安装 Trust Wallet（免费）。打开、创建新钱包、将助记词抄在纸上（切勿键入任何网站），并将纸张妥善保管。继承 NFT 将到达此钱包。",
      "第三项——主密码。指定您的人应在 NoKLock 之外告知过您——当面、书面、密封信件、可信中间人或你们共同商定的方式。NoKLock 从未见过此密码，亦无法为您恢复。若无，请见下文第 7 节。",
      "第四项——份额文件。指定者已将加密文件存放在您可以触及的某处——可能是他/她交给您的笔记本/手机/U 盘上的本地文件夹，也可能是云端链接（Dropbox / Google Drive / OneDrive / IPFS / Arweave）。您需要达到阈值数量（通常为 5 之 3——具体数会告知您）。若不齐，请见第 7 节。",
    ],
    3: [
      "第一步。打开激活邮件中的领取链接。打开的页面（/nok-claim/<nonce>）会引导您完成链上领取本身。",
      "第二步。点击 Connect 连接您的钱包，并在钱包应用中批准连接请求。",
      "第三步。点击 Claim。您的钱包会弹出交易批准窗口，显示极小 Gas 费用（几美分 MATIC）。批准。NoKLock 服务器签发一份证明您为合法领取人的密码学认证；您的钱包将其发送至 Escrow 合约；Escrow 焚毁原 NFT，并向您铸造一枚新的。整个过程约 30 秒，费用约 0.05 美元。",
      "第四步。您现在拥有继承 NFT。该 NFT 本身不包含秘密——它是您是被指定继承人的链上凭证。实际秘密需另行通过主密码 + 份额文件恢复。",
      "第五步。在新标签页打开 noklock.app/restore。",
      "第六步。将份额文件拖入 Restore 页面。若以云链接给出，请逐个打开链接、下载文件、拖入 Restore。",
      "第七步。输入指定者告知您的主密码。",
      "第八步。点击 Restore。秘密完全在您的浏览器内重建——NoKLock 服务器绝不会看到。根据所保护内容，您将看到：12 或 24 个词的助记词（加密钱包）、密封信件的文本、可下载的文档或图像。",
      "完成后请刷新 Restore 页面以从浏览器内存中清除秘密。",
    ],
    4: [
      "有些人会指定多位亲属并设置 M-of-N 投票要求（如 2-of-3）（Premium，自 v0.6 起 — 当前状态请见 /pricing）。这是一种防御机制，防止任何单一继承人被胁迫提前或单独释放遗产。v0.6 之前已注册的保险库仍可由其所有者恢复；重新注册可升级。",
      "如果您是多位继承人之一，您单独的领取并不会释放保险库。在您领取 NFT 后，合约会等待所需数量的其他继承人也领取并签署释放。一旦达到阈值，遗产将向群体开放。",
      "如果您不认识其他被命名的继承人，或怀疑有人在向另一位共同继承人施压签署——停止，并发邮件至 hello@noklock.app。多继承人配置的存在正是为了让单一被攻陷或被胁迫的继承人无法释放遗产。如果您认为共同继承人处于困境，正确的回应是拒绝签署，而不是越过对方。",
      "Restore 页面会显示群体是否仍在等待更多投票。",
    ],
    5: [
      "您收到的 NFT 是灵魂绑定 NFT（ERC-5192 标准）。三个特性对您重要：",
      "(1) 它不可转让。无法被出售、交易、转移到其他钱包、被盗或被查封。一旦铸造到您的钱包，便永远留在那里（或直到您主动销毁）。",
      "(2) 作为代币它没有市场货币价值。它不是可交易的收藏品。其价值在于它所代表的：在公链上的密码学证据，证明您是指定的继承人。",
      "(3) 它是您指定身份的公开链上记录。如果您日后需要证明继承——向律师、交易所、法院——您钱包中的 NFT 加上公开的 Polygon 交易日志就是证明文件。",
      "保留持有 NFT 的钱包。如果您失去对该钱包的访问，您就失去了指定证据。（您仍可能通过份额文件 + 主密码访问秘密，但链上证据已不在。）",
    ],
    6: [
      "如果您没有主密码：NoKLock 无法为您恢复。该密码由指定者设置，只有他/她知道。请在任何可能留下它的地方寻找——保险箱、密封信件、律师、可信朋友、遗嘱、某本书的特定页面。没有主密码，份额文件本身无法重建秘密。这是经过深思熟虑的设计（主密码是规范密钥）。",
      "如果您没有足够的份额文件：您至少需要阈值数量（通常为 5 之 3，有时为 3 之 2 或 9 之 5——manifest.json 文件记载确切数量）。低于阈值，秘密无法重建。指定者自己选择了份额位置；请询问任何可能获得份额的人共享其副本。",
      "如果您没有钱包且无法安装：可以使用任何带有钱包应用或扩展的电脑或手机。没有 NoKLock 专用钱包——任何标准 Polygon 钱包都行（MetaMask、Trust Wallet、Coinbase Wallet 等）。如果实在不行，请邮件 hello@noklock.app 我们将帮助找到方案。",
      "如果您在激活邮件发出 31 天后才阅读此页：您的领取链接中的一次性 nonce 已过期。NFT 在链上仍指定给您——邮件 hello@noklock.app 我们会重新签发一份新的认证链接。",
      "如果您不确定是否应该继续（例如怀疑指定者并不希望如此、家庭纠纷、法律问题）：NoKLock 对此没有意见。暂停、咨询律师或家庭成员，确信之后再继续。仅仅因为您读了这页，并不会自动发生任何事。",
    ],
    7: [
      "除了您自己的 gas 费（约 0.05 美元）之外，NoKLock 无法以任何方式向您收费。领取无需任何费用、订阅或高级升级。任何人（网站、邮件、个人）若要求您为领取本身向 NoKLock 付费，那是骗局。",
      "NoKLock 无法透露任何关于指定者其他事务的信息——他/她的银行账户、其他资产、其他钱包。除了即将给您的保险库内容外，NoKLock 关于他/她什么都没有。",
      "NoKLock 无法施压、设置截止日期或从您那里拿走任何东西。如果您完全忽略此邮件，您不会发生任何事。系统是单向的：它给您一把钥匙，由您决定是否使用。",
      "NoKLock 看不到您保险库内的内容。即使在恢复后，内容也仅在您的浏览器内解密。我们不知道、不能、也永远不会知道指定者留给您什么。",
      "NoKLock 无法帮助您处理秘密的用途。如果保险库包含可访问钱包的加密助记词，您如何处理该钱包由您决定。我们的角色仅限于按指定者留下的形式将其交付给您。",
    ],
    8: [
      "如果秘密是加密助记词：在安全可行时尽快将该钱包内的资金转移到您控制的新钱包。逝者可能在最初的 NoKLock 设置流程中分享过该助记词——没有泄露的证据，但在您独立控制下的新钱包是最佳实践。如果金额值得，考虑使用硬件钱包。",
      "如果秘密是密封信件或文档：阅读它，将副本保存在安全的地方。Restore 页面纯属临时——刷新后数据消失。",
      "告知您自己的亲属。如果您今天是别人的继承人，考虑也指定您自己的——生命无常。请访问本站的 /enrol。",
      "您不必继续使用 NoKLock。您在这里的工作已完成。继承 NFT 作为永久链上记录留在您的钱包中；您无需再做什么。",
      "可选：发送一封感谢信至 hello@noklock.app——或反馈哪里令人困惑、哪里不清楚、哪里可以更好。我们倾听并改进。",
    ],
    9: [
      "NoKLock 是一个小团队（一个人，完全透明）。协议是自主的链上代码，不是承诺。您可以独立验证：",
      "(1) Polygon 上的智能合约。访问本站 /info → Contracts 查看每个 NoKLock 合约地址，每个都链接到 PolygonScan 您可以阅读已验证的 Solidity 源码。",
      "(2) 审计立场。/info → Contracts 还列出测试数量（154/154 forge 测试）、审计历史（多次独立 AI 审查跨两次外部 passes 加内部自审、对每个合约的 SolidityScan 审查、广播前在本地 Polygon 分叉上的完整部署彩排）并逐行解释安全扫描器可能提出的每个红旗。",
      "(3) 架构。/info → Architecture 解释 NoKLock 提出的每一项主张（自我托管、物理隔离、防篡改、防伪造、防社会工程、防胁迫、NoKLock-proof）及每一项的密码学基础。",
      "(4) 漏洞赏金。/info → Contracts → Bug Bounty：经核实的漏洞报告可获得免费的 Lifetime 许可证；关键发现可获得 USDC 支付。我们希望有更多眼睛看代码。",
      "其他任何事都可发邮件至 hello@noklock.app。慢慢来，按您需要的时间。",
    ],
  },
});

const HI: Doc = clone(EN, {
  title: "यदि आप यह पढ़ रहे हैं, तो आपको परिजन (नेक्स्ट-ऑफ़-किन) के रूप में नामित किया गया है",
  intro:
    "यह मार्गदर्शिका आपके लिए है — उत्तराधिकारी। यदि आपको NoKLock से उत्तराधिकार सक्रियण ईमेल मिला है, या किसी ने आपको ऐसा ईमेल आने की सूचना दी है, तो पहले यह पृष्ठ पढ़ें। यह सरल भाषा में बताता है कि क्या हुआ, आपको क्या चाहिए, और आपको ठीक क्या करना है। अपना समय लें। कोई जल्दी नहीं।",
  headings: {
    0: "1. अभी क्या हुआ",
    1: "2. क्या यह असली है या धोखा?",
    // Translations 4-9 appended below the existing 0-3.
    2: "3. आपको क्या-क्या चाहिए होगा",
    3: "4. चरण-दर-चरण — दावा करें और पुनर्स्थापित करें",
    4: "5. यदि कई उत्तराधिकारी हों तो क्या?",
    5: "6. उत्तराधिकार NFT — यह क्या है",
    6: "7. यदि मेरे पास सब कुछ नहीं है तो क्या?",
    7: "8. NoKLock जो नहीं कर सकता — आपकी सुरक्षा सीमाएँ",
    8: "9. दावा करने और पुनर्स्थापित करने के बाद — आगे क्या?",
    9: "10. NoKLock को स्वतंत्र रूप से सत्यापित करें",
  },
  bodies: {
    0: [
      "आपके जान-पहचान वाले किसी व्यक्ति ने NoKLock को एक डिजिटल रहस्य आप तक पहुँचाने के लिए सेट किया। वह रहस्य क्रिप्टो वॉलेट सीड फ़्रेज़, सीलबंद पत्र, दस्तावेज़ या छवि हो सकता है। उन्होंने आपको परिजन के रूप में नामित किया और तय किया कि सिस्टम आपको जो छोड़ा गया है, उसे मुक्त करने से पहले उनकी अनुपस्थिति कितनी लंबी होनी चाहिए।",
      "वह अवधि अब बीत चुकी है — उन्होंने पूरी निर्धारित छूट-अवधि (सामान्यतः 60 दिन) तक चेक-इन नहीं किया। NoKLock का ऑन-चेन डेड-मैन स्विच स्वतः सक्रिय हो गया है, और आपके लिए एक उत्तराधिकार NFT तैयार है।",
      "अपना समय लें। कोई जल्दी नहीं। आपकी सक्रियण ईमेल भेजे जाने के क्षण से 30 दिन तक सिस्टम समाप्त नहीं होगा। आप पहले यह मार्गदर्शिका पढ़ सकते हैं, किसी विश्वसनीय व्यक्ति से पूछ सकते हैं, नीचे दी गई सब चीज़ें सत्यापित कर सकते हैं, और तब आगे बढ़ सकते हैं।",
    ],
    1: [
      "स्वस्थ प्रतिक्रिया। फ़िशिंग ईमेल हर जगह हैं। यह असली है, इसे यूँ जाँचें:",
      "(1) आपको प्राप्त ईमेल @noklock.app पते से आया। अपने ईमेल क्लाइंट में प्रेषक हेडर जाँचें। यदि अन्यत्र से आया हो, अनदेखा करें।",
      "(2) ईमेल का दावा-लिंक noklock.app/nok-claim/<एक लंबा हेक्स स्ट्रिंग> पर जाता है। लिंक पर माउस घुमाएँ (अभी क्लिक न करें) और पुष्टि करें कि पता https://noklock.app/ से शुरू होता है। यदि अन्यत्र इंगित करता हो, अनदेखा करें।",
      "(3) आप NoKLock को स्वतंत्र रूप से सत्यापित कर सकते हैं। एक अलग टैब में polygonscan.com खोलें। NoKLockEscrow अनुबंध पते की खोज करें (इस साइट के /info → Contracts पर अंकित)। आप वास्तव में तैनात Solidity स्रोत कोड पंक्ति-दर-पंक्ति देखेंगे। यह किसी वेबसाइट की कहानी नहीं — यह सत्यापित प्रोटोकॉल है।",
      "(4) NoKLock आपसे कुछ भी शुल्क नहीं ले सकता। दावा करने के लिए कोई भुगतान नहीं। आप जो भी दे सकते हैं वह केवल ब्लॉकचेन गैस हेतु बहुत कम MATIC है (कुछ सेंट)। इससे अधिक माँगने वाला कोई भी ठग है।",
      "(5) NoKLock आप पर दबाव नहीं डाल सकता। यदि आप कुछ नहीं करते, आपके साथ कुछ नहीं होता। सिस्टम के पास आप पर वही शक्ति है जो आप स्वयं उपयोग करना चुनें।",
      "फिर भी अनिश्चित हों: hello@noklock.app पर ईमेल करें।",
    ],
    2: [
      "दावा-लिंक क्लिक करने से पहले, ये चार चीज़ें इकट्ठा करें। आप किसी भी समय रुक सकते हैं — इनमें से किसी को अगले 5 मिनट में तैयार होने की आवश्यकता नहीं।",
      "वस्तु 1 — सक्रियण ईमेल स्वयं। इसमें एक-बार का दावा-लिंक है। टैब में खुला रखें।",
      "वस्तु 2 — Polygon नेटवर्क पर एक क्रिप्टो वॉलेट। यदि अभी तक नहीं है: अपने फ़ोन में App Store या Play Store से Trust Wallet (मुफ़्त) इंस्टॉल करें। खोलें, नया वॉलेट बनाएँ, सीड फ़्रेज़ कागज़ पर लिखें (कभी भी किसी वेबसाइट में न टाइप करें), और कागज़ को सुरक्षित स्थान पर रखें। उत्तराधिकार NFT इसी वॉलेट में आएगा।",
      "वस्तु 3 — मास्टर पासवर्ड। आपको नामित करने वाले व्यक्ति को इसे NoKLock के बाहर आपके साथ साझा करना चाहिए था — आमने-सामने, लिखित रूप में, सीलबंद पत्र में, विश्वसनीय मध्यस्थ के माध्यम से, या किसी अन्य सहमति-तरीके से। NoKLock ने यह पासवर्ड कभी नहीं देखा और इसे आपके लिए पुनः प्राप्त नहीं कर सकता। यदि आपके पास नहीं है, नीचे खंड 7 देखें।",
      "वस्तु 4 — शेयर फ़ाइलें। नामित करने वाले व्यक्ति ने एन्क्रिप्टेड फ़ाइलें ऐसी जगह रखी हैं जहाँ आप पहुँच सकते हैं — ये उनके द्वारा आपको दिए गए लैपटॉप/फ़ोन/USB पर स्थानीय फ़ोल्डर में हो सकती हैं, अथवा क्लाउड लिंक (Dropbox / Google Drive / OneDrive / IPFS / Arweave) के रूप में। आपको एक सीमा-संख्या (आमतौर पर 5 में से 3 — सटीक संख्या आपको बताई गई होगी) चाहिए। यदि सभी आपके पास नहीं हैं, खंड 7 देखें।",
    ],
    3: [
      "चरण 1. अपनी सक्रियण ईमेल से दावा-लिंक खोलें। खुलने वाला पृष्ठ (/nok-claim/<nonce>) आपको ऑन-चेन दावे में मार्गदर्शन करता है।",
      "चरण 2. Connect बटन से अपना वॉलेट कनेक्ट करें। अपनी वॉलेट ऐप में कनेक्शन अनुरोध स्वीकार करें।",
      "चरण 3. Claim पर क्लिक करें। आपका वॉलेट एक छोटी गैस-लागत (कुछ सेंट MATIC) दिखाते हुए लेन-देन अनुमोदन स्क्रीन खोलेगा। स्वीकार करें। NoKLock का सर्वर एक क्रिप्टोग्राफ़िक प्रमाणन साइन करता है कि आप वैध दावेदार हैं; आपका वॉलेट उसे Escrow अनुबंध को भेजता है; Escrow मूल NFT को जला देता है और आपको एक नया मिंट करता है। पूरी प्रक्रिया लगभग 30 सेकंड लेती है और लगभग $0.05 का खर्च आता है।",
      "चरण 4. अब आपके पास उत्तराधिकार NFT है। यह NFT अकेले रहस्य नहीं रखता — यह आपका ऑन-चेन प्रमाण है कि आप नामित उत्तराधिकारी हैं। वास्तविक रहस्य मास्टर पासवर्ड + शेयर फ़ाइलों के माध्यम से अलग से पुनर्स्थापित होता है।",
      "चरण 5. नए टैब में noklock.app/restore खोलें।",
      "चरण 6. शेयर फ़ाइलों को Restore पृष्ठ पर छोड़ें। यदि क्लाउड लिंक के रूप में दी गई थीं: प्रत्येक लिंक खोलें, फ़ाइल डाउनलोड करें, फिर Restore पर छोड़ें।",
      "चरण 7. नामित व्यक्ति द्वारा आपको साझा किया गया मास्टर पासवर्ड दर्ज करें।",
      "चरण 8. Restore पर क्लिक करें। रहस्य पूरी तरह आपके ब्राउज़र के अंदर पुनर्निर्मित होता है — NoKLock सर्वर इसे कभी नहीं देखते। संरक्षित सामग्री के अनुसार आप देखेंगे: 12 या 24-शब्द वाक्यांश (क्रिप्टो वॉलेट), सीलबंद पत्र का पाठ, डाउनलोड-योग्य दस्तावेज़ या छवि।",
      "समाप्त होने पर ब्राउज़र मेमोरी से रहस्य साफ़ करने के लिए Restore पृष्ठ पुनः लोड करें।",
    ],
    4: [
      "कुछ लोग M-में-N मतदान आवश्यकता (जैसे 3 में से 2) के साथ कई परिजन नामित करते हैं (Premium, v0.6 से आगे — वर्तमान स्थिति के लिए /pricing देखें)। यह किसी एक उत्तराधिकारी को विरासत समय से पहले या अकेले जारी करने के लिए मजबूर करने के विरुद्ध एक रक्षा है। v0.6 से पहले पंजीकृत वॉल्ट उनके मालिक द्वारा पुनर्स्थापित किए जा सकते हैं; अपग्रेड के लिए पुनः-नामांकन करें।",
      "यदि आप कई उत्तराधिकारियों में से एक हैं, तो आपका अकेला दावा वॉल्ट को जारी नहीं करता। आपके NFT दावे के बाद, अनुबंध आवश्यक संख्या में अन्य उत्तराधिकारियों के दावा करने और रिहाई पर हस्ताक्षर करने की प्रतीक्षा करता है। थ्रेशोल्ड पूरा होने पर, समूह के लिए विरासत खुलती है।",
      "यदि आप अन्य नामित उत्तराधिकारियों को नहीं पहचानते, या किसी पर एक सह-उत्तराधिकारी पर हस्ताक्षर करने का दबाव डालने का संदेह है — रुकें और hello@noklock.app पर ईमेल करें। मल्टी-उत्तराधिकारी सेटअप ठीक इसलिए मौजूद हैं ताकि एक अकेला समझौता किया गया या मजबूर उत्तराधिकारी विरासत न दे सके। यदि आपको लगता है कि एक सह-उत्तराधिकारी संकट में है, तो सही उत्तर है हस्ताक्षर से इनकार करना — उसके संकट पर पर्दा डालना नहीं।",
      "Restore पृष्ठ बताएगा यदि समूह अभी और मतों की प्रतीक्षा कर रहा है।",
    ],
    5: [
      "आपको मिलने वाला NFT एक सोल-बाउंड NFT है (ERC-5192 मानक)। आपके लिए तीन गुण महत्वपूर्ण हैं:",
      "(1) यह गैर-हस्तांतरणीय है। इसे बेचा, बदला, अन्य वॉलेट में स्थानांतरित, चुराया या जब्त नहीं किया जा सकता। एक बार आपके वॉलेट में मिंट हो जाने पर, यह हमेशा वहीं रहेगा (या जब तक आप सक्रिय रूप से इसे बर्न न करें)।",
      "(2) टोकन के रूप में इसका कोई मौद्रिक बाजार मूल्य नहीं है। यह व्यापार योग्य संग्रहणीय वस्तु नहीं है। इसका मूल्य इसमें है जो यह दर्शाता है: सार्वजनिक ब्लॉकचेन पर क्रिप्टोग्राफ़िक प्रमाण कि आप नामित उत्तराधिकारी हैं।",
      "(3) यह आपके पदनाम का सार्वजनिक ऑन-चेन रिकॉर्ड है। यदि आपको कभी विरासत साबित करनी पड़े — किसी वकील, एक्सचेंज, अदालत के लिए — आपके वॉलेट में मौजूद NFT और सार्वजनिक Polygon लेन-देन लॉग ही दस्तावेज़ हैं।",
      "जिस वॉलेट में NFT है उसे रखें। यदि आप उस वॉलेट तक पहुँच खो देते हैं, तो पदनाम का प्रमाण खो देंगे। (आप अभी भी शेयर फ़ाइलों + मास्टर पासवर्ड के माध्यम से रहस्य तक पहुँच पा सकते हैं, लेकिन ऑन-चेन प्रमाण चला गया।)",
    ],
    6: [
      "यदि आपके पास मास्टर पासवर्ड नहीं है: NoKLock आपके लिए इसे पुनः प्राप्त नहीं कर सकता। पासवर्ड नामित करने वाले व्यक्ति द्वारा सेट किया गया था और केवल वही जानता था। हर जगह देखें जहाँ वे आपके लिए छोड़ सकते थे — सेफ डिपॉज़िट बॉक्स, सीलबंद पत्र, वकील, विश्वसनीय मित्र, वसीयत, किसी पुस्तक का पन्ना। मास्टर पासवर्ड के बिना, शेयर फ़ाइलें अकेले रहस्य का पुनर्निर्माण नहीं कर सकतीं। यह एक जानबूझकर डिज़ाइन निर्णय है (मास्टर पासवर्ड कैनोनिकल कुंजी है)।",
      "यदि आपके पास पर्याप्त शेयर फ़ाइलें नहीं हैं: आपको कम से कम थ्रेशोल्ड संख्या (आमतौर पर 5 में से 3, कभी-कभी 3 में से 2 या 9 में से 5 — manifest.json फ़ाइल सटीक संख्या बताती है) चाहिए। थ्रेशोल्ड से नीचे, रहस्य का पुनर्निर्माण नहीं हो सकता। नामित करने वाले व्यक्ति ने अपने शेयर स्थान स्वयं चुने थे; जिनके पास भी शेयर हो सकता है उनसे प्रति साझा करने को कहें।",
      "यदि आपके पास वॉलेट नहीं है और इंस्टॉल नहीं कर सकते: आप वॉलेट ऐप या एक्सटेंशन वाले किसी भी कंप्यूटर या फ़ोन का उपयोग कर सकते हैं। कोई NoKLock-विशिष्ट वॉलेट नहीं है — कोई भी मानक Polygon वॉलेट काम करता है (MetaMask, Trust Wallet, Coinbase Wallet, आदि)। यदि वास्तव में नहीं कर सकते, hello@noklock.app पर ईमेल करें और हम समाधान खोजने में मदद करेंगे।",
      "यदि आप सक्रियण ईमेल के 31+ दिन बाद यह पढ़ रहे हैं: आपके दावा-लिंक में एक-बार की नोंस समाप्त हो गई है। NFT अभी भी ऑन-चेन आपके लिए नामित है — hello@noklock.app पर ईमेल करें और हम एक नया प्रमाणन लिंक जारी कर सकते हैं।",
      "यदि आप आगे बढ़ने के बारे में अनिश्चित हैं (जैसे संदेह है कि नामित करने वाले का यह इरादा नहीं था, पारिवारिक विवाद, कानूनी प्रश्न): NoKLock की इन पर कोई राय नहीं। रुकें, वकील या परिवार के सदस्य से सलाह लें, और तभी आगे बढ़ें जब आप निश्चित हों। इस पृष्ठ को पढ़ने मात्र से कुछ भी स्वतः नहीं होता।",
    ],
    7: [
      "NoKLock आपके अपने गैस लागत (~$0.05) से अधिक कोई पैसा वसूल करने का कोई तरीका नहीं रखता। दावा करने के लिए कोई शुल्क, सदस्यता या प्रीमियम अपग्रेड आवश्यक नहीं। यदि कोई (वेबसाइट, ईमेल, व्यक्ति) आपसे दावे के लिए NoKLock को भुगतान करने को कहता है, यह एक धोखा है।",
      "NoKLock नामित करने वाले के अन्य मामलों — उनके बैंक खाते, अन्य संपत्तियाँ, अन्य वॉलेट — के बारे में कुछ भी नहीं बता सकता। NoKLock उनके बारे में उस वॉल्ट से अधिक कुछ नहीं रखता जो आप प्राप्त करने वाले हैं।",
      "NoKLock आप पर दबाव नहीं डाल सकता, समय-सीमा नहीं रख सकता, या आपसे कुछ नहीं ले सकता। यदि आप इस ईमेल को पूरी तरह अनदेखा करते हैं, आपको कुछ नहीं होता। सिस्टम एकतरफ़ा है: यह आपको एक कुंजी देता है, उपयोग करना या न करना आप पर है।",
      "NoKLock यह नहीं देख सकता कि आपके वॉल्ट के अंदर क्या है। पुनर्स्थापना के बाद भी, सामग्री केवल आपके ब्राउज़र के अंदर डिक्रिप्ट होती है। हम नहीं जानते, नहीं जान सकते, और कभी नहीं जानेंगे कि नामित करने वाले ने आपके लिए क्या छोड़ा।",
      "रहस्य किसलिए है — इसमें NoKLock आपकी मदद नहीं कर सकता। यदि वॉल्ट में क्रिप्टो सीड फ़्रेज़ है जो वॉलेट तक पहुँच देता है, उस वॉलेट का आप क्या करते हैं यह आपका निर्णय है। हमारी भूमिका इसे उसी रूप में आप तक पहुँचाने तक है जैसा नामित करने वाले ने छोड़ा।",
    ],
    8: [
      "यदि रहस्य क्रिप्टो सीड फ़्रेज़ था: जैसे ही सुरक्षित हो, उस वॉलेट के फंड को अपने नियंत्रण में मौजूद नए वॉलेट में स्थानांतरित करें। मृतक ने यह सीड फ़्रेज़ मूल NoKLock सेटअप प्रक्रिया के साथ साझा किया हो सकता है — लीक का कोई प्रमाण नहीं, लेकिन आपके अकेले नियंत्रण में नया वॉलेट सर्वोत्तम अभ्यास है। राशि उचित हो तो हार्डवेयर वॉलेट पर विचार करें।",
      "यदि रहस्य सीलबंद पत्र या दस्तावेज़ था: इसे पढ़ें। एक प्रति सुरक्षित जगह सहेजें। Restore पृष्ठ विशुद्ध रूप से अस्थायी है — पुनः लोड करें और डेटा गायब।",
      "अपने स्वयं के परिजनों को बताएँ। यदि आज आप किसी के उत्तराधिकारी नामित हैं, अपने स्वयं के नामित करने पर विचार करें — जीवन अप्रत्याशित है। इस साइट पर /enrol।",
      "आपको NoKLock का उपयोग जारी रखने की आवश्यकता नहीं है। यहाँ आपका काम हो गया है। उत्तराधिकार NFT आपके वॉलेट में स्थायी ऑन-चेन रिकॉर्ड के रूप में रहता है; आपसे और कुछ अपेक्षित नहीं।",
      "वैकल्पिक: hello@noklock.app पर धन्यवाद भेजें — या क्या भ्रामक था, क्या अस्पष्ट था, क्या बेहतर हो सकता था — पर प्रतिक्रिया। हम सुनते हैं और सुधारते हैं।",
    ],
    9: [
      "NoKLock एक छोटी टीम है (एक व्यक्ति, पूरी तरह पारदर्शी)। प्रोटोकॉल स्वायत्त ऑन-चेन कोड है, वादे नहीं। आप स्वतंत्र रूप से सत्यापित कर सकते हैं:",
      "(1) Polygon पर स्मार्ट कॉन्ट्रैक्ट्स। इस साइट के /info → Contracts पर जाएँ — प्रत्येक NoKLock कॉन्ट्रैक्ट पता PolygonScan से लिंक है जहाँ आप सत्यापित Solidity स्रोत पढ़ सकते हैं।",
      "(2) ऑडिट स्थिति। /info → Contracts टेस्ट गिनती (154/154 forge tests), ऑडिट इतिहास (कई स्वतंत्र AI समीक्षाएँ दो बाहरी पास + आंतरिक स्व-समीक्षा, हर अनुबंध पर SolidityScan, ब्रॉडकास्ट से पहले स्थानीय Polygon फ़ोर्क पर पूर्ण डिप्लॉय रिहर्सल) सूचीबद्ध करता है और किसी सुरक्षा स्कैनर द्वारा उठाए जा सकने वाले प्रत्येक रेड फ़्लैग को पंक्ति-दर-पंक्ति समझाता है।",
      "(3) आर्किटेक्चर। /info → Architecture NoKLock के प्रत्येक दावे (स्व-अभिरक्षी, एयर-गैप्ड, टैम्पर-प्रूफ, स्पूफ-प्रूफ, सोशल-इंजीनियरिंग-प्रूफ, ड्यूरेस-प्रूफ, NoKLock-प्रूफ) को क्रिप्टोग्राफ़िक आधार सहित समझाता है।",
      "(4) बग बाउंटी। /info → Contracts → Bug Bounty: सत्यापित बग रिपोर्ट निःशुल्क Lifetime लाइसेंस अर्जित करती हैं; क्रिटिकल खोजें USDC भुगतान। हम कोड पर आँखें चाहते हैं।",
      "किसी भी अन्य चीज़ के लिए hello@noklock.app पर ईमेल करें। आप जितना समय चाहें लें।",
    ],
  },
});

const DOCS: Record<Lang, Doc> = { en: EN, de: DE, fr: FR, pt: PT, "zh-Hans": ZH, hi: HI };

const READ_FULL_GUIDE: Record<Lang, string> = {
  en:        "Want the full app guide? Read the user manual →",
  de:        "Vollständige App-Anleitung gewünscht? Zum Benutzerhandbuch →",
  fr:        "Le guide complet de l'application ? Voir le manuel d'utilisation →",
  pt:        "Quer o guia completo da aplicação? Ver o manual do utilizador →",
  "zh-Hans": "想要完整的应用指南？阅读用户手册 →",
  hi:        "पूरी ऐप मार्गदर्शिका चाहिए? उपयोगकर्ता पुस्तिका पढ़ें →",
};

// Single calm note — English is the authoritative version, other languages
// are provided for convenience. Replaces the (unapproved) "translation
// pending native review" warnings. Matches the global stance: English
// governs every screen and legal text; localised copy is a convenience.
const AUTHORITATIVE_NOTE: Record<Lang, string> = {
  en:        "English is the authoritative version of this guide. Other languages are provided for convenience.",
  de:        "Englisch ist die verbindliche Fassung dieser Anleitung. Andere Sprachen werden zur Bequemlichkeit angeboten.",
  fr:        "L'anglais est la version faisant foi de ce guide. Les autres langues sont fournies pour votre commodité.",
  pt:        "O inglês é a versão autoritativa deste guia. Outros idiomas são fornecidos por conveniência.",
  "zh-Hans": "英文为本指南的权威版本。其他语言仅为方便提供。",
  hi:        "इस मार्गदर्शिका का अधिकृत संस्करण अंग्रेज़ी है। अन्य भाषाएँ सुविधा के लिए प्रदान की गई हैं।",
};

// 0.8.0 — "When you are ready" closing box, lifted out of hardcoded English
// into per-lang lookup tables (same pattern as READ_FULL_GUIDE /
// AUTHORITATIVE_NOTE above). DE/FR/PT curated; zh-Hans/hi machine-translation
// first-pass (the calm AUTHORITATIVE_NOTE footnote already states English
// governs, so no per-string draft warning is added — consistent with how the
// rest of this guide handles zh/hi since 0.3.0). The body wraps an inline
// <Link> to /heir and a <code> token, so it is split into prefix/suffix
// halves; the noklock.app/heir URL and /nok-claim/<nonce> token stay verbatim.
const READY_HEADING: Record<Lang, string> = {
  en:        "When you are ready",
  de:        "Wenn Sie bereit sind",
  fr:        "Quand vous êtes prêt·e",
  pt:        "Quando estiver pronto/a",
  "zh-Hans": "当您准备好时",
  hi:        "जब आप तैयार हों",
};
// Body prefix (before the inline noklock.app/heir link) — ends with a space.
const READY_BODY_PREFIX: Record<Lang, string> = {
  en:        "Open the claim link from your activation email. The claim flow at /nok-claim/<nonce> will walk you through the steps in section 4 above. You can return to this guide at any time at ",
  de:        "Öffnen Sie den Anspruchs-Link aus Ihrer Aktivierungs-E-Mail. Der Anspruchs-Ablauf unter /nok-claim/<nonce> führt Sie durch die Schritte in Abschnitt 4 oben. Sie können jederzeit zu dieser Anleitung zurückkehren unter ",
  fr:        "Ouvrez le lien de réclamation de votre email d'activation. Le flux de réclamation à /nok-claim/<nonce> vous guide à travers les étapes de la section 4 ci-dessus. Vous pouvez revenir à ce guide à tout moment sur ",
  pt:        "Abra a ligação de reclamação do seu email de ativação. O fluxo de reclamação em /nok-claim/<nonce> acompanha-o pelos passos da secção 4 acima. Pode voltar a este guia a qualquer momento em ",
  "zh-Hans": "打开激活邮件中的领取链接。位于 /nok-claim/<nonce> 的领取流程将引导您完成上方第 4 节的步骤。您随时可在此处返回本指南：",
  hi:        "अपने सक्रियण ईमेल से दावा लिंक खोलें。/nok-claim/<nonce> पर दावा प्रवाह आपको ऊपर खंड 4 के चरणों से ले जाएगा। आप किसी भी समय इस मार्गदर्शिका पर लौट सकते हैं: ",
};
// Body suffix (after the inline link). Empty where the sentence already ended
// at the URL; a trailing period otherwise.
const READY_BODY_SUFFIX: Record<Lang, string> = {
  en:        ".",
  de:        ".",
  fr:        ".",
  pt:        ".",
  "zh-Hans": "。",
  hi:        "।",
};
const READY_BTN_MANUAL: Record<Lang, string> = {
  en:        "Full app guide →",
  de:        "Vollständige App-Anleitung →",
  fr:        "Guide complet de l'application →",
  pt:        "Guia completo da aplicação →",
  "zh-Hans": "完整应用指南 →",
  hi:        "पूरी ऐप मार्गदर्शिका →",
};
const READY_BTN_INFO: Record<Lang, string> = {
  en:        "Learn more about NoKLock →",
  de:        "Mehr über NoKLock erfahren →",
  fr:        "En savoir plus sur NoKLock →",
  pt:        "Saber mais sobre o NoKLock →",
  "zh-Hans": "了解更多关于 NoKLock →",
  hi:        "NoKLock के बारे में और जानें →",
};
const READY_BTN_EMAIL: Record<Lang, string> = {
  en:        "Email us →",
  de:        "Schreiben Sie uns →",
  fr:        "Écrivez-nous →",
  pt:        "Fale connosco →",
  "zh-Hans": "给我们发邮件 →",
  hi:        "हमें ईमेल करें →",
};

const TAG_CLASS: Record<NonNullable<Section["tag"]>, string> = {
  info: "border-accent-cyan/30 bg-bg-deepest",
  warn: "border-amber-500/40 bg-amber-950/10",
  ok:   "border-accent-green/30 bg-bg-deepest",
};

/** The two pages a heir actually uses — linked prominently at the top, in the
 *  Jump-to box, and inside §4. Localised in every supported language (Daniel
 *  2026-06-16: changed the English, so change the others too). */
interface HeirToolsStrings {
  readonly restoreLabel: string; readonly claimLabel: string;
  readonly restoreDesc: string;  readonly claimDesc: string;
  readonly topTitle: string;     readonly topNote: string;
  readonly jumpTo: string;       readonly section4: string;
}
const HEIR_TOOLS_T: Record<Lang, HeirToolsStrings> = {
  en: {
    restoreLabel: "Restore a vault",
    claimLabel: "Operator-free claim page",
    restoreDesc: "The full heir-restore flow — drop your envelope + shares + master password. Includes the Form-B-free local M-of-N quorum if NoKLock is unreachable.",
    claimDesc: "A single self-contained file that reads the public chain with ZERO NoKLock servers — works even if NoKLock is gone. Right-click → Save it to a USB stick.",
    topTitle: "The two pages you'll use to claim & restore",
    topNote: "Save the operator-free page now — it keeps working even if NoKLock disappears.",
    jumpTo: "Go straight to a tool:",
    section4: "Open the pages this walkthrough uses — the restore page (online claim then offline restore) and the operator-free claim page (chain-only, no servers):",
  },
  de: {
    restoreLabel: "Tresor wiederherstellen",
    claimLabel: "Betreiberfreie Anspruchsseite",
    restoreDesc: "Der vollständige Erben-Wiederherstellungsablauf — legen Sie Umschlag + Anteile + Master-Passwort ab. Enthält das Form-B-freie lokale M-von-N-Quorum, falls NoKLock nicht erreichbar ist.",
    claimDesc: "Eine einzige eigenständige Datei, die die öffentliche Blockchain mit NULL NoKLock-Servern liest — funktioniert sogar, wenn NoKLock verschwunden ist. Rechtsklick → auf einen USB-Stick speichern.",
    topTitle: "Die zwei Seiten für Anspruch & Wiederherstellung",
    topNote: "Speichern Sie die betreiberfreie Seite jetzt — sie funktioniert weiter, selbst wenn NoKLock verschwindet.",
    jumpTo: "Direkt zu einem Werkzeug:",
    section4: "Öffnen Sie die Seiten, die diese Anleitung verwendet — die Wiederherstellungsseite (Online-Anspruch, dann Offline-Wiederherstellung) und die betreiberfreie Anspruchsseite (nur Blockchain, keine Server):",
  },
  fr: {
    restoreLabel: "Restaurer un coffre",
    claimLabel: "Page de réclamation sans opérateur",
    restoreDesc: "Le flux complet de restauration de l'héritier — déposez votre enveloppe + parts + mot de passe maître. Inclut le quorum M-sur-N local sans Form B si NoKLock est injoignable.",
    claimDesc: "Un fichier autonome unique qui lit la blockchain publique avec ZÉRO serveur NoKLock — fonctionne même si NoKLock a disparu. Clic droit → enregistrez-le sur une clé USB.",
    topTitle: "Les deux pages pour réclamer et restaurer",
    topNote: "Enregistrez la page sans opérateur maintenant — elle continue de fonctionner même si NoKLock disparaît.",
    jumpTo: "Aller directement à un outil :",
    section4: "Ouvrez les pages utilisées par ce guide — la page de restauration (réclamation en ligne puis restauration hors ligne) et la page de réclamation sans opérateur (blockchain uniquement, aucun serveur) :",
  },
  pt: {
    restoreLabel: "Restaurar um cofre",
    claimLabel: "Página de reivindicação sem operador",
    restoreDesc: "O fluxo completo de restauração do herdeiro — solte o seu envelope + partes + palavra-passe mestra. Inclui o quórum M-de-N local sem Form B se a NoKLock estiver inacessível.",
    claimDesc: "Um único ficheiro autónomo que lê a blockchain pública com ZERO servidores NoKLock — funciona mesmo se a NoKLock desaparecer. Clique direito → guarde-o numa pen USB.",
    topTitle: "As duas páginas para reivindicar e restaurar",
    topNote: "Guarde a página sem operador agora — ela continua a funcionar mesmo se a NoKLock desaparecer.",
    jumpTo: "Vá diretamente para uma ferramenta:",
    section4: "Abra as páginas que este passo-a-passo usa — a página de restauração (reivindicação online e depois restauração offline) e a página de reivindicação sem operador (apenas blockchain, sem servidores):",
  },
  "zh-Hans": {
    restoreLabel: "恢复保险库",
    claimLabel: "无运营商认领页面",
    restoreDesc: "完整的继承人恢复流程——拖入您的信封 + 份额 + 主密码。如果无法访问 NoKLock，还包括无需 Form B 的本地 M-of-N 法定人数。",
    claimDesc: "一个独立的单一文件，读取公共区块链，零 NoKLock 服务器——即使 NoKLock 消失也能工作。右键 → 保存到 U 盘。",
    topTitle: "您用于认领和恢复的两个页面",
    topNote: "立即保存无运营商页面——即使 NoKLock 消失它仍可使用。",
    jumpTo: "直接前往工具：",
    section4: "打开本演练使用的页面——恢复页面（在线认领然后离线恢复）和无运营商认领页面（仅区块链，无服务器）：",
  },
  hi: {
    restoreLabel: "वॉल्ट पुनर्स्थापित करें",
    claimLabel: "ऑपरेटर-मुक्त दावा पृष्ठ",
    restoreDesc: "पूर्ण उत्तराधिकारी-पुनर्स्थापना प्रवाह — अपना envelope + शेयर + मास्टर पासवर्ड डालें। यदि NoKLock अनुपलब्ध हो तो Form B-मुक्त स्थानीय M-of-N कोरम भी शामिल है।",
    claimDesc: "एक एकल स्वतंत्र फ़ाइल जो शून्य NoKLock सर्वर के साथ सार्वजनिक ब्लॉकचेन पढ़ती है — NoKLock के चले जाने पर भी काम करती है। राइट-क्लिक → इसे USB स्टिक पर सहेजें।",
    topTitle: "दावा और पुनर्स्थापना के लिए दो पृष्ठ",
    topNote: "ऑपरेटर-मुक्त पृष्ठ अभी सहेजें — NoKLock के गायब होने पर भी यह काम करता रहता है।",
    jumpTo: "सीधे किसी टूल पर जाएँ:",
    section4: "इस walkthrough में उपयोग किए गए पृष्ठ खोलें — पुनर्स्थापना पृष्ठ (ऑनलाइन दावा फिर ऑफ़लाइन पुनर्स्थापना) और ऑपरेटर-मुक्त दावा पृष्ठ (केवल ब्लॉकचेन, कोई सर्वर नहीं):",
  },
};

function HeirToolPills({ lang }: { lang: Lang }): JSX.Element {
  const t = HEIR_TOOLS_T[lang] ?? HEIR_TOOLS_T.en;
  return (
    <div className="not-prose flex flex-wrap gap-2">
      <Link
        to="/heir/restore"
        title={t.restoreDesc}
        className="inline-flex items-center gap-1 rounded-full border border-accent-teal/50 bg-accent-teal/10 px-3 py-1.5 text-sm font-semibold text-accent-teal hover:bg-accent-teal/20"
      >
        {t.restoreLabel} →
      </Link>
      <a
        href="/heir-claim.html"
        target="_blank"
        rel="noopener"
        title={t.claimDesc}
        className="inline-flex items-center gap-1 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-3 py-1.5 text-sm font-semibold text-accent-cyan hover:bg-accent-cyan/20"
      >
        {t.claimLabel} ↗
      </a>
    </div>
  );
}

export function HeirGuide(): JSX.Element {
  useDocumentHead("/heir");
  const { lang } = useT();
  const doc = DOCS[lang] ?? EN;
  const tools = HEIR_TOOLS_T[lang] ?? HEIR_TOOLS_T.en;

  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4 print-doc">
      <header>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span className="tier-badge bg-cyan-700/30 text-accent-cyan border border-accent-cyan/40">Heir guide</span>
          <span className="text-xs text-text-muted">Plain language · No wallet required to read</span>
          <span className="ml-auto flex items-center gap-2 no-print">
            <PrintAsPDFButton compact />
            <LangSelect compact stayOnPage />
          </span>
        </div>
        <h1 className="text-3xl font-bold font-display"><span className="grad">{doc.title}</span></h1>
        <p className="text-text-on-dark/90 mt-3">{doc.intro}</p>
        <div className="mt-4 rounded-lg border border-accent-teal/30 bg-bg-deepest p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">{tools.topTitle}</div>
          <HeirToolPills lang={lang} />
          <p className="text-[11px] text-text-muted mt-2">{tools.topNote}</p>
        </div>
        <p className="text-sm mt-3">
          <Link to="/manual" className="text-accent-cyan hover:underline">{READ_FULL_GUIDE[lang] ?? READ_FULL_GUIDE.en}</Link>
        </p>
        <p className="text-[11px] text-text-muted mt-3 border-t border-bg-surface/40 pt-2">
          {AUTHORITATIVE_NOTE[lang] ?? AUTHORITATIVE_NOTE.en}
        </p>
      </header>

      <nav className="card text-sm" aria-label="Jump to">
        <div className="font-bold font-display mb-2">Jump to</div>
        <ol className="grid sm:grid-cols-2 gap-y-1">
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-accent-cyan hover:underline">{s.heading}</a>
            </li>
          ))}
        </ol>
        <div className="mt-3 pt-3 border-t border-bg-surface/40">
          <div className="text-xs text-text-muted mb-1.5">{tools.jumpTo}</div>
          <HeirToolPills lang={lang} />
        </div>
      </nav>

      {doc.sections.map((s) => (
        <section key={s.id} id={s.id} className={`card border ${s.tag ? TAG_CLASS[s.tag] : ""} scroll-mt-20`}>
          <h2 className="text-xl font-bold font-display mb-3"><span className="grad">{s.heading}</span></h2>
          <div className="space-y-2 text-sm text-text-on-dark/85">
            {s.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {s.id === "step-by-step" && (
            <div className="mt-4 pt-3 border-t border-bg-surface/40">
              <div className="text-xs text-text-muted mb-1.5">{tools.section4}</div>
              <HeirToolPills lang={lang} />
            </div>
          )}
        </section>
      ))}

      <section className="card text-center border-accent-teal/40">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">{READY_HEADING[lang] ?? READY_HEADING.en}</span></h2>
        {/* 0.8.0 — localized via per-lang tables. The /nok-claim/<nonce> token
            is now inlined in the prefix string (universal route token); the
            noklock.app/heir link stays a real <Link>, framed by the
            prefix/suffix halves so the sentence reads naturally per locale. */}
        <p className="text-sm text-text-on-dark/85 mb-4">
          {READY_BODY_PREFIX[lang] ?? READY_BODY_PREFIX.en}
          <Link to="/heir" className="text-accent-cyan hover:underline">noklock.app/heir</Link>
          {READY_BODY_SUFFIX[lang] ?? READY_BODY_SUFFIX.en}
        </p>
        <div className="flex flex-wrap gap-3 justify-center text-sm no-print">
          <Link to="/manual" className="btn btn-secondary">{READY_BTN_MANUAL[lang] ?? READY_BTN_MANUAL.en}</Link>
          <Link to="/info" className="btn btn-secondary">{READY_BTN_INFO[lang] ?? READY_BTN_INFO.en}</Link>
          <a href="mailto:hello@noklock.app" className="btn btn-secondary">{READY_BTN_EMAIL[lang] ?? READY_BTN_EMAIL.en}</a>
        </div>
      </section>

      <p className="text-text-muted text-xs text-center">
        Reach us at <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.
      </p>
    </article>
  );
}
