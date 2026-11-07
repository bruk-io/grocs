// Contract §9 (decision-15). Held to core-purity and import-layers' pure-folder rule: no
// third-party HTML library (none allowed), no network, clock or I/O. Reads a page's raw
// application/ld+json script blocks and finds the one Recipe node, if any.
import { err, ok } from '@grocs/core';
import type { Result } from '@grocs/core';

export type RecipeJsonLd = Readonly<Record<string, unknown>>;

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Matches every `<script ...>...</script>` block, attribute order and case free; the type is checked separately. */
const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const LD_JSON_TYPE = /type\s*=\s*(["'])\s*application\/ld\+json\s*\1/i;

function hasRecipeType(node: unknown): node is JsonObject {
  if (!isObject(node)) return false;
  const type = node['@type'];
  if (typeof type === 'string') return type === 'Recipe';
  if (Array.isArray(type)) return type.includes('Recipe');
  return false;
}

/**
 * Candidate nodes in contract order: the top-level object, a top-level array's entries, `@graph`
 * entries (found on the top-level object or any of its array entries), then one level of
 * `mainEntity` on any node already collected. The first candidate whose `@type` is `Recipe` wins.
 */
function collectCandidates(root: unknown): readonly JsonObject[] {
  const topLevel: JsonObject[] = isObject(root) ? [root] : [];
  const topArray: JsonObject[] = Array.isArray(root) ? root.filter(isObject) : [];

  const graph: JsonObject[] = [];
  for (const node of [...topLevel, ...topArray]) {
    const value = node['@graph'];
    if (Array.isArray(value)) graph.push(...value.filter(isObject));
    else if (isObject(value)) graph.push(value);
  }

  const mainEntities: JsonObject[] = [];
  for (const node of [...topLevel, ...topArray, ...graph]) {
    const value = node['mainEntity'];
    if (isObject(value)) mainEntities.push(value);
  }

  return [...topLevel, ...topArray, ...graph, ...mainEntities];
}

function findRecipeNode(root: unknown): JsonObject | null {
  for (const candidate of collectCandidates(root)) {
    if (hasRecipeType(candidate)) return candidate;
  }
  return null;
}

/**
 * Reads every `<script type="application/ld+json">` block in document order (skipping blocks
 * that fail to parse) and returns the first `Recipe` node found by `collectCandidates`'s search
 * order. No site-specific code: every page is read the same way.
 */
export function findRecipeJsonLd(html: string): Result<RecipeJsonLd, 'not-a-recipe'> {
  for (const match of html.matchAll(SCRIPT_PATTERN)) {
    const attributes = match[1] ?? '';
    if (!LD_JSON_TYPE.test(attributes)) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(match[2] ?? '');
    } catch {
      continue;
    }

    const node = findRecipeNode(parsed);
    if (node) return ok(node);
  }
  return err('not-a-recipe');
}
