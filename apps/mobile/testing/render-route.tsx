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
import { FakeAuth, FakeClock, InMemorySyncStore, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import { PlatformStyleProvider } from '@grocs/ui';
import { AppProvider } from '../src/app-context.tsx';
import { composeApp } from '../src/composition/compose-app.ts';
import type { NativeApp } from '../src/composition/native.ts';

export async function appOnFakes({ signedIn, dev = false }: { signedIn: boolean; dev?: boolean }): Promise<NativeApp> {
  const auth = new FakeAuth([{ uid: 'u1', email: 'u1@grocs.test', displayName: 'U1', password: 'pw' }]);
  if (signedIn) await auth.signInWithTestAccount('u1@grocs.test', 'pw');
  const app = composeApp({
    ports: { syncStore: new InMemorySyncStore(), auth, clock: new FakeClock(), ids: new SequentialIds('t') },
    logger: new MemoryLogger(),
    runtime: { appVersion: 'test', platform: 'test', kitchenRole: 'member' },
  });
  // A development build has the seeded test accounts; a release build has none.
  const devAccess = dev
    ? {
        kitchenId: 'k1',
        accounts: [{ label: 'U1', email: 'u1@grocs.test', password: 'pw' }],
        signIn: async (email: string, password: string) => {
          await auth.signInWithTestAccount(email, password);
        },
      }
    : null;
  return { app, dev: devAccess, diagnostics: null, signInWithGoogle: () => Promise.reject(new Error('not used in route tests')) };
}

/**
 * Renders the given routes, keyed by file name as under apps/mobile/app ('index', 'list/[id]', ...),
 * at `location`. Navigate in a test by clicking a link or calling `router` from expo-router.
 */
export function renderRoute(routes: Record<string, ComponentType>, { app, location = '/' }: { app: NativeApp; location?: string }) {
  function Layout() {
    return (
      <AppProvider value={app}>
        <PlatformStyleProvider value="android">
          <Slot />
        </PlatformStyleProvider>
      </AppProvider>
    );
  }
  const context = inMemoryContext({ _layout: Layout, ...routes });
  return render(<ExpoRoot context={context as never} location={location} />);
}
