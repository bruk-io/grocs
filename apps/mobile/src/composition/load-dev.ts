import type { DevTools } from '../dev/index.ts';

/**
 * The development tools (test sign-in, emulator connection, the on-device Storybook), or null in a
 * release build. `__DEV__` is replaced by the bundler, so the `require` below is removed from
 * release bundles along with everything only it reaches (R53, R64).
 */
export function loadDevTools(): DevTools | null {
  if (__DEV__) {
    return (require('../dev/index.ts') as typeof import('../dev/index.ts')).devTools;
  }
  return null;
}
