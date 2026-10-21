import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The route tests do not render the root layout (it builds the native providers), so this checks the wiring:
// without DeviceSafeArea around the screens, the ui never learns the status bar and gesture bar sizes.
describe('root layout safe area', () => {
  it('wraps the screens in DeviceSafeArea', () => {
    const layout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');
    expect(layout).toMatch(/<DeviceSafeArea>\s*<Slot \/>\s*<\/DeviceSafeArea>/);
  });
});
