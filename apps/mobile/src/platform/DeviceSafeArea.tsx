import type { ReactNode } from 'react';
import { SafeAreaProvider as NativeSafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Metrics } from 'react-native-safe-area-context';
import { SafeAreaProvider as UiSafeAreaProvider } from '@grocs/ui';

function FeedInsets({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <UiSafeAreaProvider insets={insets}>{children}</UiSafeAreaProvider>;
}

/**
 * The phone's status bar, gesture bar and cutout sizes, read from react-native-safe-area-context and
 * passed to the ui's inset provider (@grocs/ui reads no native library itself). `initialMetrics` is for tests.
 */
export function DeviceSafeArea({ initialMetrics = null, children }: { initialMetrics?: Metrics | null; children: ReactNode }) {
  return (
    <NativeSafeAreaProvider initialMetrics={initialMetrics}>
      <FeedInsets>{children}</FeedInsets>
    </NativeSafeAreaProvider>
  );
}
