// The render every signed-in route needs before it can show a kitchenId: still looking, signed out,
// an invite waiting, no kitchen yet, or the lookup failed. Shared so index.tsx, plan.tsx, add-meal.tsx,
// quick-add.tsx and household.tsx show the same thing in each state instead of drifting.
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { GoogleSignIn } from '@grocs/ports';
import { Text } from '@grocs/ui';
import type { App } from '../composition/compose-app.ts';
import type { DemoAccess } from '../composition/native.ts';
import { InviteOfferScreen } from './InviteOfferScreen.tsx';
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

/**
 * The invites put aside with Not now, per App (one per launch of the real app, one per test), so a
 * dismissed invite stays dismissed as the person moves between screens and is offered again on the
 * next launch (TASK-78).
 */
const putAside = new WeakMap<App, Set<string>>();
function asideFor(app: App): Set<string> {
  let set = putAside.get(app);
  if (!set) putAside.set(app, (set = new Set()));
  return set;
}

export function KitchenGate({ app, demo, signInWithGoogle, children }: KitchenGateProps) {
  const { user, kitchen, setKitchen, offers, checkOffers, checkingOffers } = useKitchen(app);
  const [, rerender] = useState(0);
  if (user === undefined) return null;
  if (user === null) return <WelcomeScreen signInWithGoogle={signInWithGoogle} demo={demo} />;
  if (kitchen.kind === 'looking') return null;

  const aside = asideFor(app);
  const offer = offers.find((o) => !aside.has(`${user.uid}:${o.kitchenId}`) && !(kitchen.kind === 'found' && kitchen.id === o.kitchenId));
  if (offer) {
    return (
      <InviteOfferScreen
        key={offer.kitchenId}
        app={app}
        offer={offer}
        currentKitchenId={kitchen.kind === 'found' ? kitchen.id : null}
        onJoined={(id) => setKitchen({ kind: 'found', id })}
        onNotNow={() => {
          aside.add(`${user.uid}:${offer.kitchenId}`);
          rerender((n) => n + 1);
        }}
      />
    );
  }
  if (kitchen.kind === 'failed') return <Text variant="muted">We could not find your kitchen. Check your connection and reopen the app.</Text>;
  if (kitchen.kind === 'none') {
    return <KitchenSetupScreen app={app} email={user.email ?? ''} onReady={(id) => setKitchen({ kind: 'found', id })} onCheckInvites={checkOffers} checkingInvites={checkingOffers} />;
  }
  return <>{children(kitchen.id)}</>;
}
