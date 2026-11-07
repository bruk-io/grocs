import { kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { MemoryKitchenGateway } from './memory-kitchen-gateway.ts';

const person = (uid: string, email: string | null = `${uid}@example.com`) => ({ uid, name: uid, email });

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new MemoryKitchenGateway(person('demo-alex'));
  return {
    owner,
    partner: owner.asCaller(person('demo-partner')),
    stranger: owner.asCaller(person('demo-stranger')),
    ownerEmail: 'demo-alex@example.com',
    partnerEmail: 'Demo-Partner@example.com',
    strangerEmail: 'demo-stranger@example.com',
  };
});

describe('MemoryKitchenGateway: a caller with no verified email (TASK-78)', () => {
  it('is offered nothing', async () => {
    const owner = new MemoryKitchenGateway(person('demo-alex'));
    const { kitchenId } = await owner.createKitchen('Our kitchen', 'UTC');
    await owner.inviteByEmail(kitchenId, 'demo-partner@example.com');
    expect(await owner.asCaller(person('demo-partner', null)).invitesForMe()).toEqual([]);
  });
});
