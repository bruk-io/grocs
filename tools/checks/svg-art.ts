// Art sources and the components generated from them (R62, decision-5, decision-10): the checked-in
// files must be what tools/build-svg.ts produces, and the art must keep the names and the structure
// the animation depends on.
import { GENERATED_MARK, renderAll } from '../svg/render.ts';
import type { Check, CheckContext, Finding, RuleInfo } from './lib.ts';

const TOKENS_JSON = 'packages/ui/src/tokens/tokens.json';
const SOURCE = /^design\/svg\/(icons|mascots|scenes)\/[\w-]+\.svg$/;

export const rules: Readonly<Record<string, RuleInfo>> = {
  'svg-art/generated-in-sync': {
    req: 'R62, R59',
    summary: 'The generated art components must match what tools/build-svg.ts makes from design/svg',
    why: 'The SVG is the one source of each icon, mushroom and scene. A generated component edited by hand, left stale, or left behind after its SVG was removed means the app draws something the design files do not show.',
    fix: 'Edit the SVG in design/svg (never the generated .tsx) and run: pnpm svg',
  },
  'svg-art/icon-style': {
    req: 'R62',
    summary: 'Icons are drawn on the 24 grid with one round 2 point stroke and no colour of their own',
    why: 'The icon set is one family: the stroke width comes from tokens.stroke.icon and the colour from the caller, so an icon that sets its own stroke, fill or class cannot follow the tokens or the text colour.',
    fix: 'Give the <svg> viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2", and remove stroke, fill and style from the shapes inside it.',
  },
  'svg-art/part-names': {
    req: 'R62',
    summary: 'A mascot names body, cap, eyeL, eyeR and mouth, each once',
    why: 'The Mascot component animates the parts by name (decision-5). A redrawn mushroom that renames or drops one would silently stop blinking or talking.',
    fix: 'Give the element the id it needs in the mascot SVG (body, cap, eyeL, eyeR, mouth; optional parts are listed in tools/svg/render.ts) and run: pnpm svg',
  },
  'svg-art/mouth-structure': {
    req: 'R62',
    summary: 'Every mouth pose in one mascot has the same path structure',
    why: 'A mouth changes shape by morphing one path into another, which only works when both have the same sequence of path commands (decision-5). On the web it falls back to a jump.',
    fix: 'Redraw the pose with the same command letters as the resting mouth, moving only the numbers.',
  },
  'svg-art/unknown-colour': {
    req: 'R39, R62',
    summary: 'Every colour in the art is a colour token',
    why: 'A hex colour copied into a generated component is a second source of truth. Art colours live in tokens.json under color.mascot and color.scene, once each.',
    fix: 'Add the colour to color.mascot or color.scene in tokens.json, run pnpm tokens, then pnpm svg.',
  },
  'svg-art/unreadable': {
    req: 'R62',
    summary: 'The art source must convert',
    why: 'An SVG the converter cannot read produces no component, so the design file and the app would drift apart.',
    fix: 'Fix the SVG so it is well formed, using shapes react-native-svg supports, then run: pnpm svg',
  },
};

export function run(ctx: CheckContext): Finding[] {
  if (!ctx.allFiles.includes(TOKENS_JSON)) return [];
  const sources: Record<string, string> = {};
  for (const f of ctx.allFiles) if (SOURCE.test(f)) sources[f] = ctx.readSource(f);
  const tokens = JSON.parse(ctx.readSource(TOKENS_JSON)) as { color?: { mascot?: Record<string, string>; scene?: Record<string, string> } };
  const { files, problems } = renderAll(sources, { mascot: tokens.color?.mascot ?? {}, scene: tokens.color?.scene ?? {} });

  const out: Finding[] = problems.map((p) => ({ rule: p.rule, file: p.file, detail: p.detail }));
  if (problems.length > 0) return out;

  const present = new Set(ctx.allFiles);
  for (const [file, text] of Object.entries(files)) {
    if (!present.has(file)) out.push({ rule: 'svg-art/generated-in-sync', file, detail: `${file} does not exist; its SVG has not been converted` });
    else if (ctx.readSource(file) !== text) out.push({ rule: 'svg-art/generated-in-sync', file, detail: `${file} differs from the output of tools/build-svg.ts` });
  }
  for (const file of ctx.files) {
    if (!file.startsWith('packages/ui/src/') || file in files) continue;
    if (ctx.readSource(file).startsWith(GENERATED_MARK)) out.push({ rule: 'svg-art/generated-in-sync', file, detail: `${file} was generated from an SVG that no longer exists` });
  }
  return out;
}

export const check: Check = { id: 'svg-art', rules, run };
