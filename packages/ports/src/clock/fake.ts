import type { Clock } from './port.ts';

/** A clock that only moves when told to. */
export class FakeClock implements Clock {
  #now: number;

  constructor(start = Date.UTC(2026, 9, 19, 12, 0, 0)) {
    this.#now = start;
  }

  now(): number {
    return this.#now;
  }

  advance(ms: number): void {
    this.#now += ms;
  }

  set(at: number): void {
    this.#now = at;
  }
}
