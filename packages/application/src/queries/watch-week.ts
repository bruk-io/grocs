import { visibleItems } from '@grocs/core';
import type { Item } from '@grocs/core';
import type { Unsubscribe } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/**
 * Follow one week's grocery list. `onItems` gets the items to show (deleted ones removed, in the
 * order they were added) now and whenever either phone changes the list. Reads go through the
 * application layer like commands do, so screens never call a port (R28).
 */
export function watchWeekItems(
  deps: Deps,
  kitchenId: string,
  weekId: string,
  onItems: (items: readonly Item[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return deps.syncStore.watchItems(
    kitchenId,
    weekId,
    (items) => onItems(visibleItems({ weekId, items: Object.fromEntries(items.map((i) => [i.id, i])) })),
    onError,
  );
}
