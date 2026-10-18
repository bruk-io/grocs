import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { reviewGitChange, render } from '../checks/run.ts';
import { reviewBash } from './pre-edit.ts';

const here = dirname(fileURLToPath(import.meta.url));
let root: string;

function put(rel: string, text: string): void {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text);
}
function hook(name: string, payload: object): { status: number | null; stderr: string; stdout: string; ms: number } {
  const t0 = performance.now();
  const r = spawnSync('node', ['--disable-warning=ExperimentalWarning', join(here, `${name}.ts`)], {
    input: JSON.stringify(payload),
    env: { ...process.env, GROCS_ROOT: root },
    encoding: 'utf8',
  });
  return { status: r.status, stderr: r.stderr, stdout: r.stdout, ms: performance.now() - t0 };
}
// A real git hook (this file's own pre-commit, via lefthook) sets GIT_DIR, GIT_WORK_TREE,
// GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES for its process tree. Inherited here, they make git
// ignore `cwd` and operate on the real repository instead of this fixture's own tmp directory
// (TASK-1.36): stripped so this fixture stays isolated no matter what invoked the test.
const ISOLATE_ENV: NodeJS.ProcessEnv = { ...process.env };
delete ISOLATE_ENV['GIT_DIR'];
delete ISOLATE_ENV['GIT_WORK_TREE'];
delete ISOLATE_ENV['GIT_INDEX_FILE'];
delete ISOLATE_ENV['GIT_CEILING_DIRECTORIES'];
const git = (...args: string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: ISOLATE_ENV });

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'grocs-hooks-'));
  put('packages/core/src/index.ts', 'export const a = 1;\n');
  put('packages/ports/src/index.ts', "import { a } from '@grocs/core';\nexport const b = a;\n");
  put('packages/core/src/a.test.ts', "import { it } from 'vitest';\nit('a', () => {});\nit('b', () => {});\n");
  put('lefthook.yml', 'pre-commit:\n  commands:\n    checks:\n      run: x\n');
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 't@example.com');
  git('config', 'user.name', 't');
  git('add', '-A');
  git('commit', '-qm', 'base');
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('post-edit hook (R55, R56)', () => {
  it('passes a clean file quickly', () => {
    const r = hook('post-edit', { tool_name: 'Edit', tool_input: { file_path: join(root, 'packages/ports/src/index.ts') } });
    expect(r.status).toBe(0);
    expect(r.ms).toBeLessThan(5000);
  });

  it('blocks a layer violation, names the rule and why, and stays under 5 seconds', () => {
    put('packages/core/src/bad.ts', "import { b } from '@grocs/ports';\nexport { b };\n");
    const r = hook('post-edit', { tool_name: 'Write', tool_input: { file_path: join(root, 'packages/core/src/bad.ts') } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('import-layers/allowed-imports');
    expect(r.stderr).toContain('Why:');
    expect(r.ms).toBeLessThan(5000);
    rmSync(join(root, 'packages/core/src/bad.ts'));
  });

  it('blocks direct console use', () => {
    put('packages/core/src/noisy.ts', "console.log('x');\n");
    const r = hook('post-edit', { tool_name: 'Write', tool_input: { file_path: join(root, 'packages/core/src/noisy.ts') } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('console-use/direct-console');
    rmSync(join(root, 'packages/core/src/noisy.ts'));
  });
});

describe('pre-edit hook (R57)', () => {
  const testFile = () => join(root, 'packages/core/src/a.test.ts');

  it('denies focusing a test', () => {
    const r = hook('pre-edit', { tool_name: 'Edit', tool_input: { file_path: testFile(), old_string: "it('a'", new_string: "it.only('a'" } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('weakening/focus-test');
    expect(r.stderr).toContain('Why:');
  });

  it('denies skipping a test', () => {
    const r = hook('pre-edit', { tool_name: 'Edit', tool_input: { file_path: testFile(), old_string: "it('a'", new_string: "it.skip('a'" } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('weakening/skip-test');
  });

  it('denies a Write that drops a test', () => {
    const r = hook('pre-edit', { tool_name: 'Write', tool_input: { file_path: testFile(), content: "import { it } from 'vitest';\nit('a', () => {});\n" } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('weakening/delete-test');
  });

  it('allows an ordinary edit', () => {
    const r = hook('pre-edit', { tool_name: 'Edit', tool_input: { file_path: join(root, 'packages/core/src/index.ts'), old_string: '= 1', new_string: '= 2' } });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  it('asks the person before a check config is loosened', () => {
    const r = hook('pre-edit', { tool_name: 'Write', tool_input: { file_path: join(root, 'lefthook.yml'), content: 'pre-commit:\n' } });
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision).toBe('ask');
  });

  it('denies deleting a test file from the shell', () => {
    expect(reviewBash('rm packages/core/src/a.test.ts').decision).toBe('deny');
    expect(reviewBash('git rm -f src/x.spec.ts').decision).toBe('deny');
    expect(reviewBash('ls packages').decision).toBe('allow');
  });

  it('asks before a shell rewrite of a check file', () => {
    expect(reviewBash("sed -i 's/a/b/' lefthook.yml").decision).toBe('ask');
  });
});

describe('staged and CI review against git (R57)', () => {
  it('flags weakened tests in a staged diff and in a diff against the base', () => {
    git('checkout', '-q', '-b', 'feature');
    put('packages/core/src/a.test.ts', "import { it } from 'vitest';\nit.skip('a', () => {});\n");
    git('add', '-A');
    const staged = reviewGitChange(root, 'staged');
    expect(staged.map((r) => r.finding.rule).sort()).toEqual(['weakening/delete-test', 'weakening/skip-test']);
    expect(render(staged)).toContain('Why:');
    git('commit', '-qm', 'weaken');
    const ci = reviewGitChange(root, 'main');
    expect(ci.length).toBe(2);
  });

  it('flags a deleted test file against the base', () => {
    git('rm', '-q', 'packages/core/src/a.test.ts');
    git('commit', '-qm', 'delete');
    expect(reviewGitChange(root, 'main').map((r) => r.finding.rule)).toEqual(['weakening/delete-test']);
  });
});
