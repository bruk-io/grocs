import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import type { Deps } from '../dispatch/types.ts';
import { getInvitePreview } from './get-invite-preview.ts';

const make = (kitchens: FakeKitchenGateway): Deps => ({ syncStore: new InMemorySyncStore(), auth: new FakeAuth([]), clock: new FakeClock(), ids: new SequentialIds(), kitchens });

describe('getInvitePreview', () => {
  it("names the kitchen's member and the kitchen for a code typed in any case", async () => {
    const owner = new FakeKitchenGateway('u1', undefined, undefined, undefined, 'Bruk');
    const { inviteCode } = await owner.createKitchen('Our kitchen', 'UTC');
    expect(await getInvitePreview(make(owner.asMember('u2')), ` ${inviteCode.toLowerCase()} `)).toEqual({ inviter: 'Bruk', kitchen: 'Our kitchen' });
  });

  it('is null for a code that would not let them in', async () => {
    expect(await getInvitePreview(make(new FakeKitchenGateway('u2')), 'NOPE-0000')).toBeNull();
  });
});
