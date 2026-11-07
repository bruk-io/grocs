import { kitchenGatewayContract } from '@grocs/ports/testing';
import type { KitchenGateway } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { adminFirestore } from '../../../firebase/emulator-client.ts';
import { KitchenStore } from './kitchen-store.ts';

let counter = 0;
const newId = (): string => `id-${Date.now()}-${++counter}`;

function storeFor(): KitchenStore {
  return new KitchenStore(adminFirestore(), newId);
}

/** Adapts KitchenStore (one instance, any caller) to the per-caller shape the port contract expects. */
function gatewayFor(store: KitchenStore, uid: string, displayName: string = uid): KitchenGateway {
  return {
    async createKitchen(name, timeZone) {
      const created = await store.createKitchen(name, timeZone, uid, displayName);
      return created;
    },
    async joinKitchen(code) {
      return store.joinKitchen(code, uid, displayName);
    },
    async findMyKitchen() {
      return store.findKitchenForUid(uid);
    },
    async getKitchen(kitchenId) {
      return store.getKitchen(kitchenId);
    },
    async inviteForKitchen(kitchenId) {
      return store.inviteForKitchen(kitchenId, uid);
    },
    async previewInvite(code) {
      return store.previewInvite(code);
    },
  };
}

// The same suite the in-memory fake passes (R29), now against the Firestore emulator through the
// Admin SDK - no sign-in needed, since the Admin SDK is not bound by the security rules and a real
// Cloud Function reaches it only after verifying request.auth itself.
kitchenGatewayContract({ describe, it, expect }, async () => {
  const store = storeFor();
  return { owner: gatewayFor(store, 'owner-uid'), partner: gatewayFor(store, 'partner-uid'), stranger: gatewayFor(store, 'stranger-uid') };
});

describe('KitchenStore: stored shape and races', () => {
  it('writes a kitchen document a reader can find at kitchens/{id}', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    const snap = await db.doc(`kitchens/${created.kitchenId}`).get();
    expect(snap.exists).toBe(true);
    expect(snap.data()).toMatchObject({ name: 'Our kitchen', members: ['owner-uid'], timeZone: 'America/New_York' });
  });

  it('writes an invite document a reader can find at inviteCodes/{code}', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    const snap = await db.doc(`inviteCodes/${created.inviteCode}`).get();
    expect(snap.exists).toBe(true);
    expect(snap.data()).toMatchObject({ kitchenId: created.kitchenId, status: 'pending' });
  });

  it('only one of two simultaneous joins on the same code wins (R19)', async () => {
    const store = storeFor();
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    const [a, b] = await Promise.all([store.joinKitchen(created.inviteCode, 'partner-uid', 'Partner'), store.joinKitchen(created.inviteCode, 'stranger-uid', 'Stranger')]);
    const outcomes = [a, b];
    expect(outcomes.filter((o) => o.kind === 'joined')).toHaveLength(1);
    expect(outcomes.filter((o) => o.kind === 'rejected')).toHaveLength(1);
  });

  it('rejects an expired invite', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    await db.doc(`inviteCodes/${created.inviteCode}`).update({ createdAt: 0 }); // 1970: long past the 1-day lifetime
    const outcome = await store.joinKitchen(created.inviteCode, 'partner-uid', 'Partner');
    expect(outcome).toEqual({ kind: 'rejected', reason: 'expired' });
  });

  it('writes a membership document for the owner, atomically with the kitchen (TASK-14)', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    const snap = await db.doc('memberships/owner-uid').get();
    expect(snap.exists).toBe(true);
    expect(snap.data()).toEqual({ kitchenId: created.kitchenId });
  });

  it('writes a membership document for the joiner, atomically with the join', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const created = await store.createKitchen('Our kitchen', 'America/New_York', 'owner-uid', 'Owner');
    await store.joinKitchen(created.inviteCode, 'partner-uid', 'Partner');
    const snap = await db.doc('memberships/partner-uid').get();
    expect(snap.exists).toBe(true);
    expect(snap.data()).toEqual({ kitchenId: created.kitchenId });
  });

  it('issues a fresh invite once the kitchen\'s last one has expired, and a partner can join with it (TASK-56)', async () => {
    const store = storeFor();
    const db = adminFirestore();
    const owner = `owner-${newId()}`;
    const created = await store.createKitchen('Our kitchen', 'UTC', owner, 'Owner');
    await db.doc(`inviteCodes/${created.inviteCode}`).update({ createdAt: 0 }); // long past the 1-day lifetime
    const fresh = await store.inviteForKitchen(created.kitchenId, owner);
    if (fresh.kind !== 'open') throw new Error(`expected an open invite, got ${fresh.kind}`);
    expect(fresh.code).not.toBe(created.inviteCode);
    expect(await store.joinKitchen(fresh.code, `partner-${newId()}`, 'Partner')).toEqual({ kind: 'joined', kitchenId: created.kitchenId });
  });

  it('gives two members asking at once the same invite, not one each', async () => {
    const store = storeFor();
    const db = adminFirestore();
    const owner = `owner-${newId()}`;
    const created = await store.createKitchen('Our kitchen', 'UTC', owner, 'Owner');
    await db.doc(`inviteCodes/${created.inviteCode}`).update({ createdAt: 0 });
    const [a, b] = await Promise.all([store.inviteForKitchen(created.kitchenId, owner), store.inviteForKitchen(created.kitchenId, owner)]);
    expect(a).toEqual(b);
    const pending = await db.collection('inviteCodes').where('kitchenId', '==', created.kitchenId).where('status', '==', 'pending').get();
    expect(pending.docs.filter((d) => (d.data()['createdAt'] as number) > 0)).toHaveLength(1);
  });

  it('refuses the invite to someone who is not a member', async () => {
    const store = storeFor();
    const created = await store.createKitchen('Our kitchen', 'UTC', `owner-${newId()}`, 'Owner');
    await expect(store.inviteForKitchen(created.kitchenId, `stranger-${newId()}`)).rejects.toThrow('not a member');
  });
});
