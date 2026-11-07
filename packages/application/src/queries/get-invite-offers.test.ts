import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { getInviteOffers } from './get-invite-offers.ts';

const make = (kitchens: FakeKitchenGateway): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([{ uid: 'sam', email: 'sam@example.com', displayName: 'Sam', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens,
});

describe('getInviteOffers (TASK-78)', () => {
  it('lists the invite to the signed-in person, naming the kitchen and who sent it', async () => {
    const alex = new FakeKitchenGateway({ uid: 'alex', name: 'Alex' });
    const { kitchenId } = await alex.createKitchen('Home', 'UTC');
    await alex.inviteByEmail(kitchenId, 'sam@example.com');
    const deps = make(alex.asMember('sam'));
    await (deps.auth as FakeAuth).signInWithTestAccount('sam@example.com', 'pw');
    expect(await getInviteOffers(deps)).toEqual([{ kitchenId, kitchen: 'Home', inviter: 'Alex' }]);
  });

  it('lists nothing when nobody is signed in', async () => {
    const alex = new FakeKitchenGateway('alex');
    const { kitchenId } = await alex.createKitchen('Home', 'UTC');
    await alex.inviteByEmail(kitchenId, 'sam@example.com');
    expect(await getInviteOffers(make(alex.asMember('sam')))).toEqual([]);
  });
});
