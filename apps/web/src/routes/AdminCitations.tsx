// @version 0.4.0 @date 2026-05-25
// 0.4.0 — Perplexity + Claude AUTO-POLL wired (manual capture won't scale —
//         Daniel). New auto-poll status strip (engines on/off + last run +
//         cadence) + "Run auto-poll now" (owner-signed → background poll).
//         Grid cells now tag auto vs manual; the scorecard fills BOTH the
//         Perplexity and Claude columns (latest-per-query×platform). ChatGPT +
//         Google AI have no faithful API → they stay a manual spot-check.
// 0.3.0 — Visibility + clarity fixes (Daniel screenshots): empty status cells
//         rendered a near-invisible "·" at text-muted/40, so the grid looked
//         empty/broken — now each empty cell is a clearly-clickable dashed
//         "＋ log" button. Added an intro line making explicit this is a
//         MANUAL log (nothing is fetched automatically — "I refreshed and got
//         nothing" was the tool working as designed but reading as broken).
//         Renamed the bottom "Recapture" button (it only re-fetches saved
//         data) → "Refresh saved data". Input placeholder contrast is fixed
//         globally in index.css (form-control base rule).
// @version 0.2.0 @date 2026-05-22
// 0.2.0 — AEO seed (Daniel): a curated crypto-inheritance target-query set is
//         now shown as click-to-fill suggestion chips above the tracked-query
//         list (SUGGESTED_QUERIES), so the owner can seed the monitor fast.
// @version 0.1.0 @date 2026-05-20
// AdminCitations — manual-refresh citation monitor (Daniel 2026-05-20).
//
// Layout follows the 3-panel mockup:
//   1. Citation monitor cards — 4 platform tiles showing latest N/M score
//   2. Query × platform table with status icons (✓ cited / − mentioned / ✗ gap)
//   3. Manual snapshot entry modal (when clicking a cell or "Capture")
//   PLUS a "Tracked queries" sub-section for CRUD of the query list
//
// All writes are owner-signed via useSignMessage (recovers to either
// License.owner() OR an OFFCHAIN_ADMIN_ADDRESSES entry — see owner-sig.ts).

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

const API_BASE = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "") + "/v1";

const PLATFORMS = [
  { id: "chatgpt",    label: "ChatGPT" },
  { id: "claude",     label: "Claude" },
  { id: "perplexity", label: "Perplexity" },
  { id: "google_ai",  label: "Google AI" },
] as const;
type PlatformId = typeof PLATFORMS[number]["id"];

// AEO target-query set for crypto-inheritance (Daniel 2026-05-22). The actual
// high-intent questions people ask AI assistants in this category — what we
// want NoKLock cited for. Click a chip to fill the input, then Add. Niche /
// buyer-intent first; competitor-alternative queries next; broad last.
const SUGGESTED_QUERIES: readonly string[] = [
  "how to leave my crypto to my family",
  "what happens to my crypto when I die",
  "non-custodial crypto inheritance",
  "crypto inheritance without giving up my keys",
  "crypto dead man's switch",
  "how to inherit a seed phrase",
  "how to pass on a seed phrase to my heirs",
  "best crypto inheritance product",
  "crypto estate planning",
  "self-custody inheritance wallet",
  "best way to back up seed phrase for heirs",
  "crypto inheritance for non-crypto family",
  "duress decoy crypto wallet",
  "soulbound NFT inheritance",
  "Casa alternative",
  "Vault12 alternative",
  "Ledger Recover alternative",
  "Nunchuk inheritance alternative",
];

interface QueryRow { id: number; query: string; added_at: number; notes: string | null }
interface ScorecardRow { query_id: number; query: string; platform: PlatformId | null; status: "cited" | "mentioned" | "gap" | null; captured_at: number | null; cited_url: string | null; answer_excerpt: string | null; captured_by: string | null }
interface PlatformCounts { cited: number; mentioned: number; gap: number; total: number }

interface ScorecardResp {
  queries: ScorecardRow[];
  platforms: Record<PlatformId, PlatformCounts>;
}

interface PollStatus { lastRun: number | null; perplexity: boolean; claude: boolean; intervalHours: number }

// Engines the auto-poller can drive (faithful APIs). The other two have no
// clean API the way a user sees them, so they stay manual / paid-tool only.
const AUTO_PLATFORMS = new Set<PlatformId>(["perplexity", "claude"]);

