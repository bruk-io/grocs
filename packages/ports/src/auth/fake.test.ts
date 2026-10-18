import { describe, expect, it } from 'vitest';
import { authContract, testSignInContract } from './contract.ts';
import { FakeAuth } from './fake.ts';

const account = { uid: 'u1', email: 'bruk@grocs.test', displayName: 'Bruk', password: 'pw-for-tests' };

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
