import { describe, expect, it } from 'vitest';
import config, { assertSignInConfigured } from '../app.config.ts';

// TASK-53: build 8 was bundled on EAS without the web client ID and crashed on Continue with Google.
describe('assertSignInConfigured', () => {
  const clientId = '1-abc.apps.googleusercontent.com';

  it('stops an EAS build of the real variant that has no web client ID', () => {
    expect(() => assertSignInConfigured({ EAS_BUILD: 'true' })).toThrow(/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set/);
  });

  it('lets an EAS build of the real variant through once the web client ID is set', () => {
    expect(() => assertSignInConfigured({ EAS_BUILD: 'true', EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: clientId })).not.toThrow();
  });

  it('lets the demo variant through, since it has no Google sign-in', () => {
    expect(() => assertSignInConfigured({ EAS_BUILD: 'true', APP_VARIANT: 'demo' })).not.toThrow();
  });

  it('lets a local config evaluation through, where eas-cli and expo read the config without bundling', () => {
    expect(() => assertSignInConfigured({})).not.toThrow();
  });
});

// Edge to edge is on by default (Expo SDK 58 removed the setting; React Native 0.88 enables it for SDK 35+ targets),
// and the layouts rely on that. See the comment in app.config.ts.
describe('app config', () => {
  it('sets no edgeToEdgeEnabled (Expo SDK 58 has no such option and warns when it is present)', () => {
    expect(config().android).not.toHaveProperty('edgeToEdgeEnabled');
  });
});
