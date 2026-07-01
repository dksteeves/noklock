// @version 0.10.15 @date 2026-06-12
// 0.10.15 — Daniel 2026-06-12 (WORKSTREAM B — universal "reconnecting" gate
//           fix): DEDUPE the reconnecting label. It was rendered TWICE — in the
//           wallet-button area (~line 300) AND again in the slim secondary
//           status bar (~line 329) — so a reconnecting user saw two
//           "Restoring session…" labels stacked. Keep the wallet-button-area
//           one (primary, always-visible row); the secondary bar now renders
//           ONLY when actually connected and no longer carries a reconnecting
//           branch. The connected/disconnected branches are unchanged.
// @version 0.10.14 @date 2026-06-11
// 0.10.14 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.14): the
//           reconnecting label now reads "Restoring session…" (the i18n value
//           of nav.reconnecting, updated across all 6 locales). No logic change
//           — TopNav already reads useWalletGate.
// @version 0.10.13 @date 2026-06-05
// 0.10.13 — Daniel 2026-06-05: migrated off the useWalletSettling +
//          markWalletDisconnected shim onto useWalletGate (tri-state
//          status) + lib/wallet-bootstrap::forgetWalletAtBoot directly.
//          Render pattern unchanged — still derive a `reconnecting`
//          boolean from `gate.status === "reconnecting"` and swap the
//          wallet button area inline, preserving the existing header
//          chrome (logo + nav + secondary status bar). No subtree
//          replacement. Mobile path untouched. Drops one indirection
//          layer so the shim can be deleted once all consumers are
//          migrated.
// @version 0.10.12 @date 2026-06-02
// 0.10.12 — Daniel 2026-06-02: CurrentModePill rehomed from Landing hero
//          into this wallet status bar. Slots to the LEFT of LIFETIME
//          PREMIUM / address / ADMIN (reading order: mode → tier →
//          address → admin/founder). Same row, same tier-badge size.
//          On smaller viewports the row wraps via the existing flex
//          layout; the pill stays grouped with the rest of the wallet
//          info. Site-wide indicator, no longer hero-only.
// @version 0.10.11 @date 2026-05-30
// 0.10.11 — Daniel: "home page logo placements need adjusting, maybe lock
//          word color fiddle as well". New flat logo paired with the
//          gradient-cyan wordmark made "Lock" bleed into the mark; swapped
//          wordmark to flat text-on-dark for legible contrast. Mark h-16
//          → h-14 + breathing-room gap-1.5. Translate-y removed (the flat
//          mark has no optical-padding offset to correct for).
// 0.10.10 — Wallet status bar: row height h-8 → h-5 (cuts the visual gap
//          between the wallet row and the menu row in half, per Daniel).
//          Admin pill in the wallet row is now a <Link to="/admin"> when
//          the connected wallet is EITHER License.owner() (Admin) OR the
//          NoKLock Treasury (USDC payee) — one-click jump to the Admin
//          console instead of typing /admin. Treasury check is hard-coded
//          against the same address used in analytics-exclusion (track.ts).
// 0.10.9 — Wallet reconnect flap fixed at the source: useWalletSettling() is
//          now a pure reader of the single debounced+bounded wallet-status
//          store (driver mounted once in App). Dropped the header's own 9s
//          settle timer — the store self-bounds (~6s), so the header just
//          reads `reconnecting` directly: "Reconnecting…" briefly, then the
//          address pill or Connect. No more per-page reconnect storm.
// 0.10.8 — Remember/forget the connected address (rememberConnectedWallet on
//          account change; forgetConnectedWallet on the Disconnect button) so
//          analytics exclusion of admin/treasury/test wallets actually works
//          (track.ts read the wrong wagmi key before, so exclusion never fired).
// 0.10.7 — Anonymous wallet-connect counter: fire trackWalletConnectOncePerDay
//          on the disconnected→connected transition (once/browser/day;
//          excluded admin/treasury wallets suppressed). Feeds Admin Stats.
// 0.10.6 — Wallet "Connect" still flashed on nav: the header's reconnect
//          flag was derived from the raw wagmi status, which the async
//          provider-injection race reverts to "disconnected". Switched to
//          the shared useWalletSettling() (12s envelope + active EIP-6963
//          reconnect driver) — the same gate the page bodies use. TopNav is
//          always mounted, so this also drives reconnection on non-gated
//          pages (Landing/Pricing) where nothing did before.
// 0.10.5 — "Advanced ▾" no longer gradient/bold — it now uses the exact
//          same class as the other nav links so weight/size/colour/
//          baseline match (Daniel: it was misaligned + over-styled; the
//          ▾ already signals the submenu, no need for the green). The
//          "Refer & earn" → "Refer & Earn" label fix is in i18n en.ts.
//          Disconnect now also clears the had-wallet marker so the
//          reconnect-settling grace doesn't run after an explicit
//          disconnect (markWalletDisconnected()).
// 0.10.4 — Recognition pill under the wallet address: "Admin" (connected
//          == License.owner()) or "Founder" (paid licence within the
//          first ~10,000, from Form B /v1/founder). Connect prompt is
//          now the shared ConnectWallet (no-extension/mobile safe).
// 0.10.3 — Logo optical-alignment nudge: -translate-y-0.5 on the mark so
//          its visible bottom edge sits on the "Lock" baseline (the PNG's
//          transparent padding made centered alignment read low). (Daniel.)
// 0.10.2 — Logo mark bumped h-14 → h-16 and the logo↔wordmark gap
//          tightened (gap-2 → gap-1, -ml on the wordmark) so the mark
//          reads larger and sits closer to "Lock". (Daniel pic1.)
// 0.10.1 — Header shows "Reconnecting…" (not the Connect button) while
//          wagmi restores the persisted session — stops the misleading
//          "connect" flash on every navigation/return.
// 0.10.0 — Logo: white badge REMOVED (looked bad on the dark header).
//          Transparent mark sits directly on the nav, bumped h-12 → h-14
//          to match the "Lock" wordmark cap height. Alignment unchanged.
// 0.9.0 — i18n: all nav labels (desktop + Advanced dropdown + mobile) +
//         Connect/Disconnect keyed t() and fully translated. No more
//         partial-language nav.
// 0.8.0 — Transparent logo (noklocklogo-T.png) on a small rounded light
//         "badge" + the "NoK" wordmark text DROPPED — the mark already
//         reads as NoK, so it now flows straight into "Lock". The badge
//         is required because the mark is mostly dark navy and would
//         vanish on the near-black header if dropped raw-transparent.
//         aria-label keeps the full "NoKLock" for SEO + screen readers.
// 0.7.1 — "Refer" added to desktop nav + mobile menu (referral rewards).
// 0.7.0 — Mobile nav: md:hidden hamburger + full-width panel (below md the
//         nav was fully hidden with no toggle). Closes on route change.
// 0.6.3 — Logo source swapped to logo-new.png (300x249, 1.2:1 — NOT square).
//         img is now h-16 w-auto object-contain so the non-square mark
//         isn't squashed into a square box. Header stays h-24.
// 0.6.2 — Round 3 wave 4: logo bumped again 48 → 64px (h-12 → h-16),
//         header h-20 → h-24, brand text text-2xl → text-3xl. Daniel:
//         48px still "waaaay too small". This is the decisive size.
// 0.6.1 — Round 3 wave 2: header taller (h-16 → h-20) + logo mark larger
//         (h-8 w-8 32px → h-12 w-12 48px) + brand text bumped (text-xl →
//         text-2xl). Daniel: previous logo was way too small.
// 0.6.0 — Logo mark added to the brand-link slot. The 3D folded-ribbon mark
//         (40×40 from logo-192.png) sits left of the "NoKLock" wordmark text.
//         Wordmark text retains the animated .grad gradient (animated cyan-
//         teal-green flow) so the mark + text together read as one unit.
// 0.5.0 — "Enrol" and "Vault" merge into a single "Vaults" top-level entry.
// 0.4.1 — Advanced ▾ dropdown cascades RIGHT (left-anchored) instead of LEFT.
// 0.4.0 — Vault promoted from the Advanced ▾ dropdown to the top-level nav.
// 0.3.2 — Advanced dropdown hover-bridge: invisible padding-top on the panel
//         eliminates the dead zone between button and menu so mouse-down to
//         the menu items doesn't fire onMouseLeave on the wrapper.
// 0.3.1 — clean rewrite after botched edit. Grouped NoK + Heartbeat +
//         Dead-man's switch under an "Advanced ▾" dropdown (matches the
//         Advanced tag on Premium tier perks). Help renamed to Info.
// 0.7.0 — Mobile nav. Below md the entire <nav> was hidden with NO
//         hamburger — mobile users had zero navigation. Added a md:hidden
//         hamburger toggle + a full-width collapsible panel listing every
//         destination flat (no nested Advanced dropdown on mobile). Closes
//         on link tap or route change.
// 0.2.0 — added Pricing + Heartbeat nav entries.

