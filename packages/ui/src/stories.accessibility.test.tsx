/// <reference types="vite/client" />
// R42, for every story: text meets a 4.5:1 contrast ratio against what it sits on, and every touch
// target is at least 44 by 44 points. One test per story, so the failure names the story.
//
// jsdom has no layout, but react-native-web writes sizes and colours as styles it can resolve, so the
// sizes below are the ones a component asks for (width or minWidth, height or minHeight), and the
// colours are the ones it paints. The browser run (pnpm --filter @grocs/ui shots) shows the result.
import { composeStories } from '@storybook/react-native-web-vite';
import type { Meta } from '@storybook/react-native-web-vite';
import { cleanup, render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { tokens } from './tokens/tokens.ts';

type StoryModule = { default: Meta };
const modules = import.meta.glob<StoryModule>('./**/*.stories.tsx', { eager: true });

afterEach(cleanup);

const TARGET = tokens.size.target;
const MIN_CONTRAST = 4.5;
const TARGET_ROLES = new Set(['button', 'checkbox', 'switch', 'link', 'radio', 'tab', 'textbox', 'menuitem']);
/** Where a story has no background of its own, the preview decorator puts it on the screen colour. */
const SCREEN = tokens.color.surfaceCanvas;

interface Colour {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColour(css: string): Colour | null {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/.exec(css.trim());
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) };
}

/** WCAG relative luminance and contrast ratio. */
function luminance(c: Colour): number {
  const [r, g, b] = [c.r, c.g, c.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: Colour, b: Colour): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

function fromHex(value: string): Colour {
  const n = value.replace('#', '');
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16), a: 1 };
}

const hex = (c: Colour): string => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (top: Colour, below: Colour, alpha: number): Colour => ({
  r: top.r * alpha + below.r * (1 - alpha),
  g: top.g * alpha + below.g * (1 - alpha),
  b: top.b * alpha + below.b * (1 - alpha),
  a: 1,
});

/** What is painted behind an element: the nearest ancestors' backgrounds, laid over the screen colour. */
function backdrop(el: Element): Colour {
  const layers: Colour[] = [];
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = parseColour(getComputedStyle(node).backgroundColor);
    if (bg && bg.a > 0) layers.push(bg);
    if (bg && bg.a === 1) break;
  }
  const screen = fromHex(SCREEN);
  let base: Colour = { ...screen, a: 1 };
  if (layers.length > 0 && layers[layers.length - 1]!.a < 1) base = screen;
  for (const layer of layers.reverse()) base = mix(layer, base, layer.a);
  return base;
}

/** Opacity an element is drawn with, counting its ancestors. */
function opacityOf(el: Element): number {
  let o = 1;
  for (let node: Element | null = el; node; node = node.parentElement) {
    const v = getComputedStyle(node).opacity;
    if (v !== '') o *= Number(v);
  }
  return o;
}

const inactive = (el: Element): boolean => el.closest('[aria-disabled="true"], [disabled], [aria-hidden="true"], [readonly]') !== null;

function size(el: Element, axis: 'width' | 'height'): number {
  const cs = getComputedStyle(el);
  const own = parseFloat(axis === 'width' ? cs.width : cs.height);
  const min = parseFloat(axis === 'width' ? cs.minWidth : cs.minHeight);
  return Math.max(Number.isFinite(own) ? own : 0, Number.isFinite(min) ? min : 0);
}

export function lowContrast(root: Element): string[] {
  const problems: string[] = [];
  for (const el of Array.from(root.querySelectorAll('*'))) {
    if (el.closest('svg') || inactive(el)) continue; // art is not text; inactive controls are exempt from contrast (WCAG 1.4.3)
    const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');
    if (!ownText && !(el instanceof HTMLInputElement && el.value !== '')) continue;
    const opacity = opacityOf(el);
    if (opacity === 0) continue;
    const fg = parseColour(getComputedStyle(el).color);
    if (!fg) continue;
    const back = backdrop(el);
    const painted = mix(fg, back, fg.a * opacity);
    const ratio = contrast(painted, back);
    if (ratio < MIN_CONTRAST) problems.push(`"${(el.textContent ?? '').trim().slice(0, 30)}" is ${ratio.toFixed(2)}:1 (${hex(painted)} on ${hex(back)})`);
  }
  return problems;
}

export function smallTargets(root: Element): string[] {
  const problems: string[] = [];
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const role = el.getAttribute('role');
    const isTarget = (role !== null && TARGET_ROLES.has(role)) || el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
    if (!isTarget || el.closest('[aria-hidden="true"]')) continue;
    // A text field has no width of its own: it fills the row it sits in.
    const fills = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
    const w = fills ? Math.max(size(el, 'width'), TARGET) : size(el, 'width');
    const h = size(el, 'height');
    if (w < TARGET || h < TARGET) {
      const name = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 30);
      problems.push(`${role ?? el.tagName.toLowerCase()} "${name}" asks for ${w} x ${h}, under ${TARGET} x ${TARGET}`);
    }
  }
  return problems;
}

describe('every story meets R42', () => {
  for (const [file, mod] of Object.entries(modules)) {
    const stories = composeStories(mod as never) as Record<string, ComponentType>;
    describe(file, () => {
      for (const [name, Story] of Object.entries(stories)) {
        it(`${name}: text is 4.5:1 and targets are 44 x 44`, () => {
          const { container } = render(<Story />);
          expect(lowContrast(container), `contrast in ${file} ${name}`).toEqual([]);
          expect(smallTargets(container), `touch targets in ${file} ${name}`).toEqual([]);
        });
      }
    });
  }

  it('finds low contrast and small targets when they are there', () => {
    const host = document.createElement('div');
    host.innerHTML =
      '<div style="background-color: rgb(255, 255, 255)"><span style="color: rgb(200, 200, 200)">pale</span></div>' +
      '<div role="button" aria-label="tiny" style="width: 20px; height: 20px"></div>';
    document.body.appendChild(host);
    expect(lowContrast(host)).toHaveLength(1);
    expect(smallTargets(host)).toHaveLength(1);
    host.remove();
  });
});
