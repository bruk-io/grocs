// Live page fetcher (decision-15, contract TASK-74 §10). Impure: this is the one place the recipe
// code touches the network, so it lives outside pure/. A DNS-rebinding attacker answers the first
// lookup with a public address and a later one with a private address; checking the host and then
// letting the normal resolver pick the address again would let the second lookup answer
// differently. createGuardedLookup is the fix: it is itself the resolver the connection uses, so
// the address that was checked is the address that gets connected to.
import { isIP } from 'node:net';
import type { LookupFunction } from 'node:net';
import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import type { IncomingMessage } from 'node:http';
import type { RecipeImportError } from '@grocs/core';
import { isAllowedTarget, isPublicAddress } from './pure/address.ts';
import { errorForStatus } from './pure/status.ts';

export type FetchedPage = { readonly kind: 'page'; readonly html: string } | { readonly kind: 'failed'; readonly error: RecipeImportError };
export type FetchPage = (normalisedUrl: string) => Promise<FetchedPage>;

export type ResolveHost = (host: string) => Promise<readonly { readonly address: string; readonly family: 4 | 6 }[]>;

/**
 * A node:net LookupFunction that resolves with `resolve` and errors (code 'EBLOCKED') unless
 * every address isPublicAddress; it hands the checked address to the socket, so the connection
 * goes to the address that was checked.
 */
export function createGuardedLookup(resolve: ResolveHost): LookupFunction {
  return (hostname, options, callback) => {
    resolve(hostname).then(
      (addresses) => {
        if (addresses.length === 0 || addresses.some((a) => !isPublicAddress(a.address))) {
          const blocked = new Error('address not allowed') as NodeJS.ErrnoException;
          blocked.code = 'EBLOCKED';
          callback(blocked, '', 0);
          return;
        }
        const wantsAll = typeof options === 'object' && options !== null && (options as { all?: boolean }).all === true;
        if (wantsAll) {
          callback(null, addresses.map((a) => ({ address: a.address, family: a.family })), undefined);
          return;
        }
        const first = addresses[0]!;
        callback(null, first.address, first.family);
      },
      () => {
        callback(new Error('lookup failed') as NodeJS.ErrnoException, '', 0);
      },
    );
  };
}

export interface RawResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: AsyncIterable<Uint8Array>;
}

export type Transport = (
  url: URL,
  init: { readonly headers: Readonly<Record<string, string>>; readonly signal: AbortSignal; readonly lookup: LookupFunction },
) => Promise<RawResponse>;

export interface LiveFetchOptions {
  readonly transport?: Transport;
  readonly resolve?: ResolveHost;
  readonly timeoutMs?: number;
  readonly maxBytes?: number;
  readonly maxRedirects?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;

/** Browser-like, fixed: no cookie jar and no credentials ever leave on a request (TASK-74.4 AC#1). */
const REQUEST_HEADERS: Readonly<Record<string, string>> = {
  'User-Agent': 'Mozilla/5.0 (compatible; GrocsRecipeImporter/1.0; +https://grocs.app)',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

/** Strips a bracket pair and a zone id from a URL's hostname, leaving the bare address isPublicAddress judges. */
function bareLiteral(hostname: string): string {
  const unbracketed = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
  const percent = unbracketed.indexOf('%');
  return percent >= 0 ? unbracketed.slice(0, percent) : unbracketed;
}

/** Null for a name that still needs DNS; the bare address (brackets and zone id stripped) for an IP literal. */
function literalAddress(hostname: string): string | null {
  const bare = bareLiteral(hostname);
  return isIP(bare) !== 0 ? bare : null;
}

function mimeTypeOf(contentType: string): string {
  return (contentType.split(';')[0] ?? '').trim().toLowerCase();
}

function charsetOf(contentType: string): string {
  const match = /charset\s*=\s*"?([^;"]+)"?/i.exec(contentType);
  return match?.[1]?.trim() ?? 'utf-8';
}

function decode(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    // An unrecognised label falls back to utf-8 (contract §10), the same as a missing charset.
    return new TextDecoder('utf-8').decode(bytes);
  }
}

function concatBytes(chunks: readonly Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function defaultResolve(host: string): Promise<readonly { readonly address: string; readonly family: 4 | 6 }[]> {
  const results = await dnsLookup(host, { all: true });
  return results.map((r) => ({ address: r.address, family: r.family === 6 ? 6 : 4 }));
}

/** node:http/https, with no automatic redirects and no cookie jar: the fetcher follows redirects and sets headers itself. */
const defaultTransport: Transport = (url, init) =>
  new Promise((resolve, reject) => {
    const requestFn = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = requestFn(url, { agent: false, headers: init.headers, lookup: init.lookup, signal: init.signal }, (res: IncomingMessage) => {
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(res.headers)) {
        if (value === undefined) continue;
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
      resolve({ status: res.statusCode ?? 0, headers, body: res });
    });
    req.on('error', reject);
    req.end();
  });

/**
 * Fetches a normalised recipe URL and returns its HTML, or a reason it could not. Every refusal
 * (disallowed scheme or port, a private or unresolvable address, a timeout, a redirect loop, a
 * non-HTML Content-Type, a body over the cap, or a transport failure) maps to a FetchedPage error;
 * the function never throws and no returned or thrown value contains the URL.
 */
export function createLiveFetchPage(options: LiveFetchOptions = {}): FetchPage {
  const transport = options.transport ?? defaultTransport;
  const resolve = options.resolve ?? defaultResolve;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  return async (normalisedUrl: string): Promise<FetchedPage> => {
    const failed = (error: RecipeImportError): FetchedPage => ({ kind: 'failed', error });

    let current: URL;
    try {
      current = new URL(normalisedUrl);
    } catch {
      return failed('unreachable');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const lookup = createGuardedLookup(resolve);

    try {
      let redirectsFollowed = 0;
      for (;;) {
        if (!isAllowedTarget(current)) return failed('unreachable');
        const literal = literalAddress(current.hostname);
        if (literal !== null && !isPublicAddress(literal)) return failed('unreachable');

        let response: RawResponse;
        try {
          response = await transport(current, { headers: REQUEST_HEADERS, signal: controller.signal, lookup });
        } catch {
          return failed('unreachable');
        }

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers['location'];
          if (!location || redirectsFollowed >= maxRedirects) return failed('unreachable');
          redirectsFollowed += 1;
          try {
            current = new URL(location, current);
          } catch {
            return failed('unreachable');
          }
          continue;
        }

        const statusError = errorForStatus(response.status);
        if (statusError) return failed(statusError);

        const contentType = response.headers['content-type'] ?? '';
        const mimeType = mimeTypeOf(contentType);
        if (mimeType !== 'text/html' && mimeType !== 'application/xhtml+xml') return failed('not-a-recipe');

        const chunks: Uint8Array[] = [];
        let total = 0;
        try {
          for await (const chunk of response.body) {
            total += chunk.byteLength;
            if (total > maxBytes) return failed('unreachable');
            chunks.push(chunk);
          }
        } catch {
          return failed('unreachable');
        }

        return { kind: 'page', html: decode(concatBytes(chunks, total), charsetOf(contentType)) };
      }
    } finally {
      clearTimeout(timer);
    }
  };
}
