// Level 4 of decision-11 for the screens that render a template with sample data: each route shows its
// screen, and its links lead to the routes the design shows.
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '../../app/index.tsx';
import AddMeal from '../../app/add-meal.tsx';
import GroceriesSamples from '../../app/groceries-samples.tsx';
import Household from '../../app/household.tsx';
import Join from '../../app/join.tsx';
import JoinInvalid from '../../app/join-invalid.tsx';
import Plan from '../../app/plan.tsx';
import QuickAdd from '../../app/quick-add.tsx';
import Settings from '../../app/settings.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

const ROUTES = {
  index: Home,
  household: Household,
  join: Join,
  'join-invalid': JoinInvalid,
  plan: Plan,
  'add-meal': AddMeal,
  'groceries-samples': GroceriesSamples,
  'quick-add': QuickAdd,
  settings: Settings,
};

afterEach(cleanup);

async function open(location: string, signedIn = false) {
  renderRoute(ROUTES, { app: await appOnFakes({ signedIn }), location });
}
const press = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
/** Either a button or a link, whichever the template draws. */
const go = (name: string | RegExp) => fireEvent.click(screen.getByText(name));

describe('Welcome', () => {
  it('leads to the invite from Open it to join', async () => {
    await open('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Open it to join' }));
    expect(await screen.findByText("You're invited")).toBeTruthy();
  });
});

describe('Household', () => {
  it('shows the kitchen and invite code, and Start planning leads to Meal plan', async () => {
    await open('/household');
    expect(await screen.findByText('Your kitchen')).toBeTruthy();
    expect(screen.getByText('MOREL-24')).toBeTruthy();
    press('Start planning');
    expect(await screen.findByText('This week')).toBeTruthy();
  });
});

describe('JoinInvite', () => {
  it('shows the invite and Join with Google leads to Meal plan', async () => {
    await open('/join');
    expect(await screen.findByText("You're invited")).toBeTruthy();
    press('Join with Google');
    expect(await screen.findByText('This week')).toBeTruthy();
  });
});

describe('JoinInviteInvalid', () => {
  it('shows the error and Back to my invite leads to the invite', async () => {
    await open('/join-invalid');
    expect(await screen.findByText("Code didn't work")).toBeTruthy();
    expect(screen.getByText(/That code is not a match/)).toBeTruthy();
    press('Back to my invite');
    expect(await screen.findByText("You're invited")).toBeTruthy();
  });
});

describe('Plan', () => {
  it('shows the week, and the tab, settings and Plan a meal lead where the design shows', async () => {
    await open('/plan', true);
    expect(await screen.findByText('This week')).toBeTruthy();
    expect(screen.getByText('Chana masala')).toBeTruthy();
    go('Groceries');
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });

  it('opens Settings from the header', async () => {
    await open('/plan');
    press('Settings');
    expect(await screen.findByText('Notifications')).toBeTruthy();
  });

  it('opens Add a meal from a day', async () => {
    await open('/plan');
    fireEvent.click((await screen.findAllByText('Plan a meal'))[0]!);
    expect(await screen.findByText('Add a meal')).toBeTruthy();
  });
});

describe('AddMeal', () => {
  it('shows the form and both Back and Add to Thursday lead to Meal plan', async () => {
    await open('/add-meal');
    expect(await screen.findByText('Add a meal')).toBeTruthy();
    press('Add to Thursday');
    expect(await screen.findByText('This week')).toBeTruthy();
  });

  it('goes back to Meal plan', async () => {
    await open('/add-meal');
    press(/Meal plan/);
    expect(await screen.findByText('This week')).toBeTruthy();
  });
});

describe('Groceries (live, at /)', () => {
  it('opens Plan from the tab, and Settings from the header', async () => {
    await open('/', true);
    await screen.findByText('Nothing on the list yet');
    go('Meal plan');
    expect(await screen.findByText('This week')).toBeTruthy();
    go('Groceries');
    await screen.findByText('Nothing on the list yet');
    press('Settings');
    expect(await screen.findByText('Notifications')).toBeTruthy();
  });

  it('opens Add an item from the empty list', async () => {
    await open('/', true);
    await screen.findByText('Nothing on the list yet');
    press('Add an item');
    expect(await screen.findByText('Eggplant')).toBeTruthy();
  });
});

describe('Groceries samples (dev-only route)', () => {
  async function openSample(location: string) {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, dev: true }), location });
  }

  it('shows the list with the partner toast', async () => {
    await openSample('/groceries-samples');
    expect(await screen.findByText('Yellow onions')).toBeTruthy();
    expect(screen.getByText('Shazya added Oat milk · just now')).toBeTruthy();
  });

  it('shows the offline state with its waiting changes', async () => {
    await openSample('/groceries-samples?state=offline');
    expect(await screen.findByText('Offline. 2 changes waiting.')).toBeTruthy();
  });

  it('shows the toast state', async () => {
    await openSample('/groceries-samples?state=toast');
    expect(await screen.findByText('Shazya added Oat milk · just now')).toBeTruthy();
    expect(screen.queryByText('Offline. 2 changes waiting.')).toBeNull();
  });

  it('shows the empty and all-done states', async () => {
    await openSample('/groceries-samples?state=empty');
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
    cleanup();
    await openSample('/groceries-samples?state=allDone');
    expect(await screen.findByText('Greek yogurt')).toBeTruthy();
  });

  it('shows nothing in a release build', async () => {
    await open('/groceries-samples', true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText('Yellow onions')).toBeNull();
  });
});

describe('the mushroom host (R40)', () => {
  const SCREENS = ['/', '/plan', '/add-meal', '/quick-add', '/settings', '/household', '/join', '/join-invalid'];
  it.each(SCREENS)('is on %s', async (location) => {
    await open(location, true);
    expect((await screen.findAllByRole('button', { name: /tap to hear a line/ })).length).toBeGreaterThan(0);
  });

  it('is on Welcome', async () => {
    await open('/');
    expect((await screen.findAllByRole('button', { name: /tap to hear a line/ })).length).toBeGreaterThan(0);
  });
});

describe('QuickAdd', () => {
  it('shows suggestions and Back leads to Groceries', async () => {
    await open('/quick-add', true);
    expect(await screen.findByText('Eggplant')).toBeTruthy();
    press(/Groceries/);
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });
});

describe('Settings', () => {
  it('shows the cards, Back leads to Groceries and Sign out to Welcome', async () => {
    await open('/settings');
    expect(await screen.findByText('Diagnostics')).toBeTruthy();
    press('Sign out');
    expect(await screen.findByText('Plan the week. Shop together.')).toBeTruthy();
  });

  it('goes back to Groceries', async () => {
    await open('/settings', true);
    press(/Groceries/);
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });
});
