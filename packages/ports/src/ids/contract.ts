import type { TestApi } from '../testing.ts';
import type { IdGenerator } from './port.ts';

/** Every IdGenerator provider passes this suite (R29). */
export function idsContract(t: TestApi, make: () => IdGenerator): void {
  t.describe('IdGenerator contract', () => {
    t.it('makes a non-empty id that is safe in a document path and a URL', () => {
      const id = make().newId();
      t.expect(id).toMatch(/^[A-Za-z0-9_-]{1,64}$/);
    });

    t.it('never repeats', () => {
      const ids = make();
      const seen = new Set<string>();
      for (let i = 0; i < 2000; i++) seen.add(ids.newId());
      t.expect(seen.size).toBe(2000);
    });
  });
}
