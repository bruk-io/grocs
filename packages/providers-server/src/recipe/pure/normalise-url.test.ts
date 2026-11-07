import { describe, expect, it } from 'vitest';
import { createMeal, relinkMeal } from '@grocs/core';
import { normaliseRecipeUrl } from './normalise-url.ts';

const STAMP = { at: 1, by: 'alice' };

describe('normaliseRecipeUrl', () => {
  // AC#1: golden table of at least 10 input/output pairs, each naming the rule it proves.
  const table: readonly [name: string, input: string, output: string][] = [
    ['root path collapses to no path', 'https://x.com/', 'https://x.com'],
    ['host is lowercased', 'https://X.COM/path', 'https://x.com/path'],
    ['utm_Source is dropped (case-insensitive prefix)', 'https://x.com/path?utm_Source=abc&id=5', 'https://x.com/path?id=5'],
    ['fbclid is dropped', 'https://x.com/path?fbclid=123&id=5', 'https://x.com/path?id=5'],
    ['gclid is dropped', 'https://x.com/path?gclid=123&id=5', 'https://x.com/path?id=5'],
    ['remaining params are sorted by raw key then raw value', 'https://x.com/path?b=2&a=2&a=1', 'https://x.com/path?a=1&a=2&b=2'],
    ['%20 is kept as written, not re-encoded', 'https://x.com/path?q=%20hello', 'https://x.com/path?q=%20hello'],
    ['the fragment is dropped', 'https://x.com/path#section', 'https://x.com/path'],
    ['a non-default port is kept', 'https://x.com:8443/path', 'https://x.com:8443/path'],
    ['a default port is dropped', 'https://x.com:443/path', 'https://x.com/path'],
    ['the input is trimmed', '  https://x.com/path  ', 'https://x.com/path'],
    ['one trailing slash on a non-root path is stripped', 'https://x.com/path/', 'https://x.com/path'],
  ];

  it.each(table)('%s', (_name, input, output) => {
    expect(normaliseRecipeUrl(input)).toEqual({ ok: true, value: output });
  });

  // AC#1: 'ftp://x' and 'https://u:p@x.com' both -> invalid-url.
  const invalid: readonly [name: string, input: string][] = [
    ['a non-http(s) protocol is invalid-url', 'ftp://x.com/path'],
    ['userinfo makes the URL invalid-url', 'https://u:p@x.com/path'],
    ['unparseable input is invalid-url', 'not a url at all'],
    ['empty input is invalid-url', ''],
  ];

  it.each(invalid)('%s', (_name, input) => {
    expect(normaliseRecipeUrl(input)).toEqual({ ok: false, error: 'invalid-url' });
  });

  it('is idempotent: normalising the output again changes nothing', () => {
    for (const [, input] of table) {
      const once = normaliseRecipeUrl(input);
      if (!once.ok) throw new Error('expected ok');
      const twice = normaliseRecipeUrl(once.value);
      expect(twice).toEqual(once);
    }
  });

  it('its output passes core relinkMeal', () => {
    const meal = createMeal({ id: 'm1', weekId: 'w1', dayIndex: 0, name: 'Dinner' }, STAMP);
    if (!meal.ok) throw new Error('expected ok');

    const normalised = normaliseRecipeUrl('https://X.COM/Path/?utm_source=abc&b=2&a=1#frag');
    if (!normalised.ok) throw new Error('expected ok');

    const relinked = relinkMeal(meal.value, normalised.value, STAMP);
    expect(relinked).toEqual({ ok: true, value: { ...meal.value, link: { value: normalised.value, stamp: STAMP } } });
  });
});
