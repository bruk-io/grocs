import type { TestApi } from '../testing.ts';
import type { LogRecord, Logger } from './port.ts';

export interface LoggerSubject {
  readonly logger: Logger;
  /** Everything the provider has written so far, as text (one entry per record). */
  output(): readonly string[];
}

const record = (over: Partial<LogRecord> = {}): LogRecord => ({
  timestamp: 1_790_000_000_000,
  severity: 'info',
  message: 'command finished',
  attributes: {},
  ...over,
});

/** Every Logger provider passes this suite (R29, R34, R36). */
export function loggerContract(t: TestApi, make: () => LoggerSubject): void {
  t.describe('Logger contract', () => {
    t.it('writes the message, severity and correlation id of a record', () => {
      const { logger, output } = make();
      logger.log(record({ severity: 'warn', message: 'slow call', correlationId: 'corr-42' }));
      const text = output().join('\n');
      t.expect(text).toContain('slow call');
      t.expect(text).toContain('warn');
      t.expect(text).toContain('corr-42');
    });

    t.it('writes structured attributes', () => {
      const { logger, output } = make();
      logger.log(record({ attributes: { port: 'syncStore', method: 'mergeItem', durationMs: 7 } }));
      const text = output().join('\n');
      t.expect(text).toContain('syncStore');
      t.expect(text).toContain('mergeItem');
    });

    t.it('writes one entry per record, in order', () => {
      const { logger, output } = make();
      logger.log(record({ message: 'first' }));
      logger.log(record({ message: 'second' }));
      const lines = output();
      t.expect(lines.length).toBe(2);
      t.expect(lines[0] ?? '').toContain('first');
      t.expect(lines[1] ?? '').toContain('second');
    });

    t.it('never writes a personal field: item names and amounts are removed (R36)', () => {
      const { logger, output } = make();
      const item = { id: 'i1', weekId: '2026-W42', addedBy: 'alex', name: { value: 'Oat milk', stamp: { at: 1, by: 'alex' } }, amount: { v: '2 cartons', at: 1, by: 'alex' } };
      logger.log(record({ attributes: { item, itemName: 'Oat milk', nested: [{ mealLink: 'https://recipes.example/oat-milk' }] } }));
      const text = output().join('\n');
      t.expect(text).not.toContain('Oat milk');
      t.expect(text).not.toContain('2 cartons');
      t.expect(text).not.toContain('recipes.example');
      t.expect(text).toContain('i1');
    });

    t.it('does not throw on attributes it cannot serialise', () => {
      const { logger } = make();
      const loop: Record<string, unknown> = { a: 1 };
      loop['self'] = loop;
      logger.log(record({ attributes: { loop, big: 10n } }));
    });
  });
}
