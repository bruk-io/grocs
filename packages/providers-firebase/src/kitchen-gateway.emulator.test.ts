import { kitchenGatewayContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { createEmulatorClient, ensureSeeded } from '../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../firebase/emulator-client.ts';
import { FirebaseKitchenGateway } from './kitchen-gateway.ts';
import { asSdk } from './sdk.ts';
import type { FunctionsFns } from './sdk.ts';

async function anonymousGateway(label: string): Promise<{ client: EmulatorClient; gateway: FirebaseKitchenGateway }> {
  await ensureSeeded();
  const client = createEmulatorClient(label);
  await client.authFns.signInAnonymously(client.auth);
  const fns = asSdk<FunctionsFns>(client.functionsFns);
  return { client, gateway: new FirebaseKitchenGateway(fns, client.functions) };
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
      const fns = asSdk<FunctionsFns>(client.functionsFns);
      const gateway = new FirebaseKitchenGateway(fns, client.functions);
      await expect(gateway.createKitchen('Our kitchen', 'America/New_York')).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('rejects joinKitchen with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon-join');
    try {
      const fns = asSdk<FunctionsFns>(client.functionsFns);
      const gateway = new FirebaseKitchenGateway(fns, client.functions);
      await expect(gateway.joinKitchen('MOREL-0024')).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });

  it('rejects findMyKitchen with no one signed in', async () => {
    const client = createEmulatorClient('fkg-anon-find');
    try {
      const fns = asSdk<FunctionsFns>(client.functionsFns);
      const gateway = new FirebaseKitchenGateway(fns, client.functions);
      await expect(gateway.findMyKitchen()).rejects.toThrow();
    } finally {
      await client.dispose();
    }
  });
});
