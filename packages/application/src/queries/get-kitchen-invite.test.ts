import { FakeAuth, FakeClock, FakeKitchenGateway, FakeRecipeImporter, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { getKitchenInvite } from './get-kitchen-invite.ts';

const make = (kitchens: FakeKitchenGateway): Deps => ({
  syncStore: new InMemorySyncStore(),
  auth: new FakeAuth([]),
  clock: new FakeClock(),
  ids: new SequentialIds(),
  kitchens,
  recipeImporter: new FakeRecipeImporter(),
});

describe('getKitchenInvite', () => {
  it("gives a member their kitchen's open invite", async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const created = await kitchens.createKitchen('Home', 'UTC');
    expect(await getKitchenInvite(make(kitchens), created.kitchenId)).toEqual({ kind: 'open', code: created.inviteCode, expiresAt: expect.any(Number) });
  });

  it('says the kitchen is full once the partner has joined', async () => {
    const kitchens = new FakeKitchenGateway('u1');
    const created = await kitchens.createKitchen('Home', 'UTC');
    await kitchens.asMember('u2').joinKitchen(created.inviteCode);
    expect(await getKitchenInvite(make(kitchens), created.kitchenId)).toEqual({ kind: 'full' });
  });
});
