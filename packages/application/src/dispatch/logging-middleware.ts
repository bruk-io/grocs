import type { Clock, Logger } from '@grocs/ports';
import type { CommandResult, Middleware } from './types.ts';

/**
 * Logs every command: its type, how long it took, the outcome and the types of the events it
 * returned (R32). The command's payload is never logged, so what a kitchen typed cannot leak.
 * Every record carries the command's correlation id and the app version, platform and kitchen role.
 */
export function loggingMiddleware(logger: Logger, clock: Clock): Middleware {
  return async (command, ctx, next) => {
    const started = clock.now();
    const base = { commandType: command.type, ...ctx.runtime };
    const finish = (result: CommandResult): CommandResult => {
      const durationMs = clock.now() - started;
      const eventTypes = result.ok ? result.value.map((e) => e.type) : [];
      logger.log({
        timestamp: clock.now(),
        severity: result.ok ? 'info' : result.error.code === 'internal' ? 'error' : 'warn',
        message: `command ${command.type} ${result.ok ? 'ok' : result.error.code === 'internal' ? 'failed' : 'rejected'}`,
        attributes: {
          ...base,
          durationMs,
          outcome: result.ok ? 'ok' : result.error.code === 'internal' ? 'error' : 'rejected',
          eventTypes,
          ...(result.ok ? {} : { errorCode: result.error.code }),
        },
        correlationId: ctx.correlationId,
      });
      return result;
    };
    return finish(await next());
  };
}
