import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { acquire } from './emulator-run-lock.ts';

/** A port free right now, so these tests never touch the real lock a running emulator suite may hold. */
const freePort = (): Promise<number> =>
  new Promise((resolve) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 0));
    });
  });

describe('the emulator test run lock (TASK-85, TASK-86)', () => {
  const dirs: string[] = [];
  const children: ChildProcess[] = [];
  afterEach(() => {
    for (const child of children.splice(0)) child.kill('SIGKILL');
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  /** A separate process that takes the lock, prints whether it got it, and holds on until it is killed. */
  function contender(port: number): { child: ChildProcess; answer: Promise<string> } {
    const dir = mkdtempSync(join(tmpdir(), 'grocs-lock-'));
    dirs.push(dir);
    const script = join(dir, 'contender.ts');
    writeFileSync(
      script,
      `import { acquire } from ${JSON.stringify(join(process.cwd(), 'tools/emulator-run-lock.ts'))};
       const lock = await acquire(${port});
       console.log(lock.ok);
       setInterval(() => undefined, 1000);`,
    );
    const child = spawn('node', [script]);
    children.push(child);
    const answer = new Promise<string>((resolve) => {
      child.stdout?.once('data', (data: Buffer) => resolve(String(data).trim()));
    });
    return { child, answer };
  }

  it('lets a run take a free lock', async () => {
    const lock = await acquire(await freePort());
    expect(lock.ok).toBe(true);
    if (lock.ok) await lock.release();
  });

  it('refuses a second run while the first holds it, saying why and how to see the holder', async () => {
    const port = await freePort();
    const first = await acquire(port);
    const second = await acquire(port);
    expect(second.ok).toBe(false);
    expect(second).toMatchObject({ reason: expect.stringContaining('wipes the whole demo project') });
    expect(second).toMatchObject({ reason: expect.stringContaining(`lsof -nP -iTCP:${port}`) });
    if (first.ok) await first.release();
  });

  it('frees the lock on release, so the next run can start', async () => {
    const port = await freePort();
    const first = await acquire(port);
    if (first.ok) await first.release();
    const next = await acquire(port);
    expect(next.ok).toBe(true);
    if (next.ok) await next.release();
  });

  it('is free again as soon as a holder crashes, with nothing to clear', async () => {
    const port = await freePort();
    const { child, answer } = contender(port);
    expect(await answer).toBe('true');
    const gone = new Promise((resolve) => child.once('close', resolve));
    child.kill('SIGKILL');
    await gone;
    const next = await acquire(port);
    expect(next.ok).toBe(true);
    if (next.ok) await next.release();
  }, 20_000);

  it('admits exactly one of many processes starting together', async () => {
    const port = await freePort();
    const answers = await Promise.all(Array.from({ length: 8 }, () => contender(port).answer));
    expect(answers.filter((a) => a === 'true')).toHaveLength(1);
    expect(answers.filter((a) => a === 'false')).toHaveLength(7);
  }, 30_000);
});
