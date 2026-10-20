import { err, ok } from '@grocs/core';
import type { CommandContext, CommandResult, DomainEvent } from '../dispatch/types.ts';

/** Make our kitchen, with the signed-in member as its first (R2). */
export interface CreateKitchen {
  readonly type: 'CreateKitchen';
  readonly name: string;
  readonly timeZone: string;
}

export interface KitchenCreated extends DomainEvent {
  readonly type: 'KitchenCreated';
  readonly kitchenId: string;
  readonly inviteCode: string;
}

export async function createKitchen(command: CreateKitchen, ctx: CommandContext): Promise<CommandResult> {
  const { auth, kitchens } = ctx.deps;
  if (!auth.currentUser()) return err({ code: 'not-signed-in', message: 'creating a kitchen needs a signed-in member' });
  if (command.name.trim() === '') return err({ code: 'empty-name', message: 'the kitchen name is empty' });

  const created = await kitchens.createKitchen(command.name, command.timeZone);
  const event: KitchenCreated = { type: 'KitchenCreated', kitchenId: created.kitchenId, inviteCode: created.inviteCode };
  return ok([event]);
}
