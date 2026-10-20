// Level 4 of decision-11 on the demo composition (decision-12): the real routes, rendered over
// composeDemoApp, which runs on the in-memory provider and the sample data.
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FakeClock, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import Home from '../../app/index.tsx';
import Plan from '../../app/plan.tsx';
import Settings from '../../app/settings.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';
import { FakeClipboard } from '../../testing/fake-clipboard.ts';
import { composeDemoApp } from './compose-demo.ts';

afterEach(cleanup);

const ROUTES = { index: Home, plan: Plan, settings: Settings };

function demoApp() {
  return composeDemoApp({
    logger: new MemoryLogger(),
    copyText: new FakeClipboard().copyText,
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
    clock: new FakeClock(),
    ids: new SequentialIds('d'),
  });
}

async function openDemo() {
  renderRoute(ROUTES, { app: demoApp() });
  fireEvent.click(await screen.findByRole('button', { name: 'Try the demo' }));
  await screen.findByText('Yellow onions');
}

describe('demo composition', () => {
  it('opens on Welcome, with a way in that needs no account', async () => {
    renderRoute(ROUTES, { app: demoApp() });
    expect(await screen.findByText('Plan the week. Shop together.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try the demo' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).toBeNull();
    expect(screen.queryByText('Got an invite?')).toBeNull();
  });

  it('has no way in but the real ones in a build that is not the demo', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false }) });
    await screen.findByText('Plan the week. Shop together.');
    expect(screen.queryByRole('button', { name: 'Try the demo' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
  });

  it('shows the sample list on Groceries after Try the demo', async () => {
    await openDemo();
    for (const name of ['Garlic', 'Bell peppers', 'Chicken thighs']) {
      expect(screen.getByRole('checkbox', { name })).toBeTruthy();
    }
    expect(screen.queryByText('Nothing on the list yet')).toBeNull();
  });

  it('adds an item to the sample list', async () => {
    await openDemo();
    const box = screen.getByRole('textbox', { name: 'Add an item' });
    fireEvent.change(box, { target: { value: 'Oat milk' } });
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByRole('checkbox', { name: 'Oat milk' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Garlic' })).toBeTruthy();
  });

  it('shows the sample meal plan and the settings, reached by the tabs', async () => {
    await openDemo();
    fireEvent.click(screen.getByText('Meal plan'));
    expect(await screen.findByText('Chana masala')).toBeTruthy();
    expect(screen.getByText('Sheet-pan chicken')).toBeTruthy();
    fireEvent.click(screen.getByText('Groceries'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByText('Notifications')).toBeTruthy();
    expect(screen.getByText(/Our kitchen/)).toBeTruthy();
  });
});
