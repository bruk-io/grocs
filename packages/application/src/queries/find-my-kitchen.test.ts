import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it, vi } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { findMyKitchen } from './find-my-kitchen.ts';

const make = (kitchens = new FakeKitchenGateway('u1')): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens,
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

  it('does not call the gateway when nobody is signed in', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const deps = make(kitchens);
    const spy = vi.spyOn(kitchens, 'findMyKitchen');
    const result = await findMyKitchen(deps);
    expect(spy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
