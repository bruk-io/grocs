import { kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { MemoryKitchenGateway } from './memory-kitchen-gateway.ts';

kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = new MemoryKitchenGateway('demo-bruk');
  return { owner, partner: owner.asCaller('demo-partner'), stranger: owner.asCaller('demo-stranger') };
});
