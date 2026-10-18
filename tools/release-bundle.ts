// Builds the app's JS bundles in development and in release mode and fails if a module under a
// development-only path or testing entry reaches a release bundle (R53, R64). The check reads the
// real module graph Metro built for that bundle, from the bundle's own sourcemap, so it catches
// dev code by where it lives, not by matching text the dev code happens to contain today.
// Run as `node tools/release-bundle.ts` (pnpm check:release).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RULE = {
  id: 'release-bundle/dev-code-in-release',
  req: 'R53, R64',
  summary: 'Development-only code must not be in a release bundle',
  why: 'The test sign-in is a second way into the app that skips Google sign-in, and the on-device Storybook is a tool. A release build that carries either gives a stranger a way in or ships a tool as part of the product.',
  fix: 'Load development code only through `if (__DEV__) { require(...) }` (apps/mobile/src/composition/load-dev.ts) so the bundler removes it. Do not import src/dev, .rnstorybook, or a package\'s testing/ subpath from code a release build reaches.',
};

/** The `__DEV__`-gated tools (apps/mobile/src/composition/load-dev.ts) whose removal from a release bundle is the thing this whole check exists to prove (R53). Named separately so the "blind" self-check below can require this one specifically, not any pattern in the table. */
export const DEV_TOOLS_PATH = { re: /^\/?apps\/mobile\/src\/dev\//, what: 'the on-device dev tools and test sign-in (apps/mobile/src/dev/)' };

/**
 * Paths and filenames, relative to the repo root, that a release bundle must never reach (R53,
 * R64, doc-1's repository layout). Matched against the module paths Metro actually bundled, not
 * their contents, so a renamed export or a differently-named file under one of these still fails.
 */
export const DEV_ONLY_PATH: readonly { re: RegExp; what: string }[] = [
  DEV_TOOLS_PATH,
  { re: /^\/?apps\/mobile\/\.rnstorybook\//, what: 'the on-device Storybook route (apps/mobile/.rnstorybook/)' },
  { re: /^\/?packages\/[^/]+\/src\/testing\//, what: "a package's testing/ subpath (fakes and contract suites, @grocs/*/testing)" },
  // Backstop for import-layers/testing-entry-test-only: a test or story file should never reach a
  // bundle regardless of which directory it sits in.
  { re: /\.(test|spec|stories)\.[cm]?[tj]sx?$/, what: 'a test or story file, which is never shipped' },
];

export function findDevModules(
  sources: readonly string[],
  patterns: readonly { re: RegExp; what: string }[] = DEV_ONLY_PATH,
): { source: string; what: string }[] {
  const out: { source: string; what: string }[] = [];
  for (const source of sources) {
    const hit = patterns.find((p) => p.re.test(source));
    if (hit) out.push({ source, what: hit.what });
  }
  return out;
}

export function formatLeak(platform: string, leaks: readonly { source: string; what: string }[]): string {
  return [
    `FAIL ${RULE.id} (${RULE.req}): ${RULE.summary}`,
    `  at ${platform} release bundle:`,
    ...leaks.map((l) => `    ${l.source} (${l.what})`),
    `  Why: ${RULE.why}`,
    `  Fix: ${RULE.fix}`,
  ].join('\n');
}

interface SourceMap {
  readonly sources?: readonly string[];
  readonly sections?: readonly { readonly map: SourceMap }[];
}

/** A Metro sourcemap is a flat map or an indexed map whose sections each hold their own map. */
export function sourcesOf(map: SourceMap): string[] {
  if (map.sections) return map.sections.flatMap((s) => sourcesOf(s.map));
  return [...(map.sources ?? [])];
}

interface Bundle {
  readonly platform: string;
  readonly sources: readonly string[];
}

function bundlesIn(dir: string): Bundle[] {
  const out: Bundle[] = [];
  for (const platform of ['android', 'ios']) {
    const folder = join(dir, '_expo', 'static', 'js', platform);
    if (!existsSync(folder)) continue;
    for (const name of readdirSync(folder)) {
      if (!name.endsWith('.map')) continue;
      const file = join(folder, name);
      if (!statSync(file).isFile()) continue;
      out.push({ platform, sources: sourcesOf(JSON.parse(readFileSync(file, 'utf8')) as SourceMap) });
    }
  }
  return out;
}

function exportBundles(appDir: string, outDir: string, release: boolean): void {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const args = [
    'expo',
    'export',
    '--platform',
    'android',
    '--platform',
    'ios',
    '--output-dir',
    outDir,
    '--no-bytecode',
    '--source-maps',
    'external',
    ...(release ? [] : ['--dev']),
  ];
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

  // The development bundle exists only to prove this detector can see dev code at all: it is
  // exported with __DEV__ true, so apps/mobile/src/composition/load-dev.ts's require executes and
  // apps/mobile/src/dev/ is expected to be in it. That is not a leak; it is this check's own test.
  exportBundles(appDir, devOut, false);
  exportBundles(appDir, releaseOut, true);

  // The check must be able to fail: every bundle's sourcemap must carry real module sources, and
  // the development bundle must specifically reach apps/mobile/src/dev/, or this check would pass
  // blind (e.g. because a Metro upgrade changed the sourcemap shape and sourcesOf() silently read
  // nothing). Requiring the dev-tools pattern by name, not any pattern in the table, means a stray
  // test or story file reaching the dev bundle can't stand in for the thing actually under test.
  const dev = bundlesIn(devOut);
  if (dev.length === 0 || dev.some((b) => b.sources.length === 0)) {
    console.error(
      "FAIL release-bundle/blind: a development bundle's sourcemap has no module sources, so this check could not see what was bundled. Fix the export before trusting a pass.",
    );
    return 1;
  }
  if (!dev.every((b) => findDevModules(b.sources, [DEV_TOOLS_PATH]).length > 0)) {
    console.error(
      'FAIL release-bundle/blind: a development bundle does not reach apps/mobile/src/dev/, so this check could not detect a leak. Fix apps/mobile/src/composition/load-dev.ts or the export before trusting a pass.',
    );
    return 1;
  }

  const release = bundlesIn(releaseOut);
  if (release.length === 0 || release.some((b) => b.sources.length === 0)) {
    console.error('FAIL release-bundle/no-bundles: a release bundle has no sourcemap sources, so nothing was checked.');
    return 1;
  }
  let failed = false;
  for (const bundle of release) {
    const leaks = findDevModules(bundle.sources);
    if (leaks.length > 0) {
      failed = true;
      console.error(formatLeak(bundle.platform, leaks));
    }
  }
  if (!failed) console.log(`release bundles clean (${release.length} bundles, ${DEV_ONLY_PATH.length} dev-only path patterns)`);
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
