import type { Unsubscribe } from '../unsubscribe.ts';
import type { AuthPort, TestSignIn, User } from './port.ts';

interface Account extends User {
  readonly password: string;
}

/** In-memory accounts. Sign-in is checked against the accounts it was given. */
export class FakeAuth implements AuthPort, TestSignIn {
  #current: User | null = null;
  readonly #listeners = new Set<(user: User | null) => void>();
  readonly #awaitingFirst = new Set<(user: User | null) => void>();
  readonly #accounts: readonly Account[];

  constructor(accounts: readonly Account[] = []) {
    this.#accounts = accounts;
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
