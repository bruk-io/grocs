import { kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { GoogleAuth } from './google-auth.ts';
import { FirebaseKitchenGateway } from './kitchen-gateway.ts';
import { asSdk } from './sdk.ts';
import type { AuthFns, FirestoreFns, FunctionsFns } from './sdk.ts';

function gatewayFor(client: EmulatorClient): FirebaseKitchenGateway {
  const fns = asSdk<FunctionsFns>(client.functionsFns);
  const fs = asSdk<FirestoreFns>(client.firestoreFns);
  return new FirebaseKitchenGateway(fns, client.functions, fs, client.db);
}

let counter = 0;

/**
 * Signs in through the Google credential path, with a synthetic ID token the Auth emulator accepts
 * (see google-auth.emulator.test.ts), so the callable's verified token carries a verified email the
 * way a real Google sign-in's does (TASK-78). Each person is new, so invites from other tests never
 * match them.
 */
async function googleGateway(label: string, opts: { verified?: boolean } = {}): Promise<{ client: EmulatorClient; gateway: FirebaseKitchenGateway; email: string }> {
  const client = createEmulatorClient(label);
  const sub = `${label}-${Date.now()}-${++counter}`;
  const email = `${sub}@example.com`;
  const token = JSON.stringify({ sub, email, email_verified: opts.verified ?? true, name: label });
  await new GoogleAuth(asSdk<AuthFns>(client.authFns), client.auth, async () => token).signInWithGoogle();
  return { client, gateway: gatewayFor(client), email };
}

// The same suite the fake and the Admin SDK's own provider pass (R29), now through the real Cloud
// Functions, over HTTP, in the Functions emulator - the only layer that proves the onCall wrapper
// itself (auth enforcement, reading the verified email off the token, HttpsError mapping), not just
// the transaction logic inside it (that's packages/providers-server's own emulator test).
kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = await googleGateway('fkg-owner');
  const partner = await googleGateway('fkg-partner');
  const stranger = await googleGateway('fkg-stranger');
  return {
    owner: owner.gateway,
    partner: partner.gateway,
    stranger: stranger.gateway,
    ownerEmail: owner.email,
    partnerEmail: partner.email.toUpperCase(),
    strangerEmail: stranger.email,
    async dispose() {
      await Promise.all([owner.client.dispose(), partner.client.dispose(), stranger.client.dispose()]);
    },
  };
});

describe('FirebaseKitchenGateway: only a verified email is matched (TASK-78)', () => {
  it('offers nothing to, and refuses, a sign-in whose email is not verified, even when it is the invited address', async () => {
    const owner = await googleGateway('fkg-v-owner');
    const unverified = await googleGateway('fkg-v-partner', { verified: false });
    try {
      const { kitchenId } = await owner.gateway.createKitchen('Our kitchen', 'UTC');
      await owner.gateway.inviteByEmail(kitchenId, unverified.email);
      expect(await unverified.gateway.invitesForMe()).toEqual([]);
      expect(await unverified.gateway.acceptInvite(kitchenId)).toEqual({ kind: 'rejected', reason: 'not-found' });
    } finally {
      await Promise.all([owner.client.dispose(), unverified.client.dispose()]);
    }
  });

  it('offers nothing to an anonymous sign-in, which has no email at all', async () => {
    await ensureSeeded();
    const client = createEmulatorClient('fkg-anon-offers');
    try {
      await client.authFns.signInAnonymously(client.auth);
      expect(await gatewayFor(client).invitesForMe()).toEqual([]);
    } finally {
      await client.dispose();
    }
  });
});

describe('FirebaseKitchenGateway: unauthenticated calls', () => {
  it('rejects createKitchen with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon');
    try {
      await expect(gatewayFor(client).createKitchen('Our kitchen', 'America/New_York')).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('rejects acceptInvite with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon-join');
    try {
      await expect(gatewayFor(client).acceptInvite('some-kitchen-id')).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('rejects findMyKitchen with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon-find');
    try {
      await expect(gatewayFor(client).findMyKitchen()).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('getKitchen answers null rather than throwing, unlike the others - a direct Firestore read, not a function call, and the rule denies a signed-out read the same way it denies a non-member one (R4)', async () => {
    const client = createEmulatorClient('fkg-anon-get');
    try {
      await expect(gatewayFor(client).getKitchen('some-kitchen-id')).resolves.toBeNull();
    } finally {
      await client.dispose();
    }
  });
});

describe('FirebaseKitchenGateway: real display names (R4)', () => {
  it('getKitchen returns the members own names from their ID tokens, not a fallback', async () => {
    const alex = await googleGateway('Alex');
    const sam = await googleGateway('Sam');
    try {
      const created = await alex.gateway.createKitchen('Our kitchen', 'America/New_York');
      await alex.gateway.inviteByEmail(created.kitchenId, sam.email);
      expect(await sam.gateway.invitesForMe()).toEqual([{ kitchenId: created.kitchenId, kitchen: 'Our kitchen', inviter: 'Alex' }]);
      await sam.gateway.acceptInvite(created.kitchenId);

      const details = await alex.gateway.getKitchen(created.kitchenId);
      expect(details?.name).toBe('Our kitchen');
      expect(details?.members.map((m) => m.name).sort()).toEqual(['Alex', 'Sam']);
    } finally {
      await Promise.all([alex.client.dispose(), sam.client.dispose()]);
    }
  });
});
