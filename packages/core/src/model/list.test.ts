import { describe, expect, it } from 'vitest';
import { clearFromCart } from '../model/item.ts';
import { mergeItem } from '../merge/item-merge.ts';
import { stamped } from '../merge/lww.ts';
import { addExtraItem, emptyList, mergeIntoList, visibleItems } from './list.ts';

const alex = { at: 1000, by: 'alex' };
const sam = { at: 2000, by: 'sam' };

describe('addExtraItem (R10)', () => {
  it('adds an extra to the week without changing the old list', () => {
    const before = emptyList('2026-W42');
    const r = addExtraItem(before, { id: 'i1', name: 'Oat milk' }, alex);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.list.items['i1']).toBe(r.value.item);
    expect(r.value.item.weekId).toBe('2026-W42');
    expect(r.value.item.badges).toEqual([]);
    expect(before.items).toEqual({});
  });

  it('rejects an empty name and a reused id', () => {
    const list = emptyList('w');
    expect(addExtraItem(list, { id: 'i1', name: ' ' }, alex)).toEqual({ ok: false, error: 'empty-name' });
    const added = addExtraItem(list, { id: 'i1', name: 'Eggs' }, alex);
    if (!added.ok) throw new Error('setup');
    expect(addExtraItem(added.value.list, { id: 'i1', name: 'Eggs' }, alex)).toEqual({ ok: false, error: 'duplicate-id' });
  });
});

describe('mergeIntoList and visibleItems', () => {
  it('merges a copy from the other phone into the list', () => {
    const added = addExtraItem(emptyList('w'), { id: 'i1', name: 'Eggs' }, alex);
    if (!added.ok) throw new Error('setup');
    const ticked = { ...added.value.item, state: stamped('in-cart' as const, sam) };
    const merged = mergeIntoList(added.value.list, ticked);
    expect(merged.ok && merged.value.items['i1']?.state.value).toBe('in-cart');
  });

  it('refuses an item from another week', () => {
    const added = addExtraItem(emptyList('w1'), { id: 'i1', name: 'Eggs' }, alex);
    if (!added.ok) throw new Error('setup');
    expect(mergeIntoList(emptyList('w2'), added.value.item)).toEqual({ ok: false, error: 'wrong-week' });
  });

  it('hides deleted items but keeps the tombstone', () => {
    const added = addExtraItem(emptyList('w'), { id: 'i1', name: 'Eggs' }, alex);
    if (!added.ok) throw new Error('setup');
    const gone = mergeItem(added.value.item, { ...added.value.item, deleted: sam });
    const merged = mergeIntoList(added.value.list, gone);
    expect(merged.ok && visibleItems(merged.value)).toEqual([]);
    expect(merged.ok && merged.value.items['i1']?.deleted).toEqual(sam);
  });

  it('lists items in the order they were added', () => {
    let list = emptyList('w');
    for (const [id, at] of [['b', 2], ['a', 1], ['c', 3]] as const) {
      const r = addExtraItem(list, { id, name: id }, { at, by: 'alex' });
      if (!r.ok) throw new Error('setup');
      list = r.value.list;
    }
    expect(visibleItems(list).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('hides cleared items but keeps the in-cart and to-buy ones', () => {
    const added1 = addExtraItem(emptyList('w'), { id: 'i1', name: 'Item 1' }, alex);
    if (!added1.ok) throw new Error('setup');
    const added2 = addExtraItem(added1.value.list, { id: 'i2', name: 'Item 2' }, alex);
    if (!added2.ok) throw new Error('setup');
    const added3 = addExtraItem(added2.value.list, { id: 'i3', name: 'Item 3' }, alex);
    if (!added3.ok) throw new Error('setup');
    let list = added3.value.list;

    // Mark i1 as in-cart, i2 as to-buy, and i3 as cleared
    const item1 = list.items['i1'];
    const item3 = list.items['i3'];
    if (!item1 || !item3) throw new Error('setup');
    const inCart = { ...item1, state: stamped('in-cart' as const, sam) };
    const cleared = clearFromCart(item3, sam);
    list = { ...list, items: { ...list.items, ['i1']: inCart, ['i3']: cleared } };

    expect(visibleItems(list).map((i) => i.id)).toEqual(['i1', 'i2']);
  });
});
