// @version 0.4.0 @date 2026-06-14
// 0.4.0 — Daniel 2026-06-14: PER-ROW inline save/delete feedback. The save
//         success ("Saved X") + error were only rendered at the TOP header card
//         (setToast/setErr), off-screen from the Save button deep inside a
//         provider group — so a write that 503'd because PAYMENT_CONFIG_MASTER_KEY
//         is not yet provisioned on the Form B server looked like a silent
//         no-op (sign → nothing → refresh → not set). Now save()/del() also set
//         a rowFeedback[key] = {ok,msg} rendered INLINE next to that row's
//         buttons (mirrors the existing testResults block) — "Saved ✓"/"Cleared
//         ✓" on success, or the specific error (incl. the master-key 503
//         instruction MASTER_KEY_MISSING_MSG) on failure. The top-card err/toast
//         is kept for load-level errors. No wire-protocol change.
// @version 0.3.0 @date 2026-06-13
// 0.3.0 — Delete + Test wired (server payment-config.ts 0.4.0 route-fill). The
//         two buttons are no longer disabled stubs:
//           DELETE — confirm() → per-action owner-sign
//             "NoKLock payment-config clear: <key> @ <ts>" → DELETE
//             /:key?ts&sig → refresh the list. Like the save, the signature is
//             never cached.
//           TEST — per-action owner-sign
//             "NoKLock payment-config test: <key> @ <ts>" → POST /:key/test
//             {ts, signature} → render the {ok, status, detail} inline next to
//             the row (green ok / red fail). A 503 (no master key) surfaces the
//             existing MASTER_KEY_MISSING_MSG.
//         The existing save (per-action) + load (ensureOpsSig) logic is
//         UNTOUCHED.
// 0.2.0 — Signing-regression fix. The list READ now reuses the shared 24h
//         ops-session signature via ensureOpsSig (useOpsLive 0.5.0) like every
//         other admin READ — it no longer re-signs the per-action
//         "NoKLock payment-config list <ts>" message on EVERY load. The server
//         GET (payment-config.ts 0.3.0) accepts that ops-session credential via
//         isFreshOpsOwner, with the per-action ts/sig path kept as a backward-
//         compatible fallback. WRITES (set/delete/test) STAY per-action signed.
//         Also: a WRITE that returns HTTP 503 (master key not provisioned) now
//         surfaces a specific inline instruction (MASTER_KEY_MISSING_MSG).
// 0.1.0 — NL-2 Phase 3 chunk B (Admin payment-config UI). Owner/admin-gated
//         manager for the Form B payment_config key/value store (Paddle /
//         Privy / Pimlico / SMTP / misc credentials). Renders as a new Admin
//         tab ("Payment config") inside AdminTabsShell — i.e. already behind
//         OwnerOnly per Admin 0.9.0, so it only ever mounts for the contract
//         owner OR an OFFCHAIN_ADMIN_ADDRESSES entry.
//
//         ZERO PRIVY / PIMLICO IMPORT. This component is a plain fetch + viem
//         (keccak256/toBytes) + wagmi (useSignMessage/useAccount) client — it
//         carries no SDK code and therefore ships in EVERY build, flag-OFF
//         included. That is deliberate: Daniel must be able to pre-stage
//         privy_app_id / paddle secrets BEFORE the managed-wallet flag flip
//         (the server allows owner-signed payment-config writes pre-flip, see
//         payment-config.ts 0.2.0 FLAG POSTURE). Do NOT add a managed-flag gate
//         here and do NOT import anything from @privy-io / permissionless /
//         pimlico into this file.
//
//   WIRE PROTOCOL — exactly matches server-form-b payment-config.ts 0.3.0:
//
//   READ  GET  /v1/admin/payment-config?msg=<opsMsg>&sig=<sig>
//         The server (payment-config.ts 0.3.0) authorises EITHER the shared
//         ops-session credential ("NoKLock ops session: <unixSeconds>" + sig,
//         via isFreshOpsOwner) OR — as a backward-compat fallback — the legacy
//         per-action ts/sig path over "NoKLock payment-config list <ts>". This
//         UI now sends the ops-session credential from ensureOpsSig (useOpsLive
//         0.5.0), the SAME 24h cached signature every other admin READ uses, so
//         it does NOT re-prompt the wallet on every load (the prior regression).
//         isFreshOpsOwner / recoverOwnerSig both accept BOTH License.owner()
//         AND an
//         OFFCHAIN_ADMIN_ADDRESSES entry, so an off-chain admin (Treasury
//         phone) CAN read AND write payment-config — unlike on-chain mint,
//         which reverts for a non-owner. We surface a note saying so.
//
//   WRITE POST /v1/admin/payment-config  body { key, value, ts, signature }
//         PER-ACTION signed (never cached) over paymentConfigSetMessage(key,
//         value, ts) — the multi-line
//           "NoKLock payment-config set\nkey: <k>\nvalueHash: <keccak256(toBytes(value))>\nts: <floor(now/1000)>"
//         The server re-derives the SAME message and verifies; ±5min skew. We
//         compute keccak256(toBytes(value)) client-side with viem (already a
//         PWA dep) so the signed hash matches byte-for-byte.
//
//   DELETE /v1/admin/payment-config/:key?ts=<ts>&sig=<sig>
//         PER-ACTION signed (never cached) over paymentConfigClearMessage(key,
//         ts) = "NoKLock payment-config clear: <key> @ <ts>". Clears the row so
//         the consumer reverts to its env fallback; we confirm() first, then
//         refresh the list. Returns 200 {ok:true}.
//
//   POST /v1/admin/payment-config/:key/test  body { ts, signature }
//         PER-ACTION signed over paymentConfigTestMessage(key, ts) =
//         "NoKLock payment-config test: <key> @ <ts>". A non-mutating provider
//         connectivity probe (server decrypts the STORED value — requires the
//         master key, else 503). Returns { ok, status, detail }; we render it
//         inline next to the row (green ok / red fail). The secret value is
//         never sent here and never returned.
//
//   SECRET DISCIPLINE: secret keys (is_secret=1 — paddle_webhook_secret,
//   paddle_api_key, privy_app_secret, pimlico_api_key, smtp_password) are
//   NEVER returned in plaintext by the server (masked '***' on the list, and
//   excluded from /v1/config/runtime). We render a masked password input for
//   them; we NEVER display a returned secret. A secret SET still works (the
//   value is sent once, encrypted server-side, then unreadable).

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { keccak256, toBytes } from "viem";
import { InfoTooltip } from "./InfoTooltip.js";
import { ensureOpsSig } from "../hooks/useOpsLive.js";

