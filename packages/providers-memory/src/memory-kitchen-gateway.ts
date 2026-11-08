import { acceptInvite, cancelInvite, createKitchen, inviteByEmail, isInvitedTo } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { AcceptOutcome, Clock, CreatedKitchen, IdGenerator, InviteByEmailOutcome, InviteOffer, KitchenDetails, KitchenGateway } from '@grocs/ports';

interface SharedState {
  readonly kitchens: Map<string, Kitchen>;
}

/** Who the gateway calls as: their uid, the name on their sign-in, and its verified email (null for none). */
export interface MemoryCaller {
  readonly uid: string;
  readonly name: string;
  readonly email: string | null;
}

const systemClock: Clock = { now: () => Date.now() };
let idCounter = 0;
const systemIds: IdGenerator = { newId: () => `kitchen-${Date.now()}-${++idCounter}` };

/**
 * Kitchens and email invites held in memory for the demo build (R2, R3, TASK-78). It touches no
 * network and no disk. The demo signs in one fixed member (MemoryAuth.signInAsDemoMember), so it never
 * accepts an invite itself - this still implements the full port and passes the same contract suite
 * the Firebase provider does (decision-1), by giving each caller its own identity the way the demo
 * composition root would for anyone it wires in. The decisions are core's, as on the server.
 */
export class MemoryKitchenGateway implements KitchenGateway {
  readonly #state: SharedState;
  readonly #caller: MemoryCaller;
  readonly #clock: Clock;
  readonly #ids: IdGenerator;

  constructor(caller: MemoryCaller, shared: SharedState = { kitchens: new Map() }, clock: Clock = systemClock, ids: IdGenerator = systemIds) {
    this.#caller = caller;
    this.#state = shared;
    this.#clock = clock;
    this.#ids = ids;
  }

  /** A gateway for a different caller, sharing this one's in-memory kitchens. */
  asCaller(caller: MemoryCaller): MemoryKitchenGateway {
    return new MemoryKitchenGateway(caller, this.#state, this.#clock, this.#ids);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = this.#ids.newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#caller.uid, ownerName: this.#caller.name, createdAt: this.#clock.now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    this.#state.kitchens.set(id, made.value);
    return { kitchenId: id };
  }

  async inviteByEmail(kitchenId: string, email: string): Promise<InviteByEmailOutcome> {
    const kitchen = this.#memberOf(kitchenId);
    const invited = inviteByEmail({ kitchen, callerUid: this.#caller.uid, callerEmail: this.#caller.email, email, now: this.#clock.now() });
    if (!invited.ok) {
      if (invited.error === 'not-a-member') throw notAMember();
      return { kind: 'rejected', reason: invited.error };
    }
    this.#state.kitchens.set(kitchenId, invited.value);
    return { kind: 'invited', email: invited.value.invite!.email };
  }

  async cancelInvite(kitchenId: string): Promise<void> {
    const cancelled = cancelInvite(this.#memberOf(kitchenId), this.#caller.uid);
    if (!cancelled.ok) throw notAMember();
    this.#state.kitchens.set(kitchenId, cancelled.value);
  }

  async invitesForMe(): Promise<readonly InviteOffer[]> {
    return [...this.#state.kitchens.values()]
      .filter((k) => isInvitedTo(k, this.#caller.email) && !k.members.includes(this.#caller.uid))
      .sort((a, b) => a.invite!.createdAt - b.invite!.createdAt)
      .map((k) => ({ kitchenId: k.id, kitchen: k.name, inviter: k.memberNames[k.invite!.invitedBy] ?? '' }));
  }

  async acceptInvite(kitchenId: string): Promise<AcceptOutcome> {
    const { uid, name, email } = this.#caller;
    const accepted = acceptInvite({ target: this.#state.kitchens.get(kitchenId) ?? null, current: this.#mine(), uid, name, email });
    if (!accepted.ok) return { kind: 'rejected', reason: accepted.error };
    this.#state.kitchens.set(kitchenId, accepted.value.joined);
    if (accepted.value.left) this.#state.kitchens.set(accepted.value.left.id, accepted.value.left);
    return { kind: 'joined', kitchenId };
  }

  async findMyKitchen(): Promise<string | null> {
    return this.#mine()?.id ?? null;
  }

  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    const kitchen = this.#state.kitchens.get(kitchenId);
    if (!kitchen || !kitchen.members.includes(this.#caller.uid)) return null;
    return {
      name: kitchen.name,
      members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames[uid] ?? uid })),
      invitedEmail: kitchen.invite?.email ?? null,
    };
  }

  #mine(): Kitchen | null {
    for (const kitchen of this.#state.kitchens.values()) if (kitchen.members.includes(this.#caller.uid)) return kitchen;
    return null;
  }

  #memberOf(kitchenId: string): Kitchen {
    const kitchen = this.#state.kitchens.get(kitchenId);
    if (!kitchen || !kitchen.members.includes(this.#caller.uid)) throw notAMember();
    return kitchen;
  }
}

function notAMember(): Error {
  return new Error('permission-denied: not a member of this kitchen');
}
