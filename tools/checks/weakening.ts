// Changes that weaken a check (R57): focusing or skipping a test, deleting a test,
// loosening a check's configuration. The same review function is used before an
// agent edit (tools/hooks/pre-edit.ts), at pre-commit (staged diff) and in CI (diff
// against the base branch), so all three agree.
import type { Check, Finding, RuleInfo } from './lib.ts';
import { isStoryFile, isTestFile } from './lib.ts';
import { BASELINE_FIX, BASELINE_WHY, isBaselinePath } from './visual-baselines.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'weakening/focus-test': {
    req: 'R57',
    summary: 'Do not focus a test',
    why: 'A focused test (.only, fit, fdescribe) silently stops every other test in the file from running, so a green run proves less than it appears to.',
    fix: 'Remove the .only. To work on one test, run it by name: vitest run -t "<name>".',
  },
  'weakening/skip-test': {
    req: 'R57',
    summary: 'Do not skip a test',
    why: 'A skipped or todo test keeps its place in the suite while checking nothing, so the suite stays green while the behaviour is unproven.',
    fix: 'Fix the code or the test. If the behaviour is truly gone, delete the test in the same change and say why in the commit message, with a human reviewer.',
  },
  'weakening/delete-test': {
    req: 'R57',
    summary: 'Do not delete a test or shrink a test file',
    why: 'Deleting a failing test is the quickest way to make a build pass and the easiest way to lose a guarantee. R46 to R49 need tests to exist for every domain function, command, port and rule.',
    fix: 'Make the test pass. If the behaviour was removed on purpose, ask the person who owns the spec to confirm, and replace the test with one for the new behaviour.',
  },
  'weakening/loosen-check-config': {
    req: 'R57',
    summary: 'Do not loosen a check, hook, runner or CI configuration',
    why: 'A check that can be edited by the thing it checks proves nothing. Removing a rule, excluding a path or turning a failure into a warning makes the change under review pass without making it correct.',
    fix: 'Change the code so the check passes. If the check itself is wrong, ask the person who owns the spec; a human makes that change.',
  },
  'weakening/edit-baseline': {
    req: 'R57, R65',
    summary: 'Do not edit or delete a visual baseline outside visual:update',
    why: BASELINE_WHY,
    fix: BASELINE_FIX,
  },
};

export type Severity = 'deny' | 'ask';
export interface Weakening extends Finding {
  readonly severity: Severity;
}

/** Files whose content decides whether other files pass. */
const CHECK_CODE = /^(tools\/checks|tools\/hooks)\/(?!.*\.test\.ts$).+/;
const CHECK_CONFIG = [
  /^\.claude\/settings(\.local)?\.json$/,
  /^lefthook\.yml$/,
  /^\.github\/workflows\/.+/,
  /(^|\/)vitest\.(config|workspace)\.[cm]?[jt]s$/,
  /(^|\/)tsconfig[^/]*\.json$/,
  /^firebase\.json$/,
];
const LOOSENING_WORDS = /\b(exclude|excludes|ignore|ignored|allowOnly|passWithNoTests|continue-on-error|warn|off|disable\w*|skip\w*|todo|threshold|bail)\b/i;

/**
 * A tool edit (Edit or Write) to anything in the baseline folder. Baselines are images and a manifest that
 * `pnpm --filter @grocs/ui visual:update` writes; no hand edit is a legitimate way to change them. A change
 * that reaches the repository some other way is caught by the visual-baselines check, which compares the
 * folder with the manifest.
 */
export function reviewBaselineEdit(file: string): Weakening[] {
  if (!isBaselinePath(file)) return [];
  return [{ rule: 'weakening/edit-baseline', severity: 'deny', file, detail: `${file} is a visual baseline, and only visual:update may create, change or delete it` }];
}

/** Shell commands that write to or delete from the baseline folder. A visual:update run does not name the folder. */
const BASELINE_PATH_IN_COMMAND = /visual-baselines/;
const BASELINE_MUTATION = /\b(rm|mv|cp|rsync|install|touch|truncate|dd|tee|ln|unlink|chmod|git\s+(rm|mv))\b|\bsed\s+-\w*i|\bperl\s+-\w*i|-delete\b|-exec\b|(?<![0-9&])>(?!&)/;
export function reviewBaselineBash(command: string): Weakening[] {
  if (!BASELINE_PATH_IN_COMMAND.test(command) || !BASELINE_MUTATION.test(command)) return [];
  return [{ rule: 'weakening/edit-baseline', severity: 'deny', file: 'bash', detail: `the command changes the visual baselines from the shell: ${command.slice(0, 120)}` }];
}

