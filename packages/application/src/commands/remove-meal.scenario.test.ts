import { FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { watchWeekMeals } from '../queries/watch-week-meals.ts';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddMeal' as const, kitchenId: KITCHEN, weekId: WEEK, dayIndex: 0, name });
const remove = (mealId: string) => ({ type: 'RemoveMeal' as const, kitchenId: KITCHEN, weekId: WEEK, mealId });
const edit = (mealId: string, name: string) => ({ type: 'EditMeal' as const, kitchenId: KITCHEN, weekId: WEEK, mealId, name, link: null });

async function withMeal(uid = 'alex', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  await client.dispatcher.dispatch(add('Tacos'));
  const [meal] = await store.getMeals(KITCHEN, WEEK);
  return { client, store, meal };
}

describe('RemoveMeal scenarios (R47)', () => {
  it('tombstones the meal and returns a MealRemoved event', async () => {
    const { client, store, meal } = await withMeal();
    const result = await client.dispatcher.dispatch(remove(meal?.id ?? ''));
    expect(result).toEqual({ ok: true, value: [{ type: 'MealRemoved', mealId: meal?.id, weekId: WEEK }] });
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.deleted).not.toBeNull();
  });

  it('removing a meal never deletes grocery items (R20)', async () => {
    const store = new InMemorySyncStore();
    const client = await createTestClient({ uid: 'alex', store });
    const addEggs = { type: 'AddItem' as const, kitchenId: KITCHEN, weekId: WEEK, name: 'Eggs' };
    await client.dispatcher.dispatch(addEggs);
    await client.dispatcher.dispatch(add('Tacos'));
    const [meal] = await store.getMeals(KITCHEN, WEEK);
    await client.dispatcher.dispatch(remove(meal?.id ?? ''));
    const items = await store.getItems(KITCHEN, WEEK);
    expect(items).toHaveLength(1);
    expect(items[0]?.deleted).toBeNull();
  });

  it('a removed meal stays removed: editing then re-removing a tombstone never brings it back (R20)', async () => {
    const { client, store, meal } = await withMeal();
    const removed = await client.dispatcher.dispatch(remove(meal?.id ?? ''));
    expect(removed.ok).toBe(true);

    client.clock.advance(1000);
    const edited = await client.dispatcher.dispatch(edit(meal?.id ?? '', 'Pizza'));
    expect(edited.ok).toBe(true);
    client.clock.advance(1000);
    await client.dispatcher.dispatch(remove(meal?.id ?? ''));

    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.deleted).not.toBeNull();

    const deps = { syncStore: store, auth: client.auth, clock: client.clock, ids: new SequentialIds(), kitchens: new FakeKitchenGateway('alex') };
    const seen: string[][] = [];
    const stop = watchWeekMeals(deps, KITCHEN, WEEK, (meals) => seen.push(meals.map((m) => m.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen[seen.length - 1]).toEqual([]);
  });

  it('rejects an unknown meal id', async () => {
    const { client } = await withMeal();
    const result = await client.dispatcher.dispatch(remove('nope'));
    expect(!result.ok && result.error.code).toBe('meal-not-found');
  });

  it('rejects the command when nobody is signed in', async () => {
    const { meal } = await withMeal();
    const out = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await out.dispatcher.dispatch(remove(meal?.id ?? ''));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });
});
