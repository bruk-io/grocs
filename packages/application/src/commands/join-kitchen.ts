import { err, ok } from '@grocs/core';
import type { JoinRejectedReason } from '@grocs/ports';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Join a kitchen with an invite code (R3). A refused join is a normal result carrying its reason. */
export interface JoinKitchen {
  readonly type: 'JoinKitchen';
  readonly code: string;
}

export interface KitchenJoined extends DomainEvent {
  readonly type: 'KitchenJoined';
  readonly kitchenId: string;
}

export interface KitchenJoinRejected extends DomainEvent {
  readonly type: 'KitchenJoinRejected';
  readonly reason: JoinRejectedReason;
}

export async function joinKitchen(command: JoinKitchen, ctx: CommandContext): Promise<CommandResult> {
  const { auth, kitchens } = ctx.deps;
  if (!auth.currentUser()) return err({ code: 'not-signed-in', message: 'joining a kitchen needs a signed-in member' });

  const outcome = await kitchens.joinKitchen(command.code.trim());
  const event: KitchenJoined | KitchenJoinRejected =
    outcome.kind === 'joined'
      ? { type: 'KitchenJoined', kitchenId: outcome.kitchenId }
      : { type: 'KitchenJoinRejected', reason: outcome.reason };
  return ok([event]);
}
