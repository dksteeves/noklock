// @version 0.2.0 @date 2026-05-19
// 0.2.0 — + POLYGON_PAY_TOKENS curated list (canonical, liquid, public
//         addresses) so TierCard can offer a dropdown instead of a
//         raw "paste a contract address" field. "Other" still allows
//         any address. Bridged BNB / wrapped SOL deliberately excluded
//         (ambiguous/illiquid on Polygon — money-flow foot-gun).
// @version 0.1.0 @date 2026-05-17
//
// Swap-to-pay (WS2b) — let a user pay a USDC licence price with ANY token
// they hold ON POLYGON. Polygon-only by design (no bridges — bridge risk
// rejected for an inheritance product). 0x Swap API over plain fetch, NO
// SDK (the workspace npm cannot reliably install new packages).
//
// INVARIANTS:
//  • The contract still only ever receives USDC. We quote an EXACT-USDC-out
//    swap (buyAmount = the licence price) so the downstream approve+mint is
//    byte-identical to the direct path.
//  • Entirely additive. If no 0x key is configured, isSwapConfigured() is
//    false and the UI never offers this — the direct-USDC flow is untouched.
//  • Network guard (useEnsurePolygon) still runs first, so every leg is on
//    Polygon 137.

import type { Address } from "viem";
import { USDC_ADDR } from "./contracts.js";

const ZEROX_BASE = "https://api.0x.org";
const POLYGON_CHAIN_ID = 137;
// 0x's sentinel for a chain's native asset (here: native POL/MATIC).
export const NATIVE_SENTINEL = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

// Curated "pay with" tokens on Polygon PoS mainnet. Canonical, high-
// liquidity, 0x-routable to USDC — so the user picks from a list instead
// of hunting a contract address. Addresses are public + verifiable on
// polygonscan. Deliberately conservative: NO bridged BNB / wrapped SOL
// etc. — those are ambiguous/illiquid on Polygon and a wrong or
// no-route token in a payment flow is a foot-gun. The "Other — paste
// address" escape hatch still lets advanced users use any token; an
// illiquid one just fails the 0x quote with a readable message.
export interface PayToken { readonly symbol: string; readonly name: string; readonly address: Address }
export const POLYGON_PAY_TOKENS: readonly PayToken[] = [
  { symbol: "POL",    name: "Polygon (native gas token)",  address: NATIVE_SENTINEL },
  { symbol: "WPOL",   name: "Wrapped POL / MATIC",         address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" as Address },
  { symbol: "ETH",    name: "Ether (WETH on Polygon)",     address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" as Address },
  { symbol: "WBTC",   name: "Wrapped Bitcoin",             address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6" as Address },
  { symbol: "USDT",   name: "Tether USD",                  address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as Address },
  { symbol: "DAI",    name: "Dai Stablecoin",              address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" as Address },
  { symbol: "USDC.e", name: "Bridged USDC (USDC.e)",       address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address },
  { symbol: "LINK",   name: "Chainlink",                   address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39" as Address },
  { symbol: "AAVE",   name: "Aave",                        address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B" as Address },
  { symbol: "UNI",    name: "Uniswap",                     address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f" as Address },
];

const API_KEY = (import.meta.env.VITE_ZEROX_API_KEY as string | undefined) ?? "";

export function isSwapConfigured(): boolean {
  return API_KEY.trim().length > 0;
}

export interface SwapQuote {
  /** Token the user sells (their chosen Polygon token, or NATIVE_SENTINEL). */
  readonly sellToken: Address;
  /** Base-unit amount of sellToken required to get exactly `buyAmount` USDC. */
  readonly sellAmount: bigint;
  /** Exact USDC out (== the licence price we asked for). */
  readonly buyAmount: bigint;
  /** Tx to submit to perform the swap. */
  readonly to: Address;
  readonly data: `0x${string}`;
  readonly value: bigint;
  /** ERC-20 spender to approve `sellToken` for, or null (native sell / no
   *  approval needed). */
  readonly allowanceTarget: Address | null;
}

interface ZeroExV2Quote {
  readonly buyAmount?: string;
  readonly sellAmount?: string;
  readonly transaction?: { readonly to?: string; readonly data?: string; readonly value?: string };
  readonly issues?: { readonly allowance?: { readonly spender?: string } | null } | null;
  readonly reason?: string;
  readonly validationErrors?: { readonly reason?: string }[];
}

/**
 * Quote an EXACT-USDC-out swap on Polygon: spend `sellToken` to receive
 * exactly `usdcOut` USDC into `taker`. Throws a readable error if 0x can't
 * route it (e.g. illiquid token) so the UI can fall back to direct USDC.
 */
export async function quoteToUsdc(params: {
  readonly sellToken: Address;
  readonly usdcOut: bigint;
  readonly taker: Address;
}): Promise<SwapQuote> {
  if (!isSwapConfigured()) throw new Error("Swap-to-pay isn't configured (no 0x API key).");

  const qs = new URLSearchParams({
    chainId: String(POLYGON_CHAIN_ID),
    buyToken: USDC_ADDR,
    sellToken: params.sellToken,
    buyAmount: params.usdcOut.toString(),
    taker: params.taker,
  });

  let res: Response;
  try {
    res = await fetch(`${ZEROX_BASE}/swap/allowance-holder/quote?${qs.toString()}`, {
      headers: { "0x-api-key": API_KEY, "0x-version": "v2" },
    });
  } catch {
    throw new Error("Couldn't reach the swap service. Pay with USDC directly instead.");
  }

  const j = (await res.json().catch(() => ({}))) as ZeroExV2Quote;
  if (!res.ok || !j.transaction?.to || !j.transaction.data || j.sellAmount == null || j.buyAmount == null) {
    const why = j.reason ?? j.validationErrors?.[0]?.reason ?? `HTTP ${res.status}`;
    throw new Error(`No swap route for that token (${why}). Pay with USDC directly instead.`);
  }

  return {
    sellToken: params.sellToken,
    sellAmount: BigInt(j.sellAmount),
    buyAmount: BigInt(j.buyAmount),
    to: j.transaction.to as Address,
    data: j.transaction.data as `0x${string}`,
    value: BigInt(j.transaction.value ?? "0"),
    allowanceTarget: (j.issues?.allowance?.spender as Address | undefined) ?? null,
  };
}

export function isNative(token: Address): boolean {
  return token.toLowerCase() === NATIVE_SENTINEL.toLowerCase();
}
