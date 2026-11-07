import { err, ok } from '@grocs/core';
import type { AcceptRejectedReason } from '@grocs/ports';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/**
 * Join the kitchen that invited me (R3, TASK-78), leaving the one I am in, if any. A refused join is
 * a normal result carrying its reason.
 */
export interface AcceptInvite {
  readonly type: 'AcceptInvite';
  readonly kitchenId: string;
}

export interface KitchenJoined extends DomainEvent {
  readonly type: 'KitchenJoined';
  readonly kitchenId: string;
}

export interface KitchenJoinRejected extends DomainEvent {
  readonly type: 'KitchenJoinRejected';
  readonly reason: AcceptRejectedReason;
}

export async function acceptInvite(command: AcceptInvite, ctx: CommandContext): Promise<CommandResult> {
  const { auth, kitchens } = ctx.deps;
  if (!auth.currentUser()) return err({ code: 'not-signed-in', message: 'joining a kitchen needs a signed-in member' });
  const outcome = await kitchens.acceptInvite(command.kitchenId);
  const event: KitchenJoined | KitchenJoinRejected =
    outcome.kind === 'joined' ? { type: 'KitchenJoined', kitchenId: outcome.kitchenId } : { type: 'KitchenJoinRejected', reason: outcome.reason };
  return ok([event]);
}
