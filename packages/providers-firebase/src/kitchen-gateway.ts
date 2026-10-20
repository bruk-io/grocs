import type { CreatedKitchen, JoinOutcome, KitchenDetails, KitchenGateway } from '@grocs/ports';
import type { FirestoreFns, FunctionsFns } from './sdk.ts';

interface CreateKitchenResponse {
  readonly kitchenId: string;
  readonly inviteCode: string;
}

interface KitchenDoc {
  readonly name: string;
  readonly members: readonly string[];
  readonly memberNames?: Readonly<Record<string, string>>;
}

/** True for a Firestore permission-denied error - the shape isMember() produces by erroring on a document that does not exist, same as one that exists but the caller does not belong to (R4). */
function isPermissionDenied(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'permission-denied';
}

/**
 * Calls the createKitchen/joinKitchen Cloud Functions (R2, R3). Translates; the decisions (whether
 * an invite is still good, whether the kitchen has room) are the server's, made with core's pure
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
    const call = this.#fns.httpsCallable<{ name: string; timeZone: string }, CreateKitchenResponse>(this.#functionsInstance, 'createKitchen');
    const { data } = await call({ name, timeZone });
    return { kitchenId: data.kitchenId, inviteCode: data.inviteCode };
  }

  async joinKitchen(code: string): Promise<JoinOutcome> {
    const call = this.#fns.httpsCallable<{ code: string }, JoinOutcome>(this.#functionsInstance, 'joinKitchen');
    const { data } = await call({ code });
    return data;
  }

  async findMyKitchen(): Promise<string | null> {
    const call = this.#fns.httpsCallable<Record<string, never>, string | null>(this.#functionsInstance, 'findMyKitchen');
    const { data } = await call({});
    return data;
  }

  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    try {
      const snap = await this.#fs.getDoc(this.#fs.doc(this.#db, 'kitchens', kitchenId));
      if (!snap.exists()) return null;
      const kitchen = snap.data() as KitchenDoc;
      return { name: kitchen.name, members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames?.[uid] ?? uid })) };
    } catch (error) {
      // isMember() errors evaluating the rule for a kitchenId nobody created (it indexes
      // .data.members on a document that does not exist), which Firestore surfaces to the client
      // as permission-denied rather than revealing non-existence - null matches every other
      // provider's answer for an id nobody created, instead of throwing on this one.
      if (isPermissionDenied(error)) return null;
      throw error;
    }
  }
}
