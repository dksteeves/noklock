// @version 0.1.0 @date 2026-05-13
//
// useNokRevoke — burn the SBT(s) that comprise a NoK designation,
// taking them off-chain in a single user-confirmed flow.

import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";
import { sbtAbi } from "../lib/sbt-contract.js";
import { SBT_ADDR } from "../lib/contracts.js";

export type RevokeStep =
  | "idle"
  | "burning-activation"
  | "burning-voting"
  | "burning-revocation"
  | "done"
  | "error";

export interface UseNokRevokeState {
  readonly step: RevokeStep;
  readonly error: string | null;
  readonly txHashes: ReadonlyArray<`0x${string}`>;
  readonly revoke: (tokenIds: { activation?: bigint; voting?: bigint; revocation?: bigint }) => Promise<void>;
  readonly reset: () => void;
}

export function useNokRevoke(): UseNokRevokeState {
  const [step, setStep] = useState<RevokeStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<ReadonlyArray<`0x${string}`>>([]);
  const { writeContractAsync } = useWriteContract();

  const revoke = useCallback(async (tokenIds: { activation?: bigint; voting?: bigint; revocation?: bigint }) => {
    if (SBT_ADDR === "0x0000000000000000000000000000000000000000") {
      setError("SBT contract not configured");
      setStep("error");
      return;
    }
    setError(null);
    const collected: `0x${string}`[] = [];

    async function burn(label: RevokeStep, tokenId?: bigint): Promise<void> {
      if (tokenId === undefined) return;
      setStep(label);
      const hash = await writeContractAsync({
        address: SBT_ADDR, abi: sbtAbi, functionName: "revokeNoK", args: [tokenId],
      });
      collected.push(hash);
      setTxHashes([...collected]);
    }

    try {
      await burn("burning-activation", tokenIds.activation);
      await burn("burning-voting", tokenIds.voting);
      await burn("burning-revocation", tokenIds.revocation);
      setStep("done");
    } catch (e) {
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [writeContractAsync]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setTxHashes([]);
  }, []);

  return { step, error, txHashes, revoke, reset };
}
