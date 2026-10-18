import type { LogRecord, Logger } from './port.ts';
import { safeRecord } from './port.ts';

/** Keeps the records it is given, redacted, so tests can read them back. */
export class MemoryLogger implements Logger {
  readonly #records: LogRecord[] = [];

  log(record: LogRecord): void {
    this.#records.push(safeRecord(record));
  }

  records(): readonly LogRecord[] {
    return [...this.#records];
  }
}
