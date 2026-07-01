// @version 0.10.0 @date 2026-06-08  ·  Deutsch — funnel, full keyed set
// 0.10.0 — Daniel 2026-06-08 round-5: managed-hero tile copy mirror — 3 key
//         value updates from en.ts (hero.managed.tiles.provision.body
//         expanded with Privy secure-enclave detail; hero.managed.tiles.
//         heirEmail.body appended "(also applies to self-custody model)";
//         hero.managed.tiles.escape.title changed from "Always escape-
//         hatchable" to "Self-custody escape hatch"). Machine-translation
//         starting point — TODO native DE review.
// @version 0.9.0 @date 2026-06-08  ·  Deutsch — funnel, full keyed set
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys mirroring
//         en.ts 0.9.0 (tier.badge.{standardPlus,premiumPlus},
//         tier.requires.{standard,premium}, tier.upgrade.cta).
//         Machine-translation starting point — TODO native DE review.
// @version 0.8.0 @date 2026-06-08  ·  Deutsch — funnel, full keyed set
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys
//         mirroring en.ts 0.8.0 (buy-once + founder accordion, primary mode
//         selector, bottom summary block). Machine-translation starting
//         point — TODO native DE review.
// @version 0.7.0 @date 2026-06-08  ·  Deutsch — funnel, full keyed set
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys
//         mirroring en.ts 0.7.0 (tier-box + tabs + summary block for the
//         Pricing rework Agent 1 is wiring). Machine-translation starting
//         point — TODO native DE review.
// @version 0.6.0 @date 2026-06-08  ·  Deutsch — funnel, full keyed set
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep. 19 new
//         keys mirroring en.ts 0.6.0. Machine-translation starting point —
//         TODO native review.
// @version 0.5.0 @date 2026-06-02  ·  Deutsch — funnel, full keyed set
// 0.5.0 — Daniel 2026-06-02: hero/pricing-eyebrow keys added for new copy
//         landing in Landing.tsx 0.20.0 (Phase-2 multi-change pass). Machine-
//         translation starting point mirroring the existing tone of this
//         locale — Native review queued. Block of additions identical to
//         en.ts 0.5.0 (60 new keys). Pricing eyebrow shipped now so the
//         lang sweep is one round.
// 0.4.0 — Daniel 2026-06-02: re-review sweep — removed `footer.updates`
//         (Footer.tsx renders no Updates link) and `nav.connect`
//         (TopNav ConnectWallet uses hard-coded English).
// 0.3.0 — Daniel 2026-06-02: orphan-key sweep. Removed 21 keys whose JSX
//         call-sites were replaced with canonical English plain text during
//         the 2026-06-02 human-voice rewrite pass (hero.* H1-block + lede +
//         fsm + neverSees + ctaEnrol/See; tech.title + tech.subtitle;
//         card.airgap/threshold/ipfs/recover.k/t/b; diag.* labels).
//         hero.chip + card.readHow retained. Added nav.whitelabel +
//         nav.corporate (brand strings).
export const de: Record<string, string> = {
  "hero.chip": "Menschliche Intelligenz. Null KI an Ihrem Seed. Einfach solide Mathematik.",

  // 0.5.0 — Hero H1 / taglines / H2.
  "hero.h1": "Ihre Seed-Phrase. Ihr Testament. Ihr digitales Leben.",
  "hero.tagline": "Jenseits der Wallet, über dem Passwort-Manager, vor dem Anwalt.",
  "hero.h2": "Jede Wallet sichern & vererben — Bitcoin, Solana, Ethereum, jede Chain.",
  "hero.mainTagline": "Verlieren Sie nichts Wichtiges — nicht an die Zeit, nicht ans Gedächtnis, nicht an die Falschen.",
  "hero.subTagline": "Self-Custody für krypto-erfahrene Nutzer ist heute live. Managed-Modus für alle anderen kommt bald.",

  // Hero tile grid (Self-Custody).
  "hero.tiles.crypto.title": "Krypto & Finanzen",
  "hero.tiles.crypto.bullet1": "Seed-Phrasen",
  "hero.tiles.crypto.bullet2": "Hardware-Wallet-Wiederherstellungsblätter",
  "hero.tiles.crypto.bullet3": "2FA-Backup-Codes",
  "hero.tiles.crypto.bullet4": "Börsen- und Bank-Logins",
  "hero.tiles.documents.title": "Dokumente & Urkunden",
  "hero.tiles.documents.bullet1": "Testamente und Urkunden",
  "hero.tiles.documents.bullet2": "Versicherungspolicen",
  "hero.tiles.documents.bullet3": "Patientenverfügungen",
  "hero.tiles.documents.bullet4": "Reisepass-Scans",
  "hero.tiles.digital.title": "Digitales Leben",
  "hero.tiles.digital.bullet1": "Ihr Passwort-Manager-Hauptpasswort",
  "hero.tiles.digital.bullet2": "Apple ID, Google, Facebook (damit Erben die Konten in Gedenkzustand setzen können)",
  "hero.tiles.digital.bullet3": "Die Abo-Liste, die sonst niemand hat",
  "hero.tiles.hidden.title": "Versteckte Orte",
  "hero.tiles.hidden.bullet1": "Ein Foto, wo der Schließfach-Schlüssel wirklich liegt",
  "hero.tiles.hidden.bullet2": "Ersatzschlüssel",
  "hero.tiles.hidden.bullet3": "Tor-Codes für Lagerräume",
  "hero.tiles.legacy.title": "Persönliches Vermächtnis",
  "hero.tiles.legacy.bullet1": "Briefe an bestimmte Personen",
  "hero.tiles.legacy.bullet2": "Familienrezepte",
  "hero.tiles.legacy.bullet3": "Sprachnotizen",
  "hero.tiles.legacy.bullet4": "Geschichten, die weitergegeben werden sollen",
  "hero.tiles.ops.title": "Operativ",
  "hero.tiles.ops.bullet1": "Server- und API-Schlüssel",
  "hero.tiles.ops.bullet2": "Geschäftskontakte",
  "hero.tiles.ops.bullet3": "Das Runbook, das nur Sie kennen",

  "hero.phonePinHook": "Und ja — Ihre Handy-PIN bringt sie nicht in Ihre Cloud. Wir zeigen Ihnen, was es tut.",
  "hero.closer.p1": "Alles passiert in Ihrem Browser. Wir speichern Ihren Seed nicht. Wir können es nicht — es gibt keinen API-Aufruf, der ihn an uns sendet.",
  "hero.closer.p2": "Stellen Sie ihn selbst wieder her, wenn eine Wallet verloren geht. Restaurieren Sie ihn, nachdem ein Gerät stirbt.",
  "hero.closer.p3": "Oder übergeben Sie ihn automatisch der von Ihnen benannten Person, falls Sie sich nicht mehr melden.",
  "hero.cta.getStarted": "Loslegen",
  "hero.cta.seeMath": "Die Mathematik sehen",

  "hero.video.title": "Der ganze Beweis, in Bewegung.",
  "hero.video.subline": "12 Schritte von Anfang bis Ende. Jede Primitive, jeder Air-Gap-Moment, jede Online-Querung. Dann rechnen Sie selbst nach.",
  "hero.video.cta": "Beweisen Sie es →",

  "hero.shamir.prefix": "Unterhalb Ihres Wiederherstellungs-Schwellenwerts ist NoKLocks geheimes Aufteilen ",
  "hero.shamir.accent": "mathematisch unmöglich zu brechen",
  "hero.shamir.suffix": ". Nicht mit heutigen Computern. Nicht mit einem Quanten-Computer. Niemals.",

  // Hero Managed-mode Kacheln.
  "hero.managed.tiles.signin.title": "Anmeldung per E-Mail oder Passkey",
  "hero.managed.tiles.signin.body": "Keine Wallet einzurichten. Nutzen Sie Ihre gewohnte Anmeldung.",
  "hero.managed.tiles.provision.title": "Wir stellen die Wallet bereit",
  "hero.managed.tiles.provision.body": "Im Hintergrund. Sie sehen nie eine Seed-Phrase — und wir auch nicht. Der Schlüssel liegt bei Privy (unserem Managed-Wallet-Anbieter), nie bei uns; nach Privys Design kann keine einzelne Partei ohne Sie signieren.",
  "hero.managed.tiles.heirEmail.title": "Erbanspruch per E-Mail",
  "hero.managed.tiles.heirEmail.body": "Ihr benannter Erbe klickt auf einen E-Mail-Link, um zu beanspruchen. Keine Krypto-Kenntnisse erforderlich (gilt auch für das Selbstverwahrungs-Modell).",
  "hero.managed.tiles.sameCrypto.title": "Dieselbe Krypto unter der Haube",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD. Tresor-Inhalte bleiben selbstverwahrt. Nur die Wallet-Schicht ist verwaltet.",
  "hero.managed.tiles.escape.title": "Selbstverwahrungs-Notausgang",
  "hero.managed.tiles.escape.body": "Exportieren Sie Ihre Wallet-Schlüssel jederzeit. Migrieren Sie zur Selbstverwahrung, wann immer Sie wollen.",
  "hero.managed.tiles.audience.title": "Für die Menschen in Ihrem Leben",
  "hero.managed.tiles.audience.body": "Die niemals MetaMask einrichten würden — aber dennoch ein digitales Leben hinterlassen, das es wert ist, weitergegeben zu werden.",
  "hero.managed.closer": "Dieselbe Tresor-Mathematik. Einfachere Wallet. Dieselbe Ehrlichkeit darüber, was wir sehen und was nicht.",
  "hero.managed.notifyButton": "Benachrichtigen Sie mich, wenn es bereit ist",

  "pricing.priced-to-protect": "Preis zum Schützen, nicht zum Abschöpfen.",
  "card.readHow": "So funktioniert's →",
  "proof.title": "Beweise, keine Versprechen",
  "proof.loss.k": "Verlustsicher",
  "proof.loss.b": "Verlorene Wallet, totes Telefon, ein verlorener Anteil — jeder Schwellenwert der verbleibenden Anteile plus Ihr Master-Passwort holt alles zurück. Die Aufteilung ist Ihr Sicherheitsnetz, nicht nur Ihr Vererbungsauslöser.",
  "proof.tamper.k": "Manipulationssicher",
  "proof.tamper.b": "Jeder Anteil trägt ein AEAD-Tag + das Manifest ist Ed25519-signiert. Ein verändertes Byte und die Wiederherstellung verweigert.",
  "proof.spoof.k": "Fälschungssicher",
  "proof.spoof.b": "Soul-bound-Token sind nicht übertragbar. Ein Angreifer kann Ihre benannten Erben nicht imitieren.",
  "proof.inherit.k": "Vererbung",
  "proof.inherit.b": "Wenn Sie sich nicht mehr melden, erben Ihre benannten Angehörigen automatisch. Kein Anwalt, keine Nachlass-Reibung.",
  "proof.airgap.k": "Air-gapped",
  "proof.airgap.b": "Einrichtung im Flugmodus. Der Krypto-Kern braucht nie ein Netzwerk.",
  "proof.ai.k": "KI-resistent",
  "proof.ai.b": "Ihr Seed kommt nie in die Nähe eines Sprachmodells. Kein KI-Training, keine Prompts, keine Inferenz. Nur deterministische Mathematik.",
  "proof.fullinfo": "Volle Infos — Architektur, Anbieter, Sicherheitsmodell, Wettbewerbsanalyse →",
  "more.title": "Mehr als Krypto — jetzt live",
  "more.body": "Versiegelte Briefe, Dokumententresor und Bildertresor sind ab heute verfügbar. Verfassen Sie einen versiegelten Brief, verschlüsseln Sie ein Testament, scannen Sie Familiendokumente oder sichern Sie ein Fotoarchiv — dieselbe Aufteilen-Verschlüsseln-Verteilen-Vererben-Pipeline wie für Ihren Krypto-Seed, alles im Browser.",
  "more.cta": "Tresore öffnen →",
  "keyless.titleA": "Nicht „schlüssellos“.",
  "keyless.titleB": "Ehrliche Selbstverwahrung.",
  "keyless.body": "Andere Wallets tun so, als hätten Sie keine Schlüssel — die meisten davon sind hinter dem Hochglanz verwahrend. NoKLock ehrt Ihre Seed-Phrase und macht sie dann schwer verlierbar, leicht wiederherstellbar und vererbungsbereit.",
  "keyless.cta": "Warum nicht schlüssellos →",
  "ins.titleA": "Wir haben keine Versicherung.",
  "ins.titleB": "Wir brauchen keine.",
  "ins.body": "Casa, Ledger Recover und Vault12 haben Versicherungen, weil sie Ihre Schlüssel halten. Die Versicherung ist ihre Entschuldigung dafür, dass sie sie verlieren können. NoKLock berührt Ihre Schlüssel nie — wir können nichts verlieren. Das ist der Unterschied.",
  "nav.dashboard": "Übersicht",
  "nav.vaults": "Tresore",
  "nav.restore": "Wiederherstellen",
  "nav.proveit": "Beweis",
  "nav.nok": "Angehörige benennen",
  "nav.heartbeat": "Lebenszeichen",
  "nav.deadman": "Totmannschalter",
  "nav.livemans": "Lebendmann-Schalter (Warnungen)",
  "nav.pricing": "Preise",
  "nav.refer": "Empfehlen & verdienen",
  "nav.info": "Info",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock Enterprise)",
  "nav.settings": "Einstellungen",
  "nav.advanced": "Erweitert",
  "nav.disconnect": "Trennen",
  "nav.reconnecting": "Sitzung wird wiederhergestellt…",
  "footer.tagline": "Selbstverwahrte kryptografische Wiederherstellung für alles, dessen Verlust Sie sich nicht leisten können.",
  "footer.privacy": "Datenschutz",
  "footer.terms": "Nutzungsbedingungen",
  "footer.howItWorks": "Wie es funktioniert",
  // TODO machine-translation (native review pending) — Google Play download surfaces.
  "footer.getAndroidApp": "App holen",
  "settings.getAndroidApp.title": "Android-App holen",
  "settings.getAndroidApp.body": "Installiere NoKLock aus Google Play für eine App auf dem Startbildschirm — dieselbe Website, Vollbild, automatische Updates.",
  "download.title": "Hol dir die NoKLock-App",
  "download.androidNote": "Tippe auf das Abzeichen oben, um NoKLock aus Google Play zu installieren.",
  "download.iosNote": "Öffne noklock.app in Safari → tippe auf Teilen → Zum Home-Bildschirm hinzufügen.",
  "download.comingSoon": "Demnächst bei Google Play",
  "lang.label": "Sprache",
  // 2026-05-20 signature-differentiator strings (Option-B restructure).
  "stand.duress.k": "Erpressungssicher",
  "stand.duress.t": "Zwei Passwörter, zwei Tresore.",
  "stand.duress.b": "Optionaler Köder-Tresor mit eigenem Passwort. Unter Zwang übergeben Sie den Köder — die Angreifer sehen einen glaubhaften Wegwerf-Tresor, Ihr echter Tresor bleibt verborgen. Kein Wettbewerber bietet das.",
  "stand.social.k": "Social-Engineering-sicher",
  "stand.social.t": "M-aus-N unabhängige NoKs.",
  "stand.social.b": "Multi-NoK Erbschaft — Freigabe erfordert M von N unabhängigen Signaturen aus verschiedenen Wallets. Ein einzelner unter Druck gesetzter oder kompromittierter NoK kann nicht alleine freigeben. Phishing eines Erben verschafft keinen Zugang.",
  "stand.noklockproof.k": "NoKLock-unabhängig",
  "stand.noklockproof.t": "Wenn wir verschwinden, funktioniert es trotzdem.",
  "stand.noklockproof.b": "Wiederherstellung erfolgt zu 100% clientseitig (Ihre Shares + Master-Passwort). Erbschaft läuft on-chain (Polygon + Chainlink). Selbst-Heartbeat funktioniert auch wenn NoKLock verschwindet. Auf PolygonScan verifiziert — Sie können es selbst prüfen.",
  "stand.selfcustody.k": "Selbstverwahrung",
  "stand.selfcustody.t": "Ihre Schlüssel. Ihre Daten. Immer.",
  "stand.selfcustody.b": "NoKLock sieht oder berührt niemals Ihren Seed, Ihre Shares oder Ihre Daten. Die Blockchain speichert nur Hashes und Zeiger, niemals Klartext. Kein gepoolter Honeypot, kein Admin-Override, keine Wiederherstellungs-Geiselhaft. Sie haben alles in der Hand.",
  "soul.title": "Soulbound NFTs — Ihre Erbschaft, on-chain",
  "soul.body": "Wenn Sie einen Erben benennen, prägt NoKLock ein einziges Soulbound-Aktivierungs-NFT (ERC-5192) auf Polygon — den Totmannschalter-Auslöser: ein Erbe, ein Token. M-von-N-Quorum-Tresore fügen pro Erben ein Abstimmungs-NFT hinzu. Soulbound bedeutet nicht übertragbar — einmal geprägt, kann der Token nicht verkauft, bewegt, gestohlen oder beschlagnahmt werden. Eine seltene produktive Nutzung des ERC-5192-Standards, und die einzige bekannte produktive Anwendung für Krypto-Erbschaft.",
  "soul.bodyB": "Alle drei Verträge oben sind auf PolygonScan quellverifiziert — klicken Sie auf eine Adresse, um den eingesetzten Code zu lesen. Der SBT ist der eigentliche Erbschafts-Trigger; License zieht nur das USDC ein, das Sie explizit genehmigen; der Totmann-Schalter des Oracle ist nur über den Forwarder ansprechbar.",
  "soul.scoreLabel": "Basis-SolidityScan-Prüfung · null gepoolte Mittel, null Schlüsselverwahrung, bewusst kleine Angriffsfläche",
  "proof.duress.k": "Erpressungssicher",
  "proof.duress.b": "Optionaler Köder-Tresor mit eigenem Master-Passwort. Unter Zwang geben Sie den Köder preis — die Angreifer sehen einen glaubhaften Wegwerf-Tresor, der echte Tresor bleibt verborgen.",
  "proof.social.k": "Social-Engineering-sicher",
  "proof.social.b": "Multi-NoK M-aus-N Quorum aus unabhängigen Wallets. Ein einzelner unter Druck gesetzter oder geleakter NoK kann nicht alleine freigeben — dieser einzelne scheitert an der Quorumsprüfung.",
  "proof.noklockproof.k": "NoKLock-unabhängig",
  "proof.noklockproof.b": "Wiederherstellung ist zu 100% clientseitig. Erbschaft läuft on-chain über Polygon + Chainlink. Selbst-Heartbeat überlebt, selbst wenn NoKLock morgen verschwindet.",

  // 0.6.0 — simple-vs-max-security framing (TODO: native DE review).
  "landing.proof.simpleMax.headline": "Drei Anteile, verteilt in Ihren eigenen Ordnern",
  "landing.proof.simpleMax.accent": "schlägt schon einen Notizzettel oder eine verschlüsselte Textdatei.",
  "landing.proof.simpleMax.simple": "Einfacher Weg: Wählen Sie drei Ordner auf Ihrem Laptop oder Handy.",
  "landing.proof.simpleMax.max": "Maximale Sicherheit: Verteilen Sie sie auf verschiedene Laufwerke, Clouds und Anbieter, die Sie bereits nutzen.",
  "landing.proof.simpleMax.either": "So oder so — extremer Schutz, vereinfacht.",

  // 0.6.0 — Pricing FAQ "Telefon verloren" (TODO: native DE review).
  "pricing.faq.losePhone.question": "Verliere ich den Zugang, wenn mein Telefon stirbt?",
  "pricing.faq.losePhone.intro": "Nein. Ihr Seed ist nicht auf Ihrem Telefon gespeichert. Er ist verschlüsselt, mit Shamir in Anteile aufgeteilt (standardmäßig 3-von-5) und über den Speicher verteilt, DEN SIE wählen.",
  "pricing.faq.losePhone.simple": "Einfacher Weg: Drei Ordner auf Ihrem Laptop oder Telefon — schon sicherer als ein Notizzettel oder eine verschlüsselte Textdatei.",
  "pricing.faq.losePhone.max": "Maximale Sicherheit: Verteilen Sie sie auf verschiedene Cloud-Konten, IPFS, Arweave, mehrere Geräte.",
  "pricing.faq.losePhone.either": "So oder so — Sie verlieren irgendeinen Ablageort, der Rest stellt den Seed trotzdem wieder her.",
  "pricing.faq.losePhone.secureEnclave": "Das ist der strukturelle Unterschied zu Hardware-Wallet-artigen Produkten. Deren Seed ist in einem Secure-Enclave-/StrongBox-Schlüssel eingeschlossen, der nicht aus dem Chip exportiert werden kann — das macht den Chip sicher und sorgt dafür, dass deren Seed mit dem Gerät stirbt. Sie flicken das mit Papier-Backup-Phrase-Ritualen. NoKLock entfernt den einzelnen Ausfallpunkt, statt ihn zu übertünchen.",

  // 0.6.0 — CryptoInheritance Q "Telefon verloren" (TODO: native DE review).
  "crypto.q.losePhone.question": "Was passiert, wenn ich mein Telefon verliere?",
  "crypto.q.losePhone.intro": "Nichts Fatales. Ihr Seed lebt nicht auf Ihrem Telefon — er lebt in verschlüsselten Shamir-Anteilen, verteilt auf den Speicher, den Sie bei der Einrichtung gewählt haben.",
  "crypto.q.losePhone.simple": "Einfacher Weg: Drei Ordner auf Ihren eigenen Geräten — schon sicherer als ein Notizzettel in einem Buch oder eine verschlüsselte Textdatei auf Ihrem Desktop.",
  "crypto.q.losePhone.max": "Maximale Sicherheit: Verteilen Sie die Anteile auf verschiedene Cloud-Konten, IPFS, Arweave, mehrere Laufwerke.",
  "crypto.q.losePhone.either": "So oder so — verlieren Sie irgendeinen Ablageort, der Rest stellt den Seed trotzdem wieder her.",
  "crypto.q.losePhone.secureEnclave": "Das ist der strukturelle Unterschied zu Hardware-Wallet-artigen Produkten. Deren Seed ist in einem einzigen Gerät eingeschlossen; verlieren Sie es ohne das Papier-Backup, sind Sie verloren. NoKLocks Seed ist mathematisch verteilt, bevor irgendein Gerät ihn als wiederherstellbares Artefakt berührt.",

  // 0.6.0 — Enrol Step B "Zwei Wege" (TODO: native DE review).
  "enrol.shareUrl.twoRoutes.headline": "Zwei Wege — wählen Sie, was heute zu Ihnen passt",
  "enrol.shareUrl.twoRoutes.simple": "Einfach: Legen Sie jede Anteilsdatei in einen anderen Ordner auf Ihrem Laptop, Telefon, USB-Stick oder wo immer Sie Dateien aufbewahren. Lassen Sie das URL-Feld unten leer. Das ist schon dramatisch sicherer als ein Notizzettel oder eine verschlüsselte Textdatei — verlieren Sie einen Ordner, der Rest stellt den Seed trotzdem wieder her.",
  "enrol.shareUrl.twoRoutes.max": "Maximale Sicherheit: Legen Sie jeden Anteil in ein anderes Cloud-Konto (Drive, Dropbox, OneDrive, IPFS, Arweave…) und fügen Sie die „Jeder mit dem Link\"-URL unten ein. Diese Trennung ist der ganze Sinn der Schwellenwert-Aufteilung: Ein gestohlenes Konto leakt nur einen Anteil, sodass Ihr Tresor sicher bleibt. Sie und Ihre Angehörigen können Anteile remote abrufen, statt jede Datei zur Hand haben zu müssen.",
  "enrol.shareUrl.twoRoutes.urlsNote": "URLs sind in beiden Wegen optional. NoKLock speichert nur die URL (lokal in diesem Browser, nichts wird irgendwohin gesendet); die Anteilsdateien selbst verlassen niemals Ihre Kontrolle.",

  // 0.7.0 — Pricing rework keys (TODO: native DE review).
  "pricing.summary.headline": "Zwei Zugangswege zum selben Speichern + Wiederherstellen-Tresor",
  "pricing.summary.body": "Selbstverwahrung — Sie halten die Schlüssel. Managed — wir halten ein Privy-Embedded-Wallet für Sie (in Kürze, NL-2). Drei Stufen in beiden Wegen: Free / Standard / Premium. Founder-Preise auf allen kostenpflichtigen Stufen — die ersten 10.000 bezahlten Lizenzen pro Seite.",
  "pricing.tabs.selfCustody": "Selbstverwahrung",
  "pricing.tabs.managed": "Managed (in Kürze)",
  "pricing.tabs.compare": "Beide vergleichen",
  "pricing.tabs.enterprise": "Enterprise",
  "pricing.tabs.faq": "FAQ",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "Jährlich",
  "pricing.sku.lifetime": "Lebenslang",
  "pricing.sku.autorenew": "(verlängert sich automatisch über Paddle)",
  "pricing.managed.comingSoon": "Managed-Modus kommt bald (NL-2)",
  "pricing.managed.subtitle": "Anmeldung mit Google / Apple / E-Mail. NoKLock hält das Embedded-Wallet für Sie. Selbstverwahrungs-Nutzer sind nicht betroffen.",
  "pricing.lifetime.tagline": "Einmal zahlen. Nie wieder verlängern.",
  "pricing.founder.label": "Founder-Preise — die ersten 10.000 bezahlten Lizenzen pro Seite. Vertraglich durchgesetzt für Selbstverwahrung, Form-B-getrackt für Managed.",
  "pricing.modeLabel.self": "Selbstverwahrung — Sie halten die Schlüssel",
  "pricing.modeLabel.managed": "Managed — Privy-Embedded-Wallet",

  // 0.8.0 — Pricing round-2 copy keys (TODO: native DE review). Cloned from
  // en.ts 0.8.0 as a machine-translation starting point.
  "pricing.accordion.buyOnce.title": "Buy once. Use forever. No subscription on your survival.",
  "pricing.accordion.buyOnce.body": "We've seen the market: $10/mo here, $29/mo there, annual subscriptions that quietly auto-bill until your card expires (and then your heirs inherit the renewal too). We don't do that. Pick annual if you want, but the headline option is Lifetime: pay once, never think about it again.",
  "pricing.accordion.founder.title": "Founder pricing",
  "pricing.accordion.founder.body": "Founder pricing is a contract- and program-enforced discount for the first 10,000 paid licences on EACH side (self-custody + managed). You qualify automatically — no signup needed. Once a side reaches its 10,000, that side's price steps up to the regular tier price. Both counters are independent.",
  "pricing.primary.chooseMode": "Choose Model…",
  "pricing.primary.mode.self": "Self-custody",
  "pricing.primary.mode.managed": "Managed — Coming soon NL-2",
  "pricing.primary.currency": "Currency",
  "pricing.primary.buy": "Buy",
  "pricing.primary.getStarted": "Get started",
  "pricing.primary.founder": "Founder",
  "pricing.bottom.headline": "Two access paths to the same store + restore vault.",
  "pricing.bottom.selfRow": "Self-custody. You hold the keys. On-chain License NFT, pay in USDC on Polygon. NoKLock cannot access your data.",
  "pricing.bottom.managedRow": "Managed. We hold a Privy embedded wallet for you — sign in with Google / Apple / email, passkey unlock, fiat billing via Paddle. Coming with NL-2.",
  "pricing.bottom.tiersLine": "Three tiers across both: Free / Standard / Premium. Same prices either side. Founder pricing on every paid tier — first 10,000 paid licences each side, contract-enforced for self-custody, Form-B–tracked for managed.",
  "pricing.bottom.inheritanceOptional": "Inheritance is optional. Most users come for store + restore — pass-down to next-of-kin is a feature they turn on later, not the price of entry.",
  "pricing.bottom.referLine": "Refer others and earn a share on every paid licence they mint.",

  // 0.9.0 — Tier-gating UX badges. Mirrors en.ts 0.9.0.
  "tier.badge.standardPlus": "Standard+",
  "tier.badge.premiumPlus": "Premium+",
  "tier.requires.standard": "Erfordert Standard — Upgrade unter /pricing",
  "tier.requires.premium": "Erfordert Premium — Upgrade unter /pricing",
  "tier.upgrade.cta": "Upgrade",

  // 0.12.0 — Homepage "Day-1 honest note" launch banner. {tests}/{solc} are
  // injected as untranslated numbers at the callsite.
  "landing.day1.badge": "Ehrliche Notiz zum Start",
  "landing.day1.body": "NoKLock ist gerade gestartet. Die Verträge sind auditiert. Die Tests bestehen ({tests} auf Solidity {solc}). Zwei unabhängige KI-Prüfdurchläufe sind abgeschlossen. Die ersten Wochen eines echten Produkts bringen dennoch raue Kanten zutage, Texte, die danebenliegen, Abläufe, die wir nicht erwartet haben. Sagen Sie uns Bescheid, wenn Sie einen finden.",
  "landing.day1.bug": "Einen Fehler gefunden? Bounty →",
  "landing.day1.rough": "Etwas holprig? So sagen Sie es uns →",
  "landing.day1.email": "Schreiben Sie uns →",
  "landing.day1.dismissForever": "Für immer ausblenden",

  // 0.12.0 — Use-cases carousel lead-in.
  "home.useCases.leadIn": "Wofür Menschen es tatsächlich nutzen",

  // 6 Vault-Anwendungsfall-Kategorien.
  "vuc.cat.crypto-finance": "Krypto- & Finanzschlüssel",
  "vuc.cat.digital-identity": "Digitale Identität & Konten",
  "vuc.cat.hidden-places": "Versteckte Orte & physische Hinweise",
  "vuc.cat.vital-documents": "Wichtige Dokumente",
  "vuc.cat.final-wishes": "Letzte Wünsche & persönliche Briefe",
  "vuc.cat.recovery-codes": "Wiederherstellungscodes & Backup-Geheimnisse",

  // 26 Karussell-Karten (Titel + Kurztext). Markennamen bleiben unverändert.
  "vuc.card.crypto-finance:hw-wallet.title": "Hardware-Wallet-Seed",
  "vuc.card.crypto-finance:hw-wallet.blurb": "Die 12 oder 24 Wörter hinter Ihrem Ledger, Trezor oder Tangem.",
  "vuc.card.crypto-finance:soft-wallet.title": "MetaMask-/Rabby-Wiederherstellung",
  "vuc.card.crypto-finance:soft-wallet.blurb": "Software-Wallet-Seed-Phrase und jeder Multisig-Signer-Schlüssel.",
  "vuc.card.crypto-finance:exchange-codes.title": "Börsen-Wiederherstellungscodes",
  "vuc.card.crypto-finance:exchange-codes.blurb": "Die gedruckten Backup-Codes, die Coinbase, Kraken oder Binance Ihnen bei der Anmeldung gaben.",
  "vuc.card.crypto-finance:pw-manager.title": "Passwort-Manager-Hauptpasswort",
  "vuc.card.crypto-finance:pw-manager.blurb": "Schaltet den Rest Ihres finanziellen Lebens frei — 1Password, Bitwarden, Dashlane.",
  "vuc.card.crypto-finance:2fa-seed.title": "2FA-Seed-Export",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Google Authenticator / Authy / Aegis Seed-Liste — übersteht ein verlorenes Telefon.",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + Google-Konto",
  "vuc.card.digital-identity:apple-google.blurb": "Stamm-Logins, die Ihr Telefon, Fotos, Kontakte und E-Mail absichern.",
  "vuc.card.digital-identity:social-credentials.title": "Social-Media-Zugangsdaten",
  "vuc.card.digital-identity:social-credentials.blurb": "In Gedenkzustand setzen, eine letzte Nachricht posten oder gemäß der Richtlinie jeder Plattform schließen.",
  "vuc.card.digital-identity:domains.title": "Domain-Registrar-Logins",
  "vuc.card.digital-identity:domains.blurb": "Domains verfallen still — oft im Nachhinein unmöglich wiederzuerlangen.",
  "vuc.card.digital-identity:cloud-storage.title": "Cloud-Speicher-Konten",
  "vuc.card.digital-identity:cloud-storage.blurb": "Wo jahrzehntelange Fotos, Dokumente und persönliche Projekte tatsächlich liegen.",
  "vuc.card.hidden-places:safe-deposit-photo.title": "Foto des Bankschließfachs",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "Filiale, Fachnummer und wo Schlüssel + Unterschriftskarte zu Hause liegen.",
  "vuc.card.hidden-places:home-safe.title": "Standort + Kombination des Heimtresors",
  "vuc.card.hidden-places:home-safe.blurb": "Beschriftetes Foto mit der Kombination auf der Rückseite.",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "Wo die Hardware-Wallet versteckt ist",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "Hinten in welcher Schublade, in welchem Buch, unter welchem Dielenbrett.",
  "vuc.card.hidden-places:spare-keys.title": "Standorte der Ersatzschlüssel",
  "vuc.card.hidden-places:spare-keys.blurb": "Die Magnetbox unter dem Radkasten — nutzlos, wenn ihr Standort mit Ihnen stirbt.",
  "vuc.card.hidden-places:hidden-cash.title": "Verstecktes Bargeld & Erbstücke",
  "vuc.card.hidden-places:hidden-cash.blurb": "Der Umschlag hinter dem Gemälde, der Bodentresor unter dem Teppich.",
  "vuc.card.vital-documents:will-trust.title": "Unterschriebenes Testament & Treuhandurkunde",
  "vuc.card.vital-documents:will-trust.blurb": "Die tatsächlich unterschriebenen PDFs — nicht nur „liegt beim Anwalt“.",
  "vuc.card.vital-documents:insurance.title": "Versicherungspolicen-PDFs",
  "vuc.card.vital-documents:insurance.blurb": "Leben, Eigentum und Schlüsselperson — damit keine einlösbare Police übersehen wird.",
  "vuc.card.vital-documents:property-deeds.title": "Grundstücksurkunden & Titel",
  "vuc.card.vital-documents:property-deeds.blurb": "Eigentumsnachweis, der physische Vermögenswerte in übertragbare verwandelt.",
  "vuc.card.vital-documents:tax-returns.title": "Aktuelle Steuererklärungen",
  "vuc.card.vital-documents:tax-returns.blurb": "Letzte 3–7 Jahre + der direkte Kontakt des Steuerberaters.",
  "vuc.card.final-wishes:personal-letters.title": "Briefe an jeden geliebten Menschen",
  "vuc.card.final-wishes:personal-letters.blurb": "Die Dinge, die Sie persönlich gesagt hätten, wenn die Zeit gereicht hätte.",
  "vuc.card.final-wishes:funeral-prefs.title": "Wünsche zu Bestattung & Beerdigung",
  "vuc.card.final-wishes:funeral-prefs.blurb": "Einäscherung oder Beerdigung, die Musik, die Lesungen — Ihre Entscheidung, nicht ihre.",
  "vuc.card.final-wishes:ethical-will.title": "Ethisches Testament",
  "vuc.card.final-wishes:ethical-will.blurb": "Die Werte, Lektionen und Geschichten, die die nächste Generation weitertragen soll.",
  "vuc.card.final-wishes:pet-care.title": "Wünsche zur Haustierversorgung",
  "vuc.card.final-wishes:pet-care.blurb": "Wer den Hund nimmt, was die Katze frisst, Name und Chipnummer des Tierarztes.",
  "vuc.card.recovery-codes:printed-2fa.title": "Gedruckte 2FA-Wiederherstellungscodes",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google, Microsoft, GitHub, AWS, Banking — die, die Sie weggelegt haben.",
  "vuc.card.recovery-codes:yubikey.title": "YubiKey-Registrierungsliste",
  "vuc.card.recovery-codes:yubikey.blurb": "Seriennummern, registrierte Konten und wo der Backup-Schlüssel aufbewahrt wird.",
  "vuc.card.recovery-codes:disk-encryption.title": "Festplatten-Verschlüsselungsschlüssel",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker, FileVault, LUKS — ohne diese ist der Laptop ein Briefbeschwerer.",
  "vuc.card.recovery-codes:gpg-age.title": "GPG-/Age-Privatschlüssel",
  "vuc.card.recovery-codes:gpg-age.blurb": "Für alle, die tatsächlich Ende-zu-Ende-Verschlüsselung nutzen.",

  // 0.12.0 — Info-Dropdown-Menüeinträge.
  "nav.info.appInfo": "App-Info",
  "nav.info.appUpdates": "App-Updates",
  "nav.info.enrolWalkthrough": "Einrichtungs-Walkthrough",
  "nav.info.articles": "NoKLock Artikel",

  // 0.11.0 — Landing-FSM-Box: Überschrift + Untertitel.
  "landing.fsm.headline": "Stärkeres Vertrauen, als es jeder Dienst bietet",
  "landing.fsm.subtitle": "Ihr Tresor befindet sich zu jedem Zeitpunkt in genau einem Zustand. Dieser Zustand liegt auf Polygon, nicht auf unserem Server.",

  // 0.11.0 — FSMDiagram.tsx Zustandsdiagramm. Zustandsnamen übersetzt;
  // On-Chain-Code-Bezeichner (Funktionssignaturen + Anker-Ausdrücke)
  // bleiben im JSX wörtlich.
  "fsm.title": "NoKLock-Tresor-Lebenszyklus · endlicher Automat auf Polygon",
  "fsm.subtitle": "jeder Zustand on-chain · jeder Übergang kryptografisch signiert · prüfen Sie den Zustand Ihres Tresors jederzeit, ohne Anmeldung",
  "fsm.transition.timeElapses": "Zeit verstreicht",
  "fsm.transition.graceElapses": "Frist verstreicht",
  "fsm.state.enrolled.name": "EINGETRAGEN",
  "fsm.state.enrolled.desc": "Tresor lokal erstellt",
  "fsm.state.heirDesignated.name": "ERBE_BESTIMMT",
  "fsm.state.heirDesignated.desc": "Activation-NFT geprägt (+ Voting bei Quorum)",
  "fsm.state.alive.name": "LEBENDIG",
  "fsm.state.alive.desc": "Herzschlag aktuell",
  "fsm.state.dueSoon.name": "BALD_FÄLLIG",
  "fsm.state.dueSoon.desc": "Kulanzfenster läuft ab",
  "fsm.state.inGrace.name": "IN_KULANZ",
  "fsm.state.inGrace.desc": "wartet auf performUpkeep",
  "fsm.state.activated.name": "AKTIVIERT",
  "fsm.state.activated.desc": "Schalter wurde ausgelöst",
  "fsm.state.claimed.name": "BEANSPRUCHT",
  "fsm.state.claimed.desc": "Erbe hält das SBT",
  "fsm.legend.happyPath": "Idealverlauf — fließendes Türkis",
  "fsm.legend.heartbeat": "Herzschlag empfangen → zurück zu LEBENDIG",
  "fsm.legend.sideStates": "Nebenzustands-Verzweigungen",
  "fsm.legend.anchorNote": "Jeder Zustand zeigt seinen On-Chain-Anker (die Zeile darunter). Die Striche fließen kontinuierlich; prüfen Sie den Live-Zustand jedes Tresors auf PolygonScan.",
};
