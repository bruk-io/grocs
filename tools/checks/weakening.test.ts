import { describe, expect, it } from 'vitest';
import { check, countTests, hashContent, isOverridden, isVersionBumpPair, reviewChange } from './weakening.ts';
import { formatFinding } from './lib.ts';

const base = "import { it } from 'vitest';\nit('a', () => {});\nit('b', () => {});\n";

// The real before/after of commit 0a26823 (TASK-1.35: actions/checkout@v4 -> @v7,
// pnpm/action-setup@v4 -> @v6, actions/setup-node@v4 -> @v7, actions/setup-java@v4 -> @v6,
// actions/cache@v4 -> @v6, no other change). This is the diff that only landed with
// --no-verify because weakening/loosen-check-config flagged the version-pin removals.
const CI_YAML_BEFORE = `name: ci

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    name: Checks, types and unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Checks (import layers, console use, tokens, stories, test presence, ...)
        run: node tools/checks/run.ts --mode all
      - name: Weakened checks (R57), reviewed against the base branch
        if: github.event_name == 'pull_request'
        run: node tools/checks/run.ts --mode ci --base origin/\${{ github.base_ref }}
      - run: pnpm typecheck
      - run: pnpm test

  emulators:
    name: Provider contracts and two-client sync on the Firebase emulators
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - run: pnpm install --frozen-lockfile
      - name: Cache emulator downloads
        uses: actions/cache@v4
        with:
          path: ~/.cache/firebase/emulators
          key: firebase-emulators-\${{ hashFiles('pnpm-lock.yaml') }}
      - run: pnpm test:emulator

  bundles:
    name: Android and iOS bundles, Storybook build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Android and iOS bundles, development and release; release must hold no dev-only code (R53, R64)
        run: pnpm check:release
      - run: pnpm --filter @grocs/ui build-storybook
`;

const CI_YAML_AFTER = CI_YAML_BEFORE
  .split('actions/checkout@v4').join('actions/checkout@v7')
  .split('pnpm/action-setup@v4').join('pnpm/action-setup@v6')
  .split('actions/setup-node@v4').join('actions/setup-node@v7')
  .split('actions/setup-java@v4').join('actions/setup-java@v6')
  .split('actions/cache@v4').join('actions/cache@v6');

