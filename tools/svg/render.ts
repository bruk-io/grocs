// Turns the art sources in design/svg/ into React Native components (R62, decision-10). Pure: it takes
// the source text and tokens.json and returns the text of every generated file, so the generator
// (tools/build-svg.ts) writes what this returns and the check "svg-art" compares it with the files
// that are checked in.
//
// SVGR converts each SVG to react-native-svg JSX; this module then reads that JSX with the
// TypeScript parser and writes the final file: stroke width and colour from tokens (icons), hex
// colours mapped to colour tokens, and the elements that move turned into <Part>.
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import ts from 'typescript';

/** The parts every mascot must draw (decision-5). The Mascot component animates them by name. */
export const REQUIRED_PARTS = ['body', 'cap', 'eyeL', 'eyeR', 'mouth'] as const;
/** Other named parts a mascot may draw; they are <Part>s too, so a pose can move or hide them. */
export const OPTIONAL_PARTS = [
  'stem', 'blushL', 'blushR', 'brows', 'eyesShut', 'glassesL', 'glassesR', 'sparkle', 'zzA', 'zzB', 'stalkL', 'stalkC', 'stalkR',
  // The Welcome scene's props, drawn as poses (TASK-1.30, from the TASK-1.19 review).
  'spoon', 'tomato', 'scrub',
] as const;
const MASCOT_PARTS: ReadonlySet<string> = new Set<string>([...REQUIRED_PARTS, ...OPTIONAL_PARTS]);

export type ProblemRule =
  | 'svg-art/icon-style'
  | 'svg-art/part-names'
  | 'svg-art/mouth-structure'
  | 'svg-art/unknown-colour'
  | 'svg-art/token-name'
  | 'svg-art/unreadable';

export interface Problem {
  readonly rule: ProblemRule;
  /** The source SVG, root-relative. */
  readonly file: string;
  readonly detail: string;
}

export interface Rendered {
  /** Root-relative path of each generated file -> its text. */
  readonly files: Record<string, string>;
  readonly problems: Problem[];
}

export interface TokenColours {
  readonly mascot: Readonly<Record<string, string>>;
  readonly scene: Readonly<Record<string, string>>;
}

export const SVG_DIR = 'design/svg';
const ICONS_OUT = 'packages/ui/src/icons';
const MASCOTS_OUT = 'packages/ui/src/mascots/art';
const SCENES_OUT = 'packages/ui/src/organisms';

const pascal = (kebab: string): string => kebab.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
const header = (source: string): string =>
  `// GENERATED from ${source} by tools/build-svg.ts (R62). Do not edit the file: edit the SVG, then run: pnpm svg\n`;

// ---------------------------------------------------------------------------------------------
// Reading the source SVG

interface Tag {
  readonly name: string;
  readonly attrs: Readonly<Record<string, string>>;
}

