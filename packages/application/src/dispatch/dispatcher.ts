import { err } from '@grocs/core';
import type { Command, CommandContext, CommandResult, Dispatcher, DispatcherOptions } from './types.ts';

/**
 * The one way a command runs (R32). Gives the command a correlation id and its ports, then runs
 * the middleware chain around the handler. A handler that throws becomes an `internal` error
 * result, so callers get a result for every command and never an exception.
 */
export function createDispatcher(options: DispatcherOptions): Dispatcher {
  const { handlers, depsFor, runtime, ids, middleware = [] } = options;

  return {
    async dispatch(command: Command): Promise<CommandResult> {
      const correlation = { correlationId: ids.newId(), runtime };
      const ctx: CommandContext = { ...correlation, deps: depsFor(correlation) };
      const handler = handlers[command.type] as ((c: Command, x: CommandContext) => Promise<CommandResult>) | undefined;

      const run = async (): Promise<CommandResult> => {
        if (!handler) return err({ code: 'unknown-command', message: `no handler for command ${command.type}` });
        try {
          return await handler(command, ctx);
        } catch (e) {
          return err({ code: 'internal', message: e instanceof Error ? e.message : 'unknown error' });
        }
      };

      const chain = middleware.reduceRight<() => Promise<CommandResult>>(
        (next, mw) => () => mw(command, ctx, next),
        run,
      );
      return chain();
    },
  };
}
