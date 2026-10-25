// The four-way render every signed-in route needs before it can show a kitchenId: still looking,
// signed out, no kitchen yet, or the lookup failed. Shared so index.tsx, plan.tsx, add-meal.tsx and
// quick-add.tsx show the same thing in each state instead of drifting (found independently of each
// other, rather than all four only handling "found").
import type { ReactNode } from 'react';
import type { GoogleSignIn } from '@grocs/ports';
import { Text } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import type { DemoAccess } from '../composition/native.ts';
import { KitchenSetupScreen } from './KitchenSetupScreen.tsx';
import { useKitchen } from './use-kitchen.ts';
import { WelcomeScreen } from './WelcomeScreen.tsx';

export interface KitchenGateProps {
  app: App;
  demo: DemoAccess | null;
  signInWithGoogle: GoogleSignIn['signInWithGoogle'];
  /** Rendered once the signed-in member's kitchen is found. */
  children: (kitchenId: string) => ReactNode;
}

export function KitchenGate({ app, demo, signInWithGoogle, children }: KitchenGateProps) {
  const { user, kitchen, setKitchen } = useKitchen(app);
  if (user === undefined) return null;
  if (user === null) return <WelcomeScreen signInWithGoogle={signInWithGoogle} demo={demo} />;
  if (kitchen.kind === 'looking') return null;
  if (kitchen.kind === 'failed') return <Text variant="muted">We could not find your kitchen. Check your connection and reopen the app.</Text>;
  if (kitchen.kind === 'none') {
    return <KitchenSetupScreen app={app} email={user.email ?? ''} onReady={(id) => setKitchen({ kind: 'found', id })} />;
  }
  return <>{children(kitchen.id)}</>;
}
