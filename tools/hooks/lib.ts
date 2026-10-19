// Shared plumbing for the agent hook entry points. Hooks are thin: they decode the
// hook payload, call the same check code that pre-commit and CI call, and translate
// the result into the hook protocol (exit 2 blocks and feeds stderr back to the agent).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface HookPayload {
  readonly hook_event_name?: string;
  readonly tool_name?: string;
  readonly tool_input?: Record<string, unknown>;
  readonly stop_hook_active?: boolean;
  readonly cwd?: string;
  /** Present when the hook fires inside a subagent (decision-3's enforcement seam). */
  readonly agent_type?: string;
  readonly agent_id?: string;
}

/** GROCS_ROOT lets the hook tests point the hooks at a throwaway repository. */
export const repoRoot = process.env['GROCS_ROOT'] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function parsePayload(raw: string): HookPayload {
  try {
    return JSON.parse(raw) as HookPayload;
  } catch {
    return {};
  }
}

export async function readPayload(): Promise<HookPayload> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return parsePayload(Buffer.concat(chunks).toString('utf8'));
}

/**
 * Whether a change can alter how a story looks or behaves in a browser, so the stop hook should run the
 * browser pass (decision-11, level 3): UI code, the pass itself, the Storybook setup, the tokens and art it
 * is built from, and the dependencies.
 */
export const needsBrowserPass = (files: readonly string[]): boolean =>
  files.some((f) => /^(packages\/ui\/|tools\/(visual|storybook-browser|build-tokens|build-svg)|design\/svg\/|pnpm-lock\.yaml$)/.test(f));

/** Root-relative path with forward slashes, or null when the file is outside the repository. */
export function repoRelative(file: string): string | null {
  const abs = isAbsolute(file) ? file : resolve(repoRoot, file);
  const rel = relative(repoRoot, abs).split('\\').join('/');
  return rel.startsWith('..') ? null : rel;
}

export function readIfExists(rel: string): string | null {
  const abs = resolve(repoRoot, rel);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
}

export interface EditInput {
  readonly file: string;
  readonly before: string | null;
  readonly after: string | null;
}

/** Work out what a file will contain after an Edit, MultiEdit or Write tool call. */
export function resultOfEdit(payload: HookPayload): EditInput | null {
  const input = payload.tool_input ?? {};
  const path = input['file_path'];
  if (typeof path !== 'string') return null;
  const rel = repoRelative(path);
  if (!rel) return null;
  const before = readIfExists(rel);
  if (payload.tool_name === 'Write') {
    const content = input['content'];
    return { file: rel, before, after: typeof content === 'string' ? content : before };
  }
  const edits: { old_string?: string; new_string?: string; replace_all?: boolean }[] = Array.isArray(input['edits'])
    ? (input['edits'] as never)
    : [input as never];
  let text = before ?? '';
  for (const e of edits) {
    if (typeof e.old_string !== 'string' || typeof e.new_string !== 'string') continue;
    text = e.replace_all ? text.split(e.old_string).join(e.new_string) : text.replace(e.old_string, () => e.new_string!);
  }
  return { file: rel, before, after: text };
}
