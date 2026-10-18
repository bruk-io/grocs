import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { compareStamps, laterStamp, mergeStamped, stamped } from './lww.ts';
import type { Stamp } from './lww.ts';

const stamp = fc.record({ at: fc.integer({ min: 0, max: 20 }), by: fc.constantFrom('bruk', 'shazya') });
const field = fc.record({ value: fc.constantFrom('to-buy', 'in-cart', 'x'), stamp });

describe('last-write-wins', () => {
  it('the later change wins', () => {
    const a = stamped('to-buy', { at: 1, by: 'bruk' });
    const b = stamped('in-cart', { at: 2, by: 'shazya' });
    expect(mergeStamped(a, b)).toBe(b);
    expect(mergeStamped(b, a)).toBe(b);
  });

  it('at the same instant the member id breaks the tie', () => {
    const a = stamped('to-buy', { at: 5, by: 'bruk' });
    const b = stamped('in-cart', { at: 5, by: 'shazya' });
    expect(mergeStamped(a, b)).toBe(b);
    expect(mergeStamped(b, a)).toBe(b);
  });

  it('compares stamps and picks the later optional stamp', () => {
    const early: Stamp = { at: 1, by: 'a' };
    const late: Stamp = { at: 2, by: 'a' };
    expect(compareStamps(early, late)).toBeLessThan(0);
    expect(compareStamps(late, early)).toBeGreaterThan(0);
    expect(compareStamps(late, late)).toBe(0);
    expect(laterStamp(null, late)).toBe(late);
    expect(laterStamp(early, null)).toBe(early);
    expect(laterStamp(null, null)).toBeNull();
    expect(laterStamp(early, late)).toBe(late);
  });

  describe('properties (R46)', () => {
    it('is commutative', () => {
      fc.assert(fc.property(field, field, (a, b) => {
          expect(mergeStamped(a, b)).toEqual(mergeStamped(b, a));
        }));
    });
    it('is associative', () => {
      fc.assert(
        fc.property(field, field, field, (a, b, c) => {
          expect(mergeStamped(mergeStamped(a, b), c)).toEqual(mergeStamped(a, mergeStamped(b, c)));
        }),
      );
    });
    it('is idempotent: applying a change twice has no further effect', () => {
      fc.assert(fc.property(field, field, (a, b) => {
          expect(mergeStamped(mergeStamped(a, b), b)).toEqual(mergeStamped(a, b));
        }));
    });
  });
});
