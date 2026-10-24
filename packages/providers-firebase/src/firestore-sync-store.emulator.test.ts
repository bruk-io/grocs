import { createExtraItem } from '@grocs/core';
import { syncStoreContract } from '@grocs/ports/testing';
import { afterAll, describe, expect, it } from 'vitest';
import { createEmulatorClient, createKitchen, ensureSeeded, readRaw, seedAccount, writeRaw } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { FirestoreSyncStore } from './firestore-sync-store.ts';
import { asSdk } from './sdk.ts';
import type { FirestoreFns } from './sdk.ts';

const clients: EmulatorClient[] = [];
afterAll(async () => {
  await Promise.all(clients.map((c) => c.dispose()));
});

async function signedInStore(): Promise<FirestoreSyncStore> {
  await ensureSeeded();
  const client = createEmulatorClient('sync');
  clients.push(client);
  await client.authFns.signInWithEmailAndPassword(client.auth, seedAccount.alex.email, seedAccount.alex.password);
  return new FirestoreSyncStore(asSdk<FirestoreFns>(client.firestoreFns), client.db);
}

// The same suite the in-memory fake passes (R29, R49), now against the Firestore emulator.
syncStoreContract({ describe, it, expect }, async () => ({
  store: await signedInStore(),
  kitchenId: await createKitchen(),
  otherKitchenId: await createKitchen('other'),
}));

describe('Firestore sync store: stored shape (R30)', () => {
  const made = (() => {
    const r = createExtraItem({ id: 'i1', weekId: '2026-W42', name: 'Oat milk' }, { at: 100, by: 'seed-alex' });
    if (!r.ok) throw new Error('setup');
    return r.value;
  })();

  it('writes a document with a schema version, in core\'s shape', async () => {
    const store = await signedInStore();
    const kitchenId = await createKitchen();
    await store.mergeItem(kitchenId, made);
    const raw = (await readRaw(`kitchens/${kitchenId}/items/i1`)) as Record<string, unknown>;
    expect(raw['schemaVersion']).toBe(1);
    expect(raw['name']).toEqual({ v: 'Oat milk', at: 100, by: 'seed-alex' });
  });

  it('refuses to read a document that does not match the schema', async () => {
    const store = await signedInStore();
    const kitchenId = await createKitchen();
    await writeRaw(`kitchens/${kitchenId}/items/bad`, { schemaVersion: 1, id: 'bad', weekId: '2026-W42' });
    await expect(store.getItems(kitchenId, '2026-W42')).rejects.toThrow(/invalid item document bad/);
  });

  it('refuses to read a document written by a newer schema version', async () => {
    const store = await signedInStore();
    const kitchenId = await createKitchen();
    await writeRaw(`kitchens/${kitchenId}/items/future`, { schemaVersion: 2, id: 'future', weekId: '2026-W42' });
    await expect(store.getItems(kitchenId, '2026-W42')).rejects.toThrow(/unsupported|schemaVersion/);
  });

  it('tells the watcher about an invalid document and still delivers the valid ones', async () => {
    const store = await signedInStore();
    const kitchenId = await createKitchen();
    await store.mergeItem(kitchenId, made);
    await writeRaw(`kitchens/${kitchenId}/items/bad`, { schemaVersion: 1, id: 'bad', weekId: '2026-W42' });
    const errors: string[] = [];
    const seen: string[][] = [];
    const stop = store.watchItems(kitchenId, '2026-W42', (items) => seen.push(items.map((i) => i.id)), (e) => errors.push(e.message));
    try {
      await new Promise<void>((resolve, reject) => {
        const started = Date.now();
        const tick = () => (seen.length > 0 ? resolve() : Date.now() - started > 5000 ? reject(new Error('no snapshot')) : setTimeout(tick, 25));
        tick();
      });
    } finally {
      stop();
    }
    expect(seen[0]).toEqual(['i1']);
    expect(errors[0]).toMatch(/invalid item document bad/);
  });
});