// /v1-inclusive base, matching the rest of the Admin family (track / cancel
// window / refunds / blacklist all read VITE_API_BASE_URL incl. /v1). The
// route is /v1/admin/payment-config, so we append /admin/payment-config.
const PAYMENT_CONFIG_API =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

// Shown inline when a WRITE (set/delete/test) returns HTTP 503 — the Form B
// server cannot encrypt a value without its AES master key, so it refuses the
// write with a 503. This tells Daniel exactly what to provision (the list/GET
// still renders normally; only writes are blocked until the key is set).
const MASTER_KEY_MISSING_MSG =
  "Set PAYMENT_CONFIG_MASTER_KEY (≥32 bytes) on the Form B server before staging keys.";

// -----------------------------------------------------------------------------
// KNOWN_CONFIG_KEYS — client mirror of the server allow-list (payment-config.ts
// KNOWN_CONFIG_KEYS). The server is the source of truth and refuses (400) any
// write to a key outside its own set; this mirror only drives the editable
// form + the secret-masking + the section grouping. A row the SERVER returns
// that isn't in this mirror still renders (under "Other") — we never hide a
// stored row just because the client list lags the server.
//
// RELAYER_PRIVATE_KEY is intentionally ABSENT (env-only, never a config key).
// `secret: true` ⇒ value is never returned by the server; we mask the input.
// -----------------------------------------------------------------------------
export type ConfigGroup = "Paddle" | "Privy" | "Pimlico" | "SMTP" | "Misc" | "Other";

