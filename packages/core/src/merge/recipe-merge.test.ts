import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Recipe } from '../model/recipe.ts';
import { isRecipeDeleted, mergeRecipe } from './recipe-merge.ts';

const members = fc.constantFrom('alex', 'sam');
const stamp = fc.record({ at: fc.integer({ min: 0, max: 12 }), by: members });

/**
 * Copies of one recipe as the two phones and the store might hold them. Content (sourceUrl,
 * title, yield, steps, ingredients, image) is held constant per id: the same recipeId always
 * comes from the same server cache entry (decision-16), so two copies of one id never actually
 * differ in content, only in who/when added it and whether it is deleted. `mergeRecipe`'s `first`
 * has no content tiebreak, so letting content vary here would falsify associativity and
 * order-independence on a case the real system never produces.
 */
const recipeCopy: fc.Arbitrary<Recipe> = fc.record({
  id: fc.constant('r1'),
  addedBy: members,
  createdAt: fc.integer({ min: 0, max: 12 }),
  sourceUrl: fc.constant('https://example.com/recipe'),
  title: fc.constant('Tacos'),
  yield: fc.constant<string | null>('4 servings'),
  steps: fc.constant(['Cook it', 'Eat it']),
  ingredients: fc.constant([{ line: '1 cup rice', quantity: '1', unit: 'cup', item: 'rice' }]),
  image: fc.constant<string | null>('https://example.com/image.jpg'),
  deleted: fc.option(stamp, { nil: null }),
});

const foldMerge = (copies: readonly Recipe[]): Recipe => copies.slice(1).reduce(mergeRecipe, copies[0]!);

describe('mergeRecipe examples (decision-16, R20)', () => {
  const base: Recipe = {
    id: 'r1',
    addedBy: 'alex',
    createdAt: 1,
    sourceUrl: 'https://example.com/recipe',
    title: 'Tacos',
    yield: '4 servings',
    steps: ['Cook it', 'Eat it'],
    ingredients: [{ line: '1 cup rice', quantity: '1', unit: 'cup', item: 'rice' }],
    image: 'https://example.com/image.jpg',
    deleted: null,
  };

  it('the earlier createdAt keeps addedBy, createdAt and content', () => {
    const earlier = { ...base, addedBy: 'alex', createdAt: 1 };
    const later = { ...base, addedBy: 'sam', createdAt: 5, title: 'Burritos' };
    const merged = mergeRecipe(earlier, later);
    expect(merged.addedBy).toBe('alex');
    expect(merged.createdAt).toBe(1);
    expect(merged.title).toBe('Tacos');
    // same in the other argument order
    expect(mergeRecipe(later, earlier)).toEqual(merged);
  });

  it('a tied createdAt breaks the tie by addedBy, as mergeMeal does', () => {
    const a = { ...base, addedBy: 'sam', createdAt: 3 };
    const b = { ...base, addedBy: 'alex', createdAt: 3 };
    expect(mergeRecipe(a, b).addedBy).toBe('alex');
    expect(mergeRecipe(b, a).addedBy).toBe('alex');
  });

  it('a delete on either copy wins', () => {
    const deleted = { ...base, deleted: { at: 2, by: 'sam' } };
    const live = { ...base, createdAt: 0 };
    expect(isRecipeDeleted(mergeRecipe(deleted, live))).toBe(true);
    expect(isRecipeDeleted(mergeRecipe(live, deleted))).toBe(true);
  });

  it('a later copy with deleted: null (a re-import) never clears a tombstone', () => {
    const deleted = { ...base, createdAt: 1, deleted: { at: 2, by: 'sam' } };
    const reimported = { ...base, createdAt: 10, deleted: null };
    expect(isRecipeDeleted(mergeRecipe(deleted, reimported))).toBe(true);
    expect(isRecipeDeleted(mergeRecipe(reimported, deleted))).toBe(true);
  });

  it('refuses to merge two different recipes', () => {
    expect(() => mergeRecipe(base, { ...base, id: 'other' })).toThrow(/different recipes/);
  });
});

describe('mergeRecipe properties (R46)', () => {
  it('does not depend on the order changes arrive in', () => {
    fc.assert(
      fc.property(fc.array(recipeCopy, { minLength: 1, maxLength: 6 }), (copies) => {
        const forward = foldMerge(copies);
        const reversed = foldMerge([...copies].reverse());
        expect(reversed).toEqual(forward);
      }),
    );
  });

  it('gives the same result for any shuffle of the same changes', () => {
    fc.assert(
      fc.property(fc.array(recipeCopy, { minLength: 2, maxLength: 6 }), fc.infiniteStream(fc.nat()), (copies, rand) => {
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
      fc.property(recipeCopy, recipeCopy, (a, b) => {
        const once = mergeRecipe(a, b);
        expect(mergeRecipe(once, b)).toEqual(once);
        expect(mergeRecipe(once, a)).toEqual(once);
        expect(mergeRecipe(a, a)).toEqual(a);
      }),
    );
  });

  it('is associative', () => {
    fc.assert(
      fc.property(recipeCopy, recipeCopy, recipeCopy, (a, b, c) => {
        expect(mergeRecipe(mergeRecipe(a, b), c)).toEqual(mergeRecipe(a, mergeRecipe(b, c)));
      }),
    );
  });

  it('a delete is never undone, whatever arrives after it', () => {
    fc.assert(
      fc.property(recipeCopy, fc.array(recipeCopy, { maxLength: 5 }), (deleted, others) => {
        const withDelete = { ...deleted, deleted: deleted.deleted ?? { at: 0, by: 'alex' } };
        for (const order of [[withDelete, ...others], [...others, withDelete]]) {
          expect(isRecipeDeleted(foldMerge(order))).toBe(true);
        }
      }),
    );
  });
});
