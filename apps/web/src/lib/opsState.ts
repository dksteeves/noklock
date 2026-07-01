// @version 0.1.0 @date 2026-05-22
// Ops Manual per-item state (Daniel 2026-05-22). The static checklist becomes
// action-oriented: it needs to know WHEN each check was last done (to show
// "due now / due soon / on schedule" instead of a flat list), WHO it's
// assigned to (the human team or the AI/Claude team), and be able to hand the
// task off with one click — a ready-to-paste Claude prompt for AI-assigned
// items, or a clean details block for a human. All client-side localStorage
// (owner-only admin tool; no server needed).

import type { Cadence, OpsItem } from "../data/ops-manual.js";

export type Assignee = "human" | "ai";
export type OpsStatus = "overdue" | "due" | "soon" | "ok" | "ontrigger";

interface ItemState { lastDoneTs?: number; assignee?: Assignee }
type OpsStateMap = Record<string, ItemState>;

const KEY = "noklock.ops.state";

function read(): OpsStateMap {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OpsStateMap) : {};
  } catch { return {}; }
}
function write(m: OpsStateMap): void {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

export function getItemState(id: string): ItemState { return read()[id] ?? {}; }
export function markDone(id: string): void { const m = read(); m[id] = { ...m[id], lastDoneTs: Date.now() }; write(m); }
export function clearDone(id: string): void { const m = read(); if (m[id]) { delete m[id]!.lastDoneTs; write(m); } }
export function setAssignee(id: string, who: Assignee): void { const m = read(); m[id] = { ...m[id], assignee: who }; write(m); }

/** Sensible default owner: live/chain checks lean AI (Claude can pull + explain
 *  them); purely manual / physical checks lean human. Overridable per item. */
export function defaultAssignee(item: OpsItem): Assignee {
  return item.liveSource === "manual" || item.liveSource === undefined ? "human" : "ai";
}

// Cadence → interval in days (null = no fixed schedule: event / incident).
const CADENCE_DAYS: Record<Cadence, number | null> = {
  daily: 1, weekly: 7, monthly: 30, quarterly: 91, annual: 365, event: null, incident: null,
};

const DAY = 86_400_000;

export interface DueInfo {
  readonly status: OpsStatus;
  readonly lastDoneTs?: number;
  readonly nextDueTs?: number;
  readonly label: string;       // e.g. "due now", "due in 4d", "next in 12d"
  readonly lastLabel?: string;  // e.g. "done 3d ago" / "never logged"
}

function agoLabel(ts: number, now: number): string {
  const d = Math.floor((now - ts) / DAY);
  if (d <= 0) return "done today";
  return `done ${d}d ago`;
}

export function computeDue(item: OpsItem, st: ItemState, now = Date.now()): DueInfo {
  const days = CADENCE_DAYS[item.cadence];
  if (days === null) {
    return { status: "ontrigger", lastDoneTs: st.lastDoneTs, label: item.cadence === "incident" ? "on incident" : "on trigger", lastLabel: st.lastDoneTs ? agoLabel(st.lastDoneTs, now) : undefined };
  }
  if (!st.lastDoneTs) {
    return { status: "due", label: "due — not yet logged", lastLabel: "never logged" };
  }
  const nextDueTs = st.lastDoneTs + days * DAY;
  const remaining = nextDueTs - now;
  const lastLabel = agoLabel(st.lastDoneTs, now);
  if (remaining <= 0) {
    const over = Math.floor(-remaining / DAY);
    return { status: "overdue", lastDoneTs: st.lastDoneTs, nextDueTs, label: over <= 0 ? "due now" : `overdue ${over}d`, lastLabel };
  }
  if (remaining <= Math.max(DAY, days * DAY * 0.25)) {
    return { status: "soon", lastDoneTs: st.lastDoneTs, nextDueTs, label: `due in ${Math.ceil(remaining / DAY)}d`, lastLabel };
  }
  return { status: "ok", lastDoneTs: st.lastDoneTs, nextDueTs, label: `next in ${Math.ceil(remaining / DAY)}d`, lastLabel };
}

/** A ready-to-paste prompt for Claude (desktop / extension) to perform an
 *  AI-assigned ops task end-to-end. */
export function buildClaudePrompt(item: OpsItem): string {
  const lines = [
    `NoKLock ops task — ${item.title}`,
    ``,
    `I'm the NoKLock owner. This is a ${item.cadence} ${item.domain} operations check on the live system (Polygon mainnet + the Form B service at api.noklock.app).`,
    ``,
    `What this check is: ${item.description}`,
  ];
  if (item.expected) lines.push(`Healthy / expected: ${item.expected}`);
  if (item.action) lines.push(`If out of range: ${item.action}`);
  lines.push(
    ``,
    `Please: tell me exactly how to obtain the current value (command / endpoint / contract call), what to compare it against, and — if action is required — the precise, ordered steps to fix it. Be concrete and safe; flag anything destructive or irreversible before I run it.`,
  );
  return lines.join("\n");
}

/** A clean task block to hand a human (or paste into a ticket). */
export function buildDetails(item: OpsItem): string {
  const lines = [`${item.title}  [${item.domain} · ${item.cadence}]`, item.description];
  if (item.expected) lines.push(`Expected: ${item.expected}`);
  if (item.action) lines.push(`Action: ${item.action}`);
  return lines.join("\n");
}