interface KnownKeyMeta {
  readonly secret: boolean;
  readonly group: ConfigGroup;
  readonly hint: string;
}

export const KNOWN_CONFIG_KEYS: Readonly<Record<string, KnownKeyMeta>> = {
  // --- Paddle ---
  paddle_vendor_id:        { secret: false, group: "Paddle", hint: "Paddle Billing Seller ID (public)." },
  paddle_client_token:     { secret: false, group: "Paddle", hint: "Paddle Billing client-side token (public; used by the PWA checkout widget at the managed flip)." },
  paddle_webhook_secret:   { secret: true,  group: "Paddle", hint: "Paddle Billing notification/webhook signing secret (HMAC). Never displayed — set-only." },
  paddle_api_key:          { secret: true,  group: "Paddle", hint: "Paddle Billing API key (used for refund calls). Never displayed — set-only." },
  paddle_product_standard:          { secret: false, group: "Paddle", hint: "Paddle price id — Standard managed tier (recurring)." },
  paddle_product_premium:           { secret: false, group: "Paddle", hint: "Paddle price id — Premium managed tier (recurring)." },
  paddle_product_standard_lifetime: { secret: false, group: "Paddle", hint: "Paddle price id — Standard managed tier, LIFETIME (one-time)." },
  paddle_product_premium_lifetime:  { secret: false, group: "Paddle", hint: "Paddle price id — Premium managed tier, LIFETIME (one-time)." },
  // --- Privy ---
  privy_app_id:            { secret: false, group: "Privy", hint: "Privy App ID (public; surfaced to the PWA at the managed flip)." },
  privy_app_secret:        { secret: true,  group: "Privy", hint: "Privy App Secret (server-side JWT verification). Never displayed — set-only." },
  privy_jwks_url:          { secret: false, group: "Privy", hint: "Privy JWKS URL for verifying Privy session JWTs." },
  // --- Pimlico ---
  pimlico_api_key:         { secret: true,  group: "Pimlico", hint: "Pimlico API key (server-side gas sponsorship). Never displayed — set-only." },
  pimlico_policy_id:       { secret: false, group: "Pimlico", hint: "Pimlico sponsorship policy id (public)." },
  pimlico_monthly_cap_usd: { secret: false, group: "Pimlico", hint: "Soft monthly USD cap for sponsored gas (display/guard)." },
  // --- SMTP ---
  smtp_host:               { secret: false, group: "SMTP", hint: "SMTP server host." },
  smtp_port:               { secret: false, group: "SMTP", hint: "SMTP server port (e.g. 587)." },
  smtp_username:           { secret: false, group: "SMTP", hint: "SMTP auth username." },
  smtp_from:               { secret: false, group: "SMTP", hint: "From address for outbound mail." },
  smtp_password:           { secret: true,  group: "SMTP", hint: "SMTP auth password. Never displayed — set-only." },
  // --- Public / misc ---
  play_store_url:          { secret: false, group: "Misc", hint: "Google Play listing URL (also served via the public /v1/config/runtime bootstrap)." },
} as const;

// 0.4.0 — "SMTP" intentionally OMITTED from the rendered groups (Daniel
// 2026-06-14, NK-SMTP-REDUNDANT-1): transactional email is configured via the
// Form B ENV vars (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM)
// that the mailer (notifier.ts / email-worker.ts) actually reads — the
// payment_config smtp_* keys are a redundant parallel store only the /test
// probe uses, so we don't prompt for them in the panel. The keys stay DEFINED
// in KNOWN_CONFIG_KEYS (so the allow-list + /test still recognise them); they
// just bucket into a group groupEntries never emits. Email is unaffected by
// this — it never read these rows.
const GROUP_ORDER: readonly ConfigGroup[] = ["Paddle", "Privy", "Pimlico", "Misc", "Other"];

export function isKnownConfigKey(k: string): boolean {
  return Object.prototype.hasOwnProperty.call(KNOWN_CONFIG_KEYS, k);
}

export function groupForKey(k: string): ConfigGroup {
  return isKnownConfigKey(k) ? KNOWN_CONFIG_KEYS[k]!.group : "Other";
}

