import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Slot, useSegments } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { MotionProvider, PlatformStyleProvider } from '@grocs/ui';
import { AppProvider } from '../src/app-context.tsx';
import { observer, routePattern } from '../src/composition/observe.ts';
import { ErrorFallback } from '../src/screens/ErrorFallback.tsx';
import { createApp } from '../src/composition/create-app.ts';
import { useSystemReduceMotion } from '../src/platform/useSystemReduceMotion.ts';

// The faces the text atoms ask for, registered under the names @grocs/ui's NATIVE_FACES gives them
// (a phone cannot pick a weight inside one family, so each weight is its own).
const FONTS = { Fredoka_600SemiBold, Fredoka_700Bold, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold };

/** Render errors (R33): logged once with the route pattern, then a screen with a retry. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => observer().error('render', error), [error]);
  return <ErrorFallback onRetry={() => void retry()} />;
}

export default function RootLayout() {
  const native = useMemo(() => createApp(), []);
  // Screen changes (R33): the route pattern only, never the pathname or its params.
  const route = routePattern(useSegments());
  useEffect(() => observer().screen(route), [route]);
  const [loaded, failed] = useFonts(FONTS);
  const reduced = useSystemReduceMotion();
  // Wait for the fonts so the first frame is not drawn in the system face; if they cannot load, draw in it anyway.
  if (!loaded && !failed) return null;
  return (
    <AppProvider value={native}>
      <PlatformStyleProvider value={Platform.OS === 'ios' ? 'ios' : 'android'}>
        <MotionProvider reduced={reduced}>
          <Slot />
        </MotionProvider>
      </PlatformStyleProvider>
    </AppProvider>
  );
}
