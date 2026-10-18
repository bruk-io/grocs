import { describe, expect, it } from 'vitest';
import { createExtraItem, DEFAULT_AISLE, normaliseName } from './item.ts';

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
