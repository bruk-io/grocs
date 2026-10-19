import { addMember, checkInvite, createKitchen, inviteCodeFromId } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { Clock, CreatedKitchen, IdGenerator, JoinOutcome, KitchenGateway } from '@grocs/ports';

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

const systemClock: Clock = { now: () => Date.now() };
let idCounter = 0;
const systemIds: IdGenerator = { newId: () => `kitchen-${Date.now()}-${++idCounter}` };

/**
 * Kitchen creation and invite-join held in memory for the demo build (R2, R3). It touches no
 * network and no disk. The demo signs in one fixed member (MemoryAuth.signInAsDemoMember), so it
 * never calls joinKitchen itself - this still implements the full port and passes the same
 * contract suite the Firebase provider does (decision-1), by giving each caller its own uid the
 * way the demo composition root would for anyone it wires in. Clock and IdGenerator are injected,
 * matching FakeKitchenGateway, so a test can drive expiry deterministically instead of waiting a
 * real day; the demo composition root leaves both at their system defaults.
 */
export class MemoryKitchenGateway implements KitchenGateway {
  readonly #state: SharedState;
  readonly #callerUid: string;
  readonly #clock: Clock;
  readonly #ids: IdGenerator;

  constructor(callerUid: string, shared: SharedState = { kitchens: new Map(), invites: new Map() }, clock: Clock = systemClock, ids: IdGenerator = systemIds) {
    this.#callerUid = callerUid;
    this.#state = shared;
    this.#clock = clock;
    this.#ids = ids;
  }

  /** A gateway for a different caller, sharing this one's in-memory kitchens and invites. */
  asCaller(uid: string): MemoryKitchenGateway {
    return new MemoryKitchenGateway(uid, this.#state, this.#clock, this.#ids);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = this.#ids.newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#callerUid, createdAt: this.#clock.now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    this.#state.kitchens.set(made.value.id, made.value);
    const code = inviteCodeFromId(this.#ids.newId());
    this.#state.invites.set(code, { code, kitchenId: made.value.id, createdAt: this.#clock.now(), status: 'pending' });
    return { kitchenId: made.value.id, inviteCode: code };
  }

  async joinKitchen(code: string): Promise<JoinOutcome> {
    const invite = this.#state.invites.get(code);
    if (!invite) return { kind: 'rejected', reason: 'not-found' };
    const checked = checkInvite(invite, this.#clock.now());
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
