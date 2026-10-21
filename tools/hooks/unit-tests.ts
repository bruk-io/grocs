// Pre-commit's unit-tests step (lefthook.yml). Skipped when every staged file is under backlog/:
// a pure board change (a status, a plan, a note) cannot break a test, so running the whole suite
// for one is only cost, not safety. Any other staged file, board files included, runs the suite as
// usual.
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot } from './lib.ts';

// A real git hook sets GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES for its
// process tree; stripped here so this script run against a test fixture (GROCS_ROOT) is never
// pointed at the real repository instead (TASK-1.36).
const ISOLATE_ENV: NodeJS.ProcessEnv = { ...process.env };
delete ISOLATE_ENV['GIT_DIR'];
delete ISOLATE_ENV['GIT_WORK_TREE'];
delete ISOLATE_ENV['GIT_INDEX_FILE'];
delete ISOLATE_ENV['GIT_CEILING_DIRECTORIES'];

export function stagedFiles(root: string): string[] {
  return execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8', env: ISOLATE_ENV })
    .split('\n')
    .filter(Boolean);
}

export const isBoardOnly = (files: readonly string[]): boolean => files.length > 0 && files.every((f) => f.startsWith('backlog/'));

function main(): number {
  const files = stagedFiles(repoRoot);
  if (isBoardOnly(files)) {
    console.log('unit-tests: skipped, every staged file is under backlog/');
    return 0;
  }
  const result = spawnSync('pnpm', ['-s', 'test'], { cwd: repoRoot, stdio: 'inherit', env: ISOLATE_ENV });
  return result.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
