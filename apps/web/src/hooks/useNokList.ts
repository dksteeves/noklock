// @version 0.4.0 @date 2026-05-19
// 0.4.0 — PERMANENT FIX: no more browser eth_getLogs. Reads the Form B
//         event INDEX (GET /v1/index/nok?owner=…) which the server
//         scans into SQLite. Immune to every free-RPC block-range /
//         pruning limit (Alchemy-free 10-block cap, publicnode pruning,
//         dRPC range cap, the "upstream 400 / Failed to fetch 1rpc"
//         saga). Same NoKEntry grouping the UI already expects.
// 0.3.0 — (superseded) pinned Form B /v1/rpc getLogs proxy.
// 0.2.0 — (superseded) chunked client-side eth_getLogs.
// 0.1.0 — initial.
//
// useNokList — every SBT minted FOR the connected wallet, grouped one
// entry per (nokWallet × vaultId) with the three role token-ids.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { SBT_ROLE_NAME } from "../lib/sbt-contract.js";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

export interface NokEntry {
  readonly nokWallet: Address;
  readonly vaultId: `0x${string}`;
  /** Token ids by role number (0=Activation, 1=Voting, 2=Revocation). */
  readonly tokensByRole: Readonly<Record<number, bigint>>;
  readonly mintedAt: number;
}

export interface UseNokListState {
  readonly entries: readonly NokEntry[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

interface IndexRow {
  tokenId: string;
  nokWallet: string;
  ownerWallet: string;
  vaultId: string;
  role: number;
  blockNumber: number;
}

export function useNokList(): UseNokListState {
  const { address } = useAccount();
  const [entries, setEntries] = useState<readonly NokEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/index/nok?owner=${address}`);
      if (!r.ok) throw new Error(`Index unavailable (HTTP ${r.status})`);
      const j = (await r.json()) as { nok?: IndexRow[] };
      const rows = Array.isArray(j.nok) ? j.nok : [];

      const grouped: Record<string, { nokWallet: Address; vaultId: `0x${string}`; tokensByRole: Record<number, bigint>; mintedAt: number }> = {};
      for (const row of rows) {
        const key = `${row.nokWallet.toLowerCase()}|${row.vaultId}`;
        if (!grouped[key]) {
          grouped[key] = {
            nokWallet: row.nokWallet as Address,
            vaultId: row.vaultId as `0x${string}`,
            tokensByRole: {},
            mintedAt: row.blockNumber,
          };
        }
        try { grouped[key].tokensByRole[row.role] = BigInt(row.tokenId); } catch { /* skip bad id */ }
      }
      setEntries(Object.values(grouped));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // re-run when wallet changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return { entries, loading, error, refetch: load };
}

export { SBT_ROLE_NAME };
