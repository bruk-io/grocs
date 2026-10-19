// Shared types and helpers for the check scripts. Plain TypeScript run by Node's
// built-in type stripping (no build step), so it only uses erasable syntax.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** One rule a check enforces, with the reason it exists (R55: no enforcement without the reason). */
export interface RuleInfo {
  /** Requirement ids from doc-1, e.g. "R26, R27". */
  readonly req: string;
  readonly summary: string;
  readonly why: string;
  readonly fix: string;
}

export interface Finding {
  readonly rule: string;
  readonly file: string;
  readonly line?: number;
  readonly detail: string;
}

export interface CheckContext {
  readonly root: string;
  /** Every source file in the repository, root-relative with forward slashes. */
  readonly files: readonly string[];
  /** Every non-ignored file (config, rules, workflows), for checks that read more than source code. */
  readonly allFiles: readonly string[];
  /** Files the current edit or commit touched; empty means "everything". */
  readonly changed: readonly string[];
  readSource(file: string): string;
}

export interface Check {
  readonly id: string;
  readonly rules: Readonly<Record<string, RuleInfo>>;
  run(ctx: CheckContext): Finding[];
  /**
   * Visible, non-failing status lines: something this check could not fully verify this
   * run (for example, a reference it reads from outside the repo that CI cannot see) but
   * that is not itself a defect. Printed by run.ts alongside the pass/fail report; never
   * counted toward the finding total or the exit code, so a check cannot silently pass
   * over a gap in its own coverage without saying so, and cannot fail a run it has no
   * business failing either.
   */
  notes?(ctx: CheckContext): readonly string[];
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.expo',
  'storybook-static',
  '.firebase',
  '.claude',
  'backlog',
  'coverage',
  // expo prebuild output (apps/mobile/android, apps/mobile/ios): regenerated from
  // app.config.ts, gitignored, not in doc-1's repo layout, and always carries a real
  // Firebase config locally once built - never reaches git or CI (Bruk, 2026-10-19).
  'android',
  'ios',
]);
const SOURCE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

export function listFiles(root: string, accept: (name: string) => boolean, dir = root, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || name.startsWith('dist-')) continue; // build output, such as dist-release
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) listFiles(root, accept, full, out);
    else if (accept(name)) out.push(relative(root, full).split(sep).join('/'));
  }
  return out.sort();
}

export const listSourceFiles = (root: string): string[] => listFiles(root, (n) => SOURCE_EXT.test(n));

export function makeContext(root: string, changed: readonly string[] = []): CheckContext {
  return {
    root,
    files: listSourceFiles(root),
    allFiles: listFiles(root, (n) => !/\.(lock|lockb|png|jpg|jpeg|ico|ttf|otf|woff2?)$/.test(n) && n !== 'pnpm-lock.yaml'),
    changed,
    readSource: (file) => readFileSync(join(root, file), 'utf8'),
  };
}

export const isTestFile = (f: string): boolean => /\.(test|spec)\.(ts|tsx|mts|js|jsx)$/.test(f);
export const isStoryFile = (f: string): boolean => /\.stories\.(ts|tsx)$/.test(f);

export function formatFinding(check: Check, f: Finding): string {
  const rule = check.rules[f.rule];
  const where = f.line ? `${f.file}:${f.line}` : f.file;
  if (!rule) return `FAIL ${f.rule} ${where}\n  ${f.detail}`;
  return [
    `FAIL ${f.rule} (${rule.req}): ${rule.summary}`,
    `  at ${where}: ${f.detail}`,
    `  Why: ${rule.why}`,
    `  Fix: ${rule.fix}`,
  ].join('\n');
}
