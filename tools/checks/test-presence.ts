// Tests must exist for domain functions and for commands (R46, R47).
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isStoryFile, isTestFile } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'test-presence/domain-unit-test': {
    req: 'R46',
    summary: 'Every domain module with functions has a unit test beside it',
    why: 'The domain rules are shared by both apps and decide what a member sees. A function with no test can change behaviour without anything failing.',
    fix: 'Add <module>.test.ts beside the module. Merge rules (R17 to R20) also need property tests.',
  },
  'test-presence/command-scenario-test': {
    req: 'R47',
    summary: 'Every command has a scenario test against the in-memory fakes',
    why: 'Commands are where two members\' changes meet. A scenario test, including orderings where both change the same record and where one is offline, is what shows they do not lose or duplicate work.',
    fix: 'Add <command>.scenario.test.ts beside the command, built with createTestClient from the application package.',
  },
};

const EXPORTED_FUNCTION = /export\s+(async\s+)?function\s|export\s+const\s+\w+\s*(:[^=]+)?=\s*(async\s*)?(\([^)]*\)|\w+)\s*(:[^=]+)?=>/;

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  const files = new Set(ctx.files);
  for (const file of ctx.files) {
    if (isTestFile(file) || isStoryFile(file)) continue;
    if (file.startsWith('packages/core/src/') && !file.endsWith('/index.ts')) {
      if (EXPORTED_FUNCTION.test(ctx.readSource(file)) && !files.has(file.replace(/\.ts$/, '.test.ts'))) {
        out.push({ rule: 'test-presence/domain-unit-test', file, detail: `${file.replace(/\.ts$/, '.test.ts')} does not exist` });
      }
    }
    if (/^packages\/application\/src\/commands\/[^/]+\.ts$/.test(file) && !file.endsWith('/index.ts')) {
      const scenario = file.replace(/\.ts$/, '.scenario.test.ts');
      if (!files.has(scenario)) out.push({ rule: 'test-presence/command-scenario-test', file, detail: `${scenario} does not exist` });
    }
  }
  return out;
}

export const check: Check = { id: 'test-presence', rules, run };
