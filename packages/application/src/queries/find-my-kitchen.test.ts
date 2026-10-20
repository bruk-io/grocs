import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { findMyKitchen } from './find-my-kitchen.ts';

const make = (kitchens?: FakeKitchenGateway): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  ...(kitchens ? { kitchens } : {}),
});

describe('findMyKitchen', () => {
  it('returns the kitchen the signed-in member belongs to', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const deps = make(kitchens);
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    const created = await kitchens.createKitchen('Home', 'UTC');
    expect(await findMyKitchen(deps)).toBe(created.kitchenId);
  });

  it('returns null when the signed-in member has no kitchen yet', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const deps = make(kitchens);
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    expect(await findMyKitchen(deps)).toBeNull();
  });

  it('returns null when nobody is signed in, even if a kitchen exists', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const deps = make(kitchens);
    await kitchens.createKitchen('Home', 'UTC');
    expect(await findMyKitchen(deps)).toBeNull();
  });

  it('rejects with kitchens-unavailable when the composition supplies no gateway', async () => {
    const deps = make();
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    await expect(findMyKitchen(deps)).rejects.toThrow('kitchens-unavailable');
  });
});
