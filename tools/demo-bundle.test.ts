import { describe, expect, it } from 'vitest';
import { DEMO_PATH, FIREBASE_PATH, firebaseModules, judgeDemoBundle } from './demo-bundle.ts';

const DEMO = ['/apps/mobile/src/demo/compose-demo.ts', '/packages/providers-memory/src/index.ts', '/packages/core/src/model/item.ts'];

describe('demo bundle Firebase detection', () => {
  it('finds every kind of Firebase module, by path, and leaves the demo and shared code alone', () => {
    const sources = [
      ...DEMO,
      '/node_modules/@react-native-firebase/app/lib/index.js',
      '/node_modules/@react-native-firebase/auth/lib/index.js',
      '/node_modules/@firebase/firestore/dist/index.js',
      '/node_modules/firebase/app/dist/index.js',
      '/packages/providers-firebase/src/firestore-sync-store.ts',
      '/apps/mobile/src/composition/native.ts',
      '/apps/mobile/src/composition/compose-firebase.ts',
    ];
    expect(firebaseModules(sources)).toHaveLength(7);
    expect(firebaseModules(DEMO)).toEqual([]);
  });

  it('does not take a package with firebase only in its name for the SDK', () => {
    expect(firebaseModules(['/node_modules/not-firebase-at-all/index.js', '/node_modules/firebase-tools-shim/index.js'])).toEqual([]);
  });

  it('reads a path with a relative prefix or without a leading slash', () => {
    expect(firebaseModules(['../../node_modules/@react-native-firebase/app/lib/index.js', 'node_modules/firebase/app/index.js'])).toHaveLength(2);
  });

  it('declares patterns for the demo and for Firebase, so neither list is empty by accident', () => {
    expect(DEMO_PATH.length).toBeGreaterThanOrEqual(2);
    expect(FIREBASE_PATH.length).toBeGreaterThanOrEqual(5);
  });
});

describe('judging a demo bundle', () => {
  it('passes a bundle that is the demo and holds no Firebase', () => {
    expect(judgeDemoBundle('android', DEMO)).toEqual([]);
  });

  it('fails a bundle that carries Firebase, naming the module', () => {
    const out = judgeDemoBundle('android', [...DEMO, '/node_modules/@react-native-firebase/app/lib/index.js']).join('\n');
    expect(out).toContain('demo-bundle/firebase-in-demo');
    expect(out).toContain('@react-native-firebase/app/lib/index.js');
  });

  it('fails blind on an empty sourcemap, so a changed sourcemap shape cannot pass silently', () => {
    expect(judgeDemoBundle('ios', []).join('\n')).toContain('demo-bundle/blind');
  });

  it('fails a bundle that is not the demo, which is clean of Firebase only by being something else', () => {
    expect(judgeDemoBundle('android', ['/packages/core/src/model/item.ts']).join('\n')).toContain('demo-bundle/not-the-demo');
  });
});
