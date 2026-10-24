// The phones' composition root: native Firebase, device providers, and in development builds the
// emulators and the test sign-in. This is the only file that imports the native SDK for the providers (R26).
import * as nativeAuth from '@react-native-firebase/auth';
import * as nativeFirestore from '@react-native-firebase/firestore';
import * as nativeFunctions from '@react-native-firebase/functions';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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

/** What the demo variant adds: a way in with no account, and the kitchen it opens on (decision-12). */
export interface DemoAccess {
  readonly kitchenId: string;
  readonly signIn: () => Promise<void>;
}

export interface NativeApp {
  readonly app: App;
  /**
   * True in a development build, false in release and in the demo variant. No account or sign-in
   * capability rides on this - just the one thing it's for: gating dev-only routes like
   * /groceries-samples out of anything that ships.
   */
  readonly isDevBuild: boolean;
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
 * Read once, not per call: GoogleSignin.configure() only needs to run once, and an absent value
 * (misconfigured build) should fail the first sign-in attempt with a clear native error rather than
 * silently skip configure() and fail with a less obvious one.
 */
const GOOGLE_WEB_CLIENT_ID = process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'];

/** The real native Google picker (@react-native-google-signin/google-signin), TASK-1.15. */
async function getGoogleIdToken(): Promise<string> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') throw new Error('Google sign-in was cancelled');
  const { idToken } = response.data;
  if (!idToken) throw new Error('Google sign-in did not return an ID token');
  return idToken;
}

export function createNativeApp(): NativeApp {
  if (GOOGLE_WEB_CLIENT_ID) GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  const dev = loadDevTools();
  // Whether this build is a dev build and whether it talks to local emulators are different
  // questions: __DEV__ only gates dev-only code out of release bundles (R53, R64). Default to
  // emulators (the documented `pnpm emulators` workflow) so existing dev builds are unaffected;
  // EXPO_PUBLIC_USE_EMULATORS=false points a dev build at the live Firebase project instead, on
  // either platform, to test real sign-in and sync without the local emulator stack.
  // connectEmulators() returns the FunctionsFns to call through instead of the real module (DRAFT-21:
  // a plain useEmulator() call is not enough for Functions, only for Auth/Firestore - see its own
  // comment). The instance value accompanying it is unused by that FunctionsFns, which closes over
  // its own; passing the real one through anyway keeps the field non-optional.
  const useEmulators = process.env['EXPO_PUBLIC_USE_EMULATORS'] !== 'false';
  const devFunctionsFns = useEmulators ? dev?.connectEmulators() : undefined;

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
      functions: { fns: devFunctionsFns ?? asSdk<FunctionsFns>(nativeFunctions), instance: nativeFunctions.getFunctions() },
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
    isDevBuild: dev !== null,
    demo: null,
    diagnostics: () => diagnosticsText(build, buffer ? buffer.dump() : 'development build: log records go to the console'),
    signInWithGoogle: () => googleAuth.signInWithGoogle(),
  };
}
