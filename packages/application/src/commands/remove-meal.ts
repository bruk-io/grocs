import { err, ok, removeMeal } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Remove a meal. The delete is permanent and never removes grocery items (R20). */
export interface RemoveMeal {
  readonly type: 'RemoveMeal';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly mealId: string;
}

export interface MealRemoved extends DomainEvent {
  readonly type: 'MealRemoved';
  readonly mealId: string;
  readonly weekId: string;
}

export async function removeMealCommand(command: RemoveMeal, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'removing a meal needs a signed-in member' });

  const meals = await syncStore.getMeals(command.kitchenId, command.weekId);
  const meal = meals.find((m) => m.id === command.mealId);
  if (!meal) return err({ code: 'meal-not-found', message: "the meal is not on this week's plan" });

  const removed = removeMeal(meal, { at: clock.now(), by: user.uid });
  await syncStore.mergeMeal(command.kitchenId, removed);
  const event: MealRemoved = { type: 'MealRemoved', mealId: meal.id, weekId: command.weekId };
  return ok([event]);
}
