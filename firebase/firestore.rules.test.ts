// Allow and deny tests for firebase/firestore.rules (R4, R49): each rule gets at least one request
// that must succeed and one that must be denied. Kitchen creation and joining write through the
// Admin SDK inside the createKitchen/joinKitchen functions (R2, R3), which these rules do not
// govern (the Admin SDK bypasses rules) - what these rules protect is reading and writing a
// kitchen's data once it exists.
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { DEMO_PROJECT } from './seed/data.ts';

function hostAndPort(envName: string): { host: string; port: number } {
  const value = process.env[envName];
  if (!value) throw new Error(`${envName} is not set. Run rules tests with "pnpm test:emulator" so the emulators are running (R52).`);
  const [host, port] = value.split(':');
  return { host: host ?? '127.0.0.1', port: Number(port) };
}

let testEnv: RulesTestEnvironment;

beforeEach(async () => {
  const fs = hostAndPort('FIRESTORE_EMULATOR_HOST');
  testEnv = await initializeTestEnvironment({
    projectId: DEMO_PROJECT,
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8'), host: fs.host, port: fs.port },
  });
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

/** A kitchen with two members, written the rules-bypassing way (as createKitchen's transaction would). */
async function seedKitchen(kitchenId: string, members: readonly string[]): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `kitchens/${kitchenId}`), { schemaVersion: 1, name: 'Our kitchen', members, timeZone: 'America/New_York', createdAt: 1 });
  });
}

describe('kitchens/{kitchenId} (R4)', () => {
  it('a member can read their kitchen', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const bruk = testEnv.authenticatedContext('bruk');
    await assertSucceeds(getDoc(doc(bruk.firestore(), 'kitchens/k1')));
  });

  it('a non-member cannot read someone else\'s kitchen', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1')));
  });

  it('a signed-out request cannot read a kitchen', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'kitchens/k1')));
  });

  it('a member cannot write their kitchen directly - creating and joining go through the functions (R2, R3)', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const bruk = testEnv.authenticatedContext('bruk');
    await assertFails(updateDoc(doc(bruk.firestore(), 'kitchens/k1'), { name: 'Renamed' }));
  });

  it('no one can create a kitchen document directly', async () => {
    const bruk = testEnv.authenticatedContext('bruk');
    await assertFails(setDoc(doc(bruk.firestore(), 'kitchens/k2'), { schemaVersion: 1, name: 'New', members: ['bruk'], timeZone: 'UTC', createdAt: 1 }));
  });
});

describe('kitchens/{kitchenId}/{document=**} (R4)', () => {
  it('a member can read and write a document under their kitchen', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const bruk = testEnv.authenticatedContext('bruk');
    await assertSucceeds(setDoc(doc(bruk.firestore(), 'kitchens/k1/weeks/2026-W43'), { note: 'test' }));
    await assertSucceeds(getDoc(doc(bruk.firestore(), 'kitchens/k1/weeks/2026-W43')));
  });

  it('a non-member cannot read or write under a kitchen they do not belong to', async () => {
    await seedKitchen('k1', ['bruk', 'sam']);
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1/weeks/2026-W43')));
    await assertFails(setDoc(doc(carl.firestore(), 'kitchens/k1/weeks/2026-W43'), { note: 'intruding' }));
  });

  it('a non-member cannot write under a kitchen that does not exist either (no membership to check)', async () => {
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(setDoc(doc(carl.firestore(), 'kitchens/no-such-kitchen/weeks/2026-W43'), { note: 'test' }));
  });
});
