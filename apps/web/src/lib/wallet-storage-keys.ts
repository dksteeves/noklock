// @version 0.1.0 @date 2026-06-03
// 0.1.0 — LOW-2 (post-launch audit): centralise the two cross-module wallet
//         localStorage keys that walletSession.ts and track.ts both read so
//         they cannot drift apart. Before this file, each module hard-coded
//         the strings with paired "DO NOT RENAME without updating the other"
//         comments (F-13 audit, 2026-06-01). That worked but relied on the
//         next developer reading the comment — a foot-gun. Now both modules
//         import the constants from here; rename either string in ONE place
//         and both consumers update atomically.
//
// CROSS-MODULE READ/WRITE CONTRACT:
//   * HAD_WALLET_KEY
//       - WRITTEN by  src/hooks/walletSession.ts (rememberHadWallet, on
//         every successful wagmi connect).
//       - CLEARED by  src/hooks/walletSession.ts (markWalletDisconnected, on
//         explicit user Disconnect).
//       - READ by     src/hooks/walletSession.ts (hasHadWallet, the wallet
//         reconnect gate).
//       Stores the literal string "1" when the browser has ever held a
//       connected wallet. Decides reconnect-and-wait vs. show-connect-prompt
//       on cold load.
//
//   * ADDR_KEY
//       - WRITTEN by  src/lib/track.ts (rememberConnectedWallet, called from
//         TopNav whenever the wagmi account changes).
//       - CLEARED by  src/lib/track.ts (forgetConnectedWallet, on explicit
//         disconnect).
//       - READ by     src/lib/track.ts (getConnectedWalletLower, for the
//         analytics admin/treasury exclude-list match).
//       - READ by     src/hooks/walletSession.ts (hasHadWallet fallback —
//         lets the reconnect gate engage on cold load BEFORE
//         WalletSessionDriver has had a chance to stamp HAD_WALLET_KEY).
//       Stores a lowercase 0x-prefixed Ethereum address.
//
// Both strings are stable contracts with the user's browser localStorage —
// renaming either WILL silently wipe the corresponding signal on the next
// load and degrade the reconnect UX / analytics-exclusion. If you must
// rename, do it in this file and ship the change in a single deploy.

/** localStorage key: "1" when this browser has ever held a connected wallet.
 *  Set by walletSession.ts on connect, cleared on explicit Disconnect. */
export const HAD_WALLET_KEY = "noklock.had-wallet";

/** localStorage key: lowercase 0x-prefixed address of the currently connected
 *  wallet. Written by track.ts (from TopNav) on every account change; cleared
 *  on explicit disconnect. Used by track.ts for analytics exclusion AND read
 *  as a fallback signal by walletSession.ts → hasHadWallet(). */
export const ADDR_KEY = "noklock.addr";
