import type { Stamp, Stamped } from '../merge/lww.ts';
import { stamped } from '../merge/lww.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

export type ItemState = 'to-buy' | 'in-cart';

/** One grocery item. Every editable field carries the stamp of the change that last set it (R18). */
export interface Item {
  readonly id: string;
  readonly weekId: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly name: Stamped<string>;
  readonly amount: Stamped<string | null>;
  readonly aisle: Stamped<string>;
  readonly state: Stamped<ItemState>;
  /** Ids of the meals this item is for. Merging unions them. Empty means an extra (R10). */
  readonly badges: readonly string[];
  /** Set when the item is deleted. Once set it stays (R20). */
  readonly deleted: Stamp | null;
}

export const DEFAULT_AISLE = 'other';

/**
 * The form of a name used to decide that two items are the same thing (R12): case, accents,
 * punctuation and repeated spaces do not matter.
 */
export function normaliseName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface NewItemInput {
  readonly id: string;
  readonly weekId: string;
  readonly name: string;
  readonly amount?: string | null;
  readonly aisle?: string;
}

export type NewItemError = 'empty-name';

/** Make a new extra item (no meal badge), stamped with who added it and when. */
export function createExtraItem(input: NewItemInput, stamp: Stamp): Result<Item, NewItemError> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  if (normaliseName(name) === '') return err('empty-name');
  const amount = input.amount?.trim() ? input.amount.trim() : null;
  return ok({
    id: input.id,
    weekId: input.weekId,
    addedBy: stamp.by,
    createdAt: stamp.at,
    name: stamped(name, stamp),
    amount: stamped(amount, stamp),
    aisle: stamped(input.aisle?.trim() || DEFAULT_AISLE, stamp),
    state: stamped<ItemState>('to-buy', stamp),
    badges: [],
    deleted: null,
  });
}
