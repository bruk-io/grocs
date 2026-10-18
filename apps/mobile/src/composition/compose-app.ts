// The composition root's wiring: ports in, an App for the screens out (R26). This is the one place
// where providers meet the application layer, and the one place that instruments them (R31).
import { commandHandlers, createDispatcher, instrumentDeps, loggingMiddleware, watchSession, watchWeekItems, signOut } from '@grocs/application';
import type { Command, CommandResult, Deps, RuntimeInfo } from '@grocs/application';
import type { Item } from '@grocs/core';
import type { Logger, Unsubscribe, User } from '@grocs/ports';

export interface AppOptions {
  /** The providers. In the real app these come from composeFirebaseApp; tests pass fakes. */
  readonly ports: Deps;
  readonly logger: Logger;
  readonly runtime: RuntimeInfo;
}

/** What the screens use. Screens never see a port or a provider (R26, R28). */
export interface App {
  dispatch(command: Command): Promise<CommandResult>;
  watchWeekItems(kitchenId: string, weekId: string, onItems: (items: readonly Item[]) => void, onError?: (error: Error) => void): Unsubscribe;
  watchSession(onUser: (user: User | null) => void): Unsubscribe;
  signOut(): Promise<void>;
  /** Now, as the app's clock reads it, for choosing the current week. */
  now(): number;
}

export function composeApp({ ports, logger, runtime }: AppOptions): App {
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
    watchSession: (onUser) => watchSession(session, onUser),
    signOut: () => signOut(session),
    now: () => ports.clock.now(),
  };
}
