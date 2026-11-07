import { addMember, checkInvite, createKitchen, inviteCodeFromId, inviteExpiresAt, invitePreview, inviteToReuse, isKitchenFull, MAX_MEMBERS } from '@grocs/core';
import type { InviteCheckError, InvitePreview, JoinKitchenError, Kitchen } from '@grocs/core';
import type { Firestore } from 'firebase-admin/firestore';

export interface CreatedKitchen {
  readonly kitchenId: string;
  readonly inviteCode: string;
}

export interface KitchenDetails {
  readonly name: string;
  readonly members: readonly { readonly uid: string; readonly name: string }[];
}

export type KitchenInvite = { readonly kind: 'open'; readonly code: string; readonly expiresAt: number } | { readonly kind: 'full' };

/** Thrown when the caller asks for the invite of a kitchen they are not a member of. */
export class NotAMemberError extends Error {
  constructor() {
    super('not a member of this kitchen');
    this.name = 'NotAMemberError';
  }
}

export type JoinKitchenResult =
  | { readonly kind: 'joined'; readonly kitchenId: string }
  | { readonly kind: 'rejected'; readonly reason: InviteCheckError | JoinKitchenError };

interface InviteDoc {
  readonly kitchenId: string;
  readonly createdAt: number;
  readonly status: 'pending' | 'used';
}

interface MembershipDoc {
  readonly kitchenId: string;
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

  /**
   * Makes a kitchen and its one invite in a single batch - a reader never sees one without the
   * other. `create()`, not `set()`, on the invite document: inviteCodeFromId's ~340,000-code space
   * makes a collision with another kitchen's still-pending invite unlikely but not impossible, and
   * `set()` would silently repoint someone else's live invite at this kitchen instead. `create()`
   * fails the batch on an existing document, so a collision is retried with a fresh id instead.
   */
  async createKitchen(name: string, timeZone: string, ownerUid: string, ownerName: string): Promise<CreatedKitchen> {
    const id = this.#ids();
    const made = createKitchen({ id, name, timeZone, ownerUid, ownerName, createdAt: this.#now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);

    const attempts = 5;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const code = inviteCodeFromId(this.#ids());
      const invite: InviteDoc = { kitchenId: id, createdAt: this.#now(), status: 'pending' };
      const batch = this.#db.batch();
      batch.create(this.#db.doc(`kitchens/${id}`), made.value);
      batch.create(this.#db.doc(`inviteCodes/${code}`), invite);
      batch.set(this.#db.doc(`memberships/${ownerUid}`), { kitchenId: id } satisfies MembershipDoc);
      try {
        await batch.commit();
        return { kitchenId: id, inviteCode: code };
      } catch (error) {
        if (attempt === attempts) throw error;
      }
    }
    throw new Error('could not find a free invite code');
  }

  /**
   * Resolves a code and adds the caller as the kitchen's second member, atomically: a second
   * request for the same code, arriving while the first is still in flight, re-reads inside its
   * own transaction attempt and finds the invite already used rather than racing it (R19).
   */
  async joinKitchen(code: string, callerUid: string, callerName: string): Promise<JoinKitchenResult> {
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

      const joined = addMember(kitchen, callerUid, callerName);
      if (!joined.ok) return { kind: 'rejected', reason: joined.error };

      tx.set(kitchenRef, joined.value);
      tx.update(inviteRef, { status: 'used' });
      tx.set(this.#db.doc(`memberships/${callerUid}`), { kitchenId: kitchen.id } satisfies MembershipDoc);
      return { kind: 'joined', kitchenId: kitchen.id };
    });
  }

  /** The kitchen a person belongs to, found on any phone after signing in - or null if they have none yet. */
  async findKitchenForUid(uid: string): Promise<string | null> {
    const snap = await this.#db.doc(`memberships/${uid}`).get();
    if (!snap.exists) return null;
    return (snap.data() as MembershipDoc).kitchenId;
  }

  /**
   * The invite a member shares (TASK-56): the kitchen's newest pending, unexpired invite, or a fresh one
   * when there is none, or 'full' once both members are in. Which invite to reuse, and whether the
   * kitchen has room, are core's calls (inviteToReuse, isKitchenFull). The read and the write share one
   * transaction, so two members asking at once get the same invite rather than one each. A new code
   * that collides with an existing one fails create() and is retried, as in createKitchen.
   */
  async inviteForKitchen(kitchenId: string, callerUid: string): Promise<KitchenInvite> {
    const attempts = 5;
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.#db.runTransaction(async (tx) => {
          const kitchenSnap = await tx.get(this.#db.doc(`kitchens/${kitchenId}`));
          const kitchen = kitchenSnap.exists ? (kitchenSnap.data() as Kitchen) : null;
          if (!kitchen || !kitchen.members.includes(callerUid)) throw new NotAMemberError();
          if (isKitchenFull(kitchen)) return { kind: 'full' } as const;

          const now = this.#now();
          const existing = await tx.get(this.#db.collection('inviteCodes').where('kitchenId', '==', kitchenId));
          const invites = existing.docs.map((d) => ({ code: d.id, ...(d.data() as InviteDoc) }));
          const reused = inviteToReuse(invites, now);
          if (reused) return { kind: 'open', code: reused.code, expiresAt: inviteExpiresAt(reused.createdAt) } as const;

          const code = inviteCodeFromId(this.#ids());
          tx.create(this.#db.doc(`inviteCodes/${code}`), { kitchenId, createdAt: now, status: 'pending' } satisfies InviteDoc);
          return { kind: 'open', code, expiresAt: inviteExpiresAt(now) } as const;
        });
      } catch (error) {
        if (error instanceof NotAMemberError || attempt === attempts) throw error;
      }
    }
  }

  /**
   * Who invited and to which kitchen, for a code that would let the caller in, or null (TASK-70).
   * Read from the invite and kitchen documents, so a joiner never sees names taken from a link; the
   * decision of whether the code is usable is core's (invitePreview).
   */
  async previewInvite(code: string): Promise<InvitePreview | null> {
    const inviteSnap = await this.#db.doc(`inviteCodes/${code}`).get();
    const invite = inviteSnap.exists ? { code, ...(inviteSnap.data() as InviteDoc) } : null;
    const kitchenSnap = invite ? await this.#db.doc(`kitchens/${invite.kitchenId}`).get() : null;
    const kitchen = kitchenSnap?.exists ? (kitchenSnap.data() as Kitchen) : null;
    return invitePreview(invite, kitchen, this.#now(), MAX_MEMBERS);
  }

  /** A kitchen's name and members - or null for an id nobody created. */
  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    const snap = await this.#db.doc(`kitchens/${kitchenId}`).get();
    if (!snap.exists) return null;
    const kitchen = snap.data() as Kitchen;
    return { name: kitchen.name, members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames?.[uid] ?? uid })) };
  }
}
