import { describe, expect, it } from 'vitest';
import { DEV_ONLY_PATH, DEV_TOOLS_PATH, findDevModules, formatLeak, sourcesOf } from './release-bundle.ts';

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
