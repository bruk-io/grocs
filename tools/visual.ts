// The browser pass over the built Storybook (decision-11, level 3). For every story, at every viewport it
// is drawn at, it:
//   1. runs axe-core and fails on any violation, colour contrast included (R42);
//   2. fails any button, checkbox or link smaller than 44 x 44 points (R42);
//   3. compares a screenshot with the approved image in packages/ui/visual-baselines/.
// A few stories also get a motion check (MOTION_EXPECTATIONS): opened again with motion allowed, the kitchen
// scene must pan and its reduced twin must hold still, since the views above are all held still.
//
//   pnpm --filter @grocs/ui visual                 build, then check every story
//   pnpm --filter @grocs/ui visual -- --no-build   reuse storybook-static from the last build
//   pnpm --filter @grocs/ui visual -- <text>       only stories whose id contains <text>
//   pnpm --filter @grocs/ui visual:update          approve: write the baselines (the only way they change)
//
// Pictures are compared only on Linux, where CI runs: font rendering differs by operating system. Elsewhere
// the axe and size checks still run and the image comparison is skipped, with a notice. Fonts are bundled
// files, motion is reduced, viewports are fixed and Chromium's text settings are pinned, so two runs on
// one system give the same images.
import AxeBuilder from '@axe-core/playwright';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { BASELINE_DIR, MANIFEST_FILE, UPDATE_COMMAND, readManifest, sha256 } from './checks/visual-baselines.ts';
import type { Manifest } from './checks/visual-baselines.ts';
import { buildStorybook, judgeMotion, launch, listStories, newStoryPage, openStory, PHONE, readMotion, root, serve, staticDir, viewportsFor } from './storybook-browser.ts';
import type { MotionExpectation, Viewport } from './storybook-browser.ts';
import { compareImages } from './visual-compare.ts';

const baselineDir = join(root, BASELINE_DIR);
const diffDir = join(root, 'packages/ui/.visual-diff');
const TARGET = 44;

/** Elements a person presses. Disabled ones count: they still need a place to be found and read. */
const PRESSABLE = '[role="button"], [role="checkbox"], [role="link"], button, a[href], input[type="checkbox"]';

interface SmallTarget {
  readonly what: string;
  readonly width: number;
  readonly height: number;
}

