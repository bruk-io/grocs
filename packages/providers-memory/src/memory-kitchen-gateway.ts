import { addMember, checkInvite, createKitchen, inviteCodeFromId, inviteExpiresAt, invitePreview, inviteToReuse, isKitchenFull, MAX_MEMBERS } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { Clock, CreatedKitchen, IdGenerator, InvitePreview, JoinOutcome, KitchenDetails, KitchenGateway, KitchenInvite } from '@grocs/ports';

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
  readonly #displayName: string;

  constructor(
    callerUid: string,
    shared: SharedState = { kitchens: new Map(), invites: new Map() },
    clock: Clock = systemClock,
    ids: IdGenerator = systemIds,
    displayName: string = callerUid,
  ) {
    this.#callerUid = callerUid;
    this.#state = shared;
    this.#clock = clock;
    this.#ids = ids;
    this.#displayName = displayName;
  }

  /** A gateway for a different caller, sharing this one's in-memory kitchens and invites. */
  asCaller(uid: string, displayName: string = uid): MemoryKitchenGateway {
    return new MemoryKitchenGateway(uid, this.#state, this.#clock, this.#ids, displayName);
  }

  async createKitchen(name: string, timeZone: string): Promise<CreatedKitchen> {
    const id = this.#ids.newId();
    const made = createKitchen({ id, name, timeZone, ownerUid: this.#callerUid, ownerName: this.#displayName, createdAt: this.#clock.now() });
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
    const joined = addMember(kitchen, this.#callerUid, this.#displayName);
    if (!joined.ok) return { kind: 'rejected', reason: joined.error };

    this.#state.kitchens.set(kitchen.id, joined.value);
    invite.status = 'used';
    return { kind: 'joined', kitchenId: kitchen.id };
  }

  async findMyKitchen(): Promise<string | null> {
    for (const kitchen of this.#state.kitchens.values()) {
      if (kitchen.members.includes(this.#callerUid)) return kitchen.id;
    }
    return null;
  }

  async getKitchen(kitchenId: string): Promise<KitchenDetails | null> {
    const kitchen = this.#state.kitchens.get(kitchenId);
    if (!kitchen) return null;
    return { name: kitchen.name, members: kitchen.members.map((uid) => ({ uid, name: kitchen.memberNames[uid] ?? uid })) };
  }

  async inviteForKitchen(kitchenId: string): Promise<KitchenInvite> {
    const kitchen = this.#state.kitchens.get(kitchenId);
    if (!kitchen || !kitchen.members.includes(this.#callerUid)) throw new Error('permission-denied: not a member of this kitchen');
    if (isKitchenFull(kitchen)) return { kind: 'full' };
    const now = this.#clock.now();
    const reused = inviteToReuse([...this.#state.invites.values()].filter((i) => i.kitchenId === kitchenId), now);
    if (reused) return { kind: 'open', code: reused.code, expiresAt: inviteExpiresAt(reused.createdAt) };
    const code = inviteCodeFromId(this.#ids.newId());
    this.#state.invites.set(code, { code, kitchenId, createdAt: now, status: 'pending' });
    return { kind: 'open', code, expiresAt: inviteExpiresAt(now) };
  }

  async previewInvite(code: string): Promise<InvitePreview | null> {
    const invite = this.#state.invites.get(code) ?? null;
    const kitchen = invite ? (this.#state.kitchens.get(invite.kitchenId) ?? null) : null;
    return invitePreview(invite, kitchen, this.#clock.now(), MAX_MEMBERS);
  }
}
