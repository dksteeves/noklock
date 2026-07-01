// @version 0.2.0 @date 2026-05-19
// 0.2.0 — getLicense NORMALISES the Form B shape. Form B
//         /v1/license/:wallet returns { tier, tierName, balances } but
//         this client typed/consumed { tier, name, ... }. Result: the
//         Dashboard ("Tier": licence?.name ?? "Free") showed "Free" for a
//         wallet that genuinely held Premium (name was undefined), while
//         useTierGate (reads .tier) correctly gated as Premium — the
//         exact inconsistency Daniel saw. Now we derive `name` from
//         tierName / TIER_NAME(tier) so every consumer agrees.
// 0.1.0 — Thin REST client for the back-end (Form A WP plugin or Form B
//         Node service — VITE_API_BASE_URL points at the right one).

import { TIER_NAME } from "./contracts.js";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "https://tenza.one/wp-json/soulchain/v1";

export interface LicenceInfo {
  readonly tier: number;
  readonly name: string;
  readonly expires_at: number | null;
  readonly source: string;
}

export async function getLicense(wallet: string): Promise<LicenceInfo> {
  const r = await fetch(`${BASE}/license/${wallet}`, { credentials: "omit" });
  if (!r.ok) throw new Error(`license fetch failed: ${r.status}`);
  const raw = (await r.json()) as Record<string, unknown>;
  const tier =
    typeof raw.tier === "number" ? raw.tier : Number(raw.tier ?? 0) || 0;
  // Form B sends `tierName`; older Form A sent `name`. Fall back to the
  // canonical tier→name map so the displayed name always matches the tier.
  const name =
    (typeof raw.name === "string" && raw.name) ||
    (typeof raw.tierName === "string" && raw.tierName) ||
    TIER_NAME[String(tier)] ||
    "Free";
  const expires_at =
    typeof raw.expires_at === "number" ? raw.expires_at : null;
  const source =
    typeof raw.source === "string" ? raw.source : "chain";
  return { tier, name, expires_at, source };
}

export interface HeartbeatBody {
  readonly wallet: string;
  readonly ts: number;
  readonly sig: string;
  /** 2026-06-01 (AUDIT FIX 5): nonce was missing from the wire payload but
   *  IS part of the EIP-712 message the client signed. Server now requires
   *  it for signature verification. Without nonce the verification was
   *  type-mismatched and returned 401 on every off-chain heartbeat. */
  readonly nonce: string;
}

export async function postHeartbeat(body: HeartbeatBody): Promise<{ ok: boolean; id?: number }> {
  const r = await fetch(`${BASE}/heartbeat`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`heartbeat failed: ${r.status}`);
  return (await r.json()) as { ok: boolean; id?: number };
}

export async function getHealth(): Promise<{ ok: boolean; service: string; service_version: string; form: string }> {
  const r = await fetch(`${BASE}/health`, { credentials: "omit" });
  if (!r.ok) throw new Error(`health failed: ${r.status}`);
  return (await r.json()) as { ok: boolean; service: string; service_version: string; form: string };
}
