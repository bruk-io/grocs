import { describe, expect, it } from 'vitest';
import { loggerContract } from './contract.ts';
import { MemoryLogger } from './fake.ts';

loggerContract({ describe, it, expect }, () => {
  const logger = new MemoryLogger();
  return { logger, output: () => logger.records().map((r) => JSON.stringify(r, (_k, v: unknown) => (typeof v === 'bigint' ? String(v) : v))) };
});
