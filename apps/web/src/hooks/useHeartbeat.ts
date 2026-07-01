// @version 0.1.1 @date 2026-05-17
// 0.1.1 — Network guard on the on-chain heartbeat write (ensurePolygon).
//
// useHeartbeat — three ways to prove the user is alive:
//   1. EIP-712 sign + POST to back-end (off-chain, free)
//   2. On-chain selfHeartbeat() to the oracle (costs a few cents in MATIC)
//   3. The back-end ALSO accepts email-click webhooks via /heartbeat/external-source
//      (handled server-side; not exposed in this hook).
//
// The signed-and-POSTed path is the cheap default. The on-chain path is the
// "pirate" / fully-trustless backup that doesn't need the back-end at all.

import { useState, useCallback } from "react";
import { useAccount, useSignTypedData, useWriteContract } from "wagmi";
import { postHeartbeat } from "../lib/api.js";
import { oracleAbi, ORACLE_ADDR } from "../lib/contracts.js";
import { useEnsurePolygon } from "./useEnsurePolygon.js";
import { trackHeartbeatPingOncePerDay } from "../lib/track.js";

export type HeartbeatStep = "idle" | "signing" | "posting" | "sending-onchain" | "done" | "error";

export interface UseHeartbeatState {
  readonly step: HeartbeatStep;
  readonly error: string | null;
  readonly lastTs: number | null;
  readonly txHashOnchain: `0x${string}` | null;
  readonly signAndPost: () => Promise<void>;
  readonly heartbeatOnchain: () => Promise<void>;
}

const DOMAIN = {
  name: "NoKLock",
  version: "1",
  chainId: 137, // Polygon mainnet — swap to 80002 for Amoy testnet at config time
} as const;

const TYPES = {
  Heartbeat: [
    { name: "wallet", type: "address" },
    { name: "ts", type: "uint64" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export function useHeartbeat(): UseHeartbeatState {
  const { address } = useAccount();
  const [step, setStep] = useState<HeartbeatStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastTs, setLastTs] = useState<number | null>(null);
  const [txHashOnchain, setTxHashOnchain] = useState<`0x${string}` | null>(null);

  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();

  const signAndPost = useCallback(async () => {
    if (!address) { setError("Connect a wallet first"); setStep("error"); return; }
    setError(null);
    setStep("signing");

    const ts = Math.floor(Date.now() / 1000);
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = ("0x" + Array.from(nonceBytes).map((b) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;

    try {
      const sig = await signTypedDataAsync({
        domain: DOMAIN,
        types: TYPES,
        primaryType: "Heartbeat",
        message: { wallet: address, ts: BigInt(ts), nonce },
      });

      setStep("posting");
      // 2026-06-01 (AUDIT FIX 5): include nonce in the wire payload — it's
      // part of the signed EIP-712 message, server needs it to verify.
      await postHeartbeat({ wallet: address, ts, sig, nonce });
      setLastTs(ts);
      trackHeartbeatPingOncePerDay(); // 0.8.0 traction — anon once/day liveness count
      setStep("done");
    } catch (e) {
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [address, signTypedDataAsync]);

  const heartbeatOnchain = useCallback(async () => {
    if (!address) { setError("Connect a wallet first"); setStep("error"); return; }
    setError(null);
    setStep("sending-onchain");

    try {
      await ensurePolygon();
      const hash = await writeContractAsync({
        address: ORACLE_ADDR,
        abi: oracleAbi,
        functionName: "selfHeartbeat",
        args: [],
      });
      setTxHashOnchain(hash);
      setLastTs(Math.floor(Date.now() / 1000));
      trackHeartbeatPingOncePerDay(); // 0.8.0 traction — anon once/day liveness count
      setStep("done");
    } catch (e) {
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [address, writeContractAsync]);

  return { step, error, lastTs, txHashOnchain, signAndPost, heartbeatOnchain };
}
