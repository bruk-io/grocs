export { createDispatcher } from './dispatch/dispatcher.ts';
export { loggingMiddleware } from './dispatch/logging-middleware.ts';
export type {
  Command,
  CommandContext,
  CommandError,
  CommandResult,
  Correlation,
  Deps,
  Dispatcher,
  DispatcherOptions,
  DomainEvent,
  Handler,
  Middleware,
  RuntimeInfo,
} from './dispatch/types.ts';
export { instrumentDeps, instrumentPort } from './instrumentation/instrument.ts';
export { addItem } from './commands/add-item.ts';
export type { AddItem, ItemAdded } from './commands/add-item.ts';
export { commandHandlers } from './commands/index.ts';
export { createTestClient } from './testing/client.ts';
export type { TestClient, TestClientOptions } from './testing/client.ts';
