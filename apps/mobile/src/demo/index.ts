// The demo variant's entry point, reached only through src/composition/create-app.ts.
import { setStringAsync } from 'expo-clipboard';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ConsoleLogger } from '@grocs/providers-device';
import type { NativeApp } from '../composition/native.ts';
import { composeDemoApp } from './compose-demo.ts';

export function createDemoApp(): NativeApp {
  return composeDemoApp({
    logger: new ConsoleLogger(),
    copyText: async (text) => {
      await setStringAsync(text);
    },
    runtime: { appVersion: Constants.expoConfig?.version ?? '0.0.0', platform: Platform.OS, kitchenRole: 'member' },
  });
}
