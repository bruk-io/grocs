import { describe, expect, it } from 'vitest';
import { errorForStatus } from './status.ts';

describe('errorForStatus', () => {
  const table: readonly [name: string, status: number, error: 'not-found' | 'blocked' | 'unreachable' | null][] = [
    ['200 is success', 200, null],
    ['204 (no content) is success', 204, null],
    ['299 is still 2xx success', 299, null],
    ['404 is not-found', 404, 'not-found'],
    ['410 is not-found', 410, 'not-found'],
    ['401 is blocked', 401, 'blocked'],
    ['403 is blocked', 403, 'blocked'],
    ['429 is blocked', 429, 'blocked'],
    ['301 (redirect, not followed here) is unreachable', 301, 'unreachable'],
    ['400 is unreachable', 400, 'unreachable'],
    ['500 is unreachable', 500, 'unreachable'],
    ['503 is unreachable', 503, 'unreachable'],
    ['199 (not 2xx) is unreachable', 199, 'unreachable'],
  ];

  it.each(table)('%s', (_name, status, error) => {
    expect(errorForStatus(status)).toBe(error);
  });
});
