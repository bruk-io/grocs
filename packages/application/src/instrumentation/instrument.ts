import type { Clock, Logger } from '@grocs/ports';
import type { Correlation, Deps } from '../dispatch/types.ts';

const isPromiseLike = (v: unknown): v is PromiseLike<unknown> =>
  typeof v === 'object' && v !== null && typeof (v as { then?: unknown }).then === 'function';

/**
 * Wrap a provider so every call logs its port, method, duration, outcome and error (R31).
 * Arguments and results are never logged, so what a kitchen typed cannot leak (R36).
 * Providers and features therefore contain no logging code of their own.
 */
export function instrumentPort<P extends object>(
  portName: string,
  port: P,
  logger: Logger,
  timer: Clock,
  correlation: Correlation,
): P {
  const write = (method: string, started: number, error?: unknown): void => {
    const failed = error !== undefined;
    logger.log({
      timestamp: timer.now(),
      severity: failed ? 'error' : 'debug',
      message: `${portName}.${method} ${failed ? 'failed' : 'ok'}`,
      attributes: {
        port: portName,
        method,
        durationMs: timer.now() - started,
        outcome: failed ? 'error' : 'ok',
        ...correlation.runtime,
        ...(failed ? { error: describeError(error) } : {}),
      },
      correlationId: correlation.correlationId,
    });
  };

  return new Proxy(port, {
    get(target, prop) {
      const value: unknown = Reflect.get(target, prop, target);
      if (typeof value !== 'function' || typeof prop !== 'string') return value;
      return (...args: unknown[]): unknown => {
        const started = timer.now();
        let result: unknown;
        try {
          result = (value as (...a: unknown[]) => unknown).apply(target, args);
        } catch (e) {
          write(prop, started, e ?? new Error('thrown with nothing'));
          throw e;
        }
        if (isPromiseLike(result)) {
          return Promise.resolve(result).then(
            (v) => {
              write(prop, started);
              return v;
            },
            (e: unknown) => {
              write(prop, started, e ?? new Error('rejected with nothing'));
              throw e;
            },
          );
        }
        write(prop, started);
        return result;
      };
    },
  });
}

function describeError(error: unknown): { name: string; code?: string; message: string } {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return { name: error.name, ...(typeof code === 'string' ? { code } : {}), message: error.message.slice(0, 200) };
  }
  return { name: 'NonError', message: String(error).slice(0, 200) };
}

/** Wrap every provider in the ports a command uses. The composition root calls this once per command. */
export function instrumentDeps(deps: Deps, logger: Logger, timer: Clock, correlation: Correlation): Deps {
  return {
    syncStore: instrumentPort('syncStore', deps.syncStore, logger, timer, correlation),
    auth: instrumentPort('auth', deps.auth, logger, timer, correlation),
    clock: instrumentPort('clock', deps.clock, logger, timer, correlation),
    ids: instrumentPort('ids', deps.ids, logger, timer, correlation),
  };
}
