import { describe, expect, it } from 'vitest';
import config from '../app.config.ts';

// Edge to edge is on by default (Expo SDK 58 removed the setting; React Native 0.88 enables it for SDK 35+ targets),
// and the layouts rely on that. See the comment in app.config.ts.
describe('app config', () => {
  it('sets no edgeToEdgeEnabled (Expo SDK 58 has no such option and warns when it is present)', () => {
    expect(config().android).not.toHaveProperty('edgeToEdgeEnabled');
  });
});
