// Level 4 of decision-11 for the meal plan (R5-R8): the real Plan and AddMeal routes over the fake
// providers, proving add, rename, relink and remove each dispatch the right application command.
// Mirrors ListScreen.test.tsx's watchWeekItems route-test pattern. Move is TASK-51: no UI affordance
// exists yet to trigger it (recorded on TASK-1.21.6's AC5).
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMeal, weekIdFor } from '@grocs/core';
import { FakeClock, FakeKitchenGateway, InMemorySyncStore } from '@grocs/ports/testing';
import AddMeal from '../../app/add-meal.tsx';
import Plan from '../../app/plan.tsx';
import { appOnFakes, renderRoute } from '../../testing/render-route.tsx';

afterEach(cleanup);

const ROUTES = { plan: Plan, 'add-meal': AddMeal };

async function openPlan(syncStore = new InMemorySyncStore()) {
  const kitchens = new FakeKitchenGateway('u1');
  const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
  const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens });
  renderRoute(ROUTES, { app, location: '/plan' });
  await screen.findByText('This week');
  const weekId = weekIdFor(app.app.now());
  return { app, syncStore, kitchenId, weekId };
}

describe('the meal plan route wiring (R5-R8)', () => {
  it('adds a meal to the day it was planned on (AddMeal)', async () => {
    const { syncStore, kitchenId, weekId } = await openPlan();

    fireEvent.click((await screen.findAllByText('Plan a meal'))[0]!);
    await screen.findByText('Add a meal');
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you making?' }), { target: { value: 'Chana masala' } });
    fireEvent.click(screen.getByRole('button', { name: /Add to/ }));

    expect(await screen.findByText('Chana masala')).toBeTruthy();
    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
    expect(meals[0]?.name.value).toBe('Chana masala');
    expect(meals[0]?.dayIndex.value).toBe(0); // the first day row is Monday
    expect(meals[0]?.weekId.value).toBe(weekId);
  });

  it('renames and relinks a meal already on the plan (EditMeal)', async () => {
    const syncStore = new InMemorySyncStore();
    const kitchens = new FakeKitchenGateway('u1');
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    const clock = new FakeClock();
    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens, clock });
    const weekId = weekIdFor(app.app.now());
    const made = createMeal({ id: 'm1', weekId, dayIndex: 0, name: 'Pizza night' }, { at: app.app.now(), by: 'u1' });
    if (!made.ok) throw new Error('fixture meal is invalid');
    await syncStore.mergeMeal(kitchenId, made.value);
    clock.advance(60_000); // the fixture was planned a minute ago, so this edit is the later write

    renderRoute(ROUTES, { app, location: '/plan' });
    await screen.findByText('This week');
    fireEvent.click(await screen.findByText('Pizza night'));
    await screen.findByText('Edit a meal');
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'What are you making?' }) as HTMLInputElement).value).toBe('Pizza night'));
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you making?' }), { target: { value: 'Pizza night, with salad' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Recipe link (optional)' }), { target: { value: 'https://example.com/pizza' } });
    expect((screen.getByRole('textbox', { name: 'Recipe link (optional)' }) as HTMLInputElement).value).toBe('https://example.com/pizza');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Pizza night, with salad')).toBeTruthy();
    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
    expect(meals[0]?.name.value).toBe('Pizza night, with salad');
    expect(meals[0]?.link.value).toBe('https://example.com/pizza');
  });

  it('plans a meal on a future week after navigating forward, not the current week', async () => {
    const { app, syncStore, kitchenId, weekId } = await openPlan();
    const nextWeekId = weekIdFor(app.app.now() + 7 * 86_400_000);

    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    fireEvent.click((await screen.findAllByText('Plan a meal'))[0]!);
    await screen.findByText('Add a meal');
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you making?' }), { target: { value: 'Lasagna' } });
    fireEvent.click(screen.getByRole('button', { name: /Add to/ }));

    // Saving returns to Plan, which always reopens on the current week (not a regression to guard
    // against - see the task's own risk note); navigating forward again shows the meal just added.
    await screen.findByText('This week');
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(await screen.findByText('Lasagna')).toBeTruthy();

    const nextWeekMeals = await syncStore.getMeals(kitchenId, nextWeekId);
    expect(nextWeekMeals).toHaveLength(1);
    expect(nextWeekMeals[0]?.name.value).toBe('Lasagna');
    expect(nextWeekMeals[0]?.weekId.value).toBe(nextWeekId);
    expect(nextWeekMeals[0]?.weekId.value).not.toBe(weekId);
    const currentWeekMeals = await syncStore.getMeals(kitchenId, weekId);
    expect(currentWeekMeals).toHaveLength(0);
  });

  it('removes a meal already on the plan (RemoveMeal), without touching the grocery list', async () => {
    const syncStore = new InMemorySyncStore();
    const kitchens = new FakeKitchenGateway('u1');
    const { kitchenId } = await kitchens.createKitchen('Our kitchen', 'UTC');
    const app = await appOnFakes({ signedIn: true, syncStore, kitchen: false, kitchens });
    const weekId = weekIdFor(app.app.now());
    const made = createMeal({ id: 'm1', weekId, dayIndex: 0, name: 'Pizza night' }, { at: app.app.now(), by: 'u1' });
    if (!made.ok) throw new Error('fixture meal is invalid');
    await syncStore.mergeMeal(kitchenId, made.value);

    renderRoute(ROUTES, { app, location: '/plan' });
    await screen.findByText('This week');
    fireEvent.click(await screen.findByText('Pizza night'));
    await screen.findByText('Edit a meal');
    fireEvent.click(screen.getByRole('button', { name: 'Remove meal' }));

    await screen.findByText('This week');
    expect(screen.queryByText('Pizza night')).toBeNull();
    const meals = await syncStore.getMeals(kitchenId, weekId);
    expect(meals).toHaveLength(1);
    expect(meals[0]!.deleted).not.toBeNull();
  });
});
