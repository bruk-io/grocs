// Import-layer check (R26, R27, R60). Reads each source file's imports with the
// TypeScript pre-processor (no type-checking, so it stays fast) and checks them
// against the layer table below.
import { builtinModules } from 'node:module';
import { posix } from 'node:path';
import ts from 'typescript';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isStoryFile, isTestFile } from './lib.ts';

export type Layer = 'core' | 'ports' | 'application' | 'providers' | 'ui' | 'app';

/** Package folder name -> layer. Provider packages are split by platform so they never import one another. */
export const PACKAGE_LAYER: Readonly<Record<string, Layer>> = {
  core: 'core',
  ports: 'ports',
  application: 'application',
  'providers-firebase': 'providers',
  'providers-device': 'providers',
  'providers-server': 'providers',
  ui: 'ui',
};

/** What each layer may import from the rest of the project (R26). Provider-to-provider is excluded on purpose. */
const ALLOWED_PROJECT: Readonly<Record<Layer, readonly Layer[]>> = {
  core: [],
  ports: ['core'],
  application: ['core', 'ports'],
  providers: ['core', 'ports'],
  ui: [],
  app: ['core', 'ports', 'application', 'providers', 'ui'],
};

/** Third-party packages a layer may import. null means anything. Tests and stories also get TEST_TOOLING. */
const ALLOWED_THIRD_PARTY: Readonly<Record<Layer, readonly RegExp[] | null>> = {
  core: [],
  ports: [],
  application: [],
  providers: null,
  ui: [/^react$/, /^react\/jsx-runtime$/, /^react-native($|\/)/, /^react-native-svg$/],
  app: null,
};
const TEST_TOOLING: readonly RegExp[] = [
  /^vitest($|\/)/,
  /^fast-check$/,
  /^@testing-library\//,
  /^@storybook\//,
  /^storybook($|\/)/,
];
/** Layers that must stay free of I/O and platform packages, node built-ins included. */
const NO_NODE_BUILTINS: readonly Layer[] = ['core', 'ports', 'application', 'ui'];

const DESIGN_LEVELS = ['tokens', 'atoms', 'molecules', 'organisms', 'templates'] as const;
type Level = (typeof DESIGN_LEVELS)[number];
/** Which design levels each level may import (R60). icons and mascots are shared assets any level may use. */
const ALLOWED_LEVELS: Readonly<Record<Level, readonly string[]>> = {
  tokens: [],
  atoms: ['tokens', 'icons', 'mascots'],
  molecules: ['atoms', 'tokens', 'icons', 'mascots'],
  organisms: ['molecules', 'atoms', 'tokens', 'icons', 'mascots'],
  templates: ['organisms', 'molecules', 'atoms', 'tokens', 'icons', 'mascots'],
};

