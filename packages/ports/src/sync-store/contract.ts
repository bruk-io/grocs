import {
  createExtraItem,
  createMeal,
  isDeleted,
  isMealDeleted,
  mergeItem,
  moveMeal,
  relinkMeal,
  removeMeal,
  renameMeal,
  stamped,
} from '@grocs/core';
import type { DayIndex, Item, Meal } from '@grocs/core';
import { eventually, sleep } from '../testing.ts';
import type { TestApi } from '../testing.ts';
import type { SyncStore } from './port.ts';

export interface SyncStoreSubject {
  readonly store: SyncStore;
  /** A kitchen this store may read and write, empty at the start of the test. */
  readonly kitchenId: string;
  /** A kitchen the test may not use, to check that data does not cross kitchens. */
  readonly otherKitchenId?: string;
  dispose?(): Promise<void>;
}

const WEEK = '2026-W42';

function item(id: string, name: string, at: number, by: string, weekId = WEEK): Item {
  const made = createExtraItem({ id, weekId, name }, { at, by });
  if (!made.ok) throw new Error(`bad fixture ${id}`);
  return made.value;
}

const byId = (items: readonly Item[]): Item[] => [...items].sort((a, b) => (a.id < b.id ? -1 : 1));

function meal(id: string, name: string, dayIndex: DayIndex, at: number, by: string, weekId = WEEK): Meal {
  const made = createMeal({ id, weekId, dayIndex, name }, { at, by });
  if (!made.ok) throw new Error(`bad fixture ${id}`);
  return made.value;
}

const byMealId = (meals: readonly Meal[]): Meal[] => [...meals].sort((a, b) => (a.id < b.id ? -1 : 1));

/**
 * Every SyncStore provider passes this suite (R29, R49): the in-memory fake in unit tests and the
 * Firestore provider against the emulator. `make` gives a store and a kitchen that is empty.
 */
