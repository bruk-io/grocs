// Builds the app's JS bundles in development and in release mode and fails if a module under a
// development-only path or testing entry reaches a release bundle (R53, R64). The check reads the
// real module graph Metro built for that bundle, from the bundle's own sourcemap, so it catches
// dev code by where it lives, not by matching text the dev code happens to contain today.
// Run as `node tools/release-bundle.ts` (pnpm check:release).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Rule {
  readonly id: string;
  readonly req: string;
  readonly summary: string;
  readonly why: string;
  readonly fix: string;
}

export const RULE: Rule = {
  id: 'release-bundle/dev-code-in-release',
  req: 'R53, R64',
  summary: 'Development-only code must not be in a release bundle',
  why: 'The test sign-in is a second way into the app that skips Google sign-in, and the on-device Storybook is a tool. A release build that carries either gives a stranger a way in or ships a tool as part of the product.',
  fix: 'Load development code only through `if (__DEV__) { require(...) }` (apps/mobile/src/composition/load-dev.ts) so the bundler removes it. Do not import src/dev, .rnstorybook, or a package\'s testing/ subpath from code a release build reaches.',
};

export const FAKE_RULE: Rule = {
  id: 'release-bundle/test-fake-in-release',
  req: 'R48, R49, R53',
  summary: 'A test fake or test-support module must not be in a release bundle',
  why: "A fake auth signs anyone in and a fake sync store keeps data nowhere. The main entry of @grocs/ports carries interfaces alone so that none reaches a release build; one that does is a sign-in that checks nothing or a store that loses the household's data.",
  fix: "Import fakes only from *.test.ts files, through `@grocs/ports/testing` or a package's testing/ subpath (import-layers/testing-entry-test-only). Shipped code that needs an in-memory port uses a provider, packages/providers-memory (decision-12).",
};

export const CONTRACT_RULE: Rule = {
  id: 'release-bundle/contract-suite-in-release',
  req: 'R48, R53',
  summary: 'A port contract suite must not be in a release bundle',
  why: 'A contract suite is test code that drives a port through a test runner and is run against the fakes. Shipping one ships a test harness, and the fakes it exports with it.',
  fix: 'Run contract suites only from *.test.ts files. Do not import contract.ts, or a `@grocs/*/testing` entry that re-exports it, from code a release build reaches.',
};

export const DEMO_RULE: Rule = {
  id: 'release-bundle/demo-in-release',
  req: 'decision-12',
  summary: 'The demo composition and the in-memory provider must not be in a real release bundle',
  why: "The demo signs in a fixed member with no credentials and keeps data only on the phone. It exists for the demo variant alone; in a real release it is a sign-in that skips Google and a store that is not the household's.",
  fix: "Choose the demo composition only in the demo variant's entry point, never in code the real build reaches. Do not import apps/mobile/src/demo or @grocs/providers-memory from the real composition.",
};

/** One path pattern a release bundle must never reach. */
export interface DevPattern {
  readonly re: RegExp;
  readonly what: string;
  /** The rule a leak is reported under. Defaults to RULE. */
  readonly rule?: Rule;
  /**
   * Root-relative folder where code for this pattern is meant to live but may not exist yet (another
   * task is building it). While the folder holds no files the pattern may match nothing; once a file
   * appears there, the pattern must match it (see blindSpots).
   */
  readonly home?: string;
}

