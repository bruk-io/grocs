// End-to-end flows point only at the emulators (R51, R52, R55; TASK-62).
// A flow reaches the emulators' seed data only by signing in through the development build's
// grocs://dev-sign-in link: native.ts offers that sign-in only in a development build connected to the
// emulators, so a flow that signs in that way cannot touch live data. Real Google sign-in, or any other
// link, could reach the live project, so those are refused here.
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const FLOWS_DIR = 'apps/mobile/e2e/';
export const SIGN_IN_SUBFLOW = 'subflows/sign-in.yaml';
export const APP_ID = 'io.bruk.grocs.dev';
const DEV_SIGN_IN_LINK = /^grocs:\/\/dev-sign-in\?as=/;

export const rules: Readonly<Record<string, RuleInfo>> = {
  'e2e-flows/signs-in-through-dev-link': {
    req: 'R51, R52',
    summary: 'Every end-to-end flow signs in through the development build\'s dev-sign-in link',
    why: 'That link signs a seed account in only when the build is connected to the emulators, so it is what keeps a flow off live data. A flow that skips it runs as whoever the phone already is, which can be a real account on the live project.',
    fix: `Start the flow with \`- runFlow: ${SIGN_IN_SUBFLOW}\` (with ACCOUNT set to alex or sam), before any other step.`,
  },
  'e2e-flows/no-real-sign-in': {
    req: 'R51, R52',
    summary: 'No end-to-end flow uses Google sign-in or opens any link but dev-sign-in',
    why: 'Google sign-in and other links reach the live Firebase project, which the flows must never touch (R52: no production data).',
    fix: 'Sign in with the sign-in subflow only. To reach a screen, tap through the app rather than opening a link.',
  },
  'e2e-flows/app-id': {
    req: 'R51',
    summary: `Every end-to-end flow names the development build, ${APP_ID}`,
    why: 'A flow naming another app (the demo variant, say) tests something that is not the real app and has no dev-sign-in link.',
    fix: `Set \`appId: ${APP_ID}\` at the top of the flow.`,
  },
};

const valueOf = (line: string): string => line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '');

/** The findings for one flow file, from its text alone. */
export function flowFindings(file: string, source: string): Finding[] {
  const out: Finding[] = [];
  const lines = source.split('\n');
  const isSubflow = file.startsWith(`${FLOWS_DIR}subflows/`);
  const appIds = lines.flatMap((l, i) => (/^appId:/.test(l) ? [{ i, value: valueOf(l) }] : []));
  if (appIds.length === 0) out.push({ rule: 'e2e-flows/app-id', file, detail: 'names no appId' });
  for (const { i, value } of appIds) {
    if (value !== APP_ID) out.push({ rule: 'e2e-flows/app-id', file, line: i + 1, detail: `names ${value}` });
  }
  lines.forEach((line, i) => {
    const step = line.trim();
    if (/^-?\s*openLink:/.test(step)) {
      const link = valueOf(step);
      if (!(isSubflow && DEV_SIGN_IN_LINK.test(link))) out.push({ rule: 'e2e-flows/no-real-sign-in', file, line: i + 1, detail: `opens ${link}` });
    }
    if (/^-?\s*(tapOn|text):\s*["']?Continue with Google/.test(step)) {
      out.push({ rule: 'e2e-flows/no-real-sign-in', file, line: i + 1, detail: 'taps Continue with Google' });
    }
  });
  if (!isSubflow) {
    const steps = lines.slice(lines.findIndex((l) => l.trim() === '---') + 1).filter((l) => /^- /.test(l));
    if (steps[0]?.trim() !== `- runFlow: ${SIGN_IN_SUBFLOW}`) {
      out.push({ rule: 'e2e-flows/signs-in-through-dev-link', file, detail: `its first step is ${steps[0]?.trim() ?? 'missing'}` });
    }
  }
  return out;
}

export function run(ctx: CheckContext): Finding[] {
  return ctx.allFiles
    .filter((f) => f.startsWith(FLOWS_DIR) && /\.ya?ml$/.test(f))
    .flatMap((f) => flowFindings(f, ctx.readSource(f)));
}

export const check: Check = { id: 'e2e-flows', rules, run };
