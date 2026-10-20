// A client built from the in-memory fakes, for scenario tests (R47). Two clients that share
// one store stand in for the two phones.
import { FakeAuth, FakeClock, FakeKitchenGateway, InMemorySyncStore, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import type { KitchenGateway, SyncStore } from '@grocs/ports';
import { commandHandlers } from '../commands/index.ts';
import { createDispatcher } from '../dispatch/dispatcher.ts';
import { loggingMiddleware } from '../dispatch/logging-middleware.ts';
import type { Dispatcher } from '../dispatch/types.ts';
import { instrumentDeps } from '../instrumentation/instrument.ts';

export interface TestClientOptions {
  readonly uid: string;
  readonly store?: SyncStore;
  readonly clock?: FakeClock;
  readonly signedIn?: boolean;
  readonly kitchens?: KitchenGateway;
}

export interface TestClient {
  readonly dispatcher: Dispatcher;
  readonly logger: MemoryLogger;
  readonly store: SyncStore;
  readonly clock: FakeClock;
  readonly auth: FakeAuth;
}

export async function createTestClient(options: TestClientOptions): Promise<TestClient> {
  const { uid, signedIn = true } = options;
  const store = options.store ?? new InMemorySyncStore();
  const clock = options.clock ?? new FakeClock();
  const kitchens = options.kitchens ?? new FakeKitchenGateway(uid, undefined, clock);
  const logger = new MemoryLogger();
  const auth = new FakeAuth([{ uid, email: `${uid}@grocs.test`, displayName: uid, password: 'pw' }]);
  if (signedIn) await auth.signInWithTestAccount(`${uid}@grocs.test`, 'pw');
  const ids = new SequentialIds(uid);
  const runtime = { appVersion: 'test', platform: 'test', kitchenRole: 'member' };

  const dispatcher = createDispatcher({
    handlers: commandHandlers,
    runtime,
    ids,
    depsFor: (correlation) => instrumentDeps({ syncStore: store, auth, clock, ids, kitchens }, logger, clock, correlation),
    middleware: [loggingMiddleware(logger, clock)],
  });
  return { dispatcher, logger, store, clock, auth };
}
