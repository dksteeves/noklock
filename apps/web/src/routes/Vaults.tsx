// @version 0.2.2 @date 2026-06-01
// 0.2.2 — FIX-COPY 3: "per-device" was technically wrong — vaults are
//         localStorage, which is partitioned per-browser-profile (Chrome
//         and Firefox on the same laptop see different lists). Sweep
//         user-facing strings ("Per-device by design", "Enrolled on
//         another device?") to "per-browser-profile" / "another browser".
// 0.2.1 — Vault index now also stores manifestHash (optional, back-
//         compat) so the per-vault page can prefill "Add NoK" with no
//         hand-copying. readVaults / VaultEntry / Kind / KIND_LABEL /
//         KIND_BADGE exported for VaultDetail reuse. Card "Share URLs"
//         link → "Manage" → /vault/:id.
// 0.2.0 — Per-browser-profile clarity (Daniel: connected same wallet on
//         mobile, saw 0 vaults — alarming, looked like a bug). It is by
//         design: the list is localStorage, per-browser-profile, zero
//         server record. Empty-state + a prominent always-on note now
//         say so plainly and point to Restore (device-independent). No
//         logic change; NO server sync (that would break the
//         zero-knowledge promise).
// 0.1.0 — /vaults — unified list of every vault the user owns. Reads from
// localStorage (the share-URL store + manifest store). Filter chips at top
// (All / Seeds / Letters / Documents). "+ Enrol new vault" button routes to
// /enrol where the user picks a context.
//
// MVP scope: read from localStorage only. Phase 4: server-side index (per
// wallet, query api.noklock.app for vaults the user has touched).

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "../lib/brand.js";

export type Kind = "seed" | "letter" | "document";
type Filter = "all" | Kind;

export interface VaultEntry {
  readonly vaultId: string;
  readonly kind: Kind;
  readonly label: string;
  readonly createdAt: number;
  readonly shareCount: number;
  readonly summary: string;
  /** "0x"+hex of manifestLib.manifestHash, stored at enrol (0.2.1+).
   *  Absent for vaults created before this — the per-vault page then
   *  derives it from a dropped manifest.json. */
  readonly manifestHash?: string;
}

const SHARE_URLS_KEY = "soulchain.share-urls";
const VAULT_INDEX_KEY = "noklock.vault-index";

interface StoredShareUrls {
  readonly vaultId: string;
  readonly urls: readonly { shareIndex: number; url: string }[];
  readonly updatedAt: number;
}

interface IndexEntry {
  readonly vaultId: string;
  readonly kind: Kind;
  readonly label: string;
  readonly createdAt: number;
  readonly summary: string;
  readonly manifestHash?: string;
}

