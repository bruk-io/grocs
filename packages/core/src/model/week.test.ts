import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { weekIdFor } from './week.ts';

/** The textbook way, with Date, to check the integer version against. */
function reference(at: number): string {
  const d = new Date(at);
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const start = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - start) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

describe('weekIdFor (R5)', () => {
  it('names the ISO week of known dates', () => {
    expect(weekIdFor(Date.UTC(2026, 9, 19))).toBe('2026-W43'); // Monday
    expect(weekIdFor(Date.UTC(2026, 9, 18, 23, 59))).toBe('2026-W42'); // Sunday before
    expect(weekIdFor(Date.UTC(2021, 0, 3))).toBe('2020-W53'); // belongs to the previous year
    expect(weekIdFor(Date.UTC(2024, 11, 30))).toBe('2025-W01'); // belongs to the next year
    expect(weekIdFor(Date.UTC(1970, 0, 1))).toBe('1970-W01');
  });

  it('changes at Monday midnight, not before', () => {
    const monday = Date.UTC(2026, 9, 19);
    expect(weekIdFor(monday - 1)).not.toBe(weekIdFor(monday));
    expect(weekIdFor(monday)).toBe(weekIdFor(monday + 6 * 86_400_000 + 86_399_999));
  });

  it('agrees with the Date-based calculation for any instant from 1900 to 2200', () => {
    fc.assert(
      fc.property(fc.integer({ min: Date.UTC(1900, 0, 1), max: Date.UTC(2200, 0, 1) }), (at) => {
        expect(weekIdFor(at)).toBe(reference(at));
      }),
      { numRuns: 2000 },
    );
  });
});
