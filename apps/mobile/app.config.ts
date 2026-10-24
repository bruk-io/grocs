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

export default (): ExpoConfig => ({
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
