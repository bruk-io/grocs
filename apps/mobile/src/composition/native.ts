// The phones' composition root: native Firebase, device providers, and in development builds the
// emulators and the test sign-in. This is the only file that imports the native SDK for the providers (R26).
import * as nativeAuth from '@react-native-firebase/auth';
import * as nativeFirestore from '@react-native-firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BufferLogger, ConsoleLogger } from '@grocs/providers-device';
import { asSdk } from '@grocs/providers-firebase';
import type { AuthFns, FirestoreFns } from '@grocs/providers-firebase';
import type { Logger } from '@grocs/ports';
import type { App } from './compose-app.ts';
import { composeFirebaseApp } from './compose-firebase.ts';
import { loadDevTools } from './load-dev.ts';

export interface DevAccess {
  readonly kitchenId: string;
  readonly accounts: readonly { label: string; email: string; password: string }[];
  readonly signIn: (email: string, password: string) => Promise<void>;
}

export interface NativeApp {
  readonly app: App;
  /** Null in release builds. */
  readonly dev: DevAccess | null;
  /** Release builds keep a bounded buffer of log records for the diagnostics action (R35). */
  readonly diagnostics: (() => string) | null;
}

export function createNativeApp(): NativeApp {
  const dev = loadDevTools();
  dev?.connectEmulators();

  const authFns = asSdk<AuthFns>(nativeAuth);
  const authInstance = nativeAuth.getAuth();
  const buffer = dev ? null : new BufferLogger();
  const logger: Logger = buffer ?? new ConsoleLogger();

  const app = composeFirebaseApp({
    firebase: {
      firestore: asSdk<FirestoreFns>(nativeFirestore),
      auth: authFns,
      db: nativeFirestore.getFirestore(),
      authInstance,
    },
    logger,
    runtime: {
      appVersion: Constants.expoConfig?.version ?? '0.0.0',
      platform: Platform.OS,
      kitchenRole: 'member',
    },
  });

  return {
    app,
    dev: dev
      ? { kitchenId: dev.kitchenId, accounts: dev.accounts, signIn: dev.signInFunction(authFns, authInstance) }
      : null,
    diagnostics: buffer ? () => buffer.dump() : null,
  };
}
