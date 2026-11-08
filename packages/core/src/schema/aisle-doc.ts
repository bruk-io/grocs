// The stored shape of an aisle (R30). Defined once here; providers call decodeAisleMemory
// on read and encodeAisleMemory on write and never invent their own shape. Changing this
// shape bumps AISLE_SCHEMA_VERSION and adds a migration test (R54).
import type { Stamp, Stamped } from '../merge/lww.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

export const AISLE_SCHEMA_VERSION = 1;

interface StoredField<T> {
  readonly v: T;
  readonly at: number;
  readonly by: string;
}

/** The document stored for an aisle memory entry. */
export interface AisleMemoryDoc {
  readonly schemaVersion: typeof AISLE_SCHEMA_VERSION;
  readonly aisle: StoredField<string>;
}

export interface SchemaError {
  readonly kind: 'invalid' | 'unsupported-version';
  readonly path: string;
  readonly message: string;
}

const toStored = <T>(f: Stamped<T>): StoredField<T> => ({ v: f.value, at: f.stamp.at, by: f.stamp.by });

export function encodeAisleMemory(aisle: Stamped<string>): AisleMemoryDoc {
  return {
    schemaVersion: AISLE_SCHEMA_VERSION,
    aisle: toStored(aisle),
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

/** Validate data read from the store (or anywhere else) and turn it into a stamped aisle. */
export function decodeAisleMemory(raw: unknown): Result<Stamped<string>, SchemaError> {
  if (!isObject(raw)) return bad('', 'expected an object');
  if (raw['schemaVersion'] !== AISLE_SCHEMA_VERSION) {
    return err({ kind: 'unsupported-version', path: 'schemaVersion', message: `expected version ${AISLE_SCHEMA_VERSION}, found ${String(raw['schemaVersion'])}` });
  }
  const aisle = readField(raw['aisle'], 'aisle', isString, 'a string');
  if (!aisle.ok) return aisle;
  return ok(aisle.value);
}
