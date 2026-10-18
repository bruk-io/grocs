import { loggerContract } from '@grocs/ports';
import { describe, expect, it } from 'vitest';
import { ConsoleLogger } from './console-logger.ts';

loggerContract({ describe, it, expect }, () => {
  const lines: string[] = [];
  const push = (line: string): void => void lines.push(line);
  return { logger: new ConsoleLogger({ debug: push, info: push, warn: push, error: push }), output: () => lines };
});

describe('ConsoleLogger', () => {
  it('sends each severity to the matching console method', () => {
    const seen: string[] = [];
    const sink = { debug: () => seen.push('debug'), info: () => seen.push('info'), warn: () => seen.push('warn'), error: () => seen.push('error') };
    const logger = new ConsoleLogger(sink);
    for (const severity of ['debug', 'info', 'warn', 'error'] as const) {
      logger.log({ timestamp: 1, severity, message: 'm', attributes: {} });
    }
    expect(seen).toEqual(['debug', 'info', 'warn', 'error']);
  });
});