export function isSecretKey(k: string): boolean {
  return isKnownConfigKey(k) ? KNOWN_CONFIG_KEYS[k]!.secret : false;
}

// -----------------------------------------------------------------------------
// Signed-message builders — MUST byte-match the server (payment-config.ts).
// Exported so the vitest can assert parity against the server's exported
// paymentConfigSetMessage()/list-message format directly.
// -----------------------------------------------------------------------------

// Mirror of server paymentConfigSetMessage(key, value, ts) — the WRITE message.
// keccak256(toBytes(value)) keeps the message fixed-length + binds the exact
// value, so a captured signature can't be replayed onto a different value.
export function paymentConfigSetMessage(key: string, value: string, ts: number): string {
  const valueHash = keccak256(toBytes(value));
  return [
    "NoKLock payment-config set",
    `key: ${key}`,
    `valueHash: ${valueHash}`,
    `ts: ${Math.floor(ts)}`,
  ].join("\n");
}

// Mirror of the server's per-action list READ message (payment-config.ts
// line 227): `NoKLock payment-config list ${Math.floor(ts)}`.
export function paymentConfigListMessage(ts: number): string {
  return `NoKLock payment-config list ${Math.floor(ts)}`;
}

// Mirror of server paymentConfigClearMessage(key, ts) — the DELETE message.
// Per-action signed; binds the exact key + ts so a captured sig can't be
// replayed onto a different key or outside the ±5min window.
export function paymentConfigClearMessage(key: string, ts: number): string {
  return `NoKLock payment-config clear: ${key} @ ${Math.floor(ts)}`;
}

// Mirror of server paymentConfigTestMessage(key, ts) — the /:key/test message.
// Per-action signed; the server reads the STORED value (we never re-send it).
export function paymentConfigTestMessage(key: string, ts: number): string {
  return `NoKLock payment-config test: ${key} @ ${Math.floor(ts)}`;
}

// Structured result from POST /:key/test — rendered inline beside the row.
export interface ConfigTestResult {
  readonly ok: boolean;
  readonly status: number | string;
  readonly detail: string;
}

// Server row shape from GET /v1/admin/payment-config (entries[]). `value` is
// null for never-set non-secret keys, '***' for secrets, or the plaintext for
// a set non-secret key. decryptError appears only when a non-secret envelope
// failed to decrypt (wrong/rotated master key).
export interface PaymentConfigEntry {
  readonly key: string;
  readonly isSecret: boolean;
  readonly value: string | null;
  readonly set: boolean;
  readonly keyVersion: number;
  readonly lastModifiedAtTs: number;
  readonly lastModifiedBy: string;
  readonly decryptError?: boolean;
}