export const isCheckCode = (f: string): boolean => CHECK_CODE.test(f);
export const isCheckConfig = (f: string): boolean => CHECK_CONFIG.some((re) => re.test(f));
export const isProtected = (f: string): boolean => isCheckCode(f) || isCheckConfig(f);

const FOCUS = /\.only\s*[(`]|\b(fit|fdescribe|ftest)\s*\(/;
const SKIP = /\.(skip|skipIf|todo)\b|\b(xit|xtest|xdescribe)\s*\(/;
const TEST_CALL = /\b(it|test)(\.(each|concurrent|for|only|skip|todo|skipIf|runIf|fails))*\s*[(`]/g;

export function countTests(text: string): number {
  return (text.match(TEST_CALL) ?? []).length;
}

/** Lines in `b` that are not in `a`, counted as a multiset. */
function lineDiff(a: string, b: string): { added: string[]; removed: string[] } {
  const bag = new Map<string, number>();
  for (const l of a.split('\n')) bag.set(l, (bag.get(l) ?? 0) + 1);
  const added: string[] = [];
  for (const l of b.split('\n')) {
    const n = bag.get(l) ?? 0;
    if (n > 0) bag.set(l, n - 1);
    else added.push(l);
  }
  const removed: string[] = [];
  for (const [l, n] of bag) for (let i = 0; i < n; i++) removed.push(l);
  return { added, removed };
}

const trivial = (l: string): boolean => l.trim() === '' || /^\s*(\/\/|#|\*|\/\*)/.test(l);

/**
 * Review one file's change. `before` or `after` is null when the file did not exist or was deleted.
 * Returns the weakenings it finds; an empty list means the change may go ahead.
 */
export function reviewChange(file: string, before: string | null, after: string | null): Weakening[] {
  const out: Weakening[] = [];
  const add = (rule: string, severity: Severity, detail: string, line?: number): void => {
    out.push({ rule, severity, file, detail, ...(line ? { line } : {}) });
  };

  if (isTestFile(file) || isStoryFile(file)) {
    if (before !== null && after === null) {
      add('weakening/delete-test', 'deny', `the test file ${file} is deleted`);
      return out;
    }
    if (after !== null) {
      const { added } = lineDiff(before ?? '', after);
      const lines = after.split('\n');
      for (const l of added) {
        const where = lines.indexOf(l) + 1;
        if (FOCUS.test(l)) add('weakening/focus-test', 'deny', `adds a focused test: ${l.trim()}`, where);
        else if (SKIP.test(l)) add('weakening/skip-test', 'deny', `adds a skipped or todo test: ${l.trim()}`, where);
      }
      if (before !== null && isTestFile(file) && countTests(after) < countTests(before)) {
        add('weakening/delete-test', 'deny', `the file has ${countTests(after)} tests, down from ${countTests(before)}`);
      }
    }
    return out;
  }

  if (isProtected(file) && before !== null) {
    if (after === null) {
      add('weakening/loosen-check-config', 'ask', `${file} is deleted`);
      return out;
    }
    const { added, removed } = lineDiff(before, after);
    const removedReal = removed.filter((l) => !trivial(l));
    const addedReal = added.filter((l) => !trivial(l));
    if (isCheckConfig(file)) {
      if (removedReal.length > 0) {
        add('weakening/loosen-check-config', 'ask', `removes ${removedReal.length} line(s), for example: ${removedReal[0]!.trim()}`);
      }
      const loosening = addedReal.find((l) => LOOSENING_WORDS.test(l));
      if (loosening) add('weakening/loosen-check-config', 'ask', `adds a line that can loosen a check: ${loosening.trim()}`);
    } else if (removedReal.length > addedReal.length) {
      add('weakening/loosen-check-config', 'ask', `the check code shrinks by ${removedReal.length - addedReal.length} line(s)`);
    }
  }
  return out;
}

export const check: Check = { id: 'weakening', rules, run: () => [] };
