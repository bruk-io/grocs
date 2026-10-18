import type { TestApi } from '../testing.ts';
import type { Clock } from './port.ts';

export interface ClockSubject {
  readonly clock: Clock;
  /** Let some time pass, if the provider can (a fake advances; a real clock just waits). */
  passTime(ms: number): Promise<void>;
}

/** Every Clock provider passes this suite (R29). */
export function clockContract(t: TestApi, make: () => ClockSubject): void {
  t.describe('Clock contract', () => {
    t.it('now() is a whole number of milliseconds since 1970, after 2020', () => {
      const { clock } = make();
      const now = clock.now();
      t.expect(Number.isInteger(now)).toBe(true);
      t.expect(now).toBeGreaterThan(Date.UTC(2020, 0, 1));
    });

    t.it('never goes backwards', async () => {
      const subject = make();
      const first = subject.clock.now();
      await subject.passTime(5);
      t.expect(subject.clock.now()).toBeGreaterThanOrEqual(first);
    });

    t.it('moves forward when time passes', async () => {
      const subject = make();
      const first = subject.clock.now();
      await subject.passTime(20);
      t.expect(subject.clock.now()).toBeGreaterThan(first);
    });
  });
}
