// Test helper: build a CheckContext from an in-memory map of files.
import type { Check, CheckContext, Finding } from './lib.ts';
import { formatFinding } from './lib.ts';

export function fixture(files: Record<string, string>, changed: string[] = []): CheckContext {
  return {
    root: '/fixture',
    files: Object.keys(files).filter((f) => /\.(ts|tsx|mts|js|jsx|mjs|cjs)$/.test(f)).sort(),
    allFiles: Object.keys(files).sort(),
    trackedFiles: Object.keys(files).sort(),
    changed,
    readSource: (f) => {
      const text = files[f];
      if (text === undefined) throw new Error(`no fixture file ${f}`);
      return text;
    },
  };
}

export const rulesOf = (findings: readonly Finding[]): string[] => findings.map((f) => f.rule);

export const message = (check: Check, f: Finding): string => formatFinding(check, f);
