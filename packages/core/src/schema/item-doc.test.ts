import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Item } from '../model/item.ts';
import { createExtraItem } from '../model/item.ts';
import { decodeItem, encodeItem, ITEM_SCHEMA_VERSION } from './item-doc.ts';

const make = (): Item => {
  const r = createExtraItem({ id: 'i1', weekId: '2026-W42', name: 'Oat milk', amount: '2' }, { at: 5, by: 'bruk' });
  if (!r.ok) throw new Error('setup');
  return r.value;
};

describe('item document (R30)', () => {
  it('carries a schema version', () => {
    expect(encodeItem(make()).schemaVersion).toBe(ITEM_SCHEMA_VERSION);
  });

  it('round-trips through the stored form, including JSON', () => {
    const item = { ...make(), badges: ['m1', 'm2'], deleted: { at: 9, by: 'sam' } };
    expect(decodeItem(encodeItem(item))).toEqual({ ok: true, value: item });
    expect(decodeItem(JSON.parse(JSON.stringify(encodeItem(item))))).toEqual({ ok: true, value: item });
  });

  it('round-trips any name and amount', () => {
    fc.assert(
      fc.property(fc.string(), fc.option(fc.string(), { nil: null }), (name, amount) => {
        const item = { ...make(), name: { value: name, stamp: { at: 1, by: 'a' } }, amount: { value: amount, stamp: { at: 1, by: 'a' } } };
        expect(decodeItem(encodeItem(item))).toEqual({ ok: true, value: item });
      }),
    );
  });

  it('rejects data from a version this code does not know', () => {
    const r = decodeItem({ ...encodeItem(make()), schemaVersion: 2 });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.kind).toBe('unsupported-version');
  });

  it('rejects documents with a wrong or missing field and names the path', () => {
    const doc = encodeItem(make());
    const cases: [unknown, string][] = [
      [null, ''],
      [{ ...doc, id: '' }, 'id'],
      [{ ...doc, createdAt: 'now' }, 'createdAt'],
      [{ ...doc, name: { ...doc.name, v: 3 } }, 'name.v'],
      [{ ...doc, name: { ...doc.name, by: '' } }, 'name.by'],
      [{ ...doc, state: { ...doc.state, v: 'bought' } }, 'state.v'],
      [{ ...doc, badges: [1] }, 'badges'],
      [{ ...doc, deleted: { at: 'x', by: 'a' } }, 'deleted.at'],
      [{ ...doc, amount: undefined }, 'amount'],
    ];
    for (const [raw, path] of cases) {
      const r = decodeItem(raw);
      expect(r.ok, path).toBe(false);
      expect(!r.ok && r.error.path, path).toBe(path);
    }
  });
});
