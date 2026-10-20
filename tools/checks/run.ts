// One entry point for every check. Agent hooks, lefthook and CI all call this file,
// so the three places can never disagree about what is checked (R55).
//
//   node tools/checks/run.ts --mode all                    every check over the whole repo
//   node tools/checks/run.ts --mode files <path>...        after-edit: only findings in those files (R56)
//   node tools/checks/run.ts --mode staged                 pre-commit: everything, plus the staged diff review
//   node tools/checks/run.ts --mode ci --base origin/main  CI: everything, plus the diff review against base
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Check, CheckContext, Finding } from './lib.ts';
import { formatFinding, makeContext } from './lib.ts';
import { checks } from './registry.ts';
import { check as weakeningCheck, isProtected, loadOverrides, reviewChange } from './weakening.ts';

export interface Report {
  readonly check: Check;
  readonly finding: Finding;
}

export function runChecks(ctx: CheckContext, only?: readonly string[]): Report[] {
  const reports: Report[] = [];
  for (const check of checks) {
    if (only && !only.includes(check.id)) continue;
    for (const finding of check.run(ctx)) reports.push({ check, finding });
  }
  return reports;
}

// A real git hook (this file's own "staged"/"ci" modes, via lefthook) sets GIT_DIR, GIT_WORK_TREE,
// GIT_INDEX_FILE and GIT_CEILING_DIRECTORIES for its process tree. Stripped here so a caller that
// passes a `root` other than the ambient repository (hooks.test.ts's isolated fixture, TASK-1.36)
// still gets reviewed against that root, not whatever repository the hook env points at.
const ISOLATE_ENV: NodeJS.ProcessEnv = { ...process.env };
delete ISOLATE_ENV['GIT_DIR'];
delete ISOLATE_ENV['GIT_WORK_TREE'];
delete ISOLATE_ENV['GIT_INDEX_FILE'];
delete ISOLATE_ENV['GIT_CEILING_DIRECTORIES'];

function git(root: string, args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: ISOLATE_ENV });
}

function gitShow(root: string, spec: string): string | null {
  try {
    return execFileSync('git', ['show', spec], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024, env: ISOLATE_ENV });
  } catch {
    return null;
  }
}

/** The commit HEAD and `ref` share, or null when `ref` does not resolve (e.g. no main branch in an isolated fixture). */
function mergeBase(root: string, ref: string): string | null {
  try {
    return execFileSync('git', ['merge-base', 'HEAD', ref], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env: ISOLATE_ENV }).trim();
  } catch {
    return null;
  }
}

/**
 * Review the change for weakened checks. base === 'staged' compares the index with HEAD, except
 * for a protected check file (weakening.ts's isProtected): there, `before` comes from the merge
 * base with main rather than from HEAD. Without that, iterating a check config across several
 * commits on a branch that never touched main reads every shrinking commit as loosening a check
 * that already existed, when the config is new on this branch (DRAFT-9). CI mode already compares
 * against the real base with a three-dot diff, so it is unaffected.
 */
export function reviewGitChange(root: string, base: string): Report[] {
  const staged = base === 'staged';
  const names = staged
    ? git(root, ['diff', '--cached', '--name-status', '--no-renames'])
    : git(root, ['diff', '--name-status', '--no-renames', `${base}...HEAD`]);
  const overrides = loadOverrides(root);
  const stagedBase = staged ? mergeBase(root, 'main') : null;
  const reports: Report[] = [];
  for (const line of names.split('\n').filter(Boolean)) {
    const [status, file] = line.split('\t');
    if (!status || !file) continue;
    let before = gitShow(root, staged ? `HEAD:${file}` : `${base}:${file}`);
    if (staged && stagedBase && isProtected(file) && gitShow(root, `${stagedBase}:${file}`) === null) before = null;
    const after = status === 'D' ? null : gitShow(root, staged ? `:${file}` : `HEAD:${file}`);
    for (const w of reviewChange(file, before, after, overrides)) reports.push({ check: weakeningCheck, finding: w });
  }
  return reports;
}

export function render(reports: readonly Report[]): string {
  return reports.map((r) => formatFinding(r.check, r.finding)).join('\n\n');
}

function main(argv: string[]): number {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const modeAt = argv.indexOf('--mode');
  const mode = modeAt >= 0 ? argv[modeAt + 1] : 'all';
  const baseAt = argv.indexOf('--base');
  const base = baseAt >= 0 ? argv[baseAt + 1] : undefined;
  const paths = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--mode' && argv[i - 1] !== '--base');

  const t0 = performance.now();
  let reports: Report[];
  if (mode === 'files') {
    const changed = paths.map((p) => resolve(p)).map((p) => p.slice(root.length + 1));
    const ctx = makeContext(root, changed);
    reports = runChecks(ctx).filter(
      (r) => changed.includes(r.finding.file) || changed.some((c) => r.finding.detail.includes(c)),
    );
  } else if (mode === 'staged') {
    reports = [...runChecks(makeContext(root)), ...reviewGitChange(root, 'staged')];
  } else if (mode === 'ci') {
    if (!base) {
      console.error('--mode ci needs --base <ref>');
      return 2;
    }
    reports = [...runChecks(makeContext(root)), ...reviewGitChange(root, base)];
  } else if (mode === 'all') {
    reports = runChecks(makeContext(root));
  } else {
    console.error(`unknown mode ${mode}`);
    return 2;
  }

  const ms = Math.round(performance.now() - t0);
  const noteCtx = makeContext(root);
  const notes = checks.flatMap((c) => c.notes?.(noteCtx) ?? []);
  if (reports.length === 0) {
    console.log(`checks passed (${checks.length} checks, ${mode} mode, ${ms} ms)`);
    for (const note of notes) console.log(`note: ${note}`);
    return 0;
  }
  console.error(render(reports));
  console.error(`\n${reports.length} finding(s) (${mode} mode, ${ms} ms)`);
  for (const note of notes) console.error(`note: ${note}`);
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
