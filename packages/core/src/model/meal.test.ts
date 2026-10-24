import { describe, expect, it } from 'vitest';
import { mergeMeal } from '../merge/meal-merge.ts';
import { createMeal, moveMeal, relinkMeal, removeMeal, renameMeal, toDayIndex } from './meal.ts';
import type { Meal } from './meal.ts';

const stamp = { at: 1000, by: 'alex' };

describe('toDayIndex', () => {
  it('narrows an integer from 0 to 6', () => {
    for (let n = 0; n <= 6; n++) expect(toDayIndex(n)).toBe(n);
  });

  it('rejects anything outside 0 to 6, or not an integer', () => {
    for (const n of [-1, 7, 1.5, NaN]) expect(toDayIndex(n)).toBeNull();
  });
});

describe('createMeal (R5, R6)', () => {
  it('plans a meal with no link, stamped by its author', () => {
    const r = createMeal({ id: 'm1', weekId: '2026-W42', dayIndex: 0, name: '  Tacos   night ' }, stamp);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.name).toEqual({ value: 'Tacos night', stamp });
    expect(r.value.weekId).toEqual({ value: '2026-W42', stamp });
    expect(r.value.dayIndex).toEqual({ value: 0, stamp });
    expect(r.value.link).toEqual({ value: null, stamp });
    expect(r.value.deleted).toBeNull();
    expect(r.value.addedBy).toBe('alex');
    expect(r.value.createdAt).toBe(1000);
  });

  it('treats a blank link as none and keeps a chosen link', () => {
    const blank = createMeal({ id: 'm1', weekId: 'w', dayIndex: 0, name: 'Tacos', link: '  ' }, stamp);
    expect(blank.ok && blank.value.link.value).toBeNull();
    const linked = createMeal({ id: 'm1', weekId: 'w', dayIndex: 0, name: 'Tacos', link: ' https://example.com/tacos ' }, stamp);
    expect(linked.ok && linked.value.link.value).toBe('https://example.com/tacos');
  });

  it('rejects a name with nothing in it', () => {
    expect(createMeal({ id: 'm1', weekId: 'w', dayIndex: 0, name: '   ' }, stamp)).toEqual({ ok: false, error: 'empty-name' });
  });

  it('rejects a link that is not an http or https URL (R6)', () => {
    for (const link of ['not a url', 'ftp://example.com', 'javascript:alert(1)', 'http://?x']) {
      expect(createMeal({ id: 'm1', weekId: 'w', dayIndex: 0, name: 'Tacos', link }, stamp)).toEqual({ ok: false, error: 'invalid-link' });
    }
  });
});

describe('renameMeal, relinkMeal, moveMeal, removeMeal (R18, R20)', () => {
  const made = createMeal({ id: 'm1', weekId: '2026-W42', dayIndex: 2, name: 'Tacos', link: 'https://example.com/tacos' }, { at: 1, by: 'alex' });
  if (!made.ok) throw new Error('fixture must be a valid meal');
  const original: Meal = made.value;

  it('renameMeal restamps only the name; everything else is unchanged', () => {
    const stampB = { at: 2, by: 'sam' };
    const r = renameMeal(original, '  Burrito  night ', stampB);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.name).toEqual({ value: 'Burrito night', stamp: stampB });
    expect(r.value.weekId).toBe(original.weekId);
    expect(r.value.dayIndex).toBe(original.dayIndex);
    expect(r.value.link).toBe(original.link);
    expect(r.value.id).toBe(original.id);
    expect(r.value.addedBy).toBe(original.addedBy);
    expect(r.value.createdAt).toBe(original.createdAt);
    expect(r.value.deleted).toBe(original.deleted);
  });

  it('renameMeal rejects a name with nothing in it', () => {
    expect(renameMeal(original, '  ', { at: 2, by: 'sam' })).toEqual({ ok: false, error: 'empty-name' });
  });

  it('relinkMeal restamps only the link; everything else is unchanged, and clears a blank link', () => {
    const stampB = { at: 2, by: 'sam' };
    const next = relinkMeal(original, '  https://example.com/burrito ', stampB);
    expect(next).toEqual({ ok: true, value: { ...original, link: { value: 'https://example.com/burrito', stamp: stampB } } });

    const cleared = relinkMeal(original, '  ', stampB);
    expect(cleared.ok && cleared.value.link).toEqual({ value: null, stamp: stampB });
  });

  it('relinkMeal rejects a link that is not an http or https URL (R6)', () => {
    expect(relinkMeal(original, 'not a url', { at: 2, by: 'sam' })).toEqual({ ok: false, error: 'invalid-link' });
  });

  it('moveMeal restamps weekId and dayIndex together; everything else is unchanged', () => {
    const stampB = { at: 2, by: 'sam' };
    const next = moveMeal(original, '2026-W43', 4, stampB);
    expect(next.weekId).toEqual({ value: '2026-W43', stamp: stampB });
    expect(next.dayIndex).toEqual({ value: 4, stamp: stampB });
    expect(next.name).toBe(original.name);
    expect(next.link).toBe(original.link);
  });

  it('removeMeal sets the tombstone and a later merge cannot undo it', () => {
    const stampB = { at: 2, by: 'sam' };
    const removed = removeMeal(original, stampB);
    expect(removed.deleted).toEqual(stampB);
    const lateEdit = renameMeal(original, 'Burrito night', { at: 1, by: 'sam' });
    expect(lateEdit.ok).toBe(true);
    if (!lateEdit.ok) return;
    expect(mergeMeal(removed, lateEdit.value).deleted).toEqual(stampB);
    expect(mergeMeal(lateEdit.value, removed).deleted).toEqual(stampB);
  });
});
