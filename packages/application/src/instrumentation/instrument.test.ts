import { FakeClock, MemoryLogger, SequentialIds } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { instrumentDeps, instrumentPort } from './instrument.ts';
import { InMemorySyncStore, FakeAuth } from '@grocs/ports/testing';

const correlation = { correlationId: 'corr-1', runtime: { appVersion: '1.2.3', platform: 'ios', kitchenRole: 'owner' } };

class Thing {
  #secret = 41;
  syncValue(): number {
    return this.#secret + 1;
  }
  async asyncValue(): Promise<string> {
    return 'done';
  }
  boom(): never {
    throw new Error('sync boom');
  }
  async asyncBoom(): Promise<never> {
    throw new Error('async boom');
  }
  readonly plain = 7;
}

describe('instrumentPort (R31)', () => {
  const setup = () => {
    const logger = new MemoryLogger();
    const thing = instrumentPort('thing', new Thing(), logger, new FakeClock(), correlation);
    return { logger, thing };
  };

  it('passes calls through, including to classes with private fields', async () => {
    const { thing } = setup();
    expect(thing.syncValue()).toBe(42);
    expect(await thing.asyncValue()).toBe('done');
    expect(thing.plain).toBe(7);
  });

  it('logs port, method, duration, outcome and the correlation id', async () => {
    const { thing, logger } = setup();
    thing.syncValue();
    await thing.asyncValue();
    const records = logger.records();
    expect(records.map((r) => r.attributes['method'])).toEqual(['syncValue', 'asyncValue']);
    expect(records[0]).toMatchObject({ severity: 'debug', correlationId: 'corr-1', attributes: { port: 'thing', outcome: 'ok', durationMs: 0, platform: 'ios', kitchenRole: 'owner', appVersion: '1.2.3' } });
  });

  it('logs and rethrows a synchronous error and an asynchronous one', async () => {
    const { thing, logger } = setup();
    expect(() => thing.boom()).toThrow('sync boom');
    await expect(thing.asyncBoom()).rejects.toThrow('async boom');
    const [a, b] = logger.records();
    expect(a).toMatchObject({ severity: 'error', attributes: { outcome: 'error', error: { name: 'Error', message: 'sync boom' } } });
    expect(b?.attributes['error']).toMatchObject({ message: 'async boom' });
  });

  it('wraps every provider a command uses', async () => {
    const logger = new MemoryLogger();
    const deps = instrumentDeps(
      { syncStore: new InMemorySyncStore(), auth: new FakeAuth(), clock: new FakeClock(), ids: new SequentialIds() },
      logger,
      new FakeClock(),
      correlation,
    );
    deps.clock.now();
    deps.ids.newId();
    deps.auth.currentUser();
    await deps.syncStore.getItems('k', 'w');
    expect(logger.records().map((r) => r.attributes['port'])).toEqual(['clock', 'ids', 'auth', 'syncStore']);
  });
});