export function syncStoreContract(t: TestApi, make: () => Promise<SyncStoreSubject>): void {
  const withStore = (body: (s: SyncStoreSubject) => Promise<void>) => async (): Promise<void> => {
    const subject = await make();
    try {
      await body(subject);
    } finally {
      await subject.dispose?.();
    }
  };

  t.describe('SyncStore contract', () => {
    t.it('has no items at the start', withStore(async ({ store, kitchenId }) => {
      t.expect(await store.getItems(kitchenId, WEEK)).toEqual([]);
    }));

    t.it('stores a merged item and returns it unchanged', withStore(async ({ store, kitchenId }) => {
      const milk = item('i1', 'Oat milk', 100, 'alex');
      await store.mergeItem(kitchenId, milk);
      t.expect(await store.getItems(kitchenId, WEEK)).toEqual([milk]);
    }));

    t.it('merging the same copy twice changes nothing', withStore(async ({ store, kitchenId }) => {
      const milk = item('i1', 'Oat milk', 100, 'alex');
      await store.mergeItem(kitchenId, milk);
      await store.mergeItem(kitchenId, milk);
      t.expect(await store.getItems(kitchenId, WEEK)).toEqual([milk]);
    }));

    t.it('keeps both changes when two members change different fields (R18)', withStore(async ({ store, kitchenId }) => {
      const base = item('i1', 'Milk', 100, 'alex');
      const renamed: Item = { ...base, name: stamped('Oat milk', { at: 200, by: 'alex' }) };
      const ticked: Item = { ...base, state: stamped('in-cart' as const, { at: 300, by: 'sam' }) };
      await store.mergeItem(kitchenId, ticked);
      await store.mergeItem(kitchenId, renamed);
      const [stored] = await store.getItems(kitchenId, WEEK);
      t.expect(stored?.name.value).toBe('Oat milk');
      t.expect(stored?.state.value).toBe('in-cart');
    }));

    t.it('the later of a tick and an untick wins, whichever arrives first (R17, R18)', withStore(async ({ store, kitchenId }) => {
      const base = item('i1', 'Milk', 100, 'alex');
      const tick: Item = { ...base, state: stamped('in-cart' as const, { at: 200, by: 'alex' }) };
      const untick: Item = { ...base, state: stamped('to-buy' as const, { at: 300, by: 'sam' }) };
      await store.mergeItem(kitchenId, untick);
      await store.mergeItem(kitchenId, tick);
      const [stored] = await store.getItems(kitchenId, WEEK);
      t.expect(stored?.state.value).toBe('to-buy');
      t.expect(stored).toEqual(mergeItem(tick, untick));
    }));

    t.it('a delete is not undone by a late change made before it (R20)', withStore(async ({ store, kitchenId }) => {
      const base = item('i1', 'Milk', 100, 'alex');
      await store.mergeItem(kitchenId, { ...base, deleted: { at: 500, by: 'sam' } });
      await store.mergeItem(kitchenId, { ...base, name: stamped('Oat milk', { at: 200, by: 'alex' }) });
      const [stored] = await store.getItems(kitchenId, WEEK);
      t.expect(stored !== undefined && isDeleted(stored)).toBe(true);
    }));

    t.it('returns only the items of the asked week', withStore(async ({ store, kitchenId }) => {
      await store.mergeItem(kitchenId, item('i1', 'Milk', 100, 'alex'));
      await store.mergeItem(kitchenId, item('i2', 'Eggs', 100, 'alex', '2026-W43'));
      t.expect((await store.getItems(kitchenId, WEEK)).map((i) => i.id)).toEqual(['i1']);
      t.expect((await store.getItems(kitchenId, '2026-W43')).map((i) => i.id)).toEqual(['i2']);
    }));

    t.it('does not mix the items of two kitchens', withStore(async ({ store, kitchenId, otherKitchenId }) => {
      if (!otherKitchenId) return;
      await store.mergeItem(kitchenId, item('i1', 'Milk', 100, 'alex'));
      await store.mergeItem(otherKitchenId, item('i2', 'Eggs', 100, 'alex'));
      t.expect((await store.getItems(kitchenId, WEEK)).map((i) => i.id)).toEqual(['i1']);
      t.expect((await store.getItems(otherKitchenId, WEEK)).map((i) => i.id)).toEqual(['i2']);
    }));

    t.it('tells a watcher the current items, then every change', withStore(async ({ store, kitchenId }) => {
      await store.mergeItem(kitchenId, item('i1', 'Milk', 100, 'alex'));
      const seen: Item[][] = [];
      const stop = store.watchItems(kitchenId, WEEK, (items) => seen.push(byId(items)));
      try {
        await eventually(() => t.expect(seen[seen.length - 1]?.map((i) => i.id)).toEqual(['i1']));
        await store.mergeItem(kitchenId, item('i2', 'Eggs', 200, 'sam'));
        await eventually(() => t.expect(seen[seen.length - 1]?.map((i) => i.id)).toEqual(['i1', 'i2']));
        const ticked: Item = { ...item('i1', 'Milk', 100, 'alex'), state: stamped('in-cart' as const, { at: 300, by: 'sam' }) };
        await store.mergeItem(kitchenId, ticked);
        await eventually(() => t.expect(seen[seen.length - 1]?.find((i) => i.id === 'i1')?.state.value).toBe('in-cart'));
      } finally {
        stop();
      }
    }));

    t.it('stops telling a watcher after it unsubscribes', withStore(async ({ store, kitchenId }) => {
      const seen: number[] = [];
      const stop = store.watchItems(kitchenId, WEEK, (items) => seen.push(items.length));
      await eventually(() => t.expect(seen.length).toBeGreaterThanOrEqual(1));
      stop();
      const count = seen.length;
      await store.mergeItem(kitchenId, item('i1', 'Milk', 100, 'alex'));
      await sleep(300);
      t.expect(seen.length).toBe(count);
    }));
  });
}

/**
 * The meal half of the SyncStore contract (R29, R49), kept separate from syncStoreContract: a
 * provider that has not yet implemented the meal methods can keep running the item suite without
 * failing on methods it does not have. Call this once a provider (or the fake) implements meals.
 */
