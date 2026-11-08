import { describe, expect, it } from 'vitest';
import { acceptInvite, cancelInvite, inviteByEmail, isInvitedTo, normaliseEmail, removeMember } from './email-invite.ts';
import type { Kitchen } from './kitchen.ts';

const solo: Kitchen = {
  id: 'k1',
  schemaVersion: 1,
  name: 'Our kitchen',
  members: ['alex'],
  memberNames: { alex: 'Alex' },
  timeZone: 'America/New_York',
  createdAt: 1000,
};
const full: Kitchen = { ...solo, members: ['alex', 'sam'], memberNames: { alex: 'Alex', sam: 'Sam' } };
const invited: Kitchen = { ...solo, invite: { email: 'sam@example.com', invitedBy: 'alex', createdAt: 2000 } };
const samsOwn: Kitchen = { ...solo, id: 'k2', name: "Sam's kitchen", members: ['sam'], memberNames: { sam: 'Sam' } };

describe('normaliseEmail (TASK-78)', () => {
  it('trims and lower-cases', () => {
    expect(normaliseEmail('  Sam@Example.COM ')).toEqual({ ok: true, value: 'sam@example.com' });
  });

  it.each(['', 'sam', 'sam@', '@example.com', 'sam@example', 'sam smith@example.com'])('rejects %j', (raw) => {
    expect(normaliseEmail(raw)).toEqual({ ok: false, error: 'invalid-email' });
  });
});

describe('inviteByEmail (TASK-78)', () => {
  const base = { kitchen: solo, callerUid: 'alex', callerEmail: 'alex@example.com', now: 2000 };

  it('puts the invite on the kitchen, in its stored form', () => {
    const r = inviteByEmail({ ...base, email: ' Sam@Example.com' });
    expect(r).toEqual({ ok: true, value: invited });
  });

  it('replaces an earlier invite: the kitchen has one open place', () => {
    const r = inviteByEmail({ ...base, kitchen: invited, email: 'jo@example.com', now: 3000 });
    expect(r.ok && r.value.invite).toEqual({ email: 'jo@example.com', invitedBy: 'alex', createdAt: 3000 });
  });

  it('refuses someone who is not a member', () => {
    expect(inviteByEmail({ ...base, callerUid: 'stranger', email: 'sam@example.com' })).toEqual({ ok: false, error: 'not-a-member' });
  });

  it('refuses once the kitchen has both its members (R3)', () => {
    expect(inviteByEmail({ ...base, kitchen: full, email: 'jo@example.com' })).toEqual({ ok: false, error: 'full' });
  });

  it('refuses an address that is not an email', () => {
    expect(inviteByEmail({ ...base, email: 'sam' })).toEqual({ ok: false, error: 'invalid-email' });
  });

  it("refuses the caller's own address, whatever its case", () => {
    expect(inviteByEmail({ ...base, email: 'ALEX@example.com' })).toEqual({ ok: false, error: 'own-email' });
  });

  it('cannot tell own-email when the caller has no verified email, so lets it through', () => {
    expect(inviteByEmail({ ...base, callerEmail: null, email: 'alex@example.com' }).ok).toBe(true);
  });
});

describe('cancelInvite (TASK-78)', () => {
  it('takes the invite off the kitchen', () => {
    expect(cancelInvite(invited, 'alex')).toEqual({ ok: true, value: solo });
  });

  it('refuses someone who is not a member', () => {
    expect(cancelInvite(invited, 'sam')).toEqual({ ok: false, error: 'not-a-member' });
  });
});

describe('isInvitedTo (TASK-78)', () => {
  it('matches the invited email whatever its case', () => {
    expect(isInvitedTo(invited, 'SAM@example.com')).toBe(true);
  });

  it('does not match another email, no email, or a kitchen with no invite', () => {
    expect(isInvitedTo(invited, 'jo@example.com')).toBe(false);
    expect(isInvitedTo(invited, null)).toBe(false);
    expect(isInvitedTo(solo, 'sam@example.com')).toBe(false);
  });
});

describe('acceptInvite (R3, R4, TASK-78)', () => {
  const sam = { uid: 'sam', name: 'Sam', email: 'sam@example.com' };

  it('adds the invited person and uses up the invite', () => {
    const r = acceptInvite({ ...sam, target: invited, current: null });
    expect(r).toEqual({ ok: true, value: { joined: full, left: null } });
  });

  it('takes them out of the kitchen they had; that kitchen keeps everything else', () => {
    const r = acceptInvite({ ...sam, target: invited, current: samsOwn });
    expect(r.ok && r.value.left).toEqual({ ...samsOwn, members: [], memberNames: {} });
  });

  it('drops the invite the leaver sent from the kitchen they left, so it is never offered again (TASK-79)', () => {
    const samInvitedAlex: Kitchen = { ...samsOwn, invite: { email: 'alex@example.com', invitedBy: 'sam', createdAt: 2000 } };
    const r = acceptInvite({ ...sam, target: invited, current: samInvitedAlex });
    expect(r.ok && r.value.left?.invite).toBeUndefined();
  });

  it('refuses anyone whose email is not the one invited (R4)', () => {
    expect(acceptInvite({ ...sam, email: 'jo@example.com', target: invited, current: null })).toEqual({ ok: false, error: 'not-found' });
    expect(acceptInvite({ ...sam, email: null, target: invited, current: null })).toEqual({ ok: false, error: 'not-found' });
  });

  it('refuses a kitchen that no longer exists or has no invite', () => {
    expect(acceptInvite({ ...sam, target: null, current: null })).toEqual({ ok: false, error: 'not-found' });
    expect(acceptInvite({ ...sam, target: solo, current: null })).toEqual({ ok: false, error: 'not-found' });
  });

  it('refuses a full kitchen even with a matching invite (R3)', () => {
    const crowded: Kitchen = { ...full, invite: { email: 'jo@example.com', invitedBy: 'alex', createdAt: 2000 } };
    expect(acceptInvite({ uid: 'jo', name: 'Jo', email: 'jo@example.com', target: crowded, current: null })).toEqual({ ok: false, error: 'full' });
  });

  it('refuses someone already a member', () => {
    const r = acceptInvite({ uid: 'alex', name: 'Alex', email: 'sam@example.com', target: invited, current: invited });
    expect(r).toEqual({ ok: false, error: 'already-member' });
  });
});

describe('removeMember (TASK-78)', () => {
  it('drops the uid and its name, keeping the other member', () => {
    expect(removeMember(full, 'sam')).toEqual(solo);
  });
});
