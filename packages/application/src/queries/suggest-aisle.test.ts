import type { SyncStore } from '@grocs/ports';
import { FakeAuth, FakeClock, FakeKitchenGateway, FakeRecipeImporter, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { wrapSyncStore } from '../testing/wrap-sync-store.ts';
import { suggestAisle } from './suggest-aisle.ts';

const KITCHEN = 'k1';

const make = (syncStore: SyncStore = new InMemorySyncStore()): Deps => ({
  syncStore,
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens: new FakeKitchenGateway('u1'),
  recipeImporter: new FakeRecipeImporter(),
});

describe('suggestAisle (R11, R14)', () => {
  it('returns the aisle remembered for the name', async () => {
    const store = new InMemorySyncStore();
    await store.rememberAisle(KITCHEN, encodeURIComponent('oat milk'), { value: 'dairy', stamp: { at: 1, by: 'alex' } });
    const deps = make(store);
    expect(await suggestAisle(deps, KITCHEN, 'Oat Milk')).toBe('dairy');
  });

  it('returns null when nothing has been remembered for the name', async () => {
    const deps = make();
    expect(await suggestAisle(deps, KITCHEN, 'Kale')).toBeNull();
  });

  it("returns null for a name with no key, such as '!!', without calling aisleFor", async () => {
    const store = new InMemorySyncStore();
    let called = false;
    const spying: SyncStore = wrapSyncStore(store, {
      aisleFor: (...a) => {
        called = true;
        return store.aisleFor(...a);
      },
    });
    const deps = make(spying);
    expect(await suggestAisle(deps, KITCHEN, '!!')).toBeNull();
    expect(called).toBe(false);
  });

  it('returns null, not a rejection, when aisleFor fails: the memory only ever helps', async () => {
    const store = new InMemorySyncStore();
    const broken = wrapSyncStore(store, { aisleFor: () => Promise.reject(new Error('aisle lookup is down')) });
    const deps = make(broken);
    expect(await suggestAisle(deps, KITCHEN, 'Kale')).toBeNull();
  });
});
