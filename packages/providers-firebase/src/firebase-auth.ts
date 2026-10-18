import type { AuthPort, TestSignIn, Unsubscribe, User } from '@grocs/ports';
import type { AuthFns, AuthUserLike } from './sdk.ts';

const toUser = (u: AuthUserLike): User => ({ uid: u.uid, email: u.email, displayName: u.displayName });

/**
 * Firebase Auth behind the auth port. `signInWithTestAccount` is the development-only way in
 * (R53): a build that does not construct this class through src/dev has no path to it.
 */
export class FirebaseAuth implements AuthPort, TestSignIn {
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

  async signInWithTestAccount(email: string, password: string): Promise<User> {
    const credential = await this.fns.signInWithEmailAndPassword(this.auth, email, password);
    this.#current = toUser(credential.user);
    return this.#current;
  }

  async signOut(): Promise<void> {
    await this.fns.signOut(this.auth);
    this.#current = null;
  }
}
