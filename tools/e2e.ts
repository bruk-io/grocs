// `pnpm e2e`: run the Maestro flows (apps/mobile/e2e, R51) on development builds against the Firebase
// emulators with seed data (R52). TASK-62.
//
//   pnpm e2e --android emulator-5554 --ios <simulator udid> [--build]
//
// Each device runs every single-device flow. With both, Alex adds an item on Android and Sam sees it on
// iOS (a change reaching a second device). Needs Maestro (decision-9), Metro on :8081 (`npx expo start`
// in apps/mobile), and the development build installed on each device: --build builds and installs it
// from tools/emulator-config.ts's demo-project config, which a dev build must carry to see the seed data.
// Starts the emulators if they are not running, and reseeds them either way.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Devices {
  readonly android?: string;
  readonly ios?: string;
}

export interface Run {
  readonly device: string;
  readonly flow: string;
  readonly env: Readonly<Record<string, string>>;
  /** Set CODE to Jo's pending invite, read from the emulator, before this run (TASK-56). */
  readonly needsInviteCode?: boolean;
}

const PAIR_ADD = 'second-device-add.yaml';
const PAIR_SEE = 'second-device-see.yaml';
const HOUSEHOLD = ['household-invite.yaml', 'household-join.yaml', 'household-full.yaml'] as const;
const TWO_DEVICE: readonly string[] = [PAIR_ADD, PAIR_SEE, ...HOUSEHOLD];

/** Which flow runs on which device, in order. `flows` are the top-level flow file names. */
export function planRuns(devices: Devices, flows: readonly string[], runId: string): Run[] {
  const single = flows.filter((f) => !TWO_DEVICE.includes(f)).sort();
  const targets = [devices.android, devices.ios].filter((d): d is string => Boolean(d));
  const runs: Run[] = targets.flatMap((device) => single.map((flow) => ({ device, flow, env: { RUN_ID: runId } })));
  if (devices.android && devices.ios && flows.includes(PAIR_ADD) && flows.includes(PAIR_SEE)) {
    const env = { RUN_ID: runId, ITEM: `E2E from Alex ${runId}` };
    runs.push({ device: devices.android, flow: PAIR_ADD, env }, { device: devices.ios, flow: PAIR_SEE, env });
  }
  // Jo invites on one device, Pat joins with that code on the other, then Jo sees the kitchen full.
  if (devices.android && devices.ios && HOUSEHOLD.every((f) => flows.includes(f))) {
    const env = { RUN_ID: runId };
    runs.push(
      { device: devices.android, flow: HOUSEHOLD[0], env },
      { device: devices.ios, flow: HOUSEHOLD[1], env, needsInviteCode: true },
      { device: devices.android, flow: HOUSEHOLD[2], env },
    );
  }
  return runs;
}

/**
 * Runs step and then deletes a file it created that was not there before. expo prebuild writes
 * apps/mobile/tsconfig.json extending expo/tsconfig.base, which this hoisted layout cannot resolve,
 * and 15 vitest files fail until it is removed (TASK-65). A file someone put there themselves stays.
 */
export function removingWhatItCreates<T>(path: string, step: () => T, fs: { exists: (p: string) => boolean; remove: (p: string) => void }): T {
  const was = fs.exists(path);
  try {
    return step();
  } finally {
    if (!was && fs.exists(path)) fs.remove(path);
  }
}

