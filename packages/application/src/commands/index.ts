import type { Handler } from '../dispatch/types.ts';
import { addItem } from './add-item.ts';
import { createKitchen } from './create-kitchen.ts';
import { joinKitchen } from './join-kitchen.ts';

/** Every command by type. Adding a command means adding it here, and a scenario test beside it (R47). */
export const commandHandlers: Readonly<Record<string, Handler<never>>> = {
  AddItem: addItem as Handler<never>,
  CreateKitchen: createKitchen as Handler<never>,
  JoinKitchen: joinKitchen as Handler<never>,
};
