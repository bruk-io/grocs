// Level 4 of decision-11 for the screens that render a template with sample data: each route shows its
// screen, and its links lead to the routes the design shows.
import { FakeClock, FakeKitchenGateway, InMemorySyncStore } from '@grocs/ports/testing';
import type { KitchenDetails } from '@grocs/ports';
import type { AddItem, AddMeal as AddMealCommand, ClearCart, ItemAdded, MealAdded, SetItemState } from '@grocs/application';
import { aisleNameKey, createExtraItem, weekIdFor } from '@grocs/core';
import type { Item } from '@grocs/core';
import { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../../app/index.tsx';
import AddMeal from '../../app/add-meal.tsx';
import GroceriesSamples from '../../app/groceries-samples.tsx';
import Household from '../../app/household.tsx';
import Plan from '../../app/plan.tsx';
import QuickAdd from '../../app/quick-add.tsx';
import Recipe from '../../app/recipe.tsx';
import Settings from '../../app/settings.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

const ROUTES = {
  index: Home,
  household: Household,
  plan: Plan,
  'add-meal': AddMeal,
  'groceries-samples': GroceriesSamples,
  'quick-add': QuickAdd,
  recipe: Recipe,
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
  it('tells someone with an invite to sign in with the account it was sent to (TASK-78)', async () => {
    await open('/');
    expect(await screen.findByText('Got an invite? Continue with the Google account it was sent to.')).toBeTruthy();
  });
});

