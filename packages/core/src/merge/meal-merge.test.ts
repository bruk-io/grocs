import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { DayIndex, Meal } from '../model/meal.ts';
import { isMealDeleted, mergeMeal } from './meal-merge.ts';

const members = fc.constantFrom('alex', 'sam');
const stamp = fc.record({ at: fc.integer({ min: 0, max: 12 }), by: members });
const stampedOf = <T>(value: fc.Arbitrary<T>) => fc.record({ value, stamp });

/** Copies of one meal as the two phones and the store might hold them. */
const mealCopy: fc.Arbitrary<Meal> = fc.record({
  id: fc.constant('m1'),
  addedBy: members,
  createdAt: fc.integer({ min: 0, max: 12 }),
  weekId: stampedOf(fc.constantFrom('2026-W42', '2026-W43')),
  dayIndex: stampedOf(fc.constantFrom<DayIndex>(0, 1, 2, 3, 4, 5, 6)),
  name: stampedOf(fc.constantFrom('Tacos', 'Burrito night', 'Pasta')),
  link: stampedOf(fc.constantFrom<string | null>(null, 'https://a', 'https://b')),
  deleted: fc.option(stamp, { nil: null }),
});

const foldMerge = (meals: readonly Meal[]): Meal => meals.slice(1).reduce(mergeMeal, meals[0]!);

describe('mergeMeal examples (R17, R18, R20)', () => {
  const base: Meal = {
    id: 'm1',
    addedBy: 'alex',
    createdAt: 1,
    weekId: { value: '2026-W42', stamp: { at: 1, by: 'alex' } },
    dayIndex: { value: 1, stamp: { at: 1, by: 'alex' } },
    name: { value: 'Tacos', stamp: { at: 1, by: 'alex' } },
    link: { value: null, stamp: { at: 1, by: 'alex' } },
    deleted: null,
  };

  it('keeps both changes when members change different fields (R18)', () => {
    const renamed = { ...base, name: { value: 'Burrito night', stamp: { at: 5, by: 'alex' } } };
    const moved = { ...base, weekId: { value: '2026-W43', stamp: { at: 6, by: 'sam' } } };
    const merged = mergeMeal(renamed, moved);
    expect(merged.name.value).toBe('Burrito night');
    expect(merged.weekId.value).toBe('2026-W43');
  });

  it('the later of two moves wins, in both orders', () => {
    const moveA = { ...base, weekId: { value: '2026-W43', stamp: { at: 5, by: 'alex' } } };
    const moveB = { ...base, weekId: { value: '2026-W44', stamp: { at: 6, by: 'sam' } } };
    expect(mergeMeal(moveA, moveB).weekId.value).toBe('2026-W44');
    expect(mergeMeal(moveB, moveA).weekId.value).toBe('2026-W44');
  });

  it('a move restamps weekId and dayIndex together; the later move wins both fields', () => {
    const moveA = { ...base, weekId: { value: '2026-W43', stamp: { at: 5, by: 'alex' } }, dayIndex: { value: 3 as const, stamp: { at: 5, by: 'alex' } } };
    const moveB = { ...base, weekId: { value: '2026-W44', stamp: { at: 6, by: 'sam' } }, dayIndex: { value: 5 as const, stamp: { at: 6, by: 'sam' } } };
    const merged = mergeMeal(moveA, moveB);
    expect(merged.weekId.value).toBe('2026-W44');
    expect(merged.dayIndex.value).toBe(5);
  });

  it('a late change made before the delete does not bring the meal back (R20)', () => {
    const deleted = { ...base, deleted: { at: 10, by: 'sam' } };
    const lateEdit = { ...base, name: { value: 'Burrito night', stamp: { at: 5, by: 'alex' } } };
    const merged = mergeMeal(deleted, lateEdit);
    expect(isMealDeleted(merged)).toBe(true);
    expect(isMealDeleted(mergeMeal(lateEdit, deleted))).toBe(true);
  });

  it('refuses to merge two different meals', () => {
    expect(() => mergeMeal(base, { ...base, id: 'other' })).toThrow(/different meals/);
  });
});

describe('mergeMeal properties (R46)', () => {
  it('does not depend on the order changes arrive in', () => {
    fc.assert(
      fc.property(fc.array(mealCopy, { minLength: 1, maxLength: 6 }), (copies) => {
        const forward = foldMerge(copies);
        const reversed = foldMerge([...copies].reverse());
        expect(reversed).toEqual(forward);
      }),
    );
  });

  it('gives the same result for any shuffle of the same changes', () => {
    fc.assert(
      fc.property(fc.array(mealCopy, { minLength: 2, maxLength: 6 }), fc.infiniteStream(fc.nat()), (copies, rand) => {
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
      fc.property(mealCopy, mealCopy, (a, b) => {
        const once = mergeMeal(a, b);
        expect(mergeMeal(once, b)).toEqual(once);
        expect(mergeMeal(once, a)).toEqual(once);
        expect(mergeMeal(a, a)).toEqual(a);
      }),
    );
  });

  it('is associative', () => {
    fc.assert(
      fc.property(mealCopy, mealCopy, mealCopy, (a, b, c) => {
        expect(mergeMeal(mergeMeal(a, b), c)).toEqual(mergeMeal(a, mergeMeal(b, c)));
      }),
    );
  });

  it('a delete is never undone, whatever arrives after it', () => {
    fc.assert(
      fc.property(mealCopy, fc.array(mealCopy, { maxLength: 5 }), (deleted, others) => {
        const withDelete = { ...deleted, deleted: deleted.deleted ?? { at: 0, by: 'alex' } };
        for (const order of [[withDelete, ...others], [...others, withDelete]]) {
          expect(isMealDeleted(foldMerge(order))).toBe(true);
        }
      }),
    );
  });
});