import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { ConnectWallet } from "./ConnectWallet.js";
import { useLicense } from "../hooks/useLicense.js";
import { useIsFounder } from "../hooks/useFounder.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { forgetWalletAtBoot } from "../lib/wallet-bootstrap.js";
import { trackWalletConnectOncePerDay, rememberConnectedWallet, forgetConnectedWallet } from "../lib/track.js";
import { LICENSE_ADDR, licenseAbi } from "../lib/contracts.js";
import { BRAND_NAME, BRAND_PARTS } from "../lib/brand.js";
import { useT } from "../i18n/index.js";
// 0.10.12 — Daniel 2026-06-02: CurrentModePill rehomed from the Landing
// hero into this wallet status bar so it sits in the SAME ROW + SAME SIZE
// as LIFETIME PREMIUM / address / ADMIN. Slots to the LEFT of the wallet
// info (reading order: mode → tier → address → admin). Site-wide indicator,
// always visible when wallet is connected.
import { CurrentModePill, type HeroMode } from "../routes/Landing.js";

// 0.10.12 — Current mode is hard-coded to "self-custody" today (Stage 1
// only mode). Stage 2 will lift this into a query-param / localStorage-
// backed setting and wire conditional tagline + accent swaps.
const CURRENT_HERO_MODE: HeroMode = "self-custody";

