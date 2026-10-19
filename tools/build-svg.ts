// Generates the React Native art components from design/svg/ (R62, decision-10).
//
//   node tools/build-svg.ts      writes every generated file, removes generated files whose SVG is gone
//
// Edit the SVG, never the generated .tsx. The check "svg-art" fails when the checked-in files differ
// from what this script produces.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_MARK, renderAll } from './svg/render.ts';
import type { TokenColours } from './svg/render.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readColours(tokensJson: string): TokenColours {
  const color = (JSON.parse(tokensJson) as { color: { mascot: Record<string, string>; scene: Record<string, string> } }).color;
  return { mascot: color.mascot, scene: color.scene };
}

function listSvgs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listSvgs(full, out);
    else if (name.endsWith('.svg')) out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

function listGenerated(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listGenerated(full, out);
    else if (/\.(ts|tsx)$/.test(name) && readFileSync(full, 'utf8').startsWith(GENERATED_MARK)) out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

function main(): number {
  const sources = Object.fromEntries(listSvgs(join(root, 'design/svg')).map((f) => [f, readFileSync(join(root, f), 'utf8')]));
  const colours = readColours(readFileSync(join(root, 'packages/ui/src/tokens/tokens.json'), 'utf8'));
  const { files, problems } = renderAll(sources, colours);
  if (problems.length > 0) {
    for (const p of problems) console.error(`FAIL ${p.rule}: ${p.file}: ${p.detail}`);
    console.error(`\n${problems.length} problem(s); nothing was written.`);
    return 1;
  }
  for (const stale of listGenerated(join(root, 'packages/ui/src'))) {
    if (!(stale in files)) rmSync(join(root, stale));
  }
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  console.log(`wrote ${Object.keys(files).length} files`);
  return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exitCode = main();
