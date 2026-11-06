// Fails if a built app (.ipa or .apk) carries no Google web client ID in its JS bundle (TASK-53).
// pnpm check:release reads a local export, bundled with the local shell's environment; an EAS build
// bundles on EAS's worker with the EAS environment instead. Build 8 passed every local check and still
// shipped without the ID, so GoogleSignin.configure() never ran and Continue with Google crashed iOS.
// This reads the bundle that actually ships. Run as `node tools/built-sign-in.ts <app.ipa|app.apk>`.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULE = {
  id: 'built-sign-in/no-web-client-id',
  summary: 'A real build must carry the Google web client ID in its JS bundle',
  why: 'Without it the app never calls GoogleSignin.configure(), so Continue with Google fails on Android and crashes on iOS (TASK-53).',
  fix: "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in the build profile's EAS environment (`eas env:list <environment>`), then rebuild.",
} as const;

/** Where each archive keeps the JS bundle Metro built (Hermes bytecode keeps string literals as plain bytes). */
export const BUNDLE_PATH: Readonly<Record<'ipa' | 'apk', string>> = {
  ipa: 'Payload/*.app/main.jsbundle',
  apk: 'assets/index.android.bundle',
};

const CLIENT_ID = /\d{6,}-[a-z0-9]{20,}\.apps\.googleusercontent\.com/g;

/** The distinct OAuth client IDs that appear in a bundle's text. */
export function clientIdsIn(bundle: string): string[] {
  return [...new Set(bundle.match(CLIENT_ID) ?? [])];
}

export function kindOf(file: string): 'ipa' | 'apk' | null {
  if (file.endsWith('.ipa')) return 'ipa';
  if (file.endsWith('.apk')) return 'apk';
  return null;
}

function main(args: readonly string[]): number {
  const file = args[0];
  const kind = file ? kindOf(file) : null;
  if (!file || !kind) {
    console.error('usage: node tools/built-sign-in.ts <app.ipa|app.apk>');
    return 2;
  }
  const bundle = execFileSync('unzip', ['-p', file, BUNDLE_PATH[kind]], { encoding: 'latin1', maxBuffer: 256 * 1024 * 1024 });
  if (bundle.length === 0) {
    console.error(`FAIL built-sign-in/no-bundle: ${file} has no ${BUNDLE_PATH[kind]}, so nothing was checked.`);
    return 1;
  }
  const ids = clientIdsIn(bundle);
  if (ids.length === 0) {
    console.error([`FAIL ${RULE.id}: ${RULE.summary}`, `  at ${file} (${BUNDLE_PATH[kind]})`, `  Why: ${RULE.why}`, `  Fix: ${RULE.fix}`].join('\n'));
    return 1;
  }
  console.log(`${file}: bundle carries Google client ID ${ids.join(', ')}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
