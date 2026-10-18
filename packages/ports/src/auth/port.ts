import type { Unsubscribe } from '../unsubscribe.ts';

export interface User {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
}


/** Who is signed in. Google sign-in joins this port in a later task (R1). */
export interface AuthPort {
  /** The signed-in person, or null. Synchronous, from what the provider already knows. */
  currentUser(): User | null;
  /** Called with the current person (or null) soon after subscribing, and again on every change. */
  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe;
  signOut(): Promise<void>;
}

/**
 * Sign in with an email and password. Development builds use it against the Auth emulator (R53).
 * It is a separate interface from AuthPort so release builds can leave it, and the provider that
 * implements it, out of the bundle (R1).
 */
export interface TestSignIn {
  signInWithTestAccount(email: string, password: string): Promise<User>;
}