export function parseArgs(args: readonly string[]): Devices & { readonly build: boolean } {
  const value = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const android = value('--android');
  const ios = value('--ios');
  return { ...(android ? { android } : {}), ...(ios ? { ios } : {}), build: args.includes('--build') };
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const appDir = join(root, 'apps', 'mobile');
const adb = join(process.env['ANDROID_HOME'] ?? join(homedir(), 'Library/Android/sdk'), 'platform-tools/adb');
const configDir = join(root, 'apps/mobile/.emulator-config');

/** Jo's kitchen's newest pending invite code, straight from the Firestore emulator. */
function pendingInviteCode(): string {
  const script = `
    import('firebase-admin/app').then(async ({ initializeApp }) => {
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore(initializeApp({ projectId: 'demo-grocs' }));
      const snap = await db.collection('inviteCodes').where('kitchenId', '==', 'seed-open-kitchen').where('status', '==', 'pending').get();
      const newest = snap.docs.sort((a, b) => b.data().createdAt - a.data().createdAt)[0];
      process.stdout.write(newest ? newest.id : '');
    });`;
  return execFileSync('node', ['-e', script], { cwd: root, encoding: 'utf8', env: { ...process.env, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' } }).trim();
}

const up = (port: number) => spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' }).stdout.trim() !== '';
const sh = (cmd: string, args: readonly string[], env: Readonly<Record<string, string>> = {}, cwd = root) =>
  spawnSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } }).status ?? 1;

function build(devices: Devices): number {
  const src = join(homedir(), '.config/grocs-dev');
  if (sh('node', ['tools/emulator-config.ts', join(src, 'google-services.json'), join(src, 'GoogleService-Info.plist'), configDir]) !== 0) return 1;
  const env = { GOOGLE_SERVICES_JSON_PATH: join(configDir, 'google-services.json'), GOOGLE_SERVICE_INFO_PLIST_PATH: join(configDir, 'GoogleService-Info.plist'), CI: '1' };
  for (const [platform, device] of [['android', devices.android], ['ios', devices.ios]] as const) {
    if (!device) continue;
    if (sh('npx', ['expo', 'prebuild', '--platform', platform, '--clean', '--no-install'], env, appDir) !== 0) return 1;
    const run = platform === 'android' ? ['expo', 'run:android', '--no-bundler', '--device', device] : ['expo', 'run:ios', '--no-bundler', '--configuration', 'Debug', '--device', device];
    if (sh('npx', run, env, appDir) !== 0) return 1;
  }
  return 0;
}

function runFlows(devices: Devices): number {
  if (devices.android) execFileSync(adb, ['-s', devices.android, 'reverse', 'tcp:8081', 'tcp:8081']);
  if (sh('node', ['-e', "import('./firebase/seed/seed.ts').then((m) => m.seed())"], { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' }) !== 0) return 1;
  const flows = readdirSync(join(appDir, 'e2e')).filter((f) => f.endsWith('.yaml'));
  const runId = new Date().toISOString().replace(/\D/g, '').slice(8, 14);
  const failed: string[] = [];
  for (const run of planRuns(devices, flows, runId)) {
    console.log(`\n== ${run.flow} on ${run.device}`);
    const code = run.needsInviteCode ? pendingInviteCode() : '';
    if (run.needsInviteCode && !code) {
      failed.push(`${run.flow} on ${run.device} (no pending invite for Jo's kitchen to join with)`);
      continue;
    }
    const env = Object.entries({ ...run.env, ...(code ? { CODE: code } : {}) }).flatMap(([k, v]) => ['-e', `${k}=${v}`]);
    if (sh('maestro', ['--device', run.device, 'test', ...env, `e2e/${run.flow}`], {}, appDir) !== 0) failed.push(`${run.flow} on ${run.device}`);
  }
  console.log(failed.length === 0 ? '\ne2e: every flow passed' : `\ne2e: FAILED ${failed.join('; ')}`);
  return failed.length === 0 ? 0 : 1;
}

function main(args: readonly string[]): number {
  const opts = parseArgs(args);
  if (!opts.android && !opts.ios) {
    console.error('usage: pnpm e2e --android <adb serial> --ios <simulator udid> [--build] (at least one device)');
    return 2;
  }
  if (spawnSync('maestro', ['--version']).status !== 0) {
    console.error('e2e: Maestro is not installed (decision-9). brew install mobile-dev-inc/tap/maestro');
    return 1;
  }
  if (!up(8081)) {
    console.error('e2e: Metro is not running on :8081. Start it in apps/mobile with `npx expo start`, then rerun.');
    return 1;
  }
  if (opts.build && removingWhatItCreates(join(appDir, 'tsconfig.json'), () => build(opts), { exists: existsSync, remove: (p) => rmSync(p) }) !== 0) return 1;
  if (args.includes('--inside') || up(8080)) return runFlows(opts);
  // Start the emulators for this run only, and run the flows inside them.
  return sh('pnpm', ['exec', 'firebase', 'emulators:exec', '--only', 'firestore,auth,functions', '--project', 'demo-grocs', ['node', 'tools/e2e.ts', ...args.filter((a) => a !== '--build'), '--inside'].join(' ')]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
