// When an invite stops working, as the household screen says it (TASK-56). No React Native import, so its
// test runs in the plain Node project.
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * "Works until 3:40 PM today" / "tomorrow" / "Thu 3:40 PM": when an invite stops working, in the phone's
 * own clock format (TASK-56). `timeOf` formats the time of day; it is passed in so tests do not depend
 * on the machine's locale or time zone.
 */
export function expiryLabel(expiresAt: number, now: number, timeOf: (at: number) => string, dayStart: (at: number) => number, weekdayOf: (at: number) => string): string {
  const days = Math.round((dayStart(expiresAt) - dayStart(now)) / DAY_MS);
  const time = timeOf(expiresAt);
  if (days <= 0) return `Works until ${time} today`;
  if (days === 1) return `Works until ${time} tomorrow`;
  return `Works until ${weekdayOf(expiresAt)} ${time}`;
}

/** expiryLabel in the phone's locale and time zone. */
export function localExpiryLabel(expiresAt: number, now: number): string {
  return expiryLabel(
    expiresAt,
    now,
    (at) => new Date(at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    (at) => {
      const d = new Date(at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    },
    (at) => new Date(at).toLocaleDateString(undefined, { weekday: 'short' }),
  );
}
