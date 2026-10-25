import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import type { Meal } from '@grocs/core';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { watchWeekMeals } from './watch-week-meals.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';

const make = (store = new InMemorySyncStore()): Deps => ({
  syncStore: store,
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens: new FakeKitchenGateway('u1'),
});

const meal = (id: string, createdAt: number, deleted = false): Meal => ({
  id,
  addedBy: 'u1',
  createdAt,
  weekId: { value: WEEK, stamp: { at: createdAt, by: 'u1' } },
  dayIndex: { value: 0, stamp: { at: createdAt, by: 'u1' } },
  name: { value: 'Tacos', stamp: { at: createdAt, by: 'u1' } },
  link: { value: null, stamp: { at: createdAt, by: 'u1' } },
  deleted: deleted ? { at: createdAt, by: 'u1' } : null,
});

describe('watchWeekMeals', () => {
  it('calls onMeals with the week\'s meals, deleted ones removed, in the order they were added', async () => {
    const store = new InMemorySyncStore();
    await store.mergeMeal(KITCHEN, meal('b', 2));
    await store.mergeMeal(KITCHEN, meal('a', 1));
    await store.mergeMeal(KITCHEN, meal('c', 3, true));
    const deps = make(store);

    const seen: string[][] = [];
    const stop = watchWeekMeals(deps, KITCHEN, WEEK, (meals) => seen.push(meals.map((m) => m.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();

    expect(seen[seen.length - 1]).toEqual(['a', 'b']);
  });

  it('calls onMeals soon after subscribing even with no meals yet', async () => {
    const deps = make();
    const seen: string[][] = [];
    const stop = watchWeekMeals(deps, KITCHEN, WEEK, (meals) => seen.push(meals.map((m) => m.id)));
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen).toEqual([[]]);
  });
});
