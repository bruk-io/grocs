import type { Unsubscribe, User } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/** Follow who is signed in. `onUser` gets the person (or null) now and whenever it changes. */
export function watchSession(deps: Deps, onUser: (user: User | null) => void): Unsubscribe {
  return deps.auth.onAuthStateChanged(onUser);
}

/** Sign out the current member. */
export function signOut(deps: Deps): Promise<void> {
  return deps.auth.signOut();
}
