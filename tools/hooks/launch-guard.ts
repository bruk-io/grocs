// PreToolUse hook on the Agent tool: decision-3's agent-launch guard. Blocks launching
// a generated layer agent (builder-<layer>, builder-<layer>-small, reviewer-<layer>)
// unless the brief names a task whose layer label matches the agent, whose model
// (from `board-check route`) matches the agent's pinned model, and, for a size-1 task,
// whose plan has numbered steps. Any other agent_type (the orchestrator launching
// Explore, a philosophy agent, and so on) passes through untouched: decision-3 governs
// only the orchestrator and the 18 layer agents.
//
// Fails closed: if the task, its route or its plan cannot be read, this denies rather
// than allows, since a crash here must not let a mismatched launch through silently
// (hook-invariants: decide deliberately whether a gate fails open or closed).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LAYERS, type Layer } from '../agents/layers.ts';
import { ROLE_SPECS } from '../agents/roles.ts';
import { parseAgentType } from '../agents/write-guard.ts';
import type { HookPayload } from './lib.ts';
import { readPayload, repoRoot } from './lib.ts';

export interface Decision {
  readonly decision: 'allow' | 'deny';
  readonly reason: string;
}

const ALLOW: Decision = { decision: 'allow', reason: '' };
const TASK_ID = /\bTASK-\d+(?:\.\d+)*\b/;

function deny(reason: string): Decision {
  return { decision: 'deny', reason };
}

/** The installed philosophy plugin's board-check script. GROCS_BOARD_CHECK overrides it for tests. */
export function findBoardCheck(): string | null {
  const override = process.env['GROCS_BOARD_CHECK'];
  if (override) return override;
  const base = join(homedir(), '.claude/plugins/cache/knowhere/philosophy');
  if (!existsSync(base)) return null;
  const versions = readdirSync(base).filter((v) => existsSync(join(base, v, 'scripts/board-check')));
  versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const latest = versions.at(-1);
  return latest ? join(base, latest, 'scripts/board-check') : null;
}

export interface TaskInfo {
  readonly labels: readonly string[];
  readonly plan: string;
}

function readTaskLive(id: string, root: string): TaskInfo | null {
  try {
    const out = execFileSync('backlog', ['task', id, '--json'], { cwd: root, encoding: 'utf8' });
    const data = JSON.parse(out) as { task?: { labels?: string[]; implementationPlan?: string } };
    return data.task ? { labels: data.task.labels ?? [], plan: data.task.implementationPlan ?? '' } : null;
  } catch {
    return null;
  }
}

function readRouteLive(id: string, root: string): { model: string } | null {
  const boardCheck = findBoardCheck();
  if (!boardCheck) return null;
  try {
    const out = execFileSync('python3', [boardCheck, 'route', id, '--json', '--root', root], { encoding: 'utf8' });
    const data = JSON.parse(out) as { model?: string };
    return data.model ? { model: data.model } : null;
  } catch {
    return null;
  }
}

/** Reads the task board and the plugin's route table. Swappable so tests need neither `backlog` nor the plugin. */
export interface Deps {
  readTask(id: string, root: string): TaskInfo | null;
  readRoute(id: string, root: string): { model: string } | null;
}

export const LIVE_DEPS: Deps = { readTask: readTaskLive, readRoute: readRouteLive };

/** The numbered lines (`1.`, `2.`, ...) under a plan's "### Order of work" section. */
export function numberedSteps(plan: string): number {
  const heading = /^###\s+Order of work[ \t]*$/m.exec(plan);
  if (!heading) return 0;
  const rest = plan.slice(heading.index + heading[0].length);
  const nextHeading = /^###[ \t]/m.exec(rest);
  const body = nextHeading ? rest.slice(0, nextHeading.index) : rest;
  return (body.match(/^\s*\d+[.)]\s+\S/gm) ?? []).length;
}

export function decide(payload: HookPayload, root: string, deps: Deps = LIVE_DEPS): Decision {
  if (payload.tool_name !== 'Agent') return ALLOW;
  const subagentType = payload.tool_input?.['subagent_type'];
  const prompt = payload.tool_input?.['prompt'];
  const agent = parseAgentType(typeof subagentType === 'string' ? subagentType : undefined, LAYERS);
  if (!agent) return ALLOW;

  const found = typeof prompt === 'string' ? TASK_ID.exec(prompt) : null;
  if (!found) {
    return deny(`launch-guard/no-task: decision-3 routes every layer-agent launch through a task; no TASK-n id was found in ${agent.layer} agent's brief.`);
  }
  const taskId = found[0];

  const task = deps.readTask(taskId, root);
  if (!task) {
    return deny(`launch-guard/unreadable-task: ${taskId} could not be read with "backlog task ${taskId} --json"; refusing to launch ${subagentType as string} without confirming it.`);
  }

  const layerLabel = task.labels.find((l) => l.startsWith('layer-'));
  const taskLayer = layerLabel ? (layerLabel.slice('layer-'.length) as Layer) : null;
  if (taskLayer !== agent.layer) {
    return deny(
      `launch-guard/layer-mismatch: ${taskId} is labelled ${layerLabel ?? '(no layer-* label)'}, not layer-${agent.layer}; ${subagentType as string} only takes ${agent.layer}-layer work.`,
    );
  }

  const route = deps.readRoute(taskId, root);
  if (!route) {
    return deny(`launch-guard/unreadable-route: "board-check route ${taskId}" could not be read; refusing to launch ${subagentType as string} without confirming its model.`);
  }
  const expectedModel = ROLE_SPECS[agent.role].model;
  if (route.model !== expectedModel) {
    return deny(
      `launch-guard/model-mismatch: board-check route gives ${taskId} to ${route.model}, but ${subagentType as string} is pinned to ${expectedModel}.`,
    );
  }

  if (task.labels.includes('size-1') && numberedSteps(task.plan) === 0) {
    return deny(`launch-guard/no-numbered-steps: ${taskId} is size-1 but its plan's "### Order of work" has no numbered steps for ${subagentType as string} to follow.`);
  }

  return ALLOW;
}

async function main(): Promise<void> {
  const decision = decide(await readPayload(), repoRoot);
  if (decision.decision === 'deny') {
    console.error(decision.reason);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) await main();
