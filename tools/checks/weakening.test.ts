import { describe, expect, it } from 'vitest';
import { check, countTests, reviewChange } from './weakening.ts';
import { formatFinding } from './lib.ts';

const base = "import { it } from 'vitest';\nit('a', () => {});\nit('b', () => {});\n";

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

  it('names the rule, the reason and the fix', () => {
    const [w] = reviewChange('packages/core/src/a.test.ts', base, base.replace("it('a'", "it.only('a'"));
    const text = formatFinding(check, w!);
    expect(text).toContain('weakening/focus-test (R57)');
    expect(text).toContain('Why:');
    expect(text).toContain('Fix:');
  });
});
