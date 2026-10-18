// Layer-agent definitions (decision-3): the 18 committed files under .claude/agents/
// must match what the generator produces from the template and the six configs, and
// their pinned model and effort must agree with the route table (board.py's route(),
// mirrored in tools/agents/roles.ts since that plugin path does not exist in CI).
//
// .claude is in lib.ts's SKIP_DIRS, so ctx.files/ctx.allFiles never list these paths.
// This check reads each expected path directly with ctx.readSource instead of
// enumerating, since SKIP_DIRS only governs listFiles, not a read by known path.
import { buildDefinitions, loadConfigs, loadTemplate } from '../agents/generate.ts';
import { DECISION_3_TABLE, ROLE_SPECS, ROUTE_TABLE_MIRROR, ROLES, type Role, type RoleSpec } from '../agents/roles.ts';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'agent-definitions/drift': {
    req: 'R55, R58',
    summary: 'A committed layer-agent definition matches what the generator produces',
    why: 'The template and the six layer configs are the one source for 18 definitions (decision-3). A hand-edited or stale definition is a second source of truth the generator cannot see and will silently diverge from.',
    fix: 'Edit tools/agents/template.md or tools/agents/configs/<layer>.json, never .claude/agents/*.md directly, and run: pnpm agents:generate',
  },
  'agent-definitions/route-mismatch': {
    req: 'R55',
    summary: "A role's pinned model and effort agree with decision-3 and, where it has one, the plugin's route table",
    why: "decision-3 pins each role's model and effort in line with the plugin's route table (board.py's route(), mirrored in tools/agents/roles.ts since that plugin path does not exist in CI). tools/agents/roles.ts is the one place both are transcribed; if it is edited to disagree with either, every generated definition for that role routes to the wrong model.",
    fix: 'Fix tools/agents/roles.ts (ROLE_SPECS) to agree with DECISION_3_TABLE and, where it applies, ROUTE_TABLE_MIRROR, then run: pnpm agents:generate',
  },
};

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  const definitions = buildDefinitions(loadTemplate(), loadConfigs());
  for (const def of definitions) {
    try {
      const committed = ctx.readSource(def.path);
      if (committed !== def.content) {
        out.push({ rule: 'agent-definitions/drift', file: def.path, detail: 'differs from the generated output' });
      }
    } catch {
      out.push({ rule: 'agent-definitions/drift', file: def.path, detail: 'does not exist: run pnpm agents:generate' });
    }
  }
  out.push(...checkRouteAgreement(ROLE_SPECS));
  return out;
}

/**
 * Compares the generator's own role table against decision-3's table (always) and,
 * for the two roles the plugin's route() actually assigns a model to, against the
 * mirrored route table too. `specs` is a parameter, not the module import, so this is
 * testable by passing a deliberately wrong table.
 */
export function checkRouteAgreement(specs: Readonly<Record<Role, RoleSpec>>): Finding[] {
  const out: Finding[] = [];
  const file = 'tools/agents/roles.ts';
  for (const role of ROLES) {
    const spec = specs[role];
    const decided = DECISION_3_TABLE[role];
    if (spec.model !== decided.model || spec.effort !== decided.effort) {
      out.push({
        rule: 'agent-definitions/route-mismatch',
        file,
        detail: `ROLE_SPECS.${role} is ${spec.model}/${spec.effort ?? '(none)'}, decision-3's table says ${decided.model}/${decided.effort ?? '(none)'}`,
      });
    }
    if (!spec.routeTableCovers) continue;
    const mirrored = role === 'builder' ? ROUTE_TABLE_MIRROR.LEAF : role === 'builder-small' ? ROUTE_TABLE_MIRROR.SMALL_LEAF : null;
    if (!mirrored) continue;
    if (spec.model !== mirrored.model) {
      out.push({
        rule: 'agent-definitions/route-mismatch',
        file,
        detail: `ROLE_SPECS.${role}.model is ${spec.model}, the plugin's route table says ${mirrored.model}`,
      });
    }
    if (mirrored.effort !== undefined && spec.effort !== mirrored.effort) {
      out.push({
        rule: 'agent-definitions/route-mismatch',
        file,
        detail: `ROLE_SPECS.${role}.effort is ${spec.effort ?? '(none)'}, the plugin's route table says ${mirrored.effort}`,
      });
    }
  }
  return out;
}

export const check: Check = { id: 'agent-definitions', rules, run };
