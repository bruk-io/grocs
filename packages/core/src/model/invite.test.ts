import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkInvite, INVITE_CODE_PATTERN, INVITE_LIFETIME_MS, inviteCodeFromId, inviteExpiresAt, inviteToReuse, isInviteExpired } from './invite.ts';
import type { InviteRecord } from './invite.ts';

describe('inviteCodeFromId (R2)', () => {
  it('is deterministic: the same id always gives the same code', () => {
    expect(inviteCodeFromId('abc123')).toBe(inviteCodeFromId('abc123'));
  });

  it('gives different codes for different ids, in practice', () => {
    expect(inviteCodeFromId('id-1')).not.toBe(inviteCodeFromId('id-2'));
  });

  it('always matches WORD-NN', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        expect(inviteCodeFromId(id)).toMatch(INVITE_CODE_PATTERN);
      }),
      { numRuns: 500 },
    );
  });
});

describe('isInviteExpired (R3)', () => {
  it('is not expired right up to one day, expired just after', () => {
    expect(isInviteExpired(1000, 1000 + INVITE_LIFETIME_MS)).toBe(false);
    expect(isInviteExpired(1000, 1000 + INVITE_LIFETIME_MS + 1)).toBe(true);
  });
});

describe('checkInvite (R3)', () => {
  const pending: InviteRecord = { code: 'MOREL-24', kitchenId: 'k1', createdAt: 1000, status: 'pending' };

  it('accepts a pending, unexpired invite', () => {
    expect(checkInvite(pending, 1000)).toEqual({ ok: true, value: pending });
  });

  it('rejects an invite that does not exist', () => {
    expect(checkInvite(null, 1000)).toEqual({ ok: false, error: 'not-found' });
  });

  it('rejects an already-used invite, even if it would still be within its lifetime', () => {
    const used: InviteRecord = { ...pending, status: 'used' };
    expect(checkInvite(used, 1000)).toEqual({ ok: false, error: 'used' });
  });

  it('rejects an expired invite', () => {
    expect(checkInvite(pending, 1000 + INVITE_LIFETIME_MS + 1)).toEqual({ ok: false, error: 'expired' });
  });

  it('checks used before expired, so a replayed stale join reports the more specific reason', () => {
    const usedAndOld: InviteRecord = { ...pending, status: 'used' };
    expect(checkInvite(usedAndOld, 1000 + INVITE_LIFETIME_MS + 1)).toEqual({ ok: false, error: 'used' });
  });
});

describe('inviteExpiresAt (R3)', () => {
  it('is one invite lifetime after the invite was made', () => {
    expect(inviteExpiresAt(1000)).toBe(1000 + INVITE_LIFETIME_MS);
  });

  it('is the last moment the invite still works', () => {
    expect(isInviteExpired(1000, inviteExpiresAt(1000))).toBe(false);
    expect(isInviteExpired(1000, inviteExpiresAt(1000) + 1)).toBe(true);
  });
});

describe('inviteToReuse (TASK-56)', () => {
  const invite = (code: string, createdAt: number, status: InviteRecord['status'] = 'pending'): InviteRecord => ({ code, kitchenId: 'k1', createdAt, status });

  it('is null when the kitchen has no invites', () => {
    expect(inviteToReuse([], 0)).toBeNull();
  });

  it('reuses a pending invite that has not expired', () => {
    expect(inviteToReuse([invite('MOREL-0001', 1000)], 2000)?.code).toBe('MOREL-0001');
  });

  it('does not reuse an expired invite, so a fresh one gets issued', () => {
    expect(inviteToReuse([invite('MOREL-0001', 1000)], 1000 + INVITE_LIFETIME_MS + 1)).toBeNull();
  });

  it('does not reuse a used invite', () => {
    expect(inviteToReuse([invite('MOREL-0001', 1000, 'used')], 2000)).toBeNull();
  });

  it('picks the newest of several usable invites', () => {
    expect(inviteToReuse([invite('OLD-0001', 1000), invite('NEW-0002', 3000), invite('MID-0003', 2000)], 4000)?.code).toBe('NEW-0002');
  });
});
