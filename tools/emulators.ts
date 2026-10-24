// `pnpm emulators`: start the Firestore, Auth and Functions emulators on the demo project, seed
// them, and stay up until interrupted. Needs Java, not Docker (R52).
import { spawn } from 'node:child_process';
import { seed } from '../firebase/seed/seed.ts';

const PROJECT = 'demo-grocs';
const child = spawn('pnpm', ['exec', 'firebase', 'emulators:start', '--only', 'firestore,auth,functions', '--project', PROJECT], {
  stdio: ['inherit', 'inherit', 'inherit'],
});
const stop = (): void => {
  child.kill('SIGINT');
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', (code) => process.exit(code ?? 0));

async function waitFor(url: string, tries = 120): Promise<void> {
  for (let i = 0; i < tries; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`${url} did not come up`);
}

await waitFor('http://127.0.0.1:8080');
await waitFor('http://127.0.0.1:9099');
await waitFor('http://127.0.0.1:5001');
await seed({ ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' });
console.log('\nEmulators are up and seeded. Sign in with alex@grocs.test or sam@grocs.test (password: local-only-password). Ctrl-C to stop.');
