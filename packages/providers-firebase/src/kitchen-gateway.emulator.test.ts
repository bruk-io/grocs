import { kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded, seedAccount } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { FirebaseKitchenGateway } from './kitchen-gateway.ts';
import { asSdk } from './sdk.ts';
import type { FirestoreFns, FunctionsFns } from './sdk.ts';

function gatewayFor(client: EmulatorClient): FirebaseKitchenGateway {
  const fns = asSdk<FunctionsFns>(client.functionsFns);
  const fs = asSdk<FirestoreFns>(client.firestoreFns);
  return new FirebaseKitchenGateway(fns, client.functions, fs, client.db);
}

async function anonymousGateway(label: string): Promise<{ client: EmulatorClient; gateway: FirebaseKitchenGateway }> {
  await ensureSeeded();
  const client = createEmulatorClient(label);
  await client.authFns.signInAnonymously(client.auth);
  return { client, gateway: gatewayFor(client) };
}

// The same suite the fake and the Admin SDK's own provider pass (R29), now through the real
// createKitchen/joinKitchen Cloud Functions, over HTTP, in the Functions emulator - the only layer
// that proves the onCall wrapper itself (auth enforcement, HttpsError mapping), not just the
// transaction logic inside it (that's packages/providers-server's own emulator test).
kitchenGatewayContract({ describe, it, expect }, async () => {
  const owner = await anonymousGateway('fkg-owner');
  const partner = await anonymousGateway('fkg-partner');
  const stranger = await anonymousGateway('fkg-stranger');
  return {
    owner: owner.gateway,
    partner: partner.gateway,
    stranger: stranger.gateway,
    async dispose() {
      await Promise.all([owner.client.dispose(), partner.client.dispose(), stranger.client.dispose()]);
    },
  };
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

  it('rejects joinKitchen with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon-join');
    try {
      await expect(gatewayFor(client).joinKitchen('MOREL-0024')).rejects.toThrow();
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
  it('getKitchen returns the signed-in members own names from their ID tokens, not a fallback', async () => {
    await ensureSeeded();
    const alex = createEmulatorClient('fkg-names-alex');
    const sam = createEmulatorClient('fkg-names-sam');
    try {
      await alex.authFns.signInWithEmailAndPassword(alex.auth, seedAccount.alex.email, seedAccount.alex.password);
      await sam.authFns.signInWithEmailAndPassword(sam.auth, seedAccount.sam.email, seedAccount.sam.password);
      const created = await gatewayFor(alex).createKitchen('Our kitchen', 'America/New_York');
      await gatewayFor(sam).joinKitchen(created.inviteCode);

      const details = await gatewayFor(alex).getKitchen(created.kitchenId);
      expect(details?.name).toBe('Our kitchen');
      expect(details?.members.map((m) => m.name).sort()).toEqual(['Alex', 'Sam']);
    } finally {
      await Promise.all([alex.dispose(), sam.dispose()]);
    }
  });
});
