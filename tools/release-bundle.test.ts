import { describe, expect, it } from 'vitest';
import { DEV_ONLY_MARKERS, findLeaks, formatLeak } from './release-bundle.ts';

describe('release bundle leak detection', () => {
  it('finds every dev-only marker present', () => {
    const bundle = `...x grocs-dev-tools-marker y... signInWithTestAccount(...)`;
    expect(findLeaks(bundle)).toEqual(['grocs-dev-tools-marker', 'signInWithTestAccount']);
  });

  it('passes a bundle with no marker', () => {
    expect(findLeaks('function add(a,b){return a+b}')).toEqual([]);
  });

  it('names the rule and the reason when it fails', () => {
    const message = formatLeak('android', ['signInWithTestAccount']);
    expect(message).toContain('release-bundle/dev-code-in-release');
    expect(message).toContain('R53');
    expect(message).toMatch(/Why: .*second way into the app/);
    expect(message).toMatch(/Fix: .*__DEV__/);
  });

  it('keeps the markers it promises to look for', () => {
    expect(DEV_ONLY_MARKERS).toContain('signInWithTestAccount');
  });
});
