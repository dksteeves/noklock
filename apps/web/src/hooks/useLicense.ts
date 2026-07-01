// @version 0.3.0 @date 2026-06-05
// 0.3.0 — Daniel 2026-06-05: ALSO return refetch from useReadContracts so
//         consumers (PartnerAccessGate's 15s-timeout Retry button) can
//         re-fire the tier read on demand without waiting for the 60s
//         staleTime. Preserves backward compatibility — refetch is added
//         as a NEW optional field; existing consumers (TopNav, OwnerOnly)
//         that destructure { licence, loading, error } continue unchanged.
// @version 0.2.0 @date 2026-05-28
// 0.2.0 — Bug #7 (THIRD time flagged): Admin holds Lifetime Premium (tier 6)
//         on-chain, but TopNav/PartnerAccessGate kept showing "Free". Every
//         prior fix patched the Form B chain-reader (LRU cache + tier-id
//         table). The real problem is the architectural dependency on Form B
//         for a value that lives ON CHAIN. If Form B isn't restarted, or its
//         cache holds a stale read, or the box drifts out of sync, the PWA
//         lies about the user's tier — exactly the failure mode Daniel keeps
//         hitting.
//         Fix: read tier DIRECTLY from chain via wagmi useReadContracts
//         (multicall — one RPC round-trip for all 7 tier balances). No Form B
//         dependency, no LRU cache, no "did you restart" question. The
//         on-chain truth is the truth, every render. Same return shape as
//         0.1.0 so all consumers (TopNav, PartnerAccessGate, OwnerOnly, etc)
//         keep working unchanged.
// 0.1.0 — Read tier from Form B `/v1/license/:wallet` via React Query.

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import type { Abi } from "viem";
import { LICENSE_ADDR, TIER_NAME } from "../lib/contracts.js";
import type { LicenceInfo } from "../lib/api.js";

const ERC1155_BALANCEOF_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const satisfies Abi;

// NoKLockLicense is ERC-1155 with tier-as-token-id. 0=Free, 1=Standard,
// 2=Standard Lifetime, 3=Premium, 4=Family Office, 5=Institutional,
// 6=Lifetime Premium. Owning any > 0 of a tier = the user has that tier.
// Highest tier owned wins.
const TIER_IDS = [0n, 1n, 2n, 3n, 4n, 5n, 6n] as const;

export function useLicense(): {
  readonly licence: LicenceInfo | undefined;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
} {
  const { address } = useAccount();

  const contracts = useMemo(() => {
    if (!address) return [];
    return TIER_IDS.map((id) => ({
      address: LICENSE_ADDR,
      abi: ERC1155_BALANCEOF_ABI,
      functionName: "balanceOf" as const,
      args: [address, id] as const,
    }));
  }, [address]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!address,
      // Tier rarely changes (only on mint / burn). 60s staleTime is fine;
      // wagmi will also auto-refetch on block changes via block-watching.
      staleTime: 60_000,
    },
  });

  const licence: LicenceInfo | undefined = useMemo(() => {
    // Disconnected: return undefined (NOT a "Free" placeholder). Consumers
    // that render `licence.name` would otherwise show "Free" to visitors
    // who haven't connected, which Daniel flagged as wrong UX — tier should
    // only be visible AFTER connecting.
    if (!address) return undefined;
    if (!data) return undefined;

    let highest = 0;
    for (let i = 0; i < TIER_IDS.length; i++) {
      const result = data[i];
      if (result?.status !== "success") continue;
      const bal = result.result as bigint;
      const tier = Number(TIER_IDS[i]);
      if (bal > 0n && tier > highest) highest = tier;
    }

    return {
      tier: highest,
      name: TIER_NAME[String(highest)] ?? "Free",
      expires_at: null,
      source: "chain",
    };
  }, [address, data]);

  return {
    licence,
    loading: isLoading,
    error: (error as Error) ?? null,
    // 0.3.0 — expose refetch as a void-returning wrapper so consumers
    // can fire-and-forget without dealing with the QueryObserverResult
    // return type. Used by PartnerAccessGate's stillSettling Retry button.
    refetch: () => { void refetch(); },
  };
}
