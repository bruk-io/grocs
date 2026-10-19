import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { PlatformStyleProvider } from '@grocs/ui';
import { AppProvider } from '../src/app-context.tsx';
import { createNativeApp } from '../src/composition/native.ts';

// The faces the text atoms ask for, registered under the names @grocs/ui's NATIVE_FACES gives them
// (a phone cannot pick a weight inside one family, so each weight is its own).
const FONTS = { Fredoka_600SemiBold, Fredoka_700Bold, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold };

export default function RootLayout() {
  const native = useMemo(() => createNativeApp(), []);
  const [loaded, failed] = useFonts(FONTS);
  // Wait for the fonts so the first frame is not drawn in the system face; if they cannot load, draw in it anyway.
  if (!loaded && !failed) return null;
  return (
    <AppProvider value={native}>
      <PlatformStyleProvider value={Platform.OS === 'ios' ? 'ios' : 'android'}>
        <Slot />
      </PlatformStyleProvider>
    </AppProvider>
  );
}
