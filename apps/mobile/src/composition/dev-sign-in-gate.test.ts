import { describe, expect, it, vi } from 'vitest';
import { devSignInFor } from './dev-sign-in-gate.ts';

const devTools = { name: 'dev tools' };
const emulatorFns = { httpsCallable: () => undefined };

describe('devSignInFor', () => {
  it('offers nothing in a release build, which has no dev tools', () => {
    expect(devSignInFor(null, emulatorFns, vi.fn())).toBeNull();
  });

  it('offers nothing in a dev build pointed at live Firebase', () => {
    expect(devSignInFor(devTools, undefined, vi.fn())).toBeNull();
  });

  it('signs in as the named seed account in a dev build on the emulators', async () => {
    const signIn = vi.fn(async () => undefined);
    const offered = devSignInFor(devTools, emulatorFns, signIn);
    await offered?.('alex');
    expect(signIn).toHaveBeenCalledExactlyOnceWith(devTools, 'alex');
  });
});
