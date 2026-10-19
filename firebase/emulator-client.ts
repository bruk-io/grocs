// Test kit for the emulator suites: a Firebase web SDK client wired to the emulators, standing in
// for the native SDK (which cannot run in Node), and helpers that create kitchens through the
// Admin SDK, which bypasses the security rules. Used only by *.emulator.test.ts files (R49, R52).
import { deleteApp, initializeApp } from 'firebase/app';
import * as authSdk from 'firebase/auth';
import * as firestoreSdk from 'firebase/firestore';
import * as functionsSdk from 'firebase/functions';
import { getApps as getAdminApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { DEMO_PROJECT, seedUsers } from './seed/data.ts';
import { seed } from './seed/seed.ts';

let counter = 0;

function hostAndPort(envName: string): { host: string; port: number } {
  const value = process.env[envName];
  if (!value) throw new Error(`${envName} is not set. Run emulator tests with "pnpm test:emulator" so the emulators are running (R52).`);
  const [host, port] = value.split(':');
  return { host: host ?? '127.0.0.1', port: Number(port) };
}

export interface EmulatorClient {
  readonly db: firestoreSdk.Firestore;
  readonly auth: authSdk.Auth;
  readonly functions: functionsSdk.Functions;
  readonly firestoreFns: typeof firestoreSdk;
  readonly authFns: typeof authSdk;
  readonly functionsFns: typeof functionsSdk;
  dispose(): Promise<void>;
}

/**
 * The Functions emulator's port, pinned in firebase.json (unlike Firestore and Auth, the CLI sets
 * no FIREBASE_FUNCTIONS_EMULATOR_HOST-style variable a client SDK can discover at runtime, so the
 * pinned port is the only source of truth here too).
 */
const FUNCTIONS_EMULATOR_PORT = 5001;

/** A separate client (own app, own session), as one phone would be. */
export function createEmulatorClient(label = 'client'): EmulatorClient {
  const app = initializeApp({ projectId: DEMO_PROJECT, apiKey: 'demo-api-key' }, `${label}-${++counter}-${Date.now()}`);
  const fs = hostAndPort('FIRESTORE_EMULATOR_HOST');
  const au = hostAndPort('FIREBASE_AUTH_EMULATOR_HOST');
  const db = firestoreSdk.initializeFirestore(app, { experimentalForceLongPolling: false });
  firestoreSdk.connectFirestoreEmulator(db, fs.host, fs.port);
  const auth = authSdk.getAuth(app);
  authSdk.connectAuthEmulator(auth, `http://${au.host}:${au.port}`, { disableWarnings: true });
  const functions = functionsSdk.getFunctions(app);
  functionsSdk.connectFunctionsEmulator(functions, '127.0.0.1', FUNCTIONS_EMULATOR_PORT);
  return {
    db,
    auth,
    functions,
    firestoreFns: firestoreSdk,
    authFns: authSdk,
    functionsFns: functionsSdk,
    async dispose() {
      await firestoreSdk.terminate(db);
      await deleteApp(app);
    },
  };
}

let seeded = false;
/** Make sure the seed users exist (idempotent). */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  await seed();
  seeded = true;
}

export const seedAccount = {
  bruk: { ...seedUsers[0] },
  sam: { ...seedUsers[1] },
};

function adminDb() {
  const app = getAdminApps()[0] ?? initializeAdminApp({ projectId: DEMO_PROJECT });
  return getAdminFirestore(app);
}

/** The Admin SDK's Firestore instance, for provider tests that exercise the Admin SDK directly. */
export function adminFirestore(): ReturnType<typeof getAdminFirestore> {
  return adminDb();
}

/** A new kitchen with both seed members, and nothing in it. */
export async function createKitchen(prefix = 'kitchen'): Promise<string> {
  await ensureSeeded();
  const id = `${prefix}-${Date.now()}-${++counter}`;
  await adminDb().doc(`kitchens/${id}`).set({ name: id, members: seedUsers.map((u) => u.uid) });
  return id;
}

/** Read a stored document as the rules-bypassing Admin SDK sees it. */
export async function readRaw(path: string): Promise<unknown> {
  const snap = await adminDb().doc(path).get();
  return snap.exists ? snap.data() : undefined;
}

/** Write a document the rules-bypassing way, for tests that need data the app would never write. */
export async function writeRaw(path: string, data: Record<string, unknown>): Promise<void> {
  await adminDb().doc(path).set(data);
}
