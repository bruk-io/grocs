import type { Clock } from '@grocs/ports';

/** The phone's clock. */
export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
