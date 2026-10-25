import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { createExtraItem } from '../model/item.ts';
import { createMeal } from '../model/meal.ts';
import { PERSONAL_ATTRIBUTE_KEYS, PERSONAL_FIELDS, redact, REDACTED } from './personal.ts';
import { encodeItem } from './item-doc.ts';
import { encodeMeal } from './meal-doc.ts';

const item = (() => {
  const r = createExtraItem({ id: 'i1', weekId: 'w', name: 'Oat milk', amount: '2 cartons' }, { at: 1, by: 'alex' });
  if (!r.ok) throw new Error('setup');
  return r.value;
})();

const meal = (() => {
  const r = createMeal({ id: 'm1', weekId: 'w', dayIndex: 0, name: 'Tacos night', link: 'https://example.com/tacos' }, { at: 1, by: 'alex' });
  if (!r.ok) throw new Error('setup');
  return r.value;
})();

describe('redact (R36)', () => {
  it('removes the name and amount from an item, the domain form and the stored form', () => {
    for (const shape of [item, encodeItem(item)]) {
      const text = JSON.stringify(redact({ event: 'x', item: shape }));
      expect(text).not.toContain('Oat milk');
      expect(text).not.toContain('2 cartons');
      expect(text).toContain(REDACTED);
      expect(text).toContain('i1');
    }
  });

  it('removes the name and link from a meal, the domain form and the stored form, and nothing else', () => {
    for (const shape of [meal, encodeMeal(meal)]) {
      const text = JSON.stringify(redact({ event: 'x', meal: shape }));
      expect(text).not.toContain('Tacos night');
      expect(text).not.toContain('https://example.com/tacos');
      expect(text).toContain(REDACTED);
      expect(text).toContain('m1');
    }
  });

  it('classifies a meal document as a meal, not an item, so its link is redacted too (R36)', () => {
    const classify = (v: object) => PERSONAL_FIELDS.find((e) => e.shape.every((k) => k in v))?.entity;
    expect(classify(encodeMeal(meal))).toBe('meal');
    expect(classify(encodeItem(item))).toBe('item');
    expect(classify({ id: 'i1', weekId: 'w', addedBy: 'alex', name: item.name, amount: item.amount })).toBe('item');
  });

  it('removes attributes named after a personal field', () => {
    expect(PERSONAL_ATTRIBUTE_KEYS.has('itemName')).toBe(true);
    expect(redact({ itemName: 'Oat milk', port: 'syncStore', nested: [{ mealLink: 'https://x.test/r' }] })).toEqual({
      itemName: REDACTED,
      port: 'syncStore',
      nested: [{ mealLink: REDACTED }],
    });
  });

  it('leaves other values alone', () => {
    expect(redact({ type: 'AddItem', durationMs: 12, ok: true, list: [1, 2], error: { name: 'Error' } })).toEqual({
      type: 'AddItem',
      durationMs: 12,
      ok: true,
      list: [1, 2],
      error: { name: 'Error' },
    });
  });

  it('cuts cycles instead of recursing forever', () => {
    const loop: Record<string, unknown> = { a: 1 };
    loop['self'] = loop;
    expect(redact({ loop })).toEqual({ loop: { a: 1, self: '[circular]' } });
  });

  it('is idempotent and never leaks a name placed anywhere in an item', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 3 }).filter((s) => s.trim().length >= 3), (name) => {
        const r = createExtraItem({ id: 'i1', weekId: 'w', name: `zz${name}zz` }, { at: 1, by: 'alex' });
        if (!r.ok) return;
        const once = redact({ deep: { item: r.value } });
        expect(redact(once)).toEqual(once);
        expect(JSON.stringify(once)).not.toContain(r.value.name.value);
      }),
    );
  });
});
