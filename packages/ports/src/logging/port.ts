import { redact } from '@grocs/core';

export type Severity = 'debug' | 'info' | 'warn' | 'error';

/** The one shape of a log record (R34). Fits the OpenTelemetry log data model: time, severity, body, attributes. */
export interface LogRecord {
  /** Milliseconds since the Unix epoch. */
  readonly timestamp: number;
  readonly severity: Severity;
  readonly message: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}

/** Where log records go. Only the application layer and the instrumentation wrapper call it. */
export interface Logger {
  log(record: LogRecord): void;
}

/**
 * The record with personal fields removed from its attributes (R36). Every Logger provider
 * calls this before it writes anything; the contract suite fails if one does not.
 */
export function safeRecord(record: LogRecord): LogRecord {
  return { ...record, attributes: redact(record.attributes) as Readonly<Record<string, unknown>> };
}
