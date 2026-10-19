import { googleSignInContract } from '@grocs/ports/testing';
import { afterAll, describe, expect, it } from 'vitest';
import { createEmulatorClient } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { GoogleAuth } from './google-auth.ts';
import { FirebaseAuth } from './firebase-auth.ts';
import { asSdk } from './sdk.ts';
import type { AuthFns } from './sdk.ts';

const clients: EmulatorClient[] = [];
afterAll(async () => {
  await Promise.all(clients.map((c) => c.dispose()));
});

let counter = 0;

/**
 * The Auth emulator does not verify real Google OAuth tokens (it cannot reach Google), but it
 * does accept a synthetic one for exactly this reason: connected to the emulator,
 * `GoogleAuthProvider.credential` takes a JSON string (not a signed JWT) carrying the claims a
 * real ID token would, and `signInWithCredential` creates/signs in a user from them, with a uid
 * derived deterministically from `sub`. Verified empirically against the running emulator (not
 * assumed) before writing this test; the native Google picker itself is the part this cannot
 * reach - same emulator boundary FirebaseTestSignIn's own comment names - and is TASK-1.15's job.
 */
function syntheticGoogleIdToken(sub: string): string {
  return JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true });
}

// The same suite the in-memory fake passes (R1, R29), now against the Auth emulator.
googleSignInContract({ describe, it, expect }, async () => {
  const client = createEmulatorClient('google-auth');
  clients.push(client);
  const fns = asSdk<AuthFns>(client.authFns);
  const sub = `google-sub-${Date.now()}-${++counter}`;

  const succeeding = new GoogleAuth(fns, client.auth, async () => syntheticGoogleIdToken(sub));

  const failingClient = createEmulatorClient('google-auth-failing');
  clients.push(failingClient);
  const failingFns = asSdk<AuthFns>(failingClient.authFns);
  // Not JSON and not a JWT: the emulator rejects it outright (verified empirically above),
  // standing in for a cancelled or failed native picker.
  const failing = new GoogleAuth(failingFns, failingClient.auth, async () => 'not-a-real-token');

  return {
    googleSignIn: succeeding,
    auth: new FirebaseAuth(fns, client.auth),
    failing: {
      googleSignIn: failing,
      auth: new FirebaseAuth(failingFns, failingClient.auth),
    },
  };
});
