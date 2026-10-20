// The demo composition (decision-12): the app on the in-memory provider, seeded from the sample
// data. Nothing here touches a network or a disk. Only the demo variant's bundle reaches this folder.
import type { RuntimeInfo } from '@grocs/application';
import { createExtraItem, createKitchen, weekIdFor } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { Clock, IdGenerator, Logger } from '@grocs/ports';
import { RandomIds, SystemClock } from '@grocs/providers-device';
import { DEMO_MEMBER, MemoryAuth, MemoryKitchenGateway, MemorySyncStore } from '@grocs/providers-memory';
import { composeApp } from '../composition/compose-app.ts';
import type { NativeApp } from '../composition/native.ts';
import { meat, produce } from '../sample/sample-data.ts';

/** The one kitchen the demo has. */
export const DEMO_KITCHEN_ID = 'demo-kitchen';

export interface DemoOptions {
  readonly logger: Logger;
  readonly runtime: RuntimeInfo;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
}

export function composeDemoApp({ logger, runtime, clock = new SystemClock(), ids = new RandomIds() }: DemoOptions): NativeApp {
  const auth = new MemoryAuth();
  const syncStore = new MemorySyncStore();
  seed(syncStore, clock);

  // The demo member already belongs to the one demo kitchen, so signing in lands on Groceries (decision-12).
  const made = createKitchen({ id: DEMO_KITCHEN_ID, name: 'Our kitchen', timeZone: 'UTC', ownerUid: DEMO_MEMBER.uid, createdAt: clock.now() });
  if (!made.ok) throw new Error('the demo kitchen is not a valid kitchen');
  const kitchens = new MemoryKitchenGateway(DEMO_MEMBER.uid, { kitchens: new Map<string, Kitchen>([[made.value.id, made.value]]), invites: new Map() }, clock, ids);

  const app = composeApp({ ports: { syncStore, auth, clock, ids, kitchens }, logger, runtime });
  return {
    app,
    dev: null,
    diagnostics: null,
    demo: {
      kitchenId: DEMO_KITCHEN_ID,
      signIn: async () => {
        await auth.signInAsDemoMember();
      },
    },
    signInWithGoogle: () => Promise.reject(new Error('Google sign-in is not part of the demo')),
  };
}

/** This week's list, from the sample Groceries screen, added by the household of Bruk and Sam. */
function seed(syncStore: MemorySyncStore, clock: Clock): void {
  const at = clock.now();
  const weekId = weekIdFor(at);
  for (const [index, sample] of [...produce, ...meat].entries()) {
    const made = createExtraItem(
      { id: `demo-${sample.id}`, weekId, name: sample.name, ...(sample.amount ? { amount: sample.amount } : {}) },
      { at, by: index % 2 === 0 ? 'demo-bruk' : 'demo-sam' },
    );
    if (!made.ok) throw new Error(`the demo sample item ${sample.id} is not a valid item`);
    // The in-memory store takes the item before its first await, so the list is full when the app opens.
    void syncStore.mergeItem(DEMO_KITCHEN_ID, made.value);
  }
}
