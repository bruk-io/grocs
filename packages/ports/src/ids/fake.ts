import type { IdGenerator } from './port.ts';

/** Predictable ids: id-1, id-2, ... */
export class SequentialIds implements IdGenerator {
  #next = 1;
  readonly #prefix: string;

  constructor(prefix = 'id') {
    this.#prefix = prefix;
  }

  newId(): string {
    return `${this.#prefix}-${this.#next++}`;
  }
}
