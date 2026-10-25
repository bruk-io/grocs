// The demo composition (decision-12): the app on the in-memory provider, seeded from the sample
// data. Nothing here touches a network or a disk. Only the demo variant's bundle reaches this folder.
import type { RuntimeInfo } from '@grocs/application';
import { createExtraItem, createKitchen, createMeal, toDayIndex, weekIdFor } from '@grocs/core';
import type { Kitchen } from '@grocs/core';
import type { Clock, IdGenerator, Logger } from '@grocs/ports';
import { RandomIds, SystemClock } from '@grocs/providers-device';
import { DEMO_MEMBER, MemoryAuth, MemoryKitchenGateway, MemorySyncStore } from '@grocs/providers-memory';
import { composeApp } from '../composition/compose-app.ts';
import { diagnosticsText } from '../composition/diagnostics.ts';
import type { NativeApp } from '../composition/native.ts';
import { meat, produce, week } from '../sample/sample-data.ts';

/** The one kitchen the demo has. */
export const DEMO_KITCHEN_ID = 'demo-kitchen';

export interface DemoOptions {
  readonly logger: Logger;
  readonly runtime: RuntimeInfo;
  readonly copyText: (text: string) => Promise<void>;
  readonly clock?: Clock;
  readonly ids?: IdGenerator;
}

export function composeDemoApp({ logger, runtime, copyText, clock = new SystemClock(), ids = new RandomIds() }: DemoOptions): NativeApp {
  const auth = new MemoryAuth();
  const syncStore = new MemorySyncStore();
  seed(syncStore, clock);

  // The demo member already belongs to the one demo kitchen, so signing in lands on Groceries (decision-12).
  const made = createKitchen({
    id: DEMO_KITCHEN_ID,
    name: 'Our kitchen',
    timeZone: 'UTC',
    ownerUid: DEMO_MEMBER.uid,
    ownerName: DEMO_MEMBER.displayName ?? DEMO_MEMBER.uid,
    createdAt: clock.now(),
  });
  if (!made.ok) throw new Error('the demo kitchen is not a valid kitchen');
  const kitchens = new MemoryKitchenGateway(
    DEMO_MEMBER.uid,
    { kitchens: new Map<string, Kitchen>([[made.value.id, made.value]]), invites: new Map() },
    clock,
    ids,
    DEMO_MEMBER.displayName ?? DEMO_MEMBER.uid,
  );

  const app = composeApp({ ports: { syncStore, auth, clock, ids, kitchens }, logger, runtime, copyText });
  return {
    app,
    isDevBuild: false,
    diagnostics: () => diagnosticsText({ appVersion: runtime.appVersion, platform: runtime.platform, build: 'demo' }, 'demo build: nothing is logged to the phone'),
    demo: {
      kitchenId: DEMO_KITCHEN_ID,
      signIn: async () => {
        await auth.signInAsDemoMember();
      },
    },
    signInWithGoogle: () => Promise.reject(new Error('Google sign-in is not part of the demo')),
  };
}

/** This week's list and plan, from the sample Groceries and Plan screens, added by Alex and Sam. */
function seed(syncStore: MemorySyncStore, clock: Clock): void {
  const at = clock.now();
  const weekId = weekIdFor(at);
  // The sample week's days are already Monday-first (index 0) to Sunday (index 6), matching DayIndex.
  for (const [index, plannedDay] of week.entries()) {
    const dayIndex = toDayIndex(index);
    if (dayIndex === null) throw new Error(`the sample week has more than seven days`);
    for (const sampleMeal of plannedDay.meals) {
      // The sample's own link ('example.com') has no protocol and fails createMeal's R6 validation; a real
      // https URL keeps the demo showing the recipe-link affordance for the meals the sample gives one.
      const made = createMeal({ id: sampleMeal.id, weekId, dayIndex, name: sampleMeal.name, ...(sampleMeal.link ? { link: 'https://example.com' } : {}) }, { at, by: 'demo-alex' });
      if (!made.ok) throw new Error(`the demo sample meal ${sampleMeal.id} is not a valid meal`);
      void syncStore.mergeMeal(DEMO_KITCHEN_ID, made.value);
    }
  }
  for (const [index, sample] of [...produce, ...meat].entries()) {
    const made = createExtraItem(
      { id: `demo-${sample.id}`, weekId, name: sample.name, ...(sample.amount ? { amount: sample.amount } : {}) },
      { at, by: index % 2 === 0 ? 'demo-alex' : 'demo-sam' },
    );
    if (!made.ok) throw new Error(`the demo sample item ${sample.id} is not a valid item`);
    // The in-memory store takes the item before its first await, so the list is full when the app opens.
    // The sample's badges are meal names; items hold meal ids, which the sample week gives.
    const badges = (sample.mealBadges ?? []).flatMap((b) => week.flatMap((d) => d.meals).filter((m) => m.name === (typeof b === 'string' ? b : b.label)).map((m) => m.id));
    void syncStore.mergeItem(DEMO_KITCHEN_ID, { ...made.value, badges });
  }
}
