import { createMeal, err, ok, toDayIndex } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Plan a meal for a day of a week (R5 to R8). */
export interface AddMeal {
  readonly type: 'AddMeal';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly dayIndex: number;
  readonly name: string;
  readonly link?: string | null;
}

export interface MealAdded extends DomainEvent {
  readonly type: 'MealAdded';
  readonly mealId: string;
  readonly weekId: string;
}

export async function addMeal(command: AddMeal, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, ids, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'adding a meal needs a signed-in member' });

  const dayIndex = toDayIndex(command.dayIndex);
  if (dayIndex === null) return err({ code: 'invalid-day', message: 'the day is outside the week' });

  const made = createMeal(
    {
      id: ids.newId(),
      weekId: command.weekId,
      dayIndex,
      name: command.name,
      ...(command.link !== undefined ? { link: command.link } : {}),
    },
    { at: clock.now(), by: user.uid },
  );
  if (!made.ok) {
    const message = made.error === 'empty-name' ? 'the meal name is empty' : 'the meal link is not a valid http or https URL';
    return err({ code: made.error, message });
  }

  await syncStore.mergeMeal(command.kitchenId, made.value);
  const event: MealAdded = { type: 'MealAdded', mealId: made.value.id, weekId: command.weekId };
  return ok([event]);
}
