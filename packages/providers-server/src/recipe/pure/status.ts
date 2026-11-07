// HTTP status to import-error mapping (decision-15's exception to providers-hold-no-rules). Pure:
// takes the status code the fetcher already read and returns data, no I/O of its own.
import type { RecipeImportError } from '@grocs/core';

/** decision-15's status table: 2xx is success, a handful of codes get their own reason, everything else is just unreachable. */
export function errorForStatus(status: number): RecipeImportError | null {
  if (status >= 200 && status < 300) return null;
  if (status === 404 || status === 410) return 'not-found';
  if (status === 401 || status === 403 || status === 429) return 'blocked';
  return 'unreachable';
}
