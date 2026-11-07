import type { AcceptOutcome, CreatedKitchen, InviteByEmailOutcome, InviteOffer, KitchenDetails, KitchenGateway } from '@grocs/ports';
import type { FirestoreFns, FunctionsFns } from './sdk.ts';

interface KitchenDoc {
  readonly name: string;
  readonly members: readonly string[];
  readonly memberNames?: Readonly<Record<string, string>>;
  readonly invite?: { readonly email: string };
}

/** True for a Firestore permission-denied error - the shape isMember() produces by erroring on a document that does not exist, same as one that exists but the caller does not belong to (R4). */
function isPermissionDenied(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'permission-denied';
}

/**
 * Calls the kitchen Cloud Functions (R2, R3, TASK-78). Translates; the decisions (who may invite or
 * join, whether the kitchen has room) are the server's, made with core's pure
 * functions inside the transaction that writes (@grocs/providers-server). getKitchen is the one
 * exception: kitchens/{kitchenId} is already readable by its members under firebase/firestore.rules
 * (R4), so it reads the document directly instead of adding another function.
 */
export class FirebaseKitchenGateway implements KitchenGateway {
  readonly #fns: FunctionsFns;
  readonly #functionsInstance: unknown;
  readonly #fs: FirestoreFns;
  readonly #db: unknown;

  constructor(fns: FunctionsFns, functionsInstance: unknown, fs: FirestoreFns, db: unknown) {
    this.#fns = fns;
    this.#functionsInstance = functionsInstance;
    this.#fs = fs;
    this.#db = db;
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    return this.#call<{ name: string; timeZone: string }, CreatedKitchen>('createKitchen', { name, timeZone });
  }

  async inviteByEmail(kitchenId: string, email: string): Promise<InviteByEmailOutcome> {
    return this.#call<{ kitchenId: string; email: string }, InviteByEmailOutcome>('inviteByEmail', { kitchenId, email });
  }

  async cancelInvite(kitchenId: string): Promise<void> {
    await this.#call<{ kitchenId: string }, null>('cancelInvite', { kitchenId });
  }

  async invitesForMe(): Promise<readonly InviteOffer[]> {
    return this.#call<Record<string, never>, readonly InviteOffer[]>('invitesForMe', {});
  }

  async acceptInvite(kitchenId: string): Promise<AcceptOutcome> {
    return this.#call<{ kitchenId: string }, AcceptOutcome>('acceptInvite', { kitchenId });
  }

  async findMyKitchen(): Promise<string | null> {
    return this.#call<Record<string, never>, string | null>('findMyKitchen', {});
  }

  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    try {
      const snap = await this.#fs.getDoc(this.#fs.doc(this.#db, 'kitchens', kitchenId));
      if (!snap.exists()) return null;
      const kitchen = snap.data() as KitchenDoc;
      return { name: kitchen.name, members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames?.[uid] ?? uid })), invitedEmail: kitchen.invite?.email ?? null };
    } catch (error) {
      // The rules deny a kitchen the caller is not in; isMember() also errors for a kitchenId nobody created (it indexes
      // .data.members on a document that does not exist), which Firestore surfaces to the client
      // as permission-denied rather than revealing non-existence - null matches every other
      // provider's answer for an id nobody created, instead of throwing on this one.
      if (isPermissionDenied(error)) return null;
      throw error;
    }
  }

  async #call<In, Out>(name: string, input: In): Promise<Out> {
    const { data } = await this.#fns.httpsCallable<In, Out>(this.#functionsInstance, name)(input);
    return data;
  }
}
