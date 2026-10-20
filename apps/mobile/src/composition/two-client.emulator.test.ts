// Two clients, each composed the way the phones are, against the Firestore and Auth emulators (R49, R50).
// The providers take the Firebase modular API by injection, so the web SDK stands in for the native
// SDK here. What this does not exercise is the native module itself (see the TASK-1.4 notes).
import type { AddItem } from '@grocs/application';
import { weekIdFor } from '@grocs/core';
import type { Item } from '@grocs/core';
import { FirebaseAuth } from '@grocs/providers-firebase';
import { asSdk } from '@grocs/providers-firebase';
import type { AuthFns } from '@grocs/providers-firebase';
import type { LogRecord, Logger } from '@grocs/ports';
import { eventually, testSignInContract } from '@grocs/ports/testing';
import { afterAll, describe, expect, it } from 'vitest';
import { createEmulatorClient, createKitchen, ensureSeeded, seedAccount } from '../../../../firebase/emulator-client.ts';
import type { EmulatorClient } from '../../../../firebase/emulator-client.ts';
import { FirebaseTestSignIn } from '../dev/test-sign-in.ts';
import type { App } from './compose-app.ts';
import { FakeClipboard } from '../../testing/fake-clipboard.ts';
import { composeFirebaseApp } from './compose-firebase.ts';

const SYNC_BUDGET_MS = 3000;
const clients: EmulatorClient[] = [];
afterAll(async () => {
  await Promise.all(clients.map((c) => c.dispose()));
});

/** Keeps records exactly as the instrumentation emitted them, with no redaction of its own, so the test sees what the instrumentation logs. */
class RawLogger implements Logger {
  readonly records: LogRecord[] = [];
  log(record: LogRecord): void {
    this.records.push(record);
  }
}

async function signedInClient(who: 'bruk' | 'sam'): Promise<{ app: App; logger: RawLogger }> {
  await ensureSeeded();
  const client = createEmulatorClient(who);
  clients.push(client);
  const { email, password } = seedAccount[who];
  await client.authFns.signInWithEmailAndPassword(client.auth, email, password);
  const logger = new RawLogger();
  const app = composeFirebaseApp({
    firebase: { firestore: client.firestoreFns, auth: client.authFns, db: client.db, authInstance: client.auth },
    logger,
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
    copyText: new FakeClipboard().copyText,
  });
  return { app, logger };
}

describe('two clients on one kitchen', () => {
  it('shows an item added on one phone on the other within 3 seconds, every time', async () => {
    const kitchenId = await createKitchen('two-client');
    const a = await signedInClient('bruk');
    const b = await signedInClient('sam');
    const weekId = weekIdFor(a.app.now());

    let seen: readonly Item[] = [];
    const stop = b.app.watchWeekItems(kitchenId, weekId, (items) => (seen = items));
    try {
      for (let round = 1; round <= 5; round++) {
        const name = `Oat milk ${round}`;
        const command: AddItem = { type: 'AddItem', kitchenId, weekId, name };
        const started = performance.now();
        const result = await a.app.dispatch(command);
        expect(result.ok).toBe(true);
        await eventually(() => expect(seen.map((i) => i.name.value)).toContain(name), SYNC_BUDGET_MS, 20);
        expect(performance.now() - started).toBeLessThan(SYNC_BUDGET_MS);
      }
      expect(seen).toHaveLength(5);
    } finally {
      stop();
    }
  });

  it('never writes an item name into a log record', async () => {
    const kitchenId = await createKitchen('log-redaction');
    const a = await signedInClient('bruk');
    const weekId = weekIdFor(a.app.now());
    const name = 'Secret saffron 42';
    const command: AddItem = { type: 'AddItem', kitchenId, weekId, name };
    expect((await a.app.dispatch(command)).ok).toBe(true);

    const records = a.logger.records;
    expect(records.length).toBeGreaterThan(0);
    expect(records.some((r) => JSON.stringify(r).includes('AddItem'))).toBe(true);
    expect(JSON.stringify(records)).not.toContain('saffron');
  });
});

// The dev-only sign-in passes the same contract as the in-memory fake (R29, R53).
testSignInContract({ describe, it, expect }, async () => {
  await ensureSeeded();
  const client = createEmulatorClient('test-sign-in');
  clients.push(client);
  const fns = asSdk<AuthFns>(client.authFns);
  const { email, password, uid } = seedAccount.bruk;
  return {
    testSignIn: new FirebaseTestSignIn(fns, client.auth),
    auth: new FirebaseAuth(fns, client.auth),
    account: { email, password, uid },
  };
});
