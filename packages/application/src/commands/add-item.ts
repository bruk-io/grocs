import { createExtraItem, err, ok } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Add an item to a week's grocery list, as an extra or for a meal (R10). */
export interface AddItem {
  readonly type: 'AddItem';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly name: string;
  readonly amount?: string;
  readonly aisle?: string;
  /** The meal this item is for, if any - absent means an extra. */
  readonly mealId?: string;
}

export interface ItemAdded extends DomainEvent {
  readonly type: 'ItemAdded';
  readonly itemId: string;
  readonly weekId: string;
}

export async function addItem(command: AddItem, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, ids, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'adding an item needs a signed-in member' });

  const made = createExtraItem(
    {
      id: ids.newId(),
      weekId: command.weekId,
      name: command.name,
      ...(command.amount !== undefined ? { amount: command.amount } : {}),
      ...(command.aisle !== undefined ? { aisle: command.aisle } : {}),
      ...(command.mealId !== undefined ? { badges: [command.mealId] } : {}),
    },
    { at: clock.now(), by: user.uid },
  );
  if (!made.ok) return err({ code: made.error, message: 'the item name is empty' });

  await syncStore.mergeItem(command.kitchenId, made.value);
  const event: ItemAdded = { type: 'ItemAdded', itemId: made.value.id, weekId: command.weekId };
  return ok([event]);
}