export function readVaults(): readonly VaultEntry[] {
  // Combine two sources:
  //   1. soulchain.share-urls — every vault that's been through the share-URL step
  //   2. noklock.vault-index  — index written by Enrol* routes on success
  let urlMap: Map<string, StoredShareUrls> = new Map();
  try {
    const raw = localStorage.getItem(SHARE_URLS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredShareUrls[];
      urlMap = new Map(parsed.map((v) => [v.vaultId, v]));
    }
  } catch { /* ignore */ }

  let index: IndexEntry[] = [];
  try {
    const raw = localStorage.getItem(VAULT_INDEX_KEY);
    if (raw) index = JSON.parse(raw) as IndexEntry[];
  } catch { /* ignore */ }

  // For any share-URL vault not in the index, infer kind = "seed" (oldest pipeline).
  const indexed = new Set(index.map((e) => e.vaultId));
  for (const [vid, urls] of urlMap.entries()) {
    if (!indexed.has(vid)) {
      index.push({
        vaultId: vid,
        kind: "seed",
        label: `Vault ${vid.slice(0, 8)}`,
        createdAt: urls.updatedAt,
        summary: `${urls.urls.length} shares`,
      });
    }
  }

  return index.map((e) => ({
    vaultId: e.vaultId,
    kind: e.kind,
    label: e.label,
    createdAt: e.createdAt,
    shareCount: urlMap.get(e.vaultId)?.urls.length ?? 0,
    summary: e.summary,
    ...(e.manifestHash ? { manifestHash: e.manifestHash } : {}),
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export const KIND_LABEL: Record<Kind, string> = {
  seed: "Seed",
  letter: "Letter",
  document: "Document",
};

export const KIND_BADGE: Record<Kind, string> = {
  seed: "bg-cyan-700/40 text-accent-cyan",
  letter: "bg-amber-600/40 text-amber-300",
  document: "bg-violet-700/40 text-violet-300",
};

export function Vaults(): JSX.Element {
  const [filter, setFilter] = useState<Filter>("all");
  const vaults = useMemo(() => readVaults(), []);
  const filtered = filter === "all" ? vaults : vaults.filter((v) => v.kind === filter);

  const counts = useMemo(() => {
    const c: Record<Kind, number> = { seed: 0, letter: 0, document: 0 };
    for (const v of vaults) c[v.kind]++;
    return c;
  }, [vaults]);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold font-display"><span className="grad">Vaults</span></h1>
          <p className="text-text-on-dark/80 mt-1 text-sm">
            Everything you've sealed with {BRAND_NAME}. Crypto seeds, sealed letters, documents — one list, your stuff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/info?tab=process" className="btn btn-secondary">Walkthrough</Link>
          <Link to="/enrol" className="btn btn-primary">+ Enrol new vault</Link>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"}      onClick={() => setFilter("all")}      label="All"       count={vaults.length} />
        <FilterChip active={filter === "seed"}     onClick={() => setFilter("seed")}     label="Seeds"     count={counts.seed} />
        <FilterChip active={filter === "letter"}   onClick={() => setFilter("letter")}   label="Letters"   count={counts.letter} />
        <FilterChip active={filter === "document"} onClick={() => setFilter("document")} label="Documents" count={counts.document} />
      </nav>

      {filtered.length === 0 ? (
        <div className="card text-center">
          <h2 className="font-bold font-display text-lg mb-2"><span className="grad">Nothing here yet</span></h2>
          <p className="text-text-on-dark/80 text-sm mb-4">
            {vaults.length === 0
              ? "Nothing enrolled in this browser yet. Start with a seed phrase, a sealed letter, or a document."
              : `No ${filter === "seed" ? "seeds" : filter === "letter" ? "letters" : "documents"} yet — try a different filter.`}
          </p>
          {vaults.length === 0 && (
            <>
              <Link to="/enrol" className="btn btn-primary inline-block">+ Enrol your first vault</Link>
              <div className="mt-5 text-left text-sm text-text-on-dark/80 bg-bg-surface border border-bg-surface rounded-lg p-4 space-y-2">
                <p>
                  <strong className="text-accent-cyan">Enrolled in another browser or browser profile?</strong> This list lives only in
                  <strong> this browser profile</strong>. {BRAND_NAME} keeps <strong>no server-side record</strong> of your
                  vaults, so connecting your wallet does <strong>not</strong> load them here — that is the
                  self-custody guarantee, not a fault.
                </p>
                <p>
                  You don't need this list to recover. Your vault is the encrypted shares in your clouds plus your
                  master password. Go to <Link to="/restore" className="text-accent-cyan underline">Restore</Link>,
                  supply the share files or share URLs + your master password, and it rebuilds in <em>any</em> browser on any device.
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.vaultId} className="card flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`tier-badge ${KIND_BADGE[v.kind]}`}>{KIND_LABEL[v.kind]}</span>
                  <span className="font-bold">{v.label}</span>
                </div>
                <div className="text-xs text-text-muted font-mono">vault {v.vaultId.slice(0, 24)}…</div>
                <div className="text-sm text-text-on-dark/80 mt-2">{v.summary}</div>
                {v.shareCount > 0 && (
                  <div className="text-xs text-text-muted mt-1">{v.shareCount} share URL{v.shareCount === 1 ? "" : "s"} on file</div>
                )}
              </div>
              <div className="flex flex-col gap-2 text-sm shrink-0">
                <Link to={`/vault/${v.vaultId}`} className="btn btn-secondary text-xs">Manage</Link>
                <Link to={`/restore?vault=${v.vaultId}`} className="text-accent-cyan hover:underline text-xs text-center">Restore</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-text-on-dark/75 bg-bg-surface border border-bg-surface rounded-lg p-4">
        <strong className="text-accent-cyan">Per-browser-profile by design.</strong> This list is read from
        {" "}<strong>this browser profile only</strong>. {BRAND_NAME} keeps <strong>no server-side record</strong> of which
        vaults you own — opening {BRAND_NAME} in a different browser, a different browser profile, or on another
        phone or laptop will <strong>not</strong> show them there. That is the self-custody guarantee (we can't
        see your data, so we can't list it for you).
        {" "}A vault enrolled anywhere is fully recoverable from any browser on any device via
        {" "}<Link to="/restore" className="text-accent-cyan underline">Restore</Link> using your saved shares +
        master password — you do not need this list to recover.
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, count }: { readonly active: boolean; readonly onClick: () => void; readonly label: string; readonly count: number }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
        active
          ? "grad-bg text-text-primary font-bold border-transparent"
          : "bg-bg-surface text-text-on-dark/80 border-bg-surface hover:bg-bg-deepest"
      }`}
    >
      {label} <span className={active ? "text-text-primary/70" : "text-text-muted"}>{count}</span>
    </button>
  );
}

export function recordVaultInIndex(entry: { vaultId: string; kind: Kind; label: string; summary: string; manifestHash?: string }): void {
  try {
    const raw = localStorage.getItem(VAULT_INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as IndexEntry[]) : [];
    const filtered = list.filter((e) => e.vaultId !== entry.vaultId);
    filtered.push({ ...entry, createdAt: Math.floor(Date.now() / 1000) });
    localStorage.setItem(VAULT_INDEX_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

// Remove a vault from THIS browser's local index. Local-only: does NOT delete
// the encrypted shares in the user's clouds and does NOT revoke on-chain NoK
// SBTs — the vault still restores anywhere via Restore + master password.
// (Share-URL removal is handled separately by forgetVaultShareUrls.)
export function removeVaultFromIndex(vaultId: string): void {
  try {
    const raw = localStorage.getItem(VAULT_INDEX_KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as IndexEntry[];
    localStorage.setItem(VAULT_INDEX_KEY, JSON.stringify(list.filter((e) => e.vaultId !== vaultId)));
  } catch { /* ignore */ }
}
