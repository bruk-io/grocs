import { describe, expect, it } from 'vitest';
import { avatarsFor, partnerNameOf } from './use-kitchen-info.ts';

const both = {
  name: 'Our kitchen',
  members: [
    { uid: 'u2', name: 'Shazya', isCaller: false },
    { uid: 'u1', name: 'Bruk', isCaller: true },
  ],
  invitedEmail: null,
};

describe('avatarsFor', () => {
  it('draws nothing until the kitchen has loaded', () => {
    expect(avatarsFor(null)).toEqual([]);
  });

  it('puts the signed-in member first and the partner in the second tone', () => {
    expect(avatarsFor(both)).toEqual([{ name: 'Bruk' }, { name: 'Shazya', tone: 'chartreuse' }]);
  });
});

describe('partnerNameOf', () => {
  it("names the partner, or nobody while the kitchen has one member", () => {
    expect(partnerNameOf(both)).toBe('Shazya');
    expect(partnerNameOf({ name: 'Mine', members: [{ uid: 'u1', name: 'Bruk', isCaller: true }], invitedEmail: null })).toBeNull();
    expect(partnerNameOf(null)).toBeNull();
  });
});
