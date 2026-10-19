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
/**
 * Under decision-3's write guard, only a layer agent may edit packages/* or apps/*; the
 * orchestrator (no agent_type at all) may not. A pre-edit payload that targets layer
 * code and names no agent_type defaults to a core builder, so the pre-existing
 * weakening-check tests below, written before that guard existed, keep testing the
 * layer-code edit they describe without needing to repeat the same literal lines a
 * naive line-diff would otherwise re-flag as "adding" a focused or skipped test merely
 * for being touched. A test targeting root config, or naming its own `agent_type`
 * (including `agent_type: undefined` for the orchestrator), is left exactly as given.
 */
function hook(name: string, payload: Record<string, unknown>): { status: number | null; stderr: string; stdout: string; ms: number } {
  const filePath = (payload['tool_input'] as { file_path?: unknown } | undefined)?.file_path;
  const isLayerCode = typeof filePath === 'string' && /\/(packages|apps)\//.test(filePath);
  const withDefault = name === 'pre-edit' && isLayerCode && !('agent_type' in payload) ? { agent_type: 'builder-core', ...payload } : payload;
  const t0 = performance.now();
  const r = spawnSync('node', ['--disable-warning=ExperimentalWarning', join(here, `${name}.ts`)], {
    input: JSON.stringify(withDefault),
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

describe('write guard (decision-3): layer agents and the orchestrator', () => {
  it('denies a layer agent writing outside its own layer, naming the rule and why', () => {
    const r = hook('pre-edit', {
      tool_name: 'Write',
      agent_type: 'builder-core',
      tool_input: { file_path: join(root, 'packages/ports/src/new.ts'), content: 'export {};\n' },
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('write-guard/layer-boundary');
    expect(r.stderr).toContain('builder-core');
    expect(r.stderr).toContain('Why:');
  });

  it('denies the small builder variant outside its own layer the same way', () => {
    const r = hook('pre-edit', {
      tool_name: 'Edit',
      agent_type: 'builder-core-small',
      tool_input: { file_path: join(root, 'packages/ui/src/new.ts'), old_string: 'a', new_string: 'b' },
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('write-guard/layer-boundary');
  });

  it('denies a reviewer writing at all, even within its own layer', () => {
    const r = hook('pre-edit', {
      tool_name: 'Write',
      agent_type: 'reviewer-core',
      tool_input: { file_path: join(root, 'packages/core/src/new.ts'), content: 'export {};\n' },
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('write-guard/reviewer-writes-nothing');
  });

  it('allows a layer agent writing within its own layer', () => {
    const r = hook('pre-edit', {
      tool_name: 'Edit',
      agent_type: 'builder-core',
      tool_input: { file_path: join(root, 'packages/core/src/index.ts'), old_string: '= 1', new_string: '= 2' },
    });
    expect(r.status).toBe(0);
  });

  it("narrows a layer agent's Bash to this layer's own test or type-check command", () => {
    const blocked = hook('pre-edit', { tool_name: 'Bash', agent_type: 'builder-core', tool_input: { command: 'rm -rf packages/ui' } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain('write-guard/bash-narrowed');

    const allowed = hook('pre-edit', { tool_name: 'Bash', agent_type: 'builder-core', tool_input: { command: 'vitest run --project unit packages/core' } });
    expect(allowed.status).toBe(0);
  });

  it("also lets a layer agent run the extra commands its config lists, and no others", () => {
    const allowed = hook('pre-edit', { tool_name: 'Bash', agent_type: 'builder-ui', tool_input: { command: 'pnpm --filter @grocs/ui shots' } });
    expect(allowed.status).toBe(0);

    const blocked = hook('pre-edit', { tool_name: 'Bash', agent_type: 'builder-core', tool_input: { command: 'pnpm --filter @grocs/ui shots' } });
    expect(blocked.status).toBe(2);
    expect(blocked.stderr).toContain('write-guard/bash-narrowed');
  });

  it('denies the orchestrator (no agent_type) writing layer code directly', () => {
    const r = hook('pre-edit', {
      agent_type: undefined,
      tool_name: 'Write',
      tool_input: { file_path: join(root, 'packages/core/src/new.ts'), content: 'export {};\n' },
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('write-guard/orchestrator-scope');
  });

  it('allows the orchestrator writing the board, root config or .claude/', () => {
    for (const rel of ['backlog/tasks/task-9.md', '.claude/settings.json', 'package.json']) {
      const r = hook('pre-edit', { agent_type: undefined, tool_name: 'Write', tool_input: { file_path: join(root, rel), content: '{}\n' } });
      expect(r.status).toBe(0);
    }
  });

  it('does not apply decision-3 layer restrictions to an agent_type that names no generated agent', () => {
    const r = hook('pre-edit', {
      tool_name: 'Write',
      agent_type: 'general-purpose',
      tool_input: { file_path: join(root, 'packages/core/src/new.ts'), content: 'export {};\n' },
    });
    expect(r.status).toBe(0);
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
