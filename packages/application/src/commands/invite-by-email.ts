import { err, ok } from '@grocs/core';
import type { InviteByEmailRejectedReason } from '@grocs/ports';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Invite my partner to our kitchen by their email (R2, TASK-78). A refusal is a normal result carrying its reason. */
export interface InviteByEmail {
  readonly type: 'InviteByEmail';
  readonly kitchenId: string;
  readonly email: string;
}

export interface PartnerInvited extends DomainEvent {
  readonly type: 'PartnerInvited';
  readonly kitchenId: string;
  /** The address as stored: trimmed and lower case. */
  readonly email: string;
}

export interface InviteRejected extends DomainEvent {
  readonly type: 'InviteRejected';
  readonly reason: InviteByEmailRejectedReason;
}

export async function inviteByEmail(command: InviteByEmail, ctx: CommandContext): Promise<CommandResult> {
  const { auth, kitchens } = ctx.deps;
  if (!auth.currentUser()) return err({ code: 'not-signed-in', message: 'inviting needs a signed-in member' });
  const outcome = await kitchens.inviteByEmail(command.kitchenId, command.email);
  const event: PartnerInvited | InviteRejected =
    outcome.kind === 'invited' ? { type: 'PartnerInvited', kitchenId: command.kitchenId, email: outcome.email } : { type: 'InviteRejected', reason: outcome.reason };
  return ok([event]);
}
