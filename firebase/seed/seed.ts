// Seeds a running Firebase emulator suite. Refuses to run unless the emulator
// environment variables are set, so it can never write to a real project (R52).
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { addMember, createKitchen } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import { DEMO_PROJECT, inviteSeedUsers, seedAccounts, seedKitchen, seedOpenKitchen, seedUsers } from './data.ts';

export async function seed(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const firestoreHost = env['FIRESTORE_EMULATOR_HOST'];
  const authHost = env['FIREBASE_AUTH_EMULATOR_HOST'];
  if (!firestoreHost || !authHost) {
    throw new Error('Seeding only runs against the emulators: set FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST (R52: no production data).');
  }
  process.env['FIRESTORE_EMULATOR_HOST'] = firestoreHost;
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = authHost;
  const app = getApps()[0] ?? initializeApp({ projectId: DEMO_PROJECT });
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const u of seedAccounts) {
    await createOrGetUser(auth, u);
  }
  // What findMyKitchen reads (providers-server's kitchen-store): without the memberships the seed
  // accounts sign in to the kitchen setup screen instead of their kitchen (found by the TASK-62 flows).
  for (const kitchen of [seedKitchenDoc(), seedOpenKitchenDoc()]) {
    await db.doc(`kitchens/${kitchen.id}`).set(kitchen);
    for (const uid of kitchen.members) await db.doc(`memberships/${uid}`).set({ kitchenId: kitchen.id });
  }
  // Pat starts with no kitchen on every seed, so the invite flow can join Jo's kitchen again (TASK-56).
  await db.doc(`memberships/${inviteSeedUsers[1].uid}`).delete();
}

/** A seed kitchen as the app itself writes one: core's createKitchen for the first member, then each other member added. */
function kitchenDoc(id: string, name: string, people: readonly { readonly uid: string; readonly displayName: string }[]): Kitchen {
  const [owner, ...others] = people;
  if (!owner) throw new Error(`seed kitchen ${id} has no members`);
  const made = createKitchen({ id, name, timeZone: 'UTC', ownerUid: owner.uid, ownerName: owner.displayName, createdAt: 0 });
  if (!made.ok) throw new Error(`seed kitchen is invalid: ${made.error}`);
  return others.reduce<Kitchen>((kitchen, u) => {
    const joined = addMember(kitchen, u.uid, u.displayName);
    if (!joined.ok) throw new Error(`seed member ${u.uid} cannot join: ${joined.error}`);
    return joined.value;
  }, made.value);
}

/** Alex and Sam's kitchen, full. */
export function seedKitchenDoc(): Kitchen {
  return kitchenDoc(seedKitchen.id, seedKitchen.name, seedUsers);
}

/** Jo's kitchen, with room for a partner. */
export function seedOpenKitchenDoc(): Kitchen {
  return kitchenDoc(seedOpenKitchen.id, seedOpenKitchen.name, inviteSeedUsers.filter((u) => (seedOpenKitchen.members as readonly string[]).includes(u.uid)));
}

type SeedUser = (typeof seedAccounts)[number];
type Auth = ReturnType<typeof getAuth>;

// Creates the user, or returns the one that already exists. Emulator test files
// run in parallel workers that each seed, so checking for the user and then
// creating it races: two workers both see it missing and the second create fails.
// Creating first and treating "already exists" as success has no such gap. The
// Admin SDK reports that case only as an error, so that one code is handled; any
// other error is rethrown.
async function createOrGetUser(auth: Auth, u: SeedUser): Promise<Awaited<ReturnType<Auth['getUser']>>> {
  try {
    return await auth.createUser({ uid: u.uid, email: u.email, password: u.password, displayName: u.displayName });
  } catch (error) {
    if (!isAlreadyExists(error)) throw error;
    return auth.getUser(u.uid);
  }
}

function isAlreadyExists(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 'auth/uid-already-exists' || code === 'auth/email-already-exists';
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await seed();
  console.log('Seeded the emulators with 2 users and 1 kitchen.');
}
