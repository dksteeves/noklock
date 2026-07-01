// @version 0.11.0 @date 2026-06-13  ·  Português — funnel, full keyed set
// 0.11.0 — Daniel 2026-06-13: English-only-surface i18n sweep mirroring
//          en.ts 0.12.0 — three previously-hardcoded funnel/nav surfaces:
//            (1) landing.day1.* — homepage "Day-1 honest note" launch banner.
//            (2) home.useCases.leadIn + vuc.cat.* (6) + vuc.card.* (26×2) —
//                homepage use-cases carousel lead-in, category labels, cards.
//            (3) nav.info.{appInfo,appUpdates,enrolWalkthrough} — Info-dropdown
//                menu items (NoKLock.white + Asserro reuse nav.whitelabel /
//                nav.corporate). Curated PT translations; brand/product names
//                (Ledger, MetaMask, 1Password…) kept verbatim.
// @version 0.10.0 @date 2026-06-08  ·  Português — funnel, full keyed set
// 0.10.0 — Daniel 2026-06-08 round-5: managed-hero tile copy mirror — 3 key
//         value updates from en.ts (hero.managed.tiles.provision.body
//         expanded with Privy secure-enclave detail; hero.managed.tiles.
//         heirEmail.body appended "(also applies to self-custody model)";
//         hero.managed.tiles.escape.title changed from "Always escape-
//         hatchable" to "Self-custody escape hatch"). Machine-translation
//         starting point — TODO native PT review.
// @version 0.9.0 @date 2026-06-08  ·  Português — funnel, full keyed set
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys mirroring
//         en.ts 0.9.0. Machine-translation starting point — TODO native
//         PT review.
// @version 0.8.0 @date 2026-06-08  ·  Português — funnel, full keyed set
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys
//         mirroring en.ts 0.8.0 (buy-once + founder accordion, primary mode
//         selector, bottom summary block). Machine-translation starting
//         point — TODO native PT review.
// @version 0.7.0 @date 2026-06-08  ·  Português — funnel, full keyed set
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys
//         mirroring en.ts 0.7.0 (tier-box + tabs + summary block for the
//         Pricing rework Agent 1 is wiring). Machine-translation starting
//         point — TODO native PT review.
// @version 0.6.0 @date 2026-06-08  ·  Português — funnel, full keyed set
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep. 19 new
//         keys mirroring en.ts 0.6.0. Machine-translation starting point —
//         TODO native review.
// @version 0.5.0 @date 2026-06-02  ·  Português — funnel, full keyed set
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
export const pt: Record<string, string> = {
  "hero.chip": "Inteligência humana. Zero IA na sua seed. Matemática simplesmente sólida.",

  // 0.5.0 — Hero H1 / tagline / H2.
  "hero.h1": "A sua frase-semente. O seu testamento. A sua vida digital.",
  "hero.tagline": "Para além da carteira, acima do gestor de palavras-passe, antes do advogado.",
  "hero.h2": "Faça backup e herança de qualquer carteira — Bitcoin, Solana, Ethereum, qualquer blockchain.",
  "hero.mainTagline": "Não perca nada importante — nem ao tempo, nem à memória, nem às pessoas erradas.",
  "hero.subTagline": "Self-Custody para utilizadores cripto-nativos disponível hoje. Modo Managed para todos os outros, em breve.",

  // Grelha de tiles (Self-Custody).
  "hero.tiles.crypto.title": "Cripto & finanças",
  "hero.tiles.crypto.bullet1": "Frases-semente",
  "hero.tiles.crypto.bullet2": "Folhas de recuperação de carteiras de hardware",
  "hero.tiles.crypto.bullet3": "Códigos de backup 2FA",
  "hero.tiles.crypto.bullet4": "Credenciais de exchanges e bancos",
  "hero.tiles.documents.title": "Documentos & escrituras",
  "hero.tiles.documents.bullet1": "Testamentos e escrituras",
  "hero.tiles.documents.bullet2": "Apólices de seguro",
  "hero.tiles.documents.bullet3": "Diretivas médicas",
  "hero.tiles.documents.bullet4": "Digitalizações de passaporte",
  "hero.tiles.digital.title": "Vida digital",
  "hero.tiles.digital.bullet1": "A palavra-passe mestra do seu gestor de palavras-passe",
  "hero.tiles.digital.bullet2": "Apple ID, Google, Facebook (para que herdeiros possam memorializar as contas)",
  "hero.tiles.digital.bullet3": "A lista de subscrições que mais ninguém tem",
  "hero.tiles.hidden.title": "Lugares escondidos",
  "hero.tiles.hidden.bullet1": "Uma foto de onde realmente está a chave do cofre",
  "hero.tiles.hidden.bullet2": "Chaves sobressalentes",
  "hero.tiles.hidden.bullet3": "Códigos de portão de armazéns",
  "hero.tiles.legacy.title": "Legado pessoal",
  "hero.tiles.legacy.bullet1": "Cartas para pessoas específicas",
  "hero.tiles.legacy.bullet2": "Receitas de família",
  "hero.tiles.legacy.bullet3": "Notas de voz",
  "hero.tiles.legacy.bullet4": "Histórias que merecem ser transmitidas",
  "hero.tiles.ops.title": "Operacional",
  "hero.tiles.ops.bullet1": "Chaves de servidor e de API",
  "hero.tiles.ops.bullet2": "Contactos profissionais",
  "hero.tiles.ops.bullet3": "O runbook que só você se lembra",

  "hero.phonePinHook": "E sim — o PIN do seu telemóvel não os leva à sua cloud. Vamos mostrar-lhe o que leva.",
  "hero.closer.p1": "Tudo acontece no seu navegador. Não guardamos a sua seed. Não podemos — não há nenhuma chamada de API que a envie para nós.",
  "hero.closer.p2": "Recupere-a você mesmo quando uma carteira desaparecer. Restaure-a quando um dispositivo morrer.",
  "hero.closer.p3": "Ou entregue-a automaticamente à pessoa que designou, se um dia deixar de dar sinal.",
  "hero.cta.getStarted": "Começar",
  "hero.cta.seeMath": "Ver a matemática",

  "hero.video.title": "Toda a prova, em movimento.",
  "hero.video.subline": "12 passos de ponta a ponta. Cada primitiva, cada momento air-gap, cada travessia online. Depois faça as contas você mesmo.",
  "hero.video.cta": "Veja a prova →",

  "hero.shamir.prefix": "Abaixo do seu limiar de recuperação, a divisão de segredo do NoKLock é ",
  "hero.shamir.accent": "matematicamente impossível de quebrar",
  "hero.shamir.suffix": ". Nem com os computadores de hoje. Nem com um quântico. Nunca.",

  // Tiles do Managed-mode.
  "hero.managed.tiles.signin.title": "Início de sessão por email ou passkey",
  "hero.managed.tiles.signin.body": "Sem carteira para configurar. Use o seu login habitual.",
  "hero.managed.tiles.provision.title": "Nós provisionamos a carteira",
  "hero.managed.tiles.provision.body": "Nos bastidores. Você nunca vê uma frase-semente — e nós também não. A chave fica com a Privy (nosso provedor de carteira gerenciada), nunca conosco; pelo design da Privy, nenhuma parte pode assinar sem você.",
  "hero.managed.tiles.heirEmail.title": "Reclamação por email",
  "hero.managed.tiles.heirEmail.body": "O seu herdeiro designado clica num link de email para reclamar. Sem conhecimentos cripto necessários (aplica-se também ao modelo de autocustódia).",
  "hero.managed.tiles.sameCrypto.title": "A mesma cripto por baixo",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD. O conteúdo do cofre continua autocustodiado. Só a camada da carteira é gerida.",
  "hero.managed.tiles.escape.title": "Saída de emergência para autocustódia",
  "hero.managed.tiles.escape.body": "Exporte as suas chaves de carteira a qualquer momento. Migre para autocustódia quando quiser.",
  "hero.managed.tiles.audience.title": "Para as pessoas da sua vida",
  "hero.managed.tiles.audience.body": "Que nunca configurariam a MetaMask — mas que mesmo assim têm uma vida digital que vale a pena deixar.",
  "hero.managed.closer": "A mesma matemática de cofre. Carteira mais fácil. A mesma honestidade sobre o que vemos e o que não vemos.",
  "hero.managed.notifyButton": "Avise-me quando estiver pronto",

  "pricing.priced-to-protect": "Preço para proteger, não para extrair.",
  "card.readHow": "Ver como →",
  "proof.title": "Provas, não promessas",
  "proof.loss.k": "À prova de perda",
  "proof.loss.b": "Carteira perdida, telemóvel morto, um fragmento perdido — qualquer limiar dos fragmentos restantes mais a sua palavra-passe mestra traz tudo de volta. A divisão é a sua rede de segurança, não apenas o gatilho da herança.",
  "proof.tamper.k": "À prova de adulteração",
  "proof.tamper.b": "Cada fragmento traz uma etiqueta AEAD + o manifesto é assinado Ed25519. Mude um byte e a restauração recusa.",
  "proof.spoof.k": "À prova de falsificação",
  "proof.spoof.b": "Os tokens soul-bound não podem ser transferidos. Um atacante não consegue fazer-se passar pelo seu herdeiro designado.",
  "proof.inherit.k": "Herança",
  "proof.inherit.b": "Se deixar de dar sinal, os seus familiares designados herdam automaticamente. Sem advogado, sem atrito de inventário.",
  "proof.airgap.k": "Air-gapped",
  "proof.airgap.b": "Registo em modo de avião. O núcleo criptográfico nunca precisa de rede.",
  "proof.ai.k": "Resistente a IA",
  "proof.ai.b": "A sua seed nunca chega perto de um modelo de linguagem. Sem treino de IA, sem prompts, sem inferência. Apenas matemática determinística.",
  "proof.fullinfo": "Informação completa — arquitetura, fornecedores, modelo de segurança, análise da concorrência →",
  "more.title": "Mais do que cripto — já disponível",
  "more.body": "Cartas seladas, cofre de documentos e cofre de imagens estão disponíveis hoje. Componha uma carta selada, cifre um testamento, digitalize papéis de família, proteja um arquivo de fotos — o mesmo pipeline dividir-cifrar-distribuir-herdar da sua seed cripto, todo no seu navegador.",
  "more.cta": "Abrir os seus cofres →",
  "keyless.titleA": "Não “sem chave”.",
  "keyless.titleB": "Autocustódia honesta.",
  "keyless.body": "Outras carteiras fingem que você não tem chaves — a maioria é custodial por trás do verniz. O NoKLock honra a sua frase-semente e depois torna-a difícil de perder, fácil de recuperar e pronta a herdar.",
  "keyless.cta": "Porquê não “sem chave” →",
  "ins.titleA": "Não temos seguro.",
  "ins.titleB": "Não precisamos.",
  "ins.body": "Casa, Ledger Recover e Vault12 têm seguro porque detêm as suas chaves. O seguro é o pedido de desculpas deles por poderem perdê-las. O NoKLock nunca toca nas suas chaves — não há nada para perdermos. É essa a diferença.",
  "nav.dashboard": "Painel",
  "nav.vaults": "Cofres",
  "nav.restore": "Restaurar",
  "nav.proveit": "Ver a prova",
  "nav.nok": "Designar familiar",
  "nav.heartbeat": "Sinal de vida",
  "nav.deadman": "Interruptor de homem morto",
  "nav.livemans": "Interruptor de homem vivo (alertas)",
  "nav.pricing": "Preços",
  "nav.refer": "Recomende e ganhe",
  "nav.info": "Informação",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock Enterprise)",
  "nav.settings": "Definições",
  "nav.advanced": "Avançado",
  "nav.disconnect": "Desligar",
  "nav.reconnecting": "A restaurar a sessão…",
  "footer.tagline": "Recuperação criptográfica autocustodiada para tudo o que não pode dar-se ao luxo de perder.",
  "footer.privacy": "Privacidade",
  "footer.terms": "Termos de utilização",
  "footer.howItWorks": "Como funciona",
  // TODO machine-translation (native review pending) — Google Play download surfaces.
  "footer.getAndroidApp": "Obter a app",
  "settings.getAndroidApp.title": "Obter a aplicação Android",
  "settings.getAndroidApp.body": "Instale o NoKLock a partir do Google Play para uma app no ecrã inicial — o mesmo site, ecrã inteiro, atualizações automáticas.",
  "download.title": "Obtenha a aplicação NoKLock",
  "download.androidNote": "toque no selo acima para instalar o NoKLock a partir do Google Play.",
  "download.iosNote": "abra noklock.app no Safari → toque em Partilhar → Adicionar ao ecrã principal.",
  "download.comingSoon": "Em breve no Google Play",
  "lang.label": "Idioma",
  // 2026-05-20 signature-differentiator strings (Option-B restructure).
  "stand.duress.k": "À-prova-de-coação",
  "stand.duress.t": "Duas senhas, dois cofres.",
  "stand.duress.b": "Cofre engodo opcional com sua própria senha. Sob coação você entrega o engodo — eles veem um cofre descartável plausível, seu cofre real fica oculto. Nenhum concorrente oferece isso.",
  "stand.social.k": "À-prova-de-engenharia-social",
  "stand.social.t": "NoKs independentes M-de-N.",
  "stand.social.b": "Herança multi-NoK — liberação requer M de N assinaturas independentes de diferentes carteiras. Um único NoK coagido ou comprometido não pode liberar sozinho. Phishing de um herdeiro não dá acesso.",
  "stand.noklockproof.k": "À-prova-de-desaparecimento-NoKLock",
  "stand.noklockproof.t": "Se desaparecermos, ainda funciona.",
  "stand.noklockproof.b": "Recuperação é 100% no lado do cliente (suas partes + senha mestra). Herança roda on-chain (Polygon + Chainlink). Self-heartbeat sobrevive mesmo se a NoKLock desaparecer. Verificado no PolygonScan — você pode auditar você mesmo.",
  "stand.selfcustody.k": "Auto-custódia",
  "stand.selfcustody.t": "Suas chaves. Seus dados. Sempre.",
  "stand.selfcustody.b": "NoKLock nunca vê ou toca sua seed, suas partes ou seus dados. A blockchain guarda apenas hashes e ponteiros, nunca texto claro. Sem honeypot conjunto, sem override de admin, sem refém de recuperação. Você detém tudo.",
  "soul.title": "NFTs Soulbound — sua herança, on-chain",
  "soul.body": "Quando você designa um herdeiro, a NoKLock cunha um único NFT de Ativação soulbound (ERC-5192) na Polygon — o gatilho do homem-morto: um herdeiro, um token. Cofres com quórum M-de-N adicionam um NFT de Votação por herdeiro. Soulbound significa não-transferível — uma vez cunhado, o token não pode ser vendido, movido, roubado ou apreendido. Um uso raro em produção do padrão ERC-5192, e o único uso conhecido em produção para herança cripto.",
  "soul.bodyB": "Os três contratos acima estão com código-fonte verificado no PolygonScan — clique em qualquer endereço para ler o código implantado. O SBT é o gatilho real de herança; License saca apenas os USDC que você aprovou explicitamente; o interruptor homem-morto do Oracle só é acessível via forwarder.",
  "soul.scoreLabel": "Revisão básica SolidityScan · zero fundos agrupados, zero custódia de chaves, superfície de ataque intencionalmente pequena",
  "proof.duress.k": "À-prova-de-coação",
  "proof.duress.b": "Cofre engodo opcional com sua própria senha mestra. Sob coação você revela o engodo — eles veem um cofre descartável plausível, o cofre real fica oculto.",
  "proof.social.k": "À-prova-de-engenharia-social",
  "proof.social.b": "Quórum multi-NoK M-de-N de carteiras independentes. Um único NoK coagido ou phishado não pode liberar sozinho — ele falha na verificação de quórum.",
  "proof.noklockproof.k": "À-prova-de-desaparecimento-NoKLock",
  "proof.noklockproof.b": "Recuperação é 100% no lado do cliente. Herança roda on-chain via Polygon + Chainlink. Self-heartbeat sobrevive mesmo se a NoKLock desaparecer amanhã.",

  // 0.6.0 — simple-vs-max-security framing (TODO: native PT review).
  "landing.proof.simpleMax.headline": "Três partes espalhadas pelas suas próprias pastas",
  "landing.proof.simpleMax.accent": "já é melhor que um post-it ou um arquivo de texto criptografado.",
  "landing.proof.simpleMax.simple": "Rota simples: escolha três pastas no seu laptop ou celular.",
  "landing.proof.simpleMax.max": "Segurança máxima: espalhe-as por diferentes discos, nuvens e provedores que você já usa.",
  "landing.proof.simpleMax.either": "De qualquer forma — proteção extrema, simplificada.",

  // 0.6.0 — Pricing FAQ "Telefone perdido" (TODO: native PT review).
  "pricing.faq.losePhone.question": "Perco o acesso se meu telefone morrer?",
  "pricing.faq.losePhone.intro": "Não. Sua seed não está armazenada no seu telefone. Ela é criptografada, dividida em partes via Shamir (3-de-5 por padrão) e espalhada pelo armazenamento que VOCÊ escolhe.",
  "pricing.faq.losePhone.simple": "Rota simples: três pastas no seu laptop ou celular — já mais seguro que um post-it ou um arquivo de texto criptografado.",
  "pricing.faq.losePhone.max": "Segurança máxima: espalhe-as por diferentes contas em nuvem, IPFS, Arweave, vários dispositivos.",
  "pricing.faq.losePhone.either": "De qualquer forma, você perde qualquer ponto de armazenamento e o resto ainda recupera a seed.",
  "pricing.faq.losePhone.secureEnclave": "Essa é a diferença estrutural em relação aos produtos do tipo carteira de hardware. A seed deles está trancada dentro de uma chave Secure Enclave / StrongBox que não pode ser exportada do chip — é isso que torna o chip seguro e que faz a seed deles morrer com o dispositivo. Eles remendam isso com rituais de frase de backup em papel. A NoKLock remove o ponto único de falha em vez de disfarçá-lo.",

  // 0.6.0 — CryptoInheritance Q "Telefone perdido" (TODO: native PT review).
  "crypto.q.losePhone.question": "O que acontece se eu perder meu telefone?",
  "crypto.q.losePhone.intro": "Nada fatal. Sua seed não vive no seu telefone — ela vive em partes Shamir criptografadas espalhadas pelo armazenamento que você escolheu no cadastro.",
  "crypto.q.losePhone.simple": "Rota simples: três pastas nos seus próprios dispositivos — já mais seguro que um post-it num livro ou um arquivo de texto criptografado na sua área de trabalho.",
  "crypto.q.losePhone.max": "Segurança máxima: espalhe as partes por diferentes contas em nuvem, IPFS, Arweave, vários discos.",
  "crypto.q.losePhone.either": "De qualquer forma, perca qualquer ponto de armazenamento e o resto ainda recupera a seed.",
  "crypto.q.losePhone.secureEnclave": "Essa é a diferença estrutural em relação aos produtos do tipo carteira de hardware. A seed deles está trancada dentro de um único dispositivo; perca-o sem o backup em papel e acabou. A seed da NoKLock é matematicamente distribuída antes que qualquer dispositivo a toque como um artefato recuperável.",

  // 0.6.0 — Enrol Step B "Duas rotas" (TODO: native PT review).
  "enrol.shareUrl.twoRoutes.headline": "Duas rotas — escolha o que combina com você hoje",
  "enrol.shareUrl.twoRoutes.simple": "Simples: coloque cada arquivo de parte em uma pasta diferente no seu laptop, celular, pen drive ou onde quer que você já guarde arquivos. Deixe o campo de URL abaixo em branco. Isso já é dramaticamente mais seguro que um post-it ou um arquivo de texto criptografado — perca uma pasta e o resto ainda recupera a seed.",
  "enrol.shareUrl.twoRoutes.max": "Segurança máxima: coloque cada parte em uma conta de nuvem diferente (Drive, Dropbox, OneDrive, IPFS, Arweave…) e cole a URL \"qualquer pessoa com o link\" abaixo. Essa separação é todo o sentido da divisão por limite: uma conta roubada vaza apenas uma parte, então seu cofre permanece seguro. Você e seu próximo de parentesco podem buscar as partes remotamente em vez de precisar de cada arquivo à mão.",
  "enrol.shareUrl.twoRoutes.urlsNote": "URLs são opcionais em ambas as rotas. A NoKLock armazena apenas a URL (localmente neste navegador, nada é enviado a lugar nenhum); os arquivos de partes em si nunca saem do seu controle.",

  // 0.7.0 — Pricing rework keys (TODO: native PT review).
  "pricing.summary.headline": "Dois caminhos de acesso ao mesmo cofre de armazenar + restaurar",
  "pricing.summary.body": "Autocustódia — você guarda as chaves. Managed — guardamos uma carteira embutida Privy para você (em breve, NL-2). Três níveis em ambos: Free / Standard / Premium. Preço Founder em todos os níveis pagos — as primeiras 10.000 licenças pagas de cada lado.",
  "pricing.tabs.selfCustody": "Autocustódia",
  "pricing.tabs.managed": "Managed (em breve)",
  "pricing.tabs.compare": "Comparar ambos",
  "pricing.tabs.enterprise": "Enterprise",
  "pricing.tabs.faq": "FAQ",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "Anual",
  "pricing.sku.lifetime": "Vitalício",
  "pricing.sku.autorenew": "(renova automaticamente via Paddle)",
  "pricing.managed.comingSoon": "Modo Managed em breve (NL-2)",
  "pricing.managed.subtitle": "Entre com Google / Apple / e-mail. A NoKLock guarda a carteira embutida para você. Usuários de autocustódia não são afetados.",
  "pricing.lifetime.tagline": "Pague uma vez. Nunca renove.",
  "pricing.founder.label": "Preço Founder — as primeiras 10.000 licenças pagas de cada lado. Imposto por contrato para autocustódia, rastreado via Form-B para managed.",
  "pricing.modeLabel.self": "Autocustódia — você guarda as chaves",
  "pricing.modeLabel.managed": "Managed — carteira embutida Privy",

  // 0.8.0 — Pricing round-2 copy keys (TODO: native PT review). Cloned from
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
  "tier.requires.standard": "Requer Standard — atualize em /pricing",
  "tier.requires.premium": "Requer Premium — atualize em /pricing",
  "tier.upgrade.cta": "Atualizar",

  // 0.11.0 — Homepage "Day-1 honest note" launch banner. {tests}/{solc} são
  // injetados como números não traduzidos no callsite.
  "landing.day1.badge": "Nota honesta do dia 1",
  "landing.day1.body": "A NoKLock acabou de ser lançada. Os contratos estão auditados. Os testes passam ({tests} no Solidity {solc}). Duas revisões independentes por IA estão concluídas. As primeiras semanas de qualquer produto real ainda revelam arestas, textos que falham, fluxos que não previmos. Avise-nos quando encontrar um.",
  "landing.day1.bug": "Encontrou um bug? Recompensa →",
  "landing.day1.rough": "Algo desajeitado? Como nos contar →",
  "landing.day1.email": "Fale connosco →",
  "landing.day1.dismissForever": "Ocultar para sempre",

  // 0.11.0 — Lead-in do carrossel de casos de uso.
  "home.useCases.leadIn": "Para que as pessoas realmente o usam",

  // 6 categorias de casos de uso do cofre.
  "vuc.cat.crypto-finance": "Chaves de cripto e finanças",
  "vuc.cat.digital-identity": "Identidade digital e contas",
  "vuc.cat.hidden-places": "Lugares ocultos e pistas físicas",
  "vuc.cat.vital-documents": "Documentos essenciais",
  "vuc.cat.final-wishes": "Últimas vontades e cartas pessoais",
  "vuc.cat.recovery-codes": "Códigos de recuperação e segredos de backup",

  // 26 cartões do carrossel (título + descrição). Nomes de marca permanecem inalterados.
  "vuc.card.crypto-finance:hw-wallet.title": "Seed de carteira de hardware",
  "vuc.card.crypto-finance:hw-wallet.blurb": "As 12 ou 24 palavras por trás da sua Ledger, Trezor ou Tangem.",
  "vuc.card.crypto-finance:soft-wallet.title": "Recuperação MetaMask / Rabby",
  "vuc.card.crypto-finance:soft-wallet.blurb": "Frase semente da carteira de software e qualquer chave de signatário multisig.",
  "vuc.card.crypto-finance:exchange-codes.title": "Códigos de recuperação da exchange",
  "vuc.card.crypto-finance:exchange-codes.blurb": "Os códigos de backup impressos que a Coinbase, Kraken ou Binance lhe deram no registo.",
  "vuc.card.crypto-finance:pw-manager.title": "Senha mestra do gestor de senhas",
  "vuc.card.crypto-finance:pw-manager.blurb": "Desbloqueia o resto da sua vida financeira — 1Password, Bitwarden, Dashlane.",
  "vuc.card.crypto-finance:2fa-seed.title": "Exportação da seed 2FA",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Lista de seeds do Google Authenticator / Authy / Aegis — sobrevive a um telemóvel perdido.",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + conta Google",
  "vuc.card.digital-identity:apple-google.blurb": "Logins raiz que controlam o seu telemóvel, fotos, contactos e e-mail.",
  "vuc.card.digital-identity:social-credentials.title": "Credenciais das redes sociais",
  "vuc.card.digital-identity:social-credentials.blurb": "Memorializar, publicar uma nota final ou encerrar conforme a política de cada plataforma.",
  "vuc.card.digital-identity:domains.title": "Logins do registador de domínios",
  "vuc.card.digital-identity:domains.blurb": "Os domínios expiram em silêncio — muitas vezes impossíveis de recuperar depois.",
  "vuc.card.digital-identity:cloud-storage.title": "Contas de armazenamento na nuvem",
  "vuc.card.digital-identity:cloud-storage.blurb": "Onde décadas de fotos, documentos e projetos pessoais realmente vivem.",
  "vuc.card.hidden-places:safe-deposit-photo.title": "Foto do cofre bancário",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "Agência, número do cofre e onde a chave + o cartão de assinatura ficam em casa.",
  "vuc.card.hidden-places:home-safe.title": "Localização + combinação do cofre doméstico",
  "vuc.card.hidden-places:home-safe.blurb": "Foto anotada com a combinação escrita no verso.",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "Onde a carteira de hardware se esconde",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "No fundo de qual gaveta, dentro de qual livro, sob qual tábua do soalho.",
  "vuc.card.hidden-places:spare-keys.title": "Localizações das chaves reservas",
  "vuc.card.hidden-places:spare-keys.blurb": "A caixa magnética sob a cava da roda — inútil se a sua localização morrer consigo.",
  "vuc.card.hidden-places:hidden-cash.title": "Dinheiro escondido e bens de família",
  "vuc.card.hidden-places:hidden-cash.blurb": "O envelope atrás do quadro, o cofre de chão sob o tapete.",
  "vuc.card.vital-documents:will-trust.title": "Testamento assinado e escritura de fideicomisso",
  "vuc.card.vital-documents:will-trust.blurb": "Os PDFs realmente assinados — não apenas «está com o advogado».",
  "vuc.card.vital-documents:insurance.title": "PDFs das apólices de seguro",
  "vuc.card.vital-documents:insurance.blurb": "Vida, património e pessoa-chave — para que nenhuma apólice reclamável seja esquecida.",
  "vuc.card.vital-documents:property-deeds.title": "Escrituras e títulos de propriedade",
  "vuc.card.vital-documents:property-deeds.blurb": "Prova de propriedade que transforma bens físicos em transferíveis.",
  "vuc.card.vital-documents:tax-returns.title": "Declarações fiscais recentes",
  "vuc.card.vital-documents:tax-returns.blurb": "Os últimos 3 a 7 anos + o contacto direto do contabilista.",
  "vuc.card.final-wishes:personal-letters.title": "Cartas a cada ente querido",
  "vuc.card.final-wishes:personal-letters.blurb": "As coisas que teria dito pessoalmente se tivesse havido tempo.",
  "vuc.card.final-wishes:funeral-prefs.title": "Desejos de funeral e sepultamento",
  "vuc.card.final-wishes:funeral-prefs.blurb": "Cremação ou sepultamento, a música, as leituras — a sua escolha, não a deles.",
  "vuc.card.final-wishes:ethical-will.title": "Testamento ético",
  "vuc.card.final-wishes:ethical-will.blurb": "Os valores, as lições e as histórias que quer que a próxima geração leve consigo.",
  "vuc.card.final-wishes:pet-care.title": "Desejos para o cuidado dos animais",
  "vuc.card.final-wishes:pet-care.blurb": "Quem fica com o cão, o que o gato come, o nome do veterinário e o número do chip.",
  "vuc.card.recovery-codes:printed-2fa.title": "Códigos de recuperação 2FA impressos",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google, Microsoft, GitHub, AWS, banco — aqueles que guardou.",
  "vuc.card.recovery-codes:yubikey.title": "Lista de registo do YubiKey",
  "vuc.card.recovery-codes:yubikey.blurb": "Números de série, contas registadas e onde a chave de backup é guardada.",
  "vuc.card.recovery-codes:disk-encryption.title": "Chaves de encriptação de disco",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker, FileVault, LUKS — sem elas, o portátil é um peso de papel.",
  "vuc.card.recovery-codes:gpg-age.title": "Chaves privadas GPG / Age",
  "vuc.card.recovery-codes:gpg-age.blurb": "Para quem realmente usa encriptação de ponta a ponta.",

  // 0.11.0 — Itens do menu suspenso de Info.
  "nav.info.appInfo": "Info da app",
  "nav.info.appUpdates": "Atualizações da app",
  "nav.info.enrolWalkthrough": "Guia de inscrição",
  "nav.info.articles": "Artigos NoKLock",

  // 0.12.0 — Caixa FSM da Landing: título + subtítulo.
  "landing.fsm.headline": "Confiança mais forte do que qualquer serviço oferece",
  "landing.fsm.subtitle": "O seu cofre está em exatamente um estado a qualquer momento. Esse estado vive na Polygon, não no nosso servidor.",

  // 0.12.0 — Diagrama de autómato FSMDiagram.tsx. Nomes de estados traduzidos;
  // os identificadores de código on-chain (assinaturas de funções + expressões
  // de ancoragem) permanecem literais no JSX.
  "fsm.title": "Ciclo de vida do cofre NoKLock · máquina de estados finita na Polygon",
  "fsm.subtitle": "cada estado on-chain · cada transição assinada criptograficamente · verifique o estado do seu cofre a qualquer momento, sem login",
  "fsm.transition.timeElapses": "o tempo decorre",
  "fsm.transition.graceElapses": "o prazo de tolerância decorre",
  "fsm.state.enrolled.name": "INSCRITO",
  "fsm.state.enrolled.desc": "cofre construído localmente",
  "fsm.state.heirDesignated.name": "HERDEIRO_DESIGNADO",
  "fsm.state.heirDesignated.desc": "NFT Activation cunhado (+ Voting para quórum)",
  "fsm.state.alive.name": "VIVO",
  "fsm.state.alive.desc": "batimento cardíaco recente",
  "fsm.state.dueSoon.name": "VENCE_EM_BREVE",
  "fsm.state.dueSoon.desc": "janela de tolerância a esgotar-se",
  "fsm.state.inGrace.name": "EM_TOLERÂNCIA",
  "fsm.state.inGrace.desc": "a aguardar performUpkeep",
  "fsm.state.activated.name": "ATIVADO",
  "fsm.state.activated.desc": "o interruptor disparou",
  "fsm.state.claimed.name": "RECLAMADO",
  "fsm.state.claimed.desc": "o herdeiro detém o SBT",
  "fsm.legend.happyPath": "caminho ideal — turquesa a fluir",
  "fsm.legend.heartbeat": "batimento cardíaco recebido → de volta a VIVO",
  "fsm.legend.sideStates": "ramificações de estados secundários",
  "fsm.legend.anchorNote": "Cada estado mostra a sua âncora on-chain (a linha por baixo). Os tracejados fluem continuamente; verifique o estado ao vivo de qualquer cofre na PolygonScan.",
};
