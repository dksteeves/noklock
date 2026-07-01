// @version 0.11.0 @date 2026-06-13  ·  हिन्दी / Hindi
// 0.11.0 — Daniel 2026-06-13: English-only-surface i18n sweep mirroring
//          en.ts 0.12.0 — three previously-hardcoded funnel/nav surfaces:
//            (1) landing.day1.* — homepage "Day-1 honest note" launch banner.
//            (2) home.useCases.leadIn + vuc.cat.* (6) + vuc.card.* (26×2) —
//                homepage use-cases carousel lead-in, category labels, cards.
//            (3) nav.info.{appInfo,appUpdates,enrolWalkthrough} — Info-dropdown
//                menu items (NoKLock.white + Asserro reuse nav.whitelabel /
//                nav.corporate). MACHINE-TRANSLATION starting point — TODO
//                native HI review (English remains authoritative). Brand /
//                product names (Ledger, MetaMask, 1Password…) kept verbatim.
// @version 0.10.0 @date 2026-06-08  ·  हिन्दी / Hindi
// 0.10.0 — Daniel 2026-06-08 round-5: managed-hero tile copy mirror — 3 key
//         value updates from en.ts (hero.managed.tiles.provision.body
//         expanded with Privy secure-enclave detail; hero.managed.tiles.
//         heirEmail.body appended "(also applies to self-custody model)";
//         hero.managed.tiles.escape.title changed from "Always escape-
//         hatchable" to "Self-custody escape hatch"). Machine-translation
//         starting point — TODO native HI review.
// @version 0.9.0 @date 2026-06-08  ·  हिन्दी / Hindi
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys mirroring
//         en.ts 0.9.0. Machine-translation starting point — TODO native
//         HI review.
// @version 0.8.0 @date 2026-06-08  ·  हिन्दी / Hindi
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys
//         mirroring en.ts 0.8.0 (buy-once + founder accordion, primary mode
//         selector, bottom summary block). Machine-translation starting
//         point — TODO native HI review.
// @version 0.7.0 @date 2026-06-08  ·  हिन्दी / Hindi
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys
//         mirroring en.ts 0.7.0 (tier-box + tabs + summary block for the
//         Pricing rework Agent 1 is wiring). Machine-translation starting
//         point — TODO native HI review.
// @version 0.6.0 @date 2026-06-08  ·  हिन्दी / Hindi
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep. 19 new
//         keys mirroring en.ts 0.6.0. Machine-translation starting point —
//         TODO native review.
// @version 0.5.0 @date 2026-06-02  ·  हिन्दी / Hindi
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
//         nav.corporate (English brand strings — mirrored verbatim).
// 0.2.0 — Funnel, full keyed set. FLAG: first-pass draft — pending native
//         review (stated in-app: English is the authoritative version).
export const hi: Record<string, string> = {
  "hero.chip": "मानवीय बुद्धि। आपकी सीड पर शून्य AI। बस ठोस गणित।",

  // 0.5.0 — Hero H1 / टैगलाइनें / H2.
  "hero.h1": "आपकी सीड फ़्रेज़। आपकी वसीयत। आपका डिजिटल जीवन।",
  "hero.tagline": "वॉलेट से परे, पासवर्ड मैनेजर से ऊपर, वकील से पहले।",
  "hero.h2": "किसी भी वॉलेट का बैकअप और विरासत — Bitcoin, Solana, Ethereum, कोई भी चेन।",
  "hero.mainTagline": "कुछ भी ज़रूरी न खोएँ — न समय को, न स्मृति को, न ग़लत लोगों को।",
  "hero.subTagline": "क्रिप्टो-नेटिव उपयोगकर्ताओं के लिए Self-Custody आज लाइव है। बाकी सबके लिए Managed-मोड जल्द आ रहा है।",

  // हीरो टाइल ग्रिड (Self-Custody)।
  "hero.tiles.crypto.title": "क्रिप्टो और वित्त",
  "hero.tiles.crypto.bullet1": "सीड फ़्रेज़",
  "hero.tiles.crypto.bullet2": "हार्डवेयर वॉलेट रिकवरी शीट",
  "hero.tiles.crypto.bullet3": "2FA बैकअप कोड",
  "hero.tiles.crypto.bullet4": "एक्सचेंज और बैंक लॉगिन",
  "hero.tiles.documents.title": "दस्तावेज़ और कागज़ात",
  "hero.tiles.documents.bullet1": "वसीयत और विलेख",
  "hero.tiles.documents.bullet2": "बीमा पॉलिसियाँ",
  "hero.tiles.documents.bullet3": "चिकित्सा निर्देश",
  "hero.tiles.documents.bullet4": "पासपोर्ट स्कैन",
  "hero.tiles.digital.title": "डिजिटल जीवन",
  "hero.tiles.digital.bullet1": "आपके पासवर्ड मैनेजर का मास्टर पासवर्ड",
  "hero.tiles.digital.bullet2": "Apple ID, Google, Facebook (ताकि उत्तराधिकारी खातों को स्मारक बना सकें)",
  "hero.tiles.digital.bullet3": "सब्सक्रिप्शन सूची जो किसी और के पास नहीं",
  "hero.tiles.hidden.title": "छिपी जगहें",
  "hero.tiles.hidden.bullet1": "एक तस्वीर — कहाँ रखी है सेफ़-डिपॉज़िट की वास्तविक चाबी",
  "hero.tiles.hidden.bullet2": "अतिरिक्त चाबियाँ",
  "hero.tiles.hidden.bullet3": "स्टोरेज यूनिट गेट कोड",
  "hero.tiles.legacy.title": "व्यक्तिगत विरासत",
  "hero.tiles.legacy.bullet1": "विशिष्ट लोगों के लिए पत्र",
  "hero.tiles.legacy.bullet2": "परिवार के व्यंजन",
  "hero.tiles.legacy.bullet3": "वॉइस नोट्स",
  "hero.tiles.legacy.bullet4": "वे कहानियाँ जो आगे ले जाने योग्य हैं",
  "hero.tiles.ops.title": "ऑपरेशनल",
  "hero.tiles.ops.bullet1": "सर्वर और API कुंजियाँ",
  "hero.tiles.ops.bullet2": "व्यावसायिक संपर्क",
  "hero.tiles.ops.bullet3": "वह रनबुक जो केवल आपको याद है",

  "hero.phonePinHook": "और हाँ — आपका फ़ोन PIN उन्हें आपके क्लाउड में नहीं पहुँचाता। हम बताएँगे कि क्या पहुँचाता है।",
  "hero.closer.p1": "सब कुछ आपके ब्राउज़र में होता है। हम आपकी सीड संग्रहीत नहीं करते। हम कर ही नहीं सकते — कोई API कॉल नहीं है जो उसे हम तक भेजे।",
  "hero.closer.p2": "जब कोई वॉलेट खो जाए तो खुद पुनः प्राप्त करें। जब कोई डिवाइस मर जाए तो पुनः स्थापित करें।",
  "hero.closer.p3": "या यदि आप कभी चेक-इन करना बंद कर दें, तो उसे स्वतः उस व्यक्ति को सौंप दें जिसे आपने नामित किया है।",
  "hero.cta.getStarted": "शुरू करें",
  "hero.cta.seeMath": "गणित देखें",

  "hero.video.title": "संपूर्ण प्रमाण, गति में।",
  "hero.video.subline": "12 चरण आरंभ से अंत तक। हर प्रिमिटिव, हर एयरगैप क्षण, हर ऑनलाइन क्रॉसिंग। फिर खुद गणित चलाएँ।",
  "hero.video.cta": "साबित करें →",

  "hero.shamir.prefix": "आपकी पुनर्प्राप्ति सीमा से नीचे, NoKLock का गुप्त-विभाजन ",
  "hero.shamir.accent": "गणितीय रूप से तोड़ना असंभव है",
  "hero.shamir.suffix": "। आज के कंप्यूटरों से नहीं। क्वांटम से नहीं। कभी नहीं।",

  // Managed-mode टाइलें।
  "hero.managed.tiles.signin.title": "ईमेल या पासकी से साइन-इन",
  "hero.managed.tiles.signin.body": "कोई वॉलेट सेट अप करने की ज़रूरत नहीं। अपना सामान्य साइन-इन उपयोग करें।",
  "hero.managed.tiles.provision.title": "हम वॉलेट प्रावधान करते हैं",
  "hero.managed.tiles.provision.body": "पर्दे के पीछे। आप कभी सीड फ़्रेज़ नहीं देखते — और न ही हम। कुंजी Privy (हमारे मैनेज्ड वॉलेट प्रदाता) के पास रहती है, हमारे पास कभी नहीं; Privy के डिज़ाइन के अनुसार, कोई भी एक पक्ष आपके बिना हस्ताक्षर नहीं कर सकता।",
  "hero.managed.tiles.heirEmail.title": "ईमेल द्वारा उत्तराधिकार-दावा",
  "hero.managed.tiles.heirEmail.body": "आपका नामित उत्तराधिकारी दावा करने के लिए एक ईमेल लिंक पर क्लिक करता है। क्रिप्टो ज्ञान की कोई आवश्यकता नहीं (स्व-अभिरक्षा मॉडल पर भी लागू)।",
  "hero.managed.tiles.sameCrypto.title": "वही क्रिप्टो अंदर",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD। वॉल्ट सामग्री अब भी स्व-अभिरक्षित। केवल वॉलेट परत प्रबंधित।",
  "hero.managed.tiles.escape.title": "स्व-अभिरक्षा आपातकालीन निकास",
  "hero.managed.tiles.escape.body": "कभी भी अपनी वॉलेट कुंजियाँ निर्यात करें। जब चाहें स्व-अभिरक्षा में स्थानांतरित हों।",
  "hero.managed.tiles.audience.title": "आपके जीवन के उन लोगों के लिए",
  "hero.managed.tiles.audience.body": "जो कभी MetaMask सेट अप नहीं करेंगे — पर जिनका भी एक डिजिटल जीवन है जो पीछे छोड़ने योग्य है।",
  "hero.managed.closer": "वही वॉल्ट गणित। आसान वॉलेट। वही ईमानदारी कि हम क्या देखते हैं और क्या नहीं।",
  "hero.managed.notifyButton": "तैयार होने पर मुझे सूचित करें",

  "pricing.priced-to-protect": "रक्षा करने के लिए मूल्य, निकालने के लिए नहीं।",
  "card.readHow": "कैसे, पढ़ें →",
  "proof.title": "प्रमाण, वादे नहीं",
  "proof.loss.k": "हानि-रोधी",
  "proof.loss.b": "खोया वॉलेट, मृत फ़ोन, एक खोया शेयर — शेष शेयरों का कोई भी थ्रेशोल्ड और आपका मास्टर पासवर्ड सब वापस ले आता है। यह विभाजन आपका सुरक्षा-जाल है, केवल उत्तराधिकार ट्रिगर नहीं।",
  "proof.tamper.k": "छेड़छाड़-रोधी",
  "proof.tamper.b": "हर शेयर में AEAD टैग है + मैनिफ़ेस्ट Ed25519-हस्ताक्षरित है। एक बाइट बदलें, पुनर्स्थापना मना कर देती है।",
  "proof.spoof.k": "नकल-रोधी",
  "proof.spoof.b": "सोल-बाउंड टोकन स्थानांतरित नहीं किए जा सकते। हमलावर आपके नामित उत्तराधिकारी का रूप नहीं धर सकता।",
  "proof.inherit.k": "उत्तराधिकार",
  "proof.inherit.b": "यदि आप चेक-इन करना बंद कर दें, आपके नामित परिजन स्वतः उत्तराधिकार पाते हैं। कोई वकील नहीं, कोई प्रोबेट झंझट नहीं।",
  "proof.airgap.k": "एयर-गैप्ड",
  "proof.airgap.b": "एयरप्लेन मोड में नामांकन। क्रिप्टो कोर को कभी नेटवर्क की ज़रूरत नहीं।",
  "proof.ai.k": "AI-प्रतिरोधी",
  "proof.ai.b": "आपकी सीड कभी किसी भाषा मॉडल के पास नहीं जाती। कोई AI प्रशिक्षण नहीं, कोई प्रॉम्प्ट नहीं, कोई अनुमान नहीं। बस निर्धारित गणित।",
  "proof.fullinfo": "पूरी जानकारी — आर्किटेक्चर, प्रदाता, सुरक्षा मॉडल, प्रतिस्पर्धी विश्लेषण →",
  "more.title": "क्रिप्टो से बढ़कर — अब लाइव",
  "more.body": "सीलबंद पत्र, दस्तावेज़ वॉल्ट और छवि वॉल्ट सभी आज उपलब्ध हैं। एक सीलबंद पत्र लिखें, वसीयत एन्क्रिप्ट करें, पारिवारिक दस्तावेज़ स्कैन करें, फ़ोटो संग्रह को सुरक्षित करें — वही विभाजित-एन्क्रिप्ट-वितरित-उत्तराधिकार पाइपलाइन जो आपकी क्रिप्टो सीड के लिए है, सब आपके ब्राउज़र में।",
  "more.cta": "अपने वॉल्ट खोलें →",
  "keyless.titleA": "“कीलेस” नहीं।",
  "keyless.titleB": "ईमानदार स्व-अभिरक्षा।",
  "keyless.body": "अन्य वॉलेट दिखावा करते हैं कि आपके पास कुंजियाँ नहीं — उनमें से अधिकांश चमक के पीछे कस्टोडियल हैं। NoKLock आपकी सीड फ़्रेज़ का सम्मान करता है, फिर उसे खोना कठिन, पुनर्प्राप्त करना आसान और विरासत के लिए तैयार बनाता है।",
  "keyless.cta": "“कीलेस” क्यों नहीं →",
  "ins.titleA": "हम बीमा नहीं रखते।",
  "ins.titleB": "हमें ज़रूरत नहीं।",
  "ins.body": "Casa, Ledger Recover और Vault12 बीमा रखते हैं क्योंकि वे आपकी कुंजियाँ रखते हैं। बीमा इस बात की उनकी माफ़ी है कि वे उन्हें खो सकते हैं। NoKLock आपकी कुंजियाँ कभी नहीं छूता — हमारे पास खोने को कुछ नहीं। यही अंतर है।",
  "nav.dashboard": "डैशबोर्ड",
  "nav.vaults": "वॉल्ट",
  "nav.restore": "पुनर्स्थापित करें",
  "nav.proveit": "साबित करें",
  "nav.nok": "परिजन नामित करें",
  "nav.heartbeat": "हार्टबीट",
  "nav.deadman": "डेड-मैन स्विच",
  "nav.livemans": "लाइव-मैन स्विच (अलर्ट)",
  "nav.pricing": "मूल्य",
  "nav.refer": "रेफ़र करें और कमाएँ",
  "nav.info": "जानकारी",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock एंटरप्राइज़)",
  "nav.settings": "सेटिंग्स",
  "nav.advanced": "उन्नत",
  "nav.disconnect": "डिस्कनेक्ट करें",
  "nav.reconnecting": "सत्र पुनर्स्थापित हो रहा है…",
  "footer.tagline": "उन सब चीज़ों के लिए स्व-अभिरक्षित क्रिप्टोग्राफ़िक पुनर्प्राप्ति जिन्हें खोना आपको गवारा नहीं।",
  "footer.privacy": "गोपनीयता",
  "footer.terms": "उपयोग की शर्तें",
  "footer.howItWorks": "यह कैसे काम करता है",
  // TODO machine-translation (native review pending) — Google Play download surfaces.
  "footer.getAndroidApp": "ऐप पाएं",
  "settings.getAndroidApp.title": "एंड्रॉइड ऐप पाएं",
  "settings.getAndroidApp.body": "होम-स्क्रीन ऐप के लिए NoKLock को Google Play से इंस्टॉल करें — वही साइट, फ़ुलस्क्रीन, स्वतः-अपडेट।",
  "download.title": "NoKLock ऐप पाएं",
  "download.androidNote": "Google Play से NoKLock इंस्टॉल करने के लिए ऊपर दिए बैज पर टैप करें।",
  "download.iosNote": "Safari में noklock.app खोलें → शेयर पर टैप करें → होम स्क्रीन में जोड़ें।",
  "download.comingSoon": "जल्द ही Google Play पर",
  "lang.label": "भाषा",
  // 2026-05-20 signature-differentiator strings (Option-B restructure).
  "stand.duress.k": "ज़बरदस्ती-रोधी",
  "stand.duress.t": "दो पासवर्ड, दो वॉल्ट।",
  "stand.duress.b": "अपने पासवर्ड के साथ वैकल्पिक डिकॉय वॉल्ट। ज़बरदस्ती में आप डिकॉय सौंप देते हैं — वे एक विश्वसनीय फेंकने योग्य देखते हैं, आपका असली वॉल्ट छिपा रहता है। कोई प्रतियोगी यह नहीं देता।",
  "stand.social.k": "सोशल-इंजीनियरिंग-रोधी",
  "stand.social.t": "M-of-N स्वतंत्र NoKs।",
  "stand.social.b": "मल्टी-NoK उत्तराधिकार — रिलीज़ के लिए अलग-अलग वॉलेट से N में से M स्वतंत्र हस्ताक्षर चाहिए। एक भी मजबूर या समझौता किया गया NoK अकेले रिलीज़ नहीं कर सकता। एक वारिस को फिशिंग करने से पहुँच नहीं मिलती।",
  "stand.noklockproof.k": "NoKLock-स्वतंत्र",
  "stand.noklockproof.t": "अगर हम गायब हो जाएँ, फिर भी काम करता है।",
  "stand.noklockproof.b": "रिकवरी 100% क्लाइंट-साइड (आपके शेयर + मास्टर पासवर्ड)। उत्तराधिकार ऑन-चेन चलता है (Polygon + Chainlink)। NoKLock गायब हो जाए तो भी Self-heartbeat जीवित रहता है। PolygonScan पर सत्यापित — आप स्वयं ऑडिट कर सकते हैं।",
  "stand.selfcustody.k": "स्व-अभिरक्षा",
  "stand.selfcustody.t": "आपकी कुंजियाँ। आपका डेटा। हमेशा।",
  "stand.selfcustody.b": "NoKLock आपका सीड, आपके शेयर या आपका डेटा कभी नहीं देखता या छूता। चेन केवल हैश और पॉइंटर रखती है, कभी प्लेनटेक्स्ट नहीं। कोई साझा हनीपॉट नहीं, कोई एडमिन ओवरराइड नहीं, कोई रिकवरी बंधक नहीं। सब कुछ आपके पास है।",
  "soul.title": "सोलबाउंड NFTs — आपका उत्तराधिकार, ऑन-चेन",
  "soul.body": "जब आप एक उत्तराधिकारी नामित करते हैं, NoKLock Polygon पर एक सोलबाउंड सक्रियण NFT (ERC-5192) मिंट करता है — डेड-मैन स्विच ट्रिगर: एक उत्तराधिकारी, एक टोकन। M-of-N कोरम वॉल्ट प्रति उत्तराधिकारी एक मतदान NFT जोड़ते हैं। सोलबाउंड का अर्थ है ग़ैर-हस्तांतरणीय — एक बार मिंट होने के बाद, टोकन को बेचा, स्थानांतरित, चुराया या ज़ब्त नहीं किया जा सकता। यह ERC-5192 मानक का प्रोडक्शन में दुर्लभ उपयोग है, और क्रिप्टो उत्तराधिकार के लिए एकमात्र ज्ञात प्रोडक्शन उपयोग।",
  "soul.bodyB": "ऊपर के तीनों कॉन्ट्रैक्ट्स PolygonScan पर स्रोत-सत्यापित हैं — किसी भी पते पर क्लिक करके परिनियोजित कोड पढ़ें। SBT वास्तविक उत्तराधिकार ट्रिगर है; License केवल वह USDC लेता है जिसे आपने स्पष्ट रूप से स्वीकृत किया है; Oracle का डेड-मैन स्विच केवल forwarder के माध्यम से सुलभ है।",
  "soul.scoreLabel": "मूल SolidityScan समीक्षा · शून्य पूल किए गए फंड, शून्य कुंजी संरक्षण, जानबूझकर छोटी अटैक सतह",
  "proof.duress.k": "ज़बरदस्ती-रोधी",
  "proof.duress.b": "अपने मास्टर पासवर्ड के साथ वैकल्पिक डिकॉय वॉल्ट। ज़बरदस्ती में आप डिकॉय प्रकट करते हैं — वे एक विश्वसनीय फेंकने योग्य देखते हैं, असली वॉल्ट छिपा रहता है।",
  "proof.social.k": "सोशल-इंजीनियरिंग-रोधी",
  "proof.social.b": "स्वतंत्र वॉलेट से मल्टी-NoK M-of-N कोरम। एक मजबूर या फिश्ड NoK अकेले रिलीज़ नहीं कर सकता — वह कोरम जाँच में विफल होता है।",
  "proof.noklockproof.k": "NoKLock-स्वतंत्र",
  "proof.noklockproof.b": "रिकवरी 100% क्लाइंट-साइड। उत्तराधिकार Polygon + Chainlink के माध्यम से ऑन-चेन चलता है। NoKLock कल गायब हो जाए तो भी Self-heartbeat जीवित रहता है।",

  // 0.6.0 — simple-vs-max-security framing (TODO: native HI review).
  "landing.proof.simpleMax.headline": "अपने ही फ़ोल्डरों में बिखरे तीन शेयर",
  "landing.proof.simpleMax.accent": "पहले से ही एक स्टिकी नोट या एन्क्रिप्टेड टेक्स्ट फ़ाइल से बेहतर हैं।",
  "landing.proof.simpleMax.simple": "सरल मार्ग: अपने लैपटॉप या फ़ोन पर तीन फ़ोल्डर चुनें।",
  "landing.proof.simpleMax.max": "अधिकतम सुरक्षा: उन्हें अलग-अलग ड्राइव, क्लाउड और उन प्रदाताओं में फैलाएँ जिनका आप पहले से उपयोग करते हैं।",
  "landing.proof.simpleMax.either": "किसी भी तरह — चरम सुरक्षा, सरल बनाई गई।",

  // 0.6.0 — Pricing FAQ "फ़ोन खोना" (TODO: native HI review).
  "pricing.faq.losePhone.question": "क्या मेरा फ़ोन ख़राब होने पर मेरी पहुँच चली जाती है?",
  "pricing.faq.losePhone.intro": "नहीं। आपकी सीड आपके फ़ोन पर संग्रहीत नहीं होती। यह एन्क्रिप्ट की जाती है, Shamir के माध्यम से शेयरों में विभाजित (डिफ़ॉल्ट रूप से 3-of-5), और आपके चुने हुए स्टोरेज पर बिखेरी जाती है।",
  "pricing.faq.losePhone.simple": "सरल मार्ग: आपके लैपटॉप या फ़ोन पर तीन फ़ोल्डर — पहले से ही एक स्टिकी नोट या एन्क्रिप्टेड टेक्स्ट फ़ाइल से सुरक्षित।",
  "pricing.faq.losePhone.max": "अधिकतम सुरक्षा: उन्हें अलग-अलग क्लाउड खातों, IPFS, Arweave, कई उपकरणों में फैलाएँ।",
  "pricing.faq.losePhone.either": "किसी भी तरह, आप कोई एक स्थान खोते हैं और बाकी फिर भी सीड को पुनर्प्राप्त कर लेते हैं।",
  "pricing.faq.losePhone.secureEnclave": "यह हार्डवेयर-वॉलेट-शैली के उत्पादों से संरचनात्मक अंतर है। उनकी सीड एक Secure Enclave / StrongBox कुंजी के अंदर बंद है जिसे चिप से निर्यात नहीं किया जा सकता — यही चिप को सुरक्षित बनाता है और उनकी सीड को डिवाइस के साथ मरने के लिए बनाता है। वे इसे पेपर-बैकअप फ़्रेज़ अनुष्ठानों के साथ ठीक करते हैं। NoKLock इसे ढकने के बजाय एकल विफलता बिंदु को हटा देता है।",

  // 0.6.0 — CryptoInheritance Q "फ़ोन खोना" (TODO: native HI review).
  "crypto.q.losePhone.question": "अगर मेरा फ़ोन खो जाता है तो क्या होता है?",
  "crypto.q.losePhone.intro": "कुछ घातक नहीं। आपकी सीड आपके फ़ोन पर नहीं रहती — यह एन्क्रिप्टेड Shamir शेयरों में रहती है, जो आपके एनरॉल पर चुने गए स्टोरेज पर बिखरी होती है।",
  "crypto.q.losePhone.simple": "सरल मार्ग: आपके अपने उपकरणों पर तीन फ़ोल्डर — पहले से ही किताब में एक स्टिकी नोट या आपके डेस्कटॉप पर एक एन्क्रिप्टेड टेक्स्ट फ़ाइल से सुरक्षित।",
  "crypto.q.losePhone.max": "अधिकतम सुरक्षा: शेयरों को अलग-अलग क्लाउड खातों, IPFS, Arweave, कई ड्राइवों में फैलाएँ।",
  "crypto.q.losePhone.either": "किसी भी तरह, कोई एक स्थान खोएँ और बाकी फिर भी सीड को पुनर्प्राप्त कर लेते हैं।",
  "crypto.q.losePhone.secureEnclave": "यह हार्डवेयर-वॉलेट-शैली के उत्पादों से संरचनात्मक अंतर है। उनकी सीड एक डिवाइस के अंदर बंद है; पेपर बैकअप के बिना इसे खो दें और आप समाप्त हो गए। NoKLock की सीड किसी भी डिवाइस द्वारा पुनर्प्राप्त करने योग्य कलाकृति के रूप में स्पर्श करने से पहले गणितीय रूप से वितरित होती है।",

  // 0.6.0 — Enrol Step B "दो मार्ग" (TODO: native HI review).
  "enrol.shareUrl.twoRoutes.headline": "दो मार्ग — चुनें जो आज आपके लिए उपयुक्त है",
  "enrol.shareUrl.twoRoutes.simple": "सरल: प्रत्येक शेयर फ़ाइल को अपने लैपटॉप, फ़ोन, USB ड्राइव, या जहाँ भी आप पहले से फ़ाइलें रखते हैं, एक अलग फ़ोल्डर में रखें। नीचे URL फ़ील्ड को ख़ाली छोड़ दें। यह पहले से ही एक स्टिकी नोट या एन्क्रिप्टेड टेक्स्ट फ़ाइल से नाटकीय रूप से सुरक्षित है — कोई एक फ़ोल्डर खोएँ और बाकी फिर भी सीड को पुनर्प्राप्त कर लेते हैं।",
  "enrol.shareUrl.twoRoutes.max": "अधिकतम सुरक्षा: प्रत्येक शेयर को एक अलग क्लाउड खाते (Drive, Dropbox, OneDrive, IPFS, Arweave…) में रखें और नीचे \"लिंक वाले किसी भी व्यक्ति\" URL पेस्ट करें। यह पृथक्करण थ्रेशोल्ड विभाजन का पूरा उद्देश्य है: एक चुराया गया खाता केवल एक शेयर लीक करता है, इसलिए आपका वॉल्ट सुरक्षित रहता है। आप और आपके निकट-संबंधी प्रत्येक फ़ाइल को हाथ में रखने के बजाय शेयरों को दूर से प्राप्त कर सकते हैं।",
  "enrol.shareUrl.twoRoutes.urlsNote": "दोनों मार्गों में URL वैकल्पिक हैं। NoKLock केवल URL संग्रहीत करता है (इस ब्राउज़र में स्थानीय रूप से, कुछ भी कहीं नहीं भेजा जाता); शेयर फ़ाइलें स्वयं कभी आपके नियंत्रण से बाहर नहीं जातीं।",

  // 0.7.0 — Pricing rework keys (TODO: native HI review).
  "pricing.summary.headline": "एक ही संग्रह + पुनर्स्थापना वॉल्ट तक दो पहुँच पथ",
  "pricing.summary.body": "स्व-अभिरक्षा — चाबियाँ आप रखते हैं। प्रबंधित — हम आपके लिए एक Privy एम्बेडेड वॉलेट रखते हैं (जल्द आ रहा है, NL-2)। दोनों में तीन स्तर: Free / Standard / Premium। सभी सशुल्क स्तरों पर Founder मूल्य निर्धारण — प्रत्येक पक्ष में पहले 10,000 सशुल्क लाइसेंस।",
  "pricing.tabs.selfCustody": "स्व-अभिरक्षा",
  "pricing.tabs.managed": "प्रबंधित (जल्द आ रहा है)",
  "pricing.tabs.compare": "दोनों की तुलना करें",
  "pricing.tabs.enterprise": "एंटरप्राइज़",
  "pricing.tabs.faq": "FAQ",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "वार्षिक",
  "pricing.sku.lifetime": "आजीवन",
  "pricing.sku.autorenew": "(Paddle के माध्यम से स्वतः नवीकरण)",
  "pricing.managed.comingSoon": "प्रबंधित मोड जल्द आ रहा है (NL-2)",
  "pricing.managed.subtitle": "Google / Apple / ईमेल से साइन इन करें। NoKLock आपके लिए एम्बेडेड वॉलेट रखता है। स्व-अभिरक्षा उपयोगकर्ता प्रभावित नहीं होते।",
  "pricing.lifetime.tagline": "एक बार भुगतान करें। कभी नवीकरण नहीं।",
  "pricing.founder.label": "Founder मूल्य निर्धारण — प्रत्येक पक्ष में पहले 10,000 सशुल्क लाइसेंस। स्व-अभिरक्षा के लिए अनुबंध-प्रवर्तित, प्रबंधित के लिए Form-B-ट्रैक किया गया।",
  "pricing.modeLabel.self": "स्व-अभिरक्षा — चाबियाँ आप रखते हैं",
  "pricing.modeLabel.managed": "प्रबंधित — Privy एम्बेडेड वॉलेट",

  // 0.8.0 — Pricing round-2 copy keys (TODO: native HI review). Cloned from
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
  "tier.requires.standard": "Standard आवश्यक — /pricing पर अपग्रेड करें",
  "tier.requires.premium": "Premium आवश्यक — /pricing पर अपग्रेड करें",
  "tier.upgrade.cta": "अपग्रेड करें",

  // 0.11.0 — Homepage "Day-1 honest note" launch banner. {tests}/{solc} are
  // injected as untranslated numbers at the callsite.
  // TODO native HI review — machine-translation draft (English authoritative).
  "landing.day1.badge": "पहले-दिन की ईमानदार टिप्पणी",
  "landing.day1.body": "NoKLock अभी-अभी लॉन्च हुआ है। अनुबंधों का ऑडिट हो चुका है। परीक्षण पास होते हैं (Solidity {solc} पर {tests})। दो स्वतंत्र AI समीक्षा पास पूरे हो चुके हैं। फिर भी किसी भी वास्तविक उत्पाद के पहले कुछ हफ़्ते कुछ खुरदुरे किनारे, चूक जाने वाली कॉपी, और ऐसे प्रवाह सामने लाते हैं जिनका हमने अनुमान नहीं लगाया था। जब आपको कोई मिले तो हमें बताएं।",
  "landing.day1.bug": "कोई बग मिला? बाउंटी →",
  "landing.day1.rough": "कुछ खटक रहा है? हमें कैसे बताएं →",
  "landing.day1.email": "हमें ईमेल करें →",
  "landing.day1.dismissForever": "हमेशा के लिए छिपाएं",

  // 0.11.0 — Use-cases carousel lead-in. TODO native HI review.
  "home.useCases.leadIn": "लोग वास्तव में इसका उपयोग किसलिए करते हैं",

  // 6 वॉल्ट उपयोग-मामले श्रेणियाँ। TODO native HI review.
  "vuc.cat.crypto-finance": "क्रिप्टो और वित्त कुंजियाँ",
  "vuc.cat.digital-identity": "डिजिटल पहचान और खाते",
  "vuc.cat.hidden-places": "छिपे हुए स्थान और भौतिक संकेत",
  "vuc.cat.vital-documents": "महत्वपूर्ण दस्तावेज़",
  "vuc.cat.final-wishes": "अंतिम इच्छाएँ और व्यक्तिगत पत्र",
  "vuc.cat.recovery-codes": "रिकवरी कोड और बैकअप रहस्य",

  // 26 कैरोसेल कार्ड (शीर्षक + विवरण)। ब्रांड नाम अपरिवर्तित रहते हैं।
  // TODO native HI review — machine-translation draft.
  "vuc.card.crypto-finance:hw-wallet.title": "हार्डवेयर वॉलेट सीड",
  "vuc.card.crypto-finance:hw-wallet.blurb": "आपके Ledger, Trezor या Tangem के पीछे के 12 या 24 शब्द।",
  "vuc.card.crypto-finance:soft-wallet.title": "MetaMask / Rabby रिकवरी",
  "vuc.card.crypto-finance:soft-wallet.blurb": "सॉफ़्ट-वॉलेट सीड फ़्रेज़ और कोई भी मल्टीसिग साइनर कुंजी।",
  "vuc.card.crypto-finance:exchange-codes.title": "एक्सचेंज रिकवरी कोड",
  "vuc.card.crypto-finance:exchange-codes.blurb": "साइनअप के समय Coinbase, Kraken या Binance द्वारा दिए गए मुद्रित बैकअप कोड।",
  "vuc.card.crypto-finance:pw-manager.title": "पासवर्ड-मैनेजर मास्टर",
  "vuc.card.crypto-finance:pw-manager.blurb": "आपके बाकी वित्तीय जीवन को अनलॉक करता है — 1Password, Bitwarden, Dashlane।",
  "vuc.card.crypto-finance:2fa-seed.title": "2FA सीड निर्यात",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Google Authenticator / Authy / Aegis सीड सूची — खोए हुए फ़ोन से बच जाती है।",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + Google खाता",
  "vuc.card.digital-identity:apple-google.blurb": "मूल लॉगिन जो आपके फ़ोन, फ़ोटो, संपर्कों और ईमेल को नियंत्रित करते हैं।",
  "vuc.card.digital-identity:social-credentials.title": "सोशल मीडिया क्रेडेंशियल",
  "vuc.card.digital-identity:social-credentials.blurb": "प्रत्येक प्लेटफ़ॉर्म की नीति के अनुसार स्मृति-स्थापित करें, अंतिम संदेश पोस्ट करें या बंद करें।",
  "vuc.card.digital-identity:domains.title": "डोमेन रजिस्ट्रार लॉगिन",
  "vuc.card.digital-identity:domains.blurb": "डोमेन चुपचाप समाप्त हो जाते हैं — अक्सर बाद में पुनर्प्राप्त करना असंभव।",
  "vuc.card.digital-identity:cloud-storage.title": "क्लाउड स्टोरेज खाते",
  "vuc.card.digital-identity:cloud-storage.blurb": "जहाँ दशकों की फ़ोटो, दस्तावेज़ और व्यक्तिगत परियोजनाएँ वास्तव में रहती हैं।",
  "vuc.card.hidden-places:safe-deposit-photo.title": "सेफ़ डिपॉज़िट बॉक्स की फ़ोटो",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "शाखा, बॉक्स नंबर, और घर में चाबी + हस्ताक्षर कार्ड कहाँ हैं।",
  "vuc.card.hidden-places:home-safe.title": "घरेलू तिजोरी का स्थान + संयोजन",
  "vuc.card.hidden-places:home-safe.blurb": "पीछे लिखे संयोजन के साथ एनोटेट की गई फ़ोटो।",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "हार्डवेयर वॉलेट कहाँ छिपा है",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "किस दराज़ के पीछे, किस किताब के अंदर, किस फ़र्श-तख़्ते के नीचे।",
  "vuc.card.hidden-places:spare-keys.title": "अतिरिक्त चाबियों के स्थान",
  "vuc.card.hidden-places:spare-keys.blurb": "व्हील आर्च के नीचे चुंबकीय बॉक्स — बेकार यदि उसका स्थान आपके साथ ही समाप्त हो जाए।",
  "vuc.card.hidden-places:hidden-cash.title": "छिपा हुआ नकद और विरासत की वस्तुएँ",
  "vuc.card.hidden-places:hidden-cash.blurb": "पेंटिंग के पीछे का लिफ़ाफ़ा, कालीन के नीचे फ़र्श-तिजोरी।",
  "vuc.card.vital-documents:will-trust.title": "हस्ताक्षरित वसीयत और ट्रस्ट डीड",
  "vuc.card.vital-documents:will-trust.blurb": "वास्तव में हस्ताक्षरित PDF — केवल «वकील के पास है» नहीं।",
  "vuc.card.vital-documents:insurance.title": "बीमा पॉलिसी PDF",
  "vuc.card.vital-documents:insurance.blurb": "जीवन, संपत्ति और मुख्य-व्यक्ति — ताकि कोई दावा-योग्य पॉलिसी छूट न जाए।",
  "vuc.card.vital-documents:property-deeds.title": "संपत्ति के दस्तावेज़ और स्वामित्व पत्र",
  "vuc.card.vital-documents:property-deeds.blurb": "स्वामित्व का प्रमाण जो भौतिक संपत्तियों को हस्तांतरणीय बनाता है।",
  "vuc.card.vital-documents:tax-returns.title": "हाल की कर विवरणियाँ",
  "vuc.card.vital-documents:tax-returns.blurb": "पिछले 3–7 वर्ष + लेखाकार का सीधा संपर्क।",
  "vuc.card.final-wishes:personal-letters.title": "हर प्रियजन के लिए पत्र",
  "vuc.card.final-wishes:personal-letters.blurb": "वे बातें जो समय होने पर आप व्यक्तिगत रूप से कहते।",
  "vuc.card.final-wishes:funeral-prefs.title": "अंतिम संस्कार और दफ़न की इच्छाएँ",
  "vuc.card.final-wishes:funeral-prefs.blurb": "दाह-संस्कार या दफ़न, संगीत, पाठ — आपका निर्णय, उनका नहीं।",
  "vuc.card.final-wishes:ethical-will.title": "नैतिक वसीयत",
  "vuc.card.final-wishes:ethical-will.blurb": "वे मूल्य, सीख और कहानियाँ जो आप अगली पीढ़ी को सौंपना चाहते हैं।",
  "vuc.card.final-wishes:pet-care.title": "पालतू-देखभाल की इच्छाएँ",
  "vuc.card.final-wishes:pet-care.blurb": "कुत्ते को कौन लेगा, बिल्ली क्या खाती है, पशु-चिकित्सक का नाम और चिप नंबर।",
  "vuc.card.recovery-codes:printed-2fa.title": "मुद्रित 2FA रिकवरी कोड",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google, Microsoft, GitHub, AWS, बैंकिंग — वे जो आपने संभाल कर रखे।",
  "vuc.card.recovery-codes:yubikey.title": "YubiKey पंजीकरण सूची",
  "vuc.card.recovery-codes:yubikey.blurb": "सीरियल नंबर, पंजीकृत खाते, और बैकअप कुंजी कहाँ रखी है।",
  "vuc.card.recovery-codes:disk-encryption.title": "डिस्क एन्क्रिप्शन कुंजियाँ",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker, FileVault, LUKS — इनके बिना लैपटॉप एक ईंट है।",
  "vuc.card.recovery-codes:gpg-age.title": "GPG / Age निजी कुंजियाँ",
  "vuc.card.recovery-codes:gpg-age.blurb": "उन लोगों के लिए जो वास्तव में एंड-टू-एंड एन्क्रिप्शन का उपयोग करते हैं।",

  // 0.11.0 — Info-dropdown menu items. TODO native HI review.
  "nav.info.appInfo": "ऐप जानकारी",
  "nav.info.appUpdates": "ऐप अपडेट",
  "nav.info.enrolWalkthrough": "नामांकन मार्गदर्शिका",
  "nav.info.articles": "NoKLock लेख",

  // 0.12.0 — Landing FSM box headline + subtitle. Machine-translation draft —
  // TODO native HI review (English authoritative).
  "landing.fsm.headline": "किसी भी सेवा से कहीं अधिक मज़बूत भरोसा",
  "landing.fsm.subtitle": "आपका वॉल्ट किसी भी समय ठीक एक ही स्थिति में होता है। वह स्थिति Polygon पर रहती है, हमारे सर्वर पर नहीं।",

  // 0.12.0 — FSMDiagram.tsx state-machine SVG. State names translated; on-chain
  // code identifiers (function signatures + anchor expressions) kept literal in
  // JSX. Machine-translation draft — TODO native HI review.
  "fsm.title": "NoKLock वॉल्ट जीवनचक्र · Polygon पर परिमित अवस्था मशीन",
  "fsm.subtitle": "हर अवस्था ऑन-चेन · हर संक्रमण क्रिप्टोग्राफ़िक रूप से हस्ताक्षरित · अपने वॉल्ट की स्थिति कभी भी सत्यापित करें, बिना लॉगिन के",
  "fsm.transition.timeElapses": "समय बीतता है",
  "fsm.transition.graceElapses": "छूट अवधि बीतती है",
  "fsm.state.enrolled.name": "नामांकित",
  "fsm.state.enrolled.desc": "वॉल्ट स्थानीय रूप से बनाया गया",
  "fsm.state.heirDesignated.name": "उत्तराधिकारी_नामित",
  "fsm.state.heirDesignated.desc": "Activation NFT ढाला गया (कोरम के लिए Voting सहित)",
  "fsm.state.alive.name": "जीवित",
  "fsm.state.alive.desc": "हार्टबीट ताज़ा",
  "fsm.state.dueSoon.name": "शीघ्र_देय",
  "fsm.state.dueSoon.desc": "छूट विंडो समाप्त हो रही है",
  "fsm.state.inGrace.name": "छूट_में",
  "fsm.state.inGrace.desc": "performUpkeep की प्रतीक्षा में",
  "fsm.state.activated.name": "सक्रिय",
  "fsm.state.activated.desc": "स्विच चल गया",
  "fsm.state.claimed.name": "दावा_किया",
  "fsm.state.claimed.desc": "उत्तराधिकारी के पास SBT है",
  "fsm.legend.happyPath": "सामान्य मार्ग — बहता हुआ टील",
  "fsm.legend.heartbeat": "हार्टबीट प्राप्त → जीवित पर वापस",
  "fsm.legend.sideStates": "पार्श्व-अवस्था शाखाएँ",
  "fsm.legend.anchorNote": "हर अवस्था अपना ऑन-चेन एंकर दिखाती है (नीचे की पंक्ति)। डैश लगातार बहते रहते हैं; किसी भी वॉल्ट की लाइव स्थिति PolygonScan पर सत्यापित करें।",
};
