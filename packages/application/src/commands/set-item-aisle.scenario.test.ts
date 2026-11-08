import { InMemorySyncStore } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import { wrapSyncStore } from '../testing/wrap-sync-store.ts';

const KITCHEN = 'k1';
const WEEK = '2026-W42';
const add = (name: string) => ({ type: 'AddItem' as const, kitchenId: KITCHEN, weekId: WEEK, name });
const setAisle = (itemId: string, aisle: string) => ({ type: 'SetItemAisle' as const, kitchenId: KITCHEN, weekId: WEEK, itemId, aisle });

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
    client.clock.set(1_800_000_000_000);
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

  describe('both members (R18, R47)', () => {
    it('keeps only the later stamp, whichever of two different aisles arrives first', async () => {
      const store = new InMemorySyncStore();
      const { id } = await withItem('alex', store);
      const alex = await createTestClient({ uid: 'alex', store });
      const sam = await createTestClient({ uid: 'sam', store });

      // The later stamp (sam's) arrives first here...
      sam.clock.set(1_800_000_001_000);
      await sam.dispatcher.dispatch(setAisle(id, 'produce'));
      alex.clock.set(1_800_000_000_000);
      await alex.dispatcher.dispatch(setAisle(id, 'pantry'));
      expect((await store.getItems(KITCHEN, WEEK)).find((i) => i.id === id)?.aisle.value).toBe('produce');
      expect(await store.aisleFor(KITCHEN, encodeURIComponent('garlic'))).toBe('produce');
    });

    it('keeps only the later stamp when the earlier one arrives first instead', async () => {
      const store = new InMemorySyncStore();
      const { id } = await withItem('alex', store);
      const alex = await createTestClient({ uid: 'alex', store });
      const sam = await createTestClient({ uid: 'sam', store });

      // ...and here the earlier stamp (alex's) arrives first, but the later one still wins.
      alex.clock.set(1_800_000_000_000);
      await alex.dispatcher.dispatch(setAisle(id, 'pantry'));
      sam.clock.set(1_800_000_001_000);
      await sam.dispatcher.dispatch(setAisle(id, 'produce'));
      expect((await store.getItems(KITCHEN, WEEK)).find((i) => i.id === id)?.aisle.value).toBe('produce');
      expect(await store.aisleFor(KITCHEN, encodeURIComponent('garlic'))).toBe('produce');
    });

    it('one member offline: a queued older change sent after the newer one does not overwrite it (R16)', async () => {
      const shared = new InMemorySyncStore();
      const { id } = await withItem('alex', shared);
      const queue: Array<() => Promise<void>> = [];
      let online = false;
      const offlineStore = wrapSyncStore(shared, {
        mergeItem: async (kitchenId, item) => {
          if (online) await shared.mergeItem(kitchenId, item);
          else queue.push(() => shared.mergeItem(kitchenId, item));
        },
      });
      const alex = await createTestClient({ uid: 'alex', store: offlineStore });
      const sam = await createTestClient({ uid: 'sam', store: shared });

      alex.clock.set(1_800_000_000_000);
      await alex.dispatcher.dispatch(setAisle(id, 'pantry')); // queued, the older stamp
      sam.clock.set(1_800_000_001_000);
      await sam.dispatcher.dispatch(setAisle(id, 'produce')); // lands immediately, the newer stamp

      online = true;
      for (const send of queue) await send();

      expect((await shared.getItems(KITCHEN, WEEK)).find((i) => i.id === id)?.aisle.value).toBe('produce');
    });
  });
});
