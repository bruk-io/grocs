// The stored shape of an imported recipe (R30, decision-16). Providers call decodeRecipe on read
// and encodeRecipe on write and never invent their own shape. Content is stored plain, not as
// {v,at,by}: decision-16 never restamps it after import. Changing this shape bumps
// RECIPE_SCHEMA_VERSION and adds a migration test (R54).
import type { ParsedIngredient, Recipe } from '../model/recipe.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';
import type { SchemaError } from './item-doc.ts';

export const RECIPE_SCHEMA_VERSION = 1;

/** The document stored for one recipe. Personal fields: see personal.ts. */
export interface RecipeDoc {
  readonly schemaVersion: typeof RECIPE_SCHEMA_VERSION;
  readonly id: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly sourceUrl: string;
  readonly title: string;
  readonly yield: string | null;
  readonly steps: readonly string[];
  readonly ingredients: readonly { line: string; quantity: string | null; unit: string | null; item: string | null }[];
  readonly image: string | null;
  readonly deleted: { at: number; by: string } | null;
}

export function encodeRecipe(recipe: Recipe): RecipeDoc {
  return {
    schemaVersion: RECIPE_SCHEMA_VERSION,
    id: recipe.id,
    addedBy: recipe.addedBy,
    createdAt: recipe.createdAt,
    sourceUrl: recipe.sourceUrl,
    title: recipe.title,
    yield: recipe.yield,
    steps: [...recipe.steps],
    ingredients: recipe.ingredients.map((i) => ({ line: i.line, quantity: i.quantity, unit: i.unit, item: i.item })),
    image: recipe.image,
    deleted: recipe.deleted ? { at: recipe.deleted.at, by: recipe.deleted.by } : null,
  };
}

const bad = (path: string, message: string): Result<never, SchemaError> => err({ kind: 'invalid', path, message });
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const isString = (v: unknown): v is string => typeof v === 'string';
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v !== '';
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string';

function readStamp(raw: unknown, path: string): Result<{ at: number; by: string }, SchemaError> {
  if (!isObject(raw)) return bad(path, 'expected an object');
  if (typeof raw['at'] !== 'number' || !Number.isFinite(raw['at'])) return bad(`${path}.at`, 'expected a number');
  if (typeof raw['by'] !== 'string' || raw['by'] === '') return bad(`${path}.by`, 'expected a non-empty string');
  return ok({ at: raw['at'], by: raw['by'] });
}

function readSteps(raw: unknown, path: string): Result<readonly string[], SchemaError> {
  if (!Array.isArray(raw)) return bad(path, 'expected a list of strings');
  const steps: string[] = [];
  for (const [index, step] of raw.entries()) {
    if (!isString(step)) return bad(`${path}.${index}`, 'expected a string');
    steps.push(step);
  }
  return ok(steps);
}

function readIngredient(raw: unknown, path: string): Result<ParsedIngredient, SchemaError> {
  if (!isObject(raw)) return bad(path, 'expected an object');
  if (!isNonEmptyString(raw['line'])) return bad(`${path}.line`, 'expected a non-empty string');
  if (!isNullableString(raw['quantity'])) return bad(`${path}.quantity`, 'expected a string or null');
  if (!isNullableString(raw['unit'])) return bad(`${path}.unit`, 'expected a string or null');
  if (!isNullableString(raw['item'])) return bad(`${path}.item`, 'expected a string or null');
  return ok({ line: raw['line'], quantity: raw['quantity'], unit: raw['unit'], item: raw['item'] });
}

function readIngredients(raw: unknown, path: string): Result<readonly ParsedIngredient[], SchemaError> {
  if (!Array.isArray(raw)) return bad(path, 'expected a list of ingredients');
  const ingredients: ParsedIngredient[] = [];
  for (const [index, entry] of raw.entries()) {
    const r = readIngredient(entry, `${path}.${index}`);
    if (!r.ok) return r;
    ingredients.push(r.value);
  }
  return ok(ingredients);
}

/** Validate data read from the store (or anywhere else) and turn it into a Recipe. */
export function decodeRecipe(raw: unknown): Result<Recipe, SchemaError> {
  if (!isObject(raw)) return bad('', 'expected an object');
  if (raw['schemaVersion'] !== RECIPE_SCHEMA_VERSION) {
    return err({
      kind: 'unsupported-version',
      path: 'schemaVersion',
      message: `expected version ${RECIPE_SCHEMA_VERSION}, found ${String(raw['schemaVersion'])}`,
    });
  }
  for (const key of ['id', 'addedBy', 'sourceUrl'] as const) {
    if (typeof raw[key] !== 'string' || raw[key] === '') return bad(key, 'expected a non-empty string');
  }
  if (typeof raw['createdAt'] !== 'number' || !Number.isFinite(raw['createdAt'])) return bad('createdAt', 'expected a number');
  if (!isNonEmptyString(raw['title'])) return bad('title', 'expected a non-empty string');
  if (!isNullableString(raw['yield'])) return bad('yield', 'expected a string or null');
  const steps = readSteps(raw['steps'], 'steps');
  if (!steps.ok) return steps;
  const ingredients = readIngredients(raw['ingredients'], 'ingredients');
  if (!ingredients.ok) return ingredients;
  if (!isNullableString(raw['image'])) return bad('image', 'expected a string or null');
  let deleted: { at: number; by: string } | null = null;
  if (raw['deleted'] !== null) {
    const d = readStamp(raw['deleted'], 'deleted');
    if (!d.ok) return d;
    deleted = d.value;
  }
  return ok({
    id: raw['id'] as string,
    addedBy: raw['addedBy'] as string,
    createdAt: raw['createdAt'],
    sourceUrl: raw['sourceUrl'] as string,
    title: raw['title'],
    yield: raw['yield'],
    steps: steps.value,
    ingredients: ingredients.value,
    image: raw['image'],
    deleted,
  });
}
