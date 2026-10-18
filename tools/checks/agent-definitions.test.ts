import { describe, expect, it } from 'vitest';
import { buildDefinitions, loadConfigs, loadTemplate } from '../agents/generate.ts';
import { ROLE_SPECS } from '../agents/roles.ts';
import { fixture, rulesOf } from './fixture.ts';
import { checkRouteAgreement, run } from './agent-definitions.ts';

const definitions = buildDefinitions(loadTemplate(), loadConfigs());
const asFiles = (defs: readonly { path: string; content: string }[]): Record<string, string> =>
  Object.fromEntries(defs.map((d) => [d.path, d.content]));

describe('agent-definitions check: drift (AC1, AC2)', () => {
  it('generates exactly 18 definitions to check against, so the enumeration cannot silently find none', () => {
    expect(definitions).toHaveLength(18);
  });

  it('passes when every committed file matches the generated output and the role table agrees', () => {
    expect(run(fixture(asFiles(definitions)))).toEqual([]);
  });

  it('fails, naming the file, when a committed definition is missing', () => {
    const findings = run(fixture(asFiles(definitions.slice(1))));
    expect(findings).toContainEqual(expect.objectContaining({ rule: 'agent-definitions/drift', file: definitions[0]!.path }));
  });

  it('fails when a committed definition is hand-edited away from the generated output, including its pinned model', () => {
    const target = definitions.find((d) => d.path.endsWith('builder-core.md'))!;
    const files = { ...asFiles(definitions), [target.path]: target.content.replace('model: sonnet', 'model: opus') };
    expect(rulesOf(run(fixture(files)))).toContain('agent-definitions/drift');
  });
});

describe('agent-definitions check: route-table agreement (AC2)', () => {
  it('passes with the real role table', () => {
    expect(checkRouteAgreement(ROLE_SPECS)).toEqual([]);
  });

  it('fails when a builder is repointed to a model the route table does not give size 2-5 work', () => {
    const wrong = { ...ROLE_SPECS, builder: { ...ROLE_SPECS.builder, model: 'opus' as const } };
    const findings = checkRouteAgreement(wrong);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.rule === 'agent-definitions/route-mismatch')).toBe(true);
  });

  it('fails when the small builder disagrees with decision-3 on effort', () => {
    const wrong = { ...ROLE_SPECS, 'builder-small': { ...ROLE_SPECS['builder-small'], effort: 'medium' as const } };
    expect(checkRouteAgreement(wrong).some((f) => f.detail.includes('builder-small'))).toBe(true);
  });

  it('fails when the reviewer disagrees with decision-3, even though the plugin route table has no reviewer row', () => {
    const wrong = { ...ROLE_SPECS, reviewer: { ...ROLE_SPECS.reviewer, effort: 'medium' as const } };
    const findings = checkRouteAgreement(wrong);
    expect(findings.some((f) => f.detail.includes('reviewer') && f.detail.includes("decision-3's table"))).toBe(true);
  });

  it('does not invent a plugin route-table correspondence for the reviewer role', () => {
    // the reviewer's model agreeing with ORCHESTRATE's opus is a coincidence of decision-3's own
    // numbers, not a route() entry: routeTableCovers is false, so no plugin-table finding fires here
    const wrong = { ...ROLE_SPECS, reviewer: { ...ROLE_SPECS.reviewer, model: 'sonnet' as const } };
    const findings = checkRouteAgreement(wrong);
    expect(findings.every((f) => !f.detail.includes("the plugin's route table"))).toBe(true);
  });
});
