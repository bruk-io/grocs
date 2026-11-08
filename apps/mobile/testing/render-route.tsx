// The route test pattern (decision-11 level 4). A test renders the real route files through expo-router's
// ExpoRoot, inside a layout that gives them an app composed on fakes instead of the native Firebase one.
// The real root layout is not used because it builds the native providers; everything below it is real.
//
//   const { app } = await appOnFakes({ signedIn: true });
//   renderRoute({ index: Home }, { app, location: '/' });
//   expect(await screen.findByText('Nothing on the list yet')).toBeTruthy();
import { render } from '@testing-library/react';
import { ExpoRoot, Slot } from 'expo-router';
import { inMemoryContext } from 'expo-router/build/testing-library/context-stubs';
import type { ComponentType } from 'react';
import { BufferLogger } from '@grocs/providers-device';
import { FakeAuth, FakeClock, FakeKitchenGateway, FakeRecipeImporter, InMemorySyncStore, SequentialIds } from '@grocs/ports/testing';
import { PlatformStyleProvider } from '@grocs/ui';
import { AppProvider } from '../src/app-context.tsx';
import { composeApp } from '../src/composition/compose-app.ts';
import { SafeAreaProvider as NativeSafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceSafeArea } from '../src/platform/DeviceSafeArea.tsx';
import { diagnosticsText } from '../src/composition/diagnostics.ts';
import type { NativeApp } from '../src/composition/native.ts';
import { FakeClipboard } from './fake-clipboard.ts';

export async function appOnFakes({
  signedIn,
  isDevBuild = false,
  syncStore = new InMemorySyncStore(),
  kitchen = true,
  clock = new FakeClock(),
  kitchens = new FakeKitchenGateway({ uid: 'u1', name: 'U1', email: 'u1@grocs.test' }, undefined, clock),
  googleAccount = null,
  devSignIn = null,
  recipeImporter = new FakeRecipeImporter(),
}: {
  signedIn: boolean;
  /** Gates dev-only routes like /groceries-samples (R53); carries no account or sign-in capability. */
  isDevBuild?: boolean;
  /** Pass a store to put items in it before the app opens. */
  syncStore?: InMemorySyncStore;
  /** Whether the signed-in member (u1) already belongs to a kitchen. False gives the kitchen setup screen. */
  kitchen?: boolean;
  /** The kitchen gateway, as u1 (u1@grocs.test) sees it. Share its state with `.asMember(...)` to have a partner invite u1. */
  kitchens?: FakeKitchenGateway;
  /** The clock the gateway and the app share. */
  clock?: FakeClock;
  /** Stands in for a successful Google picker (FakeAuth's own doc): set to make Continue with Google succeed; null (the default) stands in for a cancelled or failed pick. */
  googleAccount?: { uid: string; email: string; displayName: string | null } | null;
  /** Stands in for the development build's seed-account sign-in (TASK-62); null, the default, is a release build or one on live Firebase. */
  devSignIn?: ((auth: FakeAuth, name: string) => Promise<void>) | null;
  /** The recipe importer, seeded by the test. */
  recipeImporter?: FakeRecipeImporter;
}): Promise<NativeApp & { readonly clipboard: FakeClipboard; readonly recipeImporter: FakeRecipeImporter }> {
  const auth = new FakeAuth([{ uid: 'u1', email: 'u1@grocs.test', displayName: 'U1', password: 'pw' }], googleAccount);
  if (signedIn) await auth.signInWithTestAccount('u1@grocs.test', 'pw');
  if (kitchen) await kitchens.createKitchen('Our kitchen', 'UTC');
  const clipboard = new FakeClipboard();
  // The release build's own logger, so a test of the diagnostics copy reads what a phone would copy.
  const logger = new BufferLogger();
  const app = composeApp({
    ports: { syncStore, auth, clock, ids: new SequentialIds('t'), kitchens, recipeImporter },
    logger,
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
    copyText: clipboard.copyText,
  });
  return {
    clipboard,
    app,
    isDevBuild,
    demo: null,
    devSignIn: devSignIn ? (name) => devSignIn(auth, name) : null,
    diagnostics: () => diagnosticsText({ appVersion: 'test', platform: 'test', build: '1' }, logger.dump()),
    signInWithGoogle: () => auth.signInWithGoogle(),
    recipeImporter,
  };
}

/**
 * Renders the given routes, keyed by file name as under apps/mobile/app ('index', 'list/[id]', ...),
 * at `location`. `insets` is the phone's safe area (default none). Navigate in a test by clicking a link or calling `router` from expo-router.
 */
export function renderRoute(routes: Record<string, ComponentType>, { app, location = '/', insets }: { app: NativeApp; location?: string; insets?: { top: number; right: number; bottom: number; left: number } }) {
  function Layout() {
    return (
      <AppProvider value={app}>
        <PlatformStyleProvider value="android">
          {/* ExpoRoot's own provider reports no insets in jsdom; this one, inside it, reports the test's. */}
          <NativeSafeAreaProvider initialMetrics={insets ? { insets, frame: { x: 0, y: 0, width: 393, height: 852 } } : null}>
            <DeviceSafeArea>
              <Slot />
            </DeviceSafeArea>
          </NativeSafeAreaProvider>
        </PlatformStyleProvider>
      </AppProvider>
    );
  }
  const context = inMemoryContext({ _layout: Layout, ...routes });
  return render(<ExpoRoot context={context as never} location={location} />);
}
