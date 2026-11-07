import { kitchenGatewayContract } from '@grocs/ports/testing';
import type { KitchenGateway } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { adminFirestore } from '../../../firebase/emulator-client.ts';
import { KitchenStore } from './kitchen-store.ts';
import type { Caller } from './kitchen-store.ts';

let counter = 0;
const newId = (): string => `id-${Date.now()}-${++counter}`;

function storeFor(): KitchenStore {
  return new KitchenStore(adminFirestore(), newId);
}

/** A new person, with a verified email no other test uses, so invites from other tests never match them. */
function person(label: string): Caller {
  const uid = `${label}-${newId()}`;
  return { uid, name: label, email: `${uid}@example.com` };
}

/** Adapts KitchenStore (one instance, any caller) to the per-caller shape the port contract expects. */
function gatewayFor(store: KitchenStore, caller: Caller): KitchenGateway {
  return {
    createKitchen: (name, timeZone) => store.createKitchen(name, timeZone, caller.uid, caller.name),
    inviteByEmail: (kitchenId, email) => store.inviteByEmail(kitchenId, email, caller),
    cancelInvite: (kitchenId) => store.cancelInvite(kitchenId, caller.uid),
    invitesForMe: () => store.invitesFor(caller),
    acceptInvite: (kitchenId) => store.acceptInvite(kitchenId, caller),
    findMyKitchen: () => store.findKitchenForUid(caller.uid),
    getKitchen: (kitchenId) => store.getKitchen(kitchenId, caller.uid),
  };
}

// The same suite the in-memory fake passes (R29), now against the Firestore emulator through the
// Admin SDK - no sign-in needed, since the Admin SDK is not bound by the security rules and a real
// Cloud Function reaches it only after verifying request.auth itself.
kitchenGatewayContract({ describe, it, expect }, async () => {
  const store = storeFor();
  const [owner, partner, stranger] = [person('owner'), person('partner'), person('stranger')];
  return {
    owner: gatewayFor(store, owner),
    partner: gatewayFor(store, partner),
    stranger: gatewayFor(store, stranger),
    ownerEmail: owner.email!,
    partnerEmail: partner.email!.toUpperCase(),
    strangerEmail: stranger.email!,
  };
});

describe('KitchenStore: stored shape and races', () => {
  it('writes a kitchen document at kitchens/{id} and a membership for its creator, together (TASK-14)', async () => {
    const db = adminFirestore();
    const owner = person('owner');
    const created = await new KitchenStore(db, newId).createKitchen('Our kitchen', 'America/New_York', owner.uid, 'Owner');
    expect((await db.doc(`kitchens/${created.kitchenId}`).get()).data()).toMatchObject({ name: 'Our kitchen', members: [owner.uid], timeZone: 'America/New_York' });
    expect((await db.doc(`memberships/${owner.uid}`).get()).data()).toEqual({ kitchenId: created.kitchenId });
  });

  it('keeps the invite on the kitchen document, where its members can already read it', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const owner = person('owner');
    const created = await store.createKitchen('Our kitchen', 'UTC', owner.uid, 'Owner');
    await store.inviteByEmail(created.kitchenId, 'Partner@Example.com', owner);
    expect((await db.doc(`kitchens/${created.kitchenId}`).get()).data()?.['invite']).toMatchObject({ email: 'partner@example.com', invitedBy: owner.uid });
  });

  it('moves the joiner\'s membership, and takes them off the kitchen they left, in one step', async () => {
    const db = adminFirestore();
    const store = new KitchenStore(db, newId);
    const [owner, partner] = [person('owner'), person('partner')];
    const theirs = await store.createKitchen('Our kitchen', 'UTC', owner.uid, 'Owner');
    const own = await store.createKitchen('My kitchen', 'UTC', partner.uid, 'Partner');
    await store.inviteByEmail(theirs.kitchenId, partner.email!, owner);
    await store.acceptInvite(theirs.kitchenId, partner);
    expect((await db.doc(`memberships/${partner.uid}`).get()).data()).toEqual({ kitchenId: theirs.kitchenId });
    expect((await db.doc(`kitchens/${own.kitchenId}`).get()).data()).toMatchObject({ name: 'My kitchen', members: [] });
    expect((await db.doc(`kitchens/${theirs.kitchenId}`).get()).data()?.['invite']).toBeUndefined();
  });

  it('only one of two simultaneous accepts gets the one open place (R19)', async () => {
    const store = storeFor();
    const owner = person('owner');
    const partner = person('partner');
    const created = await store.createKitchen('Our kitchen', 'UTC', owner.uid, 'Owner');
    await store.inviteByEmail(created.kitchenId, partner.email!, owner);
    // The same person on two phones at once: one joins, the other finds the invite used up.
    const [a, b] = await Promise.all([store.acceptInvite(created.kitchenId, partner), store.acceptInvite(created.kitchenId, partner)]);
    expect([a, b].filter((o) => o.kind === 'joined')).toHaveLength(1);
    expect((await store.getKitchen(created.kitchenId, owner.uid))?.members).toHaveLength(2);
  });

  it('offers nothing to a caller with no verified email', async () => {
    const store = storeFor();
    const owner = person('owner');
    const created = await store.createKitchen('Our kitchen', 'UTC', owner.uid, 'Owner');
    await store.inviteByEmail(created.kitchenId, 'partner@example.com', owner);
    expect(await store.invitesFor({ uid: person('partner').uid, name: 'Partner', email: null })).toEqual([]);
  });

  it('refuses inviting to a kitchen the caller is not in, with NotAMemberError', async () => {
    const store = storeFor();
    const created = await store.createKitchen('Our kitchen', 'UTC', person('owner').uid, 'Owner');
    await expect(store.inviteByEmail(created.kitchenId, 'x@example.com', person('stranger'))).rejects.toThrow('not a member');
  });
});
