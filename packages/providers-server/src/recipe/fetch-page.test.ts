import { describe, expect, it } from 'vitest';
import type { RawResponse, ResolveHost, Transport } from './fetch-page.ts';
import { createGuardedLookup, createLiveFetchPage } from './fetch-page.ts';

const PUBLIC_V4 = { address: '93.184.216.34', family: 4 as const };
const PUBLIC_V6 = { address: '2606:4700::1', family: 6 as const };
const PRIVATE_V4 = { address: '127.0.0.1', family: 4 as const };

/** A ResolveHost stub that returns one queued answer per call, in order. */
function queuedResolve(answers: readonly (readonly { readonly address: string; readonly family: 4 | 6 }[])[]): ResolveHost {
  const queue = [...answers];
  return async () => {
    const next = queue.shift();
    if (!next) throw new Error('queuedResolve: no more answers queued');
    return next;
  };
}

type LookupCallbackArgs = readonly [err: NodeJS.ErrnoException | null, address: string | readonly { address: string; family: number }[], family: number | undefined];

/** A lookup callback captured as a promise, so a test awaits the one call instead of guessing a microtask count. */
function lookupResult(): { fn: (err: NodeJS.ErrnoException | null, address: string | readonly { address: string; family: number }[], family?: number) => void; result: Promise<LookupCallbackArgs> } {
  let settle!: (args: LookupCallbackArgs) => void;
  const result = new Promise<LookupCallbackArgs>((resolveResult) => {
    settle = resolveResult;
  });
  return { fn: (err, address, family) => settle([err, address, family]), result };
}

describe('createGuardedLookup', () => {
  it('passes a public answer to the callback with its family', async () => {
    const { fn, result } = lookupResult();
    const lookup = createGuardedLookup(queuedResolve([[PUBLIC_V4]]));
    lookup('example.com', {}, fn);
    expect(await result).toEqual([null, PUBLIC_V4.address, PUBLIC_V4.family]);
  });

  it('refuses a rebinding attempt: the same host resolves public, then private, on the next lookup', async () => {
    const resolve = queuedResolve([[PUBLIC_V4], [PRIVATE_V4]]);
    const lookup = createGuardedLookup(resolve);

    const first = lookupResult();
    lookup('example.com', {}, first.fn);
    const [firstErr] = await first.result;
    expect(firstErr).toBeNull();

    const second = lookupResult();
    lookup('example.com', {}, second.fn);
    const [secondErr] = await second.result;
    expect(secondErr).toBeInstanceOf(Error);
    expect((secondErr as NodeJS.ErrnoException).code).toBe('EBLOCKED');
  });

  it('refuses when any one of several answers is not public', async () => {
    const lookup = createGuardedLookup(queuedResolve([[PUBLIC_V4, PRIVATE_V4, PUBLIC_V6]]));
    const { fn, result } = lookupResult();
    lookup('example.com', {}, fn);
    const [err] = await result;
    expect((err as NodeJS.ErrnoException | null)?.code).toBe('EBLOCKED');
  });

  it('hands back every address when options.all is set', async () => {
    const lookup = createGuardedLookup(queuedResolve([[PUBLIC_V4, PUBLIC_V6]]));
    const { fn, result } = lookupResult();
    lookup('example.com', { all: true }, fn);
    expect(await result).toEqual([null, [PUBLIC_V4, PUBLIC_V6], undefined]);
  });
});

function textBody(text: string): AsyncIterable<Uint8Array> {
  return {
    async *[Symbol.asyncIterator]() {
      yield new TextEncoder().encode(text);
    },
  };
}

function bytesBody(chunks: readonly Uint8Array[]): AsyncIterable<Uint8Array> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
    },
  };
}

/** A body that records whether it was ever iterated, without ever producing its bytes if it was not. */
function trackedBody(text: string): { body: AsyncIterable<Uint8Array>; wasIterated: () => boolean } {
  let iterated = false;
  return {
    body: {
      async *[Symbol.asyncIterator]() {
        iterated = true;
        yield new TextEncoder().encode(text);
      },
    },
    wasIterated: () => iterated,
  };
}

function page(status: number, headers: Record<string, string>, body: AsyncIterable<Uint8Array>): RawResponse {
  return { status, headers, body };
}

function stubTransport(impl: Transport): { transport: Transport; calls: Parameters<Transport>[] } {
  const calls: Parameters<Transport>[] = [];
  return {
    transport: async (url, init) => {
      calls.push([url, init]);
      return impl(url, init);
    },
    calls,
  };
}

