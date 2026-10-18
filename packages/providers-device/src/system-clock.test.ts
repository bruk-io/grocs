import { clockContract } from '@grocs/ports/testing';
import { describe, expect, it } from 'vitest';
import { SystemClock } from './system-clock.ts';

clockContract({ describe, it, expect }, () => ({
  clock: new SystemClock(),
  passTime: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}));
