import { describe, expect, it } from 'vitest';
import { mergeItem } from '../merge/item-merge.ts';
import { stamped } from '../merge/lww.ts';
import { addExtraItem, emptyList, mergeIntoList, visibleItems } from './list.ts';

const bruk = { at: 1000, by: 'bruk' };
const sam = { at: 2000, by: 'sam' };

describe('addExtraItem (R10)', () => {
  it('adds an extra to the week without changing the old list', () => {
    const before = emptyList('2026-W42');
    const r = addExtraItem(before, { id: 'i1', name: 'Oat milk' }, bruk);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.list.items['i1']).toBe(r.value.item);
    expect(r.value.item.weekId).toBe('2026-W42');
    expect(r.value.item.badges).toEqual([]);
    expect(before.items).toEqual({});
  });

  it('rejects an empty name and a reused id', () => {
    const list = emptyList('w');
    expect(addExtraItem(list, { id: 'i1', name: ' ' }, bruk)).toEqual({ ok: false, error: 'empty-name' });
    const added = addExtraItem(list, { id: 'i1', name: 'Eggs' }, bruk);
    if (!added.ok) throw new Error('setup');
    expect(addExtraItem(added.value.list, { id: 'i1', name: 'Eggs' }, bruk)).toEqual({ ok: false, error: 'duplicate-id' });
  });
});

describe('mergeIntoList and visibleItems', () => {
  it('merges a copy from the other phone into the list', () => {
    const added = addExtraItem(emptyList('w'), { id: 'i1', name: 'Eggs' }, bruk);
    if (!added.ok) throw new Error('setup');
    const ticked = { ...added.value.item, state: stamped('in-cart' as const, sam) };
    const merged = mergeIntoList(added.value.list, ticked);
    expect(merged.ok && merged.value.items['i1']?.state.value).toBe('in-cart');
  });

  it('refuses an item from another week', () => {
    const added = addExtraItem(emptyList('w1'), { id: 'i1', name: 'Eggs' }, bruk);
    if (!added.ok) throw new Error('setup');
    expect(mergeIntoList(emptyList('w2'), added.value.item)).toEqual({ ok: false, error: 'wrong-week' });
  });

  it('hides deleted items but keeps the tombstone', () => {
    const added = addExtraItem(emptyList('w'), { id: 'i1', name: 'Eggs' }, bruk);
    if (!added.ok) throw new Error('setup');
    const gone = mergeItem(added.value.item, { ...added.value.item, deleted: sam });
    const merged = mergeIntoList(added.value.list, gone);
    expect(merged.ok && visibleItems(merged.value)).toEqual([]);
    expect(merged.ok && merged.value.items['i1']?.deleted).toEqual(sam);
  });

  it('lists items in the order they were added', () => {
    let list = emptyList('w');
    for (const [id, at] of [['b', 2], ['a', 1], ['c', 3]] as const) {
      const r = addExtraItem(list, { id, name: id }, { at, by: 'bruk' });
      if (!r.ok) throw new Error('setup');
      list = r.value.list;
    }
    expect(visibleItems(list).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});
