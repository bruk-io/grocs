import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { DayIndex, Meal } from '../model/meal.ts';
import { relinkMeal } from '../model/meal.ts';
import { decodeMeal, encodeMeal, MEAL_SCHEMA_VERSION } from './meal-doc.ts';

const make = (): Meal => ({
  id: 'm1',
  addedBy: 'alex',
  createdAt: 5,
  weekId: { value: '2026-W42', stamp: { at: 5, by: 'alex' } },
  dayIndex: { value: 1, stamp: { at: 5, by: 'alex' } },
  name: { value: 'Tacos', stamp: { at: 5, by: 'alex' } },
  link: { value: null, stamp: { at: 5, by: 'alex' } },
  deleted: null,
});

describe('meal document (R30)', () => {
  it('carries a schema version', () => {
    expect(encodeMeal(make()).schemaVersion).toBe(MEAL_SCHEMA_VERSION);
  });

  it('round-trips through the stored form, including JSON', () => {
    const meal = { ...make(), deleted: { at: 9, by: 'sam' } };
    expect(decodeMeal(encodeMeal(meal))).toEqual({ ok: true, value: meal });
    expect(decodeMeal(JSON.parse(JSON.stringify(encodeMeal(meal))))).toEqual({ ok: true, value: meal });
  });

  it('round-trips any name and link', () => {
    fc.assert(
      fc.property(fc.string(), fc.option(fc.string(), { nil: null }), (name, link) => {
        const meal = { ...make(), name: { value: name, stamp: { at: 1, by: 'a' } }, link: { value: link, stamp: { at: 1, by: 'a' } } };
        expect(decodeMeal(encodeMeal(meal))).toEqual({ ok: true, value: meal });
      }),
    );
  });

  it('round-trips any dayIndex from 0 to 6', () => {
    fc.assert(
      fc.property(fc.constantFrom<DayIndex>(0, 1, 2, 3, 4, 5, 6), (dayIndex) => {
        const meal = { ...make(), dayIndex: { value: dayIndex, stamp: { at: 1, by: 'a' } } };
        expect(decodeMeal(encodeMeal(meal))).toEqual({ ok: true, value: meal });
      }),
    );
  });

  it('round-trips a relinked meal through the stored form, including JSON', () => {
    const relinked = relinkMeal(make(), 'https://example.com/tacos', { at: 7, by: 'sam' });
    if (!relinked.ok) throw new Error('setup');
    const meal = relinked.value;
    expect(decodeMeal(encodeMeal(meal))).toEqual({ ok: true, value: meal });
    expect(decodeMeal(JSON.parse(JSON.stringify(encodeMeal(meal))))).toEqual({ ok: true, value: meal });
  });

  it('rejects data from a version this code does not know', () => {
    const r = decodeMeal({ ...encodeMeal(make()), schemaVersion: 2 });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.kind).toBe('unsupported-version');
  });

  it('rejects documents with a wrong or missing field and names the path', () => {
    const doc = encodeMeal(make());
    const cases: [unknown, string][] = [
      [null, ''],
      [{ ...doc, id: '' }, 'id'],
      [{ ...doc, createdAt: 'now' }, 'createdAt'],
      [{ ...doc, weekId: { ...doc.weekId, v: 3 } }, 'weekId.v'],
      [{ ...doc, weekId: { ...doc.weekId, v: '' } }, 'weekId.v'],
      [{ ...doc, dayIndex: { ...doc.dayIndex, v: 7 } }, 'dayIndex.v'],
      [{ ...doc, dayIndex: { ...doc.dayIndex, v: -1 } }, 'dayIndex.v'],
      [{ ...doc, dayIndex: { ...doc.dayIndex, v: 1.5 } }, 'dayIndex.v'],
      [{ ...doc, name: { ...doc.name, v: 3 } }, 'name.v'],
      [{ ...doc, name: { ...doc.name, by: '' } }, 'name.by'],
      [{ ...doc, link: { ...doc.link, v: 3 } }, 'link.v'],
      [{ ...doc, deleted: { at: 'x', by: 'a' } }, 'deleted.at'],
      [{ ...doc, link: undefined }, 'link'],
    ];
    for (const [raw, path] of cases) {
      const r = decodeMeal(raw);
      expect(r.ok, path).toBe(false);
      expect(!r.ok && r.error.path, path).toBe(path);
    }
  });
});
