// Builds the browser Storybook and saves one PNG per story at phone width, so a builder can put a
// story next to the matching board in design/reference/shots/ (TASK-1.19).
//
//   pnpm --filter @grocs/ui shots               build, then render every story
//   pnpm --filter @grocs/ui shots -- --no-build reuse storybook-static from the last build
//   pnpm --filter @grocs/ui shots -- <text>     only stories whose id contains <text>
//
// The PNGs go to packages/ui/.shots/<story-id>.png (gitignored). Chromium comes from
// PLAYWRIGHT_BROWSERS_PATH; nothing is downloaded. The shared browser parts are in tools/storybook-browser.ts;
// the checked pass (accessibility, sizes, baselines) is tools/visual.ts.
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { PHONE, buildStorybook, launch, listStories, newStoryPage, openStory, serve, staticDir, uiDir } from './storybook-browser.ts';

const outDir = join(uiDir, '.shots');

async function main(): Promise<number> {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const filter = args.find((a) => !a.startsWith('--'));

  if (!args.includes('--no-build')) buildStorybook();
  const stories = listStories();
  if (!stories) {
    console.error('shots: no storybook-static/index.json; run without --no-build first');
    return 2;
  }
  const ids = stories.map((s) => s.id).filter((id) => !filter || id.includes(filter));
  if (ids.length === 0) {
    console.error('shots: no stories matched');
    return 2;
  }

  if (!filter) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const server = await serve(staticDir);
  const browser = await launch();
  const failures: string[] = [];
  try {
    for (const id of ids) {
      const page = await newStoryPage(browser, PHONE);
      const { errors } = await openStory(page, server.url, id, PHONE);
      if (errors.length > 0) failures.push(`${id}: ${errors[0]}`);
      await page.screenshot({ path: join(outDir, `${id}.png`), fullPage: true, animations: 'disabled' });
      await page.context().close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`shots: ${ids.length - failures.length} of ${ids.length} stories saved to packages/ui/.shots/`);
  for (const f of failures) console.error(`shots: FAILED ${f}`);
  return failures.length > 0 ? 1 : 0;
}

process.exitCode = await main();
