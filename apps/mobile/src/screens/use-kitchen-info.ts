// The signed-in member's kitchen, by name and members, for every screen that shows who is in it
// (TASK-58, TASK-63): read once per kitchen through App.getKitchenInfo, never from sample data.
import { useEffect, useState } from 'react';
import type { KitchenInfo } from '@grocs/application';
import type { App } from '../composition/compose-app.ts';
import type { StackMember } from '@grocs/ui';

/** The kitchen's name and members, or null until they have loaded (or when they could not be read). */
export function useKitchenInfo(app: App, kitchenId: string): KitchenInfo | null {
  const [info, setInfo] = useState<KitchenInfo | null>(null);
  useEffect(() => {
    let current = true;
    app.getKitchenInfo(kitchenId).then(
      (got) => current && setInfo(got),
      () => undefined,
    );
    return () => {
      current = false;
    };
  }, [app, kitchenId]);
  return info;
}

/** The signed-in member's own kitchen, for screens outside KitchenGate (Settings): found first, then read. */
export function useMyKitchenInfo(app: App): KitchenInfo | null {
  const [info, setInfo] = useState<KitchenInfo | null>(null);
  useEffect(() => {
    let current = true;
    app
      .findMyKitchen()
      .then((id) => (id ? app.getKitchenInfo(id) : null))
      .then(
        (got) => current && setInfo(got),
        () => undefined,
      );
    return () => {
      current = false;
    };
  }, [app]);
  return info;
}

/** The header avatars: the signed-in member first, then the partner in the second tone. */
export function avatarsFor(info: KitchenInfo | null): StackMember[] {
  if (!info) return [];
  const ordered = [...info.members].sort((a, b) => Number(b.isCaller) - Number(a.isCaller));
  return ordered.map((m) => (m.isCaller ? { name: m.name } : { name: m.name, tone: 'chartreuse' as const }));
}

/** The partner's name, for copy that mentions them, or null while the kitchen has one member. */
export function partnerNameOf(info: KitchenInfo | null): string | null {
  return info?.members.find((m) => !m.isCaller)?.name ?? null;
}
