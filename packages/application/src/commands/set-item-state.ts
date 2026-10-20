import { err, ok, setItemState } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Tick an item into the cart, or untick it back to to-buy (R13, R14). */
export interface SetItemState {
  readonly type: 'SetItemState';
  readonly kitchenId: string;
  readonly weekId: string;
  readonly itemId: string;
  readonly inCart: boolean;
}

export interface ItemMovedToCart extends DomainEvent {
  readonly type: 'ItemMovedToCart';
  readonly itemId: string;
  readonly weekId: string;
}

export interface ItemMovedBack extends DomainEvent {
  readonly type: 'ItemMovedBack';
  readonly itemId: string;
  readonly weekId: string;
}

export async function setItemStateCommand(command: SetItemState, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'ticking an item needs a signed-in member' });

  const items = await syncStore.getItems(command.kitchenId, command.weekId);
  const item = items.find((i) => i.id === command.itemId);
  if (!item) return err({ code: 'item-not-found', message: "the item is not on this week's list" });

  const next = setItemState(item, command.inCart ? 'in-cart' : 'to-buy', { at: clock.now(), by: user.uid });
  await syncStore.mergeItem(command.kitchenId, next);
  const event: ItemMovedToCart | ItemMovedBack = {
    type: command.inCart ? 'ItemMovedToCart' : 'ItemMovedBack',
    itemId: item.id,
    weekId: command.weekId,
  };
  return ok([event]);
}
