import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const OTHER_WEEK = '2026-W43';
const add = (name: string) => ({ type: 'AddMeal' as const, kitchenId: KITCHEN, weekId: WEEK, dayIndex: 0, name });
const move = (mealId: string, toWeekId: string, toDayIndex: number) => ({
  type: 'MoveMeal' as const,
  kitchenId: KITCHEN,
  weekId: WEEK,
  mealId,
  toWeekId,
  toDayIndex,
});

async function withMeal(uid = 'alex', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  await client.dispatcher.dispatch(add('Tacos'));
  const [meal] = await store.getMeals(KITCHEN, WEEK);
  return { client, store, meal };
}

describe('MoveMeal scenarios (R47)', () => {
  it('moves the meal to another week and day and returns a MealMoved event', async () => {
    const { client, store, meal } = await withMeal();
    const result = await client.dispatcher.dispatch(move(meal?.id ?? '', OTHER_WEEK, 3));
    expect(result).toEqual({
      ok: true,
      value: [{ type: 'MealMoved', mealId: meal?.id, fromWeekId: WEEK, toWeekId: OTHER_WEEK }],
    });
    const [moved] = await store.getMeals(KITCHEN, OTHER_WEEK);
    expect(moved?.weekId.value).toBe(OTHER_WEEK);
    expect(moved?.dayIndex.value).toBe(3);
  });

  it('moves the meal to another day within the same week', async () => {
    const { client, store, meal } = await withMeal();
    await client.dispatcher.dispatch(move(meal?.id ?? '', WEEK, 5));
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.dayIndex.value).toBe(5);
  });

  it('rejects a day index outside the week and leaves the meal unchanged', async () => {
    const { client, store, meal } = await withMeal();
    const result = await client.dispatcher.dispatch(move(meal?.id ?? '', OTHER_WEEK, 7));
    expect(result).toEqual({ ok: false, error: { code: 'invalid-day', message: expect.any(String) } });
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.weekId.value).toBe(WEEK);
  });

  it('rejects an unknown meal id', async () => {
    const { client } = await withMeal();
    const result = await client.dispatcher.dispatch(move('nope', OTHER_WEEK, 0));
    expect(!result.ok && result.error.code).toBe('meal-not-found');
  });

  it('rejects the command when nobody is signed in', async () => {
    const { meal } = await withMeal();
    const out = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await out.dispatcher.dispatch(move(meal?.id ?? '', OTHER_WEEK, 0));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });
});
