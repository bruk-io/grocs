// R43 and decision-14 on the real Groceries route: the rail from 600 dp, and the meal filter across postures.
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FakeClock, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import Home from '../../app/index.tsx';
import Plan from '../../app/plan.tsx';
import { FakeClipboard } from '../../testing/fake-clipboard.ts';
import { renderRoute } from '../../testing/render-route.tsx';
import { composeDemoApp } from '../demo/compose-demo.ts';

afterEach(cleanup);

const OUTER = 412;
const INNER = 791;

function resizeTo(width: number) {
  act(() => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  });
}

async function open(width: number) {
  const app = composeDemoApp({
    logger: new MemoryLogger(),
    copyText: new FakeClipboard().copyText,
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
    clock: new FakeClock(),
    ids: new SequentialIds('d'),
  });
  renderRoute({ index: Home, plan: Plan }, { app });
  fireEvent.click(await screen.findByRole('button', { name: 'Try the demo' }));
  await screen.findByText('Yellow onions');
  resizeTo(width);
}

const rail = () => screen.queryByRole('navigation', { name: 'Sections and meals' });

describe('Groceries by window width', () => {
  it('shows the meal rail at 791 dp', async () => {
    await open(INNER);
    expect(rail()).not.toBeNull();
    expect(screen.getByText("This week's meals")).toBeTruthy();
  });

  it('shows the phone layout, without the rail, at 412 dp', async () => {
    await open(OUTER);
    expect(rail()).toBeNull();
    expect(screen.getByText('Yellow onions')).toBeTruthy();
  });

  it('switches at 600 dp', async () => {
    await open(599);
    expect(rail()).toBeNull();
    resizeTo(600);
    expect(rail()).not.toBeNull();
  });
});

describe('the meal filter', () => {
  it('narrows the list to the chosen meal and hides the cart until Show all', async () => {
    await open(INNER);
    fireEvent.click(screen.getByRole('button', { name: /Sheet-pan chicken/ }));
    expect(screen.getByText('Bell peppers')).toBeTruthy();
    expect(screen.getByText('Chicken thighs')).toBeTruthy();
    expect(screen.queryByText('Garlic')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(screen.getByText('Garlic')).toBeTruthy();
  });

  it('survives folding and unfolding', async () => {
    await open(INNER);
    fireEvent.click(screen.getByRole('button', { name: /Sheet-pan chicken/ }));
    expect(screen.queryByText('Garlic')).toBeNull();
    resizeTo(OUTER); // fold
    expect(rail()).toBeNull();
    expect(screen.queryByText('Garlic')).toBeNull();
    expect(screen.getByText('Bell peppers')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show all' })).toBeTruthy();
    resizeTo(INNER); // unfold
    expect(rail()).not.toBeNull();
    expect(screen.queryByText('Garlic')).toBeNull();
    expect(screen.getByText('Bell peppers')).toBeTruthy();
  });

  it('keeps a filter chosen on the inner screen when folded', async () => {
    await open(INNER);
    fireEvent.click(screen.getByRole('button', { name: /Chana masala/ }));
    resizeTo(OUTER);
    expect(screen.queryByText('Chicken thighs')).toBeNull();
    expect(screen.getByText('Garlic')).toBeTruthy();
  });
});
