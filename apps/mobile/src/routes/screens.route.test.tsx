// Level 4 of decision-11 for the screens that render a template with sample data: each route shows its
// screen, and its links lead to the routes the design shows.
import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import type { AddItem } from '@grocs/application';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '../../app/index.tsx';
import AddMeal from '../../app/add-meal.tsx';
import GroceriesSamples from '../../app/groceries-samples.tsx';
import Household from '../../app/household.tsx';
import Join from '../../app/join.tsx';
import Plan from '../../app/plan.tsx';
import QuickAdd from '../../app/quick-add.tsx';
import Settings from '../../app/settings.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

const ROUTES = {
  index: Home,
  household: Household,
  join: Join,
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
    expect(await screen.findByRole('button', { name: 'Check code' })).toBeTruthy();
  });
});

describe('Household', () => {
  it("shows the kitchen's real name, members and invite code, and Back leads to Settings (TASK-56)", async () => {
    await open('/household', true);
    expect(await screen.findByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
    expect(await screen.findByText('u1 (you)')).toBeTruthy();
    expect(await screen.findByText(/^[A-Z]+-\d{4}$/)).toBeTruthy();
    expect(screen.getByText(/^Waiting for your partner to join\. Works until /)).toBeTruthy();
    expect(screen.queryByText('MOREL-24')).toBeNull();
    press(/Settings/);
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy();
  });

  it('opens from Settings', async () => {
    await open('/settings', true);
    fireEvent.click(await screen.findByRole('button', { name: 'Household' }));
    expect(await screen.findByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
  });

  it('shows both members and no code once the partner has joined', async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway('u1', undefined, clock);
    const app = await appOnFakes({ signedIn: true, kitchens, clock });
    const invite = await kitchens.inviteForKitchen((await kitchens.findMyKitchen())!);
    if (invite.kind !== 'open') throw new Error('expected an open invite');
    await kitchens.asMember('u2', 'Shazya').joinKitchen(invite.code);
    renderRoute(ROUTES, { app, location: '/household' });
    expect(await screen.findByText('Shazya')).toBeTruthy();
    expect(await screen.findByText(/has both its members/)).toBeTruthy();
    expect(screen.queryByText(/^[A-Z]+-\d{4}$/)).toBeNull();
  });
});

describe('JoinInvite', () => {
  it("names the real sender and kitchen from the server, ignoring names written into the link (TASK-70)", async () => {
    const clock = new FakeClock();
    const mine = new FakeKitchenGateway('u1', undefined, clock);
    const { inviteCode } = await mine.asMember('u2', 'Bruk').createKitchen('Our place', 'UTC');
    const app = await appOnFakes({ signedIn: true, kitchen: false, kitchens: mine, clock });
    renderRoute(ROUTES, { app, location: `/join?code=${inviteCode}&from=Mallory&kitchen=Fake%20kitchen` });
    expect(await screen.findByText('Bruk invited you to')).toBeTruthy();
    expect(screen.getByText('Our place')).toBeTruthy();
    expect(screen.queryByText(/Mallory|Fake kitchen/)).toBeNull();
  });

  it('names nobody when signed out, since only a signed-in person may ask the server', async () => {
    await open('/join?code=MOREL-0042&from=Mallory&kitchen=Fake%20kitchen');
    expect(await screen.findByText('Your partner invited you to')).toBeTruthy();
    expect(screen.getByText('their kitchen')).toBeTruthy();
    expect(screen.queryByText(/Mallory|Fake kitchen/)).toBeNull();
  });

  it('shows the invite from a link, and the code entry from /join', async () => {
    await open('/join?code=MOREL-0042');
    expect(await screen.findByText("You're invited")).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Join with Google' })).toBeTruthy();
  });
});

describe('JoinInvite after a wrong code', () => {
  it('shows the error on the real route with no sample data, and Back to my invite leaves it (TASK-68)', async () => {
    await open('/join', true);
    fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'NOPE-0000' } });
    press('Check code');
    expect(await screen.findByText("Code didn't work")).toBeTruthy();
    expect(screen.getByText(/That code is not a match/)).toBeTruthy();
    expect(screen.queryByText(/Alex/)).toBeNull();
    press('Back to my invite');
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });
});

