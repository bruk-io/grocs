import { acceptInvite, cancelInvite, createKitchen, inviteByEmail } from '@grocs/core';
import type { InviteByEmailError, Kitchen } from '@grocs/core';
import type { DocumentReference, Firestore, Transaction } from 'firebase-admin/firestore';

export interface CreatedKitchen {
  readonly kitchenId: string;
}

export interface KitchenDetails {
  readonly name: string;
  readonly members: readonly { readonly uid: string; readonly name: string }[];
  readonly invitedEmail: string | null;
}

/** Thrown when the caller invites to, or cancels on, a kitchen they are not a member of. */
export class NotAMemberError extends Error {
  constructor() {
    super('not a member of this kitchen');
    this.name = 'NotAMemberError';
  }
}

/** Who is calling, from their verified ID token: `email` is null unless the token says it is verified. */
export interface Caller {
  readonly uid: string;
  readonly name: string;
  readonly email: string | null;
}

export type InviteByEmailResult =
  | { readonly kind: 'invited'; readonly email: string }
  | { readonly kind: 'rejected'; readonly reason: Exclude<InviteByEmailError, 'not-a-member'> };

export interface InviteOffer {
  readonly kitchenId: string;
  readonly kitchen: string;
  readonly inviter: string;
}

export type AcceptInviteResult =
  | { readonly kind: 'joined'; readonly kitchenId: string }
  | { readonly kind: 'rejected'; readonly reason: 'not-found' | 'full' | 'already-member' };

interface MembershipDoc {
  readonly kitchenId: string;
}

/**
 * Kitchen and membership documents, read and written through the Admin SDK (R2, R3). Translates; the
 * decisions (whether a name is valid, who may invite or join, whether a kitchen has room)
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

  /** Makes a kitchen with the caller as its one member, and points their membership at it, in one batch. */
  async createKitchen(name: string, timeZone: string, ownerUid: string, ownerName: string): Promise<CreatedKitchen> {
    const id = this.#ids();
    const made = createKitchen({ id, name, timeZone, ownerUid, ownerName, createdAt: this.#now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    const batch = this.#db.batch();
    batch.create(this.#db.doc(`kitchens/${id}`), made.value);
    batch.set(this.#db.doc(`memberships/${ownerUid}`), { kitchenId: id } satisfies MembershipDoc);
    await batch.commit();
    return { kitchenId: id };
  }

  /**
   * Puts an invite for `email` on the kitchen (TASK-78), replacing any earlier one. Whether the caller
   * may, and whether the kitchen has room, are core's calls (inviteByEmail). No account lookup happens,
   * so the answer is the same whether or not the address uses Grocs.
   */
  async inviteByEmail(kitchenId: string, email: string, caller: Caller): Promise<InviteByEmailResult> {
    return this.#db.runTransaction(async (tx) => {
      const ref = this.#db.doc(`kitchens/${kitchenId}`);
      const kitchen = await readKitchen(tx, ref);
      if (!kitchen) throw new NotAMemberError();
      const invited = inviteByEmail({ kitchen, callerUid: caller.uid, callerEmail: caller.email, email, now: this.#now() });
      if (!invited.ok) {
        if (invited.error === 'not-a-member') throw new NotAMemberError();
        return { kind: 'rejected', reason: invited.error };
      }
      tx.set(ref, invited.value);
      return { kind: 'invited', email: invited.value.invite!.email };
    });
  }

  /** Takes the kitchen's invite back. */
  async cancelInvite(kitchenId: string, callerUid: string): Promise<void> {
    await this.#db.runTransaction(async (tx) => {
      const ref = this.#db.doc(`kitchens/${kitchenId}`);
      const kitchen = await readKitchen(tx, ref);
      const cancelled = kitchen ? cancelInvite(kitchen, callerUid) : null;
      if (!cancelled?.ok) throw new NotAMemberError();
      tx.set(ref, cancelled.value);
    });
  }

  /** The kitchens inviting this verified email, oldest invite first; none for a caller with no verified email. */
  async invitesFor(caller: Caller): Promise<readonly InviteOffer[]> {
    if (caller.email === null) return [];
    const snap = await this.#db.collection('kitchens').where('invite.email', '==', caller.email.trim().toLowerCase()).get();
    return snap.docs
      .map((d) => d.data() as Kitchen)
      .filter((k) => !k.members.includes(caller.uid))
      .sort((a, b) => a.invite!.createdAt - b.invite!.createdAt)
      .map((k) => ({ kitchenId: k.id, kitchen: k.name, inviter: k.memberNames[k.invite!.invitedBy] ?? '' }));
  }

  /**
   * Joins the kitchen that invited the caller, leaving the one they were in, atomically (R3, R19,
   * TASK-78). Every read comes before the first write, as a Firestore transaction requires; the
   * decisions are core's (acceptInvite).
   */
  async acceptInvite(kitchenId: string, caller: Caller): Promise<AcceptInviteResult> {
    return this.#db.runTransaction(async (tx) => {
      const targetRef = this.#db.doc(`kitchens/${kitchenId}`);
      const membershipRef = this.#db.doc(`memberships/${caller.uid}`);
      const target = await readKitchen(tx, targetRef);
      const membership = await tx.get(membershipRef);
      const currentId = membership.exists ? (membership.data() as MembershipDoc).kitchenId : null;
      const current = currentId !== null && currentId !== kitchenId ? await readKitchen(tx, this.#db.doc(`kitchens/${currentId}`)) : null;

      const accepted = acceptInvite({ target, current, uid: caller.uid, name: caller.name, email: caller.email });
      if (!accepted.ok) return { kind: 'rejected', reason: accepted.error };

      tx.set(targetRef, accepted.value.joined);
      if (accepted.value.left) tx.set(this.#db.doc(`kitchens/${accepted.value.left.id}`), accepted.value.left);
      tx.set(membershipRef, { kitchenId } satisfies MembershipDoc);
      return { kind: 'joined', kitchenId };
    });
  }

  /** The kitchen a person belongs to, found on any phone after signing in - or null if they have none yet. */
  async findKitchenForUid(uid: string): Promise<string | null> {
    const snap = await this.#db.doc(`memberships/${uid}`).get();
    if (!snap.exists) return null;
    return (snap.data() as MembershipDoc).kitchenId;
  }

  /** A kitchen's name, members and pending invite, for one of its members - or null otherwise. */
  async getKitchen(kitchenId: string, callerUid: string): Promise<KitchenDetails | null> {
    const snap = await this.#db.doc(`kitchens/${kitchenId}`).get();
    if (!snap.exists) return null;
    const kitchen = snap.data() as Kitchen;
    if (!kitchen.members.includes(callerUid)) return null;
    return {
      name: kitchen.name,
      members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames?.[uid] ?? uid })),
      invitedEmail: kitchen.invite?.email ?? null,
    };
  }
}

async function readKitchen(tx: Transaction, ref: DocumentReference): Promise<Kitchen | null> {
  const snap = await tx.get(ref);
  return snap.exists ? (snap.data() as Kitchen) : null;
}
