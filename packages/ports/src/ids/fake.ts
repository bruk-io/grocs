import type { IdGenerator } from './port.ts';

/** Predictable ids: id-1, id-2, ... */
export class SequentialIds implements IdGenerator {
  #next = 1;

  constructor(private readonly prefix = 'id') {}

  newId(): string {
    return `${this.prefix}-${this.#next++}`;
  }
}
