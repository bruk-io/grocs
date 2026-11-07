import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import type { TestClient } from '../testing/client.ts';

const invite = (kitchenId: string, email: string) => ({ type: 'InviteByEmail' as const, kitchenId, email });

async function alexWithKitchen(): Promise<{ alex: TestClient; kitchenId: string; server: FakeKitchenGateway }> {
  const clock = new FakeClock();
  const server = new FakeKitchenGateway({ uid: 'alex', email: 'alex@grocs.test' }, undefined, clock);
  const alex = await createTestClient({ uid: 'alex', kitchens: server, clock });
  const { kitchenId } = await server.createKitchen('Our kitchen', 'UTC');
  return { alex, kitchenId, server };
}

describe('InviteByEmail scenarios (R2, TASK-78)', () => {
  it('invites the address, as stored, in a PartnerInvited event', async () => {
    const { alex, kitchenId } = await alexWithKitchen();
    const result = await alex.dispatcher.dispatch(invite(kitchenId, ' Sam@Grocs.test '));
    expect(result.ok && result.value).toEqual([{ type: 'PartnerInvited', kitchenId, email: 'sam@grocs.test' }]);
  });

  it.each([
    ['not an email', 'invalid-email'],
    ['alex@grocs.test', 'own-email'],
  ] as const)('refuses %j as %s, as a result rather than an error', async (email, reason) => {
    const { alex, kitchenId } = await alexWithKitchen();
    const result = await alex.dispatcher.dispatch(invite(kitchenId, email));
    expect(result.ok && result.value).toEqual([{ type: 'InviteRejected', reason }]);
  });

  it('refuses once the kitchen has both its members (R3)', async () => {
    const { alex, kitchenId, server } = await alexWithKitchen();
    await server.inviteByEmail(kitchenId, 'sam@grocs.test');
    await server.asMember({ uid: 'sam', email: 'sam@grocs.test' }).acceptInvite(kitchenId);
    const result = await alex.dispatcher.dispatch(invite(kitchenId, 'jo@grocs.test'));
    expect(result.ok && result.value).toEqual([{ type: 'InviteRejected', reason: 'full' }]);
  });

  it('needs a signed-in member', async () => {
    const client = await createTestClient({ uid: 'alex', signedIn: false });
    const result = await client.dispatcher.dispatch(invite('k1', 'sam@grocs.test'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('reaches the gateway only through the instrumented port (R28, R31)', async () => {
    const { alex, kitchenId } = await alexWithKitchen();
    await alex.dispatcher.dispatch(invite(kitchenId, 'sam@grocs.test'));
    const call = alex.logger.records().find((r) => r.attributes['method'] === 'inviteByEmail');
    expect(call?.attributes).toMatchObject({ port: 'kitchens', method: 'inviteByEmail', outcome: 'ok' });
  });
});
