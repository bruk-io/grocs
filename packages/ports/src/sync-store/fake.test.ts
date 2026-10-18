import { describe, expect, it } from 'vitest';
import { syncStoreContract } from './contract.ts';
import { InMemorySyncStore } from './fake.ts';

syncStoreContract({ describe, it, expect }, async () => ({
  store: new InMemorySyncStore(),
  kitchenId: 'kitchen-a',
  otherKitchenId: 'kitchen-b',
}));
