import type { LogRecord, Logger } from '@grocs/ports';
import { safeRecord } from '@grocs/ports';

/**
 * Release builds keep the most recent records in a bounded buffer on the phone, which a member can
 * copy from a diagnostics action (R35). Older records fall off the front.
 */
export class BufferLogger implements Logger {
  readonly #records: LogRecord[] = [];

  constructor(private readonly capacity = 500) {}

  log(record: LogRecord): void {
    this.#records.push(safeRecord(record));
    if (this.#records.length > this.capacity) this.#records.splice(0, this.#records.length - this.capacity);
  }

  records(): readonly LogRecord[] {
    return [...this.#records];
  }

  /** The buffer as text, one JSON record per line, for the diagnostics copy action. */
  dump(): string {
    return this.#records.map((r) => JSON.stringify(r, (_k, v: unknown) => (typeof v === 'bigint' ? `${v}n` : v))).join('\n');
  }
}