/** The `__DEV__`-gated tools (apps/mobile/src/composition/load-dev.ts) whose removal from a release bundle is the thing this whole check exists to prove (R53). Named separately so the "blind" self-check below can require this one specifically, not any pattern in the table. */
export const DEV_TOOLS_PATH: DevPattern = { re: /^\/?apps\/mobile\/src\/dev\//, what: 'the on-device dev tools and test sign-in (apps/mobile/src/dev/)' };

// Our own code only: a third-party module in node_modules with "fake" or "contract" in its name is not ours.
const OURS = String.raw`^\/?(?:apps|packages)\/(?!(?:.*\/)?node_modules\/)`;

/**
 * Paths and filenames, relative to the repo root, that a release bundle must never reach (R53,
 * R64, doc-1's repository layout, decision-12). Matched against the module paths Metro actually
 * bundled, not their contents, so a renamed export or a differently-named file under one of these
 * still fails.
 */
export const DEV_ONLY_PATH: readonly DevPattern[] = [
  DEV_TOOLS_PATH,
  { re: /^\/?apps\/mobile\/\.rnstorybook\//, what: 'the on-device Storybook route (apps/mobile/.rnstorybook/)', home: 'apps/mobile/.rnstorybook' },
  { re: /^\/?packages\/[^/]+\/src\/testing\//, what: "a package's testing/ subpath (fakes and contract suites, @grocs/*/testing)" },
  // Backstop for import-layers/testing-entry-test-only: a test or story file should never reach a
  // bundle regardless of which directory it sits in.
  { re: /\.(test|spec|stories)\.[cm]?[tj]sx?$/, what: 'a test or story file, which is never shipped' },
  // The fakes sit beside their ports (packages/ports/src/auth/fake.ts), not in a testing/ folder,
  // so the patterns above never saw them. A module with "fake" in its name is one.
  {
    re: new RegExp(String.raw`${OURS}(?:.*\/)?[^/]*fake[^/]*$`, 'i'),
    what: 'a test fake (fake.ts, or any file with "fake" in its name)',
    rule: FAKE_RULE,
  },
  // The testing entries are files, not testing/ folders: "@grocs/ports/testing" resolves to
  // packages/ports/src/test-support.ts, which re-exports src/testing.ts.
  {
    re: /^\/?(?:packages\/[^/]+\/src\/(?:test-support|testing)(?:\.[^/]+)?|apps\/mobile\/testing\/.*)$/,
    what: 'a test-support or testing entry (src/test-support.ts, src/testing.ts, apps/mobile/testing/)',
    rule: FAKE_RULE,
  },
  {
    re: new RegExp(String.raw`${OURS}(?:.*\/)?(?:[^/]*[.-])?contracts?(?:[.-][^/]*)?$`, 'i'),
    what: 'a port contract suite (contract.ts, *.contract.ts)',
    rule: CONTRACT_RULE,
  },
  // Built by other tasks (decision-12), so the folders may not exist yet; see DevPattern.home.
  { re: /^\/?apps\/mobile\/src\/demo\//, what: 'the demo composition (apps/mobile/src/demo/)', rule: DEMO_RULE, home: 'apps/mobile/src/demo' },
  { re: /^\/?packages\/providers-memory\//, what: 'the in-memory provider (packages/providers-memory/)', rule: DEMO_RULE, home: 'packages/providers-memory' },
];

export interface Leak {
  readonly source: string;
  readonly what: string;
  readonly rule?: Rule;
}

export function findDevModules(sources: readonly string[], patterns: readonly DevPattern[] = DEV_ONLY_PATH): Leak[] {
  const out: Leak[] = [];
  for (const source of sources) {
    const hit = patterns.find((p) => p.re.test(source));
    if (hit) out.push({ source, what: hit.what, ...(hit.rule ? { rule: hit.rule } : {}) });
  }
  return out;
}

/** Marks demo or in-memory code wherever it is put: a demo/demos name, "in-memory", "inmemory", providers-memory. */
const DEMO_NAME = /(?:^|[/._-])demos?(?:[/._-]|$)|in-?memory|providers-memory/i;

/**
 * Why this check might be blind, judged over the repo's own files (root-relative). The dev-bundle
 * self-check proves the bundle's path format and apps/mobile/src/dev/. It cannot prove the patterns
 * for code that is in no bundle this script builds: the fakes are in none, and the demo code is
 * built by other tasks. So the patterns are held against the files on disk:
 *  - a pattern must match at least one file, unless it declares a home that holds no files yet;
 *  - every file under a pattern's home must be matched by some pattern (the home is spelled as a
 *    path and the pattern as a regex, so a typo in either leaves files unmatched);
 *  - a file with a demo or in-memory name must be matched by some pattern, so code moved somewhere
 *    neither spelling expected is caught, while a folder that does not exist yet fails nothing.
 */
export function blindSpots(files: readonly string[], patterns: readonly DevPattern[] = DEV_ONLY_PATH): string[] {
  const paths = files.map((f) => `/${f.replace(/^\/+/, '')}`);
  const matchedByAny = (f: string) => patterns.some((p) => p.re.test(f));
  const out: string[] = [];
  for (const p of patterns) {
    if (paths.some((f) => p.re.test(f))) continue;
    if (p.home !== undefined && !paths.some((f) => f.startsWith(`/${p.home}/`))) continue;
    out.push(`the pattern for ${p.what} matches no file in the repo (${String(p.re)}), so it could not detect a leak`);
  }
  for (const p of patterns) {
    if (p.home === undefined) continue;
    const unmatched = paths.filter((f) => f.startsWith(`/${p.home}/`) && !matchedByAny(f));
    if (unmatched.length > 0) out.push(`files under ${p.home}/ that no pattern matches, so a leak of them would pass: ${unmatched.slice(0, 5).join(', ')}`);
  }
  const named = paths.filter((f) => /^\/(?:apps|packages)\//.test(f) && DEMO_NAME.test(f) && !matchedByAny(f));
  if (named.length > 0) out.push(`files that look like demo or in-memory code that no pattern matches, so a leak of them would pass: ${named.slice(0, 5).join(', ')}`);
  return out;
}

export function formatLeak(platform: string, leaks: readonly Leak[]): string {
  const byRule = new Map<Rule, Leak[]>();
  for (const leak of leaks) {
    const rule = leak.rule ?? RULE;
    byRule.set(rule, [...(byRule.get(rule) ?? []), leak]);
  }
  return [...byRule]
    .map(([rule, group]) =>
      [
        `FAIL ${rule.id} (${rule.req}): ${rule.summary}`,
        `  at ${platform} release bundle:`,
        ...group.map((l) => `    ${l.source} (${l.what})`),
        `  Why: ${rule.why}`,
        `  Fix: ${rule.fix}`,
      ].join('\n'),
    )
    .join('\n');
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

/** The repo's own source files, root-relative: tracked plus new untracked ones, so a file being written is seen too. */
function repoFiles(root: string): string[] {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', 'apps', 'packages'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter((f) => f !== '' && existsSync(join(root, f)));
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

  // The fakes are in no bundle and the demo code does not exist yet, so the dev bundle cannot prove
  // those patterns. Hold every pattern against the repo's own files instead (see blindSpots).
  const blind = blindSpots(repoFiles(root));
  if (blind.length > 0) {
    for (const reason of blind) console.error(`FAIL release-bundle/blind: ${reason}. Fix the pattern in tools/release-bundle.ts before trusting a pass.`);
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
  if (!failed) console.log(`release bundles clean (${release.length} bundles, ${DEV_ONLY_PATH.length} release-barred path patterns)`);
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
