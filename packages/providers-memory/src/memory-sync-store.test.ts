import { syncStoreContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { MemorySyncStore } from './memory-sync-store.ts';

// The same suite the Firestore provider passes against the emulator (R29, R49).
syncStoreContract({ describe, it, expect }, async () => ({
  store: new MemorySyncStore(),
  kitchenId: 'kitchen-a',
  otherKitchenId: 'kitchen-b',
}));
