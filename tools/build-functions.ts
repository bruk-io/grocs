// Build the deployable Cloud Functions package (TASK-48), run by firebase.deploy.json's predeploy.
//
// apps/functions depends on workspace packages through pnpm's workspace: protocol. A functions deploy uploads the
// source directory and Cloud Build runs plain npm install on it, which fails with EUNSUPPORTEDPROTOCOL. So deploys
// use a generated directory: the workspace code bundled into one file, and a package.json with npm dependencies
// only. firebase.json still points the emulators at the real TypeScript source.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

export interface FunctionsPackage {
  readonly name: string;
  readonly engines: Readonly<Record<string, string>>;
  readonly dependencies: Readonly<Record<string, string>>;
}

const isWorkspace = (version: string): boolean => version.startsWith('workspace:');

/** What stays an npm dependency in the deployed package: everything the workspace code does not bundle. */
export function externalDependencies(pkg: FunctionsPackage): readonly string[] {
  return Object.entries(pkg.dependencies)
    .filter(([, version]) => !isWorkspace(version))
    .map(([name]) => name);
}

/** The deployed package.json: the same runtime and npm dependencies, with no workspace: references. */
export function deployManifest(pkg: FunctionsPackage): object {
  return {
    name: pkg.name,
    private: true,
    main: 'index.js',
    type: 'module',
    engines: pkg.engines,
    dependencies: Object.fromEntries(Object.entries(pkg.dependencies).filter(([, version]) => !isWorkspace(version))),
  };
}

async function main(): Promise<void> {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const source = join(root, 'apps/functions');
  const out = join(source, 'deploy');
  const pkg = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8')) as FunctionsPackage;

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  await build({
    entryPoints: [join(source, 'src/index.ts')],
    outfile: join(out, 'index.js'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    external: [...externalDependencies(pkg)],
  });
  writeFileSync(join(out, 'package.json'), `${JSON.stringify(deployManifest(pkg), null, 2)}\n`);
  // A deploy loads the functions locally to list them, so the npm dependencies must be installed here too.
  execFileSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund', '--ignore-scripts'], { cwd: out, stdio: 'inherit' });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
