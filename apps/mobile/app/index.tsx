import { useEffect, useState } from 'react';
import type { User } from '@grocs/ports';
import { useNativeApp } from '../src/app-context.tsx';
import { GroceriesScreen } from '../src/screens/GroceriesScreen.tsx';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.tsx';

export default function Home() {
  const { app, dev, demo } = useNativeApp();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => app.watchSession(setUser), [app]);
  if (user === undefined) return null;
  if (user === null) return <WelcomeScreen dev={dev} demo={demo} />;
  return <GroceriesScreen app={app} kitchenId={demo?.kitchenId ?? dev?.kitchenId ?? ''} />;
}
