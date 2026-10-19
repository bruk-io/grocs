// Tests for the checks that read the shape of the repository: tokens, stories, purity, tests, contracts.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import vitestConfig from '../../vitest.config.ts';
import { renderTokensTs } from '../build-tokens.ts';
import { check as coreRules } from './core-purity.ts';
import { check as designTokens, contrastRatio, findRawValues } from './design-tokens.ts';
import { fixture, message, rulesOf } from './fixture.ts';
import { check as portContracts } from './port-contracts.ts';
import { check as storyCoverage } from './story-coverage.ts';
import { check as testPresence } from './test-presence.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const tokensJson = { color: { text: '#000000', surface: '#FFFFFF', pale: '#EEEEEE' }, space: { 1: 4 }, contrastPairs: [['text', 'surface']] };
const goodTokens = {
  'packages/ui/src/tokens/tokens.json': JSON.stringify(tokensJson),
  'packages/ui/src/tokens/tokens.ts': renderTokensTs(tokensJson),
};

describe('design tokens (R39, R42, R59)', () => {
  it('passes when tokens.ts matches tokens.json', () => {
    expect(designTokens.run(fixture(goodTokens))).toEqual([]);
  });

  it('fails when tokens.ts was edited by hand', () => {
    const f = designTokens.run(fixture({ ...goodTokens, 'packages/ui/src/tokens/tokens.ts': renderTokensTs(tokensJson) + '// edit\n' }));
    expect(rulesOf(f)).toEqual(['design-tokens/generated-in-sync']);
    expect(message(designTokens, f[0]!)).toContain('pnpm tokens');
  });

  it('fails when tokens.ts is missing', () => {
    expect(rulesOf(designTokens.run(fixture({ 'packages/ui/src/tokens/tokens.json': goodTokens['packages/ui/src/tokens/tokens.json'] })))).toEqual(['design-tokens/generated-in-sync']);
  });

  it('fails a text pair below 4.5:1', () => {
    const json = { ...tokensJson, contrastPairs: [['pale', 'surface']] };
    const f = designTokens.run(fixture({ 'packages/ui/src/tokens/tokens.json': JSON.stringify(json), 'packages/ui/src/tokens/tokens.ts': renderTokensTs(json) }));
    expect(rulesOf(f)).toEqual(['design-tokens/contrast']);
  });

  it('computes the WCAG ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeGreaterThan(4.4);
  });

  it('flags colours and sizes written in a component, and allows tokens, 0 and 1', () => {
    const hits = findRawValues('a.tsx', "const s = { color: '#fff', padding: 8, flex: 1, margin: 0, borderWidth: 1, gap: tokens.space[1], backgroundColor: 'rgba(0,0,0,.5)', width: -4 };");
    expect(hits.map((h) => h.text)).toEqual(['colour #fff', 'padding: 8', 'colour rgba(0,0,0,.5)', 'width: -4']);
  });

  it('reports raw values in the UI library but not in tokens or tests', () => {
    const f = designTokens.run(
      fixture({
        ...goodTokens,
        'packages/ui/src/atoms/A.tsx': "export const s = { fontSize: 14 };",
        'packages/ui/src/atoms/A.test.tsx': "export const s = { fontSize: 14 };",
      }),
    );
    expect(f.map((x) => x.file)).toEqual(['packages/ui/src/atoms/A.tsx']);
  });
});

describe('story coverage (R61, R63)', () => {
  const component = "export const BOX_STATES = ['rest', 'inCart'] as const; export function Box() { return null; }";

  it('passes when every state has a story', () => {
    expect(storyCoverage.run(fixture({ 'packages/ui/src/atoms/Box.tsx': component, 'packages/ui/src/atoms/Box.stories.tsx': 'export const Rest = {}; export const InCart = {};' }))).toEqual([]);
  });

  it('names the state with no story', () => {
    const f = storyCoverage.run(fixture({ 'packages/ui/src/atoms/Box.tsx': component, 'packages/ui/src/atoms/Box.stories.tsx': 'export const Rest = {};' }));
    expect(rulesOf(f)).toEqual(['story-coverage/missing-story']);
    expect(f[0]?.detail).toContain('InCart');
  });

  it('fails a component with no stories file or no declared states', () => {
    expect(rulesOf(storyCoverage.run(fixture({ 'packages/ui/src/atoms/Box.tsx': component })))).toEqual(['story-coverage/missing-story-file']);
    expect(rulesOf(storyCoverage.run(fixture({ 'packages/ui/src/molecules/Row.tsx': 'export function Row() { return null; }' })))).toEqual(['story-coverage/declare-states']);
  });
});

