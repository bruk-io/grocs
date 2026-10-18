// Seeds a running Firebase emulator suite. Refuses to run unless the emulator
// environment variables are set, so it can never write to a real project (R52).
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { DEMO_PROJECT, seedKitchen, seedUsers } from './data.ts';

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

  for (const u of seedUsers) {
    try {
      await auth.getUser(u.uid);
      await auth.updateUser(u.uid, { email: u.email, password: u.password, displayName: u.displayName });
    } catch {
      await auth.createUser({ uid: u.uid, email: u.email, password: u.password, displayName: u.displayName });
    }
  }
  await db.doc(`kitchens/${seedKitchen.id}`).set({ name: seedKitchen.name, members: [...seedKitchen.members] });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await seed();
  console.log('Seeded the emulators with 2 users and 1 kitchen.');
}