export function TopNav(): JSX.Element {
  const { t } = useT();
  const { address, isConnected } = useAccount();
  // 0.10.13 — unified wallet-gate hook (useWalletGate) is now the single
  // source of truth across the app: wagmi's own useAccount.status is read
  // straight through, with hadWalletAtBoot() bridging the brief async
  // storage rehydration on cold load so a previously-connected user
  // doesn't see a "Connect" flash. TopNav's render below only needs a
  // boolean (it swaps inline labels, not subtrees), so we derive it from
  // the tri-state status. `gate.status === "connected"` is implicit via
  // wagmi's isConnected which we already read above for the badge row.
  const gate = useWalletGate();
  const reconnecting = gate.status === "reconnecting";
  const { disconnect } = useDisconnect();
  const { licence } = useLicense();
  const { data: ownerAddr } = useReadContract({ abi: licenseAbi, address: LICENSE_ADDR, functionName: "owner" });
  const isOwner = !!address && !!ownerAddr && address.toLowerCase() === ownerAddr.toString().toLowerCase();
  // NoKLock Treasury wallet — Admin pill should be live + clickable for
  // either Admin (License.owner()) OR Treasury (USDC payee). Treasury is
  // hard-coded here so it doesn't require a fresh contract read; matches the
  // analytics-exclusion list in lib/track.ts. See [[feedback-wallet-naming]].
  const TREASURY_ADDR = "0x17322F0BCdc1c5a04518aAE817Fd84470F5A9A5d".toLowerCase();
  const isTreasury = !!address && address.toLowerCase() === TREASURY_ADDR;
  const isAdminLike = isOwner || isTreasury;
  const { founder } = useIsFounder(address);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu whenever the route changes (link tapped).
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Remember the connected address under a simple key so analytics exclusion
  // (admin/treasury/test wallets) actually works. Only sets — never clears on
  // a transient reconnect undefined; the Disconnect button forgets it.
  useEffect(() => { rememberConnectedWallet(address); }, [address]);

  // Anonymous wallet-connect counter (once per browser/day; excluded
  // admin/treasury wallets are suppressed inside the tracker). Fires on the
  // disconnected→connected transition incl. an auto-reconnect.
  useEffect(() => { if (isConnected) trackWalletConnectOncePerDay(); }, [isConnected]);

  const mobileLinks: readonly { to: string; k: string }[] = [
    { to: "/dashboard", k: "nav.dashboard" },
    { to: "/vaults", k: "nav.vaults" },
    { to: "/restore", k: "nav.restore" },
    { to: "/prove-it", k: "nav.proveit" },
    { to: "/nok", k: "nav.nok" },
    { to: "/heartbeat", k: "nav.heartbeat" },
    { to: "/dead-man", k: "nav.deadman" },
    { to: "/live-mans-switch", k: "nav.livemans" },
    { to: "/pricing", k: "nav.pricing" },
    { to: "/refer", k: "nav.refer" },
    { to: "/info", k: "nav.info" },
    { to: "/whitelabel", k: "nav.whitelabel" },
    { to: "/corporate", k: "nav.corporate" },
    { to: "/settings", k: "nav.settings" },
  ];

  return (
    <header className="border-b border-bg-surface bg-bg-panel relative z-40">
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-24">
        <Link to="/" aria-label={BRAND_NAME} className="flex items-center gap-1.5 text-3xl font-bold font-display">
          {/* 0.10.11 — Daniel 2026-05-30: new flat logo. Mark sized a hair
              smaller (h-16 → h-14) so it sits comfortably alongside the
              "Lock" wordmark; -translate-y dropped (flat mark sits flush
              on baseline without optical-padding correction). Wordmark
              colour swapped from `grad` (cyan-teal gradient, blended with
              the mark colour) to a flat off-white (text-text-on-dark) so
              "Lock" reads cleanly against the cyan mark instead of bleeding
              into it. Spacing bumped from -ml-1 to gap-1.5 for breathing
              room. */}
          <img src="/logo-192.png" alt="" className="h-14 w-14 object-contain" />
          <span className="text-text-on-dark font-semibold tracking-tight">{BRAND_PARTS.rest}</span>
        </Link>

        <nav className="hidden md:flex gap-5 text-sm items-center">
          <NavLink to="/dashboard" className={navClass}>{t("nav.dashboard")}</NavLink>
          <NavLink to="/vaults" className={navClass}>{t("nav.vaults")}</NavLink>
          <NavLink to="/restore" className={navClass}>{t("nav.restore")}</NavLink>
          <NavLink to="/prove-it" className={navClass}>{t("nav.proveit")}</NavLink>

          <div className="relative pb-2 -mb-2" onMouseLeave={() => setAdvancedOpen(false)} onMouseEnter={() => setAdvancedOpen(true)}>
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="text-text-on-dark/80 hover:text-text-on-dark transition-colors"
            >
              {t("nav.advanced")} ▾
            </button>
            {advancedOpen && (
              <div className="absolute left-0 top-full pt-2 w-56 z-50">
                <div className="rounded-md border border-bg-surface bg-bg-panel shadow-card py-1">
                  <NavLink to="/nok" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setAdvancedOpen(false)}>{t("nav.nok")}</NavLink>
                  <NavLink to="/heartbeat" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setAdvancedOpen(false)}>{t("nav.heartbeat")}</NavLink>
                  <NavLink to="/dead-man" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setAdvancedOpen(false)}>{t("nav.deadman")}</NavLink>
                  <NavLink to="/live-mans-switch" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setAdvancedOpen(false)}>{t("nav.livemans")}</NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink to="/pricing" className={navClass}>{t("nav.pricing")}</NavLink>
          <NavLink to="/refer" className={navClass}>{t("nav.refer")}</NavLink>

          {/* Info dropdown (2026-05-28 Daniel): main /info page + sub-routes
              for NoKLock White (whitelabel) and NoKLock.corporate. Previously
              these were only discoverable from the Pricing page coming-soon
              card — now first-class in the menu. Same hover/click pattern
              as the Advanced dropdown. */}
          <div className="relative pb-2 -mb-2" onMouseLeave={() => setInfoOpen(false)} onMouseEnter={() => setInfoOpen(true)}>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              className="text-text-on-dark/80 hover:text-text-on-dark transition-colors"
            >
              {t("nav.info")} ▾
            </button>
            {infoOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50">
                <div className="rounded-md border border-bg-surface bg-bg-panel shadow-card py-1">
                  <NavLink to="/info" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    {t("nav.info.appInfo")}
                  </NavLink>
                  <NavLink to="/updates" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    {t("nav.info.appUpdates")}
                  </NavLink>
                  <NavLink to="/info?tab=process" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    {t("nav.info.enrolWalkthrough")}
                  </NavLink>
                  <NavLink to="/articles" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    {t("nav.info.articles")}
                  </NavLink>
                  {/* Brand strings — reuse the existing nav.whitelabel /
                      nav.corporate keys (mirrored verbatim across locales).
                      nav.corporate already reads "Asserro (NoKLock Enterprise)";
                      we keep the green-"Asserro" + muted-suffix split here, so
                      we render the localized "(NoKLock Enterprise)" suffix from
                      the key while keeping the "Asserro" brand token verbatim. */}
                  <NavLink to="/whitelabel" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    {t("nav.whitelabel")}
                  </NavLink>
                  <NavLink to="/corporate" className="block px-4 py-2 text-sm hover:bg-bg-surface" onClick={() => setInfoOpen(false)}>
                    <span style={{ color: "#10b981" }}>Asserro</span>
                    <span className="text-text-muted text-xs ml-1.5">{t("nav.corporate").replace(/^Asserro\s*/, "")}</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink to="/settings" className={navClass}>{t("nav.settings")}</NavLink>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {/* 2026-05-28 TopNav reorg (Daniel): tier badge + wallet address +
              Admin/Founder badge moved OFF the top row to the slim secondary
              bar below (rendered only when isConnected). Top row keeps just
              the Connect / Disconnect button. Disconnected users see NOTHING
              tier-related (no "Free" badge). */}
          {reconnecting ? (
            <span className="text-xs text-text-muted">{t("nav.reconnecting")}</span>
          ) : isConnected ? (
            <button className="btn btn-secondary text-xs" onClick={() => { forgetWalletAtBoot(); forgetConnectedWallet(); disconnect(); }}>
              {t("nav.disconnect")}
            </button>
          ) : (
            <ConnectWallet className="btn btn-primary text-xs" />
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-bg-surface text-text-on-dark text-xl leading-none"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Slim secondary status bar — wallet address + licence tier + Admin/
          Founder badges. Renders ONLY when actually connected; never on
          disconnect (no orphan "Free" tier). 0.10.15 — the reconnecting label
          is shown ONCE, up in the wallet-button area (~line 300); this bar no
          longer duplicates it, so it only mounts when isConnected. Right-
          aligned, low-profile, doesn't compete with the menu. */}
      {isConnected && (
        <div className="hidden md:block border-t border-bg-surface/40 bg-bg-panel/60">
          <div className="container mx-auto px-4 max-w-6xl h-5 flex items-center justify-end gap-3 text-xs leading-none">
            {/* 0.10.12 — Mode pill slots to the LEFT of the wallet info
                (reading order: mode → tier → address → admin/founder).
                Hard-coded to self-custody today; Stage 2 will lift this
                into a query-param / localStorage-backed setting. */}
            <CurrentModePill mode={CURRENT_HERO_MODE} />
            {licence && licence.tier > 0 && (
              <span className={tierClass(licence.tier)}>{licence.name}</span>
            )}
            {address && (
              <span className="font-mono text-text-muted">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            )}
            {isAdminLike ? (
              <Link to="/terminal" className="tier-badge bg-violet-700/40 text-violet-300 hover:bg-violet-700/60 transition-colors" title="Open Admin">Admin</Link>
            ) : founder ? (
              <span className="tier-badge bg-amber-600/40 text-amber-300">Founder</span>
            ) : null}
          </div>
        </div>
      )}

      {mobileOpen && (
        <nav className="md:hidden border-t border-bg-surface bg-bg-panel">
          <div className="container mx-auto px-4 max-w-6xl py-2 flex flex-col">
            {mobileLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  "py-3 border-b border-bg-surface/40 text-base " +
                  (isActive ? "text-accent-cyan font-medium" : "text-text-on-dark/80")
                }
              >
                {t(l.k)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "text-accent-cyan font-medium"
    : "text-text-on-dark/80 hover:text-text-on-dark transition-colors";
}

function tierClass(tier: number): string {
  const base = "tier-badge";
  switch (tier) {
    case 0: return `${base} bg-bg-surface text-text-muted`;
    case 1: return `${base} bg-cyan-700/40 text-accent-cyan`;
    case 2: return `${base} bg-amber-600/40 text-amber-300`;
    case 3: return `${base} bg-violet-700/40 text-violet-300`;
    case 4: return `${base} bg-emerald-700/40 text-accent-green`;
    case 5: return `${base} bg-rose-700/40 text-rose-300`;
    default: return base;
  }
}
