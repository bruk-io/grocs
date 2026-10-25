// The stored shape of a meal (R30), mirroring item-doc.ts. Providers call decodeMeal on read and
// encodeMeal on write and never invent their own shape. Changing this shape bumps
// MEAL_SCHEMA_VERSION and adds a migration test (R54).
import type { Stamp, Stamped } from '../merge/lww.ts';
import type { DayIndex, Meal } from '../model/meal.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';
import type { SchemaError } from './item-doc.ts';

export const MEAL_SCHEMA_VERSION = 1;

interface StoredField<T> {
  readonly v: T;
  readonly at: number;
  readonly by: string;
}

/** The document stored for one meal. Personal fields: name.v and link.v (see personal.ts). */
export interface MealDoc {
  readonly schemaVersion: typeof MEAL_SCHEMA_VERSION;
  readonly id: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly weekId: StoredField<string>;
  readonly dayIndex: StoredField<DayIndex>;
  readonly name: StoredField<string>;
  readonly link: StoredField<string | null>;
  readonly deleted: Stamp | null;
}

const toStored = <T>(f: Stamped<T>): StoredField<T> => ({ v: f.value, at: f.stamp.at, by: f.stamp.by });

export function encodeMeal(meal: Meal): MealDoc {
  return {
    schemaVersion: MEAL_SCHEMA_VERSION,
    id: meal.id,
    addedBy: meal.addedBy,
    createdAt: meal.createdAt,
    weekId: toStored(meal.weekId),
    dayIndex: toStored(meal.dayIndex),
    name: toStored(meal.name),
    link: toStored(meal.link),
    deleted: meal.deleted ? { at: meal.deleted.at, by: meal.deleted.by } : null,
  };
}

const bad = (path: string, message: string): Result<never, SchemaError> => err({ kind: 'invalid', path, message });
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function readStamp(raw: unknown, path: string): Result<Stamp, SchemaError> {
  if (!isObject(raw)) return bad(path, 'expected an object');
  if (typeof raw['at'] !== 'number' || !Number.isFinite(raw['at'])) return bad(`${path}.at`, 'expected a number');
  if (typeof raw['by'] !== 'string' || raw['by'] === '') return bad(`${path}.by`, 'expected a non-empty string');
  return ok({ at: raw['at'], by: raw['by'] });
}

function readField<T>(raw: unknown, path: string, value: (v: unknown) => v is T, what: string): Result<Stamped<T>, SchemaError> {
  if (!isObject(raw)) return bad(path, 'expected an object');
  if (!value(raw['v'])) return bad(`${path}.v`, `expected ${what}`);
  const stamp = readStamp(raw, path);
  if (!stamp.ok) return stamp;
  return ok({ value: raw['v'], stamp: stamp.value });
}

const isString = (v: unknown): v is string => typeof v === 'string';
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v !== '';
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isDayIndex = (v: unknown): v is DayIndex => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 6;

/** Validate data read from the store (or anywhere else) and turn it into a Meal. */
export function decodeMeal(raw: unknown): Result<Meal, SchemaError> {
  if (!isObject(raw)) return bad('', 'expected an object');
  if (raw['schemaVersion'] !== MEAL_SCHEMA_VERSION) {
    return err({ kind: 'unsupported-version', path: 'schemaVersion', message: `expected version ${MEAL_SCHEMA_VERSION}, found ${String(raw['schemaVersion'])}` });
  }
  for (const key of ['id', 'addedBy'] as const) {
    if (typeof raw[key] !== 'string' || raw[key] === '') return bad(key, 'expected a non-empty string');
  }
  if (typeof raw['createdAt'] !== 'number' || !Number.isFinite(raw['createdAt'])) return bad('createdAt', 'expected a number');
  const weekId = readField(raw['weekId'], 'weekId', isNonEmptyString, 'a non-empty string');
  if (!weekId.ok) return weekId;
  const dayIndex = readField(raw['dayIndex'], 'dayIndex', isDayIndex, 'an integer from 0 (Monday) to 6 (Sunday)');
  if (!dayIndex.ok) return dayIndex;
  const name = readField(raw['name'], 'name', isString, 'a string');
  if (!name.ok) return name;
  const link = readField(raw['link'], 'link', isNullableString, 'a string or null');
  if (!link.ok) return link;
  let deleted: Stamp | null = null;
  if (raw['deleted'] !== null) {
    const d = readStamp(raw['deleted'], 'deleted');
    if (!d.ok) return d;
    deleted = d.value;
  }
  return ok({
    id: raw['id'] as string,
    addedBy: raw['addedBy'] as string,
    createdAt: raw['createdAt'],
    weekId: weekId.value,
    dayIndex: dayIndex.value,
    name: name.value,
    link: link.value,
    deleted,
  });
}