export const rules: Readonly<Record<string, RuleInfo>> = {
  'import-layers/allowed-imports': {
    req: 'R26, R27',
    summary: 'A layer may import only the layers listed for it',
    why: 'The domain must never depend on I/O, platform or UI code, and the app (composition root) is the only place that knows every layer. The table keeps each layer replaceable and testable on its own.',
    fix: 'Move the code to the layer that may depend on it, or pass what you need in as a parameter (a port, a prop or a callback). The table is in tools/checks/import-layers.ts and in spec doc-1 R26.',
  },
  'import-layers/providers-isolated': {
    req: 'R26, R27',
    summary: 'Providers never import one another',
    why: 'Providers are split by platform so a phone never loads server code and the server never loads phone code. A provider that needs another provider is missing a port.',
    fix: 'Depend on the port in @grocs/ports instead, and let the composition root (apps/*) wire the other provider in.',
  },
  'import-layers/ui-tokens-only': {
    req: 'R26, R38',
    summary: 'UI imports design tokens only, never the application or providers',
    why: 'UI components are presentational: they take data and callbacks as props. That keeps them identical in both apps, and viewable in Storybook with no backend.',
    fix: 'Take the data and callbacks as props and connect them in a screen under apps/mobile/app.',
  },
  'import-layers/no-io-packages': {
    req: 'R25, R26',
    summary: 'Domain, ports and application import no I/O, platform or UI framework packages',
    why: 'Domain functions take data and return data. Anything that touches the network, disk, clock or screen makes them untestable without that thing, and ties the rules to one platform.',
    fix: 'Define a port for the capability in @grocs/ports and implement it in a provider package. Test tooling (vitest, fast-check) is allowed in *.test.ts files only.',
  },
  'import-layers/package-entry-only': {
    req: 'R26, R27',
    summary: 'Import another package through its entry point, not by path',
    why: 'A deep or relative path into another package skips the layer table and lets internals leak. The entry point is the package\'s public surface.',
    fix: 'Import from "@grocs/<package>" and export what you need from that package\'s src/index.ts.',
  },
  'import-layers/testing-entry-test-only': {
    req: 'R49, R53',
    summary: 'Fakes and contract suites are imported from "@grocs/<package>/testing", by tests only',
    why: 'Metro does not drop unused exports, so anything a shipped file imports from a package entry ends up in the release bundle. A fake auth with a hard-coded password in a release build is a way in, and test code is dead weight.',
    fix: 'Import fakes and contract suites from "@grocs/<package>/testing" in *.test.ts(x), stories or files under a testing/ folder. Shipped code takes the real implementation as a parameter.',
  },
  'import-layers/no-cycles': {
    req: 'R27',
    summary: 'No import cycles',
    why: 'Cycles make load order matter, hide which module owns what, and break the layering the table describes.',
    fix: 'Move the shared piece into a module both sides import, or invert one direction with a parameter.',
  },
  'import-layers/design-levels': {
    req: 'R60',
    summary: 'Each design level imports only from the levels below it',
    why: 'Atoms, molecules, organisms and templates only make sense if a smaller piece never depends on a bigger one; otherwise a change to a screen template can break a button.',
    fix: 'Move the shared part down a level, or pass the larger piece in as children or a prop.',
  },
};

export interface Unit {
  readonly layer: Layer;
  readonly name: string;
}

export function unitOf(file: string): Unit | null {
  const parts = file.split('/');
  if (parts[0] === 'packages' && parts[1]) {
    const layer = PACKAGE_LAYER[parts[1]];
    return layer ? { layer, name: parts[1] } : null;
  }
  if (parts[0] === 'apps' && parts[1]) return { layer: 'app', name: parts[1] };
  return null;
}

interface ImportRef {
  readonly spec: string;
  readonly line: number;
}

export function parseImports(source: string): ImportRef[] {
  const info = ts.preProcessFile(source, true, true);
  return info.importedFiles.map((i) => ({
    spec: i.fileName,
    line: source.slice(0, i.pos).split('\n').length,
  }));
}

const EXTS = ['.ts', '.tsx', '.mts', '.js', '.jsx', '.mjs'];

function resolveRelative(from: string, spec: string, fileSet: ReadonlySet<string>): string | null {
  const base = posix.normalize(posix.join(posix.dirname(from), spec));
  const stripped = base.replace(/\.(js|jsx|mjs)$/, '');
  const candidates = [base, ...EXTS.map((e) => base + e), ...EXTS.map((e) => stripped + e)];
  for (const e of EXTS) candidates.push(posix.join(base, `index${e}`));
  return candidates.find((c) => fileSet.has(c)) ?? null;
}

const isBuiltin = (spec: string): boolean =>
  spec.startsWith('node:') || builtinModules.includes(spec.split('/')[0] ?? '');

function packageName(spec: string): string {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? spec);
}

function levelOf(file: string): string | null {
  const m = /^packages\/ui\/src\/([^/]+)\//.exec(file);
  return m?.[1] ?? null;
}

