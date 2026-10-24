// Development builds only (R53, R64). Nothing outside src/dev may import this file except through
// src/composition/load-dev.ts, which loads it under `if (__DEV__)` so that release bundles drop it.
// The check `release-bundle` fails the build if a release bundle still contains it.
import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import { getFunctions, httpsCallableFromUrl } from '@react-native-firebase/functions';
import { Platform } from 'react-native';
import type { FunctionsFns } from '@grocs/providers-firebase';
import { DEMO_PROJECT } from '../../../../firebase/seed/data.ts';

/** A string no release bundle may contain. */
export const DEV_TOOLS_MARKER = 'grocs-dev-tools-marker';

/** Where the emulators run, as the phone sees them: the Android emulator reaches the host at 10.0.2.2. */
function emulatorHost(): string {
  return process.env['EXPO_PUBLIC_EMULATOR_HOST'] ?? (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');
}

export const devTools = {
  marker: DEV_TOOLS_MARKER,

  /**
   * Point the native SDK at the local emulators. Call before the first read or write. Returns the
   * FunctionsFns to use in place of the real module: useEmulator() alone is not enough for Functions,
   * because its callable URLs are built from the app's real project id (from google-services.json,
   * since RNFirebase has no runtime project override), which does not match the emulator's
   * "demo-grocs" - every call fails with "not-found" and never reaches the emulator at all, even
   * though Auth and Firestore (host:port only, no project id in the URL) connect fine (DRAFT-21).
   * getFunctions()'s customDomain parameter looks like the fix on paper but the native Android module
   * does not honor it (tried first; still "not-found"). httpsCallableFromUrl, which takes the literal
   * URL, does work, so every call here is built against the emulator's own project id explicitly.
   */
  connectEmulators(): FunctionsFns {
    const host = emulatorHost();
    connectFirestoreEmulator(getFirestore(), host, 8080);
    connectAuthEmulator(getAuth(), `http://${host}:9099`);
    const instance = getFunctions();
    return {
      httpsCallable: <Req, Res>(_instance: unknown, name: string) => {
        const call = httpsCallableFromUrl<Req, Res>(instance, `http://${host}:5001/${DEMO_PROJECT}/us-central1/${name}`);
        return async (data: Req): Promise<{ readonly data: Res }> => call(data);
      },
    };
  },
};

export type DevTools = typeof devTools;
