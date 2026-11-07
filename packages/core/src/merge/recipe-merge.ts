// Merging two copies of the same kitchen recipe (decision-16, R20, R46). A recipe's content is
// written once by the import that created it and never restamped, so there is no per-field
// last-write-wins: the earlier copy's content (and who/when it was added) wins outright, exactly
// as mergeMeal picks `first` for its id-level fields. Only `deleted` is a per-field stamp, and a
// delete always wins over a later copy, including a re-import that carries `deleted: null`
// (decision-16, resolved: delete wins over re-import).
import type { Recipe } from '../model/recipe.ts';
import { laterStamp } from './lww.ts';

/**
 * Merge two copies of one kitchen recipe. `first` is the copy with the earlier createdAt, ties
 * broken by addedBy (as mergeMeal does); its content, addedBy and createdAt are kept as-is, since
 * a recipe's content has no field-level tiebreak. `deleted` is the later of the two stamps, so a
 * tombstone is permanent and a copy with `deleted: null` (a re-import) can never clear it.
 * Commutative, associative and idempotent.
 */
export function mergeRecipe(a: Recipe, b: Recipe): Recipe {
  if (a.id !== b.id) throw new Error(`cannot merge different recipes: ${a.id} and ${b.id}`);
  const first = a.createdAt < b.createdAt || (a.createdAt === b.createdAt && a.addedBy <= b.addedBy) ? a : b;
  return {
    id: a.id,
    addedBy: first.addedBy,
    createdAt: first.createdAt,
    sourceUrl: first.sourceUrl,
    title: first.title,
    yield: first.yield,
    steps: first.steps,
    ingredients: first.ingredients,
    image: first.image,
    deleted: laterStamp(a.deleted, b.deleted),
  };
}

export const isRecipeDeleted = (recipe: Recipe): boolean => recipe.deleted !== null;
