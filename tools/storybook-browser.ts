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
 * Whether a story view holds still. Every view is `reduced` (the default) except the few motion checks in
 * visual.ts, which look at one story with motion `allowed` on a page of their own, never one that is
 * screenshotted, so no baseline depends on motion.
 */
export type MotionMode = 'reduced' | 'allowed';

/**
 * A fresh page for one story view, in its own browser context (axe-core needs one) with a fixed pixel ratio
 * and light colours, and with prefers-reduced-motion on unless `motion` is `allowed`. Close the page's
 * context when done.
 */
export async function newStoryPage(browser: Browser, viewport: Viewport, motion: MotionMode = 'reduced'): Promise<Page> {
  const reducedMotion = motion === 'allowed' ? 'no-preference' : 'reduce';
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion, colorScheme: 'light', locale: 'en-CA', timezoneId: 'UTC' });
  return context.newPage();
}

export interface OpenedStory {
  /** Errors thrown in the page while the story loaded; empty when it rendered cleanly. */
  readonly errors: readonly string[];
}

const ENTRANCE_CAP_MS = 5_000;

/**
 * Waits for every animation with an end (a mascot's bubble pops in, or fades in when motion is
 * reduced) to finish; endless ones such as an idle bob are left running. axe reads contrast through
 * opacity, so scanning mid-fade fails at random (TASK-1.41). False when one is still running at the cap.
 */
async function entrancesFinished(page: Page): Promise<boolean> {
  return page.evaluate(async (capMs) => {
    const finite = document.getAnimations().filter((a) => Number.isFinite(Number(a.effect?.getComputedTiming().endTime)));
    const all = Promise.all(finite.map((a) => a.finished.catch(() => undefined))).then(() => true);
    const cap = new Promise<boolean>((done) => setTimeout(() => done(false), capMs));
    return Promise.race([all, cap]);
  }, ENTRANCE_CAP_MS);
}

/**
 * Opens one story in `page` at `viewport`, with motion reduced (unless `motion` is `allowed`, and then the
 * page must come from `newStoryPage` with the same mode) and fonts loaded, and waits until it has drawn and
 * its entrances have finished. The page must be a fresh one per viewport (the init script runs on every
 * navigation).
 */
export async function openStory(page: Page, baseUrl: string, id: string, viewport: Viewport, motion: MotionMode = 'reduced'): Promise<OpenedStory> {
  const errors: string[] = [];
  const onError = (e: Error): void => void errors.push(e.message);
  page.on('pageerror', onError);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  if (motion === 'reduced') await page.addInitScript(`window.${REDUCE_MOTION_GLOBAL} = true;`);
  await page.goto(`${baseUrl}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, { waitUntil: 'load' });
  await page.waitForSelector('body.sb-show-main, body.sb-show-errordisplay', { timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  // Two animation frames so layout that follows the font swap has settled.
  await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  if (!(await entrancesFinished(page))) errors.push(`an entrance animation was still running after ${ENTRANCE_CAP_MS} ms`);
  page.off('pageerror', onError);
  if (await page.evaluate(() => document.body.classList.contains('sb-show-errordisplay'))) errors.push('Storybook shows an error');
  return { errors };
}

/** What a story's motion should be, with motion allowed: the scene pans, or nothing in it moves. */
export type MotionExpectation = 'pans' | 'still';

/** What `readMotion` saw in a story opened with motion allowed. */
export interface MotionReading {
  /** Elements whose transform was different 300 ms of real time later. Anything moving counts, a bob included. */
  readonly drifting: number;
  /** Running animations that carry their element sideways over a cycle (the pan, and anything else that slides; a bob or a rotation does not). */
  readonly sidewaysAnimations: number;
  /** The furthest any of them takes its element between two points of a cycle, in pixels. */
  readonly travel: number;
}

/** A pan carries the scene hundreds of pixels; a few pixels of sideways wobble is not one. */
export const MIN_PAN_TRAVEL_PX = 50;
/** Real time between the two looks at every element, long enough for any running loop to have moved. */
const DRIFT_WAIT_MS = 300;
/** Where in one cycle of an animation its element is read. */
const CYCLE_POINTS = [0, 0.25, 0.5, 0.75] as const;

/**
 * Reads what moves in the story on `page`, which must have been opened with motion `allowed`. Finds the pan by
 * what it does (moves its element sideways) rather than by name, because the animations' names are generated.
 * Pauses and seeks the animations, so use a page that is not screenshotted afterwards.
 */
export async function readMotion(page: Page): Promise<MotionReading> {
  return page.evaluate(
    async ({ waitMs, points }) => {
      const root = document.querySelector('#storybook-root');
      const elements = Array.from(root?.querySelectorAll('*') ?? []);
      const looks = () => elements.map((el) => getComputedStyle(el).transform);
      const before = looks();
      const clocks = new Map(document.getAnimations().map((a) => [a, Number(a.currentTime)]));
      await new Promise((done) => setTimeout(done, waitMs));
      const after = looks();
      const drifting = elements.filter((_, i) => before[i] !== after[i]).length;

      // x translation of an element's computed transform (the matrix's e term).
      const sideways = (el: Element): number => {
        const t = getComputedStyle(el).transform;
        return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m41;
      };
      let sidewaysAnimations = 0;
      let travel = 0;
      for (const a of document.getAnimations()) {
        const target = a.effect instanceof KeyframeEffect ? a.effect.target : null;
        const timing = a.effect?.getComputedTiming();
        if (!target || !timing || !root?.contains(target)) continue;
        if (!(Number(a.currentTime) > (clocks.get(a) ?? Infinity))) continue; // its clock did not advance: not running
        a.pause();
        const xs = points.map((p) => {
          a.currentTime = Number(timing.delay ?? 0) + p * Number(timing.duration);
          return sideways(target);
        });
        const spread = Math.max(...xs) - Math.min(...xs);
        if (spread >= 1) sidewaysAnimations++;
        travel = Math.max(travel, spread);
      }
      return { drifting, sidewaysAnimations, travel };
    },
    { waitMs: DRIFT_WAIT_MS, points: CYCLE_POINTS },
  );
}

/** What is wrong with a story's motion, as sentences that name the rule; empty when it is as expected. */
export function judgeMotion(reading: MotionReading, expected: MotionExpectation): string[] {
  if (expected === 'pans') {
    return reading.sidewaysAnimations > 0 && reading.travel >= MIN_PAN_TRAVEL_PX
      ? []
      : [`with motion on, nothing carries the scene sideways over a cycle (furthest ${Math.round(reading.travel)} px, wanted at least ${MIN_PAN_TRAVEL_PX}); the kitchen must pan unless motion is reduced (R41, R60), and the pass shows it still, so only this check proves it moves`];
  }
  return reading.sidewaysAnimations === 0 && reading.drifting === 0
    ? []
    : [`with reduce motion set by the app and the browser allowing motion, ${reading.drifting} elements still changed their transform and ${reading.sidewaysAnimations} animations still carried the scene sideways; reduce motion means nothing moves (R41, R60)`];
}
