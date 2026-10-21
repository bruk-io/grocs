// The phone's safe-area insets reach the ui: Groceries keeps its header below the status bar.
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '../../app/index.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

/** The largest padding-top among the element and its ancestors (layouts pad an outer view). */
function paddingTopAbove(el: Element): number {
  let top = 0;
  for (let e: Element | null = el; e; e = e.parentElement) top = Math.max(top, parseFloat(getComputedStyle(e).paddingTop) || 0);
  return top;
}

describe('safe area', () => {
  it('applies the phone insets to Groceries', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }), insets: { top: 40, right: 0, bottom: 24, left: 0 } });
    expect(paddingTopAbove(await screen.findByRole('textbox', { name: 'Add an item' }))).toBe(40);
  });

  it('adds nothing without insets', async () => {
    renderRoute({ index: Home }, { app: await appOnFakes({ signedIn: true }) });
    expect(paddingTopAbove(await screen.findByRole('textbox', { name: 'Add an item' }))).toBeLessThan(40);
  });
});
