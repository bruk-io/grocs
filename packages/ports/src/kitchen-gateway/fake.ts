import { addMember, checkInvite, createKitchen, inviteCodeFromId } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import { FakeClock } from '../clock/fake.ts';
import type { Clock } from '../clock/port.ts';
import { SequentialIds } from '../ids/fake.ts';
import type { IdGenerator } from '../ids/port.ts';
import type { CreatedKitchen, JoinOutcome, KitchenGateway } from './port.ts';

interface Invite {
  readonly code: string;
  readonly kitchenId: string;
  readonly createdAt: number;
  status: 'pending' | 'used';
}

/**
 * Held in memory, standing in for the server functions. Two or more instances can share the same
 * `kitchens`/`invites` maps to stand in for the server both phones talk to, the way two
 * `InMemorySyncStore`s share state for the two-client tests.
 */
export class FakeKitchenGateway implements KitchenGateway {
  readonly #kitchens: Map<string, Kitchen>;
  readonly #invites: Map<string, Invite>;
  readonly #clock: Clock;
  readonly #ids: IdGenerator;
  readonly #callerUid: string;

  constructor(
    callerUid: string,
    shared?: { kitchens: Map<string, Kitchen>; invites: Map<string, Invite> },
    clock: Clock = new FakeClock(),
    ids: IdGenerator = new SequentialIds('kitchen'),
  ) {
    this.#callerUid = callerUid;
    this.#kitchens = shared?.kitchens ?? new Map();
    this.#invites = shared?.invites ?? new Map();
    this.#clock = clock;
    this.#ids = ids;
  }

  /** A second gateway, for the kitchen's other member, sharing this one's server-side state. */
  asMember(uid: string): FakeKitchenGateway {
    return new FakeKitchenGateway(uid, { kitchens: this.#kitchens, invites: this.#invites }, this.#clock, this.#ids);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = this.#ids.newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#callerUid, createdAt: this.#clock.now() });
    if (!made.ok) throw new Error(`invalid kitchen name: ${made.error}`);
    this.#kitchens.set(made.value.id, made.value);
    const inviteId = this.#ids.newId();
    const code = inviteCodeFromId(inviteId);
    this.#invites.set(code, { code, kitchenId: made.value.id, createdAt: this.#clock.now(), status: 'pending' });
    return { kitchenId: made.value.id, inviteCode: code };
  }

  async joinKitchen(code: string): Promise<JoinOutcome> {
    const invite = this.#invites.get(code);
    if (!invite) return { kind: 'rejected', reason: 'not-found' };
    const checked = checkInvite(invite, this.#clock.now());
    if (!checked.ok) return { kind: 'rejected', reason: checked.error };

    const kitchen = this.#kitchens.get(invite.kitchenId);
    if (!kitchen) return { kind: 'rejected', reason: 'not-found' };
    const joined = addMember(kitchen, this.#callerUid);
    if (!joined.ok) return { kind: 'rejected', reason: joined.error };

    this.#kitchens.set(kitchen.id, joined.value);
    invite.status = 'used';
    return { kind: 'joined', kitchenId: kitchen.id };
  }
}
