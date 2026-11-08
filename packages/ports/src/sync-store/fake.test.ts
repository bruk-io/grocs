import { describe, expect, it } from 'vitest';
import { syncStoreAisleContract, syncStoreContract, syncStoreMealContract, syncStoreRecipeContract } from './contract.ts';
import { InMemorySyncStore } from './fake.ts';

const make = async () => ({
  store: new InMemorySyncStore(),
  kitchenId: 'kitchen-a',
  otherKitchenId: 'kitchen-b',
});

syncStoreContract({ describe, it, expect }, make);
syncStoreMealContract({ describe, it, expect }, make);
syncStoreRecipeContract({ describe, it, expect }, make);
syncStoreAisleContract({ describe, it, expect }, make);
