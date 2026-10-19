import { authContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { DEMO_MEMBER, MemoryAuth } from './memory-auth.ts';

authContract({ describe, it, expect }, async () => {
  const auth = new MemoryAuth();
  return {
    auth,
    signIn: async () => void (await auth.signInAsDemoMember()),
    account: { email: DEMO_MEMBER.email as string, uid: DEMO_MEMBER.uid },
  };
});

describe('MemoryAuth demo sign-in', () => {
  it('signs in the fixed member, Bruk, with no credentials', async () => {
    const auth = new MemoryAuth();
    const user = await auth.signInAsDemoMember();
    expect(user).toEqual(DEMO_MEMBER);
    expect(user.displayName).toBe('Bruk');
    expect(auth.currentUser()).toEqual(DEMO_MEMBER);
  });

  it('signs in the same member every time', async () => {
    const auth = new MemoryAuth();
    const first = await auth.signInAsDemoMember();
    await auth.signOut();
    const second = await auth.signInAsDemoMember();
    expect(second.uid).toBe(first.uid);
  });
});
