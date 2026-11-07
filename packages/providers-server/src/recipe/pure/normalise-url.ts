// Recipe URL normalisation (decision-15's exception to providers-hold-no-rules). Pure: no clock,
// randomness or I/O, so the same link always yields the same cache key (contract TASK-74 §9).
import { err, ok } from '@grocs/core';
import type { Result } from '@grocs/core';

const TRACKING_EXACT = new Set(['fbclid', 'gclid']);
const isTrackingKey = (key: string): boolean => /^utm_/i.test(key) || TRACKING_EXACT.has(key.toLowerCase());

/** Splits one `key=value` query part on its first `=`; a part with none is its own key with an empty value. */
function splitPart(part: string): readonly [key: string, value: string] {
  const eq = part.indexOf('=');
  return eq >= 0 ? [part.slice(0, eq), part.slice(eq + 1)] : [part, ''];
}

/** Code-unit order, not locale order: the golden table must not depend on where it runs. */
function compareRaw(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Canonicalises a recipe link into the server's cache key (contract §9, steps 1-7): rejects
 * anything but a plain http(s) URL with no userinfo, lowercases and drops a default port via
 * WHATWG host parsing, strips every trailing slash, drops tracking parameters and the fragment, and
 * sorts the remaining query by its raw (unencoded) key then value. Everything else - encoding,
 * path casing - is kept exactly as written: this is a key, not a normal form for display.
 */
export function normaliseRecipeUrl(raw: string): Result<string, 'invalid-url'> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return err('invalid-url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return err('invalid-url');
  if (url.username !== '' || url.password !== '') return err('invalid-url');

  const host = url.host;
  const path = url.pathname.replace(/\/+$/, '');

  const rawQuery = url.search.startsWith('?') ? url.search.slice(1) : url.search;
  const kept = rawQuery
    .split('&')
    .filter((part) => part !== '' && !isTrackingKey(splitPart(part)[0]))
    .sort((a, b) => {
      const [aKey, aValue] = splitPart(a);
      const [bKey, bValue] = splitPart(b);
      const byKey = compareRaw(aKey, bKey);
      return byKey !== 0 ? byKey : compareRaw(aValue, bValue);
    });
  const query = kept.join('&');

  return ok(`${url.protocol}//${host}${path}${query ? `?${query}` : ''}`);
}
