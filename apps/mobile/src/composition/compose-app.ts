// The composition root's wiring: ports in, an App for the screens out (R26). This is the one place
// where providers meet the application layer, and the one place that instruments them (R31).
import { commandHandlers, createDispatcher, findMyKitchen, getInvitePreview, getKitchenInfo, getKitchenInvite, instrumentDeps, loggingMiddleware, watchKitchenRecipes, watchSession, watchWeekItems, watchWeekMeals, signOut } from '@grocs/application';
import type { Command, CommandResult, Deps, KitchenInfo, RuntimeInfo } from '@grocs/application';
import type { Item, Meal, Recipe } from '@grocs/core';
import type { InvitePreview, KitchenInvite, Logger, Unsubscribe, User } from '@grocs/ports';

export interface AppOptions {
  /** The providers. In the real app these come from composeFirebaseApp; tests pass fakes. */
  readonly ports: Deps;
  readonly logger: Logger;
  readonly runtime: RuntimeInfo;
  /** Puts text on the device clipboard. An app seam, not a port: the phones pass expo-clipboard, tests a fake. */
  readonly copyText: (text: string) => Promise<void>;
}

/** What the screens use. Screens never see a port or a provider (R26, R28). */
export interface App {
  dispatch(command: Command): Promise<CommandResult>;
  watchWeekItems(kitchenId: string, weekId: string, onItems: (items: readonly Item[]) => void, onError?: (error: Error) => void): Unsubscribe;
  watchWeekMeals(kitchenId: string, weekId: string, onMeals: (meals: readonly Meal[]) => void, onError?: (error: Error) => void): Unsubscribe;
  /** The kitchen's live recipes (tombstones hidden), now and on every change. */
  watchKitchenRecipes(kitchenId: string, onRecipes: (recipes: readonly Recipe[]) => void, onError?: (error: Error) => void): Unsubscribe;
  watchSession(onUser: (user: User | null) => void): Unsubscribe;
  signOut(): Promise<void>;
  /** The signed-in member's kitchen id, or null when they have none yet (or nobody is signed in). */
  findMyKitchen(): Promise<string | null>;
  /** The kitchen's name and members, with the signed-in member marked (TASK-27), or null for an unknown kitchen. */
  getKitchenInfo(kitchenId: string): Promise<KitchenInfo | null>;
  /** The invite to share with the partner, or 'full' (TASK-56). */
  getKitchenInvite(kitchenId: string): Promise<KitchenInvite>;
  /** Who sent an invite and to which kitchen, from the server, before joining; null for a code that would not let them in (TASK-70). */
  previewInvite(code: string): Promise<InvitePreview | null>;
  /** Now, as the app's clock reads it, for choosing the current week. */
  now(): number;
  /** Copies text to the device clipboard. */
  copyText(text: string): Promise<void>;
}

export function composeApp({ ports, logger, runtime, copyText }: AppOptions): App {
  // Every provider is wrapped here, and nowhere else: each command gets its own correlation id,
  // and its ports log with that id attached (R31, R32).
  const depsFor = (correlation: Parameters<typeof instrumentDeps>[3]): Deps => instrumentDeps(ports, logger, ports.clock, correlation);

  const dispatcher = createDispatcher({
    handlers: commandHandlers,
    depsFor,
    runtime,
    ids: ports.ids,
    middleware: [loggingMiddleware(logger, ports.clock)],
  });

  // Reads outside a command share one correlation id for the life of the app.
  const session = depsFor({ correlationId: `session-${ports.ids.newId()}`, runtime });

  return {
    dispatch: (command) => dispatcher.dispatch(command),
    watchWeekItems: (kitchenId, weekId, onItems, onError) => watchWeekItems(session, kitchenId, weekId, onItems, onError),
    watchWeekMeals: (kitchenId, weekId, onMeals, onError) => watchWeekMeals(session, kitchenId, weekId, onMeals, onError),
    watchKitchenRecipes: (kitchenId, onRecipes, onError) => watchKitchenRecipes(session.syncStore, kitchenId, onRecipes, onError),
    watchSession: (onUser) => watchSession(session, onUser),
    signOut: () => signOut(session),
    findMyKitchen: () => findMyKitchen(session),
    getKitchenInfo: (kitchenId) => getKitchenInfo(session, kitchenId),
    getKitchenInvite: (kitchenId) => getKitchenInvite(session, kitchenId),
    previewInvite: (code) => getInvitePreview(session, code),
    now: () => ports.clock.now(),
    copyText,
  };
}
