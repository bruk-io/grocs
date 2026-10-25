import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string, extra: { dayIndex?: number; link?: string | null } = {}) => ({
  type: 'AddMeal' as const,
  kitchenId: KITCHEN,
  weekId: WEEK,
  dayIndex: 0,
  name,
  ...extra,
});

describe('AddMeal scenarios (R47)', () => {
  it('adds the meal to the store and returns a MealAdded event', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('Tacos', { dayIndex: 2, link: 'https://example.com/tacos' }));
    expect(result.ok).toBe(true);
    const meals = await client.store.getMeals(KITCHEN, WEEK);
    expect(meals).toHaveLength(1);
    expect(meals[0]?.name.value).toBe('Tacos');
    expect(meals[0]?.dayIndex.value).toBe(2);
    expect(meals[0]?.link.value).toBe('https://example.com/tacos');
    expect(meals[0]?.addedBy).toBe('alex');
    expect(result.ok && result.value).toEqual([{ type: 'MealAdded', mealId: meals[0]?.id, weekId: WEEK }]);
  });

  it('stamps the meal with the clock and the signed-in member', async () => {
    const client = await createTestClient({ uid: 'sam' });
    client.clock.set(1_790_000_000_000);
    await client.dispatcher.dispatch(add('Eggs'));
    const [meal] = await client.store.getMeals(KITCHEN, WEEK);
    expect(meal?.name.stamp).toEqual({ at: 1_790_000_000_000, by: 'sam' });
  });

  it('rejects an empty name and stores nothing', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('  '));
    expect(result).toEqual({ ok: false, error: { code: 'empty-name', message: expect.any(String) } });
    expect(await client.store.getMeals(KITCHEN, WEEK)).toEqual([]);
  });

  it('rejects a link that is not an http or https URL', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('Tacos', { link: 'not a url' }));
    expect(result).toEqual({ ok: false, error: { code: 'invalid-link', message: expect.any(String) } });
    expect(await client.store.getMeals(KITCHEN, WEEK)).toEqual([]);
  });

  it('rejects a day index outside the week', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('Tacos', { dayIndex: 7 }));
    expect(result).toEqual({ ok: false, error: { code: 'invalid-day', message: expect.any(String) } });
    expect(await client.store.getMeals(KITCHEN, WEEK)).toEqual([]);
  });

  it('rejects the command when nobody is signed in', async () => {
    const client = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await client.dispatcher.dispatch(add('Tacos'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('both adding at once keeps both meals and never merges them silently (R19)', async () => {
    const store = new InMemorySyncStore();
    const alex = await createTestClient({ uid: 'alex', store });
    const sam = await createTestClient({ uid: 'sam', store });
    await Promise.all([alex.dispatcher.dispatch(add('Tacos')), sam.dispatcher.dispatch(add('Pizza'))]);
    const meals = await store.getMeals(KITCHEN, WEEK);
    expect(meals).toHaveLength(2);
    expect(new Set(meals.map((m) => m.id)).size).toBe(2);
  });

  it('never writes what the kitchen typed to a log record (R36)', async () => {
    const client = await createTestClient({ uid: 'alex' });
    await client.dispatcher.dispatch(add('Tacos al pastor', { link: 'https://example.com/tacos' }));
    const text = JSON.stringify(client.logger.records());
    expect(text).not.toContain('Tacos al pastor');
    expect(text).not.toContain('example.com');
  });
});
