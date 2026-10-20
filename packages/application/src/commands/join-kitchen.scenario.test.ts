import { FakeClock, FakeKitchenGateway } from '@grocs/ports/testing';
import type { JoinRejectedReason, KitchenGateway } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { createTestClient } from '../testing/client.ts';
import type { TestClient } from '../testing/client.ts';

const DAY = 24 * 60 * 60 * 1000;
const create = (name = 'Our kitchen') => ({ type: 'CreateKitchen' as const, name, timeZone: 'America/Toronto' });
const join = (code: string) => ({ type: 'JoinKitchen' as const, code });

/** Two phones talking to one shared fake server, on one clock. */
async function twoPhones(): Promise<{ bruk: TestClient; sam: TestClient; clock: FakeClock }> {
  const clock = new FakeClock();
  const server = new FakeKitchenGateway('bruk', undefined, clock);
  const bruk = await createTestClient({ uid: 'bruk', kitchens: server, clock });
  const sam = await createTestClient({ uid: 'sam', kitchens: server.asMember('sam'), clock });
  return { bruk, sam, clock };
}

async function created(client: TestClient): Promise<{ kitchenId: string; inviteCode: string }> {
  const result = await client.dispatcher.dispatch(create());
  const event = result.ok ? (result.value[0] as unknown as { kitchenId: string; inviteCode: string }) : undefined;
  if (!event) throw new Error('create failed');
  return { kitchenId: event.kitchenId, inviteCode: event.inviteCode };
}

const rejected = (reason: JoinRejectedReason) => [{ type: 'KitchenJoinRejected', reason }];

describe('JoinKitchen scenarios (R3)', () => {
  it('joins with the invite code and returns the kitchen id', async () => {
    const { bruk, sam } = await twoPhones();
    const { kitchenId, inviteCode } = await created(bruk);
    const result = await sam.dispatcher.dispatch(join(inviteCode));
    expect(result.ok && result.value).toEqual([{ type: 'KitchenJoined', kitchenId }]);
  });

  it('needs a signed-in member', async () => {
    const client = await createTestClient({ uid: 'sam', signedIn: false });
    const result = await client.dispatcher.dispatch(join('MOREL-0001'));
    expect(!result.ok && result.error.code).toBe('not-signed-in');
  });

  it('reaches the gateway only through the instrumented port (R28, R31)', async () => {
    const { bruk, sam } = await twoPhones();
    const { inviteCode } = await created(bruk);
    await sam.dispatcher.dispatch(join(inviteCode));
    const call = sam.logger.records().find((r) => r.attributes['method'] === 'joinKitchen');
    expect(call?.attributes).toMatchObject({ port: 'kitchens', method: 'joinKitchen', outcome: 'ok' });
  });

  it('answers kitchens-unavailable when no gateway is composed', async () => {
    const client = await createTestClient({ uid: 'sam', kitchens: null });
    const result = await client.dispatcher.dispatch(join('MOREL-0001'));
    expect(!result.ok && result.error.code).toBe('kitchens-unavailable');
  });

  describe('rejections are results, not errors', () => {
    it('not-found: a code nobody made', async () => {
      const { sam } = await twoPhones();
      const result = await sam.dispatcher.dispatch(join('NOPE-0000'));
      expect(result.ok && result.value).toEqual(rejected('not-found'));
    });

    it('expired: a code used after its day is up', async () => {
      const { bruk, sam, clock } = await twoPhones();
      const { inviteCode } = await created(bruk);
      clock.set(clock.now() + 2 * DAY);
      const result = await sam.dispatcher.dispatch(join(inviteCode));
      expect(result.ok && result.value).toEqual(rejected('expired'));
    });

    it('used: a code someone has already joined with', async () => {
      const { bruk, sam } = await twoPhones();
      const { inviteCode } = await created(bruk);
      await sam.dispatcher.dispatch(join(inviteCode));
      const result = await sam.dispatcher.dispatch(join(inviteCode));
      expect(result.ok && result.value).toEqual(rejected('used'));
    });

    it('already-member: the owner entering their own pending code', async () => {
      const { bruk } = await twoPhones();
      const { inviteCode } = await created(bruk);
      const result = await bruk.dispatcher.dispatch(join(inviteCode));
      expect(result.ok && result.value).toEqual(rejected('already-member'));
    });

    // The fake cannot reach 'full' (one invite per kitchen, consumed by the first join), so a
    // stub gateway proves the command carries every reason through unchanged.
    it.each(['not-found', 'expired', 'used', 'full', 'already-member'] as const)('carries %s through from the gateway', async (reason) => {
      const stub: KitchenGateway = {
        createKitchen: () => Promise.reject(new Error('unused')),
        joinKitchen: () => Promise.resolve({ kind: 'rejected', reason }),
      };
      const client = await createTestClient({ uid: 'sam', kitchens: stub });
      const result = await client.dispatcher.dispatch(join('ANY-0000'));
      expect(result.ok && result.value).toEqual(rejected(reason));
      expect(client.logger.records().find((r) => r.attributes['commandType'] === 'JoinKitchen')?.attributes['outcome']).toBe('ok');
    });
  });
});
