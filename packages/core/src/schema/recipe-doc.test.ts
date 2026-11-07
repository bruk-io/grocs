import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ParsedIngredient, Recipe } from '../model/recipe.ts';
import { decodeRecipe, encodeRecipe, RECIPE_SCHEMA_VERSION } from './recipe-doc.ts';

const ingredient = (overrides: Partial<ParsedIngredient> = {}): ParsedIngredient => ({
  line: '2 cups flour',
  quantity: '2',
  unit: 'cups',
  item: 'flour',
  ...overrides,
});

const make = (): Recipe => ({
  id: 'r1',
  addedBy: 'alex',
  createdAt: 5,
  sourceUrl: 'https://recipe.invalid/tacos',
  title: 'Tacos',
  yield: '4 servings',
  steps: ['Chop the onions.', 'Cook the meat.'],
  ingredients: [ingredient(), ingredient({ line: 'Salt to taste', quantity: null, unit: null, item: null })],
  image: 'https://recipe.invalid/tacos.jpg',
  deleted: null,
});

describe('recipe document (R30, decision-16)', () => {
  it('carries a schema version', () => {
    expect(encodeRecipe(make()).schemaVersion).toBe(RECIPE_SCHEMA_VERSION);
  });

  it('round-trips through the stored form, including JSON', () => {
    const recipe = { ...make(), deleted: { at: 9, by: 'sam' } };
    expect(decodeRecipe(encodeRecipe(recipe))).toEqual({ ok: true, value: recipe });
    expect(decodeRecipe(JSON.parse(JSON.stringify(encodeRecipe(recipe))))).toEqual({ ok: true, value: recipe });
  });

  it('round-trips any title, yield, steps, ingredients and image', () => {
    const fcIngredient = fc.record({
      line: fc.string({ minLength: 1 }),
      quantity: fc.option(fc.string(), { nil: null }),
      unit: fc.option(fc.string(), { nil: null }),
      item: fc.option(fc.string(), { nil: null }),
    });
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.option(fc.string(), { nil: null }),
        fc.array(fc.string()),
        fc.array(fcIngredient),
        fc.option(fc.string(), { nil: null }),
        (title, yieldValue, steps, ingredients, image) => {
          const recipe = { ...make(), title, yield: yieldValue, steps, ingredients, image };
          expect(decodeRecipe(encodeRecipe(recipe))).toEqual({ ok: true, value: recipe });
        },
      ),
    );
  });

  it('rejects data from a version this code does not know', () => {
    const r = decodeRecipe({ ...encodeRecipe(make()), schemaVersion: 2 });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.kind).toBe('unsupported-version');
  });

  it('rejects documents with a wrong or missing field and names the path', () => {
    const doc = encodeRecipe(make());
    const cases: [unknown, string][] = [
      [null, ''],
      [{ ...doc, id: '' }, 'id'],
      [{ ...doc, addedBy: '' }, 'addedBy'],
      [{ ...doc, sourceUrl: '' }, 'sourceUrl'],
      [{ ...doc, createdAt: 'now' }, 'createdAt'],
      [{ ...doc, title: '' }, 'title'],
      [{ ...doc, title: 3 }, 'title'],
      [{ ...doc, yield: 3 }, 'yield'],
      [{ ...doc, steps: 'none' }, 'steps'],
      [{ ...doc, steps: [doc.steps[0], 3] }, 'steps.1'],
      [{ ...doc, ingredients: 'none' }, 'ingredients'],
      [{ ...doc, ingredients: [{ ...doc.ingredients[0], line: '' }] }, 'ingredients.0.line'],
      [{ ...doc, ingredients: [{ ...doc.ingredients[0], line: 3 }] }, 'ingredients.0.line'],
      [{ ...doc, ingredients: [{ ...doc.ingredients[0], quantity: 3 }] }, 'ingredients.0.quantity'],
      [{ ...doc, ingredients: [{ ...doc.ingredients[0], unit: 3 }] }, 'ingredients.0.unit'],
      [{ ...doc, ingredients: [{ ...doc.ingredients[0], item: 3 }] }, 'ingredients.0.item'],
      [{ ...doc, image: 3 }, 'image'],
      [{ ...doc, deleted: { at: 'x', by: 'a' } }, 'deleted.at'],
      [{ ...doc, deleted: { at: 1, by: '' } }, 'deleted.by'],
    ];
    for (const [raw, path] of cases) {
      const r = decodeRecipe(raw);
      expect(r.ok, path).toBe(false);
      expect(!r.ok && r.error.path, path).toBe(path);
    }
  });
});
