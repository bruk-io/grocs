import type { AuthPort, Unsubscribe, User } from '@grocs/ports';

/** The fixed member the demo signs in as: Bruk, of the sample household of Bruk and Sam. */
export const DEMO_MEMBER: User = { uid: 'demo-bruk', email: 'bruk@demo.grocs.invalid', displayName: 'Bruk' };

/**
 * Auth held in memory for the demo build. It touches no network and no disk. Beyond the AuthPort
 * it has one method, `signInAsDemoMember`, which only the demo composition root calls.
 */
export class MemoryAuth implements AuthPort {
  #current: User | null = null;
  readonly #listeners = new Set<(user: User | null) => void>();
  readonly #awaitingFirst = new Set<(user: User | null) => void>();

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

  /** Signs in the fixed demo member, with no credentials. */
  async signInAsDemoMember(): Promise<User> {
    this.#set(DEMO_MEMBER);
    return DEMO_MEMBER;
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
