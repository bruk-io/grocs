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

/** The text of tokens.ts for a parsed tokens.json. Pure. */
export function renderTokensTs(source: Record<string, unknown>): string {
  const { contrastPairs: _pairs, ...values } = source;
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
