// One emulator-project test run at a time on this machine (TASK-85). Vitest's globalSetup for the emulator
// project takes this lock. firestore.rules.test.ts wipes the whole demo project with clearFirestore, and
// fileParallelism: false only serialises files inside one vitest process, so a second run against the same
// emulators deletes the first run's documents: its tests fail with errors such as "not a member of this
// kitchen [403]" that look like product bugs.
//
// The lock is a listening port, not a file (TASK-86). The kernel lets one process listen on it and frees it when
// that process dies, so there is no stale lock, no reused process id and no takeover race to get wrong.
import { createServer } from 'node:net';

const HOST = '127.0.0.1';
const LOCK_PORT = 4498;

export type LockResult =
  | { readonly ok: true; readonly release: () => Promise<void> }
  | { readonly ok: false; readonly reason: string };

const refusal = (port: number): string =>
  `Another emulator test run is using the emulators (it holds port ${port}). Wait for it to finish. ` +
  `firestore.rules.test.ts wipes the whole demo project, so running both would delete each other's documents ` +
  `and fail with misleading errors such as "not a member of this kitchen [403]". ` +
  `To see what holds the port: lsof -nP -iTCP:${port} -sTCP:LISTEN`;

/** Takes the lock by listening on `port`. Rejects only on an error other than the port being held. */
export function acquire(port: number): Promise<LockResult> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') resolve({ ok: false, reason: refusal(port) });
      else reject(error);
    });
    server.listen({ host: HOST, port, exclusive: true }, () => {
      // The lock must not keep a finished run alive.
      server.unref();
      resolve({
        ok: true,
        release: () => new Promise((done) => server.close(() => done())),
      });
    });
  });
}

/** Vitest globalSetup: runs once per run, in the main process, and returns the teardown. */
export default async function setup(): Promise<() => Promise<void>> {
  const lock = await acquire(LOCK_PORT);
  if (!lock.ok) throw new Error(lock.reason);
  return lock.release;
}