function shortAddr(a: string | null | undefined): string {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmtTs(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

// Merge the server entries with the full known-key list so EVERY writable key
// has a row even when never set (value=null, set=false). Server rows win on the
// shared keys (they carry the real metadata). Unknown server rows are kept
// (forward-compatible) under "Other".
export function mergeEntries(serverEntries: readonly PaymentConfigEntry[]): PaymentConfigEntry[] {
  const byKey = new Map<string, PaymentConfigEntry>();
  for (const k of Object.keys(KNOWN_CONFIG_KEYS)) {
    byKey.set(k, {
      key: k,
      isSecret: KNOWN_CONFIG_KEYS[k]!.secret,
      value: null,
      set: false,
      keyVersion: 0,
      lastModifiedAtTs: 0,
      lastModifiedBy: "",
    });
  }
  for (const e of serverEntries) byKey.set(e.key, e);
  return Array.from(byKey.values());
}

export function groupEntries(
  entries: readonly PaymentConfigEntry[],
): { group: ConfigGroup; rows: PaymentConfigEntry[] }[] {
  const buckets = new Map<ConfigGroup, PaymentConfigEntry[]>();
  for (const e of entries) {
    const g = groupForKey(e.key);
    const arr = buckets.get(g) ?? [];
    arr.push(e);
    buckets.set(g, arr);
  }
  const out: { group: ConfigGroup; rows: PaymentConfigEntry[] }[] = [];
  for (const g of GROUP_ORDER) {
    const rows = buckets.get(g);
    if (rows && rows.length > 0) {
      rows.sort((a, b) => a.key.localeCompare(b.key));
      out.push({ group: g, rows });
    }
  }
  return out;
}

export function AdminPaymentConfig(): JSX.Element {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [entries, setEntries] = useState<PaymentConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Per-row draft + busy. Keyed by config key. A draft of undefined means the
  // input is showing the current value (non-secret) or empty (secret/unset).
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  // Per-row delete/test busy flags + the inline test result keyed by config key.
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ConfigTestResult>>({});
  // Per-row inline save/delete feedback (mirrors testResults). ok=green
  // "Saved ✓"/"Cleared ✓"; else the specific error — incl. the master-key 503
  // instruction — rendered RIGHT NEXT TO the row's buttons, because the top-card
  // err/toast (lines below) is off-screen from a Save button deep in a group.
  const [rowFeedback, setRowFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setErr(null);
    try {
      // Shared ops-session signature — ONE sign covers every admin READ for 24h
      // (parity with AdminRefundsPending.load / blacklist list). The server GET
      // now accepts this "NoKLock ops session: <ts>" credential via
      // isFreshOpsOwner; we no longer re-sign the per-action list message on
      // every load (that was the signing regression). Writes stay per-action.
      const cached = await ensureOpsSig(address, signMessageAsync);
      const r = await fetch(
        `${PAYMENT_CONFIG_API}/admin/payment-config?msg=${encodeURIComponent(cached.msg)}&sig=${encodeURIComponent(cached.sig)}`,
      );
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const j = (await r.json()) as { entries?: PaymentConfigEntry[] };
      setEntries(mergeEntries(Array.isArray(j.entries) ? j.entries : []));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(key: string): Promise<void> {
    const value = drafts[key] ?? "";
    if (value.length === 0) {
      setErr(`Enter a value for ${key} before saving.`);
      return;
    }
    setSavingKey(key);
    setErr(null);
    setToast(null);
    // Clear this row's prior inline feedback so the result reflects THIS save.
    setRowFeedback((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    try {
      // PER-ACTION write signature (never cached) binding the exact key+value+ts.
      const ts = Math.floor(Date.now() / 1000);
      const message = paymentConfigSetMessage(key, value, ts);
      const signature = await signMessageAsync({ message });
      const r = await fetch(`${PAYMENT_CONFIG_API}/admin/payment-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, ts, signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        // 503 = master key not provisioned. Surface a clear, specific inline
        // instruction rather than the raw server error so Daniel knows exactly
        // what to do (the list/GET still renders normally — this is write-only).
        if (r.status === 503) {
          throw new Error(MASTER_KEY_MISSING_MSG);
        }
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setToast(`Saved ${key}.`);
      // Inline per-row success badge — visible right where the button was clicked.
      setRowFeedback((f) => ({ ...f, [key]: { ok: true, msg: "Saved ✓" } }));
      // Drop the draft so the row re-reads the freshly-loaded value.
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      await load();
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      // ALSO surface the failure inline at the row — this is the path that was
      // invisible before (a 503 master-key error rendered only at the top card,
      // off-screen from the Save button the owner clicked).
      setRowFeedback((f) => ({ ...f, [key]: { ok: false, msg } }));
    } finally {
      setSavingKey(null);
    }
  }

  async function del(key: string): Promise<void> {
    // Clearing a row reverts the consumer to its env fallback — confirm first.
    if (!window.confirm(`Clear the stored value for "${key}"? The server will revert to its env fallback for this key.`)) {
      return;
    }
    setDeletingKey(key);
    setErr(null);
    setToast(null);
    setRowFeedback((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    try {
      // PER-ACTION delete signature (never cached) binding the exact key+ts.
      const ts = Math.floor(Date.now() / 1000);
      const message = paymentConfigClearMessage(key, ts);
      const signature = await signMessageAsync({ message });
      const r = await fetch(
        `${PAYMENT_CONFIG_API}/admin/payment-config/${encodeURIComponent(key)}?ts=${ts}&sig=${encodeURIComponent(signature)}`,
        { method: "DELETE" },
      );
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      setToast(`Cleared ${key}.`);
      setRowFeedback((f) => ({ ...f, [key]: { ok: true, msg: "Cleared ✓" } }));
      // Drop any stale draft + inline test result for the cleared row.
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      setTestResults((t) => {
        const next = { ...t };
        delete next[key];
        return next;
      });
      await load();
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      setRowFeedback((f) => ({ ...f, [key]: { ok: false, msg } }));
    } finally {
      setDeletingKey(null);
    }
  }

  async function test(key: string): Promise<void> {
    setTestingKey(key);
    setErr(null);
    setToast(null);
    // Clear any prior result for this row so the spinner isn't shadowed by stale.
    setTestResults((t) => {
      const next = { ...t };
      delete next[key];
      return next;
    });
    // Also drop a stale Saved/Cleared badge so it doesn't sit beside the test run.
    setRowFeedback((f) => {
      const next = { ...f };
      delete next[key];
      return next;
    });
    try {
      // PER-ACTION test signature (never cached) binding the exact key+ts. The
      // server decrypts the STORED value and probes the provider — we never send
      // the value here.
      const ts = Math.floor(Date.now() / 1000);
      const message = paymentConfigTestMessage(key, ts);
      const signature = await signMessageAsync({ message });
      const r = await fetch(`${PAYMENT_CONFIG_API}/admin/payment-config/${encodeURIComponent(key)}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ts, signature }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        // 503 = master key not provisioned (the test must decrypt the stored
        // value). Surface the same specific instruction as the save path.
        if (r.status === 503) {
          throw new Error(MASTER_KEY_MISSING_MSG);
        }
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const result = (await r.json()) as ConfigTestResult;
      setTestResults((t) => ({ ...t, [key]: result }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setTestingKey(null);
    }
  }

  const grouped = groupEntries(entries);
  const addrIsConnected = !!address;

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold font-display">Payment config</h2>
          <button className="btn btn-secondary text-xs" onClick={() => void load()} disabled={loading || savingKey !== null}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        <p className="text-text-muted text-xs">
          Operator credentials for the managed-wallet stack — Paddle, Privy, Pimlico, SMTP. Stored
          encrypted in Form B (<code>payment_config</code>, AES-256-GCM). Each write is signed by your
          connected admin wallet over <code>NoKLock payment-config set</code> (binding the exact
          key + value); the read reuses the shared 24h ops-session signature (one sign per day across
          every admin read), so it no longer re-prompts your wallet on each load.
        </p>
        <p className="text-text-muted text-xs">
          You can set these <strong>before</strong> the managed-wallet flag is flipped — the server allows
          owner-signed payment-config writes pre-flip so you can pre-stage credentials. Both an off-chain
          admin (Treasury) and the contract owner can read + write here (unlike on-chain mint, which
          reverts for a non-owner). Secret values are never displayed — they show <code>***</code> and are
          set-only.
        </p>
        {!addrIsConnected && (
          <p className="text-xs text-amber-300">Connect your admin wallet to sign reads/writes.</p>
        )}
        {err && <div className="text-xs text-rose-400">{err}</div>}
        {toast && <div className="text-xs text-accent-green">{toast}</div>}
      </div>

      {loading ? (
        <div className="card"><p className="text-text-muted text-sm">Loading…</p></div>
      ) : (
        grouped.map(({ group, rows }) => (
          <div key={group} className="card space-y-3">
            <h3 className="font-bold font-display">{group}</h3>
            <div className="space-y-3">
              {rows.map((row) => {
                const secret = row.isSecret;
                const known = isKnownConfigKey(row.key);
                const hint = known ? KNOWN_CONFIG_KEYS[row.key]!.hint : "Stored on the server but not in the client allow-list.";
                const draft = drafts[row.key];
                // Non-secret editable inputs default to the current value; secret
                // inputs always start empty (the value is never returned).
                const inputValue = draft !== undefined ? draft : secret ? "" : (row.value ?? "");
                const saving = savingKey === row.key;
                const deleting = deletingKey === row.key;
                const testing = testingKey === row.key;
                // Cross-disable a row's actions while any of its own actions runs.
                const busy = saving || deleting || testing;
                const testResult = testResults[row.key];
                const feedback = rowFeedback[row.key];
                return (
                  <div key={row.key} className="border-b border-bg-surface/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <code className="text-sm text-text-on-dark">{row.key}</code>
                      <InfoTooltip hint={hint} />
                      {secret && <span className="tier-badge bg-amber-500/15 text-amber-300 text-[10px]">secret</span>}
                      {row.set
                        ? <span className="tier-badge bg-emerald-500/15 text-emerald-300 text-[10px]">set</span>
                        : <span className="tier-badge bg-bg-surface text-text-muted text-[10px]">unset</span>}
                      {row.decryptError && <span className="tier-badge bg-rose-500/15 text-rose-300 text-[10px]">decrypt error</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type={secret ? "password" : "text"}
                        value={inputValue}
                        autoComplete={secret ? "new-password" : "off"}
                        placeholder={secret ? (row.set ? "*** (set — type to replace)" : "set value…") : "value…"}
                        onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                        className="flex-1 min-w-[14rem] bg-bg-deepest border border-bg-surface rounded p-2 text-sm font-mono"
                      />
                      <button
                        className="btn btn-primary text-xs"
                        disabled={busy || !addrIsConnected || (drafts[row.key] ?? "").trim().length === 0}
                        onClick={() => void save(row.key)}
                      >
                        {saving ? "Signing…" : "Save (sign)"}
                      </button>
                      {/* Test — per-action owner-signed provider connectivity probe
                          (server decrypts the STORED value; requires the master key). */}
                      <button
                        className="btn btn-secondary text-xs"
                        disabled={busy || !addrIsConnected || !row.set}
                        title={row.set ? "Sign and run a provider connectivity check using the stored value" : "Set a value first"}
                        onClick={() => void test(row.key)}
                      >
                        {testing ? "Testing…" : "Test"}
                      </button>
                      {/* Delete — per-action owner-signed clear (reverts the consumer
                          to its env fallback). Confirmed before firing. */}
                      <button
                        className="btn btn-secondary text-xs"
                        disabled={busy || !addrIsConnected || !row.set}
                        title={row.set ? "Sign and clear the stored value (reverts to the env fallback)" : "Nothing stored to clear"}
                        onClick={() => void del(row.key)}
                      >
                        {deleting ? "Clearing…" : "Delete"}
                      </button>
                    </div>
                    {feedback && (
                      <div className={`text-[11px] mt-1 ${feedback.ok ? "text-accent-green" : "text-rose-400"}`}>
                        {feedback.ok ? "✓" : "✕"} {feedback.msg}
                      </div>
                    )}
                    {testResult && (
                      <div className={`text-[11px] mt-1 ${testResult.ok ? "text-accent-green" : "text-rose-400"}`}>
                        {testResult.ok ? "✓" : "✕"} {testResult.detail}
                        <span className="text-text-muted"> (status {String(testResult.status)})</span>
                      </div>
                    )}
                    <div className="text-[10px] text-text-muted mt-1">
                      {row.set
                        ? <>Last set {fmtTs(row.lastModifiedAtTs)} by <span className="font-mono" title={row.lastModifiedBy}>{shortAddr(row.lastModifiedBy)}</span> · v{row.keyVersion}</>
                        : <>Never set.</>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="card">
        <p className="text-[11px] text-text-muted">
          Source: owner-signed <code>GET/POST /v1/admin/payment-config</code> (Form B). A write requires the
          server-side <code>PAYMENT_CONFIG_MASTER_KEY</code> to be provisioned — without it the server returns
          a clear 503 (<code>set PAYMENT_CONFIG_MASTER_KEY</code>). <code>RELAYER_PRIVATE_KEY</code> is
          intentionally env-only and is not a config key here.
        </p>
      </div>
    </div>
  );
}
