// @version 0.11.0 @date 2026-06-13  ·  Français — funnel, full keyed set
// 0.11.0 — Daniel 2026-06-13: English-only-surface i18n sweep mirroring
//          en.ts 0.12.0 — three previously-hardcoded funnel/nav surfaces:
//            (1) landing.day1.* — homepage "Day-1 honest note" launch banner.
//            (2) home.useCases.leadIn + vuc.cat.* (6) + vuc.card.* (26×2) —
//                homepage use-cases carousel lead-in, category labels, cards.
//            (3) nav.info.{appInfo,appUpdates,enrolWalkthrough} — Info-dropdown
//                menu items (NoKLock.white + Asserro reuse nav.whitelabel /
//                nav.corporate). Curated FR translations; brand/product names
//                (Ledger, MetaMask, 1Password…) kept verbatim.
// @version 0.10.0 @date 2026-06-08  ·  Français — funnel, full keyed set
// 0.10.0 — Daniel 2026-06-08 round-5: managed-hero tile copy mirror — 3 key
//         value updates from en.ts (hero.managed.tiles.provision.body
//         expanded with Privy secure-enclave detail; hero.managed.tiles.
//         heirEmail.body appended "(also applies to self-custody model)";
//         hero.managed.tiles.escape.title changed from "Always escape-
//         hatchable" to "Self-custody escape hatch"). Machine-translation
//         starting point — TODO native FR review.
// @version 0.9.0 @date 2026-06-08  ·  Français — funnel, full keyed set
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys mirroring
//         en.ts 0.9.0. Machine-translation starting point — TODO native
//         FR review.
// @version 0.8.0 @date 2026-06-08  ·  Français — funnel, full keyed set
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys
//         mirroring en.ts 0.8.0 (buy-once + founder accordion, primary mode
//         selector, bottom summary block). Machine-translation starting
//         point — TODO native FR review.
// @version 0.7.0 @date 2026-06-08  ·  Français — funnel, full keyed set
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys
//         mirroring en.ts 0.7.0 (tier-box + tabs + summary block for the
//         Pricing rework Agent 1 is wiring). Machine-translation starting
//         point — TODO native FR review.
// @version 0.6.0 @date 2026-06-08  ·  Français — funnel, full keyed set
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep. 19 new
//         keys mirroring en.ts 0.6.0. Machine-translation starting point —
//         TODO native review.
// @version 0.5.0 @date 2026-06-02  ·  Français — funnel, full keyed set
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
export const fr: Record<string, string> = {
  "hero.chip": "Intelligence humaine. Zéro IA sur votre seed. Des maths solides, tout simplement.",

  // 0.5.0 — Hero H1 / accroches / H2.
  "hero.h1": "Votre phrase seed. Votre testament. Votre vie numérique.",
  "hero.tagline": "Au-delà du portefeuille, au-dessus du gestionnaire de mots de passe, avant l'avocat.",
  "hero.h2": "Sauvegardez et transmettez n'importe quel portefeuille — Bitcoin, Solana, Ethereum, toute blockchain.",
  "hero.mainTagline": "Ne perdez rien d'important — ni au temps, ni à la mémoire, ni aux mauvaises personnes.",
  "hero.subTagline": "Self-Custody pour les utilisateurs crypto-natifs disponible dès aujourd'hui. Mode Managed pour tous les autres, bientôt disponible.",

  // Grille de tuiles (Self-Custody).
  "hero.tiles.crypto.title": "Crypto & finance",
  "hero.tiles.crypto.bullet1": "Phrases seed",
  "hero.tiles.crypto.bullet2": "Fiches de récupération de portefeuille matériel",
  "hero.tiles.crypto.bullet3": "Codes de sauvegarde 2FA",
  "hero.tiles.crypto.bullet4": "Identifiants d'échanges et de banques",
  "hero.tiles.documents.title": "Documents & actes",
  "hero.tiles.documents.bullet1": "Testaments et actes notariés",
  "hero.tiles.documents.bullet2": "Polices d'assurance",
  "hero.tiles.documents.bullet3": "Directives médicales",
  "hero.tiles.documents.bullet4": "Scans de passeport",
  "hero.tiles.digital.title": "Vie numérique",
  "hero.tiles.digital.bullet1": "Le mot de passe maître de votre gestionnaire",
  "hero.tiles.digital.bullet2": "Apple ID, Google, Facebook (pour que les héritiers puissent commémorer les comptes)",
  "hero.tiles.digital.bullet3": "La liste d'abonnements que personne d'autre n'a",
  "hero.tiles.hidden.title": "Endroits cachés",
  "hero.tiles.hidden.bullet1": "Une photo de l'endroit où se trouve réellement la clé du coffre-fort",
  "hero.tiles.hidden.bullet2": "Doubles de clés",
  "hero.tiles.hidden.bullet3": "Codes d'accès des box de stockage",
  "hero.tiles.legacy.title": "Héritage personnel",
  "hero.tiles.legacy.bullet1": "Lettres à des personnes précises",
  "hero.tiles.legacy.bullet2": "Recettes de famille",
  "hero.tiles.legacy.bullet3": "Notes vocales",
  "hero.tiles.legacy.bullet4": "Histoires qui méritent d'être transmises",
  "hero.tiles.ops.title": "Opérationnel",
  "hero.tiles.ops.bullet1": "Clés serveur et API",
  "hero.tiles.ops.bullet2": "Contacts professionnels",
  "hero.tiles.ops.bullet3": "Le runbook que vous seul connaissez",

  "hero.phonePinHook": "Et oui — le code PIN de votre téléphone ne leur donne pas accès à votre cloud. Nous vous montrerons ce qui le fait.",
  "hero.closer.p1": "Tout se passe dans votre navigateur. Nous ne stockons pas votre seed. Nous ne le pouvons pas — aucun appel API ne nous l'envoie.",
  "hero.closer.p2": "Récupérez-le vous-même quand un portefeuille disparaît. Restaurez-le après la mort d'un appareil.",
  "hero.closer.p3": "Ou transmettez-le automatiquement à la personne que vous avez désignée, si vous cessez un jour de donner signe de vie.",
  "hero.cta.getStarted": "Commencer",
  "hero.cta.seeMath": "Voir les maths",

  "hero.video.title": "Toute la preuve, en mouvement.",
  "hero.video.subline": "12 étapes de bout en bout. Chaque primitive, chaque moment air-gap, chaque passage en ligne. Puis vérifiez les calculs vous-même.",
  "hero.video.cta": "La preuve →",

  "hero.shamir.prefix": "En dessous de votre seuil de récupération, le découpage secret de NoKLock est ",
  "hero.shamir.accent": "mathématiquement impossible à casser",
  "hero.shamir.suffix": ". Pas avec les ordinateurs d'aujourd'hui. Pas avec un ordinateur quantique. Jamais.",

  // Tuiles Managed-mode.
  "hero.managed.tiles.signin.title": "Connexion par email ou passkey",
  "hero.managed.tiles.signin.body": "Aucun portefeuille à configurer. Utilisez votre connexion habituelle.",
  "hero.managed.tiles.provision.title": "Nous fournissons le portefeuille",
  "hero.managed.tiles.provision.body": "En coulisses. Vous ne voyez jamais de phrase seed — et nous non plus. La clé est détenue par Privy (notre fournisseur de portefeuille géré), jamais par nous ; de par la conception de Privy, aucune partie ne peut signer sans vous.",
  "hero.managed.tiles.heirEmail.title": "Réclamation par email",
  "hero.managed.tiles.heirEmail.body": "Votre héritier désigné clique sur un lien email pour réclamer. Aucune connaissance crypto requise (s'applique également au modèle d'auto-conservation).",
  "hero.managed.tiles.sameCrypto.title": "La même crypto sous le capot",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD. Le contenu du coffre reste auto-conservé. Seule la couche portefeuille est gérée.",
  "hero.managed.tiles.escape.title": "Sortie de secours vers l'auto-conservation",
  "hero.managed.tiles.escape.body": "Exportez vos clés de portefeuille à tout moment. Migrez vers l'auto-conservation quand vous voulez.",
  "hero.managed.tiles.audience.title": "Pour les personnes de votre vie",
  "hero.managed.tiles.audience.body": "Qui ne configureraient jamais MetaMask — mais qui ont quand même une vie numérique qui mérite d'être transmise.",
  "hero.managed.closer": "Les mêmes maths de coffre. Un portefeuille plus simple. La même honnêteté sur ce que nous voyons et ne voyons pas.",
  "hero.managed.notifyButton": "Prévenez-moi quand c'est prêt",

  "pricing.priced-to-protect": "Un prix pour protéger, pas pour extraire.",
  "card.readHow": "Voir comment →",
  "proof.title": "Des preuves, pas des promesses",
  "proof.loss.k": "Anti-perte",
  "proof.loss.b": "Portefeuille perdu, téléphone mort, une part perdue — n'importe quel seuil des parts restantes plus votre mot de passe maître ramène tout. Le partage est votre filet de sécurité, pas seulement votre déclencheur d'héritage.",
  "proof.tamper.k": "Inviolable",
  "proof.tamper.b": "Chaque part porte un tag AEAD + le manifeste est signé Ed25519. Touchez un octet, la restauration refuse.",
  "proof.spoof.k": "Anti-usurpation",
  "proof.spoof.b": "Les jetons soul-bound ne peuvent pas être transférés. Un attaquant ne peut pas se faire passer pour votre héritier désigné.",
  "proof.inherit.k": "Héritage",
  "proof.inherit.b": "Si vous cessez de donner signe de vie, vos proches désignés héritent automatiquement. Aucun avocat, aucune friction de succession.",
  "proof.airgap.k": "Air-gapped",
  "proof.airgap.b": "Enregistrement en mode avion. Le cœur cryptographique n'a jamais besoin de réseau.",
  "proof.ai.k": "Résistant à l'IA",
  "proof.ai.b": "Votre seed ne s'approche jamais d'un modèle de langage. Aucun entraînement IA, aucun prompt, aucune inférence. Juste des maths déterministes.",
  "proof.fullinfo": "Infos complètes — architecture, fournisseurs, modèle de sécurité, analyse concurrentielle →",
  "more.title": "Plus que la crypto — maintenant disponible",
  "more.body": "Les lettres scellées, le coffre à documents et le coffre à images sont disponibles dès aujourd'hui. Rédigez une lettre scellée, chiffrez un testament, scannez des papiers de famille, sécurisez des archives photo — le même pipeline partage-chiffre-distribue-hérite que votre seed crypto, intégralement dans votre navigateur.",
  "more.cta": "Ouvrir vos coffres →",
  "keyless.titleA": "Pas « sans clé ».",
  "keyless.titleB": "Auto-conservation honnête.",
  "keyless.body": "D'autres portefeuilles prétendent que vous n'avez pas de clés — la plupart sont conservateurs derrière le vernis. NoKLock honore votre phrase seed, puis la rend difficile à perdre, facile à récupérer et prête à transmettre.",
  "keyless.cta": "Pourquoi pas sans clé →",
  "ins.titleA": "Nous n'avons pas d'assurance.",
  "ins.titleB": "Nous n'en avons pas besoin.",
  "ins.body": "Casa, Ledger Recover et Vault12 ont une assurance parce qu'ils détiennent vos clés. L'assurance est leur excuse pour le fait qu'ils peuvent les perdre. NoKLock ne touche jamais vos clés — nous n'avons rien à perdre. C'est la différence.",
  "nav.dashboard": "Tableau de bord",
  "nav.vaults": "Coffres",
  "nav.restore": "Restaurer",
  "nav.proveit": "La preuve",
  "nav.nok": "Désigner un proche",
  "nav.heartbeat": "Signal de vie",
  "nav.deadman": "Bouton homme mort",
  "nav.livemans": "Bouton homme vivant (alertes)",
  "nav.pricing": "Tarifs",
  "nav.refer": "Parrainer et gagner",
  "nav.info": "Infos",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock Enterprise)",
  "nav.settings": "Paramètres",
  "nav.advanced": "Avancé",
  "nav.disconnect": "Déconnecter",
  "nav.reconnecting": "Restauration de la session…",
  "footer.tagline": "Récupération cryptographique auto-conservée pour tout ce que vous ne pouvez pas vous permettre de perdre.",
  "footer.privacy": "Confidentialité",
  "footer.terms": "Conditions d'utilisation",
  "footer.howItWorks": "Comment ça marche",
  // TODO machine-translation (native review pending) — Google Play download surfaces.
  "footer.getAndroidApp": "Obtenir l'app",
  "settings.getAndroidApp.title": "Obtenir l'application Android",
  "settings.getAndroidApp.body": "Installez NoKLock depuis Google Play pour une application sur l'écran d'accueil — même site, plein écran, mises à jour automatiques.",
  "download.title": "Obtenez l'application NoKLock",
  "download.androidNote": "appuyez sur le badge ci-dessus pour installer NoKLock depuis Google Play.",
  "download.iosNote": "ouvrez noklock.app dans Safari → appuyez sur Partager → Sur l'écran d'accueil.",
  "download.comingSoon": "Bientôt sur Google Play",
  "lang.label": "Langue",
  // 2026-05-20 signature-differentiator strings (Option-B restructure).
  "stand.duress.k": "Anti-contrainte",
  "stand.duress.t": "Deux mots de passe, deux coffres.",
  "stand.duress.b": "Coffre leurre optionnel avec son propre mot de passe. Sous contrainte vous livrez le leurre — ils voient un coffre crédible jetable, votre vrai coffre reste caché. Aucun concurrent ne propose cela.",
  "stand.social.k": "Anti-ingénierie-sociale",
  "stand.social.t": "NoKs indépendants M-sur-N.",
  "stand.social.b": "Héritage multi-NoK — la libération exige M signatures sur N depuis des portefeuilles indépendants. Un seul NoK contraint ou compromis ne peut libérer seul. Hameçonner un héritier ne donne pas accès.",
  "stand.noklockproof.k": "Anti-disparition-NoKLock",
  "stand.noklockproof.t": "Si nous disparaissons, ça marche toujours.",
  "stand.noklockproof.b": "La récupération est 100% côté client (vos parts + mot de passe maître). L'héritage est on-chain (Polygon + Chainlink). Self-heartbeat survit même si NoKLock disparaît. Vérifié sur PolygonScan — vous pouvez l'auditer vous-même.",
  "stand.selfcustody.k": "Auto-conservation",
  "stand.selfcustody.t": "Vos clés. Vos données. Toujours.",
  "stand.selfcustody.b": "NoKLock ne voit ni ne touche jamais votre seed, vos parts ou vos données. La chaîne ne stocke que des hash et des pointeurs, jamais du texte clair. Pas de honeypot mutualisé, pas d'override admin, pas d'otage de récupération. Vous détenez tout.",
  "soul.title": "NFTs Soulbound — votre héritage, on-chain",
  "soul.body": "Lorsque vous désignez un héritier, NoKLock émet un seul NFT d'Activation soulbound (ERC-5192) sur Polygon — le déclencheur de l'homme-mort : un héritier, un jeton. Les coffres à quorum M-sur-N ajoutent un NFT de Vote par héritier. Soulbound signifie non transférable — une fois émis, le jeton ne peut être vendu, déplacé, volé ou saisi. C'est une utilisation rare en production du standard ERC-5192, et la seule utilisation connue en production pour l'héritage crypto.",
  "soul.bodyB": "Les trois contrats ci-dessus sont à source vérifiée sur PolygonScan — cliquez sur n'importe quelle adresse pour lire le code déployé. Le SBT est le déclencheur d'héritage réel ; License ne prélève que les USDC que vous avez explicitement approuvés ; le commutateur homme-mort de l'Oracle n'est accessible que via le forwarder.",
  "soul.scoreLabel": "Revue SolidityScan de base · zéro fonds mutualisés, zéro garde de clés, surface d'attaque délibérément réduite",
  "proof.duress.k": "Anti-contrainte",
  "proof.duress.b": "Coffre leurre optionnel avec son propre mot de passe maître. Sous contrainte vous révélez le leurre — ils voient un coffre crédible jetable, le vrai coffre reste caché.",
  "proof.social.k": "Anti-ingénierie-sociale",
  "proof.social.b": "Quorum multi-NoK M-sur-N depuis des portefeuilles indépendants. Un seul NoK contraint ou hameçonné ne peut libérer seul — il échoue à la vérification du quorum.",
  "proof.noklockproof.k": "Anti-disparition-NoKLock",
  "proof.noklockproof.b": "La récupération est 100% côté client. L'héritage s'exécute on-chain via Polygon + Chainlink. Self-heartbeat survit même si NoKLock disparaît demain.",

  // 0.6.0 — simple-vs-max-security framing (TODO: native FR review).
  "landing.proof.simpleMax.headline": "Trois parts éparpillées dans vos propres dossiers",
  "landing.proof.simpleMax.accent": "fait déjà mieux qu'un post-it ou un fichier texte chiffré.",
  "landing.proof.simpleMax.simple": "Voie simple : choisissez trois dossiers sur votre ordinateur portable ou votre téléphone.",
  "landing.proof.simpleMax.max": "Sécurité maximale : répartissez-les sur différents disques, clouds et fournisseurs que vous utilisez déjà.",
  "landing.proof.simpleMax.either": "Dans les deux cas — protection extrême, simplifiée.",

  // 0.6.0 — Pricing FAQ "Téléphone perdu" (TODO: native FR review).
  "pricing.faq.losePhone.question": "Est-ce que je perds l'accès si mon téléphone meurt ?",
  "pricing.faq.losePhone.intro": "Non. Votre seed n'est pas stocké sur votre téléphone. Il est chiffré, divisé en parts via Shamir (3-sur-5 par défaut) et éparpillé sur le stockage que VOUS choisissez.",
  "pricing.faq.losePhone.simple": "Voie simple : trois dossiers sur votre ordinateur ou votre téléphone — déjà plus sûr qu'un post-it ou un fichier texte chiffré.",
  "pricing.faq.losePhone.max": "Sécurité maximale : répartissez-les sur différents comptes cloud, IPFS, Arweave, plusieurs appareils.",
  "pricing.faq.losePhone.either": "Dans les deux cas, vous perdez n'importe quel emplacement et le reste récupère quand même le seed.",
  "pricing.faq.losePhone.secureEnclave": "C'est la différence structurelle avec les produits de type portefeuille matériel. Leur seed est verrouillé dans une clé Secure Enclave / StrongBox qui ne peut pas être exportée de la puce — c'est ce qui rend la puce sûre et fait mourir leur seed avec l'appareil. Ils colmatent cela avec des rituels de phrase de secours papier. NoKLock supprime le point de défaillance unique au lieu de le maquiller.",

  // 0.6.0 — CryptoInheritance Q "Téléphone perdu" (TODO: native FR review).
  "crypto.q.losePhone.question": "Que se passe-t-il si je perds mon téléphone ?",
  "crypto.q.losePhone.intro": "Rien de fatal. Votre seed ne vit pas sur votre téléphone — il vit dans des parts Shamir chiffrées, éparpillées sur le stockage que vous avez choisi à l'enrôlement.",
  "crypto.q.losePhone.simple": "Voie simple : trois dossiers sur vos propres appareils — déjà plus sûr qu'un post-it dans un livre ou un fichier texte chiffré sur votre bureau.",
  "crypto.q.losePhone.max": "Sécurité maximale : répartissez les parts sur différents comptes cloud, IPFS, Arweave, plusieurs disques.",
  "crypto.q.losePhone.either": "Dans les deux cas, perdez n'importe quel emplacement et le reste récupère quand même le seed.",
  "crypto.q.losePhone.secureEnclave": "C'est la différence structurelle avec les produits de type portefeuille matériel. Leur seed est verrouillé dans un seul appareil ; perdez-le sans la sauvegarde papier et c'est fini. Le seed de NoKLock est mathématiquement distribué avant qu'un appareil ne le touche en tant qu'artefact récupérable.",

  // 0.6.0 — Enrol Step B "Deux voies" (TODO: native FR review).
  "enrol.shareUrl.twoRoutes.headline": "Deux voies — choisissez ce qui vous convient aujourd'hui",
  "enrol.shareUrl.twoRoutes.simple": "Simple : placez chaque fichier de part dans un dossier différent sur votre ordinateur, téléphone, clé USB ou là où vous gardez déjà vos fichiers. Laissez le champ URL ci-dessous vide. C'est déjà beaucoup plus sûr qu'un post-it ou un fichier texte chiffré — perdez un dossier, le reste récupère quand même le seed.",
  "enrol.shareUrl.twoRoutes.max": "Sécurité maximale : placez chaque part dans un compte cloud différent (Drive, Dropbox, OneDrive, IPFS, Arweave…) et collez l'URL « toute personne avec le lien » ci-dessous. Cette séparation est tout l'intérêt de la division par seuil : un compte volé ne fuit qu'une seule part, donc votre coffre reste en sécurité. Vous et votre proche pouvez récupérer les parts à distance au lieu d'avoir besoin de chaque fichier sous la main.",
  "enrol.shareUrl.twoRoutes.urlsNote": "Les URL sont optionnelles dans les deux voies. NoKLock ne stocke que l'URL (localement dans ce navigateur, rien n'est envoyé ailleurs) ; les fichiers de parts eux-mêmes ne quittent jamais votre contrôle.",

  // 0.7.0 — Pricing rework keys (TODO: native FR review).
  "pricing.summary.headline": "Deux voies d'accès au même coffre de stockage + restauration",
  "pricing.summary.body": "Self-custody — vous détenez les clés. Managed — nous détenons un portefeuille embarqué Privy pour vous (bientôt disponible, NL-2). Trois paliers pour les deux : Free / Standard / Premium. Tarif Founder sur tous les paliers payants — les 10 000 premières licences payantes de chaque côté.",
  "pricing.tabs.selfCustody": "Self-custody",
  "pricing.tabs.managed": "Managed (bientôt)",
  "pricing.tabs.compare": "Comparer les deux",
  "pricing.tabs.enterprise": "Entreprise",
  "pricing.tabs.faq": "FAQ",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "Annuel",
  "pricing.sku.lifetime": "À vie",
  "pricing.sku.autorenew": "(renouvellement automatique via Paddle)",
  "pricing.managed.comingSoon": "Mode Managed bientôt disponible (NL-2)",
  "pricing.managed.subtitle": "Connectez-vous avec Google / Apple / e-mail. NoKLock détient le portefeuille embarqué pour vous. Les utilisateurs self-custody ne sont pas affectés.",
  "pricing.lifetime.tagline": "Payez une fois. Jamais de renouvellement.",
  "pricing.founder.label": "Tarif Founder — les 10 000 premières licences payantes de chaque côté. Appliqué par contrat pour self-custody, suivi via Form-B pour managed.",
  "pricing.modeLabel.self": "Self-custody — vous détenez les clés",
  "pricing.modeLabel.managed": "Managed — portefeuille embarqué Privy",

  // 0.8.0 — Pricing round-2 copy keys (TODO: native FR review). Cloned from
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
  "tier.requires.standard": "Nécessite Standard — mise à niveau sur /pricing",
  "tier.requires.premium": "Nécessite Premium — mise à niveau sur /pricing",
  "tier.upgrade.cta": "Mettre à niveau",

  // 0.11.0 — Homepage "Day-1 honest note" launch banner. {tests}/{solc} are
  // injected as untranslated numbers at the callsite.
  "landing.day1.badge": "Note de transparence du jour 1",
  "landing.day1.body": "NoKLock vient d'être lancé. Les contrats sont audités. Les tests passent ({tests} sur Solidity {solc}). Deux passes de revue par IA indépendantes sont terminées. Les premières semaines de tout produit réel font malgré tout apparaître des aspérités, des textes qui tombent à côté, des parcours que nous n'avions pas anticipés. Dites-le-nous lorsque vous en trouvez un.",
  "landing.day1.bug": "Un bug trouvé ? Prime →",
  "landing.day1.rough": "Quelque chose qui cloche ? Comment nous le dire →",
  "landing.day1.email": "Écrivez-nous →",
  "landing.day1.dismissForever": "Masquer définitivement",

  // 0.11.0 — Use-cases carousel lead-in.
  "home.useCases.leadIn": "Ce à quoi les gens s'en servent vraiment",

  // 6 catégories de cas d'usage du coffre.
  "vuc.cat.crypto-finance": "Clés crypto & finance",
  "vuc.cat.digital-identity": "Identité numérique & comptes",
  "vuc.cat.hidden-places": "Cachettes & indices physiques",
  "vuc.cat.vital-documents": "Documents essentiels",
  "vuc.cat.final-wishes": "Dernières volontés & lettres personnelles",
  "vuc.cat.recovery-codes": "Codes de récupération & secrets de sauvegarde",

  // 26 cartes du carrousel (titre + accroche). Les noms de marque restent inchangés.
  "vuc.card.crypto-finance:hw-wallet.title": "Seed de portefeuille matériel",
  "vuc.card.crypto-finance:hw-wallet.blurb": "Les 12 ou 24 mots derrière votre Ledger, Trezor ou Tangem.",
  "vuc.card.crypto-finance:soft-wallet.title": "Récupération MetaMask / Rabby",
  "vuc.card.crypto-finance:soft-wallet.blurb": "Phrase de récupération du portefeuille logiciel et toute clé de signataire multisig.",
  "vuc.card.crypto-finance:exchange-codes.title": "Codes de récupération d'échange",
  "vuc.card.crypto-finance:exchange-codes.blurb": "Les codes de sauvegarde imprimés que Coinbase, Kraken ou Binance vous ont donnés à l'inscription.",
  "vuc.card.crypto-finance:pw-manager.title": "Mot de passe maître du gestionnaire",
  "vuc.card.crypto-finance:pw-manager.blurb": "Déverrouille le reste de votre vie financière — 1Password, Bitwarden, Dashlane.",
  "vuc.card.crypto-finance:2fa-seed.title": "Export de la graine 2FA",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Liste de graines Google Authenticator / Authy / Aegis — survit à un téléphone perdu.",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + compte Google",
  "vuc.card.digital-identity:apple-google.blurb": "Identifiants racines qui verrouillent votre téléphone, vos photos, vos contacts et votre e-mail.",
  "vuc.card.digital-identity:social-credentials.title": "Identifiants des réseaux sociaux",
  "vuc.card.digital-identity:social-credentials.blurb": "Mettre en mémoire, publier un dernier message ou fermer selon la politique de chaque plateforme.",
  "vuc.card.digital-identity:domains.title": "Identifiants du registraire de domaines",
  "vuc.card.digital-identity:domains.blurb": "Les domaines expirent en silence — souvent impossibles à récupérer après coup.",
  "vuc.card.digital-identity:cloud-storage.title": "Comptes de stockage cloud",
  "vuc.card.digital-identity:cloud-storage.blurb": "Là où des décennies de photos, documents et projets personnels résident réellement.",
  "vuc.card.hidden-places:safe-deposit-photo.title": "Photo du coffre-fort bancaire",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "Agence, numéro de coffre et où se trouvent la clé + la carte de signature à la maison.",
  "vuc.card.hidden-places:home-safe.title": "Emplacement + combinaison du coffre domestique",
  "vuc.card.hidden-places:home-safe.blurb": "Photo annotée avec la combinaison écrite au dos.",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "Où se cache le portefeuille matériel",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "Au fond de quel tiroir, dans quel livre, sous quelle lame de plancher.",
  "vuc.card.hidden-places:spare-keys.title": "Emplacements des clés de rechange",
  "vuc.card.hidden-places:spare-keys.blurb": "La boîte magnétique sous le passage de roue — inutile si son emplacement meurt avec vous.",
  "vuc.card.hidden-places:hidden-cash.title": "Argent caché & objets de famille",
  "vuc.card.hidden-places:hidden-cash.blurb": "L'enveloppe derrière le tableau, le coffre au sol sous le tapis.",
  "vuc.card.vital-documents:will-trust.title": "Testament signé & acte de fiducie",
  "vuc.card.vital-documents:will-trust.blurb": "Les PDF réellement signés — pas seulement « c'est chez le notaire ».",
  "vuc.card.vital-documents:insurance.title": "PDF des polices d'assurance",
  "vuc.card.vital-documents:insurance.blurb": "Vie, biens et personne-clé — pour qu'aucune police indemnisable ne soit oubliée.",
  "vuc.card.vital-documents:property-deeds.title": "Titres & actes de propriété",
  "vuc.card.vital-documents:property-deeds.blurb": "Preuve de propriété qui transforme des biens physiques en biens transmissibles.",
  "vuc.card.vital-documents:tax-returns.title": "Déclarations fiscales récentes",
  "vuc.card.vital-documents:tax-returns.blurb": "Les 3 à 7 dernières années + le contact direct du comptable.",
  "vuc.card.final-wishes:personal-letters.title": "Lettres à chaque être cher",
  "vuc.card.final-wishes:personal-letters.blurb": "Les choses que vous auriez dites en personne s'il y avait eu le temps.",
  "vuc.card.final-wishes:funeral-prefs.title": "Souhaits funéraires & d'inhumation",
  "vuc.card.final-wishes:funeral-prefs.blurb": "Crémation ou inhumation, la musique, les lectures — votre choix, pas le leur.",
  "vuc.card.final-wishes:ethical-will.title": "Testament éthique",
  "vuc.card.final-wishes:ethical-will.blurb": "Les valeurs, les leçons et les histoires que vous voulez transmettre à la génération suivante.",
  "vuc.card.final-wishes:pet-care.title": "Souhaits pour le soin des animaux",
  "vuc.card.final-wishes:pet-care.blurb": "Qui prend le chien, ce que mange le chat, le nom du vétérinaire et le numéro de puce.",
  "vuc.card.recovery-codes:printed-2fa.title": "Codes de récupération 2FA imprimés",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google, Microsoft, GitHub, AWS, banque — ceux que vous avez rangés.",
  "vuc.card.recovery-codes:yubikey.title": "Liste d'enregistrement YubiKey",
  "vuc.card.recovery-codes:yubikey.blurb": "Numéros de série, comptes enregistrés et où la clé de secours est conservée.",
  "vuc.card.recovery-codes:disk-encryption.title": "Clés de chiffrement de disque",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker, FileVault, LUKS — sans elles, l'ordinateur portable est un presse-papiers.",
  "vuc.card.recovery-codes:gpg-age.title": "Clés privées GPG / Age",
  "vuc.card.recovery-codes:gpg-age.blurb": "Pour quiconque utilise réellement le chiffrement de bout en bout.",

  // 0.11.0 — Info-dropdown menu items.
  "nav.info.appInfo": "Infos de l'app",
  "nav.info.appUpdates": "Mises à jour de l'app",
  "nav.info.enrolWalkthrough": "Guide d'inscription",
  "nav.info.articles": "Articles NoKLock",

  // 0.12.0 — Bloc FSM de Landing : titre + sous-titre.
  "landing.fsm.headline": "Une confiance plus forte que celle de n'importe quel service",
  "landing.fsm.subtitle": "Votre coffre est dans exactement un état à tout moment. Cet état réside sur Polygon, pas sur notre serveur.",

  // 0.12.0 — Diagramme d'automate FSMDiagram.tsx. Noms d'états traduits ;
  // les identifiants de code on-chain (signatures de fonctions + expressions
  // d'ancrage) restent littéraux dans le JSX.
  "fsm.title": "Cycle de vie du coffre NoKLock · automate fini sur Polygon",
  "fsm.subtitle": "chaque état on-chain · chaque transition signée cryptographiquement · vérifiez l'état de votre coffre à tout moment, sans connexion",
  "fsm.transition.timeElapses": "le temps s'écoule",
  "fsm.transition.graceElapses": "le délai de grâce s'écoule",
  "fsm.state.enrolled.name": "INSCRIT",
  "fsm.state.enrolled.desc": "coffre construit localement",
  "fsm.state.heirDesignated.name": "HÉRITIER_DÉSIGNÉ",
  "fsm.state.heirDesignated.desc": "NFT Activation frappé (+ Voting pour le quorum)",
  "fsm.state.alive.name": "VIVANT",
  "fsm.state.alive.desc": "battement de cœur récent",
  "fsm.state.dueSoon.name": "BIENTÔT_DÛ",
  "fsm.state.dueSoon.desc": "fenêtre de grâce qui se vide",
  "fsm.state.inGrace.name": "EN_GRÂCE",
  "fsm.state.inGrace.desc": "en attente de performUpkeep",
  "fsm.state.activated.name": "ACTIVÉ",
  "fsm.state.activated.desc": "le commutateur s'est déclenché",
  "fsm.state.claimed.name": "RÉCLAMÉ",
  "fsm.state.claimed.desc": "l'héritier détient le SBT",
  "fsm.legend.happyPath": "chemin nominal — turquoise qui s'écoule",
  "fsm.legend.heartbeat": "battement de cœur reçu → retour à VIVANT",
  "fsm.legend.sideStates": "branches d'états secondaires",
  "fsm.legend.anchorNote": "Chaque état affiche son ancrage on-chain (la ligne en dessous). Les tirets s'écoulent en continu ; vérifiez l'état en direct de n'importe quel coffre sur PolygonScan.",
};
