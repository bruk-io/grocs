import { describe, expect, it } from 'vitest';
import { check } from './firebase-isolation.ts';
import { fixture, message } from './fixture.ts';

const run = (files: Record<string, string>) => check.run(fixture(files));

describe('firebase isolation (R52)', () => {
  it('accepts demo projects and emulator hosts', () => {
    expect(
      run({
        'package.json': '{"scripts":{"t":"firebase emulators:exec --project demo-grocs x"}}',
        'packages/providers-firebase/src/a.ts': "export const cfg = { projectId: 'demo-grocs', host: '127.0.0.1:8080' };",
      }),
    ).toEqual([]);
  });

  it('rejects a real project id, a deploy and a production host', () => {
    const findings = run({
      'a.ts': "export const cfg = { projectId: 'grocs-prod' };",
      'package.json': '{"scripts":{"release":"firebase deploy","t":"firebase emulators:exec --project grocs-prod x"}}',
      'b.ts': "fetch('https://firestore.googleapis.com/v1/x');",
    });
    expect(findings.length).toBe(4);
  });

  it('rejects firebase config files that name a real project', () => {
    expect(run({ '.firebaserc': '{}', 'apps/mobile/google-services.json': '{}', 'apps/mobile/GoogleService-Info.plist': '' })).toHaveLength(3);
  });

  it('names the rule and why', () => {
    const [f] = run({ '.firebaserc': '{}' });
    expect(message(check, f!)).toContain('firebase-isolation/no-production (R52, R51)');
    expect(message(check, f!)).toContain('Why:');
  });
});
