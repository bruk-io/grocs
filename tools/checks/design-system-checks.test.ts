// Fixture tests for the design-system checks of TASK-1.19: generated art in sync (R62), a board both built
// and still in the reference (R66), design levels (R60), interactive states (R61), one library (R38) and
// the stricter raw-value scan (R39).
import { describe, expect, it } from 'vitest';
import { resolveReferences } from '../build-tokens.ts';
import { renderAll } from '../svg/render.ts';
import { fixture, message, rulesOf } from './fixture.ts';
import { check as designTokens, findRawValues } from './design-tokens.ts';
import { check as importLayers } from './import-layers.ts';
import { check as referenceBuilt } from './reference-built.ts';
import { check as storyCoverage, missingInteractiveStates } from './story-coverage.ts';
import { check as svgArt } from './svg-art.ts';
import { check as uiLibrary } from './ui-library.ts';

const tokens = JSON.stringify({ color: { mascot: { ink: '#17241B', blush: '#FF9E9E' }, scene: { wall: '#112233' } } });
const TOKENS = 'packages/ui/src/tokens/tokens.json';

const icon = (d: string, root = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${root}><path d="${d}"/></svg>`;
const mascot = (extra = '', skip = ''): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${skip === 'body' ? '' : '<g id="body">'}` +
  `<g id="cap"><path d="M0 0h4" fill="#17241B"/></g>` +
  `<ellipse id="eyeL" cx="1" cy="2" rx="1" ry="1" fill="#17241B"/><ellipse id="eyeR" cx="3" cy="2" rx="1" ry="1" fill="#17241B"/>` +
  `<path id="mouth" d="M1 1q2 2 4 0z" fill="#17241B"/>${extra}${skip === 'body' ? '' : '</g>'}</svg>`;

const sources = { 'design/svg/icons/cart.svg': icon('M3 4h2'), 'design/svg/mascots/cremi.svg': mascot() };
const colours = { mascot: { ink: '#17241B', blush: '#FF9E9E' }, scene: { wall: '#112233' } };

/** The files the check expects to find, written by the generator. */
function inSync(src: Record<string, string>): Record<string, string> {
  const { files } = renderAll(src, colours);
  return { ...src, [TOKENS]: tokens, ...files };
}

describe('generated art (R62)', () => {
  it('converts icons to IconFrame children and mascots to Part elements with colour tokens', () => {
    const { files, problems } = renderAll(sources, colours);
    expect(problems).toEqual([]);
    const iconText = files['packages/ui/src/icons/generated/Cart.tsx']!;
    expect(iconText).toContain('<IconFrame {...props}>');
    expect(iconText).not.toContain('strokeWidth'); // the width comes from tokens.stroke.icon in IconFrame
    const art = files['packages/ui/src/mascots/art/Cremi.tsx']!;
    expect(art).toContain('<Part name="eyeL" as={Ellipse}');
    expect(art).toContain('<Part name="mouth" as={Path}');
    expect(art).toContain('fill={tokens.color.mascot.ink}');
    expect(art).not.toContain('#17241B');
    expect(files['packages/ui/src/icons/index.ts']).toContain('cart: Cart');
    expect(files['packages/ui/src/mascots/art/index.ts']).toContain('cremi: CremiArt');
  });

  it('is the same text every time it runs', () => {
    expect(renderAll(sources, colours).files).toEqual(renderAll(sources, colours).files);
  });

  it('passes when the checked-in files match', () => {
    expect(svgArt.run(fixture(inSync(sources)))).toEqual([]);
  });

  it('fails a generated file edited by hand, missing, or left behind', () => {
    const good = inSync(sources);
    const edited = svgArt.run(fixture({ ...good, 'packages/ui/src/icons/generated/Cart.tsx': good['packages/ui/src/icons/generated/Cart.tsx'] + '// hand edit\n' }));
    expect(rulesOf(edited)).toEqual(['svg-art/generated-in-sync']);
    expect(message(svgArt, edited[0]!)).toContain('pnpm svg');
    const { 'packages/ui/src/icons/generated/Cart.tsx': _gone, ...without } = good;
    expect(rulesOf(svgArt.run(fixture(without)))).toEqual(['svg-art/generated-in-sync']);
    const orphan = svgArt.run(fixture({ ...good, 'packages/ui/src/icons/generated/Old.tsx': '// GENERATED from design/svg/icons/old.svg by tools/build-svg.ts (R62).\n' }));
    expect(orphan.map((f) => f.detail).join()).toContain('no longer exists');
  });

  it('fails a mascot that is missing a part, with the part named', () => {
    const noMouth = mascot().replace('id="mouth"', 'id="smile"');
    const f = svgArt.run(fixture(inSync({ 'design/svg/mascots/cremi.svg': noMouth })));
    expect(rulesOf(f)).toContain('svg-art/part-names');
    expect(f.find((x) => x.rule === 'svg-art/part-names')?.detail).toContain('id="mouth"');
  });

  it('fails a mascot that uses a part name twice or a name nobody animates', () => {
    const twice = svgArt.run(fixture(inSync({ 'design/svg/mascots/cremi.svg': mascot('<ellipse id="eyeL" cx="1" cy="1" rx="1" ry="1"/>') })));
    expect(twice.map((f) => f.detail).join()).toContain('used twice');
    const unknown = svgArt.run(fixture(inSync({ 'design/svg/mascots/cremi.svg': mascot('<ellipse id="tail" cx="1" cy="1" rx="1" ry="1"/>') })));
    expect(unknown.map((f) => f.detail).join()).toContain('"tail" is not a known part');
  });

  it('fails mouth poses whose path structure differs', () => {
    const f = svgArt.run(fixture(inSync({ 'design/svg/mascots/cremi.svg': mascot('<path id="mouthOpen" d="M1 1c1 1 2 2 4 0z"/>') })));
    expect(rulesOf(f)).toContain('svg-art/mouth-structure');
  });

  it('fails an icon that sets its own stroke width or colour', () => {
    const own = icon('M1 1', 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"');
    expect(rulesOf(svgArt.run(fixture(inSync({ 'design/svg/icons/x.svg': own }))))).toContain('svg-art/icon-style');
    const child = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1" stroke="#000000"/></svg>';
    expect(rulesOf(svgArt.run(fixture(inSync({ 'design/svg/icons/x.svg': child }))))).toContain('svg-art/icon-style');
  });

  it('fails a colour that is not a token', () => {
    const f = svgArt.run(fixture(inSync({ 'design/svg/mascots/cremi.svg': mascot().replace('#17241B', '#123456') })));
    expect(rulesOf(f)).toContain('svg-art/unknown-colour');
    expect(message(svgArt, f.find((x) => x.rule === 'svg-art/unknown-colour')!)).toContain('Why:');
  });

  it('fails a colour token named for its hex', () => {
    const named = JSON.stringify({ color: { mascot: { ink: '#17241B', blush: '#FF9E9E' }, scene: { h112233: '#112233', wall: '#445566' } } });
    const f = svgArt.run(fixture({ ...inSync({}), [TOKENS]: named }));
    expect(rulesOf(f)).toEqual(['svg-art/token-name']);
    expect(f[0]?.detail).toContain('color.scene.h112233');
    expect(message(svgArt, f[0]!)).toContain('Why:');
  });
});

describe('a board that is built and still in the reference (R66)', () => {
  const board = (html = '') => ({ 'design/reference/Welcome.dc.html': html });

  it('passes while the screen is not built', () => {
    expect(referenceBuilt.run(fixture(board()))).toEqual([]);
  });

  it('fails once a screen of the same name is built in packages/ui or apps/mobile', () => {
    const inUi = referenceBuilt.run(fixture({ ...board(), 'packages/ui/src/templates/Welcome.tsx': 'export const Welcome = 1;' }));
    expect(rulesOf(inUi)).toEqual(['reference-built/still-in-reference']);
    const inApp = referenceBuilt.run(fixture({ ...board(), 'apps/mobile/src/screens/WelcomeScreen.tsx': 'export const WelcomeScreen = 1;' }));
    expect(rulesOf(inApp)).toEqual(['reference-built/still-in-reference']);
    expect(message(referenceBuilt, inApp[0]!)).toContain('Delete the board');
  });

  it('does not count tests, stories or generated art as built', () => {
    expect(referenceBuilt.run(fixture({ ...board(), 'packages/ui/src/templates/Welcome.test.tsx': '', 'packages/ui/src/templates/Welcome.stories.tsx': '' }))).toEqual([]);
    expect(referenceBuilt.run(fixture({ 'design/reference/Settings.dc.html': '', 'packages/ui/src/icons/generated/Settings.tsx': '// GENERATED from design/svg/icons/settings.svg by tools/build-svg.ts (R62).\n' }))).toEqual([]);
  });

  it('keeps a design-system board until every specimen on it is built', () => {
    const html = '<span class="ds-name">button.primary</span><span class="ds-name">input.text--rest</span>';
    const files = { 'design/reference/DS-Atoms.dc.html': html, 'packages/ui/src/atoms/Button.tsx': '' };
    expect(referenceBuilt.run(fixture(files))).toEqual([]);
    const all = referenceBuilt.run(fixture({ ...files, 'packages/ui/src/atoms/TextField.tsx': '' }));
    expect(rulesOf(all)).toEqual(['reference-built/still-in-reference']);
  });

  it('leaves the option boards of the design tasks alone', () => {
    expect(referenceBuilt.run(fixture({ 'design/reference/D1-OptionA.dc.html': '', 'packages/ui/src/atoms/D1-OptionA.tsx': '' }))).toEqual([]);
  });
});

describe('design levels (R60)', () => {
  const run = (files: Record<string, string>) => importLayers.run(fixture(files));

  it('fails an atom reaching an organism through a foundation folder', () => {
    const f = run({
      'packages/ui/src/atoms/A.tsx': "import { P } from '../platform/p.tsx'; export { P };",
      'packages/ui/src/platform/p.tsx': "import { O } from '../organisms/O.tsx'; export { O };",
      'packages/ui/src/organisms/O.tsx': 'export const O = 1;',
    });
    expect(f.map((x) => x.rule)).toContain('import-layers/design-levels');
    expect(f.find((x) => x.rule === 'import-layers/design-levels')?.file).toBe('packages/ui/src/platform/p.tsx');
  });

  it('lets a foundation reach only tokens', () => {
    const f = run({
      'packages/ui/src/icons/I.tsx': "import { A } from '../atoms/A.tsx'; export { A };",
      'packages/ui/src/atoms/A.tsx': 'export const A = 1;',
    });
    expect(rulesOf(f)).toContain('import-layers/design-levels');
  });

  it('fails a folder that is not in the table', () => {
    const f = run({ 'packages/ui/src/helpers/h.ts': 'export const h = 1;' });
    expect(rulesOf(f)).toEqual(['import-layers/unknown-ui-folder']);
    expect(message(importLayers, f[0]!)).toContain('Why:');
    expect(message(importLayers, f[0]!)).toContain('Fix:');
  });

  it('fails a file importing its own package index, by path or by name', () => {
    const byPath = run({ 'packages/ui/src/index.ts': 'export const x = 1;', 'packages/ui/src/molecules/M.tsx': "import { x } from '../index.ts'; export { x };" });
    expect(rulesOf(byPath)).toContain('import-layers/no-self-barrel');
    const byPathFinding = byPath.find((x) => x.rule === 'import-layers/no-self-barrel')!;
    expect(message(importLayers, byPathFinding)).toContain('Why:');
    expect(message(importLayers, byPathFinding)).toContain('Fix:');
    const byName = run({ 'packages/ui/src/index.ts': 'export const x = 1;', 'packages/ui/src/molecules/M.tsx': "import { x } from '@grocs/ui'; export { x };" });
    expect(rulesOf(byName)).toContain('import-layers/no-self-barrel');
  });

  it('lets another package use the index', () => {
    expect(run({ 'packages/ui/src/index.ts': 'export const x = 1;', 'apps/mobile/src/a.ts': "import { x } from '@grocs/ui'; export { x };" })).toEqual([]);
  });
});

describe('interactive states (R61)', () => {
  const all = ['rest', 'pressed', 'focus', 'disabled'];

  it('wants rest, pressed, focus and disabled on anything pressable, typeable or with a role', () => {
    expect(missingInteractiveStates('<Pressable onPress={f} />', ['rest'])).toEqual(['pressed', 'focus', 'disabled']);
    expect(missingInteractiveStates('<TextInput />', ['rest', 'focus'])).toEqual(['pressed', 'disabled']);
    expect(missingInteractiveStates('<View role="checkbox" />', all)).toEqual([]);
  });

  it('also wants loading and error where the component can be in them', () => {
    expect(missingInteractiveStates('<Pressable /> loading?: boolean;', all)).toEqual(['loading']);
    expect(missingInteractiveStates('<TextInput /> errorMessage?: string;', all)).toEqual(['error']);
    expect(missingInteractiveStates('<TextInput /> errorMessage?: string;', [...all, 'invalid'])).toEqual([]);
  });

  it('leaves a component that is not interactive alone', () => {
    expect(missingInteractiveStates('<Text>hello</Text>', ['rest'])).toEqual([]);
  });

  it('leaves an ARIA landmark role alone: it groups content, with no pressed, focus or disabled look of its own', () => {
    expect(missingInteractiveStates('<View role="navigation" aria-label="Sections and meals" />', ['rest'])).toEqual([]);
  });

  it('fails a declared list that leaves one out, and names the state', () => {
    const f = storyCoverage.run(
      fixture({
        'packages/ui/src/atoms/Tap.tsx': "export const TAP_STATES = ['rest', 'pressed'] as const; export const Tap = () => <Pressable />;",
        'packages/ui/src/atoms/Tap.stories.tsx': 'export const Rest = {}; export const Pressed = {};',
      }),
    );
    expect(f.filter((x) => x.rule === 'story-coverage/interactive-states').map((x) => x.detail)).toEqual([
      expect.stringContaining('"focus"'),
      expect.stringContaining('"disabled"'),
    ]);
    expect(message(storyCoverage, f[0]!)).toContain('R61');
  });
});

describe('one component library (R38)', () => {
  it('passes an app that depends on @grocs/ui', () => {
    expect(uiLibrary.run(fixture({ 'apps/mobile/package.json': '{"dependencies":{"@grocs/ui":"workspace:*"}}' }))).toEqual([]);
  });

  it('fails an app that does not', () => {
    expect(rulesOf(uiLibrary.run(fixture({ 'apps/mobile/package.json': '{"dependencies":{}}' })))).toEqual(['ui-library/app-uses-ui-package']);
  });

  it('exempts apps/functions, which has no UI at all (R26)', () => {
    expect(uiLibrary.run(fixture({ 'apps/functions/package.json': '{"dependencies":{}}' }))).toEqual([]);
  });

  it('fails a design level folder outside packages/ui', () => {
    const f = uiLibrary.run(fixture({ 'apps/mobile/package.json': '{"dependencies":{"@grocs/ui":"1"}}', 'apps/mobile/src/atoms/Button.tsx': 'export const B = 1;' }));
    expect(rulesOf(f)).toEqual(['ui-library/no-app-design-levels']);
    expect(message(uiLibrary, f[0]!)).toContain('Why:');
  });
});

describe('raw design values (R39)', () => {
  it('flags numbers and strings that belong to tokens, in styles and in JSX props', () => {
    const hits = findRawValues(
      'a.tsx',
      "const s = { fontFamily: 'Nunito', fontWeight: '700', animationDuration: 300, borderTopWidth: 3, backgroundColor: 'white' };\nconst x = <Svg width={24} size={20} height={tokens.size.icon} />;",
    );
    expect(hits.map((h) => h.text)).toEqual([
      "fontFamily: 'Nunito'",
      "fontWeight: '700'",
      'animationDuration: 300',
      'borderTopWidth: 3',
      'colour white',
      'width: 24',
      'size: 20',
    ]);
  });

  it('lets generated art keep its geometry but not a colour', () => {
    const art = '<Svg><Rect width={160} height={170} rx={5} fill="#FFFFFF" /></Svg>;';
    expect(findRawValues('packages/ui/src/mascots/art/A.tsx', art).map((h) => h.text)).toEqual(['colour #FFFFFF']);
  });

  it('flags a raw value in a story too', () => {
    const f = designTokens.run(fixture({ 'packages/ui/src/icons/Icons.stories.tsx': 'export const s = { width: 88 };' }));
    expect(rulesOf(f)).toEqual(['design-tokens/raw-value']);
  });
});

describe('token references', () => {
  it('replaces {group.name} with the token it names, once', () => {
    expect(resolveReferences({ color: { a: '#fff' }, shadow: { lip: [{ color: '{color.a}', y: 6 }] } })).toEqual({ color: { a: '#fff' }, shadow: { lip: [{ color: '#fff', y: 6 }] } });
  });

  it('fails a reference that names nothing, naming it', () => {
    expect(() => resolveReferences({ shadow: { x: '{color.missing}' } })).toThrow('{color.missing}');
  });
});
