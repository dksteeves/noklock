// @version 0.1.0 @date 2026-05-20
// Section N — Ops Manual catalogue (single source of truth). Consumed by
// the AdminOpsManual tab renderer AND by the RTF exporter so the chat /
// admin-page / offline-pdf views can never drift.
//
// Daniel's rule: "none of this can be silently dropped" — the snapshot
// test (data/ops-manual.test.ts) will lock this against accidental
// regressions once vitest runs.

export type Cadence = "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "event" | "incident";
export type Domain  = "contracts" | "formB" | "pwa" | "hybridE" | "compliance" | "incident";

export interface OpsItem {
  readonly id: string;
  readonly domain: Domain;
  readonly cadence: Cadence;
  readonly title: string;
  readonly description: string;
  readonly expected?: string;
  readonly action?: string;
  /** If the live data has a Form B endpoint or contract view, the source
   *  hint helps the live tab decide whether to render a tile. */
  readonly liveSource?: "fb" | "chain" | "manual";
}

export const OPS_CATALOGUE: readonly OpsItem[] = [
  // -- Contracts × cadence ------------------------------------------------
  { id: "c-d-founder-cap", domain: "contracts", cadence: "daily", title: "Founder cap remaining", description: "License.founderCapRemaining() ticks down with each paid mint; auto-steps founder→regular at zero. FounderCapReached fires once.", expected: "> 100 until the cohort is nearly full", action: "No action while > 100. Plan a launch-event post when it nears zero.", liveSource: "chain" },
  { id: "c-d-owner-gas",   domain: "contracts", cadence: "daily", title: "Owner-wallet POL gas",   description: "Deployer/owner POL balance — keep funded for owner txs.", expected: "> 5 POL", action: "< 2 POL: top up. < 0.5 POL: escalate.", liveSource: "manual" },
  { id: "c-d-treasury",    domain: "contracts", cadence: "daily", title: "Treasury USDC balance", description: "Watch for unexpected drops; reconcile with paid mints.", expected: "matches day-over-day mint delta", liveSource: "chain" },
  { id: "c-d-pending-owner", domain: "contracts", cadence: "daily", title: "Ownable2Step pendingOwner (every NoKLock contract)", description: "On every NoKLock contract (License / SBT / Oracle / Recovery / Escrow + Alerts once deployed). Non-zero is fine ONLY if you initiated a handover.", expected: "0x000…000 on each unless you started a transfer", action: "Non-zero + unexpected = potential hijack/stale state — investigate immediately.", liveSource: "chain" },
  { id: "c-d-indexer-head", domain: "contracts", cadence: "daily", title: "Indexer head-lag", description: "How far behind chain head the Form B indexer cursor is.", expected: "< 200 blocks (~7 min)", liveSource: "fb" },
  { id: "c-d-email-queue", domain: "contracts", cadence: "daily", title: "email_jobs queue", description: "pending=0, failed=0, oldest_pending_age < 5 min for healthy.", action: "failed > 0 or oldest_pending_age > 15 min: investigate SMTP creds + worker.", liveSource: "fb" },

  { id: "c-w-pusher",       domain: "contracts", cadence: "weekly", title: "Oracle pusher[] integrity", description: "MUST equal exactly {Chainlink forwarder, owner}. Any rogue extra = compromise.", action: "If anomaly: setForwarder(new) or setPusher(addr, false).", liveSource: "chain" },
  { id: "c-w-mintable",     domain: "contracts", cadence: "weekly", title: "Tier mintability flags",   description: "Tiers 1/2/3/6 = true; 4/5 = false (Family Office / Institutional gated until launch).", liveSource: "chain" },
  { id: "c-w-prices",       domain: "contracts", cadence: "weekly", title: "Tier prices — currentPrice(tier)", description: "Sanity check tier 1..6 founder vs regular pricing matches Pricing page + on-chain.", liveSource: "chain" },
  { id: "c-w-sweep",        domain: "contracts", cadence: "weekly", title: "Treasury sweep cadence",   description: "Sweep treasury USDC to cold storage when accumulated > ~$1k.", liveSource: "manual" },

  { id: "c-m-referral",     domain: "contracts", cadence: "monthly", title: "Referral params still 10/10",  description: "License.refereeDiscountBps == 1000, referrerShareBps == 1000.", action: "Owner: setReferralParams(1000, 1000, …) if drifted.", liveSource: "chain" },
  { id: "c-m-nok-limits",   domain: "contracts", cadence: "monthly", title: "NoK-cap policy retune",         description: "License.nokLimitForTier(0|1|2) — Free 1 / Std 3 / Prem 5 default.", action: "setNokLimits(free, std, prem) to retune. No redeploy needed.", liveSource: "chain" },
  { id: "c-m-recovery-addr", domain: "contracts", cadence: "monthly", title: "Recovery module on SBT",        description: "SBT.recoveryModule() must match deployed NoKLockRecovery address.", liveSource: "chain" },
  { id: "c-m-escrow-attestor", domain: "contracts", cadence: "monthly", title: "Escrow attestor on contract", description: "NoKLockEscrow.attestor() must match the Form B ESCROW_ATTESTATION_PRIVATE_KEY-derived address.", liveSource: "chain" },
  { id: "c-m-polygonscan", domain: "contracts", cadence: "monthly", title: "PolygonScan source verification", description: "All 6 contract pages still show the 'Verified' green check.", liveSource: "manual" },

  { id: "c-q-attestor-rotate", domain: "contracts", cadence: "quarterly", title: "Rotate ESCROW_ATTESTATION_PRIVATE_KEY", description: "Hot server key — quarterly rotation per the file's NatSpec.", action: "Generate new key → set in cPanel env → restart Form B → owner WR Escrow.setAttestor(newAddr).", liveSource: "fb" },
  { id: "c-q-internal-rotate", domain: "contracts", cadence: "quarterly", title: "Rotate INTERNAL_TRIGGER_TOKEN",          description: "Machine-to-machine secret for internal endpoints.", action: "Generate new 32-byte hex → cPanel env → restart Form B → update external watcher.", liveSource: "fb" },
  { id: "c-q-solscan",         domain: "contracts", cadence: "quarterly", title: "SolidityScan re-scan all 6",                description: "Watch for new rules / drift.", liveSource: "manual" },

  { id: "c-e-cap-reached",  domain: "contracts", cadence: "event", title: "FounderCapReached event observed", description: "The 10,000th paid mint emits this. Verify currentPrice steps to regular; publish a launch Update.", liveSource: "chain" },
  { id: "c-e-redeploy",     domain: "contracts", cadence: "event", title: "Any contract change/redeploy", description: "Re-verify on PolygonScan; SolidityScan re-scan; PWA env swap; Audit republish.", liveSource: "manual" },

  // -- Form B × cadence -------------------------------------------------
  { id: "fb-d-health",       domain: "formB", cadence: "daily", title: "Form B /v1/ops/health",   description: "ok + db integrity + uptime.", liveSource: "fb" },
  { id: "fb-d-rpc",          domain: "formB", cadence: "daily", title: "Polygon RPC self-test",   description: "headBlock + deep-block-getLogs probe at DEPLOY_BLOCK.", action: "If pruned: switch POLYGON_RPC_URL to an archive provider.", liveSource: "fb" },
  { id: "fb-d-email-summary", domain: "formB", cadence: "daily", title: "email_jobs summary",      description: "pending / failed / sentLast24h / oldestPendingAgeSec / maxAttempts.", liveSource: "fb" },
  { id: "fb-d-heartbeat-summary", domain: "formB", cadence: "daily", title: "heartbeats by source", description: "Daniel-side cron + on-chain selfHeartbeat + email-link all healthy.", liveSource: "fb" },

  { id: "fb-w-sqlite-backup", domain: "formB", cadence: "weekly", title: "SQLite weekly backup", description: "cp data/noklock.sqlite to a dated file. Keep 8 weekly + 12 monthly.", action: "cron at 5 4 * * 0", liveSource: "manual" },
  { id: "fb-w-disk",          domain: "formB", cadence: "weekly", title: "cPanel disk usage",     description: "df -h /home/tudabirds — > 25% free.", liveSource: "manual" },
  { id: "fb-w-smtp-selftest", domain: "formB", cadence: "weekly", title: "SMTP self-test",       description: "POST /v1/ops/smtp-selftest sends a no-op email to hello@noklock.app.", liveSource: "fb" },

  { id: "fb-m-dns", domain: "formB", cadence: "monthly", title: "SPF / DKIM / DMARC on noklock.app", description: "dig TXT — confirm records match expected (see /v1/ops/dns-summary for the static reminder).", liveSource: "manual" },
  { id: "fb-m-backup-restore", domain: "formB", cadence: "monthly", title: "Backup-restore drill", description: "Restore the latest weekly backup into a staging dir; sanity-check row counts.", liveSource: "manual" },
  { id: "fb-m-restart-drill",  domain: "formB", cadence: "monthly", title: "cPanel restart drill", description: "Restart the Node app + confirm /v1/ops/health responds within 10s.", liveSource: "manual" },
  { id: "fb-m-secret-ages",    domain: "formB", cadence: "monthly", title: "Secret ages",          description: "GET /v1/ops/secret-ages — ESCROW_ATTESTATION_PRIVATE_KEY + INTERNAL_TRIGGER_TOKEN ages in days. Rotate at 90+ days.", liveSource: "fb" },

  { id: "fb-q-npm-audit", domain: "formB", cadence: "quarterly", title: "npm audit on Form B", description: "npm audit --omit=dev — 0 high/critical.", liveSource: "manual" },
  { id: "fb-q-node-ver",  domain: "formB", cadence: "quarterly", title: "Node version", description: "Stay on LTS; not EOL.", liveSource: "manual" },

  // -- PWA × cadence ----------------------------------------------------
  { id: "pwa-e-build-id", domain: "pwa", cadence: "event", title: "Footer __BUILD_VERSION__ updates after every deploy", description: "vite.config.ts injects a per-build timestamp. If the footer doesn't change, you uploaded the wrong dist OR the SW is caching.", liveSource: "manual" },
  { id: "pwa-e-sw",       domain: "pwa", cadence: "event", title: "Service-worker cache busts on deploy",                description: "Hard reload after each deploy; DevTools Application → SW shows the new build.", liveSource: "manual" },
  { id: "pwa-e-audit-pub", domain: "pwa", cadence: "event", title: "Audit reports republished after contract change",   description: "Admin → Audit → publish 5 SolidityScan URLs.", liveSource: "manual" },
  { id: "pwa-e-updates-pub", domain: "pwa", cadence: "event", title: "Updates entry published after every deploy",       description: "Admin → Updates → owner-signed publish from docs/updates-to-publish-N.rtf.", liveSource: "manual" },
  { id: "pwa-m-i18n-drift", domain: "pwa", cadence: "monthly", title: "i18n key sweep",            description: "Grep routes/*.tsx for hardcoded English added since last sweep; round into useT() keys.", liveSource: "manual" },
  { id: "pwa-m-zhhi-flag",  domain: "pwa", cadence: "monthly", title: "ZH/HI native-review status", description: "Keep 'draft pending' flag on until a native review actually happens.", liveSource: "manual" },
  { id: "pwa-q-walletconnect", domain: "pwa", cadence: "quarterly", title: "WalletConnect Reown project active", description: "Test a connect; refresh top-up if rate-limited.", liveSource: "manual" },
  { id: "pwa-q-0x-key", domain: "pwa", cadence: "quarterly", title: "0x swap API key valid", description: "Test a quote; rotate if 401.", liveSource: "manual" },

  // -- Hybrid-E × cadence ----------------------------------------------
  { id: "he-d-activations",  domain: "hybridE", cadence: "daily",  title: "NoKActivated 30-day count",     description: "Spike → investigate (real grief or oracle bug).", liveSource: "fb" },
  { id: "he-d-escrow-bindings", domain: "hybridE", cadence: "daily", title: "Escrow bindings status",        description: "designated / claimed / pending counts.", liveSource: "fb" },
  { id: "he-e-revoke",       domain: "hybridE", cadence: "event", title: "Owner Escrow.revokeBinding(tokenId, reason)", description: "Documented justification entry in Audit/Updates after fraud/mistake escalation.", liveSource: "manual" },

  // -- Compliance × cadence --------------------------------------------
  { id: "co-q-terms",   domain: "compliance", cadence: "quarterly", title: "Terms / Privacy re-read", description: "English-authoritative; re-date if changed; publish via Admin → Updates.", liveSource: "manual" },
  { id: "co-a-counsel", domain: "compliance", cadence: "annual",    title: "External counsel review", description: "Multi-level referral §16(2) UWG trigger PRESERVED historical — never ship without counsel.", liveSource: "manual" },
  { id: "co-x-gdpr",    domain: "compliance", cadence: "event",     title: "GDPR delete request",     description: "Zero-PII architecture: respond with the truthful 'we hold no per-person data' template; delete nok_emails row by email_hash AND owner_alert_optin row by owner_wallet if applicable (the only two opt-in PII stores).", liveSource: "manual" },

  // -- Founder-Referrer Bonus (Daniel 2026-05-20) ----------------------
  { id: "frb-d-leaderboard",  domain: "compliance", cadence: "daily",   title: "Founder-Referrer Bonus — leaderboard watch", description: "Daily: glance at /refer leaderboard. If the top wallet's referralCount is approaching 100 / 500 / 1,000 a milestone payout is coming.", expected: "No milestone crossed unexpectedly without an owner payout within 7 days.", action: "Diarise the payout when the count crosses; the on-chain referralCount + ReferralAttributed events are the only source of truth.", liveSource: "fb" },
  { id: "frb-e-milestone",    domain: "compliance", cadence: "event",   title: "Founder-Referrer Bonus — milestone payout", description: "First wallet to 100 / 500 / 1,000 paid referrals. Bonus = 25% / 50% / 75% of that wallet's hard earnings (sum of ReferralAttributed.cut) up to the milestone block. Tranched-exclusive for same-wallet multi-tier wins (later bonus nets prior payouts).", action: "(1) Identify the milestone-crossing tx via PolygonScan. (2) Sum hard-earnings up to that block. (3) Subtract any prior-tier bonus already paid. (4) USDC.transfer from NoKLock Treasury to the winning wallet. (5) Publish the milestone-crossing tx hash + payout tx hash via Admin → Updates, owner-signed. (6) Target: within 7 days of milestone block. SLA is the reputation pledge — do not slip.", liveSource: "manual" },
  { id: "frb-x-sybil-noise",  domain: "compliance", cadence: "event",   title: "Founder-Referrer Bonus — apparent sybil pattern", description: "Bonus structure is mathematically sybil-unprofitable (attacker loses ~$65k chasing the $10k 75%-tier bonus by self-funding 1,000 mints). The promise is NOT contingent on absence of suspected sybil — pay the milestone as posted. NoKLock's Treasury captures the attacker's net loss as revenue.", action: "Pay the bonus per the rules. Do not invent a disqualification clause — it would weaken the reputation pledge that anchors the trust narrative.", liveSource: "manual" },

  // -- Chainlink Automation (Daniel 2026-05-20, post-Chainlink-registration) --
  { id: "cl-d-balance",      domain: "contracts", cadence: "daily",     title: "Chainlink upkeep LINK balance", description: "Daily auto-poll via Form B chainlink-watchdog every 6h. Threshold defaults: warn < 3 LINK, critical < 1 LINK. Alert email enqueued to hello@noklock.app on each band, deduped per day. Live tile reads /v1/ops/chainlink-balance on demand.", expected: "balance > 3 LINK (warn threshold); paused = false", action: "If warn: schedule top-up within 7 days. If critical: top up TODAY — performUpkeep stops firing once Chainlink can't pay gas. Top up via dashboard https://automation.chain.link/polygon/<upkeepID> from any wallet that holds LINK on Polygon.", liveSource: "fb" },
  { id: "cl-e-forwarder-bootstrap", domain: "contracts", cadence: "event", title: "Chainlink forwarder bootstrap (one-shot, post-deploy)", description: "After registering the Chainlink upkeep, you MUST call oracle.setForwarder(<forwarderAddrFromChainlink>) from NoKLock Admin wallet. This is a one-shot bootstrap — after the first set the forwarder is permanently locked. Without it the dead-man never fires (performUpkeep is forwarder-only).", action: "From PolygonScan Write Contract on NoKLockOracle, connect Admin wallet, call setForwarder(forwarder). Verify by reading oracle.automationForwarder() — must match the Chainlink-issued forwarder address. Then read oracle.isForwarderLocked() — must return true.", liveSource: "manual" },
  { id: "cl-q-rotation",     domain: "contracts", cadence: "quarterly", title: "Chainlink upkeep settings review", description: "Quarterly check: (a) the registered Oracle address is still ours; (b) the LINK balance is healthy (cross-check the watchdog email log); (c) the gas limit is sufficient for current per-fire token counts (256 max but typical fire is 1-3 tokens); (d) Chainlink hasn't migrated the AutomationRegistry to a new version that needs re-registration.", liveSource: "manual" },

  // -- Live-Man's Switch / NoKLockAlerts (ACTIVE PLAN 10, 2026-05-25) --------
  { id: "cl-d-alert-balance",          domain: "contracts", cadence: "daily", title: "Live-Man's Switch LINK balance", description: "The SECOND Chainlink upkeep — the LOG-TRIGGER on the live Recovery's RecoveryInitiated event that fires NoKLockAlerts. Monitored alongside the dead-man upkeep (chainlink-watchdog 2nd upkeep id). If LINK lapses, the on-chain recovery PING stops (email + banner still cover it; v2 atomic-redeploy removes this dependency).", expected: "balance > 3 LINK; paused = false", action: "Critical: top up at automation.chain.link/polygon/<alertUpkeepID>. Warn: schedule within 7 days.", liveSource: "fb" },
  { id: "cl-e-alert-forwarder-bootstrap", domain: "contracts", cadence: "event", title: "NoKLockAlerts forwarder bootstrap (one-shot)", description: "After registering the Live-Man's-Switch log-trigger upkeep you MUST call alerts.setForwarder(<forwarderFromChainlink>) once from Admin — one-shot, then permanently locked. Without it performUpkeep is rejected (NotForwarder) and recovery pings never fire.", action: "PolygonScan Write Contract on NoKLockAlerts, Admin wallet, setForwarder(forwarder). Verify alerts.alertForwarder() matches + alerts.isForwarderLocked() == true.", liveSource: "manual" },
  { id: "lms-m-optin-pii",             domain: "compliance", cadence: "monthly", title: "owner_alert_optin (opt-in PII) review", description: "owner_alert_optin is the ONLY new PII store from the Live-Man's Switch: opt-in owner alert emails, hashed + encrypted at rest. Confirm it stays opt-in/off-by-default; it is GDPR-deletable by owner_wallet (see co-x-gdpr).", liveSource: "manual" },


  // -- Incident response runbooks (pre-written, used cold) -------------
  { id: "ir-rpc",     domain: "incident", cadence: "incident", title: "RPC degradation",     description: "Swap POLYGON_RPC_URL → backup archive (drpc.org primary → publicnode → alchemy free fallback). cPanel restart. Re-test /v1/ops/rpc-self-test." },
  { id: "ir-smtp",    domain: "incident", cadence: "incident", title: "SMTP outage",         description: "Worker auto-retries on each tick. Verify cPanel mailbox quota; test send via webmail; fall back to a second mailbox if account-locked." },
  { id: "ir-formb",   domain: "incident", cadence: "incident", title: "Form B outage",       description: "PWA falls back to public RPC for licence reads automatically. Heir-flow blocked until Form B back. cPanel restart; check disk + logs." },
  { id: "ir-owner",   domain: "incident", cadence: "incident", title: "Owner-wallet compromise (highest severity)", description: "From a clean machine + fresh wallet: transferOwnership(safe) on all 5 → safe acceptOwnership on each. Ownable2Step locks the attacker out instantly. setMintable(*, false) freeze. Rotate ESCROW_ATTESTATION_PRIVATE_KEY + INTERNAL_TRIGGER_TOKEN. Treasury sweep via Safe. Public disclosure via Admin → Updates signed by the NEW owner." },
  { id: "ir-chainlink", domain: "incident", cadence: "incident", title: "Chainlink Automation upkeep down", description: "Confirm via PolygonScan that lastActivatedBlock isn't advancing. Re-arm upkeep / refill LINK. (In 0.4.x performUpkeep is forwarder-ONLY — direct owner-fallback no longer works; you must swap the registered forwarder if Chainlink is down.)" },
  { id: "ir-heartbeat-cron", domain: "incident", cadence: "incident", title: "External heartbeat watcher down", description: "GET /v1/ops/heartbeats-summary shows no recent external-source rows. Restart your cron host. On-chain selfHeartbeat remains the trustless ground truth — the cron is convenience only." },
];

export const DOMAIN_LABEL: Record<Domain, string> = {
  contracts:  "Contracts (5 on Polygon)",
  formB:      "Form B service (api.noklock.app)",
  pwa:        "PWA (apps/web)",
  hybridE:    "Hybrid-E heir flow",
  compliance: "Compliance / governance",
  incident:   "Incident response runbooks",
};

export const CADENCE_LABEL: Record<Cadence, string> = {
  daily:     "Daily",
  weekly:    "Weekly",
  monthly:   "Monthly",
  quarterly: "Quarterly",
  annual:    "Annual",
  event:     "Event-triggered",
  incident:  "Incident",
};

export const CADENCE_ORDER: readonly Cadence[] = ["daily", "weekly", "monthly", "quarterly", "annual", "event", "incident"];
export const DOMAIN_ORDER:  readonly Domain[]  = ["contracts", "formB", "pwa", "hybridE", "compliance", "incident"];
