import { acceptInvite, cancelInvite, createKitchen, inviteByEmail, isInvitedTo } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import { FakeClock } from '../clock/fake.ts';
import type { Clock } from '../clock/port.ts';
import { SequentialIds } from '../ids/fake.ts';
import type { IdGenerator } from '../ids/port.ts';
import type { AcceptOutcome, CreatedKitchen, InviteByEmailOutcome, InviteOffer, KitchenDetails, KitchenGateway } from './port.ts';

/** Who the fake is calling as: their uid, the name on their sign-in, and its verified email (or null for none). */
export interface FakeCaller {
  readonly uid: string;
  readonly name?: string;
  readonly email?: string | null;
}

/**
 * Held in memory, standing in for the server functions. Two or more instances can share the same
 * `kitchens` map to stand in for the server both phones talk to, the way two `InMemorySyncStore`s
 * share state for the two-client tests.
 */
export class FakeKitchenGateway implements KitchenGateway {
  readonly #kitchens: Map<string, Kitchen>;
  readonly #clock: Clock;
  readonly #ids: IdGenerator;
  readonly #uid: string;
  readonly #name: string;
  readonly #email: string | null;

  constructor(caller: string | FakeCaller, shared?: { kitchens: Map<string, Kitchen> }, clock: Clock = new FakeClock(), ids: IdGenerator = new SequentialIds('kitchen')) {
    const who = typeof caller === 'string' ? { uid: caller } : caller;
    this.#uid = who.uid;
    this.#name = who.name ?? who.uid;
    this.#email = who.email === undefined ? `${who.uid}@example.com` : who.email;
    this.#kitchens = shared?.kitchens ?? new Map();
    this.#clock = clock;
    this.#ids = ids;
  }

  /** A gateway for someone else, sharing this one's server-side state. Their email defaults to `<uid>@example.com`. */
  asMember(caller: string | FakeCaller): FakeKitchenGateway {
    return new FakeKitchenGateway(caller, { kitchens: this.#kitchens }, this.#clock, this.#ids);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = this.#ids.newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#uid, ownerName: this.#name, createdAt: this.#clock.now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    this.#kitchens.set(id, made.value);
    return { kitchenId: id };
  }

  async inviteByEmail(kitchenId: string, email: string): Promise<InviteByEmailOutcome> {
    const kitchen = this.#memberOf(kitchenId);
    const invited = inviteByEmail({ kitchen, callerUid: this.#uid, callerEmail: this.#email, email, now: this.#clock.now() });
    if (!invited.ok) {
      if (invited.error === 'not-a-member') throw notAMember();
      return { kind: 'rejected', reason: invited.error };
    }
    this.#kitchens.set(kitchenId, invited.value);
    return { kind: 'invited', email: invited.value.invite!.email };
  }

  async cancelInvite(kitchenId: string): Promise<void> {
    const cancelled = cancelInvite(this.#memberOf(kitchenId), this.#uid);
    if (!cancelled.ok) throw notAMember();
    this.#kitchens.set(kitchenId, cancelled.value);
  }

  async invitesForMe(): Promise<readonly InviteOffer[]> {
    return [...this.#kitchens.values()]
      .filter((k) => isInvitedTo(k, this.#email) && !k.members.includes(this.#uid))
      .sort((a, b) => a.invite!.createdAt - b.invite!.createdAt)
      .map((k) => ({ kitchenId: k.id, kitchen: k.name, inviter: k.memberNames[k.invite!.invitedBy] ?? '' }));
  }

  async acceptInvite(kitchenId: string): Promise<AcceptOutcome> {
    const accepted = acceptInvite({ target: this.#kitchens.get(kitchenId) ?? null, current: this.#mine(), uid: this.#uid, name: this.#name, email: this.#email });
    if (!accepted.ok) return { kind: 'rejected', reason: accepted.error };
    this.#kitchens.set(kitchenId, accepted.value.joined);
    if (accepted.value.left) this.#kitchens.set(accepted.value.left.id, accepted.value.left);
    return { kind: 'joined', kitchenId };
  }

  async findMyKitchen(): Promise<string | null> {
    return this.#mine()?.id ?? null;
  }

  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    const kitchen = this.#kitchens.get(kitchenId);
    if (!kitchen || !kitchen.members.includes(this.#uid)) return null;
    return {
      name: kitchen.name,
      members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames[uid] ?? uid })),
      invitedEmail: kitchen.invite?.email ?? null,
    };
  }

  #mine(): Kitchen | null {
    for (const kitchen of this.#kitchens.values()) if (kitchen.members.includes(this.#uid)) return kitchen;
    return null;
  }

  #memberOf(kitchenId: string): Kitchen {
    const kitchen = this.#kitchens.get(kitchenId);
    if (!kitchen || !kitchen.members.includes(this.#uid)) throw notAMember();
    return kitchen;
  }
}

function notAMember(): Error {
  return new Error('permission-denied: not a member of this kitchen');
}
