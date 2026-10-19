import type { Unsubscribe } from '../unsubscribe.ts';
import type { AuthPort, GoogleSignIn, TestSignIn, User } from './port.ts';

interface Account extends User {
  readonly password: string;
}

/** In-memory accounts. Sign-in is checked against the accounts it was given. */
export class FakeAuth implements AuthPort, TestSignIn, GoogleSignIn {
  #current: User | null = null;
  readonly #listeners = new Set<(user: User | null) => void>();
  readonly #awaitingFirst = new Set<(user: User | null) => void>();
  readonly #accounts: readonly Account[];
  readonly #googleAccount: User | null;

  /**
   * `googleAccount` stands in for a successful Google picker: when set, `signInWithGoogle` signs
   * that account in. When null (the default), it stands in for a cancelled or failed pick -
   * `signInWithGoogle` rejects and the session stays signed out, same as a real cancelled picker.
   */
  constructor(accounts: readonly Account[] = [], googleAccount: User | null = null) {
    this.#accounts = accounts;
    this.#googleAccount = googleAccount;
  }

  currentUser(): User | null {
    return this.#current;
  }

  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe {
    this.#listeners.add(listener);
    this.#awaitingFirst.add(listener);
    queueMicrotask(() => {
      // Only if no change has already told this listener the current state.
      if (this.#awaitingFirst.delete(listener) && this.#listeners.has(listener)) listener(this.#current);
    });
    return () => {
      this.#listeners.delete(listener);
      this.#awaitingFirst.delete(listener);
    };
  }

  async signInWithTestAccount(email: string, password: string): Promise<User> {
    const account = this.#accounts.find((a) => a.email === email && a.password === password);
    if (!account) throw new Error('auth/invalid-credential');
    const user: User = { uid: account.uid, email: account.email, displayName: account.displayName };
    this.#set(user);
    return user;
  }

  async signInWithGoogle(): Promise<User> {
    if (!this.#googleAccount) throw new Error('auth/google-sign-in-cancelled');
    this.#set(this.#googleAccount);
    return this.#googleAccount;
  }

  async signOut(): Promise<void> {
    this.#set(null);
  }

  #set(user: User | null): void {
    this.#current = user;
    for (const listener of [...this.#listeners]) {
      this.#awaitingFirst.delete(listener);
      listener(user);
    }
  }
}
