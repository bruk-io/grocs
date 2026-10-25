// Monday-based day math shared by Plan, AddMeal, Groceries and QuickAdd (R5-R8), so the week a
// meal lands on and the week the plan shows always agree. weekIdFor (core) only names the week;
// everything here turns an instant or a day into the Monday-to-Sunday calendar around it.
import { toDayIndex, weekIdFor } from '@grocs/core';
import type { DayIndex } from '@grocs/core';
import type { MealTone } from '@grocs/ui';

// @grocs/ui exports the MealTone type but not its MEAL_TONES array, so the palette is named here too;
// a typo is still caught, since each entry is checked against MealTone.
const MEAL_TONES: readonly MealTone[] = ['amber', 'sky', 'tomato', 'leaf', 'neutral'];

const DAY_MS = 86_400_000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface WeekDay {
  /** Stable, the date in "2026-10-19" form. */
  dayId: string;
  weekday: string;
  day: number;
  dayIndex: DayIndex;
}

/** The days since 1970-01-01 of the Monday that starts the week holding `at`. */
function mondayDays(at: number): number {
  const days = Math.floor(at / DAY_MS);
  return days - ((((days + 3) % 7) + 7) % 7);
}

function dayIdFor(days: number): string {
  const date = new Date(days * DAY_MS);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

/** The Monday-to-Sunday week holding `at`: its week id and its seven days, Monday first. */
export function weekDays(at: number): { weekId: string; days: readonly WeekDay[] } {
  const monday = mondayDays(at);
  const date = new Date(monday * DAY_MS);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, dayIndex) => {
    const days_ = monday + dayIndex;
    const d = new Date(days_ * DAY_MS);
    return { dayId: dayIdFor(days_), weekday: WEEKDAYS[dayIndex] ?? '', day: d.getUTCDate(), dayIndex: toDayIndex(dayIndex) ?? 0 };
  });
  return { weekId: weekIdFor(date.getTime()), days };
}

/** The dayId (from weekDays) that holds `at` itself, for "plan a meal" entry points with no day of their own. */
export function todayId(at: number): string {
  const days = Math.floor(at / DAY_MS);
  return dayIdFor(days);
}

/** The week id and day index a dayId (from weekDays) belongs to, or null for a dayId that is not a real date. */
export function dayFor(dayId: string): { weekId: string; dayIndex: DayIndex } | null {
  const at = Date.parse(`${dayId}T00:00:00Z`);
  if (Number.isNaN(at)) return null;
  const days = Math.floor(at / DAY_MS);
  const dayIndex = toDayIndex((((days + 3) % 7) + 7) % 7);
  if (dayIndex === null) return null;
  return { weekId: weekIdFor(at), dayIndex };
}

/** "Thursday, Oct 22": the full weekday name and month-day for a dayId. */
export function dayLabelFor(dayId: string): string {
  const at = Date.parse(`${dayId}T00:00:00Z`);
  const date = new Date(at);
  const long = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = Math.floor(at / DAY_MS);
  const weekday = (((days + 3) % 7) + 7) % 7;
  return `${long[weekday]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/** "Week of Oct 19": the Monday of the week holding `at`, as the header reads it. */
export function weekLabelFor(at: number): string {
  const monday = new Date(mondayDays(at) * DAY_MS);
  return `Week of ${MONTHS[monday.getUTCMonth()]} ${monday.getUTCDate()}`;
}

/** The colour a meal wears, from its id so removing one meal never recolours another (meal-tone.ts: "never from status"). */
export function mealTone(mealId: string): MealTone {
  let hash = 0;
  for (let i = 0; i < mealId.length; i++) hash = (hash * 31 + mealId.charCodeAt(i)) | 0;
  return MEAL_TONES[Math.abs(hash) % MEAL_TONES.length] ?? 'neutral';
}
