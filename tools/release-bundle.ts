// Builds the app's JS bundles in development and in release mode and fails if development-only
// code is in a release bundle (R53, R64). Run as `node tools/release-bundle.ts` (pnpm check:release).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULE = {
  id: 'release-bundle/dev-code-in-release',
  req: 'R53, R64',
  summary: 'Development-only code must not be in a release bundle',
  why: 'The test sign-in is a second way into the app that skips Google sign-in, and the on-device Storybook is a tool. A release build that carries either gives a stranger a way in or ships a tool as part of the product.',
  fix: 'Load development code only through `if (__DEV__) { require(...) }` (apps/mobile/src/composition/load-dev.ts) so the bundler removes it. Do not import src/dev or .rnstorybook from code that release builds reach.',
};

/** Strings that only exist in development-only code. A release bundle containing one has leaked it. */
export const DEV_ONLY_MARKERS: readonly string[] = ['grocs-dev-tools-marker', 'signInWithTestAccount', 'grocs-storybook-marker'];

export function findLeaks(bundle: string, markers: readonly string[] = DEV_ONLY_MARKERS): string[] {
  return markers.filter((m) => bundle.includes(m));
}

export function formatLeak(platform: string, leaks: readonly string[]): string {
  return [
    `FAIL ${RULE.id} (${RULE.req}): ${RULE.summary}`,
    `  at ${platform} release bundle: contains ${leaks.map((l) => `"${l}"`).join(', ')}`,
    `  Why: ${RULE.why}`,
    `  Fix: ${RULE.fix}`,
  ].join('\n');
}

function bundlesIn(dir: string): { platform: string; text: string }[] {
  const out: { platform: string; text: string }[] = [];
  for (const platform of ['android', 'ios']) {
    const folder = join(dir, '_expo', 'static', 'js', platform);
    if (!existsSync(folder)) continue;
    for (const name of readdirSync(folder)) {
      const file = join(folder, name);
      if (statSync(file).isFile()) out.push({ platform, text: readFileSync(file, 'latin1') });
    }
  }
  return out;
}

function exportBundles(appDir: string, outDir: string, release: boolean): void {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const args = ['expo', 'export', '--platform', 'android', '--platform', 'ios', '--output-dir', outDir, '--no-bytecode', ...(release ? [] : ['--dev'])];
  execFileSync('pnpm', ['exec', ...args], {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1', NODE_ENV: release ? 'production' : 'development' },
  });
}

function main(): number {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const appDir = join(root, 'apps', 'mobile');
  const devOut = join(appDir, 'dist-dev');
  const releaseOut = join(appDir, 'dist-release');

  exportBundles(appDir, devOut, false);
  exportBundles(appDir, releaseOut, true);

  // The check must be able to fail: the development bundle has to contain the markers it looks for.
  const dev = bundlesIn(devOut);
  if (dev.length === 0 || !dev.every((b) => findLeaks(b.text, ['grocs-dev-tools-marker']).length === 1)) {
    console.error('FAIL release-bundle/blind: the development bundle does not contain the dev-tools marker, so this check could not detect a leak. Fix the marker or the export before trusting a pass.');
    return 1;
  }

  const release = bundlesIn(releaseOut);
  if (release.length === 0) {
    console.error('FAIL release-bundle/no-bundles: no release bundles were found, so nothing was checked.');
    return 1;
  }
  let failed = false;
  for (const bundle of release) {
    const leaks = findLeaks(bundle.text);
    if (leaks.length > 0) {
      failed = true;
      console.error(formatLeak(bundle.platform, leaks));
    }
  }
  if (!failed) console.log(`release bundles clean (${release.length} bundles, ${DEV_ONLY_MARKERS.length} markers)`);
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
