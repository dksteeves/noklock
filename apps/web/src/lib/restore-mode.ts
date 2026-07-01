// @version 0.1.0 @date 2026-06-01
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step 2 [mofn-restore-quorum-fix-plan §D.1].
//         Discriminator for owner-restore (`/restore`) vs. heir-restore
//         (`/heir/restore`). The restore pipeline gate
//         (`assertQuorumOrOwnerMode`) consults this — owner mode is a no-op
//         (preserves "shares + master password = restore on any browser"
//         byte-identical to pre-quorum behaviour); heir mode + a manifest
//         with `quorumPolicy` requires a Form B `QuorumReleaseAttestation`
//         before unlock. See plan §F for the owner-path-preservation
//         contract and §D.2 for the pipeline integration.
//
// Decision priority (highest wins):
//   1. explicitMode  — caller route forces it (e.g. `/heir/restore` sets
//                      "heir" unconditionally; an admin tool could force
//                      "owner" on a known-owner self-restore).
//   2. heirEnvelope  — presence of a parsed-and-validated claim envelope
//                      is unambiguous heir intent (the envelope is signed
//                      by the heir's wallet at NoK-claim time).
//   3. quorumPolicy  — absent on the manifest → legacy / Free / pre-2026-06
//                      vault → owner-restorable as today (grandfather).
//   4. otherwise     — manifest HAS quorumPolicy but neither an explicit
//                      mode nor an envelope was supplied → ambiguous;
//                      caller (UI) should prompt the user to choose.

import type { VaultManifest } from "@soulchain/crypto-core";
import type { HeirClaimEnvelope } from "./heir-claim-envelope.js";

export type RestoreMode = "owner" | "heir" | "ambiguous";

export interface DetectRestoreModeArgs {
  readonly manifest: VaultManifest;
  readonly heirEnvelope?: HeirClaimEnvelope;
  readonly explicitMode?: RestoreMode;
}

/** Decide which restore path applies given the manifest + optional envelope
 *  + optional explicit override. See file header for the priority rules. */
export function detectRestoreMode(args: DetectRestoreModeArgs): RestoreMode {
  if (args.explicitMode) return args.explicitMode;
  if (args.heirEnvelope) return "heir";
  if (!args.manifest.quorumPolicy) return "owner";
  return "ambiguous";
}
