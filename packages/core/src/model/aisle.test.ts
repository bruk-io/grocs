import { describe, expect, it } from 'vitest';
import { AISLES, aisleNameKey, aisleSection, groupByAisle, setItemAisle } from './aisle.ts';
import { createExtraItem } from './item.ts';
import type { Item } from './item.ts';
import { mergeItem } from '../merge/item-merge.ts';

function makeItem(name: string, aisle: string, at = 1000): Item {
  const r = createExtraItem({ id: `${name}-${at}`, weekId: 'w', name, aisle }, { at, by: 'alex' });
  if (!r.ok) throw new Error('fixture must be a valid item');
  return r.value;
}

describe('AISLES', () => {
  it('is the fixed, ordered list', () => {
    expect(AISLES.map((a) => a.id)).toEqual(['produce', 'dairy', 'meat', 'bakery', 'pantry', 'other']);
    expect(AISLES.find((a) => a.id === 'dairy')?.label).toBe('Dairy & eggs');
  });
});

describe('aisleSection (R11)', () => {
  it('maps a known id to itself', () => {
    expect(aisleSection('produce')).toBe('produce');
    expect(aisleSection('pantry')).toBe('pantry');
  });

  it('maps an unknown aisle to other', () => {
    expect(aisleSection('household')).toBe('other');
    expect(aisleSection('')).toBe('other');
  });
});

describe('groupByAisle (R11)', () => {
  it('groups items by aisle in AISLES order, leaving empty aisles out', () => {
    const items = [makeItem('Milk', 'dairy'), makeItem('Apple', 'produce'), makeItem('Bread', 'bakery')];
    const sections = groupByAisle(items);
    expect(sections.map((s) => s.id)).toEqual(['produce', 'dairy', 'bakery']);
    expect(sections.find((s) => s.id === 'dairy')?.items.map((i) => i.name.value)).toEqual(['Milk']);
  });

  it('groups an unknown aisle together with other as one other section, in input order', () => {
    const items = [makeItem('Soap', 'household'), makeItem('Foil', 'other')];
    const sections = groupByAisle(items);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe('other');
    expect(sections[0]?.items.map((i) => i.name.value)).toEqual(['Soap', 'Foil']);
  });

  it('is empty for no items', () => {
    expect(groupByAisle([])).toEqual([]);
  });
});

describe('aisleNameKey', () => {
  it('encodes the normalised name', () => {
    expect(aisleNameKey('Oat Milk')).toBe(encodeURIComponent('oat milk'));
  });

  it('normalises before encoding, so case and accents do not matter', () => {
    expect(aisleNameKey('Jalapeño!')).toBe(aisleNameKey('JALAPENO'));
  });
});

describe('setItemAisle (R18)', () => {
  const original = makeItem('Oat milk', 'dairy', 1);

  it('restamps only the aisle; every other field is the same value', () => {
    const next = setItemAisle(original, 'pantry', { at: 2, by: 'sam' });
    expect(next.aisle).toEqual({ value: 'pantry', stamp: { at: 2, by: 'sam' } });
    expect(next.id).toBe(original.id);
    expect(next.weekId).toBe(original.weekId);
    expect(next.addedBy).toBe(original.addedBy);
    expect(next.createdAt).toBe(original.createdAt);
    expect(next.name).toBe(original.name);
    expect(next.amount).toBe(original.amount);
    expect(next.state).toBe(original.state);
    expect(next.badges).toBe(original.badges);
    expect(next.deleted).toBe(original.deleted);
    expect(original.aisle).toEqual({ value: 'dairy', stamp: { at: 1, by: 'alex' } });
  });

  it('merging two copies keeps the later stamp\'s aisle, in both orders (the existing last-write-wins rule)', () => {
    const changed = setItemAisle(original, 'pantry', { at: 5, by: 'sam' });
    const stale = setItemAisle(original, 'meat', { at: 2, by: 'alex' });
    expect(mergeItem(changed, stale).aisle.value).toBe('pantry');
    expect(mergeItem(stale, changed).aisle.value).toBe('pantry');
  });
});
