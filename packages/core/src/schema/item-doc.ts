// The stored shape of an item (R30). Defined once here; providers call decodeItem on read and
// encodeItem on write and never invent their own shape. Changing this shape bumps
// ITEM_SCHEMA_VERSION and adds a migration test (R54).
import type { Stamp, Stamped } from '../merge/lww.ts';
import type { Item, ItemState } from '../model/item.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

export const ITEM_SCHEMA_VERSION = 1;

interface StoredField<T> {
  readonly v: T;
  readonly at: number;
  readonly by: string;
}

/** The document stored for one item. Personal fields: name.v and amount.v (see personal.ts). */
export interface ItemDoc {
  readonly schemaVersion: typeof ITEM_SCHEMA_VERSION;
  readonly id: string;
  readonly weekId: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly name: StoredField<string>;
  readonly amount: StoredField<string | null>;
  readonly aisle: StoredField<string>;
  readonly state: StoredField<ItemState>;
  readonly badges: readonly string[];
  readonly deleted: Stamp | null;
}

export interface SchemaError {
  readonly kind: 'invalid' | 'unsupported-version';
  readonly path: string;
  readonly message: string;
}

const toStored = <T>(f: Stamped<T>): StoredField<T> => ({ v: f.value, at: f.stamp.at, by: f.stamp.by });

export function encodeItem(item: Item): ItemDoc {
  return {
    schemaVersion: ITEM_SCHEMA_VERSION,
    id: item.id,
    weekId: item.weekId,
    addedBy: item.addedBy,
    createdAt: item.createdAt,
    name: toStored(item.name),
    amount: toStored(item.amount),
    aisle: toStored(item.aisle),
    state: toStored(item.state),
    badges: [...item.badges],
    deleted: item.deleted ? { at: item.deleted.at, by: item.deleted.by } : null,
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
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isState = (v: unknown): v is ItemState => v === 'to-buy' || v === 'in-cart';

/** Validate data read from the store (or anywhere else) and turn it into an Item. */
export function decodeItem(raw: unknown): Result<Item, SchemaError> {
  if (!isObject(raw)) return bad('', 'expected an object');
  if (raw['schemaVersion'] !== ITEM_SCHEMA_VERSION) {
    return err({ kind: 'unsupported-version', path: 'schemaVersion', message: `expected version ${ITEM_SCHEMA_VERSION}, found ${String(raw['schemaVersion'])}` });
  }
  for (const key of ['id', 'weekId', 'addedBy'] as const) {
    if (typeof raw[key] !== 'string' || raw[key] === '') return bad(key, 'expected a non-empty string');
  }
  if (typeof raw['createdAt'] !== 'number' || !Number.isFinite(raw['createdAt'])) return bad('createdAt', 'expected a number');
  const name = readField(raw['name'], 'name', isString, 'a string');
  if (!name.ok) return name;
  const amount = readField(raw['amount'], 'amount', isNullableString, 'a string or null');
  if (!amount.ok) return amount;
  const aisle = readField(raw['aisle'], 'aisle', isString, 'a string');
  if (!aisle.ok) return aisle;
  const state = readField(raw['state'], 'state', isState, 'to-buy or in-cart');
  if (!state.ok) return state;
  const badges = raw['badges'];
  if (!Array.isArray(badges) || !badges.every(isString)) return bad('badges', 'expected a list of meal ids');
  let deleted: Stamp | null = null;
  if (raw['deleted'] !== null) {
    const d = readStamp(raw['deleted'], 'deleted');
    if (!d.ok) return d;
    deleted = d.value;
  }
  return ok({
    id: raw['id'] as string,
    weekId: raw['weekId'] as string,
    addedBy: raw['addedBy'] as string,
    createdAt: raw['createdAt'],
    name: name.value,
    amount: amount.value,
    aisle: aisle.value,
    state: state.value,
    badges: [...badges],
    deleted,
  });
}
