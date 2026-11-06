import type { ExpoConfig } from 'expo/config';

/**
 * APP_VARIANT=demo builds the demo: its own id and name, so it installs beside a real build, and
 * none of the Firebase config plugins or google-services files, since the demo runs on the
 * in-memory provider and talks to nothing (decision-12). Pair it with EXPO_PUBLIC_APP_VARIANT=demo,
 * which the bundler reads to choose the demo composition (src/composition/create-app.ts).
 */
const demo = process.env['APP_VARIANT'] === 'demo';

/**
 * Edge to edge (TASK-39): the app draws under the status bar and the navigation bar on Android, and its
 * screens depend on the safe-area insets (DeviceSafeArea) to stay clear of them. There is no setting to
 * write for it: Expo SDK 58 removed `android.edgeToEdgeEnabled` (the prebuild plugin warns it is "no longer
 * available - Android 16 makes edge-to-edge mandatory"), and React Native 0.88 turns it on by itself when
 * the app targets SDK 35 or later (WindowUtil.kt, updateEdgeToEdgeFeatureFlag). So this file states it by
 * not setting it, and app-config.test.ts fails if `edgeToEdgeEnabled` is added.
 */

/**
 * The real build's Google sign-in needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID inlined into its bundle, and an
 * EAS build bundles on EAS's worker, so the value has to be in the build profile's EAS environment
 * (`eas env:list <environment>`), not in a local shell. Build 8 shipped without it and crashed on
 * Continue with Google (TASK-53), so an EAS build of the real variant stops here instead.
 */
export function assertSignInConfigured(env: Readonly<Record<string, string | undefined>>): void {
  if (env['APP_VARIANT'] === 'demo' || env['EAS_BUILD'] !== 'true' || env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID']) return;
  throw new Error(
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set for this EAS build. Without it GoogleSignin.configure() never runs and ' +
      'Continue with Google crashes the iOS app (TASK-53). Set it in the build profile\'s EAS environment: ' +
      'eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --visibility plaintext --environment <env> --value <the client_type 3 web client from google-services.json>.',
  );
}

export default (): ExpoConfig => {
  assertSignInConfigured(process.env);
  return config();
};

const config = (): ExpoConfig => ({
  name: demo ? 'Grocs Demo' : 'Grocs',
  slug: 'grocs',
  version: '0.0.1',
  scheme: demo ? 'grocs-demo' : 'grocs',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  plugins: demo
    ? ['expo-router']
    : [
        'expo-router',
        ['@react-native-firebase/app', { ios: { disableSPM: true } }],
        '@react-native-firebase/auth',
        ['expo-build-properties', { ios: { useFrameworks: 'dynamic' } }],
        './plugins/withFirebaseConfigure.cjs',
        // Reads the iOS URL scheme from GoogleService-Info.plist (the real build's own, injected at
        // build time - R51, R52), no options needed (TASK-1.15).
        '@react-native-google-signin/google-signin',
      ],
  ios: {
    bundleIdentifier: demo ? 'io.bruk.grocs.demo' : 'io.bruk.grocs.dev',
    ...(demo || !process.env['GOOGLE_SERVICE_INFO_PLIST_PATH'] ? {} : { googleServicesFile: process.env['GOOGLE_SERVICE_INFO_PLIST_PATH'] }),
    // Neither variant does its own cryptography; Firebase's own use of standard, exempt
    // encryption (TLS) is all either build ships. Declaring it here skips the App Store
    // Connect/EAS export-compliance prompt on every submission.
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: demo ? 'io.bruk.grocs.demo' : 'io.bruk.grocs.dev',
    ...(demo || !process.env['GOOGLE_SERVICES_JSON_PATH'] ? {} : { googleServicesFile: process.env['GOOGLE_SERVICES_JSON_PATH'] }),
  },
  web: { bundler: 'metro' },
  owner: 'bruk.habtu',
  ...(process.env['EAS_PROJECT_ID'] ? { extra: { eas: { projectId: process.env['EAS_PROJECT_ID'] } } } : {}),
});
