// Builds the browser Storybook and saves one PNG per story at phone width, so a builder can put a
// story next to the matching board in design/reference/shots/ (TASK-1.19).
//
//   pnpm --filter @grocs/ui shots               build, then render every story
//   pnpm --filter @grocs/ui shots -- --no-build reuse storybook-static from the last build
//   pnpm --filter @grocs/ui shots -- <text>     only stories whose id contains <text>
//
// The PNGs go to packages/ui/.shots/<story-id>.png (gitignored). Chromium comes from
// PLAYWRIGHT_BROWSERS_PATH; nothing is downloaded.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const uiDir = join(root, 'packages/ui');
const staticDir = join(uiDir, 'storybook-static');
const outDir = join(uiDir, '.shots');
/** iPhone width and height in points (the first viewport in packages/ui/.storybook/preview.tsx). */
const PHONE = { width: 393, height: 852 } as const;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
};

function serve(dir: string): Promise<{ url: string; close: () => void }> {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]!)).replace(/^(\.\.[/\\])+/, '');
    const file = join(dir, path === '/' ? 'index.html' : path);
    if (!file.startsWith(dir) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => server.close() });
    });
  });
}

/** An installed Chromium: the one playwright-core wants, else any under PLAYWRIGHT_BROWSERS_PATH. */
function browserPath(): string | undefined {
  const base = process.env['PLAYWRIGHT_BROWSERS_PATH'];
  if (!base || !existsSync(base)) return undefined;
  const wanted = chromium.executablePath();
  if (existsSync(wanted)) return wanted;
  for (const dir of readdirSync(base).sort().reverse()) {
    for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-headless-shell-linux64/chrome-headless-shell']) {
      const candidate = join(base, dir, rel);
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

interface StoryIndex {
  entries: Record<string, { id: string; type: string }>;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const build = !args.includes('--no-build');
  const filter = args.find((a) => !a.startsWith('--'));

  if (build) {
    execFileSync('pnpm', ['exec', 'storybook', 'build', '-o', 'storybook-static', '--quiet'], { cwd: uiDir, stdio: 'inherit', env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' } });
  }
  if (!existsSync(join(staticDir, 'index.json'))) {
    console.error('shots: no storybook-static/index.json; run without --no-build first');
    return 2;
  }
  const index = JSON.parse(readFileSync(join(staticDir, 'index.json'), 'utf8')) as StoryIndex;
  const ids = Object.values(index.entries).filter((e) => e.type === 'story' && (!filter || e.id.includes(filter))).map((e) => e.id).sort();
  if (ids.length === 0) {
    console.error('shots: no stories matched');
    return 2;
  }

  if (!filter) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const server = await serve(staticDir);
  const executablePath = browserPath();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const failures: string[] = [];
  try {
    const page = await browser.newPage({ viewport: PHONE, deviceScaleFactor: 1 });
    for (const id of ids) {
      const errors: string[] = [];
      const onError = (e: Error): void => void errors.push(e.message);
      page.on('pageerror', onError);
      await page.goto(`${server.url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=viewport.value:iphone`, { waitUntil: 'load' });
      await page.waitForSelector('body.sb-show-main, body.sb-show-errordisplay', { timeout: 20_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      page.off('pageerror', onError);
      const broken = await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'));
      if (broken || errors.length > 0) failures.push(`${id}: ${errors[0] ?? 'Storybook shows an error'}`);
      await page.screenshot({ path: join(outDir, `${id}.png`), fullPage: true });
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
