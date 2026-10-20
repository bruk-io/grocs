// The global handlers (R33, decision-8): uncaught errors, unhandled rejections, render errors and screen
// changes all log through one Logger, with one correlation id (`app-<id>`) per app start. Installed once,
// from createNativeApp(), before the first render. Nothing here touches the console (R37).
//
// What a record may hold: the source, the error's name and code, and the route pattern. Never an error
// message (an SDK message can quote document data and redaction matches keys, not free text), never a
// pathname or search params (they carry ids and typed text).
import type { Clock, IdGenerator, Logger } from '@grocs/ports';

export interface Observer {
  /** Logs an error at `error` severity with the source and, when known, the route pattern. */
  error(source: 'global' | 'rejection' | 'render', error: unknown, extra?: Readonly<Record<string, unknown>>): void;
  /** Logs a screen change at `info`. `route` is a pattern such as `/week/[weekId]`. */
  screen(route: string): void;
}

type ErrorHandler = (error: unknown, isFatal?: boolean) => void;

export interface ObserveGlobals {
  readonly errorUtils?: { getGlobalHandler(): ErrorHandler; setGlobalHandler(handler: ErrorHandler): void } | undefined;
  readonly hermes?: { enablePromiseRejectionTracker?: (options: { allRejections: boolean; onUnhandled: (id: number, error: unknown) => void }) => void } | undefined;
}

export interface ObserveOptions {
  readonly logger: Logger;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  /** The runtime globals to hook. Defaults to the real ones; tests pass fakes. */
  readonly globals?: ObserveGlobals;
}

const NOOP: Observer = { error: () => undefined, screen: () => undefined };
let installed: Observer | null = null;
let lastRoute: string | undefined;

/** The route pattern for the segments `useSegments()` gives: `['week', '[weekId]']` is `/week/[weekId]`. */
export function routePattern(segments: readonly string[]): string {
  return `/${segments.join('/')}`;
}

/** Name and code only. The message is withheld, as decision-8 does for errors that are not ours. */
function describe(error: unknown): { name: string; code?: string; message: string } {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return { name: error.name, ...(typeof code === 'string' ? { code } : {}), message: '[message withheld]' };
  }
  return { name: 'NonError', message: '[message withheld]' };
}

function createObserver({ logger, clock, ids }: Pick<ObserveOptions, 'logger' | 'clock' | 'ids'>): Observer {
  const correlationId = `app-${ids.newId()}`;
  return {
    error(source, error, extra = {}) {
      logger.log({
        timestamp: clock.now(),
        severity: 'error',
        message: `${source} error`,
        attributes: { source, ...extra, ...(lastRoute ? { route: lastRoute } : {}), error: describe(error) },
        correlationId,
      });
    },
    screen(route) {
      lastRoute = route;
      logger.log({ timestamp: clock.now(), severity: 'info', message: 'screen', attributes: { source: 'screen', route }, correlationId });
    },
  };
}

/**
 * Installs the handlers, once: a second call returns the first call's observer and changes nothing.
 * The previous global handler is kept and called, so the red box in development and the crash
 * behaviour in release do not change.
 */
export function installObservers(options: ObserveOptions): Observer {
  if (installed) return installed;
  const observed = createObserver(options);
  const globals = options.globals ?? defaultGlobals();

  const previous = globals.errorUtils?.getGlobalHandler();
  globals.errorUtils?.setGlobalHandler((error, isFatal) => {
    observed.error('global', error, { isFatal: isFatal === true });
    previous?.(error, isFatal);
  });

  // Hermes' tracker is not a public API: without it, rejections go unlogged but the app still runs.
  globals.hermes?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id, error) => observed.error('rejection', error),
  });

  installed = observed;
  return observed;
}

/** The installed observer, or one that does nothing (the demo build, and tests that install none). */
export function observer(): Observer {
  return installed ?? NOOP;
}

function defaultGlobals(): ObserveGlobals {
  return {
    errorUtils: typeof ErrorUtils === 'undefined' ? undefined : ErrorUtils,
    hermes: (globalThis as { HermesInternal?: ObserveGlobals['hermes'] }).HermesInternal,
  };
}
