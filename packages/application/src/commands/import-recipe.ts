import { err, groceryLineFor, isMealDeleted, isRecipeDeleted, ok, recipeFromImport, relinkMeal } from '@grocs/core';
import type { GroceryLine } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Paste a recipe link onto a meal: import it, save the kitchen recipe and relink the meal (contract TASK-74 §8). */
export interface ImportRecipe {
  readonly type: 'ImportRecipe';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly mealId: string;
  readonly url: string;
}

export interface RecipeImported extends DomainEvent {
  readonly type: 'RecipeImported';
  readonly recipeId: string;
  readonly mealId: string;
  readonly weekId: string;
  /** The normalised URL the meal now links to; the screen puts it in its link field. */
  readonly sourceUrl: string;
  /** One per ingredient, in recipe order, from core groceryLineFor. The screen dispatches one AddItem per line. */
  readonly groceries: readonly GroceryLine[];
}

const IMPORT_FAILED = 'the recipe could not be imported';

export async function importRecipe(command: ImportRecipe, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore, recipeImporter } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'importing a recipe needs a signed-in member' });

  const meals = await syncStore.getMeals(command.kitchenId, command.weekId);
  const meal = meals.find((m) => m.id === command.mealId && !isMealDeleted(m));
  if (!meal) return err({ code: 'meal-not-found', message: "the meal is not on this week's plan" });

  const imported = await recipeImporter.importRecipe(command.url);
  if (!imported.ok) return err({ code: imported.error, message: IMPORT_FAILED });
  const parsed = imported.value;

  const recipes = await syncStore.getRecipes(command.kitchenId);
  const existing = recipes.find((recipe) => recipe.id === parsed.recipeId);
  if (existing && isRecipeDeleted(existing)) {
    return err({ code: 'recipe-deleted', message: 'that recipe was removed from this kitchen' });
  }

  const stamp = { at: clock.now(), by: user.uid };
  const relinked = relinkMeal(meal, parsed.sourceUrl, stamp);
  if (!relinked.ok) return err({ code: 'internal', message: IMPORT_FAILED });

  await syncStore.mergeRecipe(command.kitchenId, recipeFromImport(parsed, stamp));
  await syncStore.mergeMeal(command.kitchenId, relinked.value);

  const event: RecipeImported = {
    type: 'RecipeImported',
    recipeId: parsed.recipeId,
    mealId: command.mealId,
    weekId: command.weekId,
    sourceUrl: parsed.sourceUrl,
    groceries: parsed.ingredients.map(groceryLineFor),
  };
  return ok([event]);
}
