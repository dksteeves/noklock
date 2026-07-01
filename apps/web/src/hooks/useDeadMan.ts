// @version 0.1.0 @date 2026-05-13
//
// useDeadMan — owner-side helpers to demo the dead-man's switch end-to-end
// on a compressed timeline. Three primitives plus a "reset" so the owner
// can run the whole simulation without burning real time.
//
//   compressGrace(seconds)   — calls oracle.setGracePeriod(self, seconds)
//   recentHeartbeat()        — signs + posts a real heartbeat (via useHeartbeat)
//   performUpkeepNow(wallet) — calls oracle.performUpkeep(abi.encode(wallet))
//                              (Chainlink Automation forwarder OR pusher only;
//                              owner is set as pusher in the deploy script)
//   resetGrace()             — restores grace to 60 days
//
// All paths require deployed contracts.

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { encodeAbiParameters, type Address } from "viem";
import { oracleAbi, ORACLE_ADDR } from "../lib/contracts.js";

const DEFAULT_GRACE_SECONDS = 60 * 24 * 60 * 60; // 60 days

export type DeadManStep = "idle" | "compressing" | "performing-upkeep" | "resetting" | "done" | "error";

export interface UseDeadManState {
  readonly step: DeadManStep;
  readonly error: string | null;
  readonly txHashCompress: `0x${string}` | null;
  readonly txHashUpkeep: `0x${string}` | null;
  readonly txHashReset: `0x${string}` | null;
  readonly currentGrace: number | null;
  readonly compressGrace: (seconds: number) => Promise<void>;
  readonly performUpkeepNow: () => Promise<void>;
  readonly resetGrace: () => Promise<void>;
  readonly reset: () => void;
}

export function useDeadMan(): UseDeadManState {
  const { address } = useAccount();
  const [step, setStep] = useState<DeadManStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txCompress, setTxCompress] = useState<`0x${string}` | null>(null);
  const [txUpkeep, setTxUpkeep] = useState<`0x${string}` | null>(null);
  const [txReset, setTxReset] = useState<`0x${string}` | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: gracePeriodOverride } = useReadContract({
    address: ORACLE_ADDR,
    abi: oracleAbi,
    functionName: "gracePeriodOverride",
    args: address ? [address] : undefined,
    query: { enabled: !!address && ORACLE_ADDR !== "0x0000000000000000000000000000000000000000" },
  });

  const guardOracle = (): boolean => {
    if (ORACLE_ADDR === "0x0000000000000000000000000000000000000000") {
      setError("Oracle contract not configured — deploy + set VITE_ORACLE_CONTRACT_ADDR");
      setStep("error");
      return false;
    }
    if (!address) {
      setError("Connect a wallet first");
      setStep("error");
      return false;
    }
    return true;
  };

  const compressGrace = useCallback(async (seconds: number) => {
    if (!guardOracle()) return;
    setError(null); setStep("compressing");
    try {
      const hash = await writeContractAsync({
        address: ORACLE_ADDR, abi: oracleAbi, functionName: "setGracePeriod",
        args: [address as Address, seconds],
      });
      setTxCompress(hash);
      setStep("done");
    } catch (e) {
      setError((e as Error).message); setStep("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, writeContractAsync]);

  const performUpkeepNow = useCallback(async () => {
    if (!guardOracle()) return;
    setError(null); setStep("performing-upkeep");
    try {
      const performData = encodeAbiParameters([{ type: "address" }], [address as Address]);
      const hash = await writeContractAsync({
        address: ORACLE_ADDR, abi: oracleAbi, functionName: "performUpkeep",
        args: [performData],
      });
      setTxUpkeep(hash);
      setStep("done");
    } catch (e) {
      setError((e as Error).message); setStep("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, writeContractAsync]);

  const resetGrace = useCallback(async () => {
    if (!guardOracle()) return;
    setError(null); setStep("resetting");
    try {
      const hash = await writeContractAsync({
        address: ORACLE_ADDR, abi: oracleAbi, functionName: "setGracePeriod",
        args: [address as Address, DEFAULT_GRACE_SECONDS],
      });
      setTxReset(hash);
      setStep("done");
    } catch (e) {
      setError((e as Error).message); setStep("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, writeContractAsync]);

  const reset = useCallback(() => {
    setStep("idle"); setError(null);
    setTxCompress(null); setTxUpkeep(null); setTxReset(null);
  }, []);

  return {
    step, error,
    txHashCompress: txCompress, txHashUpkeep: txUpkeep, txHashReset: txReset,
    currentGrace: typeof gracePeriodOverride === "number" ? gracePeriodOverride : null,
    compressGrace, performUpkeepNow, resetGrace, reset,
  };
}
