import { describe, expect, it } from 'vitest';
import { clockContract } from './contract.ts';
import { FakeClock } from './fake.ts';

clockContract({ describe, it, expect }, () => {
  const clock = new FakeClock();
  return { clock, passTime: async (ms) => clock.advance(ms) };
});