export function syncStoreMealContract(t: TestApi, make: () => Promise<SyncStoreSubject>): void {
  const withStore = (body: (s: SyncStoreSubject) => Promise<void>) => async (): Promise<void> => {
    const subject = await make();
    try {
      await body(subject);
    } finally {
      await subject.dispose?.();
    }
  };

  t.describe('SyncStore meal contract', () => {
    t.it('stores a merged meal and returns it unchanged', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      t.expect(await store.getMeals(kitchenId, WEEK)).toEqual([tacos]);
    }));

    t.it('merging the same copy of a meal twice changes nothing', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      await store.mergeMeal(kitchenId, tacos);
      t.expect(await store.getMeals(kitchenId, WEEK)).toEqual([tacos]);
    }));

    t.it('does not mix the meals of two kitchens', withStore(async ({ store, kitchenId, otherKitchenId }) => {
      if (!otherKitchenId) return;
      await store.mergeMeal(kitchenId, meal('m1', 'Tacos', 0, 100, 'alex'));
      await store.mergeMeal(otherKitchenId, meal('m2', 'Pasta', 1, 100, 'alex'));
      t.expect((await store.getMeals(kitchenId, WEEK)).map((m) => m.id)).toEqual(['m1']);
      t.expect((await store.getMeals(otherKitchenId, WEEK)).map((m) => m.id)).toEqual(['m2']);
    }));

    t.it('renaming a meal restamps only the name', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      const renamed = renameMeal(tacos, 'Tacos night', { at: 200, by: 'alex' });
      if (!renamed.ok) throw new Error('bad rename');
      await store.mergeMeal(kitchenId, renamed.value);
      const [stored] = await store.getMeals(kitchenId, WEEK);
      t.expect(stored?.name.value).toBe('Tacos night');
    }));

    t.it('relinking a meal restamps only the link', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      const relinked = relinkMeal(tacos, 'https://recipes.example/tacos', { at: 200, by: 'alex' });
      if (!relinked.ok) throw new Error('bad relink');
      await store.mergeMeal(kitchenId, relinked.value);
      const [stored] = await store.getMeals(kitchenId, WEEK);
      t.expect(stored?.link.value).toBe('https://recipes.example/tacos');
    }));

    t.it('moving a meal between weeks moves it out of the old week and into the new one', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      const moved = moveMeal(tacos, '2026-W43', 2, { at: 200, by: 'alex' });
      await store.mergeMeal(kitchenId, moved);
      t.expect(await store.getMeals(kitchenId, WEEK)).toEqual([]);
      const [stored] = await store.getMeals(kitchenId, '2026-W43');
      t.expect(stored?.weekId.value).toBe('2026-W43');
      t.expect(stored?.dayIndex.value).toBe(2);
    }));

    t.it('removing a meal leaves a permanent tombstone (R20)', withStore(async ({ store, kitchenId }) => {
      const tacos = meal('m1', 'Tacos', 0, 100, 'alex');
      await store.mergeMeal(kitchenId, tacos);
      await store.mergeMeal(kitchenId, removeMeal(tacos, { at: 200, by: 'sam' }));
      const [stored] = await store.getMeals(kitchenId, WEEK);
      t.expect(stored !== undefined && isMealDeleted(stored)).toBe(true);
    }));

    t.it('keeps both changes when two members edit different fields of a meal concurrently (R18)', withStore(async ({ store, kitchenId }) => {
      const base = meal('m1', 'Tacos', 0, 100, 'alex');
      const renamed = renameMeal(base, 'Tacos night', { at: 200, by: 'alex' });
      const relinked = relinkMeal(base, 'https://recipes.example/tacos', { at: 300, by: 'sam' });
      if (!renamed.ok || !relinked.ok) throw new Error('bad fixture');
      await store.mergeMeal(kitchenId, relinked.value);
      await store.mergeMeal(kitchenId, renamed.value);
      const [stored] = await store.getMeals(kitchenId, WEEK);
      t.expect(stored?.name.value).toBe('Tacos night');
      t.expect(stored?.link.value).toBe('https://recipes.example/tacos');
    }));

    t.it('tells a watcher the current meals, then every change', withStore(async ({ store, kitchenId }) => {
      await store.mergeMeal(kitchenId, meal('m1', 'Tacos', 0, 100, 'alex'));
      const seen: Meal[][] = [];
      const stop = store.watchMeals(kitchenId, WEEK, (meals) => seen.push(byMealId(meals)));
      try {
        await eventually(() => t.expect(seen[seen.length - 1]?.map((m) => m.id)).toEqual(['m1']));
        await store.mergeMeal(kitchenId, meal('m2', 'Pasta', 1, 200, 'sam'));
        await eventually(() => t.expect(seen[seen.length - 1]?.map((m) => m.id)).toEqual(['m1', 'm2']));
      } finally {
        stop();
      }
    }));
  });
}
