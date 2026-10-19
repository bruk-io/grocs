// Design tokens (R39, R42, R59): one source, a generated file that matches it, no raw values in
// the UI library, and text pairs that meet the contrast ratio.
import ts from 'typescript';
import { renderTokensTs } from '../build-tokens.ts';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';
import { isTestFile } from './lib.ts';

const TOKENS_JSON = 'packages/ui/src/tokens/tokens.json';
const TOKENS_TS = 'packages/ui/src/tokens/tokens.ts';

export const rules: Readonly<Record<string, RuleInfo>> = {
  'design-tokens/generated-in-sync': {
    req: 'R59',
    summary: 'tokens.ts must match what tokens.json generates',
    why: 'tokens.json is the single source of every colour, size, radius, type and motion value. A generated file edited by hand, or left stale, makes the apps and the design disagree.',
    fix: 'Edit tokens.json (never tokens.ts) and run: pnpm tokens',
  },
  'design-tokens/raw-value': {
    req: 'R39',
    summary: 'The UI library takes colours, sizes, radii, type and motion from tokens only',
    why: 'A raw value in a component is a second source of truth: it drifts from the design, cannot be themed, and is invisible to anyone changing the tokens.',
    fix: 'Add the value to tokens.json if the design needs it, run pnpm tokens, and use tokens.<group>.<name> in the component.',
  },
  'design-tokens/contrast': {
    req: 'R42',
    summary: 'Text colour pairs meet a 4.5:1 contrast ratio',
    why: 'Text below 4.5:1 is hard to read for many people, and a token pair that fails fails everywhere it is used.',
    fix: 'Darken the text colour or lighten the background in tokens.json, then run pnpm tokens.',
  },
};

const STYLE_PROPS = new Set([
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'padding', 'paddingHorizontal', 'paddingVertical',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingStart', 'paddingEnd', 'margin', 'marginHorizontal',
  'marginVertical', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginStart', 'marginEnd', 'gap', 'rowGap',
  'columnGap', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
  'borderWidth', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'fontSize', 'lineHeight',
  'letterSpacing', 'opacity', 'top', 'left', 'right', 'bottom', 'flexBasis', 'elevation', 'shadowRadius', 'shadowOpacity',
  // Motion: a duration or delay is a token (motion.duration), never a number written in a component.
  'duration', 'delay', 'animationDuration', 'animationDelay', 'transitionDuration',
  // JSX size props (<Svg width={24}>, <Icon size={20}>).
  'size', 'strokeWidth',
]);
// Type: a family or weight is a token (font.family, font.weight), not a string written in a component.
const STRING_PROPS = new Set(['fontFamily', 'fontWeight', 'animationTimingFunction', 'transitionTimingFunction']);
const NAMED_COLOUR = /^(white|black|red|green|blue|gray|grey|yellow|orange|purple|pink|brown|silver|gold)$/i;
/** Generated art (icons, mascots, scenes) is SVG geometry in its own coordinates; only its colours are design values. */
export const isArtFile = (file: string): boolean => /(^|\/)(generated|art)\//.test(file);
const COLOUR = /^\s*(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\()/;

export function findRawValues(file: string, source: string): { line: number; text: string }[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const art = isArtFile(file);
  const hits: { line: number; text: string }[] = [];
  const add = (node: ts.Node, text: string): void => {
    hits.push({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text });
  };
  // A value written straight into a style or a prop: a number other than 0 and 1, or a type string.
  const checkValue = (node: ts.Node, name: string, init: ts.Expression): void => {
    if (ts.isJsxExpression(init) && init.expression) init = init.expression;
    if (STYLE_PROPS.has(name) && !art) {
      if (ts.isNumericLiteral(init) && Number(init.text) !== 0 && Number(init.text) !== 1) add(node, `${name}: ${init.text}`);
      if (ts.isPrefixUnaryExpression(init) && ts.isNumericLiteral(init.operand)) add(node, `${name}: -${init.operand.text}`);
    }
    if (STRING_PROPS.has(name) && !art && (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init))) add(node, `${name}: '${init.text}'`);
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && (COLOUR.test(node.text) || (NAMED_COLOUR.test(node.text) && isColourContext(node)))) add(node, `colour ${node.text}`);
    if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) checkValue(node, node.name.text, node.initializer);
    if (ts.isJsxAttribute(node) && node.initializer && ts.isIdentifier(node.name)) checkValue(node, node.name.text, node.initializer as ts.Expression);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

/** A named colour only counts as a raw colour where it is the value of a colour property or prop. */
function isColourContext(node: ts.Node): boolean {
  const parent = node.parent;
  const name = ts.isPropertyAssignment(parent) ? parent.name.getText() : ts.isJsxAttribute(parent) ? parent.name.getText() : ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent) ? parent.parent.name.getText() : '';
  return /(^|[a-z])(color|Color|fill|stroke)$/.test(name) || name === 'fill' || name === 'stroke';
}

function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function run(ctx: CheckContext): Finding[] {
  const out: Finding[] = [];
  if (ctx.allFiles.includes(TOKENS_JSON)) {
    const json = JSON.parse(ctx.readSource(TOKENS_JSON)) as Record<string, unknown> & { color?: Record<string, string>; contrastPairs?: [string, string][] };
    const expected = renderTokensTs(json);
    const actual = ctx.allFiles.includes(TOKENS_TS) ? ctx.readSource(TOKENS_TS) : null;
    if (actual !== expected) {
      out.push({ rule: 'design-tokens/generated-in-sync', file: TOKENS_TS, detail: actual === null ? 'tokens.ts does not exist' : 'tokens.ts differs from the output of tools/build-tokens.ts' });
    }
    for (const [fg, bg] of json.contrastPairs ?? []) {
      const a = json.color?.[fg];
      const b = json.color?.[bg];
      if (!a || !b) {
        out.push({ rule: 'design-tokens/contrast', file: TOKENS_JSON, detail: `contrast pair ${fg} / ${bg} names a colour that does not exist` });
        continue;
      }
      const ratio = contrastRatio(a, b);
      if (ratio < 4.5) out.push({ rule: 'design-tokens/contrast', file: TOKENS_JSON, detail: `${fg} (${a}) on ${bg} (${b}) is ${ratio.toFixed(2)}:1, below 4.5:1` });
    }
  }
  for (const file of ctx.files) {
    if (!file.startsWith('packages/ui/src/') || file.startsWith('packages/ui/src/tokens/') || isTestFile(file)) continue;
    for (const hit of findRawValues(file, ctx.readSource(file))) {
      out.push({ rule: 'design-tokens/raw-value', file, line: hit.line, detail: `raw value ${hit.text}` });
    }
  }
  return out;
}

export const check: Check = { id: 'design-tokens', rules, run };
