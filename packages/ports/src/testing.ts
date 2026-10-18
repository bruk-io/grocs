// What a contract suite needs from a test runner. The runner (vitest) is passed in by the
// *.test.ts file that runs the suite, so this package imports no test framework.

export interface Matchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toBeNull(): void;
  toBeGreaterThan(n: number): void;
  toBeLessThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toContain(item: unknown): void;
  toMatch(re: RegExp): void;
  not: {
    toBe(expected: unknown): void;
    toContain(item: unknown): void;
  };
}

export interface TestApi {
  describe(name: string, fn: () => void): void;
  it(name: string, fn: () => unknown): void;
  expect(actual: unknown): Matchers;
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry `check` until it stops throwing or `timeoutMs` passes; rethrows the last failure. */
export async function eventually(check: () => void | Promise<void>, timeoutMs = 3000, stepMs = 25): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      await check();
      return;
    } catch (e) {
      if (Date.now() >= deadline) throw e;
      await sleep(stepMs);
    }
  }
}

/** Resolve to the error a promise rejects with, or null if it resolves. */
export async function rejection(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
    return null;
  } catch (e) {
    return e ?? new Error('rejected with nothing');
  }
}
