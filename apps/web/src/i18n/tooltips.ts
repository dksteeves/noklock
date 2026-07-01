// @version 0.2.0 @date 2026-06-07
// 0.2.0 — Daniel 2026-06-07 (handoff §3.14): "User-owned cloud storage" hint
//         reworded to lead with the storage-agnostic frame ("storage YOU
//         pick — local folders OR YOUR own cloud accounts …, never on our
//         servers") instead of the cloud-only opener. Key updated to the
//         new English (this dictionary is keyed by exact English) plus all
//         5 non-English locale strings reworded in parallel to match the
//         new shape. Voice + parallel structure preserved across en/de/fr/
//         pt/zh-Hans/hi. Mirrors CompetitorTable.tsx 0.6.1 row hint update.
// @version 0.1.0 @date 2026-05-19
// WS-C — ONE dictionary for the ALREADY-EXISTING help affordances
// (InfoTooltip ⓘ mouseovers, the Settings "What is …?" <details>
// expanders, EnrolChooser/HeartbeatPanel native title= tooltips). Keyed
// by the EXACT English text the component already passes — so NO
// callsite/page edits are needed and NO new on-screen element appears
// (zero mouseover conflicts). localizeTip() returns the chosen language
// or, if absent, the English verbatim — never blank, never wrong.
//
// CAVEAT (Daniel-accepted): keys are the English strings. If a hint's
// English wording is edited later, re-sync its entry here; until then it
// safely shows English. Maintaining ~50 strings is trivial.
// zh-Hans / hi first-pass, flagged for native review.

import type { Lang } from "./index.js";

type NonEn = Exclude<Lang, "en">;

