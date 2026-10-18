// Field-level last-write-wins (R18). Every stored field carries the stamp of the change that
// last set it. Merging two copies keeps, per field, the one with the later stamp. The merge is
// commutative, associative and idempotent, so the result does not depend on the order or the
// number of times changes arrive (R46).

/** When a change happened and who made it. `by` breaks ties between changes at the same instant. */
export interface Stamp {
  readonly at: number;
  readonly by: string;
}

export interface Stamped<T> {
  readonly value: T;
  readonly stamp: Stamp;
}

export const stamped = <T>(value: T, stamp: Stamp): Stamped<T> => ({ value, stamp });

/** Negative when a is earlier than b, positive when later, 0 when identical. */
export function compareStamps(a: Stamp, b: Stamp): number {
  if (a.at !== b.at) return a.at < b.at ? -1 : 1;
  if (a.by !== b.by) return a.by < b.by ? -1 : 1;
  return 0;
}

/** The later of two stamps, or the only one present. */
export function laterStamp(a: Stamp | null, b: Stamp | null): Stamp | null {
  if (a === null) return b;
  if (b === null) return a;
  return compareStamps(a, b) >= 0 ? a : b;
}

/**
 * The later write wins. If two different values carry the same stamp (the same member, the same
 * millisecond), the one that sorts higher as JSON wins, so the answer never depends on argument order.
 */
export function mergeStamped<T>(a: Stamped<T>, b: Stamped<T>): Stamped<T> {
  const c = compareStamps(a.stamp, b.stamp);
  if (c > 0) return a;
  if (c < 0) return b;
  return JSON.stringify(a.value) >= JSON.stringify(b.value) ? a : b;
}
