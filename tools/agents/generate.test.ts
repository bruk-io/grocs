import { describe, expect, it } from 'vitest';
import { buildDefinitions, definitionPath, loadConfigs, loadTemplate, renderDefinition } from './generate.ts';
import { LAYERS } from './layers.ts';
import { ROLE_SPECS, ROLES, agentName } from './roles.ts';

describe('agent generation (decision-3)', () => {
  it('produces 18 definitions: six layers times three roles', () => {
    const definitions = buildDefinitions(loadTemplate(), loadConfigs());
    expect(definitions).toHaveLength(18);
    expect(new Set(definitions.map((d) => d.path)).size).toBe(18);
  });

  it('names each file builder-<layer>, builder-<layer>-small or reviewer-<layer>', () => {
    for (const layer of LAYERS) {
      expect(definitionPath('builder', layer)).toBe(`.claude/agents/builder-${layer}.md`);
      expect(definitionPath('builder-small', layer)).toBe(`.claude/agents/builder-${layer}-small.md`);
      expect(definitionPath('reviewer', layer)).toBe(`.claude/agents/reviewer-${layer}.md`);
    }
  });

  it('pins the model and effort decision-3 names for each role', () => {
    const configs = loadConfigs();
    const template = loadTemplate();
    const core = configs.find((c) => c.layer === 'core')!;
    expect(renderDefinition(template, 'builder', core)).toMatch(/model: sonnet/);
    expect(renderDefinition(template, 'builder', core)).toMatch(/effort: medium/);
    expect(renderDefinition(template, 'builder-small', core)).toMatch(/model: haiku/);
    expect(renderDefinition(template, 'builder-small', core)).toMatch(/effort: high/);
    expect(renderDefinition(template, 'reviewer', core)).toMatch(/model: opus/);
    expect(renderDefinition(template, 'reviewer', core)).toMatch(/effort: high/);
  });

  it('leaves no unresolved {{token}} in any generated file', () => {
    const definitions = buildDefinitions(loadTemplate(), loadConfigs());
    for (const def of definitions) expect(def.content).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it('restricts each definition to its own layer paths and commands', () => {
    const configs = loadConfigs();
    const template = loadTemplate();
    const providers = configs.find((c) => c.layer === 'providers')!;
    const content = renderDefinition(template, 'builder', providers);
    expect(content).toContain('packages/providers-firebase/**');
    expect(content).toContain('packages/providers-device/**');
    expect(content).toContain(providers.testCommand);
    expect(content).not.toContain('packages/core/**');
  });

  it('gives a reviewer no Write or Edit tool', () => {
    expect(ROLE_SPECS.reviewer.tools).not.toContain('Write');
    expect(ROLE_SPECS.reviewer.tools).not.toContain('Edit');
  });

  it('every role forbids delegating further (Agent)', () => {
    for (const role of ROLES) expect(ROLE_SPECS[role].disallowedTools).toContain('Agent');
  });

  it('agentName matches the generator\'s own path naming', () => {
    for (const layer of LAYERS) {
      for (const role of ROLES) {
        expect(definitionPath(role, layer)).toBe(`.claude/agents/${agentName(role, layer)}.md`);
      }
    }
  });
});
