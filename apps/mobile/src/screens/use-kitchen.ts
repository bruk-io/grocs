// Where the signed-in member's kitchen stands. KitchenGate.tsx is the shared four-way render built
// on this; use this hook directly only if a caller needs the raw state (KitchenGate does not).
import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { User } from '@grocs/ports';
import type { App } from '../composition/compose-app.ts';

export type Kitchen = { kind: 'looking' } | { kind: 'none' } | { kind: 'found'; id: string } | { kind: 'failed' };

export function useKitchen(app: App): { user: User | null | undefined; kitchen: Kitchen; setKitchen: Dispatch<SetStateAction<Kitchen>> } {
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
  return { user, kitchen, setKitchen };
}
