// The domain never performs I/O, reads the clock or generates ids (R25). Imports are checked by
// import-layers; this catches the ambient globals that need no import.
import ts from 'typescript';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isTestFile } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'core-purity/no-ambient-io': {
    req: 'R25',
    summary: 'Domain functions take data and return data: no clock, randomness, network, storage or timers',
    why: 'A function that reads the clock or makes an id gives different answers for the same input, so it cannot be tested exactly, replayed, or shared safely by two apps. The merge rules (R17 to R20) depend on this.',
    fix: 'Take the time, id or value as a parameter. Commands read the Clock and IdGenerator ports and pass the results into the domain function.',
  },
};

const BANNED_GLOBALS = new Set(['Date', 'fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'process', 'performance', 'setTimeout', 'setInterval', 'queueMicrotask', 'crypto', 'navigator', 'window', 'document', 'globalThis', 'require']);

export function findAmbientUses(file: string, source: string): { line: number; text: string }[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const hits: { line: number; text: string }[] = [];
  const add = (node: ts.Node, text: string): void => {
    hits.push({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && BANNED_GLOBALS.has(node.text)) {
      const p = node.parent;
      const isName = (ts.isPropertyAccessExpression(p) && p.name === node) || (ts.isPropertyAssignment(p) && p.name === node) || ts.isTypeReferenceNode(p) || ts.isPropertySignature(p) || ts.isImportSpecifier(p);
      if (!isName) add(node, node.text);
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Math' && node.name.text === 'random') add(node, 'Math.random');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  for (const file of ctx.files) {
    if (!file.startsWith('packages/core/src/') || isTestFile(file)) continue;
    for (const hit of findAmbientUses(file, ctx.readSource(file))) {
      out.push({ rule: 'core-purity/no-ambient-io', file, line: hit.line, detail: `uses ${hit.text}` });
    }
  }
  return out;
}

export const check: Check = { id: 'core-purity', rules, run };
