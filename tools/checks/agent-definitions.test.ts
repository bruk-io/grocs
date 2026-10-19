import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildDefinitions, loadConfigs, loadTemplate } from '../agents/generate.ts';
import { ROLE_SPECS } from '../agents/roles.ts';
import { fixture, rulesOf } from './fixture.ts';
import { checkRouteAgreement, checkRouteMirrorFreshness, readPluginBoardPySource, run } from './agent-definitions.ts';

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

describe('agent-definitions check: route-mirror staleness against the plugin (AC2, TASK-6)', () => {
  const REAL_BOARD_PY = [
    'class Route(NamedTuple): pass',
    'ORCHESTRATE = Route("opus", "high", "it has children, or it is an intent, a spike or a design")',
    'LEAF = Route("sonnet", "medium", "a leaf at size 2 to 5")',
    'SMALL_LEAF = Route("haiku", None, "a leaf at size 1, given numbered steps")',
    'SWEEP = Route("qwen-27b-local", None, "a sweep that has to read; one a script can do needs none")',
  ].join('\n');

  it('reports no findings and no note when board.py matches the mirror', () => {
    const result = checkRouteMirrorFreshness(REAL_BOARD_PY);
    expect(result.findings).toEqual([]);
    expect(result.note).toBeNull();
  });

  it('reports a note and no findings when the plugin cannot be read at all (the CI case), rather than silently passing', () => {
    const result = checkRouteMirrorFreshness(null);
    expect(result.findings).toEqual([]);
    expect(result.note).not.toBeNull();
    expect(result.note).toMatch(/could not read/i);
  });

  it('fails when board.py now routes LEAF to a different model, naming both values', () => {
    const changed = REAL_BOARD_PY.replace('LEAF = Route("sonnet", "medium"', 'LEAF = Route("opus", "medium"');
    const result = checkRouteMirrorFreshness(changed);
    expect(result.note).toBeNull();
    expect(rulesOf(result.findings)).toEqual(['agent-definitions/route-mirror-stale']);
    expect(result.findings[0]?.detail).toContain('sonnet/medium');
    expect(result.findings[0]?.detail).toContain('opus/medium');
  });

  it('fails when board.py changes an effort, e.g. SMALL_LEAF from the default to a pinned one', () => {
    const changed = REAL_BOARD_PY.replace('SMALL_LEAF = Route("haiku", None', 'SMALL_LEAF = Route("haiku", "low"');
    const result = checkRouteMirrorFreshness(changed);
    expect(result.findings.some((f) => f.detail.includes('SMALL_LEAF'))).toBe(true);
  });

  it('fails, not silently passes, when a route this check expects no longer parses at all', () => {
    const unparseable = REAL_BOARD_PY.replace('LEAF = Route("sonnet", "medium", "a leaf at size 2 to 5")', '# LEAF moved elsewhere');
    const result = checkRouteMirrorFreshness(unparseable);
    expect(result.note).toBeNull();
    expect(result.findings.some((f) => f.detail.includes('no longer has a parseable'))).toBe(true);
  });

  describe('readPluginBoardPySource (disk I/O, isolated from the real plugin cache via GROCS_PLUGIN_BOARD_PY)', () => {
    const written: string[] = [];
    afterEach(() => {
      delete process.env['GROCS_PLUGIN_BOARD_PY'];
      for (const dir of written.splice(0)) rmSync(dir, { recursive: true, force: true });
    });

    it('reads a real file on disk when GROCS_PLUGIN_BOARD_PY points at one', () => {
      const dir = mkdtempSync(join(tmpdir(), 'grocs-board-py-'));
      written.push(dir);
      const path = join(dir, 'board.py');
      writeFileSync(path, REAL_BOARD_PY, 'utf8');
      process.env['GROCS_PLUGIN_BOARD_PY'] = path;
      expect(readPluginBoardPySource()).toBe(REAL_BOARD_PY);
    });

    it('returns null, not a throw, when GROCS_PLUGIN_BOARD_PY points at nothing', () => {
      process.env['GROCS_PLUGIN_BOARD_PY'] = '/nonexistent/path/does-not-exist/board.py';
      expect(readPluginBoardPySource()).toBeNull();
    });
  });
});