export function run(ctx: CheckContext): Finding[] {
  const findings: Finding[] = [];
  const fileSet = new Set(ctx.files);
  const graph = new Map<string, string[]>();

  for (const file of ctx.files) {
    const unit = unitOf(file);
    const testish = isTestFile(file) || isStoryFile(file) || /(^|\/)\.(rn)?storybook\//.test(file);
    const edges: string[] = [];
    graph.set(file, edges);
    if (!unit && !/^packages\//.test(file) && !/^apps\//.test(file)) continue;

    for (const { spec, line } of parseImports(ctx.readSource(file))) {
      const add = (rule: string, detail: string) => findings.push({ rule, file, line, detail });

      if (spec.startsWith('.')) {
        const target = resolveRelative(file, spec, fileSet);
        const targetUnit = target ? unitOf(target) : null;
        const crossed = posix.normalize(posix.join(posix.dirname(file), spec));
        const crossedUnit = unitOf(crossed + '/x');
        if (unit && ((targetUnit && targetUnit.name !== unit.name) || (crossedUnit && crossedUnit.name !== unit.name))) {
          add('import-layers/package-entry-only', `"${spec}" reaches into ${(targetUnit ?? crossedUnit)!.name} by path`);
        }
        if (target) {
          edges.push(target);
          const from = levelOf(file);
          const to = levelOf(target);
          if (from && to && from in ALLOWED_LEVELS && to !== from && !ALLOWED_LEVELS[from as Level].includes(to) && DESIGN_LEVELS.includes(to as Level)) {
            add('import-layers/design-levels', `${from} imports from ${to} ("${spec}"); ${from} may import ${ALLOWED_LEVELS[from as Level].join(', ') || 'nothing'}`);
          }
        }
        continue;
      }

      if (spec.startsWith('@grocs/')) {
        const rest = spec.slice('@grocs/'.length);
        const [pkg, ...deep] = rest.split('/');
        if (!pkg) continue;
        const targetUnit = unitOf(`packages/${pkg}/x`);
        const isTestingEntry = deep.length === 1 && deep[0] === 'testing';
        if (isTestingEntry) {
          if (!testish && !/(^|\/)testing\//.test(file)) {
            add('import-layers/testing-entry-test-only', `"${spec}" is the test-support entry; only test, story and testing/ files may import it`);
          }
        } else if (deep.length > 0) {
          add('import-layers/package-entry-only', `"${spec}" is a deep import; use "@grocs/${pkg}"`);
        }
        if (targetUnit && !isTestingEntry) edges.push(`packages/${pkg}/src/index.ts`);
        if (!unit || !targetUnit || targetUnit.name === unit.name) continue;
        if (!ALLOWED_PROJECT[unit.layer].includes(targetUnit.layer)) {
          const rule =
            unit.layer === 'providers' && targetUnit.layer === 'providers'
              ? 'import-layers/providers-isolated'
              : unit.layer === 'ui'
                ? 'import-layers/ui-tokens-only'
                : 'import-layers/allowed-imports';
          const allowed = ALLOWED_PROJECT[unit.layer].join(', ') || 'nothing from the project';
          add(rule, `${unit.name} (${unit.layer} layer) imports ${spec} (${targetUnit.layer} layer); ${unit.layer} may import ${allowed}`);
        }
        continue;
      }

      // Third-party or built-in.
      if (!unit) continue;
      const allowed = ALLOWED_THIRD_PARTY[unit.layer];
      if (isBuiltin(spec)) {
        if (NO_NODE_BUILTINS.includes(unit.layer) && !testish) {
          add('import-layers/no-io-packages', `${unit.name} (${unit.layer} layer) imports Node built-in "${spec}"`);
        }
        continue;
      }
      if (allowed === null) continue;
      const name = packageName(spec);
      const ok = allowed.some((re) => re.test(spec) || re.test(name)) || (testish && TEST_TOOLING.some((re) => re.test(spec) || re.test(name)));
      if (!ok) {
        add('import-layers/no-io-packages', `${unit.name} (${unit.layer} layer) imports "${spec}", which is not on its allow-list`);
      }
    }
  }

  findings.push(...findCycles(graph));
  return findings;
}

/** Strongly connected components with more than one file (or a self-import) are cycles. */
function findCycles(graph: ReadonlyMap<string, readonly string[]>): Finding[] {
  let index = 0;
  const idx = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const out: Finding[] = [];

  const visit = (v: string): void => {
    idx.set(v, index);
    low.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);
    for (const w of graph.get(v) ?? []) {
      if (!graph.has(w)) continue;
      if (!idx.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, idx.get(w)!));
      }
    }
    if (low.get(v) === idx.get(v)) {
      const comp: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        comp.push(w);
      } while (w !== v);
      const selfLoop = comp.length === 1 && (graph.get(v) ?? []).includes(v);
      if (comp.length > 1 || selfLoop) {
        const sorted = comp.sort();
        out.push({
          rule: 'import-layers/no-cycles',
          file: sorted[0]!,
          detail: `these files import each other in a cycle: ${sorted.join(", ")}`,
        });
      }
    }
  };
  for (const v of graph.keys()) if (!idx.has(v)) visit(v);
  return out;
}

export const check: Check = { id: 'import-layers', rules, run };
