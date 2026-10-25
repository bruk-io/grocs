import { describe, expect, it } from 'vitest';
import { syncStoreContract, syncStoreMealContract } from './contract.ts';
import { InMemorySyncStore } from './fake.ts';

const make = async () => ({
  store: new InMemorySyncStore(),
  kitchenId: 'kitchen-a',
  otherKitchenId: 'kitchen-b',
});

syncStoreContract({ describe, it, expect }, make);
syncStoreMealContract({ describe, it, expect }, make);
