import { describe, expect, it } from 'vitest';
import { deployManifest, externalDependencies } from './build-functions.ts';

const pkg = {
  name: '@grocs/functions',
  engines: { node: '24' },
  dependencies: { '@grocs/providers-server': 'workspace:*', 'firebase-admin': '^14.5.0', 'firebase-functions': '^7.4.0' },
};

describe('the deployed functions package (TASK-48)', () => {
  it('has no workspace: dependency, which npm install on Cloud Build cannot resolve', () => {
    expect(JSON.stringify(deployManifest(pkg))).not.toContain('workspace:');
  });

  it('keeps the npm dependencies at their versions, and the runtime', () => {
    expect(deployManifest(pkg)).toMatchObject({
      main: 'index.js',
      engines: { node: '24' },
      dependencies: { 'firebase-admin': '^14.5.0', 'firebase-functions': '^7.4.0' },
    });
  });

  it('bundles workspace packages and leaves npm packages external', () => {
    expect(externalDependencies(pkg)).toEqual(['firebase-admin', 'firebase-functions']);
  });
});
