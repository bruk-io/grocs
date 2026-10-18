import { eventually, rejection, sleep } from '../testing.ts';
import type { TestApi } from '../testing.ts';
import type { AuthPort, TestSignIn, User } from './port.ts';

export interface AuthSubject {
  readonly auth: AuthPort;
  /** Signs in the known account the way the provider's tests can (the provider itself has no sign-in method here). */
  signIn(): Promise<void>;
  readonly account: { readonly email: string; readonly uid: string };
  dispose?(): Promise<void>;
}

/** Every Auth provider passes this suite (R29). `make` gives a signed-out provider. */
export function authContract(t: TestApi, make: () => Promise<AuthSubject>): void {
  const withAuth = (body: (s: AuthSubject) => Promise<void>) => async (): Promise<void> => {
    const subject = await make();
    try {
      await body(subject);
    } finally {
      await subject.dispose?.();
    }
  };

  t.describe('Auth contract', () => {
    t.it('starts signed out', withAuth(async ({ auth }) => {
      t.expect(auth.currentUser()).toBeNull();
    }));

    t.it('knows who is signed in once someone signs in', withAuth(async ({ auth, signIn, account }) => {
      await signIn();
      await eventually(() => t.expect(auth.currentUser()?.uid).toBe(account.uid));
      t.expect(auth.currentUser()?.email).toBe(account.email);
    }));

    t.it('tells a listener who is signed in, on subscribing and on every change', withAuth(async ({ auth, signIn, account }) => {
      const seen: (string | null)[] = [];
      const unsubscribe = auth.onAuthStateChanged((u: User | null) => seen.push(u?.uid ?? null));
      try {
        await eventually(() => t.expect(seen.length).toBeGreaterThanOrEqual(1));
        t.expect(seen[0]).toBeNull();
        await signIn();
        await eventually(() => t.expect(seen[seen.length - 1]).toBe(account.uid));
        await auth.signOut();
        await eventually(() => t.expect(seen[seen.length - 1]).toBeNull());
        t.expect(auth.currentUser()).toBeNull();
      } finally {
        unsubscribe();
      }
    }));

    t.it('stops telling a listener after it unsubscribes', withAuth(async ({ auth, signIn }) => {
      const seen: (string | null)[] = [];
      const unsubscribe = auth.onAuthStateChanged((u: User | null) => seen.push(u?.uid ?? null));
      await eventually(() => t.expect(seen.length).toBeGreaterThanOrEqual(1));
      unsubscribe();
      const count = seen.length;
      await signIn();
      await sleep(200);
      t.expect(seen.length).toBe(count);
    }));
  });
}

export interface TestSignInSubject {
  readonly testSignIn: TestSignIn;
  /** The provider that observes the session the test sign-in creates. */
  readonly auth: AuthPort;
  readonly account: { readonly email: string; readonly password: string; readonly uid: string };
  dispose?(): Promise<void>;
}

/** Every TestSignIn implementation passes this suite (R53). It is development-only, so it runs in tests, not in release builds. */
export function testSignInContract(t: TestApi, make: () => Promise<TestSignInSubject>): void {
  t.describe('TestSignIn contract', () => {
    t.it('signs in a known account and the session shows it', async () => {
      const { testSignIn, auth, account, dispose } = await make();
      try {
        const user = await testSignIn.signInWithTestAccount(account.email, account.password);
        t.expect(user.uid).toBe(account.uid);
        await eventually(() => t.expect(auth.currentUser()?.uid).toBe(account.uid));
      } finally {
        await dispose?.();
      }
    });

    t.it('rejects a wrong password and stays signed out', async () => {
      const { testSignIn, auth, account, dispose } = await make();
      try {
        const error = await rejection(testSignIn.signInWithTestAccount(account.email, 'not-the-password'));
        t.expect(error === null).toBe(false);
        await sleep(100);
        t.expect(auth.currentUser()).toBeNull();
      } finally {
        await dispose?.();
      }
    });
  });
}