describe('domain purity (R25)', () => {
  it('flags the clock, randomness and I/O globals', () => {
    const f = coreRules.run(fixture({ 'packages/core/src/a.ts': 'export const a = () => Date.now() + Math.random(); export const b = () => fetch("x"); export const c = new Date();' }));
    expect(f).toHaveLength(4);
  });

  it('allows names that only look like globals, and tests', () => {
    expect(coreRules.run(fixture({ 'packages/core/src/a.ts': 'export const o = { Date: 1 }; export const d = o.Date;', 'packages/core/src/a.test.ts': 'Date.now();' }))).toEqual([]);
  });
});

describe('test presence (R46, R47)', () => {
  it('wants a unit test beside a core module with functions', () => {
    const files = { 'packages/core/src/merge/lww.ts': 'export function f() {}' };
    expect(rulesOf(testPresence.run(fixture(files)))).toEqual(['test-presence/domain-unit-test']);
    expect(testPresence.run(fixture({ ...files, 'packages/core/src/merge/lww.test.ts': '' }))).toEqual([]);
  });

  it('does not want a test for type-only modules or index files', () => {
    expect(testPresence.run(fixture({ 'packages/core/src/t.ts': 'export interface T {}', 'packages/core/src/index.ts': 'export function f() {}' }))).toEqual([]);
  });

  it('wants a scenario test for every command', () => {
    const files = { 'packages/application/src/commands/add-item.ts': 'export async function addItem() {}', 'packages/application/src/commands/index.ts': '' };
    expect(rulesOf(testPresence.run(fixture(files)))).toEqual(['test-presence/command-scenario-test']);
    expect(testPresence.run(fixture({ ...files, 'packages/application/src/commands/add-item.scenario.test.ts': '' }))).toEqual([]);
  });
});

describe('port contracts (R28, R29, R48)', () => {
  const port = 'export interface Clock { now(): number; tick(): void }';
  const base = {
    'packages/ports/src/clock/port.ts': port,
    'packages/ports/src/clock/fake.ts': '',
    'packages/ports/src/clock/contract.ts': 'export function clockContract(c) { c.now(); c.tick(); }',
    'packages/ports/src/clock/fake.test.ts': 'clockContract(t, make);',
  };

  it('passes a complete port', () => {
    expect(portContracts.run(fixture(base))).toEqual([]);
  });

  it('names a method the contract never calls', () => {
    const f = portContracts.run(fixture({ ...base, 'packages/ports/src/clock/contract.ts': 'export function clockContract(c) { c.now(); }' }));
    expect(rulesOf(f)).toEqual(['port-contracts/method-covered']);
    expect(f[0]?.detail).toContain('Clock.tick');
  });

  it('wants all four files and the fake to run the contract', () => {
    expect(rulesOf(portContracts.run(fixture({ 'packages/ports/src/clock/port.ts': port })))).toEqual(['port-contracts/port-files', 'port-contracts/port-files', 'port-contracts/port-files']);
    expect(rulesOf(portContracts.run(fixture({ ...base, 'packages/ports/src/clock/fake.test.ts': '// nothing' })))).toEqual(['port-contracts/fake-runs-contract']);
  });

  it('wants every provider to run the contract', () => {
    const provider = { 'packages/providers-device/src/system-clock.ts': 'export class SystemClock implements Clock { now() { return 1; } }' };
    const f = portContracts.run(fixture({ ...base, ...provider }));
    expect(rulesOf(f)).toEqual(['port-contracts/provider-runs-contract']);
    expect(portContracts.run(fixture({ ...base, ...provider, 'packages/providers-device/src/system-clock.test.ts': 'clockContract(t, make);' }))).toEqual([]);
  });
});

