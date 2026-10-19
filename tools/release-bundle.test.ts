import { describe, expect, it } from 'vitest';
import {
  blindSpots,
  CONTRACT_RULE,
  DEMO_RULE,
  DEV_ONLY_PATH,
  DEV_TOOLS_PATH,
  FAKE_RULE,
  findDevModules,
  formatLeak,
  RULE,
  sourcesOf,
} from './release-bundle.ts';

describe('release bundle dev-path detection', () => {
  it('finds every dev-only source present, by path, and leaves legitimate sources alone', () => {
    const sources = [
      '/apps/mobile/src/dev/index.ts',
      '/apps/mobile/.rnstorybook/preview.ts',
      '/packages/ports/src/testing/fake.ts',
      '/packages/application/src/commands/add-item.test.ts',
      '/apps/mobile/src/composition/compose-app.ts',
      '/packages/core/src/model/item.ts',
    ];
    const leaks = findDevModules(sources);
    expect(leaks.map((l) => l.source)).toEqual([
      '/apps/mobile/src/dev/index.ts',
      '/apps/mobile/.rnstorybook/preview.ts',
      '/packages/ports/src/testing/fake.ts',
      '/packages/application/src/commands/add-item.test.ts',
    ]);
  });

  it('catches a renamed or newly added file under a dev-only path, by its path alone', () => {
    // Nothing here names a known marker string; detection must still fire on the path.
    expect(findDevModules(['/apps/mobile/src/dev/totally-renamed-thing.ts'])).toHaveLength(1);
    expect(findDevModules(['/packages/providers-firebase/src/testing/another-new-fake.ts'])).toHaveLength(1);
  });

  it('passes sources with nothing under a dev-only path', () => {
    expect(findDevModules(['/apps/mobile/app/index.tsx', '/packages/core/src/index.ts', '__prelude__'])).toEqual([]);
  });

  it('names the rule, the offending source and the reason when it fails', () => {
    const message = formatLeak('android', [{ source: '/apps/mobile/src/dev/index.ts', what: 'the on-device dev tools' }]);
    expect(message).toContain('release-bundle/dev-code-in-release');
    expect(message).toContain('R53');
    expect(message).toContain('/apps/mobile/src/dev/index.ts');
    expect(message).toMatch(/Why: .*second way into the app/);
    expect(message).toMatch(/Fix: .*__DEV__/);
  });

  it('keeps patterns for every dev-only path the acceptance criterion names', () => {
    const matches = (s: string) => DEV_ONLY_PATH.some((p) => p.re.test(s));
    expect(matches('/apps/mobile/src/dev/anything.ts')).toBe(true);
    expect(matches('/apps/mobile/.rnstorybook/anything.ts')).toBe(true);
    expect(matches('/packages/core/src/testing/anything.ts')).toBe(true);
    expect(matches('/apps/mobile/app/Screen.test.tsx')).toBe(true);
    expect(matches('/apps/mobile/app/Screen.tsx')).toBe(false);
  });

  it('names apps/mobile/src/dev/ as its own pattern, which the blind self-check requires specifically', () => {
    expect(DEV_ONLY_PATH).toContain(DEV_TOOLS_PATH);
    expect(DEV_TOOLS_PATH.re.test('/apps/mobile/src/dev/anything.ts')).toBe(true);
    expect(DEV_TOOLS_PATH.re.test('/apps/mobile/.rnstorybook/anything.ts')).toBe(false);
  });
});

describe('sourcemap shape', () => {
  it('reads a flat sourcemap', () => {
    expect(sourcesOf({ sources: ['/apps/mobile/app/index.tsx', '/packages/core/src/index.ts'] })).toEqual([
      '/apps/mobile/app/index.tsx',
      '/packages/core/src/index.ts',
    ]);
  });

  it('reads an indexed sourcemap, the shape Metro actually emits for a bundle', () => {
    const indexed = {
      sections: [
        { map: { sources: ['__prelude__'] } },
        { map: { sources: ['/apps/mobile/src/dev/index.ts'] } },
        { map: { sources: ['/packages/core/src/index.ts'] } },
      ],
    };
    expect(sourcesOf(indexed)).toEqual(['__prelude__', '/apps/mobile/src/dev/index.ts', '/packages/core/src/index.ts']);
  });

  it('returns no sources for a map with neither shape, rather than throwing', () => {
    expect(sourcesOf({})).toEqual([]);
  });
});

