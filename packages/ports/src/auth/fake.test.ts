import { describe, expect, it } from 'vitest';
import { authContract } from './contract.ts';
import { FakeAuth } from './fake.ts';

const account = { uid: 'u1', email: 'bruk@grocs.test', displayName: 'Bruk', password: 'pw-for-tests' };

authContract({ describe, it, expect }, async () => ({
  auth: new FakeAuth([account]),
  account: { email: account.email, password: account.password, uid: account.uid },
}));
