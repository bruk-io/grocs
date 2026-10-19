import type { LogRecord, Logger } from '@grocs/ports';
import { safeRecord } from '@grocs/ports';

export interface ConsoleSink {
  debug(line: string): void;
  info(line: string): void;
  warn(line: string): void;
  error(line: string): void;
}

/**
 * Development builds log here (R35). This file is the only place that writes to the console
 * directly (R37); everything else logs through the Logger port.
 */
export class ConsoleLogger implements Logger {
  readonly #sink: ConsoleSink;

  constructor(sink: ConsoleSink = console) {
    this.#sink = sink;
  }

  log(record: LogRecord): void {
    this.#sink[record.severity](serialise(safeRecord(record)));
  }
}

function serialise(record: LogRecord): string {
  try {
    return JSON.stringify(record, (_k, v: unknown) => (typeof v === 'bigint' ? `${v}n` : v));
  } catch {
    return JSON.stringify({ timestamp: record.timestamp, severity: record.severity, message: record.message, attributes: '[unserialisable]' });
  }
}