describe('test fakes and contract suites in a release bundle', () => {
  // The real files, as Metro names them in a sourcemap. None sits in a testing/ folder, which is
  // why check:release could not see them before TASK-10.6.
  const realFakes = [
    '/packages/ports/src/auth/fake.ts',
    '/packages/ports/src/sync-store/fake.ts',
    '/packages/ports/src/clock/fake.ts',
    '/packages/ports/src/ids/fake.ts',
    '/packages/ports/src/logging/fake.ts',
  ];

  it.each(realFakes)('catches %s in a release bundle, as a test fake', (source) => {
    const leaks = findDevModules(['/apps/mobile/app/index.tsx', source]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0]?.source).toBe(source);
    expect(leaks[0]?.rule).toBe(FAKE_RULE);
  });

  it('catches the testing entries of @grocs/ports, which are files and not a testing/ folder', () => {
    for (const source of ['/packages/ports/src/test-support.ts', '/packages/ports/src/testing.ts']) {
      expect(findDevModules([source])[0]?.rule).toBe(FAKE_RULE);
    }
    expect(findDevModules(['/apps/mobile/testing/render-route.tsx'])[0]?.rule).toBe(FAKE_RULE);
  });

  it('catches the contract suites by file name, in any port', () => {
    for (const source of [
      '/packages/ports/src/auth/contract.ts',
      '/packages/ports/src/sync-store/contract.ts',
      '/packages/providers-firebase/src/sync-store/sync-store.contract.ts',
    ]) {
      const leaks = findDevModules([source]);
      expect(leaks).toHaveLength(1);
      expect(leaks[0]?.rule).toBe(CONTRACT_RULE);
    }
  });

  it('catches a fake by its name alone, wherever it is put and however it is cased', () => {
    for (const source of [
      '/packages/application/src/commands/fake-clock.ts',
      '/packages/providers-firebase/src/auth.fake.ts',
      '/apps/mobile/src/composition/FakeAuth.tsx',
      '/packages/ports/src/fakes.ts',
    ]) {
      expect(findDevModules([source])[0]?.rule).toBe(FAKE_RULE);
    }
  });

  it('leaves the ports and third-party modules with similar names alone', () => {
    expect(
      findDevModules([
        '/packages/ports/src/auth/port.ts',
        '/packages/ports/src/index.ts',
        '/packages/ports/src/unsubscribe.ts',
        '/packages/application/src/testimonials.ts',
        '/node_modules/.pnpm/fake-timers@11.0.0/node_modules/fake-timers/src/fake-timers-src.js',
        '/apps/mobile/node_modules/some-lib/contract.js',
      ]),
    ).toEqual([]);
  });

  it('reports each kind under its own rule, with the rule id, why and fix', () => {
    const message = formatLeak('ios', findDevModules(['/packages/ports/src/auth/fake.ts', '/packages/ports/src/auth/contract.ts']));
    expect(message).toContain('FAIL release-bundle/test-fake-in-release (R48, R49, R53)');
    expect(message).toContain('FAIL release-bundle/contract-suite-in-release (R48, R53)');
    expect(message).toContain('/packages/ports/src/auth/fake.ts (a test fake');
    expect(message).toMatch(/Why: A fake auth signs anyone in/);
    expect(message).toMatch(/Why: A contract suite is test code/);
    expect(message).toMatch(/Fix: .*providers-memory/);
  });
});

describe('the demo composition and the in-memory provider in a release bundle', () => {
  it('catches every file of each, by path', () => {
    for (const source of [
      '/apps/mobile/src/demo/compose-demo.ts',
      '/apps/mobile/src/demo/sample/members.ts',
      '/packages/providers-memory/src/index.ts',
      '/packages/providers-memory/src/auth/memory-auth.ts',
    ]) {
      const leaks = findDevModules([source]);
      expect(leaks).toHaveLength(1);
      expect(leaks[0]?.rule).toBe(DEMO_RULE);
    }
  });

  it('leaves the real composition and the other providers alone', () => {
    expect(
      findDevModules([
        '/apps/mobile/src/composition/compose-app.ts',
        '/packages/providers-firebase/src/index.ts',
        '/packages/providers-device/src/index.ts',
        '/apps/mobile/src/sample/sample-data.ts',
      ]),
    ).toEqual([]);
  });

  it('names the rule, decision-12 and the reason when it fails', () => {
    const message = formatLeak('android', findDevModules(['/packages/providers-memory/src/index.ts']));
    expect(message).toContain('FAIL release-bundle/demo-in-release (decision-12)');
    expect(message).toMatch(/Why: The demo signs in a fixed member with no credentials/);
    expect(message).toMatch(/Fix: .*demo variant/);
  });

  it('still reports a dev-only source under the original rule', () => {
    expect(formatLeak('ios', findDevModules(['/apps/mobile/src/dev/index.ts']))).toContain(`FAIL ${RULE.id}`);
  });
});

