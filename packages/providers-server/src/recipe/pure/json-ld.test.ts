import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findRecipeJsonLd } from './json-ld.ts';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const fixture = (name: string): string => readFileSync(join(FIXTURES, name), 'utf-8');

describe('findRecipeJsonLd', () => {
  // AC#4: a Recipe reached only through a WebPage's mainEntity is found.
  it('finds a Recipe node reached only through mainEntity', () => {
    const result = findRecipeJsonLd(fixture('hand-main-entity.html'));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('Hand-made Mushroom Risotto');
  });

  // AC#4: a malformed ld+json block is skipped, not thrown, and the next valid block is used.
  it('skips a malformed ld+json block and finds the valid one that follows', () => {
    const result = findRecipeJsonLd(fixture('hand-malformed-then-valid.html'));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('Hand-made Roast Chicken');
  });

  // AC#2: a page with no Recipe JSON-LD at all gives not-a-recipe.
  it('gives not-a-recipe for a page with no application/ld+json block', () => {
    expect(findRecipeJsonLd(fixture('hand-no-json-ld.html'))).toEqual({ ok: false, error: 'not-a-recipe' });
  });

  // AC#1, #4: real-site fixtures, one per site, each with a different shape (no site-specific code: the
  // reader finds every one of these through the same search order).
  it.each([
    ['nyt-cooking.html', 'top-level object, @type a single string', 'Marcella Hazan’s Tomato Sauce'],
    ['serious-eats.html', 'top-level array, @type a list', 'The Best Chili Ever'],
    ['allrecipes.html', 'top-level array, @type a list with more than one entry', 'Banana Banana Bread'],
    ['recipetineats.html', 'Recipe inside a top-level @graph array, @type a plain string', 'Easy Chinese Beef Stir Fry'],
    ['food52.html', 'Recipe is the last of three ld+json blocks on the page', 'Weeknight Chili'],
  ] as const)('finds the Recipe node in %s (%s)', (file, _shape, title) => {
    const result = findRecipeJsonLd(fixture(file));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe(title);
  });

  // AC#5: no branch here reads a hostname, URL or site name; the fixtures above prove it by being found anyway.

  it('is not fooled by other application/ld+json nodes that are not Recipe', () => {
    const html = `<!DOCTYPE html><html><head>
      <script type="application/ld+json">{"@type":"WebSite","name":"Not a recipe"}</script>
      <script type="application/ld+json">{"@type":"Recipe","name":"The Actual Recipe"}</script>
    </head><body></body></html>`;
    const result = findRecipeJsonLd(html);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('The Actual Recipe');
  });

  it('accepts a script tag whose attributes are in a different order and case', () => {
    const html = `<!DOCTYPE html><html><head>
      <script data-id="x" TYPE='APPLICATION/LD+JSON'>{"@type":"Recipe","name":"Case Insensitive Recipe"}</script>
    </head><body></body></html>`;
    const result = findRecipeJsonLd(html);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('Case Insensitive Recipe');
  });

  it('finds a Recipe whose @type is a list containing Recipe, inside a top-level array', () => {
    const html = `<script type="application/ld+json">[{"@type":["Recipe","NewsArticle"],"name":"List Type Recipe"}]</script>`;
    const result = findRecipeJsonLd(html);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('List Type Recipe');
  });

  it('finds a Recipe inside a @graph that is a single object, not a list', () => {
    const html = `<script type="application/ld+json">{"@graph":{"@type":"Recipe","name":"Single Graph Recipe"}}</script>`;
    const result = findRecipeJsonLd(html);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.value['name']).toBe('Single Graph Recipe');
  });

  it('gives not-a-recipe when every ld+json block is some other type', () => {
    const html = `<script type="application/ld+json">{"@type":"WebSite","name":"Not a recipe"}</script>`;
    expect(findRecipeJsonLd(html)).toEqual({ ok: false, error: 'not-a-recipe' });
  });
});
