import { loggerContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { BufferLogger } from './buffer-logger.ts';

loggerContract({ describe, it, expect }, () => {
  const logger = new BufferLogger();
  return { logger, output: () => logger.dump().split('\n').filter(Boolean) };
});

describe('BufferLogger (R35)', () => {
  it('keeps only the most recent records', () => {
    const logger = new BufferLogger(3);
    for (let i = 1; i <= 5; i++) logger.log({ timestamp: i, severity: 'info', message: `m${i}`, attributes: {} });
    expect(logger.records().map((r) => r.message)).toEqual(['m3', 'm4', 'm5']);
  });
});
