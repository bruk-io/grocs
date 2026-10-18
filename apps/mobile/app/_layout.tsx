import { Slot } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { PlatformStyleProvider } from '@grocs/ui';
import { AppProvider } from '../src/app-context.tsx';
import { createNativeApp } from '../src/composition/native.ts';

export default function RootLayout() {
  const native = useMemo(() => createNativeApp(), []);
  return (
    <AppProvider value={native}>
      <PlatformStyleProvider value={Platform.OS === 'ios' ? 'ios' : 'android'}>
        <Slot />
      </PlatformStyleProvider>
    </AppProvider>
  );
}
