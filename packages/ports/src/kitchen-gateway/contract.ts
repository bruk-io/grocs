import type { TestApi } from '../testing.ts';
import type { KitchenGateway } from './port.ts';

export interface KitchenGatewaySubject {
  /** Creates the kitchen. */
  readonly owner: KitchenGateway;
  /** A different signed-in person, able to use the owner's invite. */
  readonly partner: KitchenGateway;
  /** A third signed-in person, who should never get in. */
  readonly stranger: KitchenGateway;
  dispose?(): Promise<void>;
}

/**
 * Every KitchenGateway passes this suite (R2, R3). Expiry itself is proven once, at the core level
 * (`checkInvite`'s own tests) - advancing a day of server time is not something every provider can
 * do in a test, so a provider that needs to prove it empirically (the Firebase one, against the
 * emulator) does that in its own test, by writing an already-expired invite directly.
 */
export function kitchenGatewayContract(t: TestApi, make: () => Promise<KitchenGatewaySubject>): void {
  const withGateways = (body: (s: KitchenGatewaySubject) => Promise<void>) => async (): Promise<void> => {
    const subject = await make();
    try {
      await body(subject);
    } finally {
      await subject.dispose?.();
    }
  };

  t.describe('KitchenGateway contract', () => {
    t.it(
      'creates a kitchen and an invite code',
      withGateways(async ({ owner }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        t.expect(created.kitchenId.length).toBeGreaterThan(0);
        t.expect(created.inviteCode).toMatch(/^[A-Z]+-\d{4}$/);
      }),
    );

    t.it(
      'lets a second person join with the invite code',
      withGateways(async ({ owner, partner }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        const outcome = await partner.joinKitchen(created.inviteCode);
        t.expect(outcome).toEqual({ kind: 'joined', kitchenId: created.kitchenId });
      }),
    );

    t.it(
      'rejects a third person once the kitchen already has two members',
      withGateways(async ({ owner, partner, stranger }) => {
        // A single invite is consumed by the first join, so a third person reusing it meets
        // "used" rather than a separately-issued "full" rejection. Either way the kitchen stays
        // at two members and a stranger never gets in (R3) - the port groups both under one
        // JoinRejectedReason union for exactly this reason, since the screen shows one inline
        // error either way.
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        await partner.joinKitchen(created.inviteCode);
        const outcome = await stranger.joinKitchen(created.inviteCode);
        t.expect(outcome.kind).toBe('rejected');
        const kitchenId = created.kitchenId;
        const secondJoin = await stranger.joinKitchen(created.inviteCode);
        t.expect(secondJoin).toEqual(outcome); // stable: trying again does not somehow get them in
        t.expect(kitchenId).toBe(created.kitchenId);
      }),
    );

    t.it(
      'rejects the code a second time from the member who already joined',
      withGateways(async ({ owner, partner }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        await partner.joinKitchen(created.inviteCode);
        const outcome = await partner.joinKitchen(created.inviteCode);
        t.expect(outcome.kind).toBe('rejected');
      }),
    );

    t.it(
      'rejects a code that was never issued',
      withGateways(async ({ stranger }) => {
        const outcome = await stranger.joinKitchen('NOTREAL-0000');
        t.expect(outcome).toEqual({ kind: 'rejected', reason: 'not-found' });
      }),
    );

    t.it(
      'rejects the owner re-entering their own still-pending invite code',
      withGateways(async ({ owner }) => {
        // The one case where 'already-member' is actually reachable: nobody has joined yet (the
        // invite is still pending, so checkInvite does not short-circuit on 'used'), but the
        // caller is already in the kitchen's one member - the owner themselves.
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        const outcome = await owner.joinKitchen(created.inviteCode);
        t.expect(outcome).toEqual({ kind: 'rejected', reason: 'already-member' });
      }),
    );

    t.it(
      'rejects a code already used by someone else',
      withGateways(async ({ owner, partner, stranger }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        await partner.joinKitchen(created.inviteCode);
        const outcome = await stranger.joinKitchen(created.inviteCode);
        t.expect(outcome).toEqual({ kind: 'rejected', reason: 'used' });
      }),
    );

    t.it(
      'finds the kitchen a person created',
      withGateways(async ({ owner }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        t.expect(await owner.findMyKitchen()).toBe(created.kitchenId);
      }),
    );

    t.it(
      'finds the kitchen a person joined',
      withGateways(async ({ owner, partner }) => {
        const created = await owner.createKitchen('Our kitchen', 'America/New_York');
        await partner.joinKitchen(created.inviteCode);
        t.expect(await partner.findMyKitchen()).toBe(created.kitchenId);
      }),
    );

    t.it(
      'finds nothing for someone with no kitchen yet',
      withGateways(async ({ stranger }) => {
        t.expect(await stranger.findMyKitchen()).toBeNull();
      }),
    );
  });
}