async function smallTargets(page: Page): Promise<SmallTarget[]> {
  return page.evaluate(
    ({ selector, min }) =>
      Array.from(document.querySelector('#storybook-root')?.querySelectorAll(selector) ?? [])
        .filter((el) => !el.closest('[aria-hidden="true"]'))
        .map((el) => ({ el, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width < min || box.height < min)
        .map(({ el, box }) => ({
          what: `${el.getAttribute('role') ?? el.tagName.toLowerCase()} "${el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 30)}"`,
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
        })),
    { selector: PRESSABLE, min: TARGET },
  );
}

async function axeViolations(page: Page): Promise<string[]> {
  // The scan covers the story, not Storybook's own page around it.
  const result = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  return result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}x, e.g. ${v.nodes[0]?.target.join(' ')})`);
}

/**
 * Stories whose motion is checked, because the pass shows every story still and so cannot show that these
 * move (or, for the reduced one, that they stay still when the app says so). Each is opened a second time,
 * on a page of its own with the browser allowing motion, and never screenshotted from that page.
 */
const MOTION_EXPECTATIONS: Readonly<Record<string, MotionExpectation>> = {
  'organisms-kitchen-scene--panning': 'pans',
  'organisms-kitchen-scene--reduced': 'still',
};

async function motionFailures(browser: Browser, baseUrl: string, id: string, expected: MotionExpectation): Promise<string[]> {
  const label = `${id} @ ${PHONE.name}, motion allowed`;
  const page = await newStoryPage(browser, PHONE, 'allowed');
  try {
    const { errors } = await openStory(page, baseUrl, id, PHONE, 'allowed');
    if (errors.length > 0) return errors.map((e) => `${label}: story did not render: ${e}`);
    return judgeMotion(await readMotion(page), expected).map((f) => `${label}: ${f}`);
  } finally {
    await page.context().close();
  }
}

const baselineName = (id: string, viewport: Viewport): string => (viewport.name === 'iphone' ? `${id}.png` : `${id}--${viewport.name}.png`);

async function main(): Promise<number> {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const update = args.includes('--update');
  const filter = args.find((a) => !a.startsWith('--'));
  const comparing = process.platform === 'linux';

  if (update && !comparing) {
    console.error(`visual: baselines are made on Linux only (this is ${process.platform}), because font rendering differs by system. Generate them with the "visual baselines" workflow on your pushed branch; the commands are at the top of .github/workflows/visual-baselines.yml.`);
    return 2;
  }
  if (!comparing) {
    console.log(`visual: image comparison skipped on ${process.platform}; baselines are compared on Linux only. The axe and 44 x 44 checks still run.`);
  }

  if (!args.includes('--no-build')) buildStorybook();
  const stories = listStories(filter);
  if (!stories || stories.length === 0) {
    console.error('visual: no stories found; run without --no-build first, and check the filter');
    return 2;
  }

  const server = await serve(staticDir);
  const browser = await launch();
  const failures: string[] = [];
  if (!filter) {
    // A renamed or deleted story must not quietly drop its motion check.
    const known = new Set(stories.map((s) => s.id));
    for (const id of Object.keys(MOTION_EXPECTATIONS)) if (!known.has(id)) failures.push(`${id}: has a motion check but no story; update MOTION_EXPECTATIONS in tools/visual.ts`);
  }
  const approved: Record<string, string> = update && filter ? { ...(readManifest(baselineDir)?.baselines ?? {}) } : {};
  let compared = 0;
  rmSync(diffDir, { recursive: true, force: true });
  if (update) mkdirSync(baselineDir, { recursive: true });
  try {
    for (const story of stories) {
      const expected = MOTION_EXPECTATIONS[story.id];
      if (expected) failures.push(...(await motionFailures(browser, server.url, story.id, expected)));
      for (const viewport of viewportsFor(story)) {
        const label = `${story.id} @ ${viewport.name}`;
        const page = await newStoryPage(browser, viewport);
        const { errors } = await openStory(page, server.url, story.id, viewport);
        for (const e of errors) failures.push(`${label}: story did not render: ${e}`);
        for (const v of await axeViolations(page)) failures.push(`${label}: accessibility: ${v}`);
        for (const t of await smallTargets(page)) failures.push(`${label}: ${t.what} is ${t.width} x ${t.height}, under ${TARGET} x ${TARGET} (R42)`);

        // The story's own box, so empty page below a short story is not part of the picture.
        const shot = await page.locator('#storybook-root').screenshot({ animations: 'disabled', caret: 'hide' });
        await page.context().close();
        const name = baselineName(story.id, viewport);
        if (update) {
          writeFileSync(join(baselineDir, name), shot);
          approved[name] = sha256(shot);
        } else if (comparing) {
          const file = join(baselineDir, name);
          if (!existsSync(file)) {
            failures.push(`${label}: no baseline ${BASELINE_DIR}/${name}; run \`${UPDATE_COMMAND}\` and review the image`);
          } else {
            compared++;
            const result = compareImages(readFileSync(file), shot);
            if (!result.same) {
              mkdirSync(diffDir, { recursive: true });
              writeFileSync(join(diffDir, name), shot);
              if (result.diff) writeFileSync(join(diffDir, name.replace(/\.png$/, '.diff.png')), result.diff);
              failures.push(`${label}: looks different from its baseline: ${result.reason}. See packages/ui/.visual-diff/${name}; if the change is intended run \`${UPDATE_COMMAND}\``);
            }
          }
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (update) {
    if (!filter) {
      // A full update also retires baselines whose story is gone.
      for (const name of readdirSync(baselineDir)) if (name.endsWith('.png') && approved[name] === undefined) rmSync(join(baselineDir, name));
    }
    const sorted = Object.fromEntries(Object.entries(approved).sort(([a], [b]) => (a < b ? -1 : 1)));
    const manifest: Manifest & { note: string } = {
      note: `Written by \`${UPDATE_COMMAND}\`; do not edit. The hash of each approved image, checked by the visual-baselines check.`,
      baselines: sorted,
    };
    writeFileSync(join(baselineDir, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`visual: wrote ${Object.keys(sorted).length} baselines to ${BASELINE_DIR}/. Look at the images before you commit them.`);
  } else if (comparing && !filter) {
    const known = new Set(stories.flatMap((s) => viewportsFor(s).map((v) => baselineName(s.id, v))));
    for (const name of existsSync(baselineDir) ? readdirSync(baselineDir) : []) {
      if (name.endsWith('.png') && !known.has(name)) failures.push(`${name}: baseline has no story; run \`${UPDATE_COMMAND}\` to retire it`);
    }
  }

  const checked = stories.reduce((n, s) => n + viewportsFor(s).length, 0);
  console.log(`visual: ${checked} story views checked (axe, 44 x 44${comparing && !update ? `, ${compared} images compared` : ', images not compared'})`);
  for (const f of failures) console.error(`visual: FAILED ${f}`);
  return failures.length > 0 ? 1 : 0;
}

process.exitCode = await main();