describe('real kitchen data, no samples (TASK-58, TASK-63)', () => {
  it("draws the kitchen's own members on Meal plan, not the sample A and S", async () => {
    await open('/plan', true);
    expect(await screen.findByText('This week')).toBeTruthy();
    expect(await screen.findByText('U')).toBeTruthy();
    expect(screen.queryByText('Alex')).toBeNull();
    expect(screen.queryByText('Sam')).toBeNull();
  });

  it("shows the kitchen's real name in Settings", async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway('u1', undefined, clock);
    await kitchens.createKitchen('Home', 'UTC');
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false, kitchens, clock }), location: '/settings' });
    expect(await screen.findByText('u1@grocs.test · Home')).toBeTruthy();
  });
});

describe('Plan', () => {
  it('shows the week blank for a new kitchen, and the tab and settings lead where the design shows', async () => {
    await open('/plan', true);
    expect(await screen.findByText('This week')).toBeTruthy();
    expect(await screen.findAllByText('Plan a meal')).toHaveLength(7);
    go('Groceries');
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });

  it('opens Settings from the header', async () => {
    await open('/plan', true);
    await screen.findByText('This week');
    press('Settings');
    expect(await screen.findByText('Notifications')).toBeTruthy();
  });

  it('opens Add a meal from a day', async () => {
    await open('/plan', true);
    fireEvent.click((await screen.findAllByText('Plan a meal'))[0]!);
    expect(await screen.findByText('Add a meal')).toBeTruthy();
  });

  it('shows Welcome, not a blank screen, for someone not signed in', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: false }), location: '/plan' });
    expect(await screen.findByText('Plan the week. Shop together.')).toBeTruthy();
  });

  it('shows kitchen setup, not a blank screen, for a signed-in member with no kitchen yet', async () => {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, kitchen: false }), location: '/plan' });
    expect(await screen.findByText('Your kitchen')).toBeTruthy();
  });
});

describe('AddMeal', () => {
  it('shows the form and both Back and Add to Monday lead to Meal plan', async () => {
    await open('/add-meal?dayId=2026-10-19', true);
    expect(await screen.findByText('Add a meal')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('What are you making?'), { target: { value: 'Fried rice' } });
    press('Add to Monday');
    expect(await screen.findByText('This week')).toBeTruthy();
  });

  it('goes back to Meal plan', async () => {
    await open('/add-meal?dayId=2026-10-19', true);
    await screen.findByText('Add a meal');
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
    expect(await screen.findByRole('heading', { name: 'Add an item' })).toBeTruthy();
  });
});

