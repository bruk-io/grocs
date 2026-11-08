import { FakeKitchenGateway } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import type { CancelInvite } from './cancel-invite.ts';

const cancel = (kitchenId: string): CancelInvite => ({ type: 'CancelInvite', kitchenId });

describe('CancelInvite scenarios (TASK-78)', () => {
  it('takes the invite back, so it is no longer offered', async () => {
    const server = new FakeKitchenGateway('alex');
    const alex = await createTestClient({ uid: 'alex', kitchens: server });
    const { kitchenId } = await server.createKitchen('Our kitchen', 'UTC');
    await server.inviteByEmail(kitchenId, 'sam@example.com');
    const result = await alex.dispatcher.dispatch(cancel(kitchenId));
    expect(result.ok && result.value).toEqual([{ type: 'InviteCancelled', kitchenId }]);
    expect(await server.asMember('sam').invitesForMe()).toEqual([]);
  });

  it('is an error for someone who is not a member', async () => {
    const server = new FakeKitchenGateway('alex');
    const { kitchenId } = await server.createKitchen('Our kitchen', 'UTC');
    const carl = await createTestClient({ uid: 'carl', kitchens: server.asMember('carl') });
    const result = await carl.dispatcher.dispatch(cancel(kitchenId));
    expect(result.ok).toBe(false);
  });

  it('needs a signed-in member', async () => {
    const client = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await client.dispatcher.dispatch(cancel('k1'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });
});
