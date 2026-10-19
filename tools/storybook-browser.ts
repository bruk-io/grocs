// What the two browser tools share: tools/shots.ts (look at every story) and tools/visual.ts (check every
// story). Serve the built Storybook from disk, find an installed Chromium, list the stories, and open one
// the same way every time. Chromium comes from PLAYWRIGHT_BROWSERS_PATH; nothing is downloaded.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import type { Browser, Page } from 'playwright-core';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const uiDir = join(root, 'packages/ui');
export const staticDir = join(uiDir, 'storybook-static');

/** The first viewport in packages/ui/.storybook/preview.tsx: an iPhone, in device-independent pixels. */
export const PHONE = { name: 'iphone', width: 393, height: 852 } as const;
/** The Fold screens the templates are also drawn at (approximate; see preview.tsx). */
export const FOLD_OUTER = { name: 'fold-outer', width: 412, height: 929 } as const;
export const FOLD_INNER = { name: 'fold-inner', width: 791, height: 820 } as const;
export type Viewport = { readonly name: string; readonly width: number; readonly height: number };

/**
 * The switch the browser tools flip to make every story hold still. Nothing reads it yet: the Mascot's
 * MotionProvider (TASK-1.30, decision-5) should treat `window.__GROCS_REDUCE_MOTION__ === true` as reduce
 * motion, in addition to the prefers-reduced-motion media query, which the tools also turn on.
 */
export const REDUCE_MOTION_GLOBAL = '__GROCS_REDUCE_MOTION__';

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

export function serve(dir: string): Promise<{ url: string; close: () => void }> {
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
export function browserPath(): string | undefined {
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

export function buildStorybook(): void {
  execFileSync('pnpm', ['exec', 'storybook', 'build', '-o', 'storybook-static', '--quiet'], {
    cwd: uiDir,
    stdio: 'inherit',
    env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
  });
}

export interface StoryEntry {
  readonly id: string;
  readonly title: string;
}

/** Every story in the built Storybook, sorted by id, optionally only those whose id contains `filter`. */
export function listStories(filter?: string): StoryEntry[] | null {
  const file = join(staticDir, 'index.json');
  if (!existsSync(file)) return null;
  const index = JSON.parse(readFileSync(file, 'utf8')) as { entries: Record<string, { id: string; title: string; type: string }> };
  return Object.values(index.entries)
    .filter((e) => e.type === 'story' && (!filter || e.id.includes(filter)))
    .map((e) => ({ id: e.id, title: e.title }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** The viewports a story is drawn at: the phone, and for templates also both Fold screens. */
export const viewportsFor = (story: StoryEntry): readonly Viewport[] =>
  story.title.startsWith('Templates/') ? [PHONE, FOLD_OUTER, FOLD_INNER] : [PHONE];

/** Software drawing, one colour profile and unhinted greyscale text, so two runs draw the same pixels. */
const DETERMINISTIC_FLAGS = [
  '--font-render-hinting=none',
  '--disable-lcd-text',
  '--disable-gpu',
  '--disable-gpu-rasterization',
  '--force-color-profile=srgb',
  '--disable-threaded-animation',
  '--disable-partial-raster',
];

/** Chromium with the settings both tools need so two runs draw the same pixels. */
export async function launch() {
  const executablePath = browserPath();
  return chromium.launch({ ...(executablePath ? { executablePath } : {}), args: DETERMINISTIC_FLAGS });
}

/**
 * A fresh page for one story view, in its own browser context (axe-core needs one) with a fixed pixel ratio
 * and light colours, and with prefers-reduced-motion on. Close the page's context when done.
 */
export async function newStoryPage(browser: Browser, viewport: Viewport): Promise<Page> {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light', locale: 'en-CA', timezoneId: 'UTC' });
  return context.newPage();
}

export interface OpenedStory {
  /** Errors thrown in the page while the story loaded; empty when it rendered cleanly. */
  readonly errors: readonly string[];
}

/**
 * Opens one story in `page` at `viewport`, with motion reduced and fonts loaded, and waits until it has
 * drawn. The page must be a fresh one per viewport (the init script runs on every navigation).
 */
export async function openStory(page: Page, baseUrl: string, id: string, viewport: Viewport): Promise<OpenedStory> {
  const errors: string[] = [];
  const onError = (e: Error): void => void errors.push(e.message);
  page.on('pageerror', onError);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.addInitScript(`window.${REDUCE_MOTION_GLOBAL} = true;`);
  await page.goto(`${baseUrl}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForSelector('body.sb-show-main, body.sb-show-errordisplay', { timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  // Two animation frames so layout that follows the font swap has settled.
  await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  page.off('pageerror', onError);
  if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) errors.push('Storybook shows an error');
  return { errors };
}
