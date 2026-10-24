import { describe, expect, it } from 'vitest';
import { kitchenGatewayContract } from './contract.ts';
import { FakeKitchenGateway } from './fake.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new FakeKitchenGateway('alex');
  return { owner, partner: owner.asMember('sam'), stranger: owner.asMember('carl') };
});
