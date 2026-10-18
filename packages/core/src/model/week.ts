const DAY_MS = 86_400_000;

/** Days since 1970-01-01 of a civil date (proleptic Gregorian). Integer arithmetic only. */
function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146_097 + doe - 719_468;
}

/** The civil year that a day count since 1970-01-01 falls in. */
function yearOfDays(days: number): number {
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  return yoe + era * 400 + (mp >= 10 ? 1 : 0);
}

/**
 * The id of the Monday-to-Sunday week (ISO 8601) that contains an instant, such as "2026-W42".
 * Pure integer arithmetic on the instant it is given; it never reads the clock. The skeleton counts
 * weeks in UTC; counting them in the kitchen's time zone (R5) comes with the kitchen settings.
 */
export function weekIdFor(at: number): string {
  const days = Math.floor(at / DAY_MS);
  const weekday = (((days + 3) % 7) + 7) % 7; // Monday = 0; 1970-01-01 was a Thursday
  const thursday = days - weekday + 3;
  const year = yearOfDays(thursday);
  const week = Math.floor((thursday - daysFromCivil(year, 1, 1)) / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}
