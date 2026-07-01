// Generates 2 fresh attestor private keys, writes them to a locked-down file,
// outputs ONLY the public addresses to stdout. Never prints PKs.
// Runs from apps/web so viem is resolvable. DELETE the output file after copying to cPanel.
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { writeFileSync, chmodSync } from 'node:fs';

const quorumKey = generatePrivateKey();
const ownerKey  = generatePrivateKey();
const quorumAddr = privateKeyToAccount(quorumKey).address;
const ownerAddr  = privateKeyToAccount(ownerKey).address;

const outPath = process.argv[2];
if (!outPath) throw new Error('Usage: node scripts/generate-attestor-keys.mjs <output-env-file>');

const env =
  '# NoKLock attestor keys generated 2026-06-01.\n' +
  '# Copy each line into cPanel Node app -> Variables, then DELETE this file.\n' +
  '# NEVER commit, NEVER share, NEVER paste into chat.\n' +
  '\n' +
  'QUORUM_ATTESTATION_PRIVATE_KEY=' + quorumKey + '\n' +
  'OWNER_SELF_RESTORE_ATTESTATION_PRIVATE_KEY=' + ownerKey + '\n';

writeFileSync(outPath, env);
try { chmodSync(outPath, 0o600); } catch { /* windows ACL — best-effort */ }

console.log(JSON.stringify({ quorumAddr, ownerAddr, file: outPath }, null, 2));
