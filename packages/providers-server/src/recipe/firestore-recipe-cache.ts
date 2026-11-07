// FirestoreRecipeCache: RecipeCache over Admin Firestore (contract TASK-74 §10, §11). Translates;
// the ordering decisions (cache hit, failure memory, saveFailure vs saveRecipe) are import-recipe.ts's,
// not this class's. Three top-level collections, Admin SDK only, never reached by an app client
// (firestore.rules gives them no match block; TASK-74.4.2's deny tests prove that).
import type { Firestore } from 'firebase-admin/firestore';
import type { ParsedRecipe, RecipeImportError } from '@grocs/core';
import type { RecipeJsonLd } from './pure/json-ld.ts';
import type { CachedFailure, CachedRecipe, CachedSource, RecipeCache } from './recipe-cache.ts';

const SCHEMA_VERSION = 1;

interface RecipeDocShape {
  readonly schemaVersion: number;
  readonly url: string;
  readonly recipe: ParsedRecipe;
  readonly parserVersion: number;
  readonly fetchedAt: number;
}

interface SourceDocShape {
  readonly schemaVersion: number;
  readonly url: string;
  /** JSON.stringify of the raw Recipe node (§11's documented deviation from decision-15: Firestore
   * cannot hold nested arrays, and recipeInstructions sections nest them). */
  readonly jsonLd: string;
  readonly fetchedAt: number;
}

interface FailureDocShape {
  readonly schemaVersion: number;
  readonly error: RecipeImportError;
  readonly failedAt: number;
}

const RECIPE_IMPORT_ERRORS: ReadonlySet<string> = new Set([
  'invalid-url',
  'not-found',
  'blocked',
  'unreachable',
  'not-a-recipe',
  'incomplete-recipe',
]);

function isParsedRecipe(value: unknown): value is ParsedRecipe {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.recipeId === 'string' &&
    typeof r.sourceUrl === 'string' &&
    typeof r.title === 'string' &&
    (typeof r.yield === 'string' || r.yield === null) &&
    Array.isArray(r.steps) &&
    Array.isArray(r.ingredients) &&
    (typeof r.image === 'string' || r.image === null)
  );
}

/** Reads a doc into the documented shape, or null for anything that does not match it exactly -
 * a decode failure is a miss, never a thrown error (contract §10). */
function decodeRecipeDoc(data: Record<string, unknown> | undefined): CachedRecipe | null {
  if (!data) return null;
  if (data.schemaVersion !== SCHEMA_VERSION) return null;
  if (typeof data.url !== 'string') return null;
  if (typeof data.parserVersion !== 'number') return null;
  if (typeof data.fetchedAt !== 'number') return null;
  if (!isParsedRecipe(data.recipe)) return null;
  return { url: data.url, recipe: data.recipe, parserVersion: data.parserVersion, fetchedAt: data.fetchedAt };
}

function decodeSourceDoc(data: Record<string, unknown> | undefined): CachedSource | null {
  if (!data) return null;
  if (data.schemaVersion !== SCHEMA_VERSION) return null;
  if (typeof data.url !== 'string') return null;
  if (typeof data.jsonLd !== 'string') return null;
  if (typeof data.fetchedAt !== 'number') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(data.jsonLd);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  return { url: data.url, jsonLd: parsed as RecipeJsonLd, fetchedAt: data.fetchedAt };
}

function decodeFailureDoc(data: Record<string, unknown> | undefined): CachedFailure | null {
  if (!data) return null;
  if (data.schemaVersion !== SCHEMA_VERSION) return null;
  if (typeof data.error !== 'string' || !RECIPE_IMPORT_ERRORS.has(data.error)) return null;
  if (typeof data.failedAt !== 'number') return null;
  return { error: data.error as RecipeImportError, failedAt: data.failedAt };
}

export class FirestoreRecipeCache implements RecipeCache {
  readonly #db: Firestore;

  constructor(db: Firestore) {
    this.#db = db;
  }

  async getRecipe(key: string): Promise<CachedRecipe | null> {
    const snap = await this.#db.doc(`recipes/${key}`).get();
    return decodeRecipeDoc(snap.exists ? (snap.data() as Record<string, unknown>) : undefined);
  }

  async getSource(key: string): Promise<CachedSource | null> {
    const snap = await this.#db.doc(`recipeSources/${key}`).get();
    return decodeSourceDoc(snap.exists ? (snap.data() as Record<string, unknown>) : undefined);
  }

  async getFailure(key: string): Promise<CachedFailure | null> {
    const snap = await this.#db.doc(`recipeFailures/${key}`).get();
    return decodeFailureDoc(snap.exists ? (snap.data() as Record<string, unknown>) : undefined);
  }

  /** Writes recipes/{key} and recipeSources/{key}, and deletes recipeFailures/{key}, in one batch
   * (§11): a reader never sees a recipe doc without its source, and a remembered failure never
   * outlives the success that superseded it. */
  async saveRecipe(key: string, recipe: CachedRecipe, source: CachedSource): Promise<void> {
    const recipeDoc: RecipeDocShape = { schemaVersion: SCHEMA_VERSION, url: recipe.url, recipe: recipe.recipe, parserVersion: recipe.parserVersion, fetchedAt: recipe.fetchedAt };
    const sourceDoc: SourceDocShape = { schemaVersion: SCHEMA_VERSION, url: source.url, jsonLd: JSON.stringify(source.jsonLd), fetchedAt: source.fetchedAt };
    const batch = this.#db.batch();
    batch.set(this.#db.doc(`recipes/${key}`), recipeDoc);
    batch.set(this.#db.doc(`recipeSources/${key}`), sourceDoc);
    batch.delete(this.#db.doc(`recipeFailures/${key}`));
    await batch.commit();
  }

  async saveFailure(key: string, failure: CachedFailure): Promise<void> {
    const failureDoc: FailureDocShape = { schemaVersion: SCHEMA_VERSION, error: failure.error, failedAt: failure.failedAt };
    await this.#db.doc(`recipeFailures/${key}`).set(failureDoc);
  }
}
