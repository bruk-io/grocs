import { useEffect, useState } from 'react';
import type { User } from '@grocs/ports';
import { Text } from '@grocs/ui';
import { useNativeApp } from '../src/app-context.tsx';
import { GroceriesScreen } from '../src/screens/GroceriesScreen.tsx';
import { KitchenSetupScreen } from '../src/screens/KitchenSetupScreen.tsx';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.tsx';

/** Where the member's kitchen stands: still looking, none yet, found, or the lookup failed. */
type Kitchen = { kind: 'looking' } | { kind: 'none' } | { kind: 'found'; id: string } | { kind: 'failed' };

export default function Home() {
  const { app, dev, demo } = useNativeApp();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [kitchen, setKitchen] = useState<Kitchen>({ kind: 'looking' });
  useEffect(() => app.watchSession(setUser), [app]);
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    let current = true;
    setKitchen({ kind: 'looking' });
    app.findMyKitchen().then(
      (id) => current && setKitchen(id ? { kind: 'found', id } : { kind: 'none' }),
      () => current && setKitchen({ kind: 'failed' }),
    );
    return () => {
      current = false;
    };
  }, [app, uid]);

  if (user === undefined) return null;
  if (user === null) return <WelcomeScreen dev={dev} demo={demo} />;
  if (kitchen.kind === 'looking') return null;
  if (kitchen.kind === 'failed') return <Text variant="muted">We could not find your kitchen. Check your connection and reopen the app.</Text>;
  if (kitchen.kind === 'none') {
    return <KitchenSetupScreen app={app} email={user.email ?? ''} onReady={(id) => setKitchen({ kind: 'found', id })} />;
  }
  return <GroceriesScreen app={app} kitchenId={kitchen.id} />;
}
