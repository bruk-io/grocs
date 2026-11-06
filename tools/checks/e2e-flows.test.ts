import { describe, expect, it } from 'vitest';
import { flowFindings } from './e2e-flows.ts';

const flow = (steps: string, appId = 'io.bruk.grocs.dev') => `appId: ${appId}\n---\n${steps}\n`;
const rulesOf = (file: string, source: string) => flowFindings(file, source).map((f) => f.rule);

describe('e2e-flows', () => {
  it('passes a flow that signs in through the sign-in subflow first', () => {
    expect(rulesOf('apps/mobile/e2e/add.yaml', flow('- runFlow: subflows/sign-in.yaml\n- tapOn: "Add"'))).toEqual([]);
  });

  it('passes the sign-in subflow opening the dev-sign-in link', () => {
    expect(rulesOf('apps/mobile/e2e/subflows/sign-in.yaml', flow('- openLink: "grocs://dev-sign-in?as=${ACCOUNT}"'))).toEqual([]);
  });

  it('fails a flow that does not sign in through the subflow before anything else', () => {
    expect(rulesOf('apps/mobile/e2e/add.yaml', flow('- tapOn: "Add"\n- runFlow: subflows/sign-in.yaml'))).toEqual(['e2e-flows/signs-in-through-dev-link']);
  });

  it('fails a flow that taps Continue with Google', () => {
    expect(rulesOf('apps/mobile/e2e/add.yaml', flow('- runFlow: subflows/sign-in.yaml\n- tapOn: "Continue with Google"'))).toEqual(['e2e-flows/no-real-sign-in']);
  });

  it('fails any link but dev-sign-in, and dev-sign-in outside the subflow', () => {
    const own = flow('- runFlow: subflows/sign-in.yaml\n- openLink: "grocs://dev-sign-in?as=alex"\n- openLink: "https://example.com"');
    expect(rulesOf('apps/mobile/e2e/add.yaml', own)).toEqual(['e2e-flows/no-real-sign-in', 'e2e-flows/no-real-sign-in']);
  });

  it('fails a flow naming another app, or none', () => {
    expect(rulesOf('apps/mobile/e2e/add.yaml', flow('- runFlow: subflows/sign-in.yaml', 'io.bruk.grocs.demo'))).toEqual(['e2e-flows/app-id']);
    expect(rulesOf('apps/mobile/e2e/add.yaml', '---\n- runFlow: subflows/sign-in.yaml\n')).toEqual(['e2e-flows/app-id']);
  });
});
