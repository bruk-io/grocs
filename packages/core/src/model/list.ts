import { mergeItem } from '../merge/item-merge.ts';
import type { Stamp } from '../merge/lww.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';
import { createExtraItem } from './item.ts';
import type { Item, NewItemError, NewItemInput } from './item.ts';

/** The grocery list for one week: items by id. A deleted item stays as a tombstone so it cannot come back (R20). */
export interface WeekList {
  readonly weekId: string;
  readonly items: Readonly<Record<string, Item>>;
}

export const emptyList = (weekId: string): WeekList => ({ weekId, items: {} });

export type AddItemError = NewItemError | 'wrong-week' | 'duplicate-id';

/** Add an extra item (no meal) to a week's list. Returns the new list and the item that was added. */
export function addExtraItem(
  list: WeekList,
  input: Omit<NewItemInput, 'weekId'>,
  stamp: Stamp,
): Result<{ readonly list: WeekList; readonly item: Item }, AddItemError> {
  if (list.items[input.id]) return err('duplicate-id');
  const made = createExtraItem({ ...input, weekId: list.weekId }, stamp);
  if (!made.ok) return err(made.error);
  return ok({ list: { ...list, items: { ...list.items, [input.id]: made.value } }, item: made.value });
}

/** Merge a copy of an item (from the other phone or the store) into the list. */
export function mergeIntoList(list: WeekList, incoming: Item): Result<WeekList, 'wrong-week'> {
  if (incoming.weekId !== list.weekId) return err('wrong-week');
  const existing = list.items[incoming.id];
  const merged = existing ? mergeItem(existing, incoming) : incoming;
  return ok({ ...list, items: { ...list.items, [incoming.id]: merged } });
}

/** Items to show: everything not deleted, in the order they were added. */
export function visibleItems(list: WeekList): Item[] {
  return Object.values(list.items)
    .filter((i) => i.deleted === null)
    .sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1));
}
