import { AISLES, aisleNameKey, createExtraItem, err, ok, stamped } from '@grocs/core';
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
  if (command.aisle !== undefined && !AISLES.some((a) => a.id === command.aisle)) {
    return err({ code: 'invalid-aisle', message: 'the aisle is not one of the fixed list' });
  }

  // With no aisle given, take what the kitchen's earlier choices remember for this name (R11,
  // R14); a failed lookup never blocks the add, it just leaves the item at the default aisle.
  let aisle = command.aisle;
  if (aisle === undefined) {
    const nameKey = aisleNameKey(command.name);
    if (nameKey !== '') {
      aisle = (await syncStore.aisleFor(command.kitchenId, nameKey).catch(() => null)) ?? undefined;
    }
  }

  const made = createExtraItem(
    {
      id: ids.newId(),
      weekId: command.weekId,
      name: command.name,
      ...(command.amount !== undefined ? { amount: command.amount } : {}),
      ...(aisle !== undefined ? { aisle } : {}),
      ...(command.mealId !== undefined ? { badges: [command.mealId] } : {}),
    },
    { at: clock.now(), by: user.uid },
  );
  if (!made.ok) return err({ code: made.error, message: 'the item name is empty' });

  await syncStore.mergeItem(command.kitchenId, made.value);

  // An aisle the kitchen chose teaches the memory for next time. The write already landed above;
  // this never delays the command's result (R16), since a stalled write's promise would not
  // settle while offline (decision-7), and a rejection here must not fail the add either.
  if (command.aisle !== undefined) {
    const nameKey = aisleNameKey(command.name);
    void syncStore.rememberAisle(command.kitchenId, nameKey, stamped(command.aisle, { at: clock.now(), by: user.uid })).catch(() => undefined);
  }

  const event: ItemAdded = { type: 'ItemAdded', itemId: made.value.id, weekId: command.weekId };
  return ok([event]);
}
