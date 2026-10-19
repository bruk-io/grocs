// The retired canvas (R66): a board in design/reference/ is deleted in the change that builds what it
// shows, so nothing is both built and still in the reference.
import { GENERATED_MARK } from '../svg/render.ts';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isStoryFile, isTestFile } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'reference-built/still-in-reference': {
    req: 'R66',
    summary: 'A board whose components are all built must be deleted from design/reference',
    why: 'Storybook is the only record of the design system. A board that is still in the reference after its components were built is a second copy that drifts, and builders cannot tell which one is current.',
    fix: 'Delete the board (and its PNG in design/reference/shots/, and its entry in canvas.json) in the same change that finished building what it shows.',
  },
};

/** What a design-system board calls a specimen (the word before the first "." or "--") -> the component built for it. */
export const SPECIMEN_NAMES: Readonly<Record<string, string>> = {
  input: 'TextField',
  check: 'Checkbox',
  item: 'ItemRow',
  speech: 'SpeechBubble',
  invite: 'InviteCode',
  skeleton: 'Skeleton',
  icon: 'Icon',
  mascot: 'Mascot',
};

const BOARD = /^design\/reference\/([\w-]+)\.dc\.html$/;
const BUILT_ROOTS = [/^packages\/ui\/src\//, /^apps\/mobile\/(src|app)\//];
const SPECIMEN = /class="ds-(?:name|cap)">\s*([a-z][a-z0-9]*)(?:\.|--)/g;

const pascal = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** The names of the components and screens that exist, with Screen/Template/Page suffixes removed. */
export function builtNames(ctx: CheckContext): Set<string> {
  const names = new Set<string>();
  for (const file of ctx.files) {
    if (!BUILT_ROOTS.some((re) => re.test(file)) || isTestFile(file) || isStoryFile(file)) continue;
    const base = file.split('/').pop()!.replace(/\.(tsx|ts)$/, '');
    if (!/^[A-Z]/.test(base)) continue;
    // Generated art (an icon called Settings is not the Settings screen) is not a component built from a board.
    if (ctx.readSource(file).startsWith(GENERATED_MARK)) continue;
    names.add(base);
    names.add(base.replace(/(Screen|Template|Page)$/, ''));
  }
  // The icon set is one named module, not one file per icon.
  if (ctx.files.includes('packages/ui/src/icons/index.ts')) names.add('Icon');
  return names;
}

/** What a board shows: its own name for a screen, the specimens it labels for a design-system board. */
export function namesOnBoard(stem: string, html: () => string): string[] {
  if (/^D[12]-/.test(stem)) return []; // option boards belong to the design tasks that chose between them
  if (!stem.startsWith('DS-')) return [stem];
  const found = new Set<string>();
  for (const m of html().matchAll(SPECIMEN)) found.add(SPECIMEN_NAMES[m[1]!] ?? pascal(m[1]!));
  return [...found].sort();
}

export function run(ctx: CheckContext): Finding[] {
  const built = builtNames(ctx);
  const out: Finding[] = [];
  for (const file of ctx.allFiles) {
    const m = BOARD.exec(file);
    if (!m) continue;
    const names = namesOnBoard(m[1]!, () => ctx.readSource(file));
    if (names.length > 0 && names.every((n) => built.has(n))) {
      out.push({ rule: 'reference-built/still-in-reference', file, detail: `${names.join(', ')} ${names.length === 1 ? 'is' : 'are all'} built in packages/ui or apps/mobile, and ${file} is still in the reference` });
    }
  }
  return out;
}

export const check: Check = { id: 'reference-built', rules, run };
