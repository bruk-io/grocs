// The fixed aisle list (R11), as data for both Groceries' row chips and Quick add's picker chip
// group, so the two screens never drift onto two different lists.
import { AISLES } from '@grocs/core';
import type { AisleOption } from '@grocs/ui';

export const AISLE_OPTIONS: readonly AisleOption[] = AISLES.map((a) => ({ id: a.id, label: a.label }));

/** Whether `id` is one of the fixed aisles, so a value a screen cannot trust (such as a suggestion) is never preselected or sent as a choice. */
export function isAisleId(id: string): boolean {
  return AISLES.some((a) => a.id === id);
}
