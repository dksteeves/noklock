// @version 0.1.0 @date 2026-05-17
// Network guard. The NoKLock contracts exist ONLY on Polygon (chainId 137).
// Wallets default to whatever network they were last on — if that's BNB
// Smart Chain or Ethereum, the wallet prompts for gas in BNB/ETH and the
// contracts aren't even there, so the write fails or goes nowhere. This is
// exactly the "why is it asking for BNB?" confusion.
//
// `ensurePolygon()` is called at the top of EVERY contract-write flow
// (mint, referred-mint, adminMint, NoK SBT mint, on-chain heartbeat). It
// switches the wallet to Polygon (the wallet shows a one-tap network-switch
// prompt) and THROWS a clear, user-readable error if the user declines —
// so a transaction can never be broadcast on the wrong chain.

import { useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { polygon } from "wagmi/chains";

export const POLYGON_ID = polygon.id; // 137

export interface EnsurePolygon {
  /** Switches the wallet to Polygon if needed; throws if declined/failed. */
  readonly ensurePolygon: () => Promise<void>;
  /** True when a wallet is connected but on a non-Polygon network. */
  readonly isWrongChain: boolean;
  readonly polygonId: number;
}

export function useEnsurePolygon(): EnsurePolygon {
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isWrongChain = isConnected && chainId != null && chainId !== POLYGON_ID;

  const ensurePolygon = useCallback(async (): Promise<void> => {
    if (chainId === POLYGON_ID) return;
    try {
      await switchChainAsync({ chainId: POLYGON_ID });
    } catch {
      throw new Error(
        "NoKLock runs on Polygon. Your wallet is on a different network — approve the “Switch to Polygon” request in your wallet, then try again. Nothing is ever charged in BNB or ETH; gas is a few cents of POL.",
      );
    }
  }, [chainId, switchChainAsync]);

  return { ensurePolygon, isWrongChain, polygonId: POLYGON_ID };
}
