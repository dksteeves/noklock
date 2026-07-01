// @version 0.1.0 @date 2026-05-13
//
// BIP39 helpers — checksum-validates user input before it ever touches the
// rest of the pipeline. Wraps @scure/bip39 with English wordlist preselected.

import { validateMnemonic, mnemonicToEntropy, entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export function isValidBip39(mnemonic: string): boolean {
  try {
    const trimmed = mnemonic.trim().split(/\s+/).join(" ").toLowerCase();
    return validateMnemonic(trimmed, wordlist);
  } catch {
    return false;
  }
}

export function entropyOf(mnemonic: string): Uint8Array {
  const trimmed = mnemonic.trim().split(/\s+/).join(" ").toLowerCase();
  return mnemonicToEntropy(trimmed, wordlist);
}

export function entropyToWords(entropy: Uint8Array): string {
  return entropyToMnemonic(entropy, wordlist);
}

export function wordCount(mnemonic: string): number {
  return mnemonic.trim().split(/\s+/).filter(Boolean).length;
}
