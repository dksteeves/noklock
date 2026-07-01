// @version 0.11.0 @date 2026-06-13  ·  简体中文 / Simplified Chinese
// 0.11.0 — Daniel 2026-06-13: English-only-surface i18n sweep mirroring
//          en.ts 0.12.0 — three previously-hardcoded funnel/nav surfaces:
//            (1) landing.day1.* — homepage "Day-1 honest note" launch banner.
//            (2) home.useCases.leadIn + vuc.cat.* (6) + vuc.card.* (26×2) —
//                homepage use-cases carousel lead-in, category labels, cards.
//            (3) nav.info.{appInfo,appUpdates,enrolWalkthrough} — Info-dropdown
//                menu items (NoKLock.white + Asserro reuse nav.whitelabel /
//                nav.corporate). MACHINE-TRANSLATION starting point — TODO
//                native zh-Hans review (English remains authoritative). Brand /
//                product names (Ledger, MetaMask, 1Password…) kept verbatim.
// @version 0.10.0 @date 2026-06-08  ·  简体中文 / Simplified Chinese
// 0.10.0 — Daniel 2026-06-08 round-5: managed-hero tile copy mirror — 3 key
//         value updates from en.ts (hero.managed.tiles.provision.body
//         expanded with Privy secure-enclave detail; hero.managed.tiles.
//         heirEmail.body appended "(also applies to self-custody model)";
//         hero.managed.tiles.escape.title changed from "Always escape-
//         hatchable" to "Self-custody escape hatch"). Machine-translation
//         starting point — TODO native zh-Hans review.
// @version 0.9.0 @date 2026-06-08  ·  简体中文 / Simplified Chinese
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys mirroring
//         en.ts 0.9.0. Machine-translation starting point — TODO native
//         zh-Hans review.
// @version 0.8.0 @date 2026-06-08  ·  简体中文 / Simplified Chinese
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys
//         mirroring en.ts 0.8.0 (buy-once + founder accordion, primary mode
//         selector, bottom summary block). Machine-translation starting
//         point — TODO native zh-Hans review.
// @version 0.7.0 @date 2026-06-08  ·  简体中文 / Simplified Chinese
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys
//         mirroring en.ts 0.7.0 (tier-box + tabs + summary block for the
//         Pricing rework Agent 1 is wiring). Machine-translation starting
//         point — TODO native zh-Hans review.
// @version 0.6.0 @date 2026-06-08  ·  简体中文 / Simplified Chinese
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep. 19 new
//         keys mirroring en.ts 0.6.0. Machine-translation starting point —
//         TODO native review.
// @version 0.5.0 @date 2026-06-02  ·  简体中文 / Simplified Chinese
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
//         card.airgap/threshold/ipfs/recover.k/t/b; diag.* labels — only
//         used in the archived HeroDiagram). hero.chip retained (still
//         rendered in the framing pill). Added nav.whitelabel + nav.corporate
//         (English brand strings — mirrored verbatim).
// 0.2.0 — Funnel, full keyed set. FLAG: first-pass draft — pending native
//         review (stated in-app: English is the authoritative version).
export const zhHans: Record<string, string> = {
  "hero.chip": "人类智慧。你的助记词上零 AI。简单而扎实的数学。",

  // 0.5.0 — Hero H1 / 标语 / H2。
  "hero.h1": "你的助记词。你的遗嘱。你的数字生活。",
  "hero.tagline": "超越钱包，高于密码管理器，先于律师。",
  "hero.h2": "备份并传承任意钱包——比特币、Solana、以太坊，任意链。",
  "hero.mainTagline": "不要丢失任何重要之物——不丢给时间，不丢给记忆，不丢给错的人。",
  "hero.subTagline": "面向加密原生用户的 Self-Custody 今日上线。面向其他所有人的 Managed 模式，即将推出。",

  // 英雄板块磁贴（Self-Custody）。
  "hero.tiles.crypto.title": "加密与金融",
  "hero.tiles.crypto.bullet1": "助记词",
  "hero.tiles.crypto.bullet2": "硬件钱包恢复纸",
  "hero.tiles.crypto.bullet3": "2FA 备份码",
  "hero.tiles.crypto.bullet4": "交易所与银行登录信息",
  "hero.tiles.documents.title": "文件与文档",
  "hero.tiles.documents.bullet1": "遗嘱与契据",
  "hero.tiles.documents.bullet2": "保险单",
  "hero.tiles.documents.bullet3": "医疗指示",
  "hero.tiles.documents.bullet4": "护照扫描件",
  "hero.tiles.digital.title": "数字生活",
  "hero.tiles.digital.bullet1": "你的密码管理器主密码",
  "hero.tiles.digital.bullet2": "Apple ID、Google、Facebook（以便继承人将账户设为纪念状态）",
  "hero.tiles.digital.bullet3": "无人知晓的订阅清单",
  "hero.tiles.hidden.title": "隐藏之处",
  "hero.tiles.hidden.bullet1": "保险箱钥匙实际位置的照片",
  "hero.tiles.hidden.bullet2": "备用钥匙",
  "hero.tiles.hidden.bullet3": "储物间门禁码",
  "hero.tiles.legacy.title": "个人遗产",
  "hero.tiles.legacy.bullet1": "写给特定的人的信",
  "hero.tiles.legacy.bullet2": "家族食谱",
  "hero.tiles.legacy.bullet3": "语音笔记",
  "hero.tiles.legacy.bullet4": "值得传承的故事",
  "hero.tiles.ops.title": "运营",
  "hero.tiles.ops.bullet1": "服务器与 API 密钥",
  "hero.tiles.ops.bullet2": "业务联系人",
  "hero.tiles.ops.bullet3": "只有你记得的运维手册",

  "hero.phonePinHook": "是的——你的手机 PIN 码并不能让他们进入你的云端。我们会告诉你什么才能。",
  "hero.closer.p1": "一切都在你的浏览器中发生。我们不存储你的助记词。我们也无法存——没有任何 API 调用会把它发送给我们。",
  "hero.closer.p2": "钱包丢失时自己找回。设备死掉后自己恢复。",
  "hero.closer.p3": "或者，如果你某天停止签到，让它自动交到你指定的人手中。",
  "hero.cta.getStarted": "开始使用",
  "hero.cta.seeMath": "查看数学原理",

  "hero.video.title": "全过程证明，动态呈现。",
  "hero.video.subline": "12 步端到端。每一项原语、每一个物理隔离时刻、每一次联网交叉。然后你自己跑一遍数学。",
  "hero.video.cta": "亲自验证 →",

  "hero.shamir.prefix": "在你的恢复阈值之下，NoKLock 的秘密分割",
  "hero.shamir.accent": "在数学上无法被破解",
  "hero.shamir.suffix": "。今日的计算机做不到。量子计算机也做不到。永远做不到。",

  // Managed 模式磁贴。
  "hero.managed.tiles.signin.title": "电子邮件或 Passkey 登录",
  "hero.managed.tiles.signin.body": "无需设置钱包。使用你常用的登录方式。",
  "hero.managed.tiles.provision.title": "我们代为创建钱包",
  "hero.managed.tiles.provision.body": "在后台完成。你永远看不到助记词——我们也看不到。密钥由 Privy（我们的托管钱包服务商）保管，绝不由我们保管；按照 Privy 的设计，任何一方都无法在没有你的情况下签名。",
  "hero.managed.tiles.heirEmail.title": "通过电子邮件继承",
  "hero.managed.tiles.heirEmail.body": "你指定的继承人点击邮件链接即可主张。无需任何加密知识（自我托管模式同样适用）。",
  "hero.managed.tiles.sameCrypto.title": "底层依旧是同样的加密",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD。保险库内容仍是自我托管。只有钱包层是托管的。",
  "hero.managed.tiles.escape.title": "自我托管逃生通道",
  "hero.managed.tiles.escape.body": "任何时候都可以导出你的钱包密钥。随时迁移到自我托管。",
  "hero.managed.tiles.audience.title": "为你生活中的那些人",
  "hero.managed.tiles.audience.body": "他们永远不会去设置 MetaMask——但同样拥有值得留下的数字生活。",
  "hero.managed.closer": "同样的保险库数学。更简单的钱包。对于我们看与不看，同样诚实。",
  "hero.managed.notifyButton": "就绪时通知我",

  "pricing.priced-to-protect": "定价为了保护，不是为了榨取。",
  "card.readHow": "了解原理 →",
  "proof.title": "证据，而非承诺",
  "proof.loss.k": "防丢失",
  "proof.loss.b": "钱包丢失、手机损坏、一份分片丢失——剩余分片的任意阈值加上你的主密码即可找回。分割是你的安全网，不只是继承触发器。",
  "proof.tamper.k": "防篡改",
  "proof.tamper.b": "每份分片都带 AEAD 标签 + 清单经 Ed25519 签名。改动一个字节，恢复即拒绝。",
  "proof.spoof.k": "防冒充",
  "proof.spoof.b": "灵魂绑定代币无法转让。攻击者无法冒充你指定的继承人。",
  "proof.inherit.k": "继承",
  "proof.inherit.b": "如果你停止签到，你指定的近亲将自动继承。无需律师，没有遗产摩擦。",
  "proof.airgap.k": "物理隔离",
  "proof.airgap.b": "在飞行模式下登记。加密核心从不需要网络。",
  "proof.ai.k": "抗 AI",
  "proof.ai.b": "你的助记词永远不会接近语言模型。无 AI 训练、无提示词、无推理。只有确定性数学。",
  "proof.fullinfo": "完整信息——架构、提供方、安全模型、竞品分析 →",
  "more.title": "不止加密——现已上线",
  "more.body": "密封信件、文档保险库与图像保险库今日全部上线。撰写一封密封信，加密遗嘱，扫描家庭文件，保护照片档案——与你的加密助记词相同的分割-加密-分发-继承流程，全部在你的浏览器中运行。",
  "more.cta": "打开你的保险库 →",
  "keyless.titleA": "并非“无密钥”。",
  "keyless.titleB": "诚实的自我托管。",
  "keyless.body": "其他钱包假装你没有密钥——其中多数在光鲜外表下是托管式的。NoKLock 尊重你的助记词，然后让它难以丢失、易于恢复、可供继承。",
  "keyless.cta": "为何不“无密钥” →",
  "ins.titleA": "我们不投保。",
  "ins.titleB": "我们也不需要。",
  "ins.body": "Casa、Ledger Recover 和 Vault12 投保，因为它们持有你的密钥。保险是它们对“可能弄丢密钥”的致歉。NoKLock 从不接触你的密钥——我们没有什么可弄丢的。这就是区别。",
  "nav.dashboard": "仪表板",
  "nav.vaults": "保险库",
  "nav.restore": "恢复",
  "nav.proveit": "实证演示",
  "nav.nok": "指定近亲",
  "nav.heartbeat": "心跳",
  "nav.deadman": "失联触发开关",
  "nav.livemans": "在世提醒开关（警报）",
  "nav.pricing": "价格",
  "nav.refer": "推荐并赚取",
  "nav.info": "信息",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock 企业版)",
  "nav.settings": "设置",
  "nav.advanced": "高级",
  "nav.disconnect": "断开连接",
  "nav.reconnecting": "正在恢复会话…",
  "footer.tagline": "为你输不起的一切提供的自我托管加密恢复。",
  "footer.privacy": "隐私",
  "footer.terms": "使用条款",
  "footer.howItWorks": "工作原理",
  // TODO machine-translation (native review pending) — Google Play download surfaces.
  "footer.getAndroidApp": "获取应用",
  "settings.getAndroidApp.title": "获取安卓应用",
  "settings.getAndroidApp.body": "从 Google Play 安装 NoKLock，获得主屏幕应用——同一网站、全屏、自动更新。",
  "download.title": "获取 NoKLock 应用",
  "download.androidNote": "点击上方徽章，从 Google Play 安装 NoKLock。",
  "download.iosNote": "在 Safari 中打开 noklock.app → 点按“分享”→ 添加到主屏幕。",
  "download.comingSoon": "即将登陆 Google Play",
  "lang.label": "语言",
  // 2026-05-20 signature-differentiator strings (Option-B restructure).
  "stand.duress.k": "抗胁迫",
  "stand.duress.t": "两个密码，两个保险库。",
  "stand.duress.b": "可选诱饵保险库，使用独立密码。受到胁迫时，您交出诱饵——攻击者看到的是可信的弃用保险库，您真正的保险库仍隐藏。没有竞争对手提供这项功能。",
  "stand.social.k": "抗社会工程",
  "stand.social.t": "M-of-N 独立 NoK。",
  "stand.social.b": "多 NoK 继承——释放需要来自不同钱包的 N 个中 M 个的独立签名。单个被胁迫或受损的 NoK 无法独自释放。钓鱼单个继承人无法获得访问。",
  "stand.noklockproof.k": "NoKLock-无关",
  "stand.noklockproof.t": "即便我们消失，仍然有效。",
  "stand.noklockproof.b": "恢复 100% 在客户端（您的份额+主密码）。继承在链上运行（Polygon+Chainlink）。即使 NoKLock 消失，Self-heartbeat 仍然有效。在 PolygonScan 上验证——您可以自己审计。",
  "stand.selfcustody.k": "自主托管",
  "stand.selfcustody.t": "您的密钥。您的数据。永远如此。",
  "stand.selfcustody.b": "NoKLock 从不查看或接触您的种子、份额或数据。链只存储哈希和指针，从不存储明文。没有集中蜜罐、没有管理员覆盖、没有恢复人质。一切都在您手中。",
  "soul.title": "灵魂绑定 NFT——您的链上继承",
  "soul.body": "当您指定继承人时，NoKLock 在 Polygon 上铸造一个灵魂绑定激活 NFT（ERC-5192）——死人开关触发器：一位继承人，一个代币。M-of-N 法定人数保险库会为每位继承人额外铸造一个投票 NFT。灵魂绑定意味着不可转让——一旦铸造，代币无法出售、转移、被盗或被没收。这是 ERC-5192 标准在生产中的罕见使用，也是加密继承领域唯一已知的生产使用。",
  "soul.bodyB": "上面三个合约都在 PolygonScan 上经过源代码验证——点击任意地址即可阅读已部署的代码。SBT 是实际的继承触发器；License 仅扣除您明确批准的 USDC；Oracle 的死人开关仅通过 forwarder 可访问。",
  "soul.scoreLabel": "基础 SolidityScan 审查 · 零汇总资金、零密钥托管、刻意精简的攻击面",
  "proof.duress.k": "抗胁迫",
  "proof.duress.b": "可选诱饵保险库，使用独立主密码。受到胁迫时，您透露诱饵——攻击者看到的是可信的弃用保险库，真正的保险库仍隐藏。",
  "proof.social.k": "抗社会工程",
  "proof.social.b": "来自独立钱包的多 NoK M-of-N 法定人数。单个被胁迫或被钓鱼的 NoK 无法独自释放——它会在法定人数检查中失败。",
  "proof.noklockproof.k": "NoKLock-无关",
  "proof.noklockproof.b": "恢复 100% 在客户端。继承通过 Polygon+Chainlink 在链上运行。即使 NoKLock 明天消失，Self-heartbeat 仍然存活。",

  // 0.6.0 — simple-vs-max-security framing (TODO: native zh-Hans review).
  "landing.proof.simpleMax.headline": "将三份分散在您自己的文件夹中",
  "landing.proof.simpleMax.accent": "已经胜过便条或加密文本文件。",
  "landing.proof.simpleMax.simple": "简单路线：在笔记本电脑或手机上选择三个文件夹。",
  "landing.proof.simpleMax.max": "最高安全：将它们分散到您已经使用的不同硬盘、云和提供商。",
  "landing.proof.simpleMax.either": "无论哪种方式——极致保护，简化处理。",

  // 0.6.0 — Pricing FAQ "手机丢失" (TODO: native zh-Hans review).
  "pricing.faq.losePhone.question": "如果我的手机坏了，我会失去访问权限吗？",
  "pricing.faq.losePhone.intro": "不会。您的种子不存储在手机上。它经过加密、通过 Shamir 分成份额（默认 3-of-5）、并分散在您选择的存储中。",
  "pricing.faq.losePhone.simple": "简单路线：笔记本电脑或手机上的三个文件夹——已经比便条或加密文本文件更安全。",
  "pricing.faq.losePhone.max": "最高安全：将它们分散到不同的云账户、IPFS、Arweave 和多个设备。",
  "pricing.faq.losePhone.either": "无论哪种方式，丢失任何一个存放点，其余仍可恢复种子。",
  "pricing.faq.losePhone.secureEnclave": "这就是与硬件钱包式产品的结构性差异。它们的种子被锁定在无法从芯片导出的 Secure Enclave / StrongBox 密钥内——这正是芯片安全的原因，也是它们的种子随设备一同消亡的原因。它们用纸质备份短语仪式来弥补。NoKLock 是消除单点故障，而不是粉饰它。",

  // 0.6.0 — CryptoInheritance Q "手机丢失" (TODO: native zh-Hans review).
  "crypto.q.losePhone.question": "如果我丢了手机会发生什么？",
  "crypto.q.losePhone.intro": "没有致命的。您的种子不存在于您的手机上——它存在于加密的 Shamir 份额中，分散在您注册时选择的存储中。",
  "crypto.q.losePhone.simple": "简单路线：您自己设备上的三个文件夹——已经比书本里的便条或桌面上的加密文本文件更安全。",
  "crypto.q.losePhone.max": "最高安全：将份额分散到不同的云账户、IPFS、Arweave 和多个硬盘。",
  "crypto.q.losePhone.either": "无论哪种方式，丢失任何一个存放点，其余仍可恢复种子。",
  "crypto.q.losePhone.secureEnclave": "这就是与硬件钱包式产品的结构性差异。它们的种子被锁定在单一设备内；没有纸质备份就完了。NoKLock 的种子在任何设备将其作为可恢复工件处理之前就已在数学上分布。",

  // 0.6.0 — Enrol Step B "两条路线" (TODO: native zh-Hans review).
  "enrol.shareUrl.twoRoutes.headline": "两条路线——选择今天适合您的方式",
  "enrol.shareUrl.twoRoutes.simple": "简单：将每个份额文件放入笔记本电脑、手机、U 盘或您已经存放文件的任何位置的不同文件夹中。下面的 URL 字段留空。这已经比便条或加密文本文件安全得多——丢失任何一个文件夹，其余仍可恢复种子。",
  "enrol.shareUrl.twoRoutes.max": "最高安全：将每个份额放入不同的云账户（Drive、Dropbox、OneDrive、IPFS、Arweave……）并将\"任何拥有链接的人\"URL 粘贴在下面。这种分离正是阈值分割的全部意义所在：被盗的账户只泄露一份份额，因此您的保险库仍然安全。您和您的下一代亲属可以远程获取份额，而无需手头有每个文件。",
  "enrol.shareUrl.twoRoutes.urlsNote": "在两条路线中 URL 都是可选的。NoKLock 只存储 URL（本地存于此浏览器中，不会发送到任何地方）；份额文件本身永远不会离开您的控制。",

  // 0.7.0 — Pricing rework keys (TODO: native zh-Hans review).
  "pricing.summary.headline": "通往同一个存储 + 恢复保险库的两条访问路径",
  "pricing.summary.body": "自托管 — 您持有密钥。托管 — 我们为您保管 Privy 嵌入式钱包（即将推出，NL-2）。两种方式都有三个等级：Free / Standard / Premium。所有付费等级享受 Founder 价格 — 每一边的前 10,000 个付费许可证。",
  "pricing.tabs.selfCustody": "自托管",
  "pricing.tabs.managed": "托管（即将推出）",
  "pricing.tabs.compare": "比较两者",
  "pricing.tabs.enterprise": "企业版",
  "pricing.tabs.faq": "常见问题",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "年度",
  "pricing.sku.lifetime": "终身",
  "pricing.sku.autorenew": "（通过 Paddle 自动续订）",
  "pricing.managed.comingSoon": "托管模式即将推出（NL-2）",
  "pricing.managed.subtitle": "使用 Google / Apple / 电子邮件登录。NoKLock 为您保管嵌入式钱包。自托管用户不受影响。",
  "pricing.lifetime.tagline": "一次付费。永不续订。",
  "pricing.founder.label": "Founder 价格 — 每一边的前 10,000 个付费许可证。自托管由合约强制执行，托管通过 Form-B 跟踪。",
  "pricing.modeLabel.self": "自托管 — 您持有密钥",
  "pricing.modeLabel.managed": "托管 — Privy 嵌入式钱包",

  // 0.8.0 — Pricing round-2 copy keys (TODO: native zh-Hans review). Cloned
  // from en.ts 0.8.0 as a machine-translation starting point.
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
  "tier.requires.standard": "需要 Standard — 在 /pricing 升级",
  "tier.requires.premium": "需要 Premium — 在 /pricing 升级",
  "tier.upgrade.cta": "升级",

  // 0.11.0 — Homepage "Day-1 honest note" launch banner. {tests}/{solc} are
  // injected as untranslated numbers at the callsite.
  // TODO native zh-Hans review — machine-translation draft (English authoritative).
  "landing.day1.badge": "上线首日的诚实说明",
  "landing.day1.body": "NoKLock 刚刚上线。合约已经过审计。测试全部通过（Solidity {solc} 上 {tests}）。两轮独立的 AI 审查均已完成。任何真实产品的最初几周仍会暴露出粗糙之处、未尽人意的文案，以及我们未曾预料的流程。当您发现问题时请告诉我们。",
  "landing.day1.bug": "发现漏洞？赏金 →",
  "landing.day1.rough": "哪里别扭？如何告诉我们 →",
  "landing.day1.email": "给我们发邮件 →",
  "landing.day1.dismissForever": "永久隐藏",

  // 0.11.0 — Use-cases carousel lead-in. TODO native zh-Hans review.
  "home.useCases.leadIn": "人们实际用它来存放什么",

  // 6 个保险库用例类别。TODO native zh-Hans review.
  "vuc.cat.crypto-finance": "加密与金融密钥",
  "vuc.cat.digital-identity": "数字身份与账户",
  "vuc.cat.hidden-places": "隐藏之处与实体线索",
  "vuc.cat.vital-documents": "重要文件",
  "vuc.cat.final-wishes": "最后心愿与私人信件",
  "vuc.cat.recovery-codes": "恢复码与备份机密",

  // 26 张轮播卡片（标题 + 简述）。品牌名称保持不变。
  // TODO native zh-Hans review — machine-translation draft.
  "vuc.card.crypto-finance:hw-wallet.title": "硬件钱包助记词",
  "vuc.card.crypto-finance:hw-wallet.blurb": "您 Ledger、Trezor 或 Tangem 背后的 12 或 24 个单词。",
  "vuc.card.crypto-finance:soft-wallet.title": "MetaMask / Rabby 恢复",
  "vuc.card.crypto-finance:soft-wallet.blurb": "软件钱包助记词以及任何多签签名者密钥。",
  "vuc.card.crypto-finance:exchange-codes.title": "交易所恢复码",
  "vuc.card.crypto-finance:exchange-codes.blurb": "Coinbase、Kraken 或 Binance 在您注册时给您的打印备份码。",
  "vuc.card.crypto-finance:pw-manager.title": "密码管理器主密码",
  "vuc.card.crypto-finance:pw-manager.blurb": "解锁您其余的财务生活——1Password、Bitwarden、Dashlane。",
  "vuc.card.crypto-finance:2fa-seed.title": "2FA 种子导出",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Google Authenticator / Authy / Aegis 种子列表——手机丢失也能保留。",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + Google 账户",
  "vuc.card.digital-identity:apple-google.blurb": "掌控您手机、照片、联系人和电子邮件的根登录。",
  "vuc.card.digital-identity:social-credentials.title": "社交媒体凭证",
  "vuc.card.digital-identity:social-credentials.blurb": "按每个平台的政策进行纪念化、发布最后留言或关闭。",
  "vuc.card.digital-identity:domains.title": "域名注册商登录",
  "vuc.card.digital-identity:domains.blurb": "域名会悄无声息地过期——事后往往无法恢复。",
  "vuc.card.digital-identity:cloud-storage.title": "云存储账户",
  "vuc.card.digital-identity:cloud-storage.blurb": "数十年的照片、文档和个人项目真正存放之处。",
  "vuc.card.hidden-places:safe-deposit-photo.title": "保险箱照片",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "网点、箱号，以及钥匙 + 签名卡在家中的位置。",
  "vuc.card.hidden-places:home-safe.title": "家用保险箱位置 + 密码",
  "vuc.card.hidden-places:home-safe.blurb": "背面写有密码的标注照片。",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "硬件钱包藏在何处",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "哪个抽屉的后面、哪本书里面、哪块地板下面。",
  "vuc.card.hidden-places:spare-keys.title": "备用钥匙位置",
  "vuc.card.hidden-places:spare-keys.blurb": "轮拱下的磁吸盒——若其位置随您而逝便毫无用处。",
  "vuc.card.hidden-places:hidden-cash.title": "藏匿的现金与传家宝",
  "vuc.card.hidden-places:hidden-cash.blurb": "画作后的信封、地毯下的地板保险箱。",
  "vuc.card.vital-documents:will-trust.title": "已签署的遗嘱与信托契据",
  "vuc.card.vital-documents:will-trust.blurb": "实际签署的 PDF——不只是「在律师那里」。",
  "vuc.card.vital-documents:insurance.title": "保险单 PDF",
  "vuc.card.vital-documents:insurance.blurb": "人寿、财产与关键人——确保没有可理赔的保单被遗漏。",
  "vuc.card.vital-documents:property-deeds.title": "房产契据与产权证",
  "vuc.card.vital-documents:property-deeds.blurb": "将实物资产转变为可转让资产的所有权证明。",
  "vuc.card.vital-documents:tax-returns.title": "近期纳税申报表",
  "vuc.card.vital-documents:tax-returns.blurb": "最近 3–7 年 + 会计师的直接联系方式。",
  "vuc.card.final-wishes:personal-letters.title": "写给每位挚爱的信",
  "vuc.card.final-wishes:personal-letters.blurb": "若还有时间，您本会当面说出的那些话。",
  "vuc.card.final-wishes:funeral-prefs.title": "葬礼与安葬心愿",
  "vuc.card.final-wishes:funeral-prefs.blurb": "火葬还是土葬、音乐、诵读——由您决定，而非他们。",
  "vuc.card.final-wishes:ethical-will.title": "道德遗嘱",
  "vuc.card.final-wishes:ethical-will.blurb": "您希望下一代承袭的价值观、教训与故事。",
  "vuc.card.final-wishes:pet-care.title": "宠物照护心愿",
  "vuc.card.final-wishes:pet-care.blurb": "谁来照顾狗、猫吃什么、兽医姓名与芯片编号。",
  "vuc.card.recovery-codes:printed-2fa.title": "打印的 2FA 恢复码",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google、Microsoft、GitHub、AWS、银行——那些您收好的。",
  "vuc.card.recovery-codes:yubikey.title": "YubiKey 注册清单",
  "vuc.card.recovery-codes:yubikey.blurb": "序列号、已注册账户，以及备用密钥的存放处。",
  "vuc.card.recovery-codes:disk-encryption.title": "磁盘加密密钥",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker、FileVault、LUKS——没有它们，笔记本电脑就是一块砖。",
  "vuc.card.recovery-codes:gpg-age.title": "GPG / Age 私钥",
  "vuc.card.recovery-codes:gpg-age.blurb": "适用于真正使用端到端加密的人。",

  // 0.11.0 — Info-dropdown menu items. TODO native zh-Hans review.
  "nav.info.appInfo": "应用信息",
  "nav.info.appUpdates": "应用更新",
  "nav.info.enrolWalkthrough": "注册流程指引",
  "nav.info.articles": "NoKLock 文章",

  // 0.12.0 — Landing FSM box headline + subtitle. Machine-translation draft —
  // TODO native zh-Hans review (English authoritative).
  "landing.fsm.headline": "比任何服务都更强的信任",
  "landing.fsm.subtitle": "您的保险库在任何时刻都恰好处于一种状态。该状态存在于 Polygon 上，而非我们的服务器上。",

  // 0.12.0 — FSMDiagram.tsx state-machine SVG. State names translated; on-chain
  // code identifiers (function signatures + anchor expressions) kept literal in
  // JSX. Machine-translation draft — TODO native zh-Hans review.
  "fsm.title": "NoKLock 保险库生命周期 · Polygon 上的有限状态机",
  "fsm.subtitle": "每个状态均上链 · 每次转换均经加密签名 · 随时验证您保险库的状态，无需登录",
  "fsm.transition.timeElapses": "时间流逝",
  "fsm.transition.graceElapses": "宽限期流逝",
  "fsm.state.enrolled.name": "已登记",
  "fsm.state.enrolled.desc": "保险库在本地构建",
  "fsm.state.heirDesignated.name": "已指定继承人",
  "fsm.state.heirDesignated.desc": "已铸造 Activation NFT（法定人数时含 Voting）",
  "fsm.state.alive.name": "存活",
  "fsm.state.alive.desc": "心跳新鲜",
  "fsm.state.dueSoon.name": "即将到期",
  "fsm.state.dueSoon.desc": "宽限窗口正在耗尽",
  "fsm.state.inGrace.name": "宽限中",
  "fsm.state.inGrace.desc": "等待 performUpkeep",
  "fsm.state.activated.name": "已激活",
  "fsm.state.activated.desc": "开关已触发",
  "fsm.state.claimed.name": "已认领",
  "fsm.state.claimed.desc": "继承人持有 SBT",
  "fsm.legend.happyPath": "正常路径——流动的青色",
  "fsm.legend.heartbeat": "收到心跳 → 返回存活",
  "fsm.legend.sideStates": "旁支状态分支",
  "fsm.legend.anchorNote": "每个状态都显示其链上锚点（下方的那一行）。虚线持续流动；可在 PolygonScan 上验证任何保险库的实时状态。",
};