describe('createLiveFetchPage', () => {
  it('returns the page for a 200 text/html response', async () => {
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'text/html; charset=utf-8' }, textBody('<html>hi</html>')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    const result = await fetchPage('https://example.com/recipe');
    expect(result).toEqual({ kind: 'page', html: '<html>hi</html>' });
  });

  it('maps 404 to not-found', async () => {
    const { transport } = stubTransport(async () => page(404, {}, textBody('')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'not-found' });
  });

  it('maps 403 to blocked', async () => {
    const { transport } = stubTransport(async () => page(403, {}, textBody('')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'blocked' });
  });

  it('maps 500 to unreachable', async () => {
    const { transport } = stubTransport(async () => page(500, {}, textBody('')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
  });

  it('gives not-a-recipe for a non-HTML Content-Type, and never iterates the body', async () => {
    const { body, wasIterated } = trackedBody('%PDF-1.4 ...');
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'application/pdf' }, body));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    const result = await fetchPage('https://example.com/recipe.pdf');
    expect(result).toEqual({ kind: 'failed', error: 'not-a-recipe' });
    expect(wasIterated()).toBe(false);
  });

  it('gives unreachable for a body over maxBytes', async () => {
    const chunks = [new Uint8Array(4), new Uint8Array(4), new Uint8Array(4)];
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, bytesBody(chunks)));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]), maxBytes: 10 });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
  });

  it('decodes a windows-1252 charset correctly', async () => {
    // 'café' in windows-1252: 'caf' as ASCII, then 0xE9 for 'é'.
    const bytes = new Uint8Array([0x63, 0x61, 0x66, 0xe9]);
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'text/html; charset=windows-1252' }, bytesBody([bytes])));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'page', html: 'café' });
  });

  it('refuses a redirect to a private IPv4 literal as unreachable', async () => {
    const { transport, calls } = stubTransport(async (url) =>
      url.hostname === 'example.com'
        ? page(302, { location: 'http://127.0.0.1/internal' }, textBody(''))
        : page(200, { 'content-type': 'text/html' }, textBody('should not be reached')),
    );
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PUBLIC_V4]]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(calls).toHaveLength(1); // the redirect target is never actually connected to
  });

  it('refuses a redirect to a private IPv6 literal as unreachable (bracketed hostname, stripped before the address check)', async () => {
    const { transport, calls } = stubTransport(async (url) =>
      url.hostname === 'example.com'
        ? page(302, { location: 'http://[::1]/internal' }, textBody(''))
        : page(200, { 'content-type': 'text/html' }, textBody('should not be reached')),
    );
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PUBLIC_V4]]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(calls).toHaveLength(1);
  });

  it('refuses a bracketed private IPv6 literal host directly', async () => {
    const { transport, calls } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, textBody('ok')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('http://[::1]/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(calls).toHaveLength(0);
  });

  it('allows a public bracketed IPv6 literal host', async () => {
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, textBody('ok')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('http://[2606:4700::1]/recipe')).toEqual({ kind: 'page', html: 'ok' });
  });

  it('refuses a redirect carrying userinfo as unreachable, and never connects to it', async () => {
    // A different host for the redirect target than the start URL, so without the guard the
    // fetcher would actually reach the 200 below instead of merely redirect-looping: the
    // assertion on the result, not just on the call count, depends on the fix.
    const { transport, calls } = stubTransport(async (url) =>
      url.hostname === 'example.com'
        ? page(302, { location: 'https://user:pass@other.example.com/x' }, textBody(''))
        : page(200, { 'content-type': 'text/html' }, textBody('should not be reached')),
    );
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PUBLIC_V4]]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(calls).toHaveLength(1); // the redirect target carrying credentials is never connected to
  });

  it('refuses a redirect to a non-default port as unreachable', async () => {
    const { transport } = stubTransport(async (url) =>
      url.hostname === 'example.com'
        ? page(302, { location: 'https://example.com:8443/recipe' }, textBody(''))
        : page(200, { 'content-type': 'text/html' }, textBody('should not be reached')),
    );
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PUBLIC_V4], [PUBLIC_V4]]) });
    expect(await fetchPage('https://example.com/recipe')).toEqual({ kind: 'failed', error: 'unreachable' });
  });

  it('gives unreachable after more than 5 redirects', async () => {
    let hop = 0;
    const { transport } = stubTransport(async () => {
      hop += 1;
      return hop <= 6 ? page(302, { location: `https://example.com/hop-${hop}` }, textBody('')) : page(200, { 'content-type': 'text/html' }, textBody('end'));
    });
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve(Array.from({ length: 10 }, () => [PUBLIC_V4])) });
    expect(await fetchPage('https://example.com/start')).toEqual({ kind: 'failed', error: 'unreachable' });
  });

  it('allows exactly 5 redirects', async () => {
    let hop = 0;
    const { transport } = stubTransport(async () => {
      hop += 1;
      return hop <= 5 ? page(302, { location: `https://example.com/hop-${hop}` }, textBody('')) : page(200, { 'content-type': 'text/html' }, textBody('end'));
    });
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve(Array.from({ length: 10 }, () => [PUBLIC_V4])) });
    expect(await fetchPage('https://example.com/start')).toEqual({ kind: 'page', html: 'end' });
  });

  it('gives unreachable when the total deadline is exceeded across two slow hops (the deadline is total, not per-hop)', async () => {
    let hop = 0;
    const transport: Transport = (_url, init) =>
      new Promise((resolveHop, rejectHop) => {
        hop += 1;
        const result: RawResponse = hop === 1 ? page(302, { location: 'https://example.com/second' }, textBody('')) : page(200, { 'content-type': 'text/html' }, textBody('end'));
        // Each hop alone finishes well inside the deadline; only their sum does not, so this
        // only passes if the same deadline carries over from the first hop to the second.
        const timer = setTimeout(() => resolveHop(result), 40);
        init.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          rejectHop(new Error('aborted'));
        });
      });
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PUBLIC_V4], [PUBLIC_V4]]), timeoutMs: 60 });
    expect(await fetchPage('https://example.com/start')).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(hop).toBe(2); // proves the second hop really was attempted before the shared deadline fired
  });

  it('gives unreachable when the transport throws, and never includes the URL in the result', async () => {
    const { transport } = stubTransport(async () => {
      throw new Error('could not reach https://secret.example.com/path');
    });
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    const result = await fetchPage('https://example.com/recipe');
    expect(result).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(JSON.stringify(result)).not.toContain('secret.example.com');
  });

  it('sends a browser-like User-Agent, Accept and Accept-Language, no Cookie or Authorization, and the guarded lookup', async () => {
    const { transport, calls } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, textBody('ok')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([[PRIVATE_V4]]) });
    await fetchPage('https://example.com/recipe');

    expect(calls).toHaveLength(1);
    const [, init] = calls[0]!;
    // The exact key set, not just that Cookie/Authorization happen to be absent: a header this
    // fetcher never sets at all should not silently start appearing here unreviewed.
    expect(Object.keys(init.headers).sort()).toEqual(['Accept', 'Accept-Language', 'User-Agent']);
    expect(init.headers['User-Agent']).toBeTruthy();
    expect(init.headers['Accept']).toBeTruthy();
    expect(init.headers['Accept-Language']).toBeTruthy();

    // Proves init.lookup really is the guarded lookup (not just any function): with a resolve
    // stub queued to answer private, the lookup it was handed refuses.
    expect(typeof init.lookup).toBe('function');
    const { fn, result } = lookupResult();
    init.lookup('host.invalid', {}, fn);
    const [err] = await result;
    expect((err as NodeJS.ErrnoException | null)?.code).toBe('EBLOCKED');
  });

  it('refuses an IP-literal host directly (no lookup call needed) when it is private', async () => {
    const { transport, calls } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, textBody('ok')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    const result = await fetchPage('http://127.0.0.1/recipe');
    expect(result).toEqual({ kind: 'failed', error: 'unreachable' });
    expect(calls).toHaveLength(0);
  });

  it('allows a public IP-literal host', async () => {
    const { transport } = stubTransport(async () => page(200, { 'content-type': 'text/html' }, textBody('ok')));
    const fetchPage = createLiveFetchPage({ transport, resolve: queuedResolve([]) });
    expect(await fetchPage('http://93.184.216.34/recipe')).toEqual({ kind: 'page', html: 'ok' });
  });

  it('exports createGuardedLookup and createLiveFetchPage as functions (contract §10 shape)', () => {
    expect(typeof createGuardedLookup).toBe('function');
    expect(typeof createLiveFetchPage).toBe('function');
  });
});
