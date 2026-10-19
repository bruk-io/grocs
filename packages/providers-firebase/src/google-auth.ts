import type { GoogleSignIn, User } from '@grocs/ports';
import type { AuthFns, AuthUserLike } from './sdk.ts';

const toUser = (u: AuthUserLike): User => ({ uid: u.uid, email: u.email, displayName: u.displayName });

/**
 * Google sign-in behind the GoogleSignIn port. `getGoogleIdToken` is injected rather than this
 * class importing @react-native-google-signin/google-signin directly: that keeps this provider
 * unit-testable without a device, and keeps the real native picker a composition-root concern
 * (TASK-1.15 wires a real implementation; this one may stay a stub until then).
 */
export class GoogleAuth implements GoogleSignIn {
  constructor(
    private readonly fns: AuthFns,
    private readonly auth: unknown,
    private readonly getGoogleIdToken: () => Promise<string>,
  ) {}

  async signInWithGoogle(): Promise<User> {
    const idToken = await this.getGoogleIdToken();
    const credential = this.fns.GoogleAuthProvider.credential(idToken);
    const { user } = await this.fns.signInWithCredential(this.auth, credential);
    return toUser(user);
  }
}
