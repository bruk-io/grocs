import type { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'Grocs',
  slug: 'grocs',
  version: '0.0.1',
  scheme: 'grocs',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  plugins: ['expo-router', '@react-native-firebase/app', '@react-native-firebase/auth'],
  ios: {
    bundleIdentifier: 'io.bruk.grocs.dev',
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST_PATH,
  },
  android: {
    package: 'io.bruk.grocs.dev',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON_PATH,
  },
  web: { bundler: 'metro' },
});
