import type { SyncStore } from '@grocs/ports';
import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddItem' as const, kitchenId: KITCHEN, weekId: WEEK, name });
const setAisle = (itemId: string, aisle: string) => ({ type: 'SetItemAisle' as const, kitchenId: KITCHEN, weekId: WEEK, itemId, aisle });

/** A SyncStore that delegates every method to `store`, except the ones overridden. */
function wrapSyncStore(store: SyncStore, overrides: Partial<SyncStore>): SyncStore {
  return {
    mergeItem: (...a) => store.mergeItem(...a),
    getItems: (...a) => store.getItems(...a),
    watchItems: (...a) => store.watchItems(...a),
    mergeMeal: (...a) => store.mergeMeal(...a),
    getMeals: (...a) => store.getMeals(...a),
    watchMeals: (...a) => store.watchMeals(...a),
    mergeRecipe: (...a) => store.mergeRecipe(...a),
    getRecipes: (...a) => store.getRecipes(...a),
    watchRecipes: (...a) => store.watchRecipes(...a),
    rememberAisle: (...a) => store.rememberAisle(...a),
    aisleFor: (...a) => store.aisleFor(...a),
    ...overrides,
  };
}

async function withItem(uid = 'alex', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  await client.dispatcher.dispatch(add('Garlic'));
  const [item] = await store.getItems(KITCHEN, WEEK);
  return { client, store, id: item?.id ?? '' };
}

describe('SetItemAisle scenarios (R47)', () => {
  it('stamps the item with the chosen aisle and returns ItemAisleChanged', async () => {
    const { client, store, id } = await withItem();
    client.clock.set(1_800_000_000_000);
    const result = await client.dispatcher.dispatch(setAisle(id, 'produce'));
    expect(result).toEqual({ ok: true, value: [{ type: 'ItemAisleChanged', itemId: id, weekId: WEEK }] });
    expect((await store.getItems(KITCHEN, WEEK))[0]?.aisle.value).toBe('produce');
  });

  it('remembers the aisle for the name, for next time', async () => {
    const { client, store, id } = await withItem();
    await client.dispatcher.dispatch(setAisle(id, 'produce'));
    expect(await store.aisleFor(KITCHEN, encodeURIComponent('garlic'))).toBe('produce');
  });

  it('rejects an aisle that is not one of the fixed list, and changes nothing', async () => {
    const { client, store, id } = await withItem();
    const result = await client.dispatcher.dispatch(setAisle(id, 'household'));
    expect(!result.ok && result.error.code).toBe('invalid-aisle');
    expect((await store.getItems(KITCHEN, WEEK))[0]?.aisle.value).toBe('other');
  });

  it('rejects an item that is not on the list and stores nothing', async () => {
    const { client } = await withItem();
    const result = await client.dispatcher.dispatch(setAisle('nope', 'produce'));
    expect(!result.ok && result.error.code).toBe('item-not-found');
  });

  it('rejects the command when nobody is signed in', async () => {
    const { id } = await withItem();
    const out = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await out.dispatcher.dispatch(setAisle(id, 'produce'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('a failing rememberAisle still lets the change succeed', async () => {
    const store = new InMemorySyncStore();
    const { id } = await withItem('alex', store);
    const broken = wrapSyncStore(store, { rememberAisle: () => Promise.reject(new Error('remember is down')) });
    const client = await createTestClient({ uid: 'alex', store: broken });
    const result = await client.dispatcher.dispatch(setAisle(id, 'produce'));
    expect(result.ok).toBe(true);
    expect((await store.getItems(KITCHEN, WEEK))[0]?.aisle.value).toBe('produce');
  });

  it('a stalled rememberAisle does not delay the result (R16)', async () => {
    const store = new InMemorySyncStore();
    const { id } = await withItem('alex', store);
    let attempted = false;
    const stalled = wrapSyncStore(store, {
      rememberAisle: () =>
        new Promise<void>(() => {
          attempted = true;
        }),
    });
    const client = await createTestClient({ uid: 'alex', store: stalled });
    const result = await client.dispatcher.dispatch(setAisle(id, 'produce'));
    expect(result.ok).toBe(true);
    expect(attempted).toBe(true);
  });
});
