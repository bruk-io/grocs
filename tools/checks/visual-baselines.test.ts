// Fixture tests for decision-11's rule that visual baselines change only through visual:update (R57).
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatFinding } from './lib.ts';
import type { CheckContext } from './lib.ts';
import { BASELINE_DIR, MANIFEST_FILE, UPDATE_COMMAND, baselineProblems, check, sha256 } from './visual-baselines.ts';
import { check as weakening, reviewBaselineBash, reviewBaselineEdit } from './weakening.ts';

let root: string;
let dir: string;
const image = (name: string, text: string): void => writeFileSync(join(dir, name), text);
/** What `visual:update` leaves: images and a manifest of their hashes. */
function approve(images: Record<string, string>): void {
  mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(images)) image(name, text);
  const baselines = Object.fromEntries(Object.entries(images).map(([name, text]) => [name, sha256(Buffer.from(text))]));
  writeFileSync(join(dir, MANIFEST_FILE), JSON.stringify({ baselines }));
}
const context = (changed: string[] = []): CheckContext => ({
  root,
  files: ['packages/ui/src/atoms/Button.stories.tsx'],
  allFiles: [],
  changed,
  readSource: () => '',
});

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'grocs-baselines-'));
  dir = join(root, BASELINE_DIR);
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('visual-baselines check', () => {
  it('passes when the images are the approved ones', () => {
    approve({ 'a.png': 'one', 'b.png': 'two' });
    expect(check.run(context())).toEqual([]);
  });

  it('fails an image edited by hand, naming the rule, the reason and visual:update', () => {
    approve({ 'a.png': 'one' });
    image('a.png', 'changed');
    const findings = check.run(context());
    expect(findings.map((f) => f.rule)).toEqual(['visual-baselines/changed-outside-update']);
    expect(findings[0]!.detail).toContain('edited by hand');
    const text = formatFinding(check, findings[0]!);
    expect(text).toContain('Why:');
    expect(text).toContain(UPDATE_COMMAND);
  });

  it('fails an image deleted by hand', () => {
    approve({ 'a.png': 'one', 'b.png': 'two' });
    rmSync(join(dir, 'b.png'));
    expect(baselineProblems(dir).map((p) => p.detail)).toEqual([expect.stringContaining('deleted by hand')]);
  });

  it('fails an image added by hand', () => {
    approve({ 'a.png': 'one' });
    image('new.png', 'sneaked in');
    expect(baselineProblems(dir).map((p) => p.detail)).toEqual([expect.stringContaining('added by hand')]);
  });

  it('fails when the whole folder or its manifest is deleted while stories exist', () => {
    expect(check.run(context()).map((f) => f.detail)).toEqual([expect.stringContaining('missing')]);
    approve({ 'a.png': 'one' });
    rmSync(join(dir, MANIFEST_FILE));
    expect(check.run(context())).toHaveLength(1);
  });

  it('looks only when a baseline is what changed, so the after-edit hook stays fast', () => {
    approve({ 'a.png': 'one' });
    image('a.png', 'changed');
    expect(check.run(context(['packages/ui/src/atoms/Button.tsx']))).toEqual([]);
    expect(check.run(context([`${BASELINE_DIR}/a.png`]))).toHaveLength(1);
  });
});

describe('weakening review of baselines (R57)', () => {
  it('denies a tool edit or write to an image or the manifest', () => {
    for (const file of [`${BASELINE_DIR}/a.png`, `${BASELINE_DIR}/${MANIFEST_FILE}`]) {
      const found = reviewBaselineEdit(file);
      expect(found.map((w) => [w.rule, w.severity])).toEqual([['weakening/edit-baseline', 'deny']]);
    }
    expect(reviewBaselineEdit('packages/ui/src/atoms/Button.tsx')).toEqual([]);
  });

  it('says why, and names visual:update as the fix', () => {
    const text = formatFinding(weakening, reviewBaselineEdit(`${BASELINE_DIR}/a.png`)[0]!);
    expect(text).toContain('weakening/edit-baseline (R57');
    expect(text).toContain('Why:');
    expect(text).toContain(UPDATE_COMMAND);
  });

  it('denies shell commands that delete, overwrite or rewrite baselines', () => {
    for (const command of [
      `rm ${BASELINE_DIR}/a.png`,
      `rm -rf ${BASELINE_DIR}`,
      `mv /tmp/a.png ${BASELINE_DIR}/a.png`,
      `cp .shots/a.png ${BASELINE_DIR}/a.png`,
      `git rm ${BASELINE_DIR}/a.png`,
      `echo x > ${BASELINE_DIR}/manifest.json`,
      `find ${BASELINE_DIR} -delete`,
      `pnpm --filter @grocs/ui visual:update && rm ${BASELINE_DIR}/a.png`,
    ]) {
      expect(reviewBaselineBash(command).map((w) => w.rule), command).toEqual(['weakening/edit-baseline']);
    }
  });

  it('allows visual:update, the visual pass, and reading the folder', () => {
    for (const command of [
      'pnpm --filter @grocs/ui visual:update',
      'pnpm --filter @grocs/ui visual',
      `ls ${BASELINE_DIR}`,
      `git diff --stat ${BASELINE_DIR} 2>&1`,
      `git add ${BASELINE_DIR}`,
    ]) {
      expect(reviewBaselineBash(command), command).toEqual([]);
    }
  });
});
