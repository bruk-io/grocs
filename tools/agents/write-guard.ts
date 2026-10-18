// The write guard decision-3's "Enforcement" section asks for: a layer agent may edit
// only within its own layer, its Bash is narrowed to that layer's own checks so the
// boundary can't be bypassed through the shell, and the orchestrator (no agent_type at
// all) writes only the board, root config, the lock file and .claude/. Pure logic; the
// hook at tools/hooks/pre-edit.ts is the only thing that reads the payload and the fs.
import type { Check, Finding, RuleInfo } from '../checks/lib.ts';
import { layerOf, type Layer } from './layers.ts';
import type { LayerConfig } from './generate.ts';
import { agentName, type Role } from './roles.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'write-guard/layer-boundary': {
    req: 'decision-3',
    summary: 'A layer agent writes only within its own layer',
    why: "Each builder and reviewer is scoped to one layer (decision-3) so a slice's contract and review stay inside the boundary the import-layer check already enforces for the code itself (R26, R27). An agent that can write outside its layer makes that boundary a convention, not a guarantee.",
    fix: "Make the change from that layer's own task instead, or ask the orchestrator to route it there.",
  },
  'write-guard/reviewer-writes-nothing': {
    req: 'decision-3',
    summary: 'A reviewer writes nothing, in or out of its own layer',
    why: "A reviewer reports what to change and why; it never makes the change itself (decision-3). Letting it write would make the review and the fix the same step, so nothing independent checks the fix.",
    fix: "Report the finding in the task's notes and let the layer's builder make the change.",
  },
  'write-guard/bash-narrowed': {
    req: 'decision-3',
    summary: "A layer agent's Bash runs only that layer's own test or type-check command",
    why: 'Bash can write files too, so narrowing the tool list alone does not stop the write guard being bypassed through the shell (decision-3). Only the two commands this layer is configured with are allowed.',
    fix: "Run this layer's own test or type-check command. Anything else belongs to the orchestrator or to a different layer's agent.",
  },
  'write-guard/orchestrator-scope': {
    req: 'decision-3',
    summary: 'The orchestrator writes only the board, root config, the lock file and .claude/',
    why: "The orchestrator mediates every layer's contract (decision-3's Mediation and Enforcement sections); if it can also write layer code directly, the boundary it enforces for everyone else stops applying to it.",
    fix: "Delegate the change to that layer's builder agent instead of editing the file from the orchestrator.",
  },
};

export interface ParsedAgent {
  readonly role: Role;
  readonly layer: Layer;
}

const AGENT_NAME = /^(builder|reviewer)-([a-z]+)(-small)?$/;

/** The role and layer a generated agent name encodes, or null for any other agent_type (including none). */
export function parseAgentType(agentType: string | undefined, layers: readonly Layer[]): ParsedAgent | null {
  if (!agentType) return null;
  const found = AGENT_NAME.exec(agentType);
  if (!found) return null;
  const [, prefix, layer, small] = found;
  if (!layers.includes(layer as Layer)) return null;
  const role: Role = prefix === 'reviewer' ? 'reviewer' : small ? 'builder-small' : 'builder';
  return { role, layer: layer as Layer };
}

export function reviewLayerEdit(agent: ParsedAgent, file: string): Finding[] {
  if (agent.role === 'reviewer') {
    return [{ rule: 'write-guard/reviewer-writes-nothing', file, detail: `${agentName(agent.role, agent.layer)} has no Write or Edit tool; it reports, it does not write` }];
  }
  const fileLayer = layerOf(file);
  if (fileLayer === agent.layer) return [];
  const where = fileLayer ? `the ${fileLayer} layer` : 'outside any layer';
  return [
    {
      rule: 'write-guard/layer-boundary',
      file,
      detail: `${agentName(agent.role, agent.layer)} may write only within the ${agent.layer} layer; this file is in ${where}`,
    },
  ];
}

export function reviewLayerBash(agent: ParsedAgent, command: string, config: Pick<LayerConfig, 'testCommand' | 'typecheckCommand'>): Finding[] {
  const trimmed = command.trim();
  if (trimmed === config.testCommand || trimmed === config.typecheckCommand) return [];
  return [
    {
      rule: 'write-guard/bash-narrowed',
      file: 'bash',
      detail: `${agentName(agent.role, agent.layer)} ran "${trimmed}", not this layer's "${config.testCommand}" or "${config.typecheckCommand}"`,
    },
  ];
}

const ORCHESTRATOR_ALLOWED: readonly RegExp[] = [/^backlog\//, /^\.claude\//, /^[^/]+$/];

/** `file` is a repo-relative path. A path with no "/" is a root-level config file. */
export function reviewOrchestratorEdit(file: string): Finding[] {
  if (ORCHESTRATOR_ALLOWED.some((re) => re.test(file))) return [];
  return [
    {
      rule: 'write-guard/orchestrator-scope',
      file,
      detail: 'the orchestrator (no agent_type) writes only backlog/, .claude/, the lock file and root-level config',
    },
  ];
}

export const check: Check = { id: 'write-guard', rules, run: () => [] };
