import type { CreatedKitchen, JoinOutcome, KitchenGateway } from '@grocs/ports';
import type { FunctionsFns } from './sdk.ts';

interface CreateKitchenResponse {
  readonly kitchenId: string;
  readonly inviteCode: string;
}

/**
 * Calls the createKitchen/joinKitchen Cloud Functions (R2, R3). Translates; the decisions (whether
 * an invite is still good, whether the kitchen has room) are the server's, made with core's pure
 * functions inside the transaction that writes (@grocs/providers-server).
 */
export class FirebaseKitchenGateway implements KitchenGateway {
  readonly #fns: FunctionsFns;
  readonly #functionsInstance: unknown;

  constructor(fns: FunctionsFns, functionsInstance: unknown) {
    this.#fns = fns;
    this.#functionsInstance = functionsInstance;
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
}
