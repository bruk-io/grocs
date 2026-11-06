import { describe, expect, it } from 'vitest';
import { expiryLabel } from './invite-expiry.ts';

const DAY = 24 * 60 * 60 * 1000;
// A fixed calendar: days start at multiples of DAY, times read as "h:00".
const timeOf = (at: number) => `${Math.floor((at % DAY) / 3_600_000)}:00`;
const dayStart = (at: number) => at - (at % DAY);
const weekdayOf = () => 'Thu';

describe('expiryLabel', () => {
  it('says today when the invite stops working later today', () => {
    expect(expiryLabel(15 * 3_600_000, 9 * 3_600_000, timeOf, dayStart, weekdayOf)).toBe('Works until 15:00 today');
  });

  it('says tomorrow for a fresh invite, which works for a day', () => {
    expect(expiryLabel(DAY + 9 * 3_600_000, 9 * 3_600_000, timeOf, dayStart, weekdayOf)).toBe('Works until 9:00 tomorrow');
  });

  it('names the weekday further out', () => {
    expect(expiryLabel(3 * DAY + 9 * 3_600_000, 9 * 3_600_000, timeOf, dayStart, weekdayOf)).toBe('Works until Thu 9:00');
  });
});
