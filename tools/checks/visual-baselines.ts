// The approved screenshots in packages/ui/visual-baselines/ (decision-11, level 3) and the one record that
// keeps them honest: manifest.json, which only `pnpm --filter @grocs/ui visual:update` writes. It holds the
// hash of every approved image. This check fails when an image is added, changed or deleted without the
// manifest saying so, whoever did it (an editor, a shell command, a merge), so a baseline cannot be
// quietly edited to make a failing comparison pass (R57).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

export const BASELINE_DIR = 'packages/ui/visual-baselines';
export const MANIFEST_FILE = 'manifest.json';
export const UPDATE_COMMAND = 'pnpm --filter @grocs/ui visual:update';

/** The reason, shared by this check and the pre-edit review (weakening/edit-baseline). */
export const BASELINE_WHY =
  'A baseline is the approved picture of a story. If it can be edited or deleted by hand, a story that looks wrong can be made to pass by changing the picture it is compared with, and the visual pass proves nothing (R57). The update command is the one place a person reviews the new images.';
export const BASELINE_FIX = `Fix the component so the story matches its baseline. If the look changed on purpose, run \`${UPDATE_COMMAND}\` and review the new images in the change.`;

export const rules: Readonly<Record<string, RuleInfo>> = {
  'visual-baselines/changed-outside-update': {
    req: 'R57, R65',
    summary: 'Baselines are created, changed and deleted only by visual:update',
    why: BASELINE_WHY,
    fix: BASELINE_FIX,
  },
};

export interface Manifest {
  readonly baselines: Readonly<Record<string, string>>;
}

export const isBaselinePath = (file: string): boolean => file.startsWith(`${BASELINE_DIR}/`);
export const sha256 = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');

export function readManifest(dir: string): Manifest | null {
  const file = join(dir, MANIFEST_FILE);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as Manifest;
  return parsed;
}

/** Differences between the images in `dir` and the hashes in its manifest; empty when they agree. */
export function baselineProblems(dir: string, expected = true): { name: string; detail: string }[] {
  const manifest = readManifest(dir);
  const images = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.png')) : [];
  if (!manifest) return expected || images.length > 0 ? [{ name: MANIFEST_FILE, detail: `${MANIFEST_FILE} is missing (deleted by hand, or visual:update has never run)` }] : [];
  const problems: { name: string; detail: string }[] = [];
  for (const name of images) {
    const recorded = manifest.baselines[name];
    if (recorded === undefined) problems.push({ name, detail: `${name} is not in ${MANIFEST_FILE} (added by hand)` });
    else if (recorded !== sha256(readFileSync(join(dir, name)))) problems.push({ name, detail: `${name} differs from the approved image (edited by hand)` });
  }
  for (const name of Object.keys(manifest.baselines)) {
    if (!images.includes(name)) problems.push({ name, detail: `${name} is in ${MANIFEST_FILE} but the image is gone (deleted by hand)` });
  }
  return problems;
}

export function run(ctx: CheckContext): Finding[] {
  // The after-edit run passes the file that changed; only look when it was a baseline.
  if (ctx.changed.length > 0 && !ctx.changed.some(isBaselinePath)) return [];
  const hasStories = ctx.files.some((f) => f.startsWith('packages/ui/') && f.endsWith('.stories.tsx'));
  return baselineProblems(join(ctx.root, BASELINE_DIR), hasStories).map(({ name, detail }) => ({
    rule: 'visual-baselines/changed-outside-update',
    file: `${BASELINE_DIR}/${name}`,
    detail,
  }));
}

export const check: Check = { id: 'visual-baselines', rules, run };
