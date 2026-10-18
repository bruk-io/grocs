// Story coverage (R63): every component declares its states and has a story for each.
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isStoryFile, isTestFile } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'story-coverage/declare-states': {
    req: 'R61, R63',
    summary: 'Every component declares its states',
    why: 'The list of states is what the stories, the tests and the design review are checked against. A component that does not list them cannot be shown to be complete.',
    fix: 'Export a list next to the component, for example: export const CHECKBOX_STATES = ["rest", "checked", "pressed", "focus", "disabled"] as const;',
  },
  'story-coverage/missing-story-file': {
    req: 'R63',
    summary: 'Every component has a stories file',
    why: 'Stories are the one place each state is written, then viewed in Storybook and rendered by the component tests (R65).',
    fix: 'Add <Component>.stories.tsx beside the component with one story per declared state.',
  },
  'story-coverage/missing-story': {
    req: 'R63',
    summary: 'Every declared state has a story',
    why: 'A state without a story is never viewed on the phones or in the browser and never tested.',
    fix: 'Export a story named after the state in PascalCase (state "inCart" -> export const InCart) from the stories file.',
  },
};

const LEVEL_DIR = /^packages\/ui\/src\/(atoms|molecules|organisms|templates)\/[^/]+\.tsx$/;
const STATES = /export const \w+_STATES\s*=\s*\[([^\]]*)\]/;

const pascal = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  const files = new Set(ctx.files);
  for (const file of ctx.files) {
    if (!LEVEL_DIR.test(file) || isStoryFile(file) || isTestFile(file)) continue;
    const match = STATES.exec(ctx.readSource(file));
    if (!match) {
      out.push({ rule: 'story-coverage/declare-states', file, detail: `${file} exports no <NAME>_STATES list` });
      continue;
    }
    const states = [...(match[1] ?? '').matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]!);
    const storiesFile = file.replace(/\.tsx$/, '.stories.tsx');
    if (!files.has(storiesFile)) {
      out.push({ rule: 'story-coverage/missing-story-file', file, detail: `${storiesFile} does not exist` });
      continue;
    }
    const stories = ctx.readSource(storiesFile);
    const exported = new Set([...stories.matchAll(/export const (\w+)/g)].map((m) => m[1]!));
    for (const state of states) {
      if (!exported.has(pascal(state))) {
        out.push({ rule: 'story-coverage/missing-story', file: storiesFile, detail: `state "${state}" has no story named ${pascal(state)}` });
      }
    }
  }
  return out;
}

export const check: Check = { id: 'story-coverage', rules, run };
