// The real app shows only the kitchen's own data (2026-11-06 sweep; TASK-57, TASK-58, TASK-63, TASK-68).
// Sample content stays for the demo build and the development-only samples route; a real screen or route
// that imports it shows every user someone else's groceries.
import ts from 'typescript';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

/** The only app code allowed to read apps/mobile/src/sample/: the demo composition and the dev-only samples route. */
export const SAMPLE_READERS: readonly RegExp[] = [/^apps\/mobile\/src\/demo\//, /^apps\/mobile\/src\/screens\/SampleGroceriesScreen\.tsx$/, /^apps\/mobile\/app\/groceries-samples\.tsx$/];

export const rules: Readonly<Record<string, RuleInfo>> = {
  'sample-data/real-screen-reads-sample': {
    req: 'R66',
    summary: 'A real screen or route does not read sample data',
    why: "Sample content is the design reference's made-up kitchen (Alex, Sam, Eggplant). On a real screen every member sees it as if it were theirs, which is what the 2026-11-06 sweep found on Quick add, Meal plan, Settings and Join.",
    fix: "Read the kitchen's own data through App (getKitchenInfo, watchWeekItems, ...), or show nothing until there is some. Sample content belongs in stories, the demo build (src/demo) and the dev-only /groceries-samples route.",
  },
};

/** The module specifiers a source file imports. */
export function importsOf(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  return sf.statements.flatMap((s) => (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) ? [s.moduleSpecifier.text] : []));
}

export function readsSample(file: string, source: string): boolean {
  return importsOf(file, source).some((spec) => /(^|\/)sample\/sample-data(\.ts)?$|(^|\/)sample\//.test(spec));
}

export function run(ctx: CheckContext): Finding[] {
  return ctx.files
    .filter((f) => /^apps\/mobile\/(src|app)\//.test(f) && /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f))
    .filter((f) => !f.startsWith('apps/mobile/src/sample/') && !SAMPLE_READERS.some((re) => re.test(f)))
    .filter((f) => readsSample(f, ctx.readSource(f)))
    .map((f) => ({ rule: 'sample-data/real-screen-reads-sample', file: f, detail: 'imports apps/mobile/src/sample/' }));
}

export const check: Check = { id: 'sample-data', rules, run };
