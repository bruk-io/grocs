// Contract §9 (decision-15). Turns the schema.org Recipe JSON-LD node that json-ld.ts finds into
// one shape, regardless of which site produced it: no site-specific code. Held to core-purity and
// import-layers' pure-folder rule, so entity decoding and tag stripping are hand-rolled here
// rather than pulled in from a third-party HTML library.
import { err, ok } from '@grocs/core';
import type { ParsedRecipe, Result } from '@grocs/core';
import { parseIngredientLine } from './ingredient-line.ts';
import { findRecipeJsonLd } from './json-ld.ts';
import type { RecipeJsonLd } from './json-ld.ts';

/** PARSER_VERSION changes whenever this reading of the schema changes, so a cached recipe can be told apart from a re-parse. */
export const PARSER_VERSION = 1;

export type RecipeContent = Omit<ParsedRecipe, 'recipeId' | 'sourceUrl'>;

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g;

/** Decodes the handful of HTML entities a recipe page's text fields use (numeric and the common named ones). An entity this table does not know is left as written. */
function decodeEntities(text: string): string {
  return text.replace(ENTITY_PATTERN, (match, body: string) => {
    if (body.startsWith('#')) {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const codePoint = Number.parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(codePoint)) return match;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Strips literal HTML tags, then decodes entities, for the title, each step and each ingredient line. */
function cleanText(text: string): string {
  return decodeEntities(text.replace(/<[^>]*>/g, '')).trim();
}

function resolveImageEntry(entry: unknown): string | null {
  if (typeof entry === 'string') return entry;
  if (typeof entry === 'object' && entry !== null) {
    const url = (entry as Record<string, unknown>)['url'];
    if (typeof url === 'string') return url;
  }
  return null;
}

/** image: a string, an ImageObject's `url`, or the first resolvable entry of a list. A bare `{ "@id": ... }` reference gives null. */
function resolveImage(image: unknown): string | null {
  if (Array.isArray(image)) {
    for (const entry of image) {
      const resolved = resolveImageEntry(entry);
      if (resolved !== null) return resolved;
    }
    return null;
  }
  return resolveImageEntry(image);
}

const isPurelyNumeric = (text: string): boolean => /^\d+(\.\d+)?$/.test(text.trim());

/** yield: a string, a number, or a list (the first entry that is not purely numeric wins, otherwise the first entry). */
function resolveYield(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const entries = value
      .map((entry) => (typeof entry === 'string' ? entry : typeof entry === 'number' ? String(entry) : null))
      .filter((entry): entry is string => entry !== null);
    if (entries.length === 0) return null;
    return entries.find((entry) => !isPurelyNumeric(entry)) ?? entries[0]!;
  }
  return null;
}

/** recipeInstructions: a string (split on newlines), a list of strings, HowToStep.text, or nested HowToSection.itemListElement, flattened. */
function resolveInstructions(value: unknown): readonly string[] {
  if (typeof value === 'string') {
    return value.split('\n');
  }
  if (Array.isArray(value)) {
    return value.flatMap(resolveInstructionEntry);
  }
  return [];
}

function resolveInstructionEntry(entry: unknown): readonly string[] {
  if (typeof entry === 'string') return [entry];
  if (typeof entry === 'object' && entry !== null) {
    const node = entry as Record<string, unknown>;
    const items = node['itemListElement'];
    if (Array.isArray(items)) return items.flatMap(resolveInstructionEntry);
    const text = node['text'];
    if (typeof text === 'string') return [text];
  }
  return [];
}

/**
 * Resolves a Recipe JSON-LD node alone, with no knowledge of which site produced it. No title, no
 * ingredients or no steps gives `incomplete-recipe`.
 */
export function parseRecipeJsonLd(node: RecipeJsonLd): Result<RecipeContent, 'incomplete-recipe'> {
  const rawTitle = node['name'];
  const title = typeof rawTitle === 'string' ? cleanText(rawTitle) : '';

  const rawIngredients = node['recipeIngredient'];
  const ingredientLines = Array.isArray(rawIngredients) ? rawIngredients.filter((entry): entry is string => typeof entry === 'string') : [];
  const ingredients = ingredientLines.map((line) => parseIngredientLine(cleanText(line)));

  const steps = resolveInstructions(node['recipeInstructions'])
    .map((step) => cleanText(step))
    .filter((step) => step !== '');

  if (title === '' || ingredients.length === 0 || steps.length === 0) {
    return err('incomplete-recipe');
  }

  return ok({
    title,
    yield: resolveYield(node['recipeYield']),
    steps,
    ingredients,
    image: resolveImage(node['image']),
  });
}

/**
 * The reader's one entry point: finds the Recipe JSON-LD in a page's HTML, then parses it. The
 * raw node is returned alongside the parsed content so the server can keep it for a later re-parse
 * (contract §9's invariant: `parseRecipeJsonLd(result.jsonLd)` equals `result.content`).
 */
export function parseRecipePage(html: string): Result<{ readonly content: RecipeContent; readonly jsonLd: RecipeJsonLd }, 'not-a-recipe' | 'incomplete-recipe'> {
  const found = findRecipeJsonLd(html);
  if (!found.ok) return err(found.error);

  const parsed = parseRecipeJsonLd(found.value);
  if (!parsed.ok) return err(parsed.error);

  return ok({ content: parsed.value, jsonLd: found.value });
}
