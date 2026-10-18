// Nothing in the repository may point at a production Firebase project (R52, R51).
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'firebase-isolation/no-production': {
    req: 'R52, R51',
    summary: 'Nothing in the repository points at a production Firebase project',
    why: 'Every test and development run must be safe on a developer\'s machine: no production data to damage, no credentials to leak. A demo- project id makes the emulators refuse real services.',
    fix: 'Use the project id "demo-grocs" and the emulator hosts. Keep real project ids, google-services files and keys out of the repository; they belong to the release build pipeline, which injects them at build time.',
  },
};

const FORBIDDEN_FILES = [/(^|\/)\.firebaserc$/, /(^|\/)google-services\.json$/, /(^|\/)GoogleService-Info\.plist$/, /(^|\/)service-?account[^/]*\.json$/i];
const SCANNED = /\.(ts|tsx|mts|js|jsx|mjs|cjs|json|ya?ml|rules|sh)$/;

const PATTERNS: readonly { re: RegExp; what: string }[] = [
  { re: /projectId['"]?\s*[:=]\s*['"](?!demo-)[^'"]+['"]/g, what: 'a projectId that is not a demo- project' },
  { re: /\bfirebase(?:-tools)?\s[^\n'"&;|]*?--project[ =]+['"]?(?!demo-)[A-Za-z0-9_-]+/g, what: 'a firebase command with a project that is not a demo- project' },
  { re: /\bfirebase\s+deploy\b/g, what: 'a firebase deploy command' },
  { re: /AIza[0-9A-Za-z_-]{35}/g, what: 'what looks like a Google API key' },
  { re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, what: 'a private key' },
  { re: /\b[a-z0-9-]+\.firebaseio\.com\b|\bfirestore\.googleapis\.com\b/g, what: 'a production Firebase host' },
];

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  for (const file of ctx.allFiles) {
    if (file.startsWith('tools/checks/')) continue;
    if (FORBIDDEN_FILES.some((re) => re.test(file))) {
      out.push({ rule: 'firebase-isolation/no-production', file, detail: `${file} is a production Firebase configuration file` });
      continue;
    }
    if (!SCANNED.test(file)) continue;
    const text = ctx.readSource(file);
    for (const { re, what } of PATTERNS) {
      for (const m of text.matchAll(re)) {
        const line = text.slice(0, m.index).split('\n').length;
        out.push({ rule: 'firebase-isolation/no-production', file, line, detail: `contains ${what}: ${m[0]}` });
      }
    }
  }
  return out;
}

export const check: Check = { id: 'firebase-isolation', rules, run };
