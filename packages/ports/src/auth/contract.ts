import { eventually, rejection } from '../testing.ts';
import type { TestApi } from '../testing.ts';
import type { AuthPort, TestSignIn, User } from './port.ts';

export interface AuthSubject {
  readonly auth: AuthPort & TestSignIn;
  /** An account that exists in the provider. */
  readonly account: { readonly email: string; readonly password: string; readonly uid: string };
  dispose?(): Promise<void>;
}

/** Every Auth provider passes this suite (R29). `make` gives a signed-out provider. */
export function authContract(t: TestApi, make: () => Promise<AuthSubject>): void {
  t.describe('Auth contract', () => {
    t.it('starts signed out', async () => {
      const { auth, dispose } = await make();
      try {
        t.expect(auth.currentUser()).toBeNull();
      } finally {
        await dispose?.();
      }
    });

    t.it('signs in with a test account and then knows who is signed in', async () => {
      const { auth, account, dispose } = await make();
      try {
        const user = await auth.signInWithTestAccount(account.email, account.password);
        t.expect(user.uid).toBe(account.uid);
        t.expect(user.email).toBe(account.email);
        t.expect(auth.currentUser()?.uid).toBe(account.uid);
      } finally {
        await dispose?.();
      }
    });

    t.it('rejects a wrong password and stays signed out', async () => {
      const { auth, account, dispose } = await make();
      try {
        const error = await rejection(auth.signInWithTestAccount(account.email, 'not-the-password'));
        t.expect(error === null).toBe(false);
        t.expect(auth.currentUser()).toBeNull();
      } finally {
        await dispose?.();
      }
    });

    t.it('tells a listener who is signed in, on subscribing and on every change', async () => {
      const { auth, account, dispose } = await make();
      const seen: (string | null)[] = [];
      const unsubscribe = auth.onAuthStateChanged((u: User | null) => seen.push(u?.uid ?? null));
      try {
        await eventually(() => t.expect(seen.length).toBeGreaterThanOrEqual(1));
        t.expect(seen[0]).toBeNull();
        await auth.signInWithTestAccount(account.email, account.password);
        await eventually(() => t.expect(seen[seen.length - 1]).toBe(account.uid));
        await auth.signOut();
        await eventually(() => t.expect(seen[seen.length - 1]).toBeNull());
        t.expect(auth.currentUser()).toBeNull();
      } finally {
        unsubscribe();
        await dispose?.();
      }
    });

    t.it('stops telling a listener after it unsubscribes', async () => {
      const { auth, account, dispose } = await make();
      const seen: (string | null)[] = [];
      const unsubscribe = auth.onAuthStateChanged((u: User | null) => seen.push(u?.uid ?? null));
      try {
        await eventually(() => t.expect(seen.length).toBeGreaterThanOrEqual(1));
        unsubscribe();
        const count = seen.length;
        await auth.signInWithTestAccount(account.email, account.password);
        await new Promise((r) => setTimeout(r, 150));
        t.expect(seen.length).toBe(count);
      } finally {
        unsubscribe();
        await dispose?.();
      }
    });
  });
}
