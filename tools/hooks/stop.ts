// Stop hook: the checks on the whole change run before an agent finishes (R56).
// Runs every check, the type check and the fast tests, and the browser pass when the change touches the UI. Exit 2 keeps the agent working.
// If the agent already retried once (stop_hook_active) the hook lets it stop and says so,
// so an unfixable failure cannot trap a session in a loop; CI still fails the change.
import { spawnSync } from 'node:child_process';
import { needsBrowserPass, readPayload, repoRoot } from './lib.ts';

const payload = await readPayload();

const steps: { name: string; cmd: string; args: string[] }[] = [
  { name: 'checks', cmd: 'node', args: ['tools/checks/run.ts', '--mode', 'all'] },
  { name: 'typecheck', cmd: 'pnpm', args: ['-s', 'typecheck'] },
  { name: 'unit tests', cmd: 'pnpm', args: ['-s', 'test'] },
];

/** Files this change touches compared with main: committed, uncommitted and new. Null when that cannot be told. */
function changedFiles(): string[] | null {
  const lines = (args: string[]): string[] | null => {
    const r = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
    return r.status === 0 ? r.stdout.split('\n').filter(Boolean) : null;
  };
  const tracked = lines(['diff', '--name-only', 'main']);
  const untracked = lines(['ls-files', '--others', '--exclude-standard']);
  return tracked && untracked ? [...tracked, ...untracked] : null;
}

// The browser pass (accessibility scan, 44 x 44 targets, screenshot baselines) takes a minute, so it runs
// only when the change can alter a story. If the change cannot be listed, it runs.
const changed = changedFiles();
if (changed === null || needsBrowserPass(changed)) {
  steps.push({ name: 'browser pass', cmd: 'pnpm', args: ['-s', '--filter', '@grocs/ui', 'visual'] });
}

const failures: string[] = [];
for (const step of steps) {
  const r = spawnSync(step.cmd, step.args, { cwd: repoRoot, encoding: 'utf8' });
  if (r.status !== 0) failures.push(`--- ${step.name} failed ---\n${(r.stderr || r.stdout).trim().slice(-4000)}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n\n'));
  if (payload.stop_hook_active) {
    console.error('\n(Second stop attempt with failures: allowing the stop. These still fail in CI.)');
  } else {
    process.exitCode = 2;
  }
}
