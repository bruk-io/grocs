// Generates src/tokens/tokens.ts from src/tokens/tokens.json (R59). tokens.json is the only place a
// colour, size, radius, type or motion value is written; the check "tokens-in-sync" fails when
// tokens.ts differs from what this script produces.
//
//   node tools/build-tokens.ts          writes tokens.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HEADER = `// GENERATED from tokens.json by tools/build-tokens.ts (R59). Do not edit.
// Change tokens.json, then run: pnpm tokens
`;

const REFERENCE = /^\{([\w.]+)\}$/;

/**
 * Replaces every "{group.name}" string with the value it names, so a token that is built from
 * another (a shadow's colour) is written once. An unknown reference throws, naming the path.
 */
export function resolveReferences(root: Record<string, unknown>): Record<string, unknown> {
  const lookup = (path: string): unknown => {
    let node: unknown = root;
    for (const key of path.split('.')) {
      if (typeof node !== 'object' || node === null || !(key in node)) throw new Error(`tokens.json: reference {${path}} names no token`);
      node = (node as Record<string, unknown>)[key];
    }
    if (typeof node === 'string' && REFERENCE.test(node)) throw new Error(`tokens.json: reference {${path}} points at another reference`);
    return node;
  };
  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') {
      const match = REFERENCE.exec(node);
      return match ? lookup(match[1]!) : node;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (typeof node === 'object' && node !== null) return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]));
    return node;
  };
  return walk(root) as Record<string, unknown>;
}

/** The text of tokens.ts for a parsed tokens.json. Pure. */
export function renderTokensTs(source: Record<string, unknown>): string {
  const { contrastPairs: _pairs, ...values } = resolveReferences(source);
  return `${HEADER}
export const tokens = ${JSON.stringify(values, null, 2)} as const;

export type Tokens = typeof tokens;
`;
}

const here = dirname(fileURLToPath(import.meta.url));
export const TOKENS_JSON = join(here, '../packages/ui/src/tokens/tokens.json');
export const TOKENS_TS = join(here, '../packages/ui/src/tokens/tokens.ts');

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const source = JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as Record<string, unknown>;
  writeFileSync(TOKENS_TS, renderTokensTs(source));
}
