// @version 0.1.0 @date 2026-05-20
// Minimal ABI for NoKLockRecovery. Three surfaces:
//   • Owner self-service (any user): setGuardians, view own list/threshold
//   • Guardian-side: initiateRecovery, supportRecovery
//   • Lost-wallet self-cancel + anyone-can-execute after delay

export const recoveryAbi = [
  // Reads
  { type: "function", name: "DEFAULT_THRESHOLD", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "MAX_GUARDIANS", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "recoveryDelay", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
  { type: "function", name: "thresholdOf", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "getGuardians", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "isGuardian", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "candidate", type: "address" }], outputs: [{ type: "bool" }] },
  {
    type: "function",
    name: "getRequest",
    stateMutability: "view",
    inputs: [{ name: "lostWallet", type: "address" }],
    outputs: [
      { name: "oldTokenId", type: "uint256" },
      { name: "proposedNewWallet", type: "address" },
      { name: "voteCount", type: "uint8" },
      { name: "quorumMetAt", type: "uint64" },
      { name: "executableAfter", type: "uint64" },
      { name: "executed", type: "bool" },
      { name: "cancelled", type: "bool" },
    ],
  },

  // Writes — self-service (any user configures their own guardians)
  {
    type: "function", name: "setGuardians", stateMutability: "nonpayable",
    inputs: [{ name: "guardians_", type: "address[]" }, { name: "threshold_", type: "uint8" }],
    outputs: [],
  },

  // Writes — guardian initiates/supports
  {
    type: "function", name: "initiateRecovery", stateMutability: "nonpayable",
    inputs: [
      { name: "lostWallet", type: "address" },
      { name: "oldTokenId", type: "uint256" },
      { name: "proposedNewWallet", type: "address" },
      { name: "newTokenUri", type: "string" },
    ],
    outputs: [],
  },
  { type: "function", name: "supportRecovery", stateMutability: "nonpayable", inputs: [{ name: "lostWallet", type: "address" }], outputs: [] },

  // Writes — original wallet cancels; anyone executes after delay
  { type: "function", name: "cancelRecovery", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "executeRecovery", stateMutability: "nonpayable", inputs: [{ name: "lostWallet", type: "address" }], outputs: [] },

  // Events
  { type: "event", name: "GuardiansSet", inputs: [
    { name: "user", type: "address", indexed: true },
    { name: "guardians", type: "address[]", indexed: false },
    { name: "threshold", type: "uint8", indexed: false },
  ] },
  { type: "event", name: "RecoveryInitiated", inputs: [
    { name: "lostWallet", type: "address", indexed: true },
    { name: "oldTokenId", type: "uint256", indexed: true },
    { name: "proposedNewWallet", type: "address", indexed: true },
    { name: "firstVote", type: "uint8", indexed: false },
  ] },
  { type: "event", name: "RecoverySupported", inputs: [
    { name: "lostWallet", type: "address", indexed: true },
    { name: "guardian", type: "address", indexed: true },
    { name: "totalVotes", type: "uint8", indexed: false },
  ] },
  { type: "event", name: "RecoveryQuorumMet", inputs: [
    { name: "lostWallet", type: "address", indexed: true },
    { name: "quorumMetAt", type: "uint64", indexed: false },
    { name: "executableAfter", type: "uint64", indexed: false },
  ] },
  { type: "event", name: "RecoveryCancelled", inputs: [
    { name: "lostWallet", type: "address", indexed: true },
  ] },
  { type: "event", name: "RecoveryExecuted", inputs: [
    { name: "lostWallet", type: "address", indexed: true },
    { name: "oldTokenId", type: "uint256", indexed: true },
    { name: "newTokenId", type: "uint256", indexed: true },
    { name: "newNokWallet", type: "address", indexed: false },
  ] },
] as const;
