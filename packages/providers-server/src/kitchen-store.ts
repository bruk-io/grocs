import { addMember, checkInvite, createKitchen, inviteCodeFromId } from '@grocs/core';
import type { InviteCheckError, JoinKitchenError, Kitchen } from '@grocs/core';
import type { Firestore } from 'firebase-admin/firestore';

export interface CreatedKitchen {
  readonly kitchenId: string;
  readonly inviteCode: string;
}

export type JoinKitchenResult =
  | { readonly kind: 'joined'; readonly kitchenId: string }
  | { readonly kind: 'rejected'; readonly reason: InviteCheckError | JoinKitchenError };

interface InviteDoc {
  readonly kitchenId: string;
  readonly createdAt: number;
  readonly status: 'pending' | 'used';
}

/**
 * Kitchen and invite documents, read and written through the Admin SDK (R2, R3). Translates; the
 * decisions (whether a name is valid, whether an invite may be used, whether a kitchen has room)
 * are core's, called from inside the same transaction that writes, so a concurrent request sees a
 * consistent read - the same reason FirestoreSyncStore.mergeItem runs its merge in a transaction.
 */
export class KitchenStore {
  readonly #db: Firestore;
  readonly #ids: () => string;
  readonly #now: () => number;

  constructor(db: Firestore, newId: () => string, now: () => number = Date.now) {
    this.#db = db;
    this.#ids = newId;
    this.#now = now;
  }

  /** Makes a kitchen and its one invite in a single batch - a reader never sees one without the other. */
  async createKitchen(name: string, timeZone: string, ownerUid: string): Promise<CreatedKitchen> {
    const id = this.#ids();
    const made = createKitchen({ id, name, timeZone, ownerUid, createdAt: this.#now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);

    const inviteId = this.#ids();
    const code = inviteCodeFromId(inviteId);
    const invite: InviteDoc = { kitchenId: id, createdAt: this.#now(), status: 'pending' };

    const batch = this.#db.batch();
    batch.set(this.#db.doc(`kitchens/${id}`), made.value);
    batch.set(this.#db.doc(`inviteCodes/${code}`), invite);
    await batch.commit();

    return { kitchenId: id, inviteCode: code };
  }

  /**
   * Resolves a code and adds the caller as the kitchen's second member, atomically: a second
   * request for the same code, arriving while the first is still in flight, re-reads inside its
   * own transaction attempt and finds the invite already used rather than racing it (R19).
   */
  async joinKitchen(code: string, callerUid: string): Promise<JoinKitchenResult> {
    return this.#db.runTransaction(async (tx) => {
      const inviteRef = this.#db.doc(`inviteCodes/${code}`);
      const inviteSnap = await tx.get(inviteRef);
      const inviteDoc = inviteSnap.exists ? (inviteSnap.data() as InviteDoc) : null;

      const checked = checkInvite(inviteDoc ? { code, ...inviteDoc } : null, this.#now());
      if (!checked.ok) return { kind: 'rejected', reason: checked.error };

      const kitchenRef = this.#db.doc(`kitchens/${inviteDoc!.kitchenId}`);
      const kitchenSnap = await tx.get(kitchenRef);
      if (!kitchenSnap.exists) return { kind: 'rejected', reason: 'not-found' };
      const kitchen = kitchenSnap.data() as Kitchen;

      const joined = addMember(kitchen, callerUid);
      if (!joined.ok) return { kind: 'rejected', reason: joined.error };

      tx.set(kitchenRef, joined.value);
      tx.update(inviteRef, { status: 'used' });
      return { kind: 'joined', kitchenId: kitchen.id };
    });
  }
}
