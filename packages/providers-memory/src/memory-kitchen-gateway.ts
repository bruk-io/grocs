import { addMember, checkInvite, createKitchen, inviteCodeFromId } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { CreatedKitchen, JoinOutcome, KitchenGateway } from '@grocs/ports';

interface Invite {
  readonly code: string;
  readonly kitchenId: string;
  readonly createdAt: number;
  status: 'pending' | 'used';
}

interface SharedState {
  readonly kitchens: Map<string, Kitchen>;
  readonly invites: Map<string, Invite>;
}

let idCounter = 0;
const newId = (): string => `kitchen-${Date.now()}-${++idCounter}`;

/**
 * Kitchen creation and invite-join held in memory for the demo build (R2, R3). It touches no
 * network and no disk. The demo signs in one fixed member (MemoryAuth.signInAsDemoMember), so it
 * never calls joinKitchen itself - this still implements the full port and passes the same
 * contract suite the Firebase provider does (decision-1), by giving each caller its own uid the
 * way the demo composition root would for anyone it wires in.
 */
export class MemoryKitchenGateway implements KitchenGateway {
  readonly #state: SharedState;
  readonly #callerUid: string;

  constructor(callerUid: string, shared: SharedState = { kitchens: new Map(), invites: new Map() }) {
    this.#callerUid = callerUid;
    this.#state = shared;
  }

  /** A gateway for a different caller, sharing this one's in-memory kitchens and invites. */
  asCaller(uid: string): MemoryKitchenGateway {
    return new MemoryKitchenGateway(uid, this.#state);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#callerUid, createdAt: Date.now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    this.#state.kitchens.set(made.value.id, made.value);
    const code = inviteCodeFromId(newId());
    this.#state.invites.set(code, { code, kitchenId: made.value.id, createdAt: Date.now(), status: 'pending' });
    return { kitchenId: made.value.id, inviteCode: code };
  }

  async joinKitchen(code: string): Promise<JoinOutcome> {
    const invite = this.#state.invites.get(code);
    if (!invite) return { kind: 'rejected', reason: 'not-found' };
    const checked = checkInvite(invite, Date.now());
    if (!checked.ok) return { kind: 'rejected', reason: checked.error };

    const kitchen = this.#state.kitchens.get(invite.kitchenId);
    if (!kitchen) return { kind: 'rejected', reason: 'not-found' };
    const joined = addMember(kitchen, this.#callerUid);
    if (!joined.ok) return { kind: 'rejected', reason: joined.error };

    this.#state.kitchens.set(kitchen.id, joined.value);
    invite.status = 'used';
    return { kind: 'joined', kitchenId: kitchen.id };
  }
}
