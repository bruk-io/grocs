import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddItem' as const, kitchenId: KITCHEN, weekId: WEEK, name });
const tick = (itemId: string, inCart: boolean) => ({ type: 'SetItemState' as const, kitchenId: KITCHEN, weekId: WEEK, itemId, inCart });
const clear = () => ({ type: 'ClearCart' as const, kitchenId: KITCHEN, weekId: WEEK });

async function withItems(names: readonly string[], uid = 'bruk', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  for (const name of names) {
    await client.dispatcher.dispatch(add(name));
  }
  const items = await store.getItems(KITCHEN, WEEK);
  return { client, store, items };
}

describe('ClearCart scenarios (R47)', () => {
  it('clears every in-cart item and leaves to-buy items alone', async () => {
    const { client, store, items } = await withItems(['Eggs', 'Milk', 'Bread']);
    const [eggs, milk, bread] = items;
    client.clock.set(1_800_000_000_000);
    await client.dispatcher.dispatch(tick(eggs?.id ?? '', true));
    client.clock.set(1_800_000_001_000);
    await client.dispatcher.dispatch(tick(milk?.id ?? '', true));

    client.clock.set(1_800_000_002_000);
    const result = await client.dispatcher.dispatch(clear());

    expect(result).toEqual({ ok: true, value: [{ type: 'CartCleared', weekId: WEEK, itemIds: [eggs?.id, milk?.id] }] });

    const after = await store.getItems(KITCHEN, WEEK);
    const byId = new Map(after.map((i) => [i.id, i]));
    expect(byId.get(eggs?.id ?? '')?.state.value).toBe('cleared');
    expect(byId.get(milk?.id ?? '')?.state.value).toBe('cleared');
    expect(byId.get(bread?.id ?? '')?.state.value).toBe('to-buy');
  });

  it('stamps cleared items with the clock and the signed-in member', async () => {
    const store = new InMemorySyncStore();
    const { items } = await withItems(['Eggs'], 'bruk', store);
    const [eggs] = items;
    const sam = await createTestClient({ uid: 'sam', store });
    sam.clock.set(1_800_000_000_000);
    await sam.dispatcher.dispatch(tick(eggs?.id ?? '', true));
    sam.clock.set(1_800_000_001_000);
    await sam.dispatcher.dispatch(clear());
    const [after] = await store.getItems(KITCHEN, WEEK);
    expect(after?.state.stamp).toEqual({ at: 1_800_000_001_000, by: 'sam' });
  });

  it('clearing an empty cart is not an error and returns an empty itemIds list', async () => {
    const { client } = await withItems(['Eggs']);
    const result = await client.dispatcher.dispatch(clear());
    expect(result).toEqual({ ok: true, value: [{ type: 'CartCleared', weekId: WEEK, itemIds: [] }] });
  });

  it('rejects the command when nobody is signed in', async () => {
    await withItems(['Eggs']);
    const out = await createTestClient({ uid: 'bruk', signedIn: false });
    const result = await out.dispatcher.dispatch(clear());
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });
});
