import { isMealDeleted } from '@grocs/core';
import type { Meal } from '@grocs/core';
import type { Unsubscribe } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/**
 * Follow one week's planned meals. `onMeals` gets the meals to show (deleted ones removed, in the
 * order they were added) now and whenever either phone changes the plan. Reads go through the
 * application layer like commands do, so screens never call a port (R28). There is no core
 * WeekList equivalent for meals, so the filter and order live here, mirroring visibleItems.
 */
export function watchWeekMeals(
  deps: Deps,
  kitchenId: string,
  weekId: string,
  onMeals: (meals: readonly Meal[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return deps.syncStore.watchMeals(
    kitchenId,
    weekId,
    (meals) => {
      const visible = meals
        .filter((m) => !isMealDeleted(m))
        .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1));
      onMeals(visible);
    },
    onError,
  );
}
