import { err, ok } from '@grocs/core';
import { FakeAuth, FakeClock, InMemorySyncStore, SequentialIds } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { createDispatcher } from './dispatcher.ts';
import type { Deps, Handler, Middleware } from './types.ts';

const runtime = { appVersion: 't', platform: 't', kitchenRole: 't' };
const deps = (): Deps => ({ syncStore: new InMemorySyncStore(), auth: new FakeAuth(), clock: new FakeClock(), ids: new SequentialIds() });

describe('dispatcher (R32)', () => {
  it('gives each command a fresh correlation id and passes it to the handler', async () => {
    const seen: string[] = [];
    const handler: Handler<{ type: 'Ping' }> = async (_c, ctx) => {
      seen.push(ctx.correlationId);
      return ok([]);
    };
    const d = createDispatcher({ handlers: { Ping: handler as Handler<never> }, depsFor: deps, runtime, ids: new SequentialIds('c') });
    await d.dispatch({ type: 'Ping' });
    await d.dispatch({ type: 'Ping' });
    expect(seen).toEqual(['c-1', 'c-2']);
  });

  it('runs middleware around the handler, outermost first', async () => {
    const order: string[] = [];
    const tag = (name: string): Middleware => async (_c, _x, next) => {
      order.push(`${name} in`);
      const r = await next();
      order.push(`${name} out`);
      return r;
    };
    const handler = (async () => {
      order.push('handler');
      return ok([]);
    }) as Handler<never>;
    const d = createDispatcher({ handlers: { Ping: handler }, depsFor: deps, runtime, ids: new SequentialIds(), middleware: [tag('a'), tag('b')] });
    await d.dispatch({ type: 'Ping' });
    expect(order).toEqual(['a in', 'b in', 'handler', 'b out', 'a out']);
  });

  it('turns a throwing handler into an internal error result', async () => {
    const handler = (async () => {
      throw new Error('boom');
    }) as Handler<never>;
    const d = createDispatcher({ handlers: { Ping: handler }, depsFor: deps, runtime, ids: new SequentialIds() });
    expect(await d.dispatch({ type: 'Ping' })).toEqual(err({ code: 'internal', message: 'boom' }));
  });

  it('answers an unknown command type', async () => {
    const d = createDispatcher({ handlers: {}, depsFor: deps, runtime, ids: new SequentialIds() });
    const r = await d.dispatch({ type: 'Nope' });
    expect(!r.ok && r.error.code).toBe('unknown-command');
  });
});
