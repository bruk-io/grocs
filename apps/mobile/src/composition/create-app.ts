import type { NativeApp } from './native.ts';

/**
 * The composed app for this build. The demo variant (EXPO_PUBLIC_APP_VARIANT=demo) runs on the
 * in-memory provider; every other build runs on native Firebase. The bundler replaces the variable
 * with a constant and removes the branch not taken, with everything only it reaches, so a real
 * bundle holds neither src/demo nor the in-memory provider and the demo bundle holds no Firebase
 * (decision-12; the check `release-bundle` proves the first).
 */
export function createApp(): NativeApp {
  if (process.env['EXPO_PUBLIC_APP_VARIANT'] === 'demo') {
    return (require('../demo/index.ts') as typeof import('../demo/index.ts')).createDemoApp();
  } else {
    return (require('./native.ts') as typeof import('./native.ts')).createNativeApp();
  }
}
