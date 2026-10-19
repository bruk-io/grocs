import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The text atoms name a font file per weight on the phones (NATIVE_FACES). A name the root layout does not
// register falls back silently to the system font, so the layout must register every one of them.
describe('root layout fonts', () => {
  const faces = readFileSync(new URL('../../../packages/ui/src/platform/font-face.ts', import.meta.url), 'utf8').match(/\b(?:Fredoka|Nunito)_\d{3}\w+/g) ?? [];
  const layout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');
  const registered = /const FONTS = \{([^}]*)\}/.exec(layout)?.[1] ?? '';
  const imported = [...layout.matchAll(/import \{([^}]*)\} from '@expo-google-fonts\/(?:fredoka|nunito)'/g)].map((m) => m[1]).join(',');

  it('imports and registers every face the text atoms ask for', () => {
    expect(faces.length, 'the faces named in font-face.ts').toBeGreaterThan(0);
    for (const name of new Set(faces)) {
      expect(imported, `${name} is imported from the font package`).toContain(name);
      expect(registered, `${name} is registered with useFonts`).toContain(name);
    }
  });

  it('waits for the fonts before drawing the app', () => {
    expect(layout).toContain('useFonts(FONTS)');
    expect(layout).toContain('if (!loaded && !failed) return null');
  });
});
