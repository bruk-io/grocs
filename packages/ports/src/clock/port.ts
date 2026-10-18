/** The time, as milliseconds since the Unix epoch. Domain functions never read the clock; commands do, through this port. */
export interface Clock {
  now(): number;
}
