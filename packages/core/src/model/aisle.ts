// Aisles (R9, R11): a fixed, ordered list an item's aisle maps into for grouping a list to buy.
import type { Item } from './item.ts';
import { normaliseName } from './item.ts';
import type { Stamp } from '../merge/lww.ts';
import { stamped } from '../merge/lww.ts';

/** The fixed, ordered list of aisles. The ids match the existing section icons. */
const AISLE_DEFS = [
  { id: 'produce', label: 'Produce' },
  { id: 'dairy', label: 'Dairy & eggs' },
  { id: 'meat', label: 'Meat' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'other', label: 'Other' },
] as const satisfies readonly { readonly id: string; readonly label: string }[];

/** One of the fixed aisle ids, derived from AISLES so the two cannot drift. Any other string an item carries groups as 'other' (R11). */
export type AisleId = (typeof AISLE_DEFS)[number]['id'];

export interface AisleDef {
  readonly id: AisleId;
  readonly label: string;
}

export const AISLES: readonly AisleDef[] = AISLE_DEFS;

const AISLE_IDS: ReadonlySet<string> = new Set(AISLES.map((a) => a.id));

/** Maps any string an item's aisle field may carry to a known aisle id; an unknown one is 'other' (R11). */
export function aisleSection(aisle: string): AisleId {
  return AISLE_IDS.has(aisle) ? (aisle as AisleId) : 'other';
}

export interface AisleGroup {
  readonly id: AisleId;
  readonly label: string;
  readonly items: readonly Item[];
}

/** Groups items by aisle, in AISLES order; an aisle with no items is left out. */
export function groupByAisle(items: readonly Item[]): readonly AisleGroup[] {
  const byId = new Map<AisleId, Item[]>();
  for (const item of items) {
    const id = aisleSection(item.aisle.value);
    const bucket = byId.get(id);
    if (bucket) bucket.push(item);
    else byId.set(id, [item]);
  }
  return AISLES.filter((def) => byId.has(def.id)).map((def) => ({
    id: def.id,
    label: def.label,
    items: byId.get(def.id) ?? [],
  }));
}

/** The key the aisle memory stores a name's remembered aisle under (R11, R14; decision-7). */
export function aisleNameKey(name: string): string {
  return encodeURIComponent(normaliseName(name));
}

/**
 * Change an item's aisle (R18): only the aisle is restamped; everything else is unchanged.
 * Two copies reconcile the usual way, via mergeItem's field-level last-write-wins rule.
 */
export function setItemAisle(item: Item, aisle: string, stamp: Stamp): Item {
  return { ...item, aisle: stamped(aisle, stamp) };
}