export function AdminCitations(): JSX.Element {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [score, setScore] = useState<ScorecardResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState("");
  const [capture, setCapture] = useState<{ queryId: number; platform: PlatformId } | null>(null);
  const [poll, setPoll] = useState<PollStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollMsg, setPollMsg] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const [qRes, sRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/citations/queries`),
        fetch(`${API_BASE}/citations/scorecard`),
        fetch(`${API_BASE}/citations/poll-status`),
      ]);
      if (!qRes.ok || !sRes.ok) throw new Error(`Form B fetch: ${qRes.status} / ${sRes.status}`);
      const q = await qRes.json() as { queries: QueryRow[] };
      const s = await sRes.json() as ScorecardResp;
      setQueries(q.queries);
      setScore(s);
      if (pRes.ok) setPoll(await pRes.json() as PollStatus);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  async function runAutoPoll(): Promise<void> {
    setPolling(true);
    setPollMsg(null);
    setError(null);
    try {
      const day = Math.floor(Date.now() / 1000 / 86400);
      const signature = await signMessageAsync({ message: `NoKLock citation poll-now: ${day}` });
      const r = await fetch(`${API_BASE}/citations/poll-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) throw new Error(`poll-now failed: ${r.status} ${await r.text()}`);
      setPollMsg("Auto-poll started in the background. It runs your queries through Perplexity + Claude — refresh saved data in a minute or two to see the cells fill.");
    } catch (e) {
      setError((e as Error).message);
    }
    setPolling(false);
  }

  async function addQuery(): Promise<void> {
    const q = newQuery.trim();
    if (q.length < 3) { setError("query must be 3+ chars"); return; }
    setError(null);
    try {
      const message = `NoKLock citation query add: ${q}`;
      const signature = await signMessageAsync({ message });
      const r = await fetch(`${API_BASE}/citations/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, signature }),
      });
      if (!r.ok) throw new Error(`add failed: ${r.status} ${await r.text()}`);
      setNewQuery("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function deleteQuery(id: number, query: string): Promise<void> {
    if (!confirm(`Delete tracked query "${query}"? This removes all its captured snapshots.`)) return;
    try {
      const signature = await signMessageAsync({ message: `NoKLock citation query delete: ${id}` });
      const r = await fetch(`${API_BASE}/citations/queries/${id}?signature=${encodeURIComponent(signature)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`delete failed: ${r.status}`);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function platformBadgeClass(counts: PlatformCounts | undefined): string {
    if (!counts || counts.total === 0) return "text-text-muted";
    const positiveRate = (counts.cited + counts.mentioned * 0.5) / counts.total;
    if (positiveRate >= 0.7) return "text-accent-green";
    if (positiveRate >= 0.4) return "text-accent-cyan";
    return "text-amber-300";
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold font-display"><span className="grad">Citation monitor</span></h2>
        <p className="text-sm text-text-muted mt-1">
          Your INTERNAL AEO scoreboard (not user-facing): for each tracked query, are ChatGPT / Claude / Perplexity / Google AI <span className="text-accent-green">citing</span> you (link), <span className="text-accent-cyan">mentioning</span> you (no link), or <span className="text-rose-400">missing</span> you (a gap a competitor fills) — tracked over time. To log one, click a cell in the grid below (a box opens to paste that AI's answer + set the status).
        </p>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-accent-cyan">How this is filled: Perplexity + Claude auto-poll; ChatGPT + Google AI stay manual ▾</summary>
          <div className="mt-2 text-text-on-dark/85 space-y-2 border-l-2 border-bg-surface pl-3">
            <p><strong>What this log is worth:</strong> a measurement loop — which high-intent queries you win vs. where you're absent (your content/seeding to-do list), plus a drift/hallucination catch (e.g. an AI wrongly saying "NoKLock uploads your seed" — you spot the exact wrong claim and fix the source).</p>
            <p><strong>Now automated (Daniel: "manual won't scale"):</strong> Form B runs every tracked query through the <em>Perplexity</em> (Sonar) and <em>Claude</em> (web-search) APIs on a schedule and auto-fills those two columns — cited / mentioned / gap, with the cited URL + answer excerpt. Cells filled this way are tagged <span className="text-text-muted">auto</span>; use "Run auto-poll now" to refresh on demand. Needs <span className="font-mono text-xs">PERPLEXITY_API_KEY</span> (+ optional <span className="font-mono text-xs">ANTHROPIC_API_KEY</span>) in Form B's .env (~$5-10/mo); with no keys it's dormant.</p>
            <p><strong>Still manual:</strong> ChatGPT-with-search and Google AI Overviews have no faithful API the way a user actually sees them, so those two columns stay a manual spot-check (click a cell to log) — or a purpose-built AEO tool later (Profound, Peec AI, Otterly.ai, Scrunch, Knowatoa) for full coverage + reports.</p>
          </div>
        </details>
      </header>

      {error && <div className="card border-rose-500/50 text-rose-300 text-sm">{error}</div>}

      {/* Auto-poll status + on-demand run */}
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold">Auto-poll</span>
            <span className="text-text-muted"> — </span>
            <span className={poll?.perplexity ? "text-accent-green" : "text-text-muted"}>Perplexity {poll?.perplexity ? "on" : "off"}</span>
            <span className="text-text-muted"> · </span>
            <span className={poll?.claude ? "text-accent-green" : "text-text-muted"}>Claude {poll?.claude ? "on" : "off"}</span>
            <span className="text-text-muted"> · </span>
            <span className="text-text-muted">
              last run {poll?.lastRun ? new Date(poll.lastRun * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "never"}
            </span>
            {poll && poll.intervalHours ? <span className="text-text-muted"> · cadence {Math.round(poll.intervalHours / 24)}d</span> : null}
          </div>
          <button
            onClick={() => void runAutoPoll()}
            disabled={polling || !address || (!!poll && !poll.perplexity && !poll.claude)}
            className="btn btn-secondary text-sm"
            title={poll && !poll.perplexity && !poll.claude ? "Set PERPLEXITY_API_KEY / ANTHROPIC_API_KEY in Form B .env first" : "Sign + kick an immediate Perplexity + Claude poll"}
          >
            {polling ? "Starting…" : "Run auto-poll now (sign)"}
          </button>
        </div>
        {poll && !poll.perplexity && !poll.claude && (
          <p className="text-xs text-amber-300 mt-2">
            No engines configured — add <span className="font-mono">PERPLEXITY_API_KEY</span> (and optionally <span className="font-mono">ANTHROPIC_API_KEY</span>) to Form B's .env and restart to enable auto-fill.
          </p>
        )}
        {pollMsg && <p className="text-xs text-accent-cyan mt-2">{pollMsg}</p>}
      </section>

      {/* 4-platform score cards — mirror the Citation monitor section from the mockup */}
      <section>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const counts = score?.platforms[p.id];
            const positive = counts ? counts.cited + counts.mentioned : 0;
            const total = counts?.total ?? 0;
            return (
              <div key={p.id} className="card text-center">
                <div className="text-xs text-text-muted uppercase tracking-wider">{p.label}</div>
                <div className={`font-display font-bold text-3xl mt-1 ${platformBadgeClass(counts)}`}>{positive}<span className="text-text-muted text-base">/{total || queries.length}</span></div>
                <div className="text-xs text-text-muted mt-1">
                  {counts ? <>cited {counts.cited} · mentioned {counts.mentioned} · gap {counts.gap}</> : <em>no captures yet</em>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          Latest-capture-per-(query, platform) aggregated across the tracked-query list. Counts: ✓ cited (direct link in the AI answer), − mentioned (brand named without link), ✗ gap (not in answer at all).
        </p>
      </section>

      {/* Query × platform table — query rows, platform cols, status icons */}
      <section className="card">
        <h3 className="font-bold font-display mb-1"><span className="grad">Query × platform status</span></h3>
        <p className="text-xs text-text-muted mb-3">
          Manual log — nothing is fetched automatically. Run each query yourself in ChatGPT / Claude / Perplexity / Google AI, then click a cell to record whether NoKLock was{" "}
          <span className="text-accent-green">cited ✓</span>, <span className="text-accent-cyan">mentioned −</span>, or <span className="text-rose-400">missing ✗</span>. Empty cells show{" "}
          <span className="text-accent-cyan/80 border border-dashed border-bg-surface rounded px-1">＋ log</span> — click to record one.
        </p>
        {queries.length === 0 ? (
          <p className="text-sm text-text-muted">No tracked queries yet. Add your first below ↓</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-surface text-text-muted">
                  <th className="text-left p-2">Query</th>
                  {PLATFORMS.map((p) => <th key={p.id} className="text-center p-2">{p.label}</th>)}
                  <th className="text-right p-2">Last capture</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Group scorecard rows by query_id so each query gets one row with 4 platform cells.
                  const grouped = new Map<number, { query: string; platforms: Map<PlatformId, ScorecardRow> }>();
                  for (const r of score?.queries ?? []) {
                    let g = grouped.get(r.query_id);
                    if (!g) { g = { query: r.query, platforms: new Map() }; grouped.set(r.query_id, g); }
                    if (r.platform) g.platforms.set(r.platform, r);
                  }
                  // Make sure every tracked query appears even with no captures.
                  for (const q of queries) {
                    if (!grouped.has(q.id)) grouped.set(q.id, { query: q.query, platforms: new Map() });
                  }
                  return Array.from(grouped.entries()).map(([qid, g]) => {
                    const lastCap = Array.from(g.platforms.values())
                      .map((r) => r.captured_at ?? 0)
                      .reduce((a, b) => Math.max(a, b), 0);
                    return (
                      <tr key={qid} className="border-b border-bg-surface/40">
                        <td className="p-2 font-mono text-xs">{g.query}</td>
                        {PLATFORMS.map((p) => {
                          const c = g.platforms.get(p.id);
                          const captured = !!c?.status;
                          const isAuto = !!c?.captured_by?.startsWith("auto:");
                          const autoPlatform = AUTO_PLATFORMS.has(p.id);
                          const glyph = c?.status === "cited"     ? <span className="text-accent-green text-lg" title="Cited">✓</span>
                                      : c?.status === "mentioned" ? <span className="text-accent-cyan text-lg"  title="Mentioned">−</span>
                                      : c?.status === "gap"       ? <span className="text-rose-400 text-lg"     title="Gap">✗</span>
                                      :                             <span className="text-xs font-semibold">＋ log</span>;
                          return (
                            <td key={p.id} className="text-center p-2">
                              <button
                                onClick={() => setCapture({ queryId: qid, platform: p.id })}
                                className={captured
                                  ? "hover:bg-bg-surface rounded px-2 py-0.5 inline-flex flex-col items-center"
                                  : "rounded px-2 py-0.5 border border-dashed border-bg-surface text-accent-cyan/80 hover:border-accent-cyan hover:text-accent-cyan hover:bg-accent-cyan/10"}
                                title={captured
                                  ? (isAuto ? "Auto-captured (Perplexity/Claude API). Click to override manually." : "Manually logged. Click to update.")
                                  : autoPlatform
                                    ? "Empty — auto-poll fills this, or click to log manually"
                                    : "Click to log what this AI says for this query (manual only)"}
                              >
                                {glyph}
                                {captured && <span className="text-[9px] text-text-muted leading-none mt-0.5">{isAuto ? "auto" : "manual"}</span>}
                              </button>
                            </td>
                          );
                        })}
                        <td className="text-right p-2 text-xs text-text-muted">
                          {lastCap > 0 ? new Date(lastCap * 1000).toISOString().slice(0, 10) : <em>never</em>}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-text-muted mt-3">Click any status cell to record a new capture for that query × platform. The recorded snapshot becomes the latest visible state.</p>
      </section>

      {/* Tracked queries CRUD — sub-section per the mockup note */}
      <section className="card">
        <h3 className="font-bold font-display mb-3"><span className="grad">Tracked queries</span></h3>
        <div className="flex gap-2 mb-3">
          <input
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder='e.g. "best self-custody wallet 2026"'
            className="flex-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
          />
          <button onClick={() => void addQuery()} disabled={!address} className="btn btn-secondary text-sm">
            Add query
          </button>
        </div>
        {(() => {
          const tracked = new Set(queries.map((q) => q.query.toLowerCase().trim()));
          const remaining = SUGGESTED_QUERIES.filter((s) => !tracked.has(s.toLowerCase()));
          if (remaining.length === 0) return null;
          return (
            <div className="mb-3">
              <div className="text-xs text-text-muted mb-1">Suggested target queries (crypto-inheritance AEO) — click to fill, then Add:</div>
              <div className="flex flex-wrap gap-1.5">
                {remaining.map((s) => (
                  <button key={s} onClick={() => setNewQuery(s)} className="text-[11px] px-2 py-0.5 rounded border border-bg-surface bg-bg-deepest text-text-on-dark/80 hover:border-accent-cyan hover:text-accent-cyan">+ {s}</button>
                ))}
              </div>
            </div>
          );
        })()}
        {queries.length === 0 ? (
          <p className="text-sm text-text-muted"><em>No tracked queries yet.</em> Click the suggested chips above to add the crypto-inheritance AEO target set, or type your own — the questions potential users ask AI about this category.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {queries.map((q) => (
              <li key={q.id} className="flex items-center justify-between border-b border-bg-surface/40 py-1">
                <span className="font-mono text-xs">{q.query}</span>
                <button onClick={() => void deleteQuery(q.id, q.query)} className="text-rose-400 hover:underline text-xs">delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Capture modal */}
      {capture && (
        <CaptureModal
          queryId={capture.queryId}
          query={queries.find((q) => q.id === capture.queryId)?.query ?? ""}
          platform={capture.platform}
          onClose={() => setCapture(null)}
          onSaved={() => { setCapture(null); void refresh(); }}
        />
      )}

      <div className="text-center">
        <button onClick={() => void refresh()} disabled={loading} className="btn btn-secondary text-sm">
          {loading ? "Refreshing…" : "↻ Refresh saved data"}
        </button>
      </div>
    </div>
  );
}

function CaptureModal({ queryId, query, platform, onClose, onSaved }: {
  readonly queryId: number;
  readonly query: string;
  readonly platform: PlatformId;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}): JSX.Element {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<"cited" | "mentioned" | "gap">("cited");
  const [citedUrl, setCitedUrl] = useState("");
  const [answerExcerpt, setAnswerExcerpt] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [editorNotes, setEditorNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label ?? platform;

  async function submit(): Promise<void> {
    setSubmitting(true);
    setError(null);
    try {
      const now = Math.floor(Date.now() / 1000);
      const message = `NoKLock citation snapshot: q=${queryId} p=${platform} s=${status} at=${now}`;
      const signature = await signMessageAsync({ message });
      const r = await fetch(`${API_BASE}/citations/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId, platform, status,
          citedUrl: citedUrl || undefined,
          answerExcerpt: answerExcerpt || undefined,
          competitors: competitors || undefined,
          editorNotes: editorNotes || undefined,
          capturedBy: address,
          signature,
        }),
      });
      if (!r.ok) throw new Error(`save failed: ${r.status} ${await r.text()}`);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="mb-4">
          <h3 className="text-xl font-bold font-display"><span className="grad">New capture: {platformLabel}</span></h3>
          <p className="text-sm text-text-muted mt-1">Query: <span className="font-mono">{query}</span></p>
        </header>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-text-muted text-xs">Status</span>
            <div className="flex gap-2 mt-1">
              {(["cited", "mentioned", "gap"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded border text-sm ${status === s ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}
                >
                  {s === "cited" ? "✓ Cited" : s === "mentioned" ? "− Mentioned" : "✗ Gap"}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="text-text-muted text-xs">Cited URL (if status is "cited")</span>
            <input value={citedUrl} onChange={(e) => setCitedUrl(e.target.value)} placeholder="https://noklock.app/info" className="w-full bg-bg-deepest border border-bg-surface rounded p-2 mt-1" />
          </label>
          <label className="block">
            <span className="text-text-muted text-xs">Answer excerpt (verbatim, the relevant passage from the AI's reply — for drift diagnosis)</span>
            <textarea value={answerExcerpt} onChange={(e) => setAnswerExcerpt(e.target.value)} rows={5} className="w-full bg-bg-deepest border border-bg-surface rounded p-2 mt-1 font-mono text-xs" />
          </label>
          <label className="block">
            <span className="text-text-muted text-xs">Competitors mentioned (comma-separated)</span>
            <input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Casa, Vault12, Ledger Recover" className="w-full bg-bg-deepest border border-bg-surface rounded p-2 mt-1" />
          </label>
          <label className="block">
            <span className="text-text-muted text-xs">Editor notes (drift signal, suggested edit, etc.)</span>
            <textarea value={editorNotes} onChange={(e) => setEditorNotes(e.target.value)} rows={3} className="w-full bg-bg-deepest border border-bg-surface rounded p-2 mt-1" />
          </label>
          {error && <div className="text-rose-300">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="btn btn-secondary text-sm">Cancel</button>
            <button onClick={() => void submit()} disabled={submitting} className="btn btn-primary text-sm">
              {submitting ? "Saving…" : "Save capture (sign)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
