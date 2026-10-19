// Layer-agent definitions (decision-3): the 18 committed files under .claude/agents/
// must match what the generator produces from the template and the six configs, and
// their pinned model and effort must agree with the route table (board.py's route(),
// mirrored in tools/agents/roles.ts since that plugin path does not exist in CI).
//
// .claude is in lib.ts's SKIP_DIRS, so ctx.files/ctx.allFiles never list these paths.
// This check reads each expected path directly with ctx.readSource instead of
// enumerating, since SKIP_DIRS only governs listFiles, not a read by known path.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
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
  'agent-definitions/route-mirror-stale': {
    req: 'R55, R58',
    summary: "ROUTE_TABLE_MIRROR in tools/agents/roles.ts still matches the installed philosophy plugin's board.py",
    why: 'The mirror is a hand transcription (decision-3 Enforcement) with nothing else detecting drift: a plugin upgrade that changes a route silently leaves every generated definition pinned to the old model while every other check stays green.',
    fix: "Update ROUTE_TABLE_MIRROR in tools/agents/roles.ts to match the installed plugin's board.py (its own comment names the exact lines), then run: pnpm agents:generate",
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
  out.push(...checkRouteMirrorFreshness(readPluginBoardPySource()).findings);
  return out;
}

/**
 * The installed philosophy plugin's board.py, read fresh each call so a plugin upgrade
 * is picked up without restarting anything. Returns null, never throws, when it cannot
 * be found or read (wrong machine, CI, a version with no scripts/board.py) — callers
 * decide what "could not verify" means, this just reports the fact.
 * GROCS_PLUGIN_BOARD_PY overrides the lookup entirely, for tests.
 */
export function readPluginBoardPySource(): string | null {
  try {
    const override = process.env['GROCS_PLUGIN_BOARD_PY'];
    if (override) return readFileSync(override, 'utf8');
    const base = join(homedir(), '.claude/plugins/cache/knowhere/philosophy');
    if (!existsSync(base)) return null;
    const versions = readdirSync(base).filter((v) => existsSync(join(base, v, 'scripts/board.py')));
    versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const latest = versions.at(-1);
    return latest ? readFileSync(join(base, latest, 'scripts/board.py'), 'utf8') : null;
  } catch {
    return null;
  }
}

type RouteKey = 'ORCHESTRATE' | 'LEAF' | 'SMALL_LEAF';
interface ParsedRoute {
  readonly model: string;
  readonly effort: string | null;
}
/** Matches a line like `LEAF = Route("sonnet", "medium", ...)` or `SMALL_LEAF = Route("haiku", None, ...)`. */
const ROUTE_LINE = /^(ORCHESTRATE|LEAF|SMALL_LEAF)\s*=\s*Route\(\s*"([^"]+)"\s*,\s*(None|"([^"]+)")/gm;

function parsePluginRoutes(source: string): Partial<Record<RouteKey, ParsedRoute>> {
  const out: Partial<Record<RouteKey, ParsedRoute>> = {};
  for (const m of source.matchAll(ROUTE_LINE)) {
    const name = m[1] as RouteKey;
    const model = m[2]!;
    const effort = m[3] === 'None' ? null : (m[4] ?? null);
    out[name] = { model, effort };
  }
  return out;
}

export interface RouteMirrorResult {
  readonly findings: Finding[];
  /** Set only when the plugin's board.py could not be read, so nothing below was checked this run. */
  readonly note: string | null;
}

/**
 * Compares ROUTE_TABLE_MIRROR against the installed plugin's board.py, in three states:
 * unreadable (boardPySource is null, e.g. in CI) reports a note and no findings, since
 * an absent plugin cache is not itself a defect; readable but a route no longer parses
 * is a finding, since a file that exists but can't be verified is not a pass; readable,
 * parsed and disagreeing with the mirror is a finding. A pure function of its input so
 * every state is testable without touching the filesystem.
 */
export function checkRouteMirrorFreshness(boardPySource: string | null): RouteMirrorResult {
  const file = 'tools/agents/roles.ts';
  if (boardPySource === null) {
    return {
      findings: [],
      note: "could not read the installed philosophy plugin's board.py (not found on disk, e.g. in CI) — ROUTE_TABLE_MIRROR in tools/agents/roles.ts was not checked against it this run.",
    };
  }
  const parsed = parsePluginRoutes(boardPySource);
  const findings: Finding[] = [];
  const mirrored: readonly [RouteKey, { model: string; effort?: 'medium' | 'high' | undefined }][] = [
    ['ORCHESTRATE', ROUTE_TABLE_MIRROR.ORCHESTRATE],
    ['LEAF', ROUTE_TABLE_MIRROR.LEAF],
    ['SMALL_LEAF', ROUTE_TABLE_MIRROR.SMALL_LEAF],
  ];
  for (const [key, expected] of mirrored) {
    const found = parsed[key];
    if (!found) {
      findings.push({
        rule: 'agent-definitions/route-mirror-stale',
        file,
        detail: `board.py no longer has a parseable "${key} = Route(...)" line; ROUTE_TABLE_MIRROR.${key} could not be checked against it`,
      });
      continue;
    }
    const expectedEffort = expected.effort ?? null;
    if (found.model !== expected.model || found.effort !== expectedEffort) {
      findings.push({
        rule: 'agent-definitions/route-mirror-stale',
        file,
        detail: `ROUTE_TABLE_MIRROR.${key} is ${expected.model}/${expectedEffort ?? '(none)'}, the installed plugin's board.py now has ${key} = ${found.model}/${found.effort ?? '(none)'}`,
      });
    }
  }
  return { findings, note: null };
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

function notes(): readonly string[] {
  const { note } = checkRouteMirrorFreshness(readPluginBoardPySource());
  return note ? [note] : [];
}

export const check: Check = { id: 'agent-definitions', rules, run, notes };
