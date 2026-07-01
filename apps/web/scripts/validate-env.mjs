// validate-env.mjs — build-time guard for VITE_OFFCHAIN_ADMIN_ADDRESSES.
//
// Why: A typo in this env var (missing 0x, trailing comma, whitespace,
// truncated hex) silently disables the offchain-admin fast-path in
// OwnerOnly / PartnerAccessGate at runtime — Treasury wallet hits the
// regular "Verifying access…" path with no signal back to the operator
// that the env was malformed. Per DANIEL-HANDOFF-2026-06-07 §2.4.
//
// What: Reads .env, .env.production, .env.local (whichever exist). For
// every comma-separated entry of VITE_OFFCHAIN_ADMIN_ADDRESSES, trim()
// + toLowerCase() the entry FIRST, then assert it matches
// /^0x[a-f0-9]{40}$/. Lowercase-before-regex is load-bearing — it lets
// checksum-mixed-case addresses Daniel pastes from Trust Wallet survive
// validation (same ordering as the runtime parser in
// `lib/offchainAdmins.ts` once §2.3 lands).
//
// On any malformed entry: console.error with the bad value + the file
// it came from + the surrounding hint, then process.exitCode = 1 so the
// build fails. Wired into `prebuild` so it gates `vite build`.
//
// No new dependencies — node:fs / node:path / node:url only.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

const ENV_FILES = [".env", ".env.production", ".env.local"];
const TARGET_KEY = "VITE_OFFCHAIN_ADMIN_ADDRESSES";
const ADDRESS_RE = /^0x[a-f0-9]{40}$/;

// Minimal dotenv-style parser. Handles KEY=value lines + #comments +
// blank lines + optional surrounding single/double quotes. Does NOT
// handle multi-line values or variable interpolation — neither are
// expected in the NoKLock .env files. If that changes, switch to the
// dotenv package.
function parseEnvFile(absPath) {
  const contents = readFileSync(absPath, "utf8");
  const out = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present.
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function validateAddressList(raw, sourceFile) {
  // Empty / unset is allowed — the offchain-admin fast-path is opt-in.
  if (raw === undefined || raw === null || raw === "") return [];

  const errors = [];
  const entries = raw.split(",");
  entries.forEach((entry, idx) => {
    const normalised = entry.trim().toLowerCase();
    // Allow an empty trailing slot (e.g. trailing comma) to be flagged
    // explicitly rather than silently dropped — that has bitten before.
    if (normalised === "") {
      errors.push(
        `[${sourceFile}] ${TARGET_KEY} entry #${idx + 1} is empty (trailing comma or doubled comma?). Raw value: "${entry}"`
      );
      return;
    }
    if (!ADDRESS_RE.test(normalised)) {
      errors.push(
        `[${sourceFile}] ${TARGET_KEY} entry #${idx + 1} is not a valid 0x + 40-hex address. Raw value: "${entry}" (normalised: "${normalised}")`
      );
    }
  });
  return errors;
}

// Allow callers to pass an inline override for ad-hoc testing without
// touching .env: `node scripts/validate-env.mjs --inline=0xDEADBEEF`.
// Useful for verifying the script fails on a deliberately bad entry.
function parseInlineOverride() {
  const flag = process.argv.find((a) => a.startsWith("--inline="));
  if (!flag) return null;
  return flag.slice("--inline=".length);
}

function main() {
  const inline = parseInlineOverride();
  let totalErrors = [];

  if (inline !== null) {
    const errs = validateAddressList(inline, "<inline override>");
    totalErrors = totalErrors.concat(errs);
  } else {
    let foundAny = false;
    for (const fname of ENV_FILES) {
      const abs = join(webRoot, fname);
      if (!existsSync(abs)) continue;
      const parsed = parseEnvFile(abs);
      if (TARGET_KEY in parsed) {
        foundAny = true;
        const errs = validateAddressList(parsed[TARGET_KEY], fname);
        totalErrors = totalErrors.concat(errs);
      }
    }
    if (!foundAny) {
      // Not an error — the var is optional. Just note it.
      console.log(
        `validate-env: ${TARGET_KEY} not present in any of ${ENV_FILES.join(", ")} — offchain-admin fast-path will be disabled at runtime (this is fine if intentional).`
      );
    }
  }

  if (totalErrors.length > 0) {
    console.error("validate-env: FAIL");
    for (const e of totalErrors) console.error("  " + e);
    console.error(
      `\nFix: each entry of ${TARGET_KEY} must be a 0x-prefixed 40-hex Ethereum address. Checksum-mixed-case is fine (we lowercase before validating). Separate multiple addresses with commas; no trailing comma; no whitespace inside an entry.`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`validate-env: OK — ${TARGET_KEY} entries valid (or unset).`);
}

main();
