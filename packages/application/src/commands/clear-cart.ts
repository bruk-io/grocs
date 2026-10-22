import { clearFromCart, err, ok } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Clear every in-cart item for a week in one command (R14, R17, R18). */
export interface ClearCart {
  readonly type: 'ClearCart';
  readonly kitchenId: string;
  readonly weekId: string;
}

export interface CartCleared extends DomainEvent {
  readonly type: 'CartCleared';
  readonly weekId: string;
  readonly itemIds: readonly string[];
}

export async function clearCart(command: ClearCart, ctx: CommandContext): Promise<CommandResult> {
  const { auth, clock, syncStore } = ctx.deps;
  const user = auth.currentUser();
  if (!user) return err({ code: 'not-signed-in', message: 'clearing the cart needs a signed-in member' });

  const items = await syncStore.getItems(command.kitchenId, command.weekId);
  const inCart = items.filter((item) => item.state.value === 'in-cart');
  const stamp = { at: clock.now(), by: user.uid };

  const attemptedIds: string[] = [];
  for (const item of inCart) {
    const cleared = clearFromCart(item, stamp);
    await syncStore.mergeItem(command.kitchenId, cleared);
    attemptedIds.push(cleared.id);
  }

  // A tick stamped at the same instant as this clear can win the merge's field-level LWW tie-break
  // (R18), leaving the item still in-cart: re-check what's actually stored so the event never
  // claims an item was cleared when it was not.
  const after = await syncStore.getItems(command.kitchenId, command.weekId);
  const clearedNow = new Set(after.filter((item) => item.state.value === 'cleared').map((item) => item.id));
  const clearedIds = attemptedIds.filter((id) => clearedNow.has(id));

  const event: CartCleared = { type: 'CartCleared', weekId: command.weekId, itemIds: clearedIds };
  return ok([event]);
}