const TIP: Record<string, Record<NonEn, string>> = {
  // ── Settings → "What is …?" expanders (summary labels) ──────────────
  "What is threshold?": {
    de: "Was ist der Schwellenwert?", fr: "Qu'est-ce que le seuil ?", pt: "O que é o limiar?",
    "zh-Hans": "什么是阈值？", hi: "थ्रेशोल्ड क्या है?",
  },
  "What is total shares?": {
    de: "Was sind Gesamt-Anteile?", fr: "Que sont les parts totales ?", pt: "O que são fragmentos totais?",
    "zh-Hans": "什么是分片总数？", hi: "कुल शेयर क्या हैं?",
  },
  "What is grace period?": {
    de: "Was ist die Karenzzeit?", fr: "Qu'est-ce que le délai de grâce ?", pt: "O que é o período de tolerância?",
    "zh-Hans": "什么是宽限期？", hi: "ग्रेस अवधि क्या है?",
  },
  // ── Settings expander bodies ───────────────────────────────────────
  "The minimum number of shares needed to reconstruct your secret. With threshold 3 and 5 total shares, any 3 of the 5 can rebuild your seed — but 2 alone are mathematically useless. Higher threshold = harder to lose AND harder to recover. 3 is the standard recommendation.": {
    de: "Die Mindestzahl an Anteilen, um Ihr Geheimnis zu rekonstruieren. Bei Schwellenwert 3 und 5 Anteilen rekonstruieren beliebige 3 von 5 Ihren Seed — 2 allein sind mathematisch nutzlos. Höher = schwerer verlierbar UND schwerer wiederherstellbar. 3 ist die Standardempfehlung.",
    fr: "Le nombre minimum de parts pour reconstruire votre secret. Avec un seuil de 3 et 5 parts au total, 3 quelconques sur 5 reconstruisent votre seed — 2 seules sont mathématiquement inutiles. Plus élevé = plus dur à perdre ET à récupérer. 3 est la recommandation standard.",
    pt: "O número mínimo de fragmentos para reconstruir o seu segredo. Com limiar 3 e 5 fragmentos no total, quaisquer 3 de 5 reconstroem a sua seed — 2 sozinhos são matematicamente inúteis. Mais alto = mais difícil de perder E de recuperar. 3 é a recomendação padrão.",
    "zh-Hans": "重建你的秘密所需的最少分片数。阈值为 3、共 5 份时，任意 3 份即可重建助记词——但仅 2 份在数学上毫无用处。越高 = 越难丢失也越难恢复。建议标准为 3。",
    hi: "आपका रहस्य पुनर्निर्मित करने के लिए न्यूनतम शेयर। थ्रेशोल्ड 3 और कुल 5 शेयर पर, 5 में से कोई भी 3 सीड बना देते हैं — पर अकेले 2 गणितीय रूप से बेकार हैं। अधिक = खोना भी कठिन और पुनर्प्राप्ति भी। मानक अनुशंसा 3 है।",
  },
  "How many encrypted shares your secret gets split into. More shares = more redundancy (e.g. spread across 5 cloud providers in 5 jurisdictions) but more places to manage. Total must be greater than threshold. 5 is the standard recommendation; up to 9 supported.": {
    de: "In wie viele verschlüsselte Anteile Ihr Geheimnis aufgeteilt wird. Mehr Anteile = mehr Redundanz (z. B. über 5 Cloud-Anbieter in 5 Jurisdiktionen) aber mehr zu verwalten. Gesamt muss größer als der Schwellenwert sein. 5 ist Standard; bis 9 unterstützt.",
    fr: "En combien de parts chiffrées votre secret est divisé. Plus de parts = plus de redondance (p. ex. 5 fournisseurs cloud dans 5 juridictions) mais plus à gérer. Le total doit dépasser le seuil. 5 est standard ; jusqu'à 9 pris en charge.",
    pt: "Em quantos fragmentos cifrados o seu segredo é dividido. Mais fragmentos = mais redundância (ex.: 5 nuvens em 5 jurisdições) mas mais a gerir. O total deve ser maior que o limiar. 5 é o padrão; até 9 suportado.",
    "zh-Hans": "你的秘密被拆分成多少个加密分片。分片越多 = 冗余越高（如分布在 5 个司法辖区的 5 个云）但管理点更多。总数必须大于阈值。建议标准为 5；最多支持 9。",
    hi: "आपका रहस्य कितने एन्क्रिप्टेड शेयरों में बँटता है। अधिक शेयर = अधिक रिडंडंसी (जैसे 5 अधिकार-क्षेत्रों के 5 क्लाउड) पर प्रबंधन अधिक। कुल थ्रेशोल्ड से बड़ा होना चाहिए। मानक 5; 9 तक समर्थित।",
  },
  "How long the dead-man's-switch waits before activating your NoK inheritance. If you stop sending heartbeats (signing into the app or signing an on-chain heartbeat tx) for longer than this, your designated NoK can claim your vault. 60 days is the default — short enough to be useful, long enough to survive holidays / illness. Maximum 365 days (1 year). You can extend in advance from the Heartbeat page.": {
    de: "Wie lange der Totmannschalter wartet, bevor die NoK-Vererbung aktiviert wird. Senden Sie länger keine Lebenszeichen (App-Login oder On-Chain-Heartbeat-Tx), kann Ihr benannter NoK den Tresor beanspruchen. Standard 60 Tage — kurz genug nützlich, lang genug für Urlaub/Krankheit. Max. 365 Tage. Im Voraus auf der Heartbeat-Seite verlängerbar.",
    fr: "Combien de temps le bouton homme mort attend avant d'activer l'héritage NoK. Si vous cessez d'envoyer des signaux de vie (connexion ou tx heartbeat on-chain) plus longtemps, votre NoK désigné peut réclamer le coffre. Défaut 60 jours — assez court pour être utile, assez long pour vacances/maladie. Max 365 jours. Prolongeable à l'avance depuis la page Heartbeat.",
    pt: "Quanto tempo o interruptor de homem morto espera antes de ativar a herança do NoK. Se parar de enviar sinais de vida (login ou tx de heartbeat on-chain) por mais tempo, o seu NoK designado pode reclamar o cofre. Padrão 60 dias — curto o suficiente para ser útil, longo o suficiente para férias/doença. Máx. 365 dias. Extensível com antecedência na página Heartbeat.",
    "zh-Hans": "失联触发开关在启用 NoK 继承前等待多久。若你停止发送心跳（登录或链上心跳交易）超过此时长，你指定的 NoK 即可认领保险库。默认 60 天——足够短以实用，足够长以应对假期/疾病。最多 365 天。可在“心跳”页提前延长。",
    hi: "NoK उत्तराधिकार सक्रिय करने से पहले डेड-मैन स्विच कितनी देर प्रतीक्षा करता है। यदि आप इससे अधिक समय तक हार्टबीट (ऐप लॉगिन या ऑन-चेन हार्टबीट tx) नहीं भेजते, तो नामित NoK वॉल्ट का दावा कर सकता है। डिफ़ॉल्ट 60 दिन — उपयोगी रहने जितना छोटा, छुट्टी/बीमारी झेलने जितना लंबा। अधिकतम 365 दिन। हार्टबीट पेज से पहले से बढ़ाएँ।",
  },
  // ── Enrol threshold inputs (InfoTooltip) ───────────────────────────
  "How many encrypted shares are created. Each goes to a separate location (cloud / device / person). More shares = more redundancy and geographic spread.": {
    de: "Wie viele verschlüsselte Anteile erzeugt werden. Jeder geht an einen separaten Ort (Cloud/Gerät/Person). Mehr Anteile = mehr Redundanz und geografische Streuung.",
    fr: "Combien de parts chiffrées sont créées. Chacune va à un endroit distinct (cloud/appareil/personne). Plus de parts = plus de redondance et d'étalement géographique.",
    pt: "Quantos fragmentos cifrados são criados. Cada um vai para um local distinto (nuvem/dispositivo/pessoa). Mais fragmentos = mais redundância e dispersão geográfica.",
    "zh-Hans": "创建多少个加密分片。每个分片存放在不同位置（云/设备/人）。分片越多 = 冗余与地理分散越高。",
    hi: "कितने एन्क्रिप्टेड शेयर बनते हैं। हर एक अलग स्थान (क्लाउड/डिवाइस/व्यक्ति) जाता है। अधिक शेयर = अधिक रिडंडंसी और भौगोलिक फैलाव।",
  },
  "How many of the N shares are needed to rebuild it. Lower = easier for you to recover; higher = harder for an attacker. Common: 3-of-5.": {
    de: "Wie viele der N Anteile zum Wiederaufbau nötig sind. Niedriger = leichter für Sie wiederherzustellen; höher = schwerer für einen Angreifer. Üblich: 3-von-5.",
    fr: "Combien des N parts sont nécessaires pour reconstruire. Plus bas = plus facile à récupérer pour vous ; plus haut = plus dur pour un attaquant. Courant : 3-sur-5.",
    pt: "Quantos dos N fragmentos são precisos para reconstruir. Mais baixo = mais fácil para si recuperar; mais alto = mais difícil para um atacante. Comum: 3-de-5.",
    "zh-Hans": "重建需要 N 个分片中的多少个。越低 = 你越容易恢复；越高 = 攻击者越难。常用：5 取 3。",
    hi: "पुनर्निर्माण के लिए N में से कितने शेयर चाहिए। कम = आपके लिए पुनर्प्राप्ति आसान; अधिक = हमलावर के लिए कठिन। सामान्य: 5 में 3।",
  },
  // ── EnrolChooser native title= ─────────────────────────────────────
  "A crypto seed phrase": { de: "Eine Krypto-Seed-Phrase", fr: "Une phrase seed crypto", pt: "Uma frase-semente cripto", "zh-Hans": "一组加密助记词", hi: "एक क्रिप्टो सीड फ़्रेज़" },
  "A sealed letter": { de: "Ein versiegelter Brief", fr: "Une lettre scellée", pt: "Uma carta selada", "zh-Hans": "一封密封信件", hi: "एक सीलबंद पत्र" },
  "A document": { de: "Ein Dokument", fr: "Un document", pt: "Um documento", "zh-Hans": "一份文档", hi: "एक दस्तावेज़" },
  "An image": { de: "Ein Bild", fr: "Une image", pt: "Uma imagem", "zh-Hans": "一张图片", hi: "एक छवि" },
  // ── HeartbeatPanel native title= ───────────────────────────────────
  "Bypasses the back-end entirely — fully trustless. Costs a few cents in MATIC gas.": {
    de: "Umgeht das Back-End vollständig — komplett vertrauensfrei. Kostet ein paar Cent MATIC-Gas.",
    fr: "Contourne entièrement le back-end — totalement sans confiance. Coûte quelques centimes de gas MATIC.",
    pt: "Ignora totalmente o back-end — totalmente sem confiança. Custa alguns cêntimos de gas MATIC.",
    "zh-Hans": "完全绕过后端——彻底无需信任。花费几美分的 MATIC gas。",
    hi: "बैक-एंड को पूरी तरह बायपास करता है — पूर्णतः ट्रस्टलेस। कुछ सेंट MATIC गैस लगती है।",
  },
  // ── CompetitorTable column hints ───────────────────────────────────
  "Who actually controls the keys/assets. 'Self-custody' means only you do — the provider cannot.": {
    de: "Wer Schlüssel/Vermögen tatsächlich kontrolliert. „Selbstverwahrung“ heißt: nur Sie — der Anbieter nicht.",
    fr: "Qui contrôle réellement les clés/actifs. « Auto-conservation » = vous seul, pas le fournisseur.",
    pt: "Quem controla de facto as chaves/ativos. «Autocustódia» = só você, não o fornecedor.",
    "zh-Hans": "谁真正控制密钥/资产。“自我托管”意味着只有你——服务方不能。",
    hi: "कुंजियाँ/संपत्ति वास्तव में कौन नियंत्रित करता है। 'स्व-अभिरक्षा' = केवल आप — प्रदाता नहीं।",
  },
  "Whether you must submit ID / personal documents to use the service.": {
    de: "Ob Sie zur Nutzung Ausweis/persönliche Dokumente einreichen müssen.",
    fr: "Si vous devez fournir une pièce d'identité / des documents personnels pour utiliser le service.",
    pt: "Se tem de submeter identificação / documentos pessoais para usar o serviço.",
    "zh-Hans": "使用该服务是否必须提交身份证件/个人文件。",
    hi: "सेवा उपयोग हेतु क्या आपको पहचान/व्यक्तिगत दस्तावेज़ देने पड़ते हैं।",
  },
  "Whether it covers more than one type of crypto / wallet (vs. e.g. Bitcoin only).": {
    de: "Ob mehr als eine Krypto-/Wallet-Art abgedeckt ist (vs. z. B. nur Bitcoin).",
    fr: "S'il couvre plus d'un type de crypto/portefeuille (vs. p. ex. Bitcoin seul).",
    pt: "Se cobre mais do que um tipo de cripto/carteira (vs. ex. só Bitcoin).",
    "zh-Hans": "是否支持多种加密/钱包类型（相对于例如仅比特币）。",
    hi: "क्या यह एक से अधिक प्रकार की क्रिप्टो/वॉलेट कवर करता है (बनाम जैसे केवल Bitcoin)।",
  },
  "Inheritance executes automatically by smart contract — no human executor, lawyer, or company step required.": {
    de: "Vererbung läuft automatisch per Smart Contract — kein menschlicher Vollstrecker, Anwalt oder Firmenschritt nötig.",
    fr: "L'héritage s'exécute automatiquement par smart contract — aucun exécuteur humain, avocat ou étape d'entreprise.",
    pt: "A herança executa automaticamente por smart contract — sem executor humano, advogado ou passo da empresa.",
    "zh-Hans": "继承由智能合约自动执行——无需人工执行人、律师或公司环节。",
    hi: "उत्तराधिकार स्मार्ट कॉन्ट्रैक्ट द्वारा स्वतः निष्पादित — कोई मानव निष्पादक, वकील या कंपनी चरण आवश्यक नहीं।",
  },
  "A referral-reward programme run entirely by the smart contract, not a company-managed scheme.": {
    de: "Ein Empfehlungsprogramm, vollständig vom Smart Contract gesteuert, kein firmenverwaltetes Schema.",
    fr: "Un programme de parrainage entièrement géré par le smart contract, pas un dispositif géré par l'entreprise.",
    pt: "Um programa de recomendação totalmente gerido pelo smart contract, não um esquema gerido pela empresa.",
    "zh-Hans": "完全由智能合约运行的推荐奖励计划，而非公司管理的方案。",
    hi: "पूर्णतः स्मार्ट कॉन्ट्रैक्ट द्वारा संचालित रेफ़रल-इनाम कार्यक्रम, कंपनी-प्रबंधित योजना नहीं।",
  },
  // ── CompetitorTable row hints ──────────────────────────────────────
  "Only you ever hold the keys/secret. The provider cannot access, freeze, or lose your assets because it never has them.": {
    de: "Nur Sie halten je die Schlüssel/das Geheimnis. Der Anbieter kann nicht zugreifen, einfrieren oder verlieren, weil er sie nie hat.",
    fr: "Vous seul détenez les clés/le secret. Le fournisseur ne peut pas accéder, geler ou perdre vos actifs car il ne les a jamais.",
    pt: "Só você detém as chaves/o segredo. O fornecedor não pode aceder, congelar ou perder os seus ativos porque nunca os tem.",
    "zh-Hans": "只有你持有密钥/秘密。服务方无法访问、冻结或丢失你的资产，因为它从不拥有它们。",
    hi: "कुंजियाँ/रहस्य केवल आपके पास। प्रदाता पहुँच, फ़्रीज़ या खो नहीं सकता क्योंकि वे उसके पास कभी नहीं होते।",
  },
  "Your encrypted recovery shares live in storage YOU pick — local folders OR YOUR own cloud accounts (Drive, Dropbox, iCloud…), never on our servers.": {
    de: "Ihre verschlüsselten Anteile liegen in SELBST gewähltem Speicher — lokale Ordner ODER IHRE eigenen Cloud-Konten (Drive, Dropbox, iCloud…), niemals auf unseren Servern.",
    fr: "Vos parts chiffrées sont dans le stockage QUE VOUS choisissez — dossiers locaux OU VOS propres comptes cloud (Drive, Dropbox, iCloud…), jamais sur nos serveurs.",
    pt: "Os seus fragmentos cifrados ficam no armazenamento QUE VOCÊ escolhe — pastas locais OU nas SUAS contas de nuvem (Drive, Dropbox, iCloud…), nunca nos nossos servidores.",
    "zh-Hans": "你的加密恢复分片存放在你自选的存储位置——本地文件夹或你自己的云账户（Drive、Dropbox、iCloud…），绝不在我们的服务器上。",
    hi: "आपके एन्क्रिप्टेड शेयर आपकी चुनी हुई जगह में रहते हैं — स्थानीय फ़ोल्डर या आपके अपने क्लाउड खाते (Drive, Dropbox, iCloud…), हमारे सर्वर पर कभी नहीं।",
  },
  "You can create the vault with the device fully offline, so the secret never touches the internet at all.": {
    de: "Sie können den Tresor mit vollständig offline-Gerät erstellen — das Geheimnis berührt das Internet nie.",
    fr: "Vous pouvez créer le coffre avec l'appareil totalement hors ligne ; le secret ne touche jamais Internet.",
    pt: "Pode criar o cofre com o dispositivo totalmente offline; o segredo nunca toca a internet.",
    "zh-Hans": "你可在设备完全离线时创建保险库，秘密完全不接触互联网。",
    hi: "आप डिवाइस को पूर्णतः ऑफ़लाइन रखकर वॉल्ट बना सकते हैं; रहस्य इंटरनेट को कभी नहीं छूता।",
  },
  "A second 'decoy' vault that opens with a different password — so if you're forced to unlock under threat, you can hand over the decoy.": {
    de: "Ein zweiter „Köder“-Tresor mit anderem Passwort — werden Sie unter Druck gezwungen, geben Sie den Köder her.",
    fr: "Un second coffre « leurre » avec un autre mot de passe — si on vous force, vous donnez le leurre.",
    pt: "Um segundo cofre «isco» com outra palavra-passe — se for forçado, entrega o isco.",
    "zh-Hans": "用不同密码打开的第二个“诱饵”保险库——若被胁迫解锁，你可交出诱饵。",
    hi: "अलग पासवर्ड से खुलने वाला दूसरा 'छद्म' वॉल्ट — दबाव में मजबूर होने पर छद्म सौंप दें।",
  },
  "Your recovery is spread across several independent places, so losing any one of them does not lock you out.": {
    de: "Ihre Wiederherstellung verteilt sich auf mehrere unabhängige Orte — der Verlust eines sperrt Sie nicht aus.",
    fr: "Votre récupération est répartie sur plusieurs endroits indépendants ; en perdre un ne vous bloque pas.",
    pt: "A sua recuperação está espalhada por vários locais independentes; perder um não o tranca para fora.",
    "zh-Hans": "你的恢复分散在多个独立位置，丢失其中任一个都不会把你锁在外面。",
    hi: "आपकी पुनर्प्राप्ति कई स्वतंत्र स्थानों में फैली है; किसी एक को खोना आपको बाहर नहीं करता।",
  },
  "Inheritance rights are granted by a non-transferable token sent to your heir's wallet — it cannot be sold, moved, or stolen.": {
    de: "Erbrechte per nicht übertragbarem Token an die Wallet Ihres Erben — nicht verkaufbar, verschiebbar oder stehlbar.",
    fr: "Les droits d'héritage sont accordés par un jeton non transférable envoyé au portefeuille de l'héritier — invendable, indéplaçable, involable.",
    pt: "Direitos de herança concedidos por um token não transferível enviado à carteira do herdeiro — não se vende, move ou rouba.",
    "zh-Hans": "继承权通过发送到继承人钱包的不可转让代币授予——无法出售、转移或被盗。",
    hi: "उत्तराधिकार अधिकार आपके उत्तराधिकारी के वॉलेट में भेजे गए अहस्तांतरणीय टोकन से दिए जाते हैं — बेचा, हटाया या चुराया नहीं जा सकता।",
  },
  "Use a Ledger/Trezor for on-chain actions the standard way — through MetaMask, Trust, or WalletConnect. We deliberately run no custom USB driver, and a hardware wallet never holds your vault's encryption secret (that layer is offline and wallet-agnostic by design).": {
    de: "Nutzen Sie Ledger/Trezor für On-Chain-Aktionen auf Standardweg — über MetaMask, Trust oder WalletConnect. Bewusst kein eigener USB-Treiber; eine Hardware-Wallet hält nie das Verschlüsselungsgeheimnis Ihres Tresors (diese Schicht ist offline und wallet-unabhängig).",
    fr: "Utilisez un Ledger/Trezor pour les actions on-chain de façon standard — via MetaMask, Trust ou WalletConnect. Aucun pilote USB maison ; un portefeuille matériel ne détient jamais le secret de chiffrement du coffre (cette couche est hors ligne et indépendante du portefeuille).",
    pt: "Use um Ledger/Trezor para ações on-chain do modo padrão — via MetaMask, Trust ou WalletConnect. Sem driver USB próprio; uma carteira de hardware nunca detém o segredo de cifragem do cofre (essa camada é offline e independente da carteira).",
    "zh-Hans": "以标准方式（通过 MetaMask、Trust 或 WalletConnect）用 Ledger/Trezor 进行链上操作。我们刻意不使用自定义 USB 驱动；硬件钱包绝不持有保险库的加密秘密（该层离线且与钱包无关）。",
    hi: "ऑन-चेन क्रियाओं हेतु Ledger/Trezor मानक तरीके से — MetaMask, Trust या WalletConnect के माध्यम से। जानबूझकर कोई कस्टम USB ड्राइवर नहीं; हार्डवेयर वॉलेट कभी वॉल्ट का एन्क्रिप्शन रहस्य नहीं रखता (वह परत ऑफ़लाइन व वॉलेट-निरपेक्ष है)।",
  },
  "Works with wallets that require several signatures to approve a transaction.": {
    de: "Funktioniert mit Wallets, die mehrere Signaturen für eine Transaktion verlangen.",
    fr: "Fonctionne avec les portefeuilles exigeant plusieurs signatures pour approuver une transaction.",
    pt: "Funciona com carteiras que exigem várias assinaturas para aprovar uma transação.",
    "zh-Hans": "兼容需要多个签名才能批准交易的钱包。",
    hi: "उन वॉलेट के साथ काम करता है जिन्हें लेन-देन स्वीकृति हेतु कई हस्ताक्षर चाहिए।",
  },
  "NoK = next-of-kin: the person who can inherit access if something happens to you.": {
    de: "NoK = Angehörige(r): die Person, die Zugang erbt, wenn Ihnen etwas zustößt.",
    fr: "NoK = proche : la personne qui hérite de l'accès s'il vous arrive quelque chose.",
    pt: "NoK = familiar: a pessoa que herda o acesso se algo lhe acontecer.",
    "zh-Hans": "NoK = 近亲：若你出事，可继承访问权的人。",
    hi: "NoK = परिजन: यदि आपको कुछ हो जाए तो पहुँच का उत्तराधिकारी व्यक्ति।",
  },
  "If you stop periodically checking in, the system assumes you're gone and lets your heir begin the inheritance process.": {
    de: "Hören Sie auf, sich regelmäßig zu melden, nimmt das System an, Sie sind weg, und lässt Ihren Erben den Vererbungsprozess starten.",
    fr: "Si vous cessez de pointer régulièrement, le système suppose votre absence et laisse votre héritier lancer l'héritage.",
    pt: "Se parar de fazer check-in periódico, o sistema assume que partiu e deixa o herdeiro iniciar a herança.",
    "zh-Hans": "若你停止定期签到，系统认定你已离开，并让继承人启动继承流程。",
    hi: "यदि आप समय-समय पर चेक-इन करना बंद कर दें, सिस्टम मानता है आप नहीं रहे और उत्तराधिकारी को प्रक्रिया शुरू करने देता है।",
  },
  "Name several heirs and require, say, any 2 of 3 to agree before inheritance proceeds.": {
    de: "Benennen Sie mehrere Erben und verlangen Sie z. B. 2 von 3 Zustimmungen, bevor die Vererbung läuft.",
    fr: "Nommez plusieurs héritiers et exigez, p. ex., l'accord de 2 sur 3 avant l'héritage.",
    pt: "Nomeie vários herdeiros e exija, ex., concordância de 2 de 3 antes de a herança avançar.",
    "zh-Hans": "指定多位继承人，并要求例如 3 人中任意 2 人同意后继承才进行。",
    hi: "कई उत्तराधिकारी नामित करें और, मान लें, 3 में से 2 की सहमति आवश्यक करें तभी उत्तराधिकार आगे बढ़े।",
  },
  "A guided dry-run that proves you can actually rebuild your vault from your shares — before you ever need to.": {
    de: "Ein geführter Probelauf, der beweist, dass Sie Ihren Tresor wirklich aus den Anteilen wiederherstellen können — bevor Sie es je müssen.",
    fr: "Un essai guidé qui prouve que vous pouvez vraiment reconstruire votre coffre depuis vos parts — avant d'en avoir besoin.",
    pt: "Um ensaio guiado que prova que consegue mesmo reconstruir o cofre a partir dos fragmentos — antes de precisar.",
    "zh-Hans": "一次引导式演练，在你真正需要之前证明你确实能用分片重建保险库。",
    hi: "एक निर्देशित अभ्यास जो सिद्ध करता है कि आप वास्तव में अपने शेयरों से वॉल्ट पुनर्निर्मित कर सकते हैं — ज़रूरत पड़ने से पहले।",
  },
  "Optional Face / Touch / security-key unlock on a device. It's a convenience — your master password still works everywhere and stays your primary key.": {
    de: "Optionales Face-/Touch-/Sicherheitsschlüssel-Entsperren auf einem Gerät. Komfort — Ihr Master-Passwort funktioniert überall und bleibt Hauptschlüssel.",
    fr: "Déverrouillage optionnel Face/Touch/clé de sécurité sur un appareil. Un confort — votre mot de passe maître marche partout et reste la clé principale.",
    pt: "Desbloqueio opcional Face/Touch/chave de segurança num dispositivo. Conveniência — a palavra-passe mestra funciona em todo o lado e continua a chave principal.",
    "zh-Hans": "设备上可选的 Face/Touch/安全密钥解锁。仅为便利——主密码处处可用并仍是你的主钥匙。",
    hi: "किसी डिवाइस पर वैकल्पिक Face/Touch/सुरक्षा-कुंजी अनलॉक। सुविधा मात्र — मास्टर पासवर्ड हर जगह काम करता है और मुख्य कुंजी बना रहता है।",
  },
  "We never use text-message codes — those can be stolen by hijacking your phone number (a 'SIM swap').": {
    de: "Wir nutzen nie SMS-Codes — die lassen sich durch Übernahme Ihrer Rufnummer stehlen („SIM-Swap“).",
    fr: "Nous n'utilisons jamais de codes SMS — volables en détournant votre numéro (« SIM swap »).",
    pt: "Nunca usamos códigos SMS — podem ser roubados sequestrando o seu número (um «SIM swap»).",
    "zh-Hans": "我们绝不使用短信验证码——它们可通过劫持你的手机号（“SIM 交换”）被盗。",
    hi: "हम कभी SMS कोड उपयोग नहीं करते — वे आपका फ़ोन नंबर हाईजैक कर ('SIM स्वैप') चुराए जा सकते हैं।",
  },
  "You choose how many of your share files are needed to recover — e.g. any 3 of 5.": {
    de: "Sie wählen, wie viele Ihrer Anteilsdateien zur Wiederherstellung nötig sind — z. B. beliebige 3 von 5.",
    fr: "Vous choisissez combien de vos fichiers de parts sont nécessaires pour récupérer — p. ex. 3 sur 5.",
    pt: "Escolhe quantos dos seus ficheiros de fragmentos são precisos para recuperar — ex. 3 de 5.",
    "zh-Hans": "你选择恢复需要多少个分片文件——例如 5 取 3。",
    hi: "आप चुनते हैं कि पुनर्प्राप्ति हेतु कितनी शेयर फ़ाइलें चाहिए — जैसे 5 में कोई 3।",
  },
  "Store more than one wallet recovery phrase inside a single vault.": {
    de: "Mehr als eine Wallet-Wiederherstellungsphrase in einem einzigen Tresor speichern.",
    fr: "Stocker plusieurs phrases de récupération de portefeuille dans un seul coffre.",
    pt: "Guardar mais do que uma frase de recuperação de carteira num único cofre.",
    "zh-Hans": "在单个保险库中存储多于一个钱包恢复短语。",
    hi: "एक ही वॉल्ट में एक से अधिक वॉलेट रिकवरी फ़्रेज़ संग्रहित करें।",
  },
  "Track a wallet by its public address without storing any private keys.": {
    de: "Eine Wallet über ihre öffentliche Adresse verfolgen, ohne private Schlüssel zu speichern.",
    fr: "Suivre un portefeuille par son adresse publique sans stocker de clés privées.",
    pt: "Acompanhar uma carteira pelo endereço público sem guardar chaves privadas.",
    "zh-Hans": "通过公开地址追踪钱包，而不存储任何私钥。",
    hi: "बिना कोई निजी कुंजी संग्रहित किए सार्वजनिक पते से वॉलेट ट्रैक करें।",
  },
  "Shows your heir the wallet's value at the moment they inherit.": {
    de: "Zeigt Ihrem Erben den Wallet-Wert im Moment der Vererbung.",
    fr: "Montre à votre héritier la valeur du portefeuille au moment de l'héritage.",
    pt: "Mostra ao herdeiro o valor da carteira no momento da herança.",
    "zh-Hans": "在继承时向继承人显示钱包价值。",
    hi: "उत्तराधिकार के समय आपके उत्तराधिकारी को वॉलेट का मूल्य दिखाता है।",
  },
  "A vault two people (e.g. partners) can manage together.": {
    de: "Ein Tresor, den zwei Personen (z. B. Partner) gemeinsam verwalten.",
    fr: "Un coffre que deux personnes (p. ex. partenaires) gèrent ensemble.",
    pt: "Um cofre que duas pessoas (ex. parceiros) podem gerir em conjunto.",
    "zh-Hans": "两人（如伴侣）可共同管理的保险库。",
    hi: "एक वॉल्ट जिसे दो लोग (जैसे साथी) मिलकर प्रबंधित कर सकते हैं।",
  },
  "Planned support for the inheritance token on additional blockchains after launch.": {
    de: "Geplante Unterstützung des Vererbungstokens auf weiteren Blockchains nach dem Start.",
    fr: "Prise en charge prévue du jeton d'héritage sur d'autres blockchains après le lancement.",
    pt: "Suporte planeado do token de herança em blockchains adicionais após o lançamento.",
    "zh-Hans": "上线后计划在更多区块链上支持继承代币。",
    hi: "लॉन्च के बाद अतिरिक्त ब्लॉकचेन पर उत्तराधिकार टोकन हेतु नियोजित समर्थन।",
  },
  "Whether losses are insured. NoKLock is non-custodial — we never hold your assets, so there is nothing for us to insure or lose. (Custodial providers carry insurance because they DO hold your keys.)": {
    de: "Ob Verluste versichert sind. NoKLock ist nicht-verwahrend — wir halten nie Ihr Vermögen, also nichts zu versichern oder zu verlieren. (Verwahrende Anbieter versichern, weil sie Ihre Schlüssel halten.)",
    fr: "Si les pertes sont assurées. NoKLock est non-conservateur — nous ne détenons jamais vos actifs, rien à assurer ou perdre. (Les conservateurs s'assurent car ils détiennent vos clés.)",
    pt: "Se as perdas estão seguradas. NoKLock é não-custodial — nunca detemos os seus ativos, nada a segurar ou perder. (Os custodiais têm seguro porque detêm as suas chaves.)",
    "zh-Hans": "损失是否有保险。NoKLock 非托管——我们从不持有你的资产，故无可投保或损失。（托管方投保是因为他们持有你的密钥。）",
    hi: "क्या हानियाँ बीमित हैं। NoKLock नॉन-कस्टोडियल — हम आपकी संपत्ति कभी नहीं रखते, अतः बीमा या हानि कुछ नहीं। (कस्टोडियल प्रदाता बीमा रखते हैं क्योंकि वे आपकी कुंजियाँ रखते हैं।)",
  },
  "How the contracts were checked. We use automated security scanning + public source verification on PolygonScan. We do NOT claim a paid third-party human audit — stated honestly; read the source yourself on the Contracts tab.": {
    de: "Wie die Contracts geprüft wurden: automatisiertes Security-Scanning + öffentliche Quellverifizierung auf PolygonScan. Wir behaupten KEIN bezahltes Drittpartei-Audit — ehrlich gesagt; lesen Sie den Quellcode selbst im Contracts-Tab.",
    fr: "Comment les contrats ont été vérifiés : scan de sécurité automatisé + vérification publique du code sur PolygonScan. Nous ne revendiquons AUCUN audit humain tiers payant — dit honnêtement ; lisez le code vous-même dans l'onglet Contrats.",
    pt: "Como os contratos foram verificados: scan de segurança automatizado + verificação pública do código no PolygonScan. NÃO alegamos auditoria humana paga de terceiros — dito com honestidade; leia o código no separador Contratos.",
    "zh-Hans": "合约如何被检查：自动安全扫描 + 在 PolygonScan 上的公开源代码验证。我们不声称付费的第三方人工审计——如实说明；可在“合约”标签自行查看源代码。",
    hi: "अनुबंध कैसे जाँचे गए: स्वचालित सुरक्षा स्कैन + PolygonScan पर सार्वजनिक स्रोत सत्यापन। हम भुगतान वाला तृतीय-पक्ष मानव ऑडिट होने का दावा नहीं करते — ईमानदारी से; Contracts टैब में स्वयं स्रोत पढ़ें।",
  },
  "What you get for responsibly reporting a security flaw. We give a free Lifetime licence (no cash bounty programme).": {
    de: "Was Sie für verantwortungsvolles Melden einer Sicherheitslücke erhalten: eine kostenlose Lifetime-Lizenz (kein Geld-Bounty-Programm).",
    fr: "Ce que vous obtenez pour le signalement responsable d'une faille : une licence Lifetime gratuite (pas de programme de prime en argent).",
    pt: "O que recebe por reportar responsavelmente uma falha: uma licença Lifetime gratuita (sem programa de recompensa em dinheiro).",
    "zh-Hans": "负责任地报告安全漏洞可获得：一个免费的终身许可（无现金赏金计划）。",
    hi: "सुरक्षा खामी की ज़िम्मेदार रिपोर्ट पर आपको मिलता है: एक मुफ़्त लाइफ़टाइम लाइसेंस (कोई नकद बाउंटी कार्यक्रम नहीं)।",
  },
  "Referral discounts and rewards are executed automatically by the smart contract — no company payout team, no claim form.": {
    de: "Empfehlungsrabatte und -prämien werden automatisch vom Smart Contract ausgeführt — kein Auszahlungsteam, kein Antragsformular.",
    fr: "Remises et récompenses de parrainage exécutées automatiquement par le smart contract — aucune équipe de paiement, aucun formulaire.",
    pt: "Descontos e recompensas de recomendação executados automaticamente pelo smart contract — sem equipa de pagamentos, sem formulário.",
    "zh-Hans": "推荐折扣与奖励由智能合约自动执行——无公司支付团队，无申领表单。",
    hi: "रेफ़रल छूट व इनाम स्मार्ट कॉन्ट्रैक्ट द्वारा स्वतः निष्पादित — कोई कंपनी भुगतान टीम नहीं, कोई दावा फ़ॉर्म नहीं।",
  },
  "Pay once instead of an annual subscription. NoKLock Lifetime is $299 at the Founder price, $499 afterwards — read live from the contract.": {
    de: "Einmal zahlen statt Jahresabo. NoKLock Lifetime: 299 $ zum Founder-Preis, danach 499 $ — live aus dem Contract gelesen.",
    fr: "Payer une fois au lieu d'un abonnement annuel. NoKLock Lifetime : 299 $ au prix Founder, 499 $ ensuite — lu en direct depuis le contrat.",
    pt: "Pague uma vez em vez de subscrição anual. NoKLock Lifetime: 299 $ ao preço Founder, 499 $ depois — lido em direto do contrato.",
    "zh-Hans": "一次性付费而非年度订阅。NoKLock Lifetime：Founder 价 299 美元，之后 499 美元——从合约实时读取。",
    hi: "वार्षिक सदस्यता के बजाय एक बार भुगतान। NoKLock Lifetime: Founder मूल्य पर $299, बाद में $499 — अनुबंध से लाइव पढ़ा।",
  },
  "How ongoing payment works. NoKLock takes a USDC payment on-chain at mint/renewal — no card, no stored billing.": {
    de: "Wie laufende Zahlung funktioniert: NoKLock nimmt eine USDC-Zahlung on-chain bei Mint/Verlängerung — keine Karte, keine gespeicherte Abrechnung.",
    fr: "Comment fonctionne le paiement continu : NoKLock prend un paiement USDC on-chain au mint/renouvellement — sans carte, sans facturation stockée.",
    pt: "Como funciona o pagamento contínuo: NoKLock cobra um pagamento USDC on-chain no mint/renovação — sem cartão, sem faturação guardada.",
    "zh-Hans": "持续付款如何运作：NoKLock 在铸造/续期时进行链上 USDC 付款——无银行卡，无存储账单。",
    hi: "सतत भुगतान कैसे काम करता है: NoKLock मिंट/नवीनीकरण पर ऑन-चेन USDC भुगतान लेता है — कोई कार्ड नहीं, कोई संग्रहित बिलिंग नहीं।",
  },
  "A repeating self-check that your vault and its shares are still intact and recoverable.": {
    de: "Eine wiederkehrende Selbstprüfung, dass Tresor und Anteile noch intakt und wiederherstellbar sind.",
    fr: "Une auto-vérification récurrente que votre coffre et ses parts sont toujours intacts et récupérables.",
    pt: "Uma autoverificação recorrente de que o cofre e os fragmentos continuam intactos e recuperáveis.",
    "zh-Hans": "定期自检你的保险库及其分片仍然完好且可恢复。",
    hi: "एक आवर्ती स्व-जाँच कि आपका वॉल्ट और शेयर अब भी अक्षुण्ण व पुनर्प्राप्ति-योग्य हैं।",
  },
  "The encryption code is open for anyone to inspect (published at/after launch).": {
    de: "Der Verschlüsselungscode ist für alle einsehbar (veröffentlicht zum/nach dem Start).",
    fr: "Le code de chiffrement est ouvert à l'inspection de tous (publié au/après lancement).",
    pt: "O código de cifragem está aberto a inspeção de qualquer pessoa (publicado no/após o lançamento).",
    "zh-Hans": "加密代码对任何人开放查阅（在发布时/之后公开）。",
    hi: "एन्क्रिप्शन कोड किसी के भी निरीक्षण हेतु खुला है (लॉन्च पर/बाद प्रकाशित)।",
  },
  "It is structurally impossible for the system to access your secrets — a property of how it's built, not a policy promise.": {
    de: "Es ist strukturell unmöglich, dass das System auf Ihre Geheimnisse zugreift — Eigenschaft der Bauweise, kein Richtlinienversprechen.",
    fr: "Il est structurellement impossible au système d'accéder à vos secrets — une propriété de conception, pas une promesse de politique.",
    pt: "É estruturalmente impossível o sistema aceder aos seus segredos — uma propriedade da construção, não uma promessa de política.",
    "zh-Hans": "系统在结构上无法访问你的秘密——这是构建方式的属性，而非政策承诺。",
    hi: "सिस्टम का आपके रहस्यों तक पहुँचना संरचनात्मक रूप से असंभव है — यह निर्माण का गुण है, नीति वादा नहीं।",
  },
  "The contracts' automated security score is shown live on the site — not merely asserted in marketing.": {
    de: "Der automatisierte Security-Score der Contracts wird live auf der Seite gezeigt — nicht nur im Marketing behauptet.",
    fr: "Le score de sécurité automatisé des contrats est affiché en direct sur le site — pas seulement affirmé dans le marketing.",
    pt: "A pontuação de segurança automatizada dos contratos é mostrada em direto no site — não apenas afirmada no marketing.",
    "zh-Hans": "合约的自动安全评分在网站上实时显示——而非仅在营销中声称。",
    hi: "अनुबंधों का स्वचालित सुरक्षा स्कोर साइट पर लाइव दिखाया जाता है — केवल मार्केटिंग में दावा नहीं।",
  },
  "Recover it yourself, via trusted contacts in an emergency, or have your heir inherit after you're gone — three separate paths.": {
    de: "Selbst wiederherstellen, im Notfall über vertraute Kontakte, oder Ihr Erbe erbt nach Ihrem Tod — drei getrennte Wege.",
    fr: "Récupérez vous-même, via des contacts de confiance en urgence, ou laissez votre héritier hériter après vous — trois voies distinctes.",
    pt: "Recupere você mesmo, via contactos de confiança numa emergência, ou deixe o herdeiro herdar após a sua morte — três vias separadas.",
    "zh-Hans": "自行恢复、紧急时经可信联系人、或在你身故后由继承人继承——三条独立路径。",
    hi: "स्वयं पुनर्प्राप्त करें, आपात स्थिति में विश्वसनीय संपर्कों के माध्यम से, या आपके जाने बाद उत्तराधिकारी को विरासत — तीन अलग मार्ग।",
  },
  // 0.5.2 truthfulness-audit cleanup 2026-06-03: orphan tooltip entry for the
  // deleted "Web Worker isolation of crypto core" row REMOVED entirely (was a
  // false claim — no Worker exists; crypto runs on main thread). The CSP
  // tooltip below is updated to match the new "Strict Content-Security-Policy"
  // hint shipped in CompetitorTable 0.5.2.
  "Browser-level header restricting which scripts can run — blocks injected or malicious code from tampering with the app.": {
    de: "Browser-Header, der einschränkt, welche Skripte ausgeführt werden dürfen — blockiert eingeschleusten oder bösartigen Code beim Manipulieren der App.",
    fr: "En-tête au niveau du navigateur restreignant quels scripts peuvent s'exécuter — bloque les codes injectés ou malveillants d'altérer l'app.",
    pt: "Cabeçalho do navegador que restringe quais scripts podem correr — bloqueia código injetado ou malicioso de adulterar a app.",
    "zh-Hans": "浏览器级头部，限制哪些脚本可运行——阻止注入或恶意代码篡改应用。",
    hi: "ब्राउज़र-स्तरीय हेडर जो यह सीमित करता है कि कौन सी स्क्रिप्ट चल सकती है — इंजेक्ट किए गए या दुर्भावनापूर्ण कोड को ऐप से छेड़छाड़ से रोकता है।",
  },
  "Blockchain reads go through our proxy so public blockchain nodes don't see your IP address (with a fallback if our proxy is down).": {
    de: "Blockchain-Abfragen laufen über unseren Proxy, damit öffentliche Nodes Ihre IP nicht sehen (mit Fallback, falls der Proxy ausfällt).",
    fr: "Les lectures blockchain passent par notre proxy pour que les nœuds publics ne voient pas votre IP (avec repli si le proxy tombe).",
    pt: "As leituras blockchain passam pelo nosso proxy para que os nós públicos não vejam o seu IP (com recurso se o proxy cair).",
    "zh-Hans": "区块链读取经我们的代理，使公共节点看不到你的 IP（代理故障时有回退）。",
    hi: "ब्लॉकचेन रीड हमारे प्रॉक्सी से होते हैं ताकि सार्वजनिक नोड आपका IP न देखें (प्रॉक्सी बंद होने पर फ़ॉलबैक सहित)।",
  },
  "Trusted contacts can help you recover, with a built-in delay during which you can cancel a malicious attempt.": {
    de: "Vertraute Kontakte können bei der Wiederherstellung helfen, mit eingebauter Verzögerung, in der Sie einen bösartigen Versuch abbrechen können.",
    fr: "Des contacts de confiance peuvent aider à récupérer, avec un délai intégré pendant lequel vous pouvez annuler une tentative malveillante.",
    pt: "Contactos de confiança podem ajudar a recuperar, com um atraso integrado durante o qual pode cancelar uma tentativa maliciosa.",
    "zh-Hans": "可信联系人可协助你恢复，内置延迟期内你可取消恶意尝试。",
    hi: "विश्वसनीय संपर्क पुनर्प्राप्ति में मदद कर सकते हैं, अंतर्निहित विलंब के दौरान आप दुर्भावनापूर्ण प्रयास रद्द कर सकते हैं।",
  },
};

/** Returns the localized hint, or the English verbatim if not in the
 *  dictionary or lang is English. Never blank, never wrong. */
export function localizeTip(lang: Lang, en: string): string {
  if (lang === "en") return en;
  return TIP[en]?.[lang] ?? en;
}
