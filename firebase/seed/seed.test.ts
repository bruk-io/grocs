// Emulator tests for the seed. Test files in the emulator project run in parallel
// workers, and each one seeds, so seeding must survive running at the same time
// as another seed.
import { describe, expect, it } from 'vitest';
import { seed } from './seed.ts';

describe('seed', () => {
  it('can run twice at the same time without failing', async () => {
    await expect(Promise.all([seed(), seed()])).resolves.toBeDefined();
  });

  it('can run again after the users exist', async () => {
    await seed();
    await expect(seed()).resolves.toBeUndefined();
  });
});
