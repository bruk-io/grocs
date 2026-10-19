import { describe, expect, it } from 'vitest';
import { kitchenGatewayContract } from './contract.ts';
import { FakeKitchenGateway } from './fake.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new FakeKitchenGateway('bruk');
  return { owner, partner: owner.asMember('shazya'), stranger: owner.asMember('carl') };
});
