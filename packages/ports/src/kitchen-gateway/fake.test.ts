import { describe, expect, it } from 'vitest';
import { kitchenGatewayContract } from './contract.ts';
import { FakeKitchenGateway } from './fake.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new FakeKitchenGateway({ uid: 'alex', email: 'alex@example.com' });
  return {
    owner,
    partner: owner.asMember({ uid: 'sam', email: 'Sam@Example.com' }),
    stranger: owner.asMember({ uid: 'carl', email: 'carl@example.com' }),
    ownerEmail: 'alex@example.com',
    partnerEmail: 'Sam@Example.com',
    strangerEmail: 'carl@example.com',
  };
});

describe('FakeKitchenGateway with no verified email (TASK-78)', () => {
  it('is offered nothing, even for an invite to the address it would have had', async () => {
    const owner = new FakeKitchenGateway('alex');
    const { kitchenId } = await owner.createKitchen('Our kitchen', 'UTC');
    await owner.inviteByEmail(kitchenId, 'sam@example.com');
    const noEmail = owner.asMember({ uid: 'sam', email: null });
    expect(await noEmail.invitesForMe()).toEqual([]);
    expect(await noEmail.acceptInvite(kitchenId)).toEqual({ kind: 'rejected', reason: 'not-found' });
  });
});
