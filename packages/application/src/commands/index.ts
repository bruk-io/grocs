import type { Handler } from '../dispatch/types.ts';
import { acceptInvite } from './accept-invite.ts';
import { addItem } from './add-item.ts';
import { addMeal } from './add-meal.ts';
import { cancelInvite } from './cancel-invite.ts';
import { clearCart } from './clear-cart.ts';
import { createKitchen } from './create-kitchen.ts';
import { editMeal } from './edit-meal.ts';
import { inviteByEmail } from './invite-by-email.ts';
import { moveMealCommand } from './move-meal.ts';
import { removeMealCommand } from './remove-meal.ts';
import { setItemStateCommand } from './set-item-state.ts';

/** Every command by type. Adding a command means adding it here, and a scenario test beside it (R47). */
export const commandHandlers: Readonly<Record<string, Handler<never>>> = {
  AcceptInvite: acceptInvite as Handler<never>,
  AddItem: addItem as Handler<never>,
  AddMeal: addMeal as Handler<never>,
  CancelInvite: cancelInvite as Handler<never>,
  ClearCart: clearCart as Handler<never>,
  CreateKitchen: createKitchen as Handler<never>,
  EditMeal: editMeal as Handler<never>,
  InviteByEmail: inviteByEmail as Handler<never>,
  MoveMeal: moveMealCommand as Handler<never>,
  RemoveMeal: removeMealCommand as Handler<never>,
  SetItemState: setItemStateCommand as Handler<never>,
};
