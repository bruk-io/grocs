import type { ExpoConfig } from 'expo/config';

/**
 * APP_VARIANT=demo builds the demo: its own id and name, so it installs beside a real build, and
 * none of the Firebase config plugins or google-services files, since the demo runs on the
 * in-memory provider and talks to nothing (decision-12). Pair it with EXPO_PUBLIC_APP_VARIANT=demo,
 * which the bundler reads to choose the demo composition (src/composition/create-app.ts).
 */
const demo = process.env['APP_VARIANT'] === 'demo';

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
        './plugins/withFirebaseConfigure.js',
      ],
  ios: {
    bundleIdentifier: demo ? 'io.bruk.grocs.demo' : 'io.bruk.grocs.dev',
    ...(demo || !process.env['GOOGLE_SERVICE_INFO_PLIST_PATH'] ? {} : { googleServicesFile: process.env['GOOGLE_SERVICE_INFO_PLIST_PATH'] }),
  },
  android: {
    package: demo ? 'io.bruk.grocs.demo' : 'io.bruk.grocs.dev',
    ...(demo || !process.env['GOOGLE_SERVICES_JSON_PATH'] ? {} : { googleServicesFile: process.env['GOOGLE_SERVICES_JSON_PATH'] }),
  },
  web: { bundler: 'metro' },
});
