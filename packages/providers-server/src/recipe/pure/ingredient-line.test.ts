import { describe, expect, it } from 'vitest';
import { parseIngredientLine } from './ingredient-line.ts';

describe('parseIngredientLine', () => {
  it.each([
    // line, quantity, unit, item
    ['  2 cups flour  ', '2 cups flour', '2', 'cups', 'flour'],

    // Unicode fractions
    ['½ cup butter', '½ cup butter', '½', 'cup', 'butter'],
    ['1¼ cups flour', '1¼ cups flour', '1¼', 'cups', 'flour'],

    // Mixed numbers
    ['1 1/2 cups sugar', '1 1/2 cups sugar', '1 1/2', 'cups', 'sugar'],

    // Ranges
    ['2-3 cloves garlic', '2-3 cloves garlic', '2-3', 'cloves', 'garlic'],
    ['2 to 3 cups water', '2 to 3 cups water', '2 to 3', 'cups', 'water'],

    // Bracketed sizes
    ['1 (14-ounce) can chickpeas', '1 (14-ounce) can chickpeas', '1', '(14-ounce) can', 'chickpeas'],

    // A note after the first comma is excluded from item
    ['2 onions, finely chopped', '2 onions, finely chopped', '2', null, 'onions'],

    // No quantity
    ['salt to taste', 'salt to taste', null, null, 'salt to taste'],

    // Common units and abbreviations, plus plurals
    ['1 tbsp olive oil', '1 tbsp olive oil', '1', 'tbsp', 'olive oil'],
    ['2 tbsps olive oil', '2 tbsps olive oil', '2', 'tbsps', 'olive oil'],
    ['1 tsp salt', '1 tsp salt', '1', 'tsp', 'salt'],
    ['2 tsps salt', '2 tsps salt', '2', 'tsps', 'salt'],
    ['500 g flour', '500 g flour', '500', 'g', 'flour'],
    ['2 kg potatoes', '2 kg potatoes', '2', 'kg', 'potatoes'],
    ['250 ml milk', '250 ml milk', '250', 'ml', 'milk'],
    ['8 oz cream cheese', '8 oz cream cheese', '8', 'oz', 'cream cheese'],
    ['1 lb ground beef', '1 lb ground beef', '1', 'lb', 'ground beef'],
    ['3 cloves garlic', '3 cloves garlic', '3', 'cloves', 'garlic'],
    ['1 pinch salt', '1 pinch salt', '1', 'pinch', 'salt'],
    ['2 pinches salt', '2 pinches salt', '2', 'pinches', 'salt'],
  ])('%s -> %j', (input, expectedLine, quantity, unit, item) => {
    expect(parseIngredientLine(input)).toEqual({ line: expectedLine, quantity, unit, item });
  });

  it('keeps quantity and unit as written, not normalised', () => {
    expect(parseIngredientLine('2 Cups Flour')).toEqual({
      line: '2 Cups Flour',
      quantity: '2',
      unit: 'Cups',
      item: 'Flour',
    });
  });

  it('treats a line with no recognisable quantity as having no quantity or unit', () => {
    expect(parseIngredientLine('a pinch of salt')).toEqual({
      line: 'a pinch of salt',
      quantity: null,
      unit: null,
      item: 'a pinch of salt',
    });
  });

  it('drops a note after the first comma even with no unit matched', () => {
    expect(parseIngredientLine('1 ripe avocado, mashed')).toEqual({
      line: '1 ripe avocado, mashed',
      quantity: '1',
      unit: null,
      item: 'ripe avocado',
    });
  });
});
