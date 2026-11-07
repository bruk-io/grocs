import type { InvitePreview } from '@grocs/ports';
import type { Deps } from '../dispatch/types.ts';

/** Who invited the signed-in person and to which kitchen, from the server, or null for a code that would not let them in (TASK-70). */
export function getInvitePreview(deps: Deps, code: string): Promise<InvitePreview | null> {
  return deps.kitchens.previewInvite(code.trim().toUpperCase());
}
