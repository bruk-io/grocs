import { authContract } from '@grocs/ports';
import { afterAll, describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded, seedAccount } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { FirebaseAuth } from './firebase-auth.ts';
import { asSdk } from './sdk.ts';
import type { AuthFns } from './sdk.ts';

const clients: EmulatorClient[] = [];
afterAll(async () => {
  await Promise.all(clients.map((c) => c.dispose()));
});

// The same suite the in-memory fake passes (R29, R49), now against the Auth emulator.
authContract({ describe, it, expect }, async () => {
  await ensureSeeded();
  const client = createEmulatorClient('auth');
  clients.push(client);
  return {
    auth: new FirebaseAuth(asSdk<AuthFns>(client.authFns), client.auth),
    account: { email: seedAccount.bruk.email, password: seedAccount.bruk.password, uid: seedAccount.bruk.uid },
  };
});