describe('weakening review (R57)', () => {
  it('allows adding a test', () => {
    expect(reviewChange('packages/core/src/a.test.ts', base, base + "it('c', () => {});\n")).toEqual([]);
  });

  it('blocks focusing a test', () => {
    const r = reviewChange('packages/core/src/a.test.ts', base, base.replace("it('a'", "it.only('a'"));
    expect(r.map((w) => w.rule)).toEqual(['weakening/focus-test']);
    expect(r[0]?.severity).toBe('deny');
  });

  it('blocks fit, fdescribe, skip, xit and todo', () => {
    for (const bad of ["fit('a', () => {});", "fdescribe('a', () => {});", "it.skip('a', () => {});", "xit('a', () => {});", "it.todo('a');", "describe.skipIf(true)('a', () => {});"]) {
      const r = reviewChange('packages/core/src/a.test.ts', base, base + bad + '\n');
      expect(r.length, bad).toBeGreaterThan(0);
    }
  });

  it('blocks deleting a test file', () => {
    expect(reviewChange('packages/core/src/a.test.ts', base, null).map((w) => w.rule)).toEqual(['weakening/delete-test']);
  });

  it('blocks removing a test from a file', () => {
    const r = reviewChange('packages/core/src/a.test.ts', base, "import { it } from 'vitest';\nit('a', () => {});\n");
    expect(r.map((w) => w.rule)).toEqual(['weakening/delete-test']);
  });

  it('allows replacing one test with another', () => {
    expect(reviewChange('packages/core/src/a.test.ts', base, base.replace("it('b'", "it('b renamed'"))).toEqual([]);
  });

  it('asks before a check config loses lines', () => {
    const before = 'pre-commit:\n  commands:\n    checks:\n      run: node tools/checks/run.ts\n';
    const r = reviewChange('lefthook.yml', before, 'pre-commit:\n  commands:\n');
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
    expect(r[0]?.severity).toBe('ask');
  });

  it('asks before an exclude or warn-only line is added to a config', () => {
    const r = reviewChange('vitest.config.ts', 'export default {};\n', "export default {};\nexclude: ['x'],\n");
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
    expect(reviewChange('.github/workflows/ci.yml', 'a: 1\n', 'a: 1\ncontinue-on-error: true\n')).toHaveLength(1);
  });

  it('allows adding a new step to a config', () => {
    expect(reviewChange('lefthook.yml', 'a: 1\n', 'a: 1\nb: 2\n')).toEqual([]);
  });

  it('asks when check code shrinks, and allows it to grow', () => {
    expect(reviewChange('tools/checks/import-layers.ts', 'a\nb\nc\n', 'a\n')).toHaveLength(1);
    expect(reviewChange('tools/checks/import-layers.ts', 'a\nb\n', 'a\nb\nc\nd\n')).toEqual([]);
  });

  it('does not review unprotected non-test files', () => {
    expect(reviewChange('packages/core/src/a.ts', 'a\nb\n', 'a\n')).toEqual([]);
  });

  it('counts tests', () => {
    expect(countTests("it('a');test('b');test.each([1])('c');it.concurrent('d')")).toBe(4);
  });

  it('allows a pure version-only bump of pinned CI actions (TASK-2, the real 0a26823 diff)', () => {
    expect(reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, CI_YAML_AFTER)).toEqual([]);
  });

  it('still flags continue-on-error added alongside a legitimate version bump', () => {
    const after = CI_YAML_AFTER.replace(
      '      - run: pnpm test\n',
      '      - run: pnpm test\n        continue-on-error: true\n',
    );
    const r = reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, after);
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
  });

  it('still flags dropping a step even when other lines in the same file are a version bump', () => {
    const after = CI_YAML_AFTER.replace(
      "      - name: Weakened checks (R57), reviewed against the base branch\n        if: github.event_name == 'pull_request'\n        run: node tools/checks/run.ts --mode ci --base origin/${{ github.base_ref }}\n",
      '',
    );
    const r = reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, after);
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
  });

  it('still flags a genuine removed line that happens to contain digits, while other version-digit lines in the same diff legitimately pair off', () => {
    // Drop the java-version field entirely (no replacement) alongside the file's
    // otherwise-legitimate @v4 -> @v6/@v7 bumps. Guards against the pairing matcher
    // mispairing this removed, digit-bearing line against some unrelated action's
    // added @v6/@v7 line elsewhere in the same file.
    const after = CI_YAML_AFTER.replace('          java-version: 21\n', '');
    const r = reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, after);
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
    expect(r[0]?.detail).toContain('java-version');
  });

  it('still flags excluding a path, alongside a legitimate version bump', () => {
    const after = CI_YAML_AFTER.replace('on:\n  push:\n    branches: [main]\n', "on:\n  push:\n    branches: [main]\n    paths-ignore: ['tools/checks/**']\n");
    const r = reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, after);
    expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
  });

  it('does not pair lines whose version shape differs (bare tag vs SHA/semver pin)', () => {
    expect(isVersionBumpPair('      - uses: actions/checkout@v4', '      - uses: actions/checkout@v7.1.0')).toBe(false);
    expect(isVersionBumpPair('      - uses: actions/checkout@v4', '      - uses: actions/checkout@abc123')).toBe(false);
  });

  it('does not treat a non-version numeric change (a threshold) as a version bump', () => {
    expect(isVersionBumpPair('      threshold: 80', '      threshold: 50')).toBe(false);
  });

  it('does not match shard or other numeric options in scoped package names (TASK-8 regression)', () => {
    expect(isVersionBumpPair('      - run: pnpm --filter @grocs/ui test --shard 1/4', '      - run: pnpm --filter @grocs/ui test --shard 1/1')).toBe(false);
  });

  describe('a recorded human override (AC3)', () => {
    const override = {
      file: '.github/workflows/ci.yml',
      beforeHash: hashContent(CI_YAML_BEFORE),
      afterHash: hashContent(CI_YAML_AFTER.replace('      - run: pnpm test\n', '      - run: pnpm test\n        continue-on-error: true\n')),
      approvedBy: 'alex',
      reason: 'test fixture',
      date: '2026-10-19',
    };
    const loosenedAfter = CI_YAML_AFTER.replace('      - run: pnpm test\n', '      - run: pnpm test\n        continue-on-error: true\n');

    it('matches on the exact before/after content', () => {
      expect(isOverridden('.github/workflows/ci.yml', CI_YAML_BEFORE, loosenedAfter, [override])).toBe(true);
    });

    it('suppresses the finding for the exact diff it was recorded for', () => {
      expect(reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, loosenedAfter, [override])).toEqual([]);
    });

    it('does not apply once the file changes again (not a standing bypass)', () => {
      const changedAgain = `${loosenedAfter}      - run: pnpm lint\n`;
      const r = reviewChange('.github/workflows/ci.yml', CI_YAML_BEFORE, changedAgain, [override]);
      expect(r.map((w) => w.rule)).toEqual(['weakening/loosen-check-config']);
    });

    it('does not apply to a different file', () => {
      expect(isOverridden('lefthook.yml', CI_YAML_BEFORE, loosenedAfter, [override])).toBe(false);
    });
  });

  it('names the rule, the reason and the fix', () => {
    const [w] = reviewChange('packages/core/src/a.test.ts', base, base.replace("it('a'", "it.only('a'"));
    const text = formatFinding(check, w!);
    expect(text).toContain('weakening/focus-test (R57)');
    expect(text).toContain('Why:');
    expect(text).toContain('Fix:');
  });
});
