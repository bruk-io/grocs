// Installed via lefthook.yml's post-checkout hook, which fires on every checkout, including
// `git worktree add` making a brand-new worktree (DRAFT-2): node_modules is gitignored, so a
// fresh worktree starts with none, and a layer builder's own Bash is narrowed to its layer's
// test and type-check commands - it cannot install for itself, and installing by hand was the
// orchestrator's job every time. Installs only when node_modules is missing, so an ordinary
// checkout or branch switch in an already-installed tree stays fast.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function main(): number {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  if (existsSync(join(root, 'node_modules'))) return 0;
  console.log('post-checkout: node_modules is missing here, installing...');
  try {
    execFileSync('pnpm', ['install', '--frozen-lockfile'], { cwd: root, stdio: 'inherit' });
  } catch (error) {
    console.error('post-checkout: install failed, a layer builder may need to report this rather than push through:', error);
    return 1;
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
