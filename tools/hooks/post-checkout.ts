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
    // mise.toml pins the Node version pnpm's engines check needs; the ambient PATH in the
    // non-interactive shell git invokes this hook from can carry a different one, so this runs
    // through mise rather than trusting PATH (TASK-42 review).
    //
    // CI=1 (with LEFTHOOK unset) makes lefthook's own postinstall skip re-running `lefthook
    // install`. Every worktree shares one .git/hooks directory; letting that command run here
    // would bake *this* worktree's own node_modules path into the shared post-checkout
    // dispatcher, breaking it for every other worktree, including the main checkout, the moment
    // this one is removed (TASK-42 review).
    execFileSync('mise', ['exec', '--', 'pnpm', 'install', '--frozen-lockfile'], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, CI: '1', LEFTHOOK: '0' },
    });
  } catch (error) {
    console.error('post-checkout: install failed, a layer builder may need to report this rather than push through:', error);
    return 1;
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
