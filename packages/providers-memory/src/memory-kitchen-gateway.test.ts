import { INVITE_LIFETIME_MS } from '@grocs/core';
import { FakeClock, kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { MemoryKitchenGateway } from './memory-kitchen-gateway.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new MemoryKitchenGateway('demo-alex');
  return { owner, partner: owner.asCaller('demo-partner'), stranger: owner.asCaller('demo-stranger') };
});

describe('MemoryKitchenGateway: injected clock (R3)', () => {
  it('rejects an invite once the injected clock passes its lifetime', async () => {
    const clock = new FakeClock();
    const owner = new MemoryKitchenGateway('demo-alex', undefined, clock);
    const partner = owner.asCaller('demo-partner');
    const created = await owner.createKitchen('Our kitchen', 'America/New_York');
    clock.advance(INVITE_LIFETIME_MS + 1);
    expect(await partner.joinKitchen(created.inviteCode)).toEqual({ kind: 'rejected', reason: 'expired' });
  });
});
