// PreToolUse hook: blocks edits that weaken a check (R57) before they happen, and
// enforces decision-3's write guard: a layer agent writes and runs Bash only within
// its own layer, and the orchestrator (no agent_type) writes only the board, root
// config, the lock file and .claude/.
//   focus / skip / delete a test      -> denied, with the reason
//   loosening a check's configuration -> the person is asked, with the reason
//   a layer agent writing or running Bash outside its layer -> denied, with the reason
//   the orchestrator writing layer code -> denied, with the reason
import { formatFinding } from '../checks/lib.ts';
import { check as weakening, isProtected, loadOverrides, reviewChange } from '../checks/weakening.ts';
import { isTestFile } from '../checks/lib.ts';
import { loadConfigs } from '../agents/generate.ts';
import { LAYERS } from '../agents/layers.ts';
import { check as writeGuard, parseAgentType, reviewLayerBash, reviewLayerEdit, reviewOrchestratorEdit } from '../agents/write-guard.ts';
import type { HookPayload } from './lib.ts';
import { readPayload, repoRelative, repoRoot, resultOfEdit } from './lib.ts';

const CONFIGS = loadConfigs();

export interface Decision {
  readonly decision: 'allow' | 'deny' | 'ask';
  readonly reason: string;
}

const ALLOW: Decision = { decision: 'allow', reason: '' };

/** Shell commands that delete or move a test file, or rewrite a protected file in place. */
export function reviewBash(command: string): Decision {
  const removesTest = /\b(rm|unlink|git\s+rm)\b[^|;&]*\.(test|spec)\.(ts|tsx|js|jsx)\b/.test(command) || /\bmv\b[^|;&]*\.(test|spec)\.(ts|tsx)\b/.test(command);
  if (removesTest) {
    const finding = { rule: 'weakening/delete-test', file: 'bash', detail: `the command removes or moves a test file: ${command.slice(0, 120)}` };
    return { decision: 'deny', reason: formatFinding(weakening, finding) };
  }
  const rewrites = /\b(sed\s+-i|tee|truncate)\b|>\s*\S/.test(command);
  if (rewrites) {
    const protectedPath = command.split(/\s+/).map((t) => t.replace(/^['"]|['"]$/g, '')).find((t) => repoRelative(t) !== null && isProtected(repoRelative(t)!));
    if (protectedPath) {
      const finding = { rule: 'weakening/loosen-check-config', file: protectedPath, detail: `the command rewrites a check file from the shell: ${command.slice(0, 120)}` };
      return { decision: 'ask', reason: formatFinding(weakening, finding) };
    }
  }
  return ALLOW;
}

export function decide(payload: HookPayload): Decision {
  const agent = parseAgentType(payload.agent_type, LAYERS);

  if (payload.tool_name === 'Bash') {
    const command = payload.tool_input?.['command'];
    if (typeof command !== 'string') return ALLOW;
    if (agent) {
      const config = CONFIGS.find((c) => c.layer === agent.layer)!;
      const found = reviewLayerBash(agent, command, config);
      if (found.length > 0) return { decision: 'deny', reason: found.map((f) => formatFinding(writeGuard, f)).join('\n\n') };
    }
    return reviewBash(command);
  }

  const edit = resultOfEdit(payload);
  if (!edit) return ALLOW;

  if (agent) {
    const found = reviewLayerEdit(agent, edit.file);
    if (found.length > 0) return { decision: 'deny', reason: found.map((f) => formatFinding(writeGuard, f)).join('\n\n') };
  } else if (payload.agent_type === undefined) {
    const found = reviewOrchestratorEdit(edit.file);
    if (found.length > 0) return { decision: 'deny', reason: found.map((f) => formatFinding(writeGuard, f)).join('\n\n') };
  }

  if (!isTestFile(edit.file) && !isProtected(edit.file)) return ALLOW;
  const found = reviewChange(edit.file, edit.before, edit.after, loadOverrides(repoRoot));
  if (found.length === 0) return ALLOW;
  const text = found.map((f) => formatFinding(weakening, f)).join('\n\n');
  return { decision: found.some((f) => f.severity === 'deny') ? 'deny' : 'ask', reason: text };
}

async function main(): Promise<void> {
  const decision = decide(await readPayload());
  if (decision.decision === 'allow') return;
  if (decision.decision === 'deny') {
    console.error(decision.reason);
    process.exitCode = 2;
    return;
  }
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: decision.reason,
      },
    }),
  );
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) await main();