export function scanTags(svg: string): Tag[] {
  const tags: Tag[] = [];
  for (const m of svg.matchAll(/<([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*\/?>/g)) {
    const attrs: Record<string, string> = {};
    for (const a of (m[2] ?? '').matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]!] = a[2]!;
    tags.push({ name: m[1]!, attrs });
  }
  return tags;
}

/** The sequence of path command letters, which is what must match for a mouth to morph. */
export const commandShape = (d: string): string => (d.match(/[a-zA-Z]/g) ?? []).join('');

function checkIcon(file: string, tags: readonly Tag[]): Problem[] {
  const out: Problem[] = [];
  const root = tags[0];
  const want: Record<string, string> = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' };
  for (const [k, v] of Object.entries(want)) {
    if (root?.attrs[k] !== v) out.push({ rule: 'svg-art/icon-style', file, detail: `the <svg> needs ${k}="${v}", it has ${root?.attrs[k] === undefined ? 'none' : `"${root.attrs[k]}"`}` });
  }
  for (const tag of tags.slice(1)) {
    for (const k of ['stroke-width', 'stroke', 'fill', 'style', 'class']) {
      if (tag.attrs[k] !== undefined) out.push({ rule: 'svg-art/icon-style', file, detail: `<${tag.name}> sets ${k}; icons take the stroke from the root and the tokens` });
    }
  }
  return out;
}

function checkMascot(file: string, tags: readonly Tag[]): Problem[] {
  const out: Problem[] = [];
  const ids = tags.map((t) => t.attrs['id']).filter((x): x is string => x !== undefined);
  for (const part of REQUIRED_PARTS) {
    if (!ids.includes(part)) out.push({ rule: 'svg-art/part-names', file, detail: `the mascot has no element with id="${part}"; the Mascot component animates ${REQUIRED_PARTS.join(', ')} by name` });
  }
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.push({ rule: 'svg-art/part-names', file, detail: `id="${id}" is used twice; a part name names one element` });
    seen.add(id);
    if (!MASCOT_PARTS.has(id)) out.push({ rule: 'svg-art/part-names', file, detail: `id="${id}" is not a known part (${[...MASCOT_PARTS].join(', ')})` });
  }
  const mouths = tags.filter((t) => (t.attrs['id'] ?? '').startsWith('mouth') && t.attrs['d'] !== undefined);
  const first = mouths[0];
  for (const m of mouths.slice(1)) {
    if (commandShape(m.attrs['d']!) !== commandShape(first!.attrs['d']!)) {
      out.push({ rule: 'svg-art/mouth-structure', file, detail: `${m.attrs['id']} has commands ${commandShape(m.attrs['d']!)} but ${first!.attrs['id']} has ${commandShape(first!.attrs['d']!)}; mouth poses must keep the same path structure to morph` });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// SVGR, then the JSX rewrite

const EXTRA_ATTRS = new Set(['xmlns', 'xmlnsXlink']);
const COLOUR_ATTRS = new Set(['fill', 'stroke', 'stopColor', 'floodColor', 'color']);

function svgrJsx(source: string): string {
  return transform.sync(
    source,
    {
      native: true,
      typescript: true,
      jsxRuntime: 'automatic',
      plugins: [svgo, jsx],
      // Only comment removal: anything more (the default preset) rewrites shapes and drops ids.
      svgoConfig: { plugins: [{ name: 'removeComments' }] },
    },
    { componentName: 'Art' },
  );
}

interface Walked {
  readonly lines: string[];
  readonly used: Set<string>;
}

interface Mode {
  readonly kind: 'icon' | 'mascot' | 'scene';
  readonly file: string;
  readonly colours: ReadonlyMap<string, string>;
  /** Ids that other elements point at (url(#id), href="#id"); these stay as ids. */
  readonly referenced: ReadonlySet<string>;
  readonly problems: Problem[];
}

function normaliseHex(value: string): string | null {
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value);
  if (!m) return null;
  const h = m[1]!.toUpperCase();
  return '#' + (h.length === 3 ? [...h].map((c) => c + c).join('') : h);
}

function attrText(sf: ts.SourceFile, attr: ts.JsxAttribute, mode: Mode): string | null {
  const name = attr.name.getText(sf);
  if (EXTRA_ATTRS.has(name) || name === 'id') return null;
  const init = attr.initializer;
  if (!init) return name;
  if (ts.isStringLiteral(init)) {
    if (COLOUR_ATTRS.has(name) && mode.kind !== 'icon') {
      const hex = normaliseHex(init.text);
      if (hex) {
        const token = mode.colours.get(hex);
        if (!token) {
          mode.problems.push({ rule: 'svg-art/unknown-colour', file: mode.file, detail: `${name}="${init.text}" has no colour token; add it under color.mascot or color.scene in tokens.json` });
          return `${name}="${init.text}"`;
        }
        return `${name}={tokens.color.${token}}`;
      }
      if (/^(rgb|hsl)a?\(/i.test(init.text)) {
        mode.problems.push({ rule: 'svg-art/unknown-colour', file: mode.file, detail: `${name}="${init.text}" is not a hex colour, so it cannot be mapped to a token` });
      }
    }
    return `${name}=${init.getText(sf)}`;
  }
  return `${name}=${init.getText(sf)}`;
}

function walk(sf: ts.SourceFile, node: ts.JsxChild, depth: number, mode: Mode, out: Walked): void {
  const pad = '  '.repeat(depth);
  if (ts.isJsxText(node)) {
    const text = node.text.trim();
    if (text) out.lines.push(`${pad}${text}`);
    return;
  }
  if (ts.isJsxExpression(node)) {
    const expr = node.expression;
    // SVGR writes text children as {"z"}; plain JSX text reads better.
    if (expr && ts.isStringLiteral(expr) && !/[{}<>]/.test(expr.text)) out.lines.push(`${pad}${expr.text}`);
    else if (expr) out.lines.push(`${pad}{${expr.getText(sf)}}`);
    return;
  }
  const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  if (!opening) return;
  const tag = opening.tagName.getText(sf);
  out.used.add(tag);
  const attrs = opening.attributes.properties.filter(ts.isJsxAttribute);
  const idAttr = attrs.find((a) => a.name.getText(sf) === 'id');
  const id = idAttr?.initializer && ts.isStringLiteral(idAttr.initializer) ? idAttr.initializer.text : null;

  const rendered = attrs.map((a) => attrText(sf, a, mode)).filter((x): x is string => x !== null);
  let element = tag;
  let asPart = false;
  if (id !== null) {
    if (mode.kind === 'mascot' && MASCOT_PARTS.has(id)) asPart = true;
    else if (mode.kind === 'scene' && !mode.referenced.has(id)) asPart = true;
    else if (mode.kind !== 'icon' && mode.referenced.has(id)) rendered.unshift(`id="${id}"`);
  }
  if (asPart) {
    element = 'Part';
    rendered.unshift(`name="${id}"`, `as={${tag}}`);
    out.used.add('Part');
  }
  const open = `${pad}<${element}${rendered.length ? ' ' + rendered.join(' ') : ''}`;
  const children = ts.isJsxElement(node) ? node.children : [];
  const meaningful = children.filter((c) => !(ts.isJsxText(c) && c.text.trim() === ''));
  if (meaningful.length === 0) {
    out.lines.push(`${open} />`);
    return;
  }
  out.lines.push(`${open}>`);
  for (const child of meaningful) walk(sf, child, depth + 1, mode, out);
  out.lines.push(`${pad}</${element}>`);
}

/** The root JSX element of what SVGR returned, with the identifiers it imported from react-native-svg. */
function rootOf(sf: ts.SourceFile): ts.JsxElement | null {
  let found: ts.JsxElement | null = null;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isJsxElement(n)) {
      found = n;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

function convert(file: string, source: string, mode: Mode): { lines: string[]; used: Set<string>; viewBox: string } | null {
  let code: string;
  try {
    code = svgrJsx(source);
  } catch (error) {
    mode.problems.push({ rule: 'svg-art/unreadable', file, detail: `SVGR could not convert it: ${error instanceof Error ? error.message : String(error)}` });
    return null;
  }
  const sf = ts.createSourceFile('art.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const root = rootOf(sf);
  if (!root) {
    mode.problems.push({ rule: 'svg-art/unreadable', file, detail: 'SVGR returned no element' });
    return null;
  }
  const viewBoxAttr = root.openingElement.attributes.properties.filter(ts.isJsxAttribute).find((a) => a.name.getText(sf) === 'viewBox');
  const viewBox = viewBoxAttr?.initializer && ts.isStringLiteral(viewBoxAttr.initializer) ? viewBoxAttr.initializer.text : '0 0 24 24';
  const out: Walked = { lines: [], used: new Set() };
  const children = root.children.filter((c) => !(ts.isJsxText(c) && c.text.trim() === ''));
  for (const child of children) walk(sf, child, 3, mode, out);
  return { lines: out.lines, used: out.used, viewBox };
}

// ---------------------------------------------------------------------------------------------
// Files

const svgImport = (used: ReadonlySet<string>, extra: readonly string[] = []): string => {
  const names = [...used].filter((n) => n !== 'Part' && n !== 'Svg').concat(extra).sort();
  return names.length ? `import { ${names.join(', ')} } from 'react-native-svg';\n` : '';
};

function iconFile(source: string, name: string, lines: string[], used: Set<string>): string {
  return [
    header(source),
    svgImport(used),
    `import { IconFrame } from '../icon-frame.tsx';`,
    `import type { IconProps } from '../icon-props.ts';\n`,
    `export function ${pascal(name)}(props: IconProps) {`,
    `  return (`,
    `    <IconFrame {...props}>`,
    ...lines,
    `    </IconFrame>`,
    `  );`,
    `}`,
    '',
  ].join('\n');
}

function artFile(source: string, component: string, viewBox: string, lines: string[], used: Set<string>, rel: { tokens: string; part: string }): string {
  const usesTokens = lines.some((l) => l.includes('tokens.color.'));
  const names = ['Svg', ...[...used].filter((n) => n !== 'Part' && n !== 'Svg')].sort();
  const imports = [
    `import { ${names.join(', ')} } from 'react-native-svg';`,
    `import type { SvgProps } from 'react-native-svg';`,
    usesTokens ? `import { tokens } from '${rel.tokens}';` : '',
    used.has('Part') ? `import { Part } from '${rel.part}';` : '',
  ].filter((l) => l !== '');
  return [
    header(source),
    ...imports,
    '',
    `export function ${component}(props: SvgProps) {`,
    `  return (`,
    `    <Svg viewBox="${viewBox}" {...props}>`,
    ...lines,
    `    </Svg>`,
    `  );`,
    `}`,
    '',
  ].join('\n');
}

/** A token key that is just the letter h and six hex digits, such as h5e9952. */
const HEX_NAMED = /^h[0-9a-f]{6}$/i;

function colourMap(tokens: TokenColours, problems: Problem[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const [group, values] of [['mascot', tokens.mascot], ['scene', tokens.scene]] as const) {
    for (const [key, hex] of Object.entries(values)) {
      if (HEX_NAMED.test(key)) {
        problems.push({ rule: 'svg-art/token-name', file: 'packages/ui/src/tokens/tokens.json', detail: `color.${group}.${key} is named for its hex; name it for what it paints (decision-10), for example wall or foliageDark` });
      }
      const norm = normaliseHex(hex);
      if (!norm) continue;
      const earlier = map.get(norm);
      if (earlier) {
        problems.push({ rule: 'svg-art/unknown-colour', file: 'packages/ui/src/tokens/tokens.json', detail: `${hex} is both ${earlier} and ${group}.${key}; one colour needs one art token` });
      } else map.set(norm, `${group}.${key}`);
    }
  }
  return map;
}

function referencedIds(source: string): Set<string> {
  const ids = new Set<string>();
  for (const m of source.matchAll(/url\(#([\w-]+)\)|href="#([\w-]+)"/g)) ids.add((m[1] ?? m[2])!);
  return ids;
}

/**
 * Every generated file for the given sources. `sources` maps a root-relative path under design/svg to its
 * text. The result is deterministic: running it twice gives the same text.
 */
export function renderAll(sources: Readonly<Record<string, string>>, colours: TokenColours): Rendered {
  const files: Record<string, string> = {};
  const problems: Problem[] = [];
  const colourTokens = colourMap(colours, problems);
  const icons: string[] = [];
  const mascots: string[] = [];

  for (const file of Object.keys(sources).sort()) {
    const m = /^design\/svg\/(icons|mascots|scenes)\/([\w-]+)\.svg$/.exec(file);
    if (!m) continue;
    const [, kind, name] = m as unknown as [string, 'icons' | 'mascots' | 'scenes', string];
    const source = sources[file]!;
    const tags = scanTags(source);
    const base = { file, colours: colourTokens, referenced: referencedIds(source), problems };

    if (kind === 'icons') {
      problems.push(...checkIcon(file, tags));
      const done = convert(file, source, { ...base, kind: 'icon' });
      if (!done) continue;
      files[`${ICONS_OUT}/generated/${pascal(name)}.tsx`] = iconFile(file, name, done.lines, done.used);
      icons.push(name);
    } else if (kind === 'mascots') {
      problems.push(...checkMascot(file, tags));
      const done = convert(file, source, { ...base, kind: 'mascot' });
      if (!done) continue;
      files[`${MASCOTS_OUT}/${pascal(name)}.tsx`] = artFile(file, `${pascal(name)}Art`, done.viewBox, done.lines, done.used, { tokens: '../../tokens/tokens.ts', part: '../part.tsx' });
      mascots.push(name);
    } else {
      const group = name.split('-')[0]!;
      const done = convert(file, source, { ...base, kind: 'scene' });
      if (!done) continue;
      files[`${SCENES_OUT}/${group}/art/${pascal(name)}.tsx`] = artFile(file, `${pascal(name)}Art`, done.viewBox, done.lines, done.used, { tokens: '../../../tokens/tokens.ts', part: '../../../mascots/part.tsx' });
    }
  }

  if (icons.length) {
    const sorted = [...icons].sort();
    files[`${ICONS_OUT}/index.ts`] = [
      `// GENERATED from design/svg/icons/*.svg by tools/build-svg.ts (R62). Do not edit the file: add or edit an SVG, then run: pnpm svg`,
      ...sorted.map((n) => `import { ${pascal(n)} } from './generated/${pascal(n)}.tsx';`),
      '',
      `/** The named icon set. Every icon is drawn with the stroke width from tokens.stroke.icon. */`,
      `export const icons = {`,
      ...sorted.map((n) => `  ${/^[a-z]+$/.test(n) ? n : `'${n}'`}: ${pascal(n)},`),
      `} as const;`,
      '',
      `export type IconName = keyof typeof icons;`,
      '',
    ].join('\n');
  }
  if (mascots.length) {
    const sorted = [...mascots].sort();
    files[`${MASCOTS_OUT}/index.ts`] = [
      `// GENERATED from design/svg/mascots/*.svg by tools/build-svg.ts (R62). Do not edit the file: add or edit an SVG, then run: pnpm svg`,
      ...sorted.map((n) => `import { ${pascal(n)}Art } from './${pascal(n)}.tsx';`),
      '',
      `/** Each mushroom's art. The Mascot component animates its named parts (decision-5). */`,
      `export const mascotArt = {`,
      ...sorted.map((n) => `  ${n}: ${pascal(n)}Art,`),
      `} as const;`,
      '',
      `export type MascotName = keyof typeof mascotArt;`,
      '',
    ].join('\n');
  }
  return { files, problems };
}

/** Folders that hold only generated files, so a file there with no source is stale. */
export const GENERATED_DIRS: readonly string[] = [`${ICONS_OUT}/generated/`, `${MASCOTS_OUT}/`, `${SCENES_OUT}/`];
export const GENERATED_MARK = '// GENERATED from design/svg/';
