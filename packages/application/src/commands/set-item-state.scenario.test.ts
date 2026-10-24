import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddItem' as const, kitchenId: KITCHEN, weekId: WEEK, name });
const tick = (itemId: string, inCart: boolean) => ({ type: 'SetItemState' as const, kitchenId: KITCHEN, weekId: WEEK, itemId, inCart });

async function withItem(uid = 'alex', store = new InMemorySyncStore()) {
  const client = await createTestClient({ uid, store });
  await client.dispatcher.dispatch(add('Eggs'));
  const [item] = await store.getItems(KITCHEN, WEEK);
  return { client, store, id: item?.id ?? '' };
}

describe('SetItemState scenarios (R47)', () => {
  it('ticking moves the item to the cart and returns ItemMovedToCart', async () => {
    const { client, store, id } = await withItem();
    client.clock.set(1_800_000_000_000);
    const result = await client.dispatcher.dispatch(tick(id, true));
    expect(result).toEqual({ ok: true, value: [{ type: 'ItemMovedToCart', itemId: id, weekId: WEEK }] });
    expect((await store.getItems(KITCHEN, WEEK))[0]?.state.value).toBe('in-cart');
  });

  it('unticking moves it back and returns ItemMovedBack', async () => {
    const { client, store, id } = await withItem();
    client.clock.set(1_800_000_000_000);
    await client.dispatcher.dispatch(tick(id, true));
    expect((await store.getItems(KITCHEN, WEEK))[0]?.state.value).toBe('in-cart');
    client.clock.set(1_800_000_001_000);
    const result = await client.dispatcher.dispatch(tick(id, false));
    expect(result).toEqual({ ok: true, value: [{ type: 'ItemMovedBack', itemId: id, weekId: WEEK }] });
    expect((await store.getItems(KITCHEN, WEEK))[0]?.state.value).toBe('to-buy');
  });

  it('restamps only the state with the clock and the signed-in member', async () => {
    const store = new InMemorySyncStore();
    const { id } = await withItem('alex', store);
    const sam = await createTestClient({ uid: 'sam', store });
    sam.clock.set(1_800_000_000_000);
    await sam.dispatcher.dispatch(tick(id, true));
    const [item] = await store.getItems(KITCHEN, WEEK);
    expect(item?.state.stamp).toEqual({ at: 1_800_000_000_000, by: 'sam' });
    expect(item?.name.stamp.by).toBe('alex');
  });

  it('rejects the command when nobody is signed in', async () => {
    const { id } = await withItem();
    const out = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await out.dispatcher.dispatch(tick(id, true));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('rejects an item that is not on the list and stores nothing', async () => {
    const { client, store } = await withItem();
    const result = await client.dispatcher.dispatch(tick('nope', true));
    expect(!result.ok && result.error.code).toBe('item-not-found');
    expect((await store.getItems(KITCHEN, WEEK))[0]?.state.value).toBe('to-buy');
  });
});
