// No merge conflict marker may reach a tracked file (R57): a slip like this read as ordinary
// text in a board markdown file on Oct 20, 2026 and nothing else caught it before it reached
// main. Walks ctx.trackedFiles, not ctx.allFiles - allFiles' SKIP_DIRS excludes backlog/ and
// .claude/, exactly where that incident landed.
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'merge-conflict-markers/marker-left-in-file': {
    req: 'R57',
    summary: 'No tracked file holds an unresolved merge conflict marker',
    why: 'A conflict marker left in by mistake reads as ordinary text in most files - a board markdown file, a comment, a string - so nothing else notices before it reaches main or CI.',
    fix: 'Resolve the conflict for real: keep the intended content and remove the <<<<<<<, |||||||, ======= and >>>>>>> lines entirely.',
  },
};

/** Exactly 7 of the marker character (not 8+, so a line of other repeated punctuation never matches), diff3's ||||||| included. */
const MARKER = /^(<{7}(?!<)|\|{7}(?!\|)|={7}(?!=)$|>{7}(?!>))/;

/** The same binary/lockfile extensions lib.ts's makeContext already excludes from allFiles. */
const SKIP_EXT = /\.(lock|lockb|png|jpe?g|ico|ttf|otf|woff2?)$/;

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  for (const file of ctx.trackedFiles) {
    if (SKIP_EXT.test(file) || file === 'pnpm-lock.yaml') continue;
    let text: string;
    try {
      text = ctx.readSource(file);
    } catch {
      continue; // in git's index but not the working tree right now (an unstaged rename or delete)
    }
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (MARKER.test(lines[i]!)) {
        out.push({ rule: 'merge-conflict-markers/marker-left-in-file', file, line: i + 1, detail: `starts with a merge conflict marker: ${lines[i]!.slice(0, 40)}` });
      }
    }
  }
  return out;
}

export const check: Check = { id: 'merge-conflict-markers', rules, run };
