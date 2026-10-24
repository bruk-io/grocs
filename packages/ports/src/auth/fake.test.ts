import { describe, expect, it } from 'vitest';
import { authContract, googleSignInContract, testSignInContract } from './contract.ts';
import { FakeAuth } from './fake.ts';

const account = { uid: 'u1', email: 'alex@grocs.test', displayName: 'Alex', password: 'pw-for-tests' };
const googleAccount = { uid: 'g1', email: 'alex@gmail.test', displayName: 'Alex' };

authContract({ describe, it, expect }, async () => {
  const auth = new FakeAuth([account]);
  return {
    auth,
    signIn: async () => void (await auth.signInWithTestAccount(account.email, account.password)),
    account: { email: account.email, uid: account.uid },
  };
});

testSignInContract({ describe, it, expect }, async () => {
  const auth = new FakeAuth([account]);
  return { testSignIn: auth, auth, account: { email: account.email, password: account.password, uid: account.uid } };
});

googleSignInContract({ describe, it, expect }, async () => {
  const auth = new FakeAuth([], googleAccount);
  const failingAuth = new FakeAuth();
  return { googleSignIn: auth, auth, failing: { googleSignIn: failingAuth, auth: failingAuth } };
});
