// Fails if a built app (.ipa or .apk) carries no Google web client ID in its JS bundle (TASK-53).
// pnpm check:release reads a local export, bundled with the local shell's environment; an EAS build
// bundles on EAS's worker with the EAS environment instead. Build 8 passed every local check and still
// shipped without the ID, so GoogleSignin.configure() never ran and Continue with Google crashed iOS.
// This reads the bundle that actually ships. Run as `node tools/built-sign-in.ts <app.ipa|app.apk>`.
// With EXPECTED_GOOGLE_WEB_CLIENT_ID set it requires that exact ID (TASK-54): any other Google client ID
// in the bundle is not the one GoogleSignin.configure() needs. In CI the expected ID is required.
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

export const WRONG_ID_RULE = {
  id: 'built-sign-in/wrong-web-client-id',
  summary: 'A real build must carry the web client ID of the EAS environment it was built from',
  why: 'Another Google client ID (an iOS or Android OAuth client, or a stale one) is not what GoogleSignin.configure() needs, so Firebase rejects the token or Android fails with DEVELOPER_ERROR (TASK-54).',
  fix: "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in the build profile's EAS environment to the client_type 3 web client from google-services.json, then rebuild.",
} as const;

export const NO_EXPECTED_RULE = {
  id: 'built-sign-in/no-expected-id',
  summary: 'In CI the check must be told which web client ID to expect',
  why: 'Without it the check accepts any Google client ID, which is the gap TASK-54 closed.',
  fix: 'Set EXPECTED_GOOGLE_WEB_CLIENT_ID from `eas env:get <environment> --variable-name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` before this step (release.yml does).',
} as const;

type Rule = { readonly id: string; readonly summary: string; readonly why: string; readonly fix: string };
export type Verdict = { readonly ok: true; readonly note: string } | { readonly ok: false; readonly rule: Rule; readonly found: readonly string[] };

/** Decide the check from the IDs found, the ID the build should carry (if known), and whether this is CI. */
export function verdict(ids: readonly string[], expected: string | undefined, inCi: boolean): Verdict {
  if (inCi && !expected) return { ok: false, rule: NO_EXPECTED_RULE, found: ids };
  if (ids.length === 0) return { ok: false, rule: RULE, found: ids };
  if (expected && !ids.includes(expected)) return { ok: false, rule: WRONG_ID_RULE, found: ids };
  return { ok: true, note: expected ? `carries the expected web client ID ${expected}` : `carries Google client ID ${ids.join(', ')} (no expected ID given)` };
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
  const result = verdict(clientIdsIn(bundle), process.env['EXPECTED_GOOGLE_WEB_CLIENT_ID'] || undefined, Boolean(process.env['CI']));
  if (!result.ok) {
    const { rule, found } = result;
    console.error(
      [`FAIL ${rule.id}: ${rule.summary}`, `  at ${file} (${BUNDLE_PATH[kind]}), found: ${found.join(', ') || 'none'}`, `  Why: ${rule.why}`, `  Fix: ${rule.fix}`].join('\n'),
    );
    return 1;
  }
  console.log(`${file}: bundle ${result.note}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
