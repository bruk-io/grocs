// PostToolUse hook: fast checks on the file that was just edited (R55, R56).
// Exit 2 feeds the findings back to the agent. Must finish within 5 seconds.
import { formatFinding, makeContext } from '../checks/lib.ts';
import { runChecks } from '../checks/run.ts';
import { readPayload, repoRelative, repoRoot } from './lib.ts';

const payload = await readPayload();
const path = payload.tool_input?.['file_path'];
const rel = typeof path === 'string' ? repoRelative(path) : null;
if (rel && /\.(ts|tsx|mts|js|jsx|mjs)$/.test(rel)) {
  const ctx = makeContext(repoRoot, [rel]);
  const reports = runChecks(ctx).filter((r) => r.finding.file === rel || r.finding.detail.includes(rel));
  if (reports.length > 0) {
    console.error(reports.map((r) => formatFinding(r.check, r.finding)).join('\n\n'));
    process.exitCode = 2;
  }
}
