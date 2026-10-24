import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { getKitchenInfo } from './get-kitchen-info.ts';

const make = (kitchens: FakeKitchenGateway): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([{ uid: 'u1', email: 'a@grocs.test', displayName: 'A', password: 'pw' }]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens,
});

describe('getKitchenInfo', () => {
  it('returns the name and the signed-in member marked as the caller', async () => {
    const kitchens = new FakeKitchenGateway('u1', undefined, undefined, undefined, 'Alex');
    const deps = make(kitchens);
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    const created = await kitchens.createKitchen('Home', 'UTC');

    const info = await getKitchenInfo(deps, created.kitchenId);
    expect(info?.name).toBe('Home');
    expect(info?.members).toEqual([{ uid: 'u1', name: 'Alex', isCaller: true }]);
  });

  it("marks the partner's row as not the caller", async () => {
    const owner = new FakeKitchenGateway('u1', undefined, undefined, undefined, 'Alex');
    const deps = make(owner);
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    const created = await owner.createKitchen('Home', 'UTC');
    await owner.asMember('u2', 'Sam').joinKitchen(created.inviteCode);

    const info = await getKitchenInfo(deps, created.kitchenId);
    expect(info?.members).toHaveLength(2);
    const partner = info?.members.find((m) => m.uid === 'u2');
    expect(partner).toEqual({ uid: 'u2', name: 'Sam', isCaller: false });
  });

  it('returns null for a kitchen the gateway has none for', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const deps = make(kitchens);
    await (deps.auth as FakeAuth).signInWithTestAccount('a@grocs.test', 'pw');
    expect(await getKitchenInfo(deps, 'no-such-kitchen')).toBeNull();
  });
});
