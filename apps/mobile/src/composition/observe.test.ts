// R33: the handlers are installed once and log what decision-8 says, without messages or paths.
import { MemoryLogger, FakeClock, SequentialIds } from '@grocs/ports/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ObserveGlobals } from './observe.ts';

// The module keeps the installed observer, so each test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import('./observe.ts');
}

function fakes() {
  let handler: ((error: unknown, isFatal?: boolean) => void) | undefined;
  const previous = vi.fn();
  let onUnhandled: ((id: number, error: unknown) => void) | undefined;
  const globals: ObserveGlobals = {
    errorUtils: {
      getGlobalHandler: () => previous,
      setGlobalHandler: (h) => {
        handler = h;
      },
    },
    hermes: {
      enablePromiseRejectionTracker: (options) => {
        expect(options.allRejections).toBe(true);
        onUnhandled = options.onUnhandled;
      },
    },
  };
  const logger = new MemoryLogger();
  const options = { logger, clock: new FakeClock(), ids: new SequentialIds('t'), globals };
  return { logger, options, previous, fatal: (e: unknown, f?: boolean) => handler?.(e, f), reject: (e: unknown) => onUnhandled?.(1, e) };
}

describe('installObservers', () => {
  beforeEach(() => vi.resetModules());

  it('logs an uncaught error with its name and fatality, never its message, and calls the previous handler', async () => {
    const { installObservers } = await load();
    const f = fakes();
    installObservers(f.options);
    const error = Object.assign(new Error('permission denied for Oat milk'), { code: 'permission-denied' });
    f.fatal(error, true);
    expect(f.previous).toHaveBeenCalledWith(error, true);
    const [record] = f.logger.records();
    expect(record).toMatchObject({ severity: 'error', attributes: { source: 'global', isFatal: true, error: { name: 'Error', code: 'permission-denied' } } });
    expect(record?.correlationId).toMatch(/^app-/);
    expect(JSON.stringify(f.logger.records())).not.toContain('Oat milk');
  });

  it('logs an unhandled rejection through the Hermes tracker', async () => {
    const { installObservers } = await load();
    const f = fakes();
    installObservers(f.options);
    f.reject(new TypeError('boom'));
    expect(f.logger.records()[0]).toMatchObject({ severity: 'error', attributes: { source: 'rejection', error: { name: 'TypeError' } } });
  });

  it('still installs the error handler when HermesInternal is missing', async () => {
    const { installObservers } = await load();
    const f = fakes();
    installObservers({ ...f.options, globals: { errorUtils: f.options.globals.errorUtils } });
    f.fatal(new Error('x'));
    expect(f.logger.records()).toHaveLength(1);
  });

  it('installs once: a second call hooks nothing and returns the same observer', async () => {
    const { installObservers } = await load();
    const f = fakes();
    const first = installObservers(f.options);
    const set = vi.spyOn(f.options.globals.errorUtils!, 'setGlobalHandler');
    expect(installObservers(f.options)).toBe(first);
    expect(set).not.toHaveBeenCalled();
  });

  it('logs screen changes by route pattern and adds the route to a later render error', async () => {
    const { installObservers, observer, routePattern } = await load();
    const f = fakes();
    installObservers(f.options);
    observer().screen(routePattern(['week', '[weekId]']));
    observer().error('render', new Error('x'));
    expect(f.logger.records()[0]).toMatchObject({ severity: 'info', attributes: { source: 'screen', route: '/week/[weekId]' } });
    expect(f.logger.records()[1]).toMatchObject({ attributes: { source: 'render', route: '/week/[weekId]' } });
  });

  it('does nothing before it is installed', async () => {
    const { observer } = await load();
    expect(() => observer().screen('/')).not.toThrow();
  });
});
