// Contract §9 (decision-15). Held to core-purity and import-layers' pure-folder rule: no ambient
// globals (no Date, crypto, fetch, ...) and no imports except @grocs/core and pure/ siblings.
// `line` is the source of truth; quantity, unit and item are best effort and kept as written.
import type { ParsedIngredient } from '@grocs/core';

/** Vulgar (precomposed) Unicode fraction characters, e.g. the ½ in '½ cup' or the ¼ in '1¼ cups'. */
const VULGAR_FRACTIONS = '¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞';

/** Common units and their abbreviations, singular and plural, matched case-insensitively. */
const UNITS = new Set([
  'cup', 'cups', 'c',
  'tablespoon', 'tablespoons', 'tbsp', 'tbsps', 'tbs',
  'teaspoon', 'teaspoons', 'tsp', 'tsps',
  'gram', 'grams', 'g',
  'kilogram', 'kilograms', 'kg',
  'milliliter', 'milliliters', 'millilitre', 'millilitres', 'ml',
  'liter', 'liters', 'litre', 'litres', 'l',
  'ounce', 'ounces', 'oz',
  'pound', 'pounds', 'lb', 'lbs',
  'clove', 'cloves',
  'pinch', 'pinches',
]);

const NUMBER = `\\d+(?:\\.\\d+)?`;
const FRACTION_CHAR = `[${VULGAR_FRACTIONS}]`;
/** One side of a range or a plain amount: a mixed number ('1 1/2'), a simple fraction ('1/2'), a
 * number glued to a vulgar fraction ('1¼'), a bare vulgar fraction ('½'), or a plain number. Tried
 * in this order so the longer forms win over the plain-number fallback. */
const QTY_ATOM = `(?:${NUMBER}\\s+\\d+\\/\\d+|\\d+\\/\\d+|${NUMBER}${FRACTION_CHAR}|${FRACTION_CHAR}|${NUMBER})`;
/** A quantity, optionally a range: '2-3' or '2 to 3'. */
const QUANTITY_PATTERN = new RegExp(`^${QTY_ATOM}(?:\\s*-\\s*${QTY_ATOM}|\\s+to\\s+${QTY_ATOM})?`);

/** A bracketed size followed by a word, e.g. '(14-ounce) can'. */
const BRACKETED_UNIT_PATTERN = /^\([^)]*\)\s+\S+/;

/** A leading run of letters, with an optional trailing period for abbreviations like 'tbsp.'. */
const WORD_PATTERN = /^[A-Za-z]+\.?/;

/** Everything up to the first comma, trimmed; null when nothing is left. */
function stripNote(text: string): string | null {
  const commaIndex = text.indexOf(',');
  const upToComma = commaIndex === -1 ? text : text.slice(0, commaIndex);
  const trimmed = upToComma.trim();
  return trimmed === '' ? null : trimmed;
}

export function parseIngredientLine(line: string): ParsedIngredient {
  const trimmedLine = line.trim();

  const quantityMatch = QUANTITY_PATTERN.exec(trimmedLine);
  if (!quantityMatch) {
    return { line: trimmedLine, quantity: null, unit: null, item: stripNote(trimmedLine) };
  }

  const quantity = quantityMatch[0];
  const afterQuantity = trimmedLine.slice(quantity.length).trimStart();

  const bracketMatch = BRACKETED_UNIT_PATTERN.exec(afterQuantity);
  if (bracketMatch) {
    const unit = bracketMatch[0];
    const rest = afterQuantity.slice(unit.length);
    return { line: trimmedLine, quantity, unit, item: stripNote(rest) };
  }

  const wordMatch = WORD_PATTERN.exec(afterQuantity);
  const word = wordMatch?.[0].replace(/\.$/, '') ?? '';
  if (wordMatch && UNITS.has(word.toLowerCase())) {
    const unit = wordMatch[0];
    const rest = afterQuantity.slice(unit.length);
    return { line: trimmedLine, quantity, unit, item: stripNote(rest) };
  }

  return { line: trimmedLine, quantity, unit: null, item: stripNote(afterQuantity) };
}
