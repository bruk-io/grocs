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

  const clearedIds: string[] = [];
  for (const item of inCart) {
    const cleared = clearFromCart(item, stamp);
    await syncStore.mergeItem(command.kitchenId, cleared);
    clearedIds.push(cleared.id);
  }

  const event: CartCleared = { type: 'CartCleared', weekId: command.weekId, itemIds: clearedIds };
  return ok([event]);
}
