import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddMeal' as const, kitchenId: KITCHEN, weekId: WEEK, dayIndex: 0, name });
const edit = (mealId: string, name: string, link: string | null = null) => ({
  type: 'EditMeal' as const,
  kitchenId: KITCHEN,
  weekId: WEEK,
  mealId,
  name,
  link,
});

async function withMeal(uid = 'alex', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  await client.dispatcher.dispatch(add('Tacos'));
  const [meal] = await store.getMeals(KITCHEN, WEEK);
  return { client, store, meal };
}

describe('EditMeal scenarios (R47)', () => {
  it('renames and relinks the meal together and returns a MealEdited event', async () => {
    const { client, store, meal } = await withMeal();
    client.clock.advance(1000);
    const result = await client.dispatcher.dispatch(edit(meal?.id ?? '', 'Fish tacos', 'https://example.com/fish'));
    expect(result).toEqual({ ok: true, value: [{ type: 'MealEdited', mealId: meal?.id, weekId: WEEK }] });
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.name.value).toBe('Fish tacos');
    expect(after?.link.value).toBe('https://example.com/fish');
  });

  it('clears the link when given null', async () => {
    const { client, store, meal } = await withMeal();
    client.clock.advance(1000);
    await client.dispatcher.dispatch(edit(meal?.id ?? '', 'Tacos', 'https://example.com/tacos'));
    client.clock.advance(1000);
    await client.dispatcher.dispatch(edit(meal?.id ?? '', 'Tacos', null));
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.link.value).toBeNull();
  });

  it('rejects an empty name and leaves the meal unchanged', async () => {
    const { client, store, meal } = await withMeal();
    const result = await client.dispatcher.dispatch(edit(meal?.id ?? '', '  '));
    expect(result).toEqual({ ok: false, error: { code: 'empty-name', message: expect.any(String) } });
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.name.value).toBe('Tacos');
  });

  it('rejects an invalid link and leaves the meal unchanged', async () => {
    const { client, store, meal } = await withMeal();
    const result = await client.dispatcher.dispatch(edit(meal?.id ?? '', 'Tacos', 'not a url'));
    expect(result).toEqual({ ok: false, error: { code: 'invalid-link', message: expect.any(String) } });
    const [after] = await store.getMeals(KITCHEN, WEEK);
    expect(after?.link.value).toBeNull();
  });

  it('rejects an unknown meal id', async () => {
    const { client } = await withMeal();
    const result = await client.dispatcher.dispatch(edit('nope', 'Pizza'));
    expect(!result.ok && result.error.code).toBe('meal-not-found');
  });

  it('rejects the command when nobody is signed in', async () => {
    const { meal } = await withMeal();
    const out = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await out.dispatcher.dispatch(edit(meal?.id ?? '', 'Pizza'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });
});
