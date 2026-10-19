// The pre-edit hook blocks changes to visual baselines made any way but visual:update (R57, decision-11).
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { needsBrowserPass } from './lib.ts';
import { reviewBash } from './pre-edit.ts';

const here = dirname(fileURLToPath(import.meta.url));
let root: string;

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'grocs-baseline-hook-'));
  mkdirSync(join(root, 'packages/ui/visual-baselines'), { recursive: true });
  writeFileSync(join(root, 'packages/ui/visual-baselines/a.png'), 'png');
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

function preEdit(payload: Record<string, unknown>): { status: number | null; stderr: string } {
  const r = spawnSync('node', ['--disable-warning=ExperimentalWarning', join(here, 'pre-edit.ts')], {
    input: JSON.stringify({ agent_type: 'builder-ui', ...payload }),
    env: { ...process.env, GROCS_ROOT: root },
    encoding: 'utf8',
  });
  return { status: r.status, stderr: r.stderr };
}

describe('when the stop hook runs the browser pass', () => {
  it('runs for UI, art, tokens, the pass itself and dependencies, and not for other layers', () => {
    for (const file of ['packages/ui/src/atoms/Button.tsx', 'packages/ui/visual-baselines/a.png', 'design/svg/icons/add.svg', 'tools/visual.ts', 'tools/build-tokens.ts', 'pnpm-lock.yaml']) {
      expect(needsBrowserPass([file]), file).toBe(true);
    }
    for (const file of ['packages/core/src/index.ts', 'apps/mobile/app/index.tsx', 'backlog/tasks/x.md']) {
      expect(needsBrowserPass([file]), file).toBe(false);
    }
  });
});

describe('pre-edit hook and visual baselines', () => {
  it('denies a Write to a baseline image, with the rule, the reason and the update command', () => {
    const r = preEdit({ tool_name: 'Write', tool_input: { file_path: join(root, 'packages/ui/visual-baselines/a.png'), content: 'other' } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('weakening/edit-baseline');
    expect(r.stderr).toContain('Why:');
    expect(r.stderr).toContain('pnpm --filter @grocs/ui visual:update');
  });

  it('denies an Edit to the manifest', () => {
    const r = preEdit({ tool_name: 'Edit', tool_input: { file_path: join(root, 'packages/ui/visual-baselines/manifest.json'), old_string: 'a', new_string: 'b' } });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('weakening/edit-baseline');
  });

  it('denies deleting a baseline from the shell, and lets visual:update run', () => {
    const rm = reviewBash('rm packages/ui/visual-baselines/a.png');
    expect(rm.decision).toBe('deny');
    expect(rm.reason).toContain('weakening/edit-baseline');
    expect(reviewBash('pnpm --filter @grocs/ui visual:update').decision).toBe('allow');
  });

  it('still allows an ordinary edit to a component', () => {
    const r = preEdit({ tool_name: 'Edit', tool_input: { file_path: join(root, 'packages/ui/src/atoms/Button.tsx'), old_string: 'a', new_string: 'b' } });
    expect(r.status).toBe(0);
  });
});
