import { err, ok } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Take back the invite to our kitchen before it is used (TASK-78). */
export interface CancelInvite {
  readonly type: 'CancelInvite';
  readonly kitchenId: string;
}

export interface InviteCancelled extends DomainEvent {
  readonly type: 'InviteCancelled';
  readonly kitchenId: string;
}

export async function cancelInvite(command: CancelInvite, ctx: CommandContext): Promise<CommandResult> {
  const { auth, kitchens } = ctx.deps;
  if (!auth.currentUser()) return err({ code: 'not-signed-in', message: 'cancelling an invite needs a signed-in member' });
  await kitchens.cancelInvite(command.kitchenId);
  const event: InviteCancelled = { type: 'InviteCancelled', kitchenId: command.kitchenId };
  return ok([event]);
}
