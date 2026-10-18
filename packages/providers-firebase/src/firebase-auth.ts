import type { AuthPort, Unsubscribe, User } from '@grocs/ports';
import type { AuthFns, AuthUserLike } from './sdk.ts';

const toUser = (u: AuthUserLike): User => ({ uid: u.uid, email: u.email, displayName: u.displayName });

/**
 * Firebase Auth behind the auth port. It has no sign-in method of its own yet: Google sign-in
 * joins in a later task (R1). Development builds sign in through apps/mobile/src/dev (R53),
 * which this class knows nothing about, so release builds carry no test sign-in.
 */
export class FirebaseAuth implements AuthPort {
  #current: User | null = null;

  constructor(
    private readonly fns: AuthFns,
    private readonly auth: unknown,
  ) {
    this.fns.onAuthStateChanged(this.auth, (u) => {
      this.#current = u ? toUser(u) : null;
    });
  }

  currentUser(): User | null {
    return this.#current;
  }

  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe {
    return this.fns.onAuthStateChanged(this.auth, (u) => listener(u ? toUser(u) : null));
  }

  async signOut(): Promise<void> {
    await this.fns.signOut(this.auth);
    this.#current = null;
  }
}
