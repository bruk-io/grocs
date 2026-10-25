import { err, ok, relinkMeal, renameMeal } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Rename and relink a meal together, matching AddMealScreen's single name+link form (R6, R7). */
export interface EditMeal {
  readonly type: 'EditMeal';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly mealId: string;
  readonly name: string;
  readonly link: string | null;
}

export interface MealEdited extends DomainEvent {
  readonly type: 'MealEdited';
  readonly mealId: string;
  readonly weekId: string;
}

export async function editMeal(command: EditMeal, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'editing a meal needs a signed-in member' });

  const meals = await syncStore.getMeals(command.kitchenId, command.weekId);
  const meal = meals.find((m) => m.id === command.mealId);
  if (!meal) return err({ code: 'meal-not-found', message: "the meal is not on this week's plan" });

  const stamp = { at: clock.now(), by: user.uid };
  const renamed = renameMeal(meal, command.name, stamp);
  if (!renamed.ok) return err({ code: renamed.error, message: 'the meal name is empty' });
  const relinked = relinkMeal(renamed.value, command.link, stamp);
  if (!relinked.ok) return err({ code: relinked.error, message: 'the meal link is not a valid http or https URL' });

  await syncStore.mergeMeal(command.kitchenId, relinked.value);
  const event: MealEdited = { type: 'MealEdited', mealId: meal.id, weekId: command.weekId };
  return ok([event]);
}
