// Derives the Firebase config files a development build needs to talk to the local emulators (TASK-62).
// The native SDKs take their project id from google-services.json / GoogleService-Info.plist, and the
// Firestore emulator keeps each project's data apart. A dev build carrying the real project id
// (io-bruk-grocs-dev) writes to an empty namespace while the seed and the Functions emulator use
// demo-grocs, so every kitchen read and write fails the rules with "Null value error" (the same
// mismatch src/dev/index.ts works around for Functions, DRAFT-21). These copies swap the project id
// for the emulators' demo project, which can never reach a real backend (R52).
// Run as `node tools/emulator-config.ts <google-services.json> <GoogleService-Info.plist> <out-dir>`.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO_PROJECT } from '../firebase/seed/data.ts';

interface GoogleServices {
  readonly project_info: { readonly project_id: string; readonly storage_bucket?: string; readonly [key: string]: unknown };
  readonly [key: string]: unknown;
}

/** The Android config with its project id (and bucket) moved to `project`; everything else is unchanged. */
export function forProject(config: GoogleServices, project: string): GoogleServices {
  const info = config.project_info;
  return {
    ...config,
    project_info: { ...info, project_id: project, ...(info.storage_bucket ? { storage_bucket: `${project}.appspot.com` } : {}) },
  };
}

function main(args: readonly string[]): number {
  const [json, plist, out] = args;
  if (!json || !plist || !out) {
    console.error('usage: node tools/emulator-config.ts <google-services.json> <GoogleService-Info.plist> <out-dir>');
    return 2;
  }
  mkdirSync(out, { recursive: true });
  const android = forProject(JSON.parse(readFileSync(json, 'utf8')) as GoogleServices, DEMO_PROJECT);
  writeFileSync(join(out, 'google-services.json'), `${JSON.stringify(android, null, 2)}\n`);
  const ios = join(out, 'GoogleService-Info.plist');
  copyFileSync(plist, ios);
  execFileSync('plutil', ['-replace', 'PROJECT_ID', '-string', DEMO_PROJECT, ios]);
  execFileSync('plutil', ['-replace', 'STORAGE_BUCKET', '-string', `${DEMO_PROJECT}.appspot.com`, ios]);
  console.log(`emulator config for ${DEMO_PROJECT} written to ${out}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