describe('proving the patterns can see (blindSpots)', () => {
  // What the repo holds today: the fakes exist, the demo composition and in-memory provider do not.
  const today = [
    'apps/mobile/app/index.tsx',
    'apps/mobile/src/composition/compose-app.ts',
    'apps/mobile/src/dev/index.ts',
    'apps/mobile/src/sample/sample-data.ts',
    'apps/mobile/testing/route-setup.ts',
    'packages/application/src/testing/client.ts',
    'packages/application/src/commands/add-item.test.ts',
    'packages/ports/src/auth/fake.ts',
    'packages/ports/src/auth/contract.ts',
    'packages/ports/src/sync-store/fake.ts',
    'packages/ports/src/test-support.ts',
    'packages/ports/src/testing.ts',
    'packages/ui/src/atoms/Button.stories.tsx',
  ];

  it('finds nothing blind today, when the demo folder and the in-memory provider are missing', () => {
    expect(blindSpots(today)).toEqual([]);
  });

  it('stays quiet once the demo code exists and the patterns see it', () => {
    const built = [...today, 'apps/mobile/src/demo/compose-demo.ts', 'packages/providers-memory/src/index.ts', 'packages/providers-memory/package.json'];
    expect(blindSpots(built)).toEqual([]);
  });

  it('fails when a pattern matches nothing that exists, rather than passing blind', () => {
    const noFakes = today.filter((f) => !/fake|test-support|testing\.ts/.test(f));
    const findings = blindSpots(noFakes);
    expect(findings.some((f) => f.includes('a test fake') && f.includes('matches no file'))).toBe(true);
    // A pattern with no files to see and no home is blind; the home exemption is only for code not built yet.
    expect(blindSpots(['apps/mobile/src/dev/index.ts'], [DEV_TOOLS_PATH, { re: /^\/zzz\//, what: 'a typo' }])).toHaveLength(1);
  });

  it('fails once demo code exists but the demo pattern cannot see it', () => {
    const typo = DEV_ONLY_PATH.map((p) => (p.home === 'apps/mobile/src/demo' ? { ...p, re: /^\/?apps\/mobile\/src\/dmeo\// } : p));
    const findings = blindSpots([...today, 'apps/mobile/src/demo/compose-demo.ts'], typo);
    expect(findings.some((f) => f.includes('demo composition') && f.includes('matches no file'))).toBe(true);
    expect(findings.some((f) => f.includes('files under apps/mobile/src/demo/'))).toBe(true);
  });

  it('fails when only some files under a home are seen', () => {
    const narrow = DEV_ONLY_PATH.map((p) => (p.home === 'packages/providers-memory' ? { ...p, re: /^\/?packages\/providers-memory\/src\/index\.ts$/ } : p));
    const findings = blindSpots([...today, 'packages/providers-memory/src/index.ts', 'packages/providers-memory/src/auth.ts'], narrow);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.includes('packages/providers-memory/src/auth.ts') && !f.includes('src/index.ts'))).toBe(true);
  });

  it('fails when demo or in-memory code is put where neither the home nor the regex expected', () => {
    for (const moved of ['apps/mobile/src/demo-mode/compose.ts', 'apps/mobile/src/demos/compose.ts', 'packages/memory-store/src/InMemoryAuth.ts', 'packages/providers-inmemory/src/index.ts']) {
      const findings = blindSpots([...today, moved]);
      expect(findings, moved).toHaveLength(1);
      expect(findings[0]).toContain(moved);
    }
  });

  it('does not take unrelated names for demo code', () => {
    expect(blindSpots([...today, 'packages/ui/src/atoms/Demolition.tsx', 'apps/mobile/src/sample/demographics.ts'])).toEqual([]);
  });
});
