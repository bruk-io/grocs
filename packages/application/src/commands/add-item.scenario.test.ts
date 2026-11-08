import { normaliseName } from '@grocs/core';
import type { Item } from '@grocs/core';
import { InMemorySyncStore } from '@grocs/ports/testing';
import type { SyncStore } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import { wrapSyncStore } from '../testing/wrap-sync-store.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string, extra: { amount?: string; mealId?: string; aisle?: string } = {}) => ({
  type: 'AddItem' as const,
  kitchenId: KITCHEN,
  weekId: WEEK,
  name,
  ...extra,
});
const clear = () => ({ type: 'ClearCart' as const, kitchenId: KITCHEN, weekId: WEEK });

describe('AddItem scenarios (R47)', () => {
  it('adds the item to the store and returns an ItemAdded event', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('Oat milk', { amount: '2 cartons' }));
    expect(result.ok).toBe(true);
    const items = await client.store.getItems(KITCHEN, WEEK);
    expect(items).toHaveLength(1);
    expect(items[0]?.name.value).toBe('Oat milk');
    expect(items[0]?.addedBy).toBe('alex');
    expect(items[0]?.badges).toEqual([]);
    expect(result.ok && result.value).toEqual([{ type: 'ItemAdded', itemId: items[0]?.id, weekId: WEEK }]);
  });

  it('carries the mealId through as the item\'s badge', async () => {
    const client = await createTestClient({ uid: 'alex' });
    await client.dispatcher.dispatch(add('Garlic', { mealId: 'meal-1' }));
    const [item] = await client.store.getItems(KITCHEN, WEEK);
    expect(item?.badges).toEqual(['meal-1']);
  });

  it('stamps the item with the clock and the signed-in member', async () => {
    const client = await createTestClient({ uid: 'sam' });
    client.clock.set(1_790_000_000_000);
    await client.dispatcher.dispatch(add('Eggs'));
    const [item] = await client.store.getItems(KITCHEN, WEEK);
    expect(item?.name.stamp).toEqual({ at: 1_790_000_000_000, by: 'sam' });
  });

  it('rejects an empty name and stores nothing', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch(add('  '));
    expect(result).toEqual({ ok: false, error: { code: 'empty-name', message: expect.any(String) } });
    expect(await client.store.getItems(KITCHEN, WEEK)).toEqual([]);
  });

  it('rejects the command when nobody is signed in', async () => {
    const client = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await client.dispatcher.dispatch(add('Eggs'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('turns a failing store into an internal error result, not an exception', async () => {
    const broken: SyncStore = {
      mergeItem: () => Promise.reject(new Error('store is down')),
      getItems: () => Promise.resolve([]),
      watchItems: () => () => undefined,
      mergeMeal: () => Promise.reject(new Error('store is down')),
      getMeals: () => Promise.resolve([]),
      watchMeals: () => () => undefined,
      mergeRecipe: () => Promise.reject(new Error('store is down')),
      getRecipes: () => Promise.resolve([]),
      watchRecipes: () => () => undefined,
      rememberAisle: () => Promise.resolve(),
      aisleFor: () => Promise.resolve(null),
    };
    const client = await createTestClient({ uid: 'alex', store: broken });
    const result = await client.dispatcher.dispatch(add('Eggs'));
    expect(!result.ok && result.error.code).toBe('internal');
    const failed = client.logger.records().find((r) => r.attributes['outcome'] === 'error' && r.attributes['commandType'] === 'AddItem');
    expect(failed?.severity).toBe('error');
  });

  it('answers an unknown command with an error result', async () => {
    const client = await createTestClient({ uid: 'alex' });
    const result = await client.dispatcher.dispatch({ type: 'Nope' });
    expect(!result.ok && result.error.code).toBe('unknown-command');
  });

  describe('both members', () => {
    it('both adding at once keeps both items and never merges them silently (R19)', async () => {
      const store = new InMemorySyncStore();
      const alex = await createTestClient({ uid: 'alex', store });
      const sam = await createTestClient({ uid: 'sam', store });
      await Promise.all([alex.dispatcher.dispatch(add('Oat milk')), sam.dispatcher.dispatch(add('oat  MILK'))]);
      const items = await store.getItems(KITCHEN, WEEK);
      expect(items).toHaveLength(2);
      expect(new Set(items.map((i) => i.id)).size).toBe(2);
      expect(new Set(items.map((i) => normaliseName(i.name.value))).size).toBe(1);
    });

    it('one member offline: changes wait and both items are there after they are sent (R16, R19)', async () => {
      const shared = new InMemorySyncStore();
      const queue: Item[] = [];
      let online = false;
      const offlineStore: SyncStore = {
        mergeItem: async (kitchenId, item) => {
          if (online) await shared.mergeItem(kitchenId, item);
          else queue.push(item);
        },
        getItems: (k, w) => shared.getItems(k, w),
        watchItems: (k, w, cb, onError) => shared.watchItems(k, w, cb, onError),
        mergeMeal: (k, meal) => shared.mergeMeal(k, meal),
        getMeals: (k, w) => shared.getMeals(k, w),
        watchMeals: (k, w, cb, onError) => shared.watchMeals(k, w, cb, onError),
        mergeRecipe: (k, recipe) => shared.mergeRecipe(k, recipe),
        getRecipes: (k) => shared.getRecipes(k),
        watchRecipes: (k, cb, onError) => shared.watchRecipes(k, cb, onError),
        rememberAisle: (k, key, aisle) => shared.rememberAisle(k, key, aisle),
        aisleFor: (k, key) => shared.aisleFor(k, key),
      };
      const alex = await createTestClient({ uid: 'alex', store: offlineStore });
      const sam = await createTestClient({ uid: 'sam', store: shared });

      await alex.dispatcher.dispatch(add('Eggs'));
      await sam.dispatcher.dispatch(add('Eggs'));
      expect(await shared.getItems(KITCHEN, WEEK)).toHaveLength(1);

      online = true;
      for (const item of queue) await shared.mergeItem(KITCHEN, item);
      const after = await shared.getItems(KITCHEN, WEEK);
      expect(after.map((i) => i.addedBy).sort()).toEqual(['alex', 'sam']);
    });

    it('a second client sees the first client\'s item through a watcher', async () => {
      const store = new InMemorySyncStore();
      const alex = await createTestClient({ uid: 'alex', store });
      const seen: string[][] = [];
      const stop = store.watchItems(KITCHEN, WEEK, (items) => seen.push(items.map((i) => i.name.value)));
      await alex.dispatcher.dispatch(add('Eggs'));
      await new Promise((r) => setTimeout(r, 10));
      stop();
      expect(seen[seen.length - 1]).toEqual(['Eggs']);
    });
  });

  describe('logging (R32)', () => {
    it('records type, duration, outcome and event types with one correlation id on every record', async () => {
      const client = await createTestClient({ uid: 'alex' });
      client.clock.set(1_790_000_000_000);
      await client.dispatcher.dispatch(add('Oat milk'));
      const records = client.logger.records();
      const summary = records.find((r) => r.attributes['commandType'] === 'AddItem');
      expect(summary?.attributes).toMatchObject({
        commandType: 'AddItem',
        outcome: 'ok',
        eventTypes: ['ItemAdded'],
        appVersion: 'test',
        platform: 'test',
        kitchenRole: 'member',
      });
      expect(typeof summary?.attributes['durationMs']).toBe('number');
      expect(records.length).toBeGreaterThan(1);
      const ids = new Set(records.map((r) => r.correlationId));
      expect(ids.size).toBe(1);
      expect([...ids][0]).toMatch(/^alex-/);
    });

    it('gives each command its own correlation id', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Eggs'));
      await client.dispatcher.dispatch(add('Milk'));
      const summaries = client.logger.records().filter((r) => r.attributes['commandType']);
      expect(new Set(summaries.map((r) => r.correlationId)).size).toBe(2);
    });

    it('logs each port call with port, method, duration and outcome', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Eggs'));
      const merge = client.logger.records().find((r) => r.attributes['method'] === 'mergeItem');
      expect(merge?.attributes).toMatchObject({ port: 'syncStore', method: 'mergeItem', outcome: 'ok' });
      expect(typeof merge?.attributes['durationMs']).toBe('number');
    });

    it('logs a failing port call with its error', async () => {
      const broken: SyncStore = {
        mergeItem: () => Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' })),
        getItems: () => Promise.resolve([]),
        watchItems: () => () => undefined,
        mergeMeal: () => Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' })),
        getMeals: () => Promise.resolve([]),
        watchMeals: () => () => undefined,
        mergeRecipe: () => Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' })),
        getRecipes: () => Promise.resolve([]),
        watchRecipes: () => () => undefined,
        rememberAisle: () => Promise.resolve(),
        aisleFor: () => Promise.resolve(null),
      };
      const client = await createTestClient({ uid: 'alex', store: broken });
      await client.dispatcher.dispatch(add('Eggs'));
      const failed = client.logger.records().find((r) => r.attributes['method'] === 'mergeItem');
      expect(failed?.severity).toBe('error');
      expect(failed?.attributes['error']).toMatchObject({ name: 'Error', code: 'unavailable' });
    });

    it('never writes what the kitchen typed to a log record (R36)', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Oat milk', { amount: '2 cartons of 1L' }));
      await client.dispatcher.dispatch(add(' '));
      const text = JSON.stringify(client.logger.records());
      expect(text).not.toContain('Oat milk');
      expect(text).not.toContain('2 cartons');
    });
  });

  describe('aisle memory (R11, R14)', () => {
    it('with no aisle, takes the one remembered for the name', async () => {
      const store = new InMemorySyncStore();
      await store.rememberAisle(KITCHEN, encodeURIComponent('oat milk'), { value: 'dairy', stamp: { at: 1, by: 'alex' } });
      const client = await createTestClient({ uid: 'alex', store });
      await client.dispatcher.dispatch(add('Oat milk'));
      const [item] = await store.getItems(KITCHEN, WEEK);
      expect(item?.aisle.value).toBe('dairy');
    });

    it('with no aisle and nothing remembered, takes the default', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Kale'));
      const [item] = await client.store.getItems(KITCHEN, WEEK);
      expect(item?.aisle.value).toBe('other');
    });

    it('with an aisle, stamps the item and remembers it for next time', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Garlic', { aisle: 'produce' }));
      const [item] = await client.store.getItems(KITCHEN, WEEK);
      expect(item?.aisle.value).toBe('produce');
      expect(await client.store.aisleFor(KITCHEN, encodeURIComponent('garlic'))).toBe('produce');
    });

    it('rejects an aisle that is not one of the fixed list, and stores nothing', async () => {
      const client = await createTestClient({ uid: 'alex' });
      const result = await client.dispatcher.dispatch(add('Garlic', { aisle: 'household' }));
      expect(!result.ok && result.error.code).toBe('invalid-aisle');
      expect(await client.store.getItems(KITCHEN, WEEK)).toEqual([]);
    });

    it('a cleared item still informs later suggestions (R14)', async () => {
      const client = await createTestClient({ uid: 'alex' });
      await client.dispatcher.dispatch(add('Milk', { aisle: 'dairy' }));
      const [firstItem] = await client.store.getItems(KITCHEN, WEEK);
      const tick = { type: 'SetItemState' as const, kitchenId: KITCHEN, weekId: WEEK, itemId: firstItem?.id ?? '', inCart: true };
      await client.dispatcher.dispatch(tick);
      await client.dispatcher.dispatch(clear());

      await client.dispatcher.dispatch(add('Milk'));
      const items = await client.store.getItems(KITCHEN, WEEK);
      const second = items.find((i) => i.state.value !== 'cleared');
      expect(second?.aisle.value).toBe('dairy');
    });

    it('a failing aisleFor still adds the item, with the default aisle', async () => {
      const store = new InMemorySyncStore();
      const broken = wrapSyncStore(store, { aisleFor: () => Promise.reject(new Error('aisle lookup is down')) });
      const client = await createTestClient({ uid: 'alex', store: broken });
      const result = await client.dispatcher.dispatch(add('Kale'));
      expect(result.ok).toBe(true);
      const [item] = await client.store.getItems(KITCHEN, WEEK);
      expect(item?.aisle.value).toBe('other');
    });

    it('a failing rememberAisle still lets the add succeed', async () => {
      const store = new InMemorySyncStore();
      const broken = wrapSyncStore(store, { rememberAisle: () => Promise.reject(new Error('remember is down')) });
      const client = await createTestClient({ uid: 'alex', store: broken });
      const result = await client.dispatcher.dispatch(add('Garlic', { aisle: 'produce' }));
      expect(result.ok).toBe(true);
      const [item] = await client.store.getItems(KITCHEN, WEEK);
      expect(item?.aisle.value).toBe('produce');
    });

    it('a stalled rememberAisle does not delay the result (R16)', async () => {
      const store = new InMemorySyncStore();
      let attempted = false;
      const stalled = wrapSyncStore(store, {
        rememberAisle: () =>
          new Promise<void>(() => {
            // Never settles within this test: the command must not wait on it to finish.
            attempted = true;
          }),
      });
      const client = await createTestClient({ uid: 'alex', store: stalled });
      const result = await client.dispatcher.dispatch(add('Garlic', { aisle: 'produce' }));
      expect(result.ok).toBe(true);
      expect(attempted).toBe(true);
    });
  });
});
