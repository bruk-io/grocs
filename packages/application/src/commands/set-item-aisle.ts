import { AISLES, aisleNameKey, err, ok, setItemAisle, stamped } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Change an item's aisle (R11, R18); the kitchen's choice teaches the aisle memory for next time. */
export interface SetItemAisle {
  readonly type: 'SetItemAisle';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly itemId: string;
  readonly aisle: string;
}

export interface ItemAisleChanged extends DomainEvent {
  readonly type: 'ItemAisleChanged';
  readonly itemId: string;
  readonly weekId: string;
}

export async function setItemAisleCommand(command: SetItemAisle, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'changing an aisle needs a signed-in member' });
  if (!AISLES.some((a) => a.id === command.aisle)) {
    return err({ code: 'invalid-aisle', message: 'the aisle is not one of the fixed list' });
  }

  const items = await syncStore.getItems(command.kitchenId, command.weekId);
  const item = items.find((i) => i.id === command.itemId);
  if (!item) return err({ code: 'item-not-found', message: "the item is not on this week's list" });

  const stamp = { at: clock.now(), by: user.uid };
  const next = setItemAisle(item, command.aisle, stamp);
  await syncStore.mergeItem(command.kitchenId, next);

  // Teaches the memory for next time; never delays the result (R16) and a rejection must not
  // fail a change that already landed.
  const nameKey = aisleNameKey(item.name.value);
  void syncStore.rememberAisle(command.kitchenId, nameKey, stamped(command.aisle, stamp)).catch(() => undefined);

  const event: ItemAisleChanged = { type: 'ItemAisleChanged', itemId: item.id, weekId: command.weekId };
  return ok([event]);
}
