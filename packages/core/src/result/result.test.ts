import { describe, expect, it } from 'vitest';
import { err, ok } from './result.ts';

describe('result', () => {
  it('ok carries a value', () => {
    expect(ok(3)).toEqual({ ok: true, value: 3 });
  });
  it('err carries a reason', () => {
    expect(err('nope')).toEqual({ ok: false, error: 'nope' });
  });
});
