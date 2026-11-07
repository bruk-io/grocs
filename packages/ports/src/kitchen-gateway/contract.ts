import type { TestApi } from '../testing.ts';
import type { KitchenGateway } from './port.ts';

export interface KitchenGatewaySubject {
  /** Creates the kitchen. */
  readonly owner: KitchenGateway;
  /** A different signed-in person, whom the owner invites. */
  readonly partner: KitchenGateway;
  /** A third signed-in person, who should never get in. */
  readonly stranger: KitchenGateway;
  /** The verified email on the partner's sign-in, as they signed in with it (any case). */
  readonly partnerEmail: string;
  /** The verified email on the stranger's sign-in. */
  readonly strangerEmail: string;
  /** The verified email on the owner's sign-in. */
  readonly ownerEmail: string;
  dispose?(): Promise<void>;
}

const rejects = (p: Promise<unknown>): Promise<boolean> =>
  p.then(
    () => false,
    () => true,
  );

/** Every KitchenGateway passes this suite (R2, R3, R4, TASK-78). */
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
      'creates a kitchen the creator then finds as theirs',
      withGateways(async ({ owner }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        t.expect(kitchenId.length).toBeGreaterThan(0);
        t.expect(await owner.findMyKitchen()).toBe(kitchenId);
      }),
    );

    t.it(
      'finds nothing for someone with no kitchen yet',
      withGateways(async ({ stranger }) => {
        t.expect(await stranger.findMyKitchen()).toBeNull();
      }),
    );

    t.it(
      'invites by email, stored in one form, and shows the member who is invited',
      withGateways(async ({ owner, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        const outcome = await owner.inviteByEmail(kitchenId, `  ${partnerEmail.toUpperCase()} `);
        t.expect(outcome).toEqual({ kind: 'invited', email: partnerEmail.toLowerCase() });
        t.expect((await owner.getKitchen(kitchenId))?.invitedEmail).toBe(partnerEmail.toLowerCase());
      }),
    );

    t.it(
      'offers the invite to the person with that email, naming the kitchen (R3)',
      withGateways(async ({ owner, partner, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        const offers = await partner.invitesForMe();
        t.expect(offers.length).toBe(1);
        t.expect(offers[0]?.kitchenId).toBe(kitchenId);
        t.expect(offers[0]?.kitchen).toBe('Our kitchen');
        t.expect(typeof offers[0]?.inviter).toBe('string');
      }),
    );

    t.it(
      'lets the invited person join; the invite is then used up',
      withGateways(async ({ owner, partner, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        t.expect(await partner.acceptInvite(kitchenId)).toEqual({ kind: 'joined', kitchenId });
        t.expect(await partner.findMyKitchen()).toBe(kitchenId);
        t.expect(await partner.invitesForMe()).toEqual([]);
        const details = await owner.getKitchen(kitchenId);
        t.expect(details?.members.length).toBe(2);
        t.expect(details?.invitedEmail).toBeNull();
      }),
    );

    t.it(
      'lets someone with a kitchen of their own join, and takes them out of the old one (TASK-78)',
      withGateways(async ({ owner, partner, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        const own = await partner.createKitchen('My kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        t.expect(await partner.acceptInvite(kitchenId)).toEqual({ kind: 'joined', kitchenId });
        t.expect(await partner.findMyKitchen()).toBe(kitchenId);
        t.expect(await partner.getKitchen(own.kitchenId)).toBeNull();
      }),
    );

    t.it(
      'offers nothing to, and refuses, a person whose email was not invited (R4)',
      withGateways(async ({ owner, stranger, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        t.expect(await stranger.invitesForMe()).toEqual([]);
        t.expect(await stranger.acceptInvite(kitchenId)).toEqual({ kind: 'rejected', reason: 'not-found' });
        t.expect(await stranger.getKitchen(kitchenId)).toBeNull();
      }),
    );

    t.it(
      'answers the same for an address that has signed in and one that never has (TASK-78)',
      withGateways(async ({ owner, strangerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        const known = await owner.inviteByEmail(kitchenId, strangerEmail);
        const unknown = await owner.inviteByEmail(kitchenId, 'nobody-has-this@example.com');
        t.expect(known.kind).toBe('invited');
        t.expect(unknown.kind).toBe('invited');
      }),
    );

    t.it(
      'a newer invite replaces the one before, which then stops working',
      withGateways(async ({ owner, partner, stranger, partnerEmail, strangerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, strangerEmail);
        await owner.inviteByEmail(kitchenId, partnerEmail);
        t.expect(await stranger.acceptInvite(kitchenId)).toEqual({ kind: 'rejected', reason: 'not-found' });
        t.expect(await partner.acceptInvite(kitchenId)).toEqual({ kind: 'joined', kitchenId });
      }),
    );

    t.it(
      'a cancelled invite is no longer offered and cannot be used',
      withGateways(async ({ owner, partner, partnerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        await owner.cancelInvite(kitchenId);
        t.expect(await partner.invitesForMe()).toEqual([]);
        t.expect(await partner.acceptInvite(kitchenId)).toEqual({ kind: 'rejected', reason: 'not-found' });
        t.expect((await owner.getKitchen(kitchenId))?.invitedEmail).toBeNull();
      }),
    );

    t.it(
      'refuses an invite once both members are in, so a third person never gets in (R3)',
      withGateways(async ({ owner, partner, partnerEmail, strangerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        await owner.inviteByEmail(kitchenId, partnerEmail);
        await partner.acceptInvite(kitchenId);
        t.expect(await owner.inviteByEmail(kitchenId, strangerEmail)).toEqual({ kind: 'rejected', reason: 'full' });
        t.expect(await partner.inviteByEmail(kitchenId, strangerEmail)).toEqual({ kind: 'rejected', reason: 'full' });
      }),
    );

    t.it(
      'refuses an address that is not an email, and the inviter\'s own',
      withGateways(async ({ owner, ownerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        t.expect(await owner.inviteByEmail(kitchenId, 'not an email')).toEqual({ kind: 'rejected', reason: 'invalid-email' });
        t.expect(await owner.inviteByEmail(kitchenId, ownerEmail)).toEqual({ kind: 'rejected', reason: 'own-email' });
      }),
    );

    t.it(
      'refuses inviting to, or cancelling on, a kitchen the caller is not a member of',
      withGateways(async ({ owner, stranger, strangerEmail }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        t.expect(await rejects(stranger.inviteByEmail(kitchenId, strangerEmail))).toBe(true);
        t.expect(await rejects(stranger.cancelInvite(kitchenId))).toBe(true);
      }),
    );

    t.it(
      'refuses joining a kitchen that does not exist',
      withGateways(async ({ stranger }) => {
        t.expect(await stranger.acceptInvite('no-such-kitchen')).toEqual({ kind: 'rejected', reason: 'not-found' });
      }),
    );

    // Structural only: a provider's real display name differs by subject, so the shared contract
    // checks shape and leaves exact content to each provider's own test.
    t.it(
      'getKitchen returns the name, the one member and no invite after a solo create',
      withGateways(async ({ owner }) => {
        const { kitchenId } = await owner.createKitchen('Our kitchen', 'America/New_York');
        const details = await owner.getKitchen(kitchenId);
        t.expect(details?.name).toBe('Our kitchen');
        t.expect(details?.members.length).toBe(1);
        t.expect(details?.members[0]?.uid.length).toBeGreaterThan(0);
        t.expect(typeof details?.members[0]?.name).toBe('string');
        t.expect(details?.invitedEmail).toBeNull();
      }),
    );

    t.it(
      'getKitchen returns null for an id nobody created',
      withGateways(async ({ stranger }) => {
        t.expect(await stranger.getKitchen('no-such-kitchen')).toBeNull();
      }),
    );
  });
}
