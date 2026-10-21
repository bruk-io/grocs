import { describe, expect, it } from 'vitest';
import { mergeItem } from '../merge/item-merge.ts';
import { clearFromCart, createExtraItem, DEFAULT_AISLE, normaliseName, setItemState } from './item.ts';
import type { Item } from './item.ts';

const stamp = { at: 1000, by: 'bruk' };

describe('normaliseName (R12)', () => {
  it('ignores case, accents, punctuation and repeated spaces', () => {
    expect(normaliseName('  Jalapeño   Peppers! ')).toBe('jalapeno peppers');
    expect(normaliseName('OAT MILK')).toBe(normaliseName('oat  milk'));
    expect(normaliseName('Mac & Cheese')).toBe('mac cheese');
  });

  it('keeps letters from other scripts', () => {
    expect(normaliseName('ጤፍ')).toBe('ጤፍ');
  });

  it('is empty for a name with nothing in it', () => {
    expect(normaliseName(' ?! ')).toBe('');
  });

  it('is idempotent', () => {
    const once = normaliseName('Crème  Fraîche (200ml)');
    expect(normaliseName(once)).toBe(once);
  });
});

describe('createExtraItem (R10)', () => {
  it('makes an extra to buy, with no badges, stamped by its author', () => {
    const r = createExtraItem({ id: 'i1', weekId: '2026-W42', name: '  Oat   milk ', amount: ' 2 cartons ' }, stamp);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.name).toEqual({ value: 'Oat milk', stamp });
    expect(r.value.amount.value).toBe('2 cartons');
    expect(r.value.aisle.value).toBe(DEFAULT_AISLE);
    expect(r.value.state.value).toBe('to-buy');
    expect(r.value.badges).toEqual([]);
    expect(r.value.deleted).toBeNull();
    expect(r.value.addedBy).toBe('bruk');
    expect(r.value.createdAt).toBe(1000);
  });

  it('treats a blank amount as none and keeps a chosen aisle', () => {
    const r = createExtraItem({ id: 'i1', weekId: 'w', name: 'Soap', amount: '  ', aisle: 'household' }, stamp);
    expect(r.ok && r.value.amount.value).toBeNull();
    expect(r.ok && r.value.aisle.value).toBe('household');
  });

  it('rejects a name with nothing in it', () => {
    expect(createExtraItem({ id: 'i1', weekId: 'w', name: '   ' }, stamp)).toEqual({ ok: false, error: 'empty-name' });
    expect(createExtraItem({ id: 'i1', weekId: 'w', name: '!!' }, stamp)).toEqual({ ok: false, error: 'empty-name' });
  });
});

describe('setItemState (R18)', () => {
  const made = createExtraItem({ id: 'i1', weekId: '2026-W42', name: 'Oat milk', amount: '2 cartons' }, { at: 1, by: 'bruk' });
  if (!made.ok) throw new Error('fixture must be a valid item');
  const original: Item = { ...made.value, badges: ['m1'] };
  const tick = { at: 2, by: 'sam' };
  const untick = { at: 3, by: 'bruk' };

  it('restamps only the state; every other field is the same value', () => {
    const next = setItemState(original, 'in-cart', tick);
    expect(next.state).toEqual({ value: 'in-cart', stamp: tick });
    expect(next.id).toBe(original.id);
    expect(next.weekId).toBe(original.weekId);
    expect(next.addedBy).toBe(original.addedBy);
    expect(next.createdAt).toBe(original.createdAt);
    expect(next.name).toBe(original.name);
    expect(next.amount).toBe(original.amount);
    expect(next.aisle).toBe(original.aisle);
    expect(next.badges).toBe(original.badges);
    expect(next.deleted).toBe(original.deleted);
    expect(original.state).toEqual({ value: 'to-buy', stamp: { at: 1, by: 'bruk' } });
  });

  it('a tick merged with the original keeps the tick, in both orders', () => {
    const inCart = setItemState(original, 'in-cart', tick);
    expect(mergeItem(inCart, original).state.value).toBe('in-cart');
    expect(mergeItem(original, inCart).state.value).toBe('in-cart');
  });

  it('a stale tick merged with a later untick keeps the untick, in both orders', () => {
    const ticked = setItemState(original, 'in-cart', tick);
    const unticked = setItemState(original, 'to-buy', untick);
    expect(mergeItem(unticked, ticked).state.value).toBe('to-buy');
    expect(mergeItem(ticked, unticked).state.value).toBe('to-buy');
  });
});

describe('clearFromCart (R14)', () => {
  const made = createExtraItem({ id: 'i1', weekId: '2026-W42', name: 'Oat milk', amount: '2 cartons' }, { at: 1, by: 'bruk' });
  if (!made.ok) throw new Error('fixture must be a valid item');
  const original: Item = { ...made.value, badges: ['m1'] };
  const clear = { at: 2, by: 'sam' };

  it('stamps the state as cleared and leaves every other field untouched', () => {
    const next = clearFromCart(original, clear);
    expect(next.state).toEqual({ value: 'cleared', stamp: clear });
    expect(next.id).toBe(original.id);
    expect(next.weekId).toBe(original.weekId);
    expect(next.addedBy).toBe(original.addedBy);
    expect(next.createdAt).toBe(original.createdAt);
    expect(next.name).toBe(original.name);
    expect(next.amount).toBe(original.amount);
    expect(next.aisle).toBe(original.aisle);
    expect(next.badges).toBe(original.badges);
    expect(next.deleted).toBe(original.deleted);
    expect(original.state).toEqual({ value: 'to-buy', stamp: { at: 1, by: 'bruk' } });
  });
});
