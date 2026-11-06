import { describe, expect, it } from 'vitest';
import { forProject } from './emulator-config.ts';

describe('forProject', () => {
  const real = {
    project_info: { project_number: '950648718006', project_id: 'io-bruk-grocs-dev', storage_bucket: 'io-bruk-grocs-dev.firebasestorage.app' },
    client: [{ client_info: { mobilesdk_app_id: '1:950648718006:android:abc' } }],
  };

  it('moves the project id to the emulators demo project, so the native SDK reads and writes its data', () => {
    expect(forProject(real, 'demo-grocs').project_info.project_id).toBe('demo-grocs');
  });

  it('keeps the app registration and project number, which the SDK still needs to start', () => {
    const moved = forProject(real, 'demo-grocs');
    expect(moved['client']).toEqual(real.client);
    expect(moved.project_info['project_number']).toBe('950648718006');
  });

  it('points the bucket at the demo project too, so nothing in the config names the real one', () => {
    expect(JSON.stringify(forProject(real, 'demo-grocs'))).not.toContain('io-bruk-grocs-dev');
  });
});
