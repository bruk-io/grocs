import { useEffect, useState } from 'react';
import type { User } from '@grocs/ports';
import { useNativeApp } from '../src/app-context.tsx';
import { ListScreen } from '../src/screens/ListScreen.tsx';
import { WelcomeScreen } from '../src/screens/WelcomeScreen.tsx';

export default function Home() {
  const { app, dev } = useNativeApp();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => app.watchSession(setUser), [app]);
  if (user === undefined) return null;
  if (user === null) return <WelcomeScreen dev={dev} />;
  return <ListScreen app={app} kitchenId={dev?.kitchenId ?? ''} />;
}