describe('Groceries samples (dev-only route)', () => {
  async function openSample(location: string) {
    renderRoute(ROUTES, { app: await appOnFakes({ signedIn: true, isDevBuild: true }), location });
  }

  it('shows the list with the partner toast', async () => {
    await openSample('/groceries-samples');
    expect(await screen.findByText('Yellow onions')).toBeTruthy();
    expect(screen.getByText('Sam added Oat milk · just now')).toBeTruthy();
  });

  it('shows the offline state with its waiting changes', async () => {
    await openSample('/groceries-samples?state=offline');
    expect(await screen.findByText('Offline. 2 changes waiting.')).toBeTruthy();
  });

  it('shows the toast state', async () => {
    await openSample('/groceries-samples?state=toast');
    expect(await screen.findByText('Sam added Oat milk · just now')).toBeTruthy();
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
  const SCREENS = ['/', '/plan', '/add-meal?dayId=2026-10-19', '/quick-add', '/settings', '/household', '/join', '/join?code=MOREL-0042'];
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
  it('shows no sample suggestions, and Back leads to Groceries (TASK-57)', async () => {
    await open('/quick-add', true);
    expect(await screen.findByRole('heading', { name: 'Add an item' })).toBeTruthy();
    expect(screen.queryByText('Eggplant')).toBeNull();
    expect(screen.queryByText('Suggestions')).toBeNull();
    expect(screen.queryByText('You buy often')).toBeNull();
    press(/Groceries/);
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });

  it('tags the added item with the selected meal, visible on Groceries (R10)', async () => {
    const app = await appOnFakes({ signedIn: true });
    renderRoute(ROUTES, { app, location: '/add-meal?dayId=2026-10-19' });
    await screen.findByText('Add a meal');
    fireEvent.change(screen.getByLabelText('What are you making?'), { target: { value: 'Tacos' } });
    press('Add to Monday');
    await screen.findByText('This week');
    cleanup();

    renderRoute(ROUTES, { app, location: '/quick-add' });
    fireEvent.click(await screen.findByRole('button', { name: 'Tacos' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Add an item' }), { target: { value: 'Garlic' } });
    press('Add');
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Add an item' })).toBeNull());
    cleanup();

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByRole('checkbox', { name: 'Garlic' })).toBeTruthy();
    // The rail's meal list only draws at inner width (decision-14); at phone width, the one
    // "Tacos" left on screen is the badge ItemRow draws beside Garlic (R10).
    expect(screen.getByText('Tacos')).toBeTruthy();
  });

  it('adds with no meal selected unchanged: no badge on the item', async () => {
    const app = await appOnFakes({ signedIn: true });
    renderRoute(ROUTES, { app, location: '/add-meal?dayId=2026-10-19' });
    await screen.findByText('Add a meal');
    fireEvent.change(screen.getByLabelText('What are you making?'), { target: { value: 'Tacos' } });
    press('Add to Monday');
    await screen.findByText('This week');
    cleanup();

    renderRoute(ROUTES, { app, location: '/quick-add' });
    await screen.findByRole('button', { name: 'Tacos' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Add an item' }), { target: { value: 'Garlic' } });
    press('Add');
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Add an item' })).toBeNull());
    cleanup();

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByRole('checkbox', { name: 'Garlic' })).toBeTruthy();
    expect(screen.queryByText('Tacos')).toBeNull();
  });
});

describe('Settings', () => {
  it('shows the cards, Back leads to Groceries and Sign out to Welcome', async () => {
    await open('/settings');
    expect(await screen.findByText('Diagnostics')).toBeTruthy();
    press('Sign out');
    expect(await screen.findByText('Plan the week. Shop together.')).toBeTruthy();
  });

  it('signs the member out: the session ends and Welcome shows', async () => {
    const app = await appOnFakes({ signedIn: true });
    renderRoute(ROUTES, { app, location: '/settings' });
    expect(await screen.findByText('U1')).toBeTruthy();
    press('Sign out');
    expect(await screen.findByText('Plan the week. Shop together.')).toBeTruthy();
    const users: unknown[] = [];
    const stop = app.app.watchSession((user) => users.push(user));
    await waitFor(() => expect(users).toEqual([null]));
    stop();
  });

  it('copies diagnostics with the header and recent records, and nothing personal', async () => {
    const app = await appOnFakes({ signedIn: true });
    const command: AddItem = { type: 'AddItem', kitchenId: 'k1', weekId: '2026-W43', name: 'Zucchini for Sam', amount: '3 kg' };
    const added = await app.app.dispatch(command);
    expect(added.ok).toBe(true);
    renderRoute(ROUTES, { app, location: '/settings' });
    expect(await screen.findByText('U1')).toBeTruthy();
    press('Copy diagnostics');
    await waitFor(() => expect(app.clipboard.copied).toHaveLength(1));
    const copied = app.clipboard.text ?? '';
    expect(copied.split('\n')[0]).toBe('grocs diagnostics - version test, platform test, build 1');
    expect(copied).toContain('AddItem');
    for (const personal of ['Zucchini', 'Sam', '3 kg', 'u1@grocs.test', 'U1']) expect(copied).not.toContain(personal);
  });

  it('draws the notifications switch disabled with the reason "Coming soon"', async () => {
    await open('/settings');
    expect(await screen.findByText('Coming soon')).toBeTruthy();
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-disabled') === 'true' || toggle.hasAttribute('disabled')).toBe(true);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('goes back to Groceries', async () => {
    await open('/settings', true);
    press(/Groceries/);
    expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
  });
});
