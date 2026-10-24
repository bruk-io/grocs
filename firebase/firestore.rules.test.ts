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
async function seedKitchen(kitchenId: string, members: readonly string[], memberNames: Record<string, string> = {}): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `kitchens/${kitchenId}`), { schemaVersion: 1, name: 'Our kitchen', members, memberNames, timeZone: 'America/New_York', createdAt: 1 });
  });
}

describe('kitchens/{kitchenId} (R4)', () => {
  it('a member can read their kitchen', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const alex = testEnv.authenticatedContext('alex');
    await assertSucceeds(getDoc(doc(alex.firestore(), 'kitchens/k1')));
  });

  it('a non-member cannot read someone else\'s kitchen', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1')));
  });

  it('a signed-out request cannot read a kitchen', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'kitchens/k1')));
  });

  it('a member cannot write their kitchen directly - creating and joining go through the functions (R2, R3)', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const alex = testEnv.authenticatedContext('alex');
    await assertFails(updateDoc(doc(alex.firestore(), 'kitchens/k1'), { name: 'Renamed' }));
  });

  it('no one can create a kitchen document directly', async () => {
    const alex = testEnv.authenticatedContext('alex');
    await assertFails(setDoc(doc(alex.firestore(), 'kitchens/k2'), { schemaVersion: 1, name: 'New', members: ['alex'], timeZone: 'UTC', createdAt: 1 }));
  });

  it('a member can read memberNames through the same rule - no new rule needed for TASK-27', async () => {
    await seedKitchen('k1', ['alex', 'sam'], { alex: 'Alex', sam: 'Sam' });
    const alex = testEnv.authenticatedContext('alex');
    const snap = await assertSucceeds(getDoc(doc(alex.firestore(), 'kitchens/k1')));
    expect(snap.data()?.['memberNames']).toEqual({ alex: 'Alex', sam: 'Sam' });
  });

  it('a non-member cannot read memberNames either - the same read that is already denied', async () => {
    await seedKitchen('k1', ['alex', 'sam'], { alex: 'Alex', sam: 'Sam' });
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1')));
  });
});

describe('kitchens/{kitchenId}/{document=**} (R4)', () => {
  it('a member can read and write a document under their kitchen', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const alex = testEnv.authenticatedContext('alex');
    await assertSucceeds(setDoc(doc(alex.firestore(), 'kitchens/k1/weeks/2026-W43'), { note: 'test' }));
    await assertSucceeds(getDoc(doc(alex.firestore(), 'kitchens/k1/weeks/2026-W43')));
  });

  it('a non-member cannot read or write under a kitchen they do not belong to', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1/weeks/2026-W43')));
    await assertFails(setDoc(doc(carl.firestore(), 'kitchens/k1/weeks/2026-W43'), { note: 'intruding' }));
  });

  it('a non-member cannot write under a kitchen that does not exist either (no membership to check)', async () => {
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(setDoc(doc(carl.firestore(), 'kitchens/no-such-kitchen/weeks/2026-W43'), { note: 'test' }));
  });
});

describe('kitchens/{kitchenId}/meals/{mealId} (R4, same rule as items)', () => {
  it('a member can read and write a meal in their kitchen', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const alex = testEnv.authenticatedContext('alex');
    await assertSucceeds(setDoc(doc(alex.firestore(), 'kitchens/k1/meals/m1'), { schemaVersion: 1, id: 'm1', name: { v: 'Tacos', at: 1, by: 'alex' } }));
    await assertSucceeds(getDoc(doc(alex.firestore(), 'kitchens/k1/meals/m1')));
  });

  it('a non-member cannot read or write a meal in a kitchen they do not belong to', async () => {
    await seedKitchen('k1', ['alex', 'sam']);
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'kitchens/k1/meals/m1')));
    await assertFails(setDoc(doc(carl.firestore(), 'kitchens/k1/meals/m1'), { schemaVersion: 1, id: 'm1', name: { v: 'Intruding', at: 1, by: 'carl' } }));
  });
});

describe('inviteCodes/{code} (R2, R3)', () => {
  it('no one can read an invite code directly - only the join function resolves one (default-deny, no match block)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'inviteCodes/MOREL-0024'), { kitchenId: 'k1', createdAt: 1, status: 'pending' });
    });
    const alex = testEnv.authenticatedContext('alex');
    await assertFails(getDoc(doc(alex.firestore(), 'inviteCodes/MOREL-0024')));
  });

  it('no one can write an invite code directly', async () => {
    const alex = testEnv.authenticatedContext('alex');
    await assertFails(setDoc(doc(alex.firestore(), 'inviteCodes/MOREL-0024'), { kitchenId: 'k1', createdAt: 1, status: 'pending' }));
  });
});

describe('memberships/{uid} (TASK-14)', () => {
  async function seedMembership(uid: string, kitchenId: string): Promise<void> {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `memberships/${uid}`), { kitchenId });
    });
  }

  it('a member can read their own membership', async () => {
    await seedMembership('alex', 'k1');
    const alex = testEnv.authenticatedContext('alex');
    await assertSucceeds(getDoc(doc(alex.firestore(), 'memberships/alex')));
  });

  it('a member cannot read someone else\'s membership', async () => {
    await seedMembership('alex', 'k1');
    const carl = testEnv.authenticatedContext('carl');
    await assertFails(getDoc(doc(carl.firestore(), 'memberships/alex')));
  });

  it('a signed-out request cannot read a membership', async () => {
    await seedMembership('alex', 'k1');
    const anon = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anon.firestore(), 'memberships/alex')));
  });

  it('no one can write a membership directly - only the server functions do', async () => {
    const alex = testEnv.authenticatedContext('alex');
    await assertFails(setDoc(doc(alex.firestore(), 'memberships/alex'), { kitchenId: 'k1' }));
  });
});
