// The stored shape of an aisle (R30). Defined once here; providers call decodeAisleMemory
// on read and encodeAisleMemory on write and never invent their own shape. Changing this
// shape bumps AISLE_SCHEMA_VERSION and adds a migration test (R54).
import type { Stamped } from '../merge/lww.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';
import { bad, isObject, readField, toStored } from './item-doc.ts';
import type { SchemaError, StoredField } from './item-doc.ts';

export const AISLE_SCHEMA_VERSION = 1;

/** The document stored for an aisle memory entry. */
export interface AisleMemoryDoc {
  readonly schemaVersion: typeof AISLE_SCHEMA_VERSION;
  readonly aisle: StoredField<string>;
}

export function encodeAisleMemory(aisle: Stamped<string>): AisleMemoryDoc {
  return {
    schemaVersion: AISLE_SCHEMA_VERSION,
    aisle: toStored(aisle),
  };
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
