// Builds the demo variant's JS bundles (APP_VARIANT=demo, EXPO_PUBLIC_APP_VARIANT=demo, the same
// release flags as tools/release-bundle.ts) and fails if Firebase code reaches them (TASK-10.4).
//
// check:release judges the real build and cannot judge this one: the demo bundle legitimately holds
// apps/mobile/src/demo and the in-memory provider, which that check bars. The demo APK is built
// without google-services.json, so the opposite must hold here: no @react-native-firebase, no web
// Firebase SDK, no Firebase provider and no native composition, or the app would call native code
// the APK does not carry. The check reads the module graph Metro built, from the bundle's sourcemap.
// Run as `node tools/demo-bundle.ts` (pnpm check:demo).
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundlesIn, exportBundles } from './release-bundle.ts';

export interface Pattern {
  readonly re: RegExp;
  readonly what: string;
}

/** Module paths the demo bundle must never reach. */
export const FIREBASE_PATH: readonly Pattern[] = [
  { re: /(?:^|\/)node_modules\/@react-native-firebase\//, what: 'a React Native Firebase package (native module, needs google-services.json)' },
  { re: /(?:^|\/)node_modules\/@firebase\//, what: 'the Firebase web SDK (@firebase/*)' },
  { re: /(?:^|\/)node_modules\/firebase\//, what: 'the Firebase web SDK (firebase)' },
  { re: /^\/?packages\/providers-firebase\//, what: 'the Firebase provider (packages/providers-firebase/)' },
  { re: /^\/?apps\/mobile\/src\/composition\/(?:native|compose-firebase)\.ts$/, what: 'the native Firebase composition (apps/mobile/src/composition/)' },
];

/** Module paths the demo bundle must reach, or the check could not tell a clean demo from a bundle of the wrong app. */
export const DEMO_PATH: readonly Pattern[] = [
  { re: /^\/?apps\/mobile\/src\/demo\/compose-demo\.ts$/, what: 'the demo composition (apps/mobile/src/demo/)' },
  { re: /^\/?packages\/providers-memory\//, what: 'the in-memory provider (packages/providers-memory/)' },
];

/** The sources that match a pattern, deduplicated and in order, each with what it is. */
export function firebaseModules(sources: readonly string[], patterns: readonly Pattern[] = FIREBASE_PATH): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const source of sources) {
    const hit = patterns.find((p) => p.re.test(source));
    if (!hit || seen.has(source)) continue;
    seen.add(source);
    out.push(`${source} (${hit.what})`);
  }
  return out;
}

/** What is wrong with one platform's demo bundle, as printable lines; empty when it is clean and is the demo. */
export function judgeDemoBundle(platform: string, sources: readonly string[]): string[] {
  if (sources.length === 0) {
    return [`FAIL demo-bundle/blind: the ${platform} demo bundle's sourcemap has no module sources, so nothing was checked. Fix the export before trusting a pass.`];
  }
  const missing = DEMO_PATH.filter((p) => !sources.some((s) => p.re.test(s)));
  if (missing.length > 0) {
    return [
      `FAIL demo-bundle/not-the-demo: the ${platform} demo bundle does not reach ${missing.map((p) => p.what).join(' or ')}. ` +
        'APP_VARIANT and EXPO_PUBLIC_APP_VARIANT must both be "demo" (apps/mobile/src/composition/create-app.ts), or this check is not looking at the demo.',
    ];
  }
  const leaks = firebaseModules(sources);
  if (leaks.length === 0) return [];
  return [
    `FAIL demo-bundle/firebase-in-demo: Firebase code is in the ${platform} demo bundle:`,
    ...leaks.map((l) => `    ${l}`),
    '  Why: the demo APK is built without google-services.json and without the Firebase native modules, so Firebase code in its bundle crashes the app at launch or links it to a project it must not know.',
    '  Fix: reach Firebase only through apps/mobile/src/composition/create-app.ts (the build-time gate on EXPO_PUBLIC_APP_VARIANT). Do not import @react-native-firebase, firebase, @grocs/providers-firebase or composition/native.ts from code the demo reaches.',
  ];
}

function main(): number {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const appDir = join(root, 'apps', 'mobile');
  const out = join(appDir, 'dist-demo');
  exportBundles(appDir, out, true, { APP_VARIANT: 'demo', EXPO_PUBLIC_APP_VARIANT: 'demo' });
  const bundles = bundlesIn(out);
  if (bundles.length === 0) {
    console.error('FAIL demo-bundle/no-bundles: the demo export wrote no sourcemaps, so nothing was checked.');
    return 1;
  }
  const problems = bundles.flatMap((b) => judgeDemoBundle(b.platform, b.sources));
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    return 1;
  }
  console.log(`demo bundles hold no Firebase code (${bundles.length} bundles, ${FIREBASE_PATH.length} barred path patterns)`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
