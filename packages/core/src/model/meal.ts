import type { Stamp, Stamped } from '../merge/lww.ts';
import { stamped } from '../merge/lww.ts';
import { err, ok } from '../result/result.ts';
import type { Result } from '../result/result.ts';

/** 0 for Monday through 6 for Sunday, matching weekIdFor's ISO week. */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Narrows a plain number to a DayIndex, or null outside 0-6. */
export function toDayIndex(n: number): DayIndex | null {
  return Number.isInteger(n) && n >= 0 && n <= 6 ? (n as DayIndex) : null;
}

/**
 * One meal planned for a week. A meal is plain same-kitchen CRUD (R5 to R8): a day in the week, a
 * name and an optional link, nothing else. weekId and dayIndex are stamped so a move between weeks
 * is itself an ordinary field write (R18), merged the same way as a rename. weekId is a
 * caller-guaranteed non-empty precondition, not separately validated at construction, matching
 * createExtraItem's identical precondition on item.weekId.
 */
export interface Meal {
  readonly id: string;
  readonly addedBy: string;
  readonly createdAt: number;
  readonly weekId: Stamped<string>;
  readonly dayIndex: Stamped<DayIndex>;
  readonly name: Stamped<string>;
  readonly link: Stamped<string | null>;
  /** Set when the meal is removed. Once set it stays (R20). */
  readonly deleted: Stamp | null;
}

export interface NewMealInput {
  readonly id: string;
  readonly weekId: string;
  readonly dayIndex: DayIndex;
  readonly name: string;
  readonly link?: string | null;
}

export type MealNameError = 'empty-name';
export type MealLinkError = 'invalid-link';

const cleanName = (name: string): string => name.trim().replace(/\s+/g, ' ');
const cleanLink = (link: string | null | undefined): string | null => (link?.trim() ? link.trim() : null);

/** A link must be an http or https URL (R6). */
function isValidLink(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Plan a new meal, stamped with who added it and when. */
export function createMeal(input: NewMealInput, stamp: Stamp): Result<Meal, MealNameError | MealLinkError> {
  const name = cleanName(input.name);
  if (name === '') return err('empty-name');
  const link = cleanLink(input.link);
  if (link !== null && !isValidLink(link)) return err('invalid-link');
  return ok({
    id: input.id,
    addedBy: stamp.by,
    createdAt: stamp.at,
    weekId: stamped(input.weekId, stamp),
    dayIndex: stamped(input.dayIndex, stamp),
    name: stamped(name, stamp),
    link: stamped(link, stamp),
    deleted: null,
  });
}

/** Rename a meal. Only the name is restamped (R18); everything else is unchanged. */
export function renameMeal(meal: Meal, name: string, stamp: Stamp): Result<Meal, MealNameError> {
  const cleaned = cleanName(name);
  if (cleaned === '') return err('empty-name');
  return ok({ ...meal, name: stamped(cleaned, stamp) });
}

/** Change a meal's link. Only the link is restamped (R18); everything else is unchanged. */
export function relinkMeal(meal: Meal, link: string | null, stamp: Stamp): Result<Meal, MealLinkError> {
  const cleaned = cleanLink(link);
  if (cleaned !== null && !isValidLink(cleaned)) return err('invalid-link');
  return ok({ ...meal, link: stamped(cleaned, stamp) });
}

/** Move a meal to another week and day. weekId and dayIndex are restamped together as one move (R18); everything else is unchanged. */
export function moveMeal(meal: Meal, weekId: string, dayIndex: DayIndex, stamp: Stamp): Meal {
  return { ...meal, weekId: stamped(weekId, stamp), dayIndex: stamped(dayIndex, stamp) };
}

/** Remove a meal. The delete is permanent (R20): removing a meal never deletes grocery items. */
export function removeMeal(meal: Meal, stamp: Stamp): Meal {
  return { ...meal, deleted: stamp };
}
