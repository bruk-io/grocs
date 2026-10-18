import type { TestSignIn, User } from '@grocs/ports';
import type { AuthFns } from '@grocs/providers-firebase';

/**
 * Development-only sign-in with an email and password against the Auth emulator (R53). Google's
 * native sign-in screen cannot reach the emulator, and this is a second way in, so it lives in
 * src/dev, which release builds do not contain (R1).
 */
export class FirebaseTestSignIn implements TestSignIn {
  constructor(
    private readonly fns: AuthFns,
    private readonly auth: unknown,
  ) {}

  async signInWithTestAccount(email: string, password: string): Promise<User> {
    const { user } = await this.fns.signInWithEmailAndPassword(this.auth, email, password);
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  }
}
