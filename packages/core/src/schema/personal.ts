// Personal fields (R36). What a kitchen types (item names, amounts, meal names, links) is marked
// personal here, once, and is removed from every log record by `redact` before it is written.

interface EntityMarking {
  readonly entity: string;
  /**
   * Keys that together identify an object of this entity, so its personal fields can be found by
   * shape. Order in PERSONAL_FIELDS matters when one entity's shape is a subset of another's
   * (item's ['weekId','addedBy'] is a subset of every meal doc too, which also has 'dayIndex'):
   * list the more specific shape first, so it is checked before the subset can match and
   * misclassify it, silently leaking whichever of its own personal fields the subset entity's
   * list does not also cover (a meal misclassified as an item would leak its link, since item's
   * personal list redacts name but has no entry for link).
   */
  readonly shape: readonly string[];
  readonly personal: readonly string[];
}

/**
 * Add an entry when a new stored entity gets a field the kitchen types. meal is listed before
 * item: dayIndex is a true structural exclusive to meal, so checking it first means meal can only
 * ever match an actual meal, and anything else falls through cleanly to item's unchanged check.
 */
export const PERSONAL_FIELDS: readonly EntityMarking[] = [
  { entity: 'meal', shape: ['weekId', 'dayIndex'], personal: ['name', 'link'] },
  { entity: 'item', shape: ['weekId', 'addedBy'], personal: ['name', 'amount'] },
];

export const REDACTED = '[redacted]';

const capitalise = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Attribute names that carry a personal value on their own, such as itemName or mealLink. */
export const PERSONAL_ATTRIBUTE_KEYS: ReadonlySet<string> = new Set(
  PERSONAL_FIELDS.flatMap((e) => e.personal.map((f) => `${e.entity}${capitalise(f)}`)),
);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** A stamped field ({ value, stamp }) or a stored one ({ v/value, at, by }) hides its value. */
function redactValue(v: unknown): unknown {
  if (isPlainObject(v) && ('value' in v || 'v' in v)) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'value' || k === 'v' ? REDACTED : x]));
  }
  return REDACTED;
}

export const CIRCULAR = '[circular]';

function redactInner(value: unknown, path: WeakSet<object>): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (path.has(value)) return CIRCULAR;
  path.add(value);
  try {
    if (Array.isArray(value)) return value.map((v) => redactInner(v, path));
    if (!isPlainObject(value)) return value;
    const entity = PERSONAL_FIELDS.find((e) => e.shape.every((k) => k in value));
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
      out[key] = PERSONAL_ATTRIBUTE_KEYS.has(key) || entity?.personal.includes(key) ? redactValue(inner) : redactInner(inner, path);
    }
    return out;
  } finally {
    path.delete(value);
  }
}

/**
 * A copy of `value` with every personal field removed: personal fields of any object shaped like an
 * item or meal, and any attribute named after one (itemName, mealLink). Cycles are cut. Pure and idempotent.
 */
export function redact(value: unknown): unknown {
  return redactInner(value, new WeakSet());
}
