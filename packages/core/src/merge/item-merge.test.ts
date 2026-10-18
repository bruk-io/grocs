import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Item } from '../model/item.ts';
import { isDeleted, mergeItem } from './item-merge.ts';

const members = fc.constantFrom('bruk', 'shazya');
const stamp = fc.record({ at: fc.integer({ min: 0, max: 12 }), by: members });
const stampedOf = <T>(value: fc.Arbitrary<T>) => fc.record({ value, stamp });

/** Copies of one item as the two phones and the store might hold them. */
const itemCopy: fc.Arbitrary<Item> = fc.record({
  id: fc.constant('i1'),
  weekId: fc.constant('2026-W42'),
  addedBy: members,
  createdAt: fc.integer({ min: 0, max: 12 }),
  name: stampedOf(fc.constantFrom('Milk', 'Oat milk', 'Eggs')),
  amount: stampedOf(fc.constantFrom<string | null>(null, '1', '2 cartons')),
  aisle: stampedOf(fc.constantFrom('dairy', 'other')),
  state: stampedOf(fc.constantFrom<'to-buy' | 'in-cart'>('to-buy', 'in-cart')),
  badges: fc.subarray(['m1', 'm2', 'm3']),
  deleted: fc.option(stamp, { nil: null }),
});

const foldMerge = (items: readonly Item[]): Item => items.slice(1).reduce(mergeItem, items[0]!);

describe('mergeItem examples (R17 to R20)', () => {
  const base: Item = {
    id: 'i1',
    weekId: 'w',
    addedBy: 'bruk',
    createdAt: 1,
    name: { value: 'Milk', stamp: { at: 1, by: 'bruk' } },
    amount: { value: null, stamp: { at: 1, by: 'bruk' } },
    aisle: { value: 'dairy', stamp: { at: 1, by: 'bruk' } },
    state: { value: 'to-buy', stamp: { at: 1, by: 'bruk' } },
    badges: [],
    deleted: null,
  };

  it('keeps both changes when members change different fields (R18)', () => {
    const renamed = { ...base, name: { value: 'Oat milk', stamp: { at: 5, by: 'bruk' } } };
    const ticked = { ...base, state: { value: 'in-cart' as const, stamp: { at: 6, by: 'shazya' } } };
    const merged = mergeItem(renamed, ticked);
    expect(merged.name.value).toBe('Oat milk');
    expect(merged.state.value).toBe('in-cart');
  });

  it('the later of a tick and an untick wins (R17, R18)', () => {
    const tick = { ...base, state: { value: 'in-cart' as const, stamp: { at: 5, by: 'bruk' } } };
    const untick = { ...base, state: { value: 'to-buy' as const, stamp: { at: 6, by: 'shazya' } } };
    expect(mergeItem(tick, untick).state.value).toBe('to-buy');
    expect(mergeItem(untick, tick).state.value).toBe('to-buy');
  });

  it('two ticks end with the item in the cart (R17)', () => {
    const a = { ...base, state: { value: 'in-cart' as const, stamp: { at: 5, by: 'bruk' } } };
    const b = { ...base, state: { value: 'in-cart' as const, stamp: { at: 6, by: 'shazya' } } };
    expect(mergeItem(a, b).state.value).toBe('in-cart');
  });

  it('unions meal badges', () => {
    expect(mergeItem({ ...base, badges: ['m1'] }, { ...base, badges: ['m2'] }).badges).toEqual(['m1', 'm2']);
  });

  it('a late change made before the delete does not bring the item back (R20)', () => {
    const deleted = { ...base, deleted: { at: 10, by: 'shazya' } };
    const lateEdit = { ...base, name: { value: 'Oat milk', stamp: { at: 5, by: 'bruk' } } };
    const merged = mergeItem(deleted, lateEdit);
    expect(isDeleted(merged)).toBe(true);
    expect(isDeleted(mergeItem(lateEdit, deleted))).toBe(true);
  });

  it('refuses to merge two different items', () => {
    expect(() => mergeItem(base, { ...base, id: 'other' })).toThrow(/different items/);
  });
});

describe('mergeItem properties (R46)', () => {
  it('does not depend on the order changes arrive in', () => {
    fc.assert(
      fc.property(fc.array(itemCopy, { minLength: 1, maxLength: 6 }), (copies) => {
        const forward = foldMerge(copies);
        const reversed = foldMerge([...copies].reverse());
        expect(reversed).toEqual(forward);
      }),
    );
  });

  it('gives the same result for any shuffle of the same changes', () => {
    fc.assert(
      fc.property(fc.array(itemCopy, { minLength: 2, maxLength: 6 }), fc.infiniteStream(fc.nat()), (copies, rand) => {
        const shuffled = [...copies];
        const it = rand[Symbol.iterator]();
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = it.next().value % (i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
        }
        expect(foldMerge(shuffled)).toEqual(foldMerge(copies));
      }),
    );
  });

  it('applying a change twice has no further effect', () => {
    fc.assert(
      fc.property(itemCopy, itemCopy, (a, b) => {
        const once = mergeItem(a, b);
        expect(mergeItem(once, b)).toEqual(once);
        expect(mergeItem(once, a)).toEqual(once);
        expect(mergeItem(a, a)).toEqual(a);
      }),
    );
  });

  it('is associative', () => {
    fc.assert(
      fc.property(itemCopy, itemCopy, itemCopy, (a, b, c) => {
        expect(mergeItem(mergeItem(a, b), c)).toEqual(mergeItem(a, mergeItem(b, c)));
      }),
    );
  });

  it('a delete is never undone, whatever arrives after it', () => {
    fc.assert(
      fc.property(itemCopy, fc.array(itemCopy, { maxLength: 5 }), (deleted, others) => {
        const withDelete = { ...deleted, deleted: deleted.deleted ?? { at: 0, by: 'bruk' } };
        for (const order of [[withDelete, ...others], [...others, withDelete]]) {
          expect(isDeleted(foldMerge(order))).toBe(true);
        }
      }),
    );
  });
});
