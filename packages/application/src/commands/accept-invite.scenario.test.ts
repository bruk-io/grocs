import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import type { TestClient } from '../testing/client.ts';

const accept = (kitchenId: string) => ({ type: 'AcceptInvite' as const, kitchenId });

/** Two phones talking to one shared fake server; Alex has made a kitchen and invited Sam's email. */
async function invited(): Promise<{ sam: TestClient; samServer: FakeKitchenGateway; kitchenId: string; server: FakeKitchenGateway }> {
  const clock = new FakeClock();
  const server = new FakeKitchenGateway('alex', undefined, clock);
  const samServer = server.asMember('sam');
  const sam = await createTestClient({ uid: 'sam', kitchens: samServer, clock });
  const { kitchenId } = await server.createKitchen('Our kitchen', 'UTC');
  await server.inviteByEmail(kitchenId, 'sam@example.com');
  return { sam, samServer, kitchenId, server };
}

describe('AcceptInvite scenarios (R3, TASK-78)', () => {
  it('joins the kitchen that invited me', async () => {
    const { sam, samServer, kitchenId } = await invited();
    const result = await sam.dispatcher.dispatch(accept(kitchenId));
    expect(result.ok && result.value).toEqual([{ type: 'KitchenJoined', kitchenId }]);
    expect(await samServer.findMyKitchen()).toBe(kitchenId);
  });

  it('leaves the kitchen I had for the one that invited me', async () => {
    const { sam, samServer, kitchenId } = await invited();
    const own = await samServer.createKitchen('Mine', 'UTC');
    await sam.dispatcher.dispatch(accept(kitchenId));
    expect(await samServer.findMyKitchen()).toBe(kitchenId);
    expect(await samServer.getKitchen(own.kitchenId)).toBeNull();
  });

  it('refuses an invite that was cancelled, as a result rather than an error', async () => {
    const { sam, kitchenId, server } = await invited();
    await server.cancelInvite(kitchenId);
    const result = await sam.dispatcher.dispatch(accept(kitchenId));
    expect(result.ok && result.value).toEqual([{ type: 'KitchenJoinRejected', reason: 'not-found' }]);
  });

  it('needs a signed-in member', async () => {
    const client = await createTestClient({ uid: 'sam', signedIn: false });
    const result = await client.dispatcher.dispatch(accept('k1'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('reaches the gateway only through the instrumented port (R28, R31)', async () => {
    const { sam, kitchenId } = await invited();
    await sam.dispatcher.dispatch(accept(kitchenId));
    const call = sam.logger.records().find((r) => r.attributes['method'] === 'acceptInvite');
    expect(call?.attributes).toMatchObject({ port: 'kitchens', method: 'acceptInvite', outcome: 'ok' });
  });
});
