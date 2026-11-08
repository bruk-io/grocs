import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { stamped } from '../merge/lww.ts';
import { decodeAisleMemory, encodeAisleMemory, AISLE_SCHEMA_VERSION } from './aisle-doc.ts';

const make = () => stamped('dairy', { at: 100, by: 'alex' });

describe('aisle memory document (R30)', () => {
  it('carries a schema version', () => {
    expect(encodeAisleMemory(make()).schemaVersion).toBe(AISLE_SCHEMA_VERSION);
  });

  it('round-trips through the stored form, including JSON', () => {
    const aisle = stamped('produce', { at: 200, by: 'sam' });
    expect(decodeAisleMemory(encodeAisleMemory(aisle))).toEqual({ ok: true, value: aisle });
    expect(decodeAisleMemory(JSON.parse(JSON.stringify(encodeAisleMemory(aisle))))).toEqual({ ok: true, value: aisle });
  });

  it('round-trips any aisle string', () => {
    fc.assert(
      fc.property(fc.string(), (aisleValue) => {
        const aisle = stamped(aisleValue, { at: 1, by: 'a' });
        expect(decodeAisleMemory(encodeAisleMemory(aisle))).toEqual({ ok: true, value: aisle });
      }),
    );
  });

  it('rejects data from a version this code does not know', () => {
    const r = decodeAisleMemory({ ...encodeAisleMemory(make()), schemaVersion: 2 });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.kind).toBe('unsupported-version');
  });

  it('rejects data with missing schemaVersion', () => {
    const r = decodeAisleMemory({ aisle: encodeAisleMemory(make()).aisle });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error.kind).toBe('unsupported-version');
  });

  it('rejects documents with a wrong or missing field and names the path', () => {
    const doc = encodeAisleMemory(make());
    const cases: [unknown, string, 'invalid' | 'unsupported-version'][] = [
      [null, '', 'invalid'],
      [{ ...doc, aisle: { ...doc.aisle, v: 3 } }, 'aisle.v', 'invalid'],
      [{ ...doc, aisle: { ...doc.aisle, by: '' } }, 'aisle.by', 'invalid'],
      [{ ...doc, aisle: { ...doc.aisle, at: 'now' } }, 'aisle.at', 'invalid'],
      [{ ...doc, aisle: { ...doc.aisle, at: NaN } }, 'aisle.at', 'invalid'],
      [{ ...doc, aisle: undefined }, 'aisle', 'invalid'],
    ];
    for (const [raw, path, kind] of cases) {
      const r = decodeAisleMemory(raw);
      expect(r.ok, path).toBe(false);
      expect(!r.ok && r.error.path, path).toBe(path);
      expect(!r.ok && r.error.kind, path).toBe(kind);
    }
  });
});
