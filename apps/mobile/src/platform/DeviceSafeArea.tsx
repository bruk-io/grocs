import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider as UiSafeAreaProvider } from '@grocs/ui';

/**
 * The phone's status bar, gesture bar and cutout sizes, read from react-native-safe-area-context and
 * passed to the ui's inset provider (@grocs/ui reads no native library itself). It mounts no native
 * provider of its own: expo-router's ExpoRoot already mounts one above the root layout.
 */
export function DeviceSafeArea({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <UiSafeAreaProvider insets={insets}>{children}</UiSafeAreaProvider>;
}
