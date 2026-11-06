import { describe, expect, it } from 'vitest';
import { kitchenGatewayContract } from './contract.ts';
import { INVITE_LIFETIME_MS } from '@grocs/core';
import { FakeClock } from '../clock/fake.ts';
import { FakeKitchenGateway } from './fake.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new FakeKitchenGateway('alex');
  return { owner, partner: owner.asMember('sam'), stranger: owner.asMember('carl') };
});

describe('FakeKitchenGateway.inviteForKitchen past an invite lifetime (TASK-56)', () => {
  it('issues a fresh code once the last one has expired, and the partner can join with it', async () => {
    const clock = new FakeClock();
    const owner = new FakeKitchenGateway('alex', undefined, clock);
    const created = await owner.createKitchen('Our kitchen', 'UTC');
    clock.advance(INVITE_LIFETIME_MS + 1);
    const fresh = await owner.inviteForKitchen(created.kitchenId);
    if (fresh.kind !== 'open') throw new Error(`expected an open invite, got ${fresh.kind}`);
    expect(fresh.code).not.toBe(created.inviteCode);
    expect(fresh.expiresAt).toBe(clock.now() + INVITE_LIFETIME_MS);
    expect(await owner.asMember('sam').joinKitchen(fresh.code)).toEqual({ kind: 'joined', kitchenId: created.kitchenId });
  });
});
