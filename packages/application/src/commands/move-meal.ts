import { err, moveMeal, ok, toDayIndex } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Move a meal to another day, in the same week or a different one (R7). */
export interface MoveMeal {
  readonly type: 'MoveMeal';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly mealId: string;
  readonly toWeekId: string;
  readonly toDayIndex: number;
}

export interface MealMoved extends DomainEvent {
  readonly type: 'MealMoved';
  readonly mealId: string;
  readonly fromWeekId: string;
  readonly toWeekId: string;
}

export async function moveMealCommand(command: MoveMeal, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'moving a meal needs a signed-in member' });

  const dayIndex = toDayIndex(command.toDayIndex);
  if (dayIndex === null) return err({ code: 'invalid-day', message: 'the day is outside the week' });

  const meals = await syncStore.getMeals(command.kitchenId, command.weekId);
  const meal = meals.find((m) => m.id === command.mealId);
  if (!meal) return err({ code: 'meal-not-found', message: "the meal is not on this week's plan" });

  const moved = moveMeal(meal, command.toWeekId, dayIndex, { at: clock.now(), by: user.uid });
  await syncStore.mergeMeal(command.kitchenId, moved);
  const event: MealMoved = { type: 'MealMoved', mealId: meal.id, fromWeekId: command.weekId, toWeekId: command.toWeekId };
  return ok([event]);
}
