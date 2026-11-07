// Where the signed-in member's kitchen stands, and any invite waiting for them. KitchenGate.tsx is the
// shared render built on this; use this hook directly only if a caller needs the raw state.
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { InviteOffer, User } from '@grocs/ports';
import type { App } from '../composition/compose-app.ts';

export type Kitchen = { kind: 'looking' } | { kind: 'none' } | { kind: 'found'; id: string } | { kind: 'failed' };

export interface KitchenState {
  user: User | null | undefined;
  kitchen: Kitchen;
  setKitchen: Dispatch<SetStateAction<Kitchen>>;
  /** Invites waiting for this person's email (TASK-78). Empty until read, and when they could not be. */
  offers: readonly InviteOffer[];
  /** Reads the invites again. */
  checkOffers: () => void;
  checkingOffers: boolean;
}

export function useKitchen(app: App): KitchenState {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [kitchen, setKitchen] = useState<Kitchen>({ kind: 'looking' });
  const [offers, setOffers] = useState<readonly InviteOffer[]>([]);
  const [offersRead, setOffersRead] = useState(false);
  const [checkingOffers, setCheckingOffers] = useState(false);
  useEffect(() => app.watchSession(setUser), [app]);
  const uid = user?.uid;

  const readOffers = useCallback(
    (isCurrent: () => boolean) => {
      setCheckingOffers(true);
      // An invite that cannot be read is not offered; the kitchen still opens (it is found separately).
      return app.getInviteOffers().then(
        (got) => {
          if (!isCurrent()) return;
          setOffers(got);
          setOffersRead(true);
          setCheckingOffers(false);
        },
        () => {
          if (!isCurrent()) return;
          setOffersRead(true);
          setCheckingOffers(false);
        },
      );
    },
    [app],
  );

  useEffect(() => {
    if (!uid) return;
    let current = true;
    setKitchen({ kind: 'looking' });
    setOffers([]);
    setOffersRead(false);
    app.findMyKitchen().then(
      (id) => current && setKitchen(id ? { kind: 'found', id } : { kind: 'none' }),
      () => current && setKitchen({ kind: 'failed' }),
    );
    void readOffers(() => current);
    return () => {
      current = false;
    };
  }, [app, uid, readOffers]);

  // Until the invites are read, the kitchen waits too, so a person with an invite is not shown their
  // old kitchen (or kitchen setup) for a moment first.
  return {
    user,
    kitchen: offersRead ? kitchen : { kind: 'looking' },
    setKitchen,
    offers,
    checkOffers: () => void readOffers(() => true),
    checkingOffers,
  };
}
