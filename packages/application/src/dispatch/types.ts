import type { Result } from '@grocs/core';
import type { AuthPort, Clock, IdGenerator, KitchenGateway, Logger, SyncStore } from '@grocs/ports';

export interface Command {
  readonly type: string;
}

export interface DomainEvent {
  readonly type: string;
}

/** A command that could not be carried out. `code` is stable and for the UI; `message` is for people reading logs. */
export interface CommandError {
  readonly code: string;
  readonly message: string;
}

export type CommandResult = Result<readonly DomainEvent[], CommandError>;

/** The ports a command may use. Only the application layer calls them (R28). */
export interface Deps {
  readonly syncStore: SyncStore;
  readonly auth: AuthPort;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  /**
   * Optional only until the composition roots supply it (TASK-1.20.2), which makes it required.
   * The kitchen commands answer `kitchens-unavailable` while it is missing.
   */
  readonly kitchens?: KitchenGateway;
}

/** Facts attached to every log record written while a command runs (R32). */
export interface RuntimeInfo {
  readonly appVersion: string;
  readonly platform: string;
  readonly kitchenRole: string;
}

export interface Correlation {
  readonly correlationId: string;
  readonly runtime: RuntimeInfo;
}

export interface CommandContext extends Correlation {
  /** The ports, wrapped for this command so their log records carry its correlation id. */
  readonly deps: Deps;
}

export type Handler<C extends Command = never> = (command: C, ctx: CommandContext) => Promise<CommandResult>;

/** Wraps command handling. Call `next` to continue down the chain. */
export type Middleware = (command: Command, ctx: CommandContext, next: () => Promise<CommandResult>) => Promise<CommandResult>;

export interface DispatcherOptions {
  readonly handlers: Readonly<Record<string, Handler<never>>>;
  /** Builds the ports for one command. The composition root returns instrumented providers (R31). */
  readonly depsFor: (correlation: Correlation) => Deps;
  readonly runtime: RuntimeInfo;
  readonly ids: IdGenerator;
  readonly middleware?: readonly Middleware[];
}

export interface Dispatcher {
  dispatch(command: Command): Promise<CommandResult>;
}

export type { Logger };
