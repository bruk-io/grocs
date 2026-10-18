// Direct console use outside the console provider (R37).
import ts from 'typescript';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

/** The one place allowed to write to the console. */
export const CONSOLE_PROVIDER_PREFIX = 'packages/providers-device/src/console-logger';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'console-use/direct-console': {
    req: 'R37',
    summary: 'Only the console provider writes to the console',
    why: 'Every log record goes through the logging port so it gets one shape, a correlation id and personal-field redaction (R34, R36). A stray console.log skips all of that and can leak an item name.',
    fix: 'Take the Logger port as a parameter and call it. Do not call console directly; the instrumentation layer logs port calls and commands for you (R31, R32).',
  },
};

export function findConsoleUses(file: string, source: string): { line: number; text: string }[] {
  const kind = file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const hits: { line: number; text: string }[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === 'console') {
      const parent = node.parent;
      const isPropertyName =
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node) ||
        (ts.isPropertySignature(parent) && parent.name === node) ||
        (ts.isMethodDeclaration(parent) && parent.name === node) ||
        ts.isImportSpecifier(parent) ||
        ts.isTypeReferenceNode(parent);
      if (!isPropertyName) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        hits.push({ line: line + 1, text: parent.getText(sf).split('\n')[0]!.slice(0, 60) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  for (const file of ctx.files) {
    if (!/^(apps|packages)\//.test(file)) continue;
    if (file.startsWith(CONSOLE_PROVIDER_PREFIX)) continue;
    for (const hit of findConsoleUses(file, ctx.readSource(file))) {
      out.push({ rule: 'console-use/direct-console', file, line: hit.line, detail: `uses console directly: ${hit.text}` });
    }
  }
  return out;
}

export const check: Check = { id: 'console-use', rules, run };