// decision-9 (D8) reproduced, against the repo's own vitest 4.1.12, that an inline project
// does not inherit root options such as allowOnly: false unless it sets extends: true:
// a stray it.only modifier then silently skips the rest of its file in pre-commit and CI.
describe('vitest config: allowOnly inheritance (D8, decision-9, TASK-5)', () => {
  const projects = vitestConfig.test?.projects ?? [];

  it('declares five projects, so the assertion below is not vacuous if the shape changes', () => {
    expect(projects).toHaveLength(5);
  });

  it('sets extends: true on every project, and the root allowOnly stays false', () => {
    expect(vitestConfig.test?.allowOnly).toBe(false);
    for (const project of projects) {
      expect(project).toMatchObject({ extends: true });
    }
  });
});

describe('vitest config: a stray it.only still fails the real run (D8, decision-9, TASK-5)', () => {
  const vitestBin = join(repoRoot, 'node_modules', 'vitest', 'vitest.mjs');
  const realConfigText = readFileSync(join(repoRoot, 'vitest.config.ts'), 'utf8');
  const focusedFixture = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'focused-test.fixture.txt'), 'utf8');

  // Runs the repo's own installed vitest against a copy of `configText`, in a fresh temp
  // directory outside the repo tree (so the spawned run cannot recurse into this very
  // suite). `node_modules` is symlinked in rather than reinstalled, so `vitest/config`
  // resolves exactly as it does for the committed file.
  function runInTempCopy(configText: string): { status: number | null; output: string } {
    const dir = mkdtempSync(join(tmpdir(), 'grocs-vitest-allowonly-'));
    try {
      symlinkSync(join(repoRoot, 'node_modules'), join(dir, 'node_modules'));
      writeFileSync(join(dir, 'vitest.config.ts'), configText);
      mkdirSync(join(dir, 'tools'), { recursive: true });
      // the `tools` project's include glob is `tools/**/*.test.ts`
      writeFileSync(join(dir, 'tools', 'focused.test.ts'), focusedFixture);
      // Vitest refuses .only by default whenever it detects CI, from CI or from any CI
      // provider's variables (GITHUB_ACTIONS and others), which would make the control fail
      // on CI for a reason other than the config. A minimal environment carries none of
      // them, so both runs show what the config alone does.
      const env: NodeJS.ProcessEnv = { NODE_ENV: process.env['NODE_ENV'] ?? 'test' };
      for (const key of ['PATH', 'HOME', 'TMPDIR', 'TMP', 'TEMP']) {
        if (process.env[key] !== undefined) env[key] = process.env[key];
      }
      const r = spawnSync('node', [vitestBin, 'run', '--project', 'tools', '--config', join(dir, 'vitest.config.ts'), '--root', dir], { encoding: 'utf8', env });
      return { status: r.status, output: `${r.stdout}\n${r.stderr}` };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it(
    'exits 1 and reports the allowOnly error, against the real, committed config',
    () => {
      const r = runInTempCopy(realConfigText);
      expect(r.status).toBe(1);
      expect(r.output).toContain('Unexpected .only modifier');
    },
    60_000,
  );

  it(
    "is the control decision-9's own repro used: the same config with the tools project's extends: true stripped exits 0, skipping the rest of the file",
    () => {
      const withoutExtends = realConfigText.replace("extends: true,\n        test: {\n          name: 'tools',", "test: {\n          name: 'tools',");
      // proves the string replace actually matched something in the current file, so this
      // is not silently comparing the real config against itself
      expect(withoutExtends).not.toBe(realConfigText);

      const r = runInTempCopy(withoutExtends);
      expect(r.status).toBe(0);
      expect(r.output).toContain('1 skipped');
    },
    60_000,
  );
});
