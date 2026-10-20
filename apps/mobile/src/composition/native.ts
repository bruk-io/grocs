// The phones' composition root: native Firebase, device providers, and in development builds the
// emulators and the test sign-in. This is the only file that imports the native SDK for the providers (R26).
import * as nativeAuth from '@react-native-firebase/auth';
import * as nativeFirestore from '@react-native-firebase/firestore';
import * as nativeFunctions from '@react-native-firebase/functions';
import { setStringAsync } from 'expo-clipboard';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BufferLogger, ConsoleLogger, RandomIds, SystemClock } from '@grocs/providers-device';
import { GoogleAuth, asSdk } from '@grocs/providers-firebase';
import type { AuthFns, FirestoreFns, FunctionsFns } from '@grocs/providers-firebase';
import type { GoogleSignIn, Logger } from '@grocs/ports';
import type { App } from './compose-app.ts';
import { composeFirebaseApp } from './compose-firebase.ts';
import { diagnosticsText } from './diagnostics.ts';
import { loadDevTools } from './load-dev.ts';
import { installObservers } from './observe.ts';

export interface DevAccess {
  readonly kitchenId: string;
  readonly accounts: readonly { label: string; email: string; password: string }[];
  readonly signIn: (email: string, password: string) => Promise<void>;
}

/** What the demo variant adds: a way in with no account, and the kitchen it opens on (decision-12). */
export interface DemoAccess {
  readonly kitchenId: string;
  readonly signIn: () => Promise<void>;
}

export interface NativeApp {
  readonly app: App;
  /** Null in release builds. */
  readonly dev: DevAccess | null;
  /** Null in every build but the demo variant. */
  readonly demo: DemoAccess | null;
  /**
   * The text the diagnostics action copies (R35): a header line, then the on-phone buffer's records. Release
   * builds keep the buffer; development builds log to the console, so theirs is the header and a note.
   */
  readonly diagnostics: () => string;
  /** Google sign-in produces no domain event, so it is wired here directly, not through the command dispatcher. */
  readonly signInWithGoogle: GoogleSignIn['signInWithGoogle'];
}

/**
 * The native Google picker (@react-native-google-signin/google-signin) is not wired yet - that
 * library, its Expo config plugin, and any native build issues are TASK-1.15's job to find. This
 * stub keeps the port and provider plumbing real and testable now, without getting ahead of that
 * device spike.
 */
async function getGoogleIdToken(): Promise<string> {
  throw new Error('not implemented - see TASK-1.15');
}

export function createNativeApp(): NativeApp {
  const dev = loadDevTools();
  dev?.connectEmulators();

  const authFns = asSdk<AuthFns>(nativeAuth);
  const authInstance = nativeAuth.getAuth();
  const buffer = dev ? null : new BufferLogger();
  const logger: Logger = buffer ?? new ConsoleLogger();
  const build = {
    appVersion: Constants.expoConfig?.version ?? '0.0.0',
    platform: Platform.OS,
    build: Constants.expoConfig?.ios?.buildNumber ?? String(Constants.expoConfig?.android?.versionCode ?? 'unknown'),
  };

  // The global handlers go in before anything renders, and only here (R33).
  installObservers({ logger, clock: new SystemClock(), ids: new RandomIds() });

  const app = composeFirebaseApp({
    firebase: {
      firestore: asSdk<FirestoreFns>(nativeFirestore),
      auth: authFns,
      db: nativeFirestore.getFirestore(),
      authInstance,
      functions: { fns: asSdk<FunctionsFns>(nativeFunctions), instance: nativeFunctions.getFunctions() },
    },
    logger,
    copyText: async (text) => {
      await setStringAsync(text);
    },
    runtime: {
      appVersion: build.appVersion,
      platform: build.platform,
      kitchenRole: 'member',
    },
  });

  const googleAuth = new GoogleAuth(authFns, authInstance, getGoogleIdToken);

  return {
    app,
    dev: dev
      ? { kitchenId: dev.kitchenId, accounts: dev.accounts, signIn: dev.signInFunction(authFns, authInstance) }
      : null,
    demo: null,
    diagnostics: () => diagnosticsText(build, buffer ? buffer.dump() : 'development build: log records go to the console'),
    signInWithGoogle: () => googleAuth.signInWithGoogle(),
  };
}
