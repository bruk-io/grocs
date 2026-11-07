import { describe, expect, it } from 'vitest';
import { normaliseRecipeUrl } from './pure/normalise-url.ts';
import { recipeKey } from './recipe-key.ts';

describe('recipeKey', () => {
  it('is a 64-character lowercase hex string', () => {
    const key = recipeKey('https://example.com/recipe');
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it('gives the same key for the same input', () => {
    expect(recipeKey('https://example.com/recipe')).toBe(recipeKey('https://example.com/recipe'));
  });

  it('gives a different key for a different input', () => {
    expect(recipeKey('https://example.com/recipe-a')).not.toBe(recipeKey('https://example.com/recipe-b'));
  });

  it('gives the same key for two URLs that normalise to the same canonical form (a utm-tagged variant)', () => {
    const canonical = normaliseRecipeUrl('https://example.com/recipe');
    const tagged = normaliseRecipeUrl('https://example.com/recipe?utm_source=newsletter');
    if (!canonical.ok || !tagged.ok) throw new Error('expected both to normalise');
    expect(canonical.value).toBe(tagged.value);
    expect(recipeKey(tagged.value)).toBe(recipeKey(canonical.value));
  });
});
