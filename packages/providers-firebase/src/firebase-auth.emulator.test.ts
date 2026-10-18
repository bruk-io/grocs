import { authContract } from '@grocs/ports/testing';
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
  const { email, password, uid } = seedAccount.bruk;
  return {
    auth: new FirebaseAuth(asSdk<AuthFns>(client.authFns), client.auth),
    // The provider has no sign-in of its own, so the test signs in through the SDK, as the dev tools do.
    signIn: async () => void (await client.authFns.signInWithEmailAndPassword(client.auth, email, password)),
    account: { email, uid },
  };
});
