// @version 0.1.0 @date 2026-05-21
// Wallet-connect-time Terms gate state. Daniel 2026-05-21: "at the time
// of wallet connect first time or some such appropriate juncture the user
// needs to be taken to the terms page and be forced to scroll through it
// to the bottom before accepting".
//
// Storage key includes a version so we can force re-acceptance if Terms
// materially change. Bump TERMS_VERSION below + LocalStorage key tail.
// Old acceptances become invalid; user must re-read + re-accept.
//
// What's recorded: which checkboxes the user explicitly ticked + when.
// We do NOT phone home with this — it lives only in their browser, like
// every other settings flag. The legal contract is signed by their
// click+tick action on their own device; we just remember they did it
// so we don't badger them on every wallet-connect.

export const TERMS_VERSION = "v1";
const STORAGE_KEY = `noklock.terms-accepted-${TERMS_VERSION}`;

export interface TermsAcceptance {
  readonly version: string;
  readonly acceptedAt: number;       // unix ms
  readonly walletAddress: string;    // the wallet that was connected at accept time (lower-case)
  readonly noLiability: boolean;
  readonly userResponsibilityTest: boolean;
  readonly independentBackups: boolean;
}

export function readTermsAcceptance(): TermsAcceptance | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TermsAcceptance;
    if (parsed.version !== TERMS_VERSION) return null;
    // All three must be true for the acceptance to count.
    if (!parsed.noLiability || !parsed.userResponsibilityTest || !parsed.independentBackups) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeTermsAcceptance(walletAddress: string): TermsAcceptance {
  const acc: TermsAcceptance = {
    version: TERMS_VERSION,
    acceptedAt: Date.now(),
    walletAddress: walletAddress.toLowerCase(),
    noLiability: true,
    userResponsibilityTest: true,
    independentBackups: true,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(acc));
  } catch {
    // Storage full or blocked — best-effort. The user will be re-prompted
    // next session, which is the conservative outcome.
  }
  return acc;
}

export function clearTermsAcceptance(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
