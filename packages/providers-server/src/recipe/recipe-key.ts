// Server cache key (contract TASK-74 §10, §11). Impure in the sense that it uses node:crypto, so it
// lives outside pure/; it is still deterministic (same input, same output) with no clock, randomness
// or network. The caller is responsible for passing an already-normalised URL.
import { createHash } from 'node:crypto';

/** sha256 hex of `normalisedUrl`, used as the document id under recipes/, recipeSources/ and recipeFailures/. */
export function recipeKey(normalisedUrl: string): string {
  return createHash('sha256').update(normalisedUrl, 'utf8').digest('hex');
}
