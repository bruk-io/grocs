// Emulator tests for the seed. Test files in the emulator project run in parallel
// workers, and each one seeds, so seeding must survive running at the same time
// as another seed.
import { describe, expect, it } from 'vitest';
import { seedKitchen, seedOpenKitchen, seedUsers } from './data.ts';
import { seed, seedKitchenDoc, seedOpenKitchenDoc } from './seed.ts';

describe('seed', () => {
  it('can run twice at the same time without failing', async () => {
    await expect(Promise.all([seed(), seed()])).resolves.toBeDefined();
  });

  it('can run again after the users exist', async () => {
    await seed();
    await expect(seed()).resolves.toBeUndefined();
  });

  it('builds the seed kitchen with every seed user as a named member, as the app writes a kitchen', () => {
    const kitchen = seedKitchenDoc();
    expect(kitchen.id).toBe(seedKitchen.id);
    expect(kitchen.members).toEqual(seedUsers.map((u) => u.uid));
    expect(kitchen.memberNames).toEqual(Object.fromEntries(seedUsers.map((u) => [u.uid, u.displayName])));
  });

  it("builds Jo's kitchen with Jo alone, so a partner can join it (TASK-56)", () => {
    const kitchen = seedOpenKitchenDoc();
    expect(kitchen.id).toBe(seedOpenKitchen.id);
    expect(kitchen.members).toEqual(['seed-jo']);
  });
});
