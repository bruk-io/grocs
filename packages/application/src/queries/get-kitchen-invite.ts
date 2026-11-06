import type { KitchenInvite } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/**
 * The invite the household screen shows (TASK-56): the kitchen's working code, issued fresh by the
 * server when the last one expired or was used, or 'full' once both members are in. A read, not a
 * command: asking produces no domain event, even when the server has to issue a new code.
 */
export function getKitchenInvite(deps: Deps, kitchenId: string): Promise<KitchenInvite> {
  return deps.kitchens.inviteForKitchen(kitchenId);
}