describe('Household', () => {
  let getKitchenSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    getKitchenSpy = null;
  });

  afterEach(() => {
    if (getKitchenSpy) {
      getKitchenSpy.mockRestore();
    }
  });

  it("shows the kitchen's real name, members and the partner's email to add, and Back leads to Settings (TASK-56, TASK-78)", async () => {
    await open('/household', true);
    expect(await screen.findByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
    expect(await screen.findByText('U1 (you)')).toBeTruthy();
    expect(await screen.findByRole('textbox', { name: 'Their email' })).toBeTruthy();
    press(/Settings/);
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy();
  });

  it('opens from Settings', async () => {
    await open('/settings', true);
    fireEvent.click(await screen.findByRole('button', { name: 'Household' }));
    expect(await screen.findByRole('heading', { name: 'Our kitchen' })).toBeTruthy();
  });

  it('shows the failed state when getKitchenInfo rejects (TASK-69)', async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const app = await appOnFakes({ signedIn: true, kitchens, clock });
    getKitchenSpy = vi.spyOn(kitchens, 'getKitchen' as any).mockRejectedValue(new Error('Network error'));
    renderRoute(ROUTES, { app, location: '/household' });
    expect(await screen.findByText('Could not check your kitchen: check your connection and try again')).toBeTruthy();
  });

  it('shows the failed state when getKitchenInfo resolves null (TASK-69)', async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const app = await appOnFakes({ signedIn: true, kitchens, clock });
    getKitchenSpy = vi.spyOn(kitchens, 'getKitchen' as any).mockResolvedValue(null);
    renderRoute(ROUTES, { app, location: '/household' });
    expect(await screen.findByText('Could not check your kitchen: check your connection and try again')).toBeTruthy();
  });

  it('invites by email and shows who is invited, also after coming back to it (TASK-78)', async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const app = await appOnFakes({ signedIn: true, kitchens, clock });
    renderRoute(ROUTES, { app, location: '/household' });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Their email' }), { target: { value: 'shazya@grocs.test' } });
    press('Invite');
    expect(await screen.findByText('Invited shazya@grocs.test. Waiting for them to join.')).toBeTruthy();
    cleanup();
    renderRoute(ROUTES, { app, location: '/household' });
    expect(await screen.findByText('Invited shazya@grocs.test. Waiting for them to join.')).toBeTruthy();
  });

  it('shows both members and no invite once the partner has joined', async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const app = await appOnFakes({ signedIn: true, kitchens, clock });
    const kitchenId = (await kitchens.findMyKitchen())!;
    await kitchens.inviteByEmail(kitchenId, 'shazya@grocs.test');
    await kitchens.asMember({ uid: 'u2', name: 'Shazya', email: 'shazya@grocs.test' }).acceptInvite(kitchenId);
    renderRoute(ROUTES, { app, location: '/household' });
    expect(await screen.findByText('Shazya')).toBeTruthy();
    expect(await screen.findByText(/has both its members/)).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Their email' })).toBeNull();
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

  it('opens Settings from the header, and its back link returns to Meal plan', async () => {
    await open('/plan', true);
    await screen.findByText('This week');
    press('Settings');
    expect(await screen.findByText('Notifications')).toBeTruthy();
    press('Meal plan');
    expect(await screen.findByText('This week')).toBeTruthy();
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

describe('Groceries by aisle (R9, R11, R18)', () => {
  async function appWithItems(clock = new FakeClock()) {
    const app = await appOnFakes({ signedIn: true, clock });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    return { app, kitchenId, weekId, clock };
  }

  it('groups items to buy under their aisle, kept when a meal filter is on', async () => {
    const { app, kitchenId, weekId } = await appWithItems();
    const apples: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Apples', aisle: 'produce' };
    expect((await app.app.dispatch(apples)).ok).toBe(true);
    const milk: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk', aisle: 'dairy' };
    expect((await app.app.dispatch(milk)).ok).toBe(true);
    const addMeal: AddMealCommand = { type: 'AddMeal', kitchenId, weekId, dayIndex: 0, name: 'Tacos' };
    const meal = await app.app.dispatch(addMeal);
    expect(meal.ok).toBe(true);
    const mealId = meal.ok ? (meal.value[0] as MealAdded).mealId : '';
    const cheese: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Cheese', aisle: 'dairy', mealId };
    expect((await app.app.dispatch(cheese)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Apples')).toBeTruthy();
    expect(screen.getByText('Produce')).toBeTruthy();
    expect(screen.getByText('Dairy & eggs')).toBeTruthy();
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('Cheese')).toBeTruthy();
    // Each item sits under its own aisle heading, by document order: Produce before Apples,
    // Apples before the next heading, Dairy & eggs before its own items.
    const text = document.body.textContent ?? '';
    expect(text.indexOf('Produce')).toBeLessThan(text.indexOf('Apples'));
    expect(text.indexOf('Apples')).toBeLessThan(text.indexOf('Dairy & eggs'));
    expect(text.indexOf('Dairy & eggs')).toBeLessThan(text.indexOf('Milk'));
    expect(text.indexOf('Milk')).toBeLessThan(text.indexOf('Cheese'));

    // The rail that chooses a meal only shows at the inner width (decision-14).
    act(() => {
      window.innerWidth = 791;
      window.dispatchEvent(new Event('resize'));
    });
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Sections and meals' })).getByRole('button', { name: /Tacos/ }));
    // Narrowed to Tacos: Cheese (dairy, for Tacos) stays under its aisle heading; Apples and plain Milk drop out.
    expect(screen.getByText('Dairy & eggs')).toBeTruthy();
    expect(screen.getByText('Cheese')).toBeTruthy();
    expect(screen.queryByText('Apples')).toBeNull();
    expect(screen.queryByText('Milk')).toBeNull();
    expect(screen.queryByText('Produce')).toBeNull();
  });

  it("shows who added an item by the kitchen member's name, and nothing for an unknown uid", async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    await kitchens.inviteByEmail(kitchenId, 'shazya@grocs.test');
    await kitchens.asMember({ uid: 'u2', name: 'Shazya', email: 'shazya@grocs.test' }).acceptInvite(kitchenId);
    const syncStore = new InMemorySyncStore();
    const weekId = weekIdFor(clock.now());
    const byPartner = createExtraItem({ id: 'by-partner', weekId, name: 'Oat milk' }, { at: clock.now(), by: 'u2' });
    if (!byPartner.ok) throw new Error('bad fixture');
    await syncStore.mergeItem(kitchenId, byPartner.value);
    const byUnknown = createExtraItem({ id: 'by-unknown', weekId, name: 'Mystery item' }, { at: clock.now(), by: 'not-a-member' });
    if (!byUnknown.ok) throw new Error('bad fixture');
    await syncStore.mergeItem(kitchenId, byUnknown.value);

    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, clock });
    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Oat milk')).toBeTruthy();
    expect(screen.getByText('Mystery item')).toBeTruthy();
    // The header's own avatars already draw one 'Shazya'; her added-Oat-milk row draws a second.
    expect(screen.getAllByRole('img', { name: 'Shazya' })).toHaveLength(2);
    // 'not-a-member' is nobody in this kitchen, so Mystery item's row draws no avatar at all; U1 stays header-only.
    expect(screen.getAllByRole('img', { name: 'U1' })).toHaveLength(1);
    // Nothing is drawn under the uid itself either: it is never shown as if it were a name.
    expect(screen.queryByRole('img', { name: 'not-a-member' })).toBeNull();
  });

  it('shows no avatar for who added while the kitchen is still loading', async () => {
    class NeverLoadsKitchen extends FakeKitchenGateway {
      override getKitchen(): Promise<KitchenDetails | null> {
        return new Promise(() => {
          /* never resolves: the kitchen stays loading for the life of the test */
        });
      }
    }
    const clock = new FakeClock();
    const kitchens = new NeverLoadsKitchen({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    const syncStore = new InMemorySyncStore();
    const weekId = weekIdFor(clock.now());
    const byMe = createExtraItem({ id: 'by-me', weekId, name: 'Oat milk' }, { at: clock.now(), by: 'u1' });
    if (!byMe.ok) throw new Error('bad fixture');
    await syncStore.mergeItem(kitchenId, byMe.value);

    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, clock });
    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Oat milk')).toBeTruthy();
    // The kitchen never loads, so nothing resolves U1's name; no avatar draws anywhere, including the header's.
    expect(screen.queryByRole('img')).toBeNull();
  });

  it("treats a member the gateway resolved no real name for (its own uid-as-name fallback) as unknown", async () => {
    const clock = new FakeClock();
    const kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock);
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    await kitchens.inviteByEmail(kitchenId, 'u2@example.com');
    // Joins as a bare uid, with no display name of their own; the gateway's own fallback for that is the uid.
    await kitchens.asMember('u2').acceptInvite(kitchenId);
    const syncStore = new InMemorySyncStore();
    const weekId = weekIdFor(clock.now());
    const byPartner = createExtraItem({ id: 'by-partner', weekId, name: 'Oat milk' }, { at: clock.now(), by: 'u2' });
    if (!byPartner.ok) throw new Error('bad fixture');
    await syncStore.mergeItem(kitchenId, byPartner.value);

    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, clock });
    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Oat milk')).toBeTruthy();
    // The header draws u2's own fallback name ('u2') as a real avatar name, since Household/Settings
    // show it as-is; the row, by contrast, treats a name that is just the uid as nobody at all, so
    // there is exactly one 'u2' avatar on the page (the header's), not a second one on Oat milk's row.
    expect(screen.getAllByRole('img', { name: 'u2' })).toHaveLength(1);
  });

  it("changing an item's aisle from a row moves it under that aisle and closes the row", async () => {
    const { app, kitchenId, weekId, clock } = await appWithItems();
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(command)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Other')).toBeTruthy();
    press('Milk');
    const group = screen.getByRole('group', { name: 'Aisle for Milk' });
    clock.advance(60_000); // changing the aisle is a later action than adding the item
    fireEvent.click(within(group).getByRole('button', { name: 'Dairy & eggs' }));

    expect(screen.queryByRole('group', { name: 'Aisle for Milk' })).toBeNull();
    expect(await screen.findByText('Dairy & eggs')).toBeTruthy();
    expect(screen.queryByText('Other')).toBeNull();
  });

  it("remembers a row's chosen aisle for later adds of the same name", async () => {
    const { app, kitchenId, weekId, clock } = await appWithItems();
    const first: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(first)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Other')).toBeTruthy();
    press('Milk');
    const group = screen.getByRole('group', { name: 'Aisle for Milk' });
    clock.advance(60_000);
    fireEvent.click(within(group).getByRole('button', { name: 'Dairy & eggs' }));
    expect(await screen.findByText('Dairy & eggs')).toBeTruthy();

    // SetItemAisle's remember is fire-and-forget (R16); wait for it to actually land before relying on it.
    await waitFor(async () => {
      expect(await app.app.suggestAisle(kitchenId, 'Milk')).toBe('dairy');
    });

    clock.advance(60_000);
    const second: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(second)).ok).toBe(true);

    // The dispatch above lands outside any UI event, so the screen's own subscription updates on its
    // own schedule; wait for the second row to actually draw rather than assuming a commit already happened.
    await waitFor(() => expect(screen.getAllByText('Milk')).toHaveLength(2));
    expect(screen.queryByText('Other')).toBeNull();
  });

  it('pressing the open row again closes it without choosing an aisle', async () => {
    const { app, kitchenId, weekId } = await appWithItems();
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(command)).ok).toBe(true);
    renderRoute(ROUTES, { app, location: '/' });
    await screen.findByText('Milk');
    press('Milk');
    expect(await screen.findByRole('group', { name: 'Aisle for Milk' })).toBeTruthy();
    press('Milk');
    expect(screen.queryByRole('group', { name: 'Aisle for Milk' })).toBeNull();
  });

  it("closes an open row's aisle chips when it is ticked into the cart, and does not reopen when unticked back", async () => {
    const { app, kitchenId, weekId, clock } = await appWithItems();
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(command)).ok).toBe(true);
    renderRoute(ROUTES, { app, location: '/' });
    await screen.findByText('Milk');
    press('Milk');
    expect(await screen.findByRole('group', { name: 'Aisle for Milk' })).toBeTruthy();

    clock.advance(60_000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Milk' })); // ticks into the cart; the row leaves to-buy
    await waitFor(() => expect(screen.queryByRole('group', { name: 'Aisle for Milk' })).toBeNull());

    clock.advance(60_000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Milk' })); // unticks back to to-buy
    await screen.findByText('Other');
    expect(screen.queryByRole('group', { name: 'Aisle for Milk' })).toBeNull();
  });

  it('shows a banner when changing the aisle fails, and leaves the item where it was', async () => {
    class FailingStore extends InMemorySyncStore {
      failing = false;
      override mergeItem(kitchenId: string, item: Item): Promise<void> {
        return this.failing ? Promise.reject(new Error('offline')) : super.mergeItem(kitchenId, item);
      }
    }
    const store = new FailingStore();
    const clock = new FakeClock();
    const app = await appOnFakes({ signedIn: true, syncStore: store, clock });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Milk' };
    expect((await app.app.dispatch(command)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByText('Other')).toBeTruthy();
    press('Milk');
    const group = screen.getByRole('group', { name: 'Aisle for Milk' });
    store.failing = true;
    clock.advance(60_000);
    fireEvent.click(within(group).getByRole('button', { name: 'Dairy & eggs' }));

    expect(await screen.findByText('Could not change the aisle')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
    expect(screen.queryByText('Dairy & eggs')).toBeNull();
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
  const SCREENS = ['/', '/plan', '/add-meal?dayId=2026-10-19', '/quick-add', '/settings', '/household'];
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

  it('adds with an amount and the aisle picked from the chips (R11)', async () => {
    const app = await appOnFakes({ signedIn: true });
    renderRoute(ROUTES, { app, location: '/quick-add' });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Add an item' }), { target: { value: 'Paper towels' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount' }), { target: { value: '2 rolls' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pantry' }));
    press('Add');
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Add an item' })).toBeNull());
    cleanup();

    renderRoute(ROUTES, { app, location: '/' });
    expect(await screen.findByRole('checkbox', { name: 'Paper towels' })).toBeTruthy();
    expect(screen.getByText('2 rolls')).toBeTruthy();
    expect(screen.getByText('Pantry')).toBeTruthy();
  });

  it('suggests the aisle remembered for the name as it is typed', async () => {
    const app = await appOnFakes({ signedIn: true });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const garlic: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Garlic', aisle: 'produce' };
    expect((await app.app.dispatch(garlic)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/quick-add' });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Add an item' }), { target: { value: 'Garlic' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true'));
  });

  it('clears the suggested chip when the name changes to one with no remembered aisle', async () => {
    const app = await appOnFakes({ signedIn: true });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const garlic: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Garlic', aisle: 'produce' };
    expect((await app.app.dispatch(garlic)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/quick-add' });
    const nameField = await screen.findByRole('textbox', { name: 'Add an item' });
    fireEvent.change(nameField, { target: { value: 'Garlic' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true'));

    fireEvent.change(nameField, { target: { value: 'Zucchini' } }); // nothing remembered for this one
    await waitFor(() => {
      for (const label of ['Produce', 'Dairy & eggs', 'Meat', 'Bakery', 'Pantry', 'Other']) {
        expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('false');
      }
    });
  });

  it('clears the suggested chip when the name is cleared to blank', async () => {
    const app = await appOnFakes({ signedIn: true });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const garlic: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Garlic', aisle: 'produce' };
    expect((await app.app.dispatch(garlic)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/quick-add' });
    const nameField = await screen.findByRole('textbox', { name: 'Add an item' });
    fireEvent.change(nameField, { target: { value: 'Garlic' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true'));

    fireEvent.change(nameField, { target: { value: '' } });
    // Clearing the chip never needs a lookup, so it happens with no network round trip to wait for.
    expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('adds without an explicit aisle after a suggestion applied, leaving it to AddItem\'s own memory lookup', async () => {
    const app = await appOnFakes({ signedIn: true });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const garlic: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Garlic', aisle: 'produce' };
    expect((await app.app.dispatch(garlic)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/quick-add' });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Add an item' }), { target: { value: 'Garlic' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true'));

    const dispatchSpy = vi.spyOn(app.app, 'dispatch');
    press('Add');
    await waitFor(() => expect(dispatchSpy).toHaveBeenCalled());
    const sent = dispatchSpy.mock.calls.at(-1)?.[0] as AddItem;
    expect(sent.type).toBe('AddItem');
    expect(sent.aisle).toBeUndefined();
    dispatchSpy.mockRestore();
  });

  it("still suggests a cleared item's aisle for the same name (R14)", async () => {
    const app = await appOnFakes({ signedIn: true });
    const kitchenId = (await app.app.findMyKitchen())!;
    const weekId = weekIdFor(app.app.now());
    const yogurt: AddItem = { type: 'AddItem', kitchenId, weekId, name: 'Yogurt', aisle: 'dairy' };
    const added = await app.app.dispatch(yogurt);
    expect(added.ok).toBe(true);
    const itemId = added.ok ? (added.value[0] as ItemAdded).itemId : '';
    const toCart: SetItemState = { type: 'SetItemState', kitchenId, weekId, itemId, inCart: true };
    expect((await app.app.dispatch(toCart)).ok).toBe(true);
    const clearCart: ClearCart = { type: 'ClearCart', kitchenId, weekId };
    expect((await app.app.dispatch(clearCart)).ok).toBe(true);

    renderRoute(ROUTES, { app, location: '/quick-add' });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Add an item' }), { target: { value: 'Yogurt' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dairy & eggs' }).getAttribute('aria-pressed')).toBe('true'));
  });
});

describe('Quick add aisle suggestion guards (R11, R14)', () => {
  /** Holds every aisleFor lookup open until a test resolves it, in call order per name, so a race between two
   * lookups (which answers first, whether a choice lands mid-flight) is exact instead of timing-dependent. */
  class DeferredAisleStore extends InMemorySyncStore {
    readonly #pending = new Map<string, Array<(value: string | null) => void>>();
    override aisleFor(_kitchenId: string, nameKey: string): Promise<string | null> {
      return new Promise((resolve) => {
        const queue = this.#pending.get(nameKey) ?? [];
        queue.push(resolve);
        this.#pending.set(nameKey, queue);
      });
    }
    /** Resolves the oldest still-pending lookup for `name`, as that lookup's own answer would. */
    resolveOldest(name: string, value: string | null): void {
      const nameKey = aisleNameKey(name);
      const next = this.#pending.get(nameKey)?.shift();
      if (!next) throw new Error(`no pending aisleFor lookup for '${name}'`);
      next(value);
    }
  }

  it('an older answer landing after a newer one never overrides it', async () => {
    const syncStore = new DeferredAisleStore();
    const app = await appOnFakes({ signedIn: true, syncStore });
    renderRoute(ROUTES, { app, location: '/quick-add' });
    const nameField = await screen.findByRole('textbox', { name: 'Add an item' });

    fireEvent.change(nameField, { target: { value: 'Apple' } });
    fireEvent.change(nameField, { target: { value: 'Banana' } });

    syncStore.resolveOldest('Banana', 'produce'); // the newer lookup answers first
    await waitFor(() => expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true'));

    syncStore.resolveOldest('Apple', 'dairy'); // the older, now-stale lookup answers late
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'Dairy & eggs' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  it('a person choosing an aisle while a lookup is in flight keeps that choice when it answers', async () => {
    const syncStore = new DeferredAisleStore();
    const app = await appOnFakes({ signedIn: true, syncStore });
    renderRoute(ROUTES, { app, location: '/quick-add' });
    const nameField = await screen.findByRole('textbox', { name: 'Add an item' });

    fireEvent.change(nameField, { target: { value: 'Apple' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pantry' }));
    syncStore.resolveOldest('Apple', 'produce');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pantry' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'Produce' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  it('deselecting a chip and then typing never lets a later suggestion apply', async () => {
    const syncStore = new DeferredAisleStore();
    const app = await appOnFakes({ signedIn: true, syncStore });
    renderRoute(ROUTES, { app, location: '/quick-add' });
    const nameField = await screen.findByRole('textbox', { name: 'Add an item' });

    fireEvent.click(screen.getByRole('button', { name: 'Pantry' })); // chooses
    fireEvent.click(screen.getByRole('button', { name: 'Pantry' })); // deselects (sends undefined)
    expect(screen.getByRole('button', { name: 'Pantry' }).getAttribute('aria-pressed')).toBe('false');

    // Touched, so typing makes no lookup at all; there is nothing left pending to even resolve.
    fireEvent.change(nameField, { target: { value: 'Banana' } });
    for (const label of ['Produce', 'Dairy & eggs', 'Meat', 'Bakery', 'Pantry', 'Other']) {
      expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('false');
    }
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
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
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
