import type { Handler } from '../dispatch/types.ts';
import { addItem } from './add-item.ts';

/** Every command by type. Adding a command means adding it here, and a scenario test beside it (R47). */
export const commandHandlers: Readonly<Record<string, Handler<never>>> = {
  AddItem: addItem as Handler<never>,
};
