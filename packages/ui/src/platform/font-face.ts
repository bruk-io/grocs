import { Platform } from 'react-native';
import { tokens } from '../tokens/tokens.ts';

export type FaceKind = 'display' | 'body';
type Weight = (typeof tokens.font.weight)[keyof typeof tokens.font.weight];

/**
 * The font files the phones must register, by the family name each one is registered under. A phone
 * cannot pick a weight inside one family (Android ignores fontWeight for a custom font), so every
 * weight is its own family; the names are the ones the @expo-google-fonts packages export, so the app
 * registers them by importing those (apps/mobile/app/_layout.tsx). Weights the design does not use
 * are absent.
 */
export const NATIVE_FACES = {
  display: { '600': 'Fredoka_600SemiBold', '700': 'Fredoka_700Bold' },
  body: { '600': 'Nunito_600SemiBold', '700': 'Nunito_700Bold', '800': 'Nunito_800ExtraBold' },
} as const satisfies Record<FaceKind, Partial<Record<Weight, string>>>;

/**
 * The text style for a typeface at a weight. On the web (Storybook, react-native-web) the bundled CSS
 * family and a font weight pick the file; on the phones the per-weight family name does.
 */
export function fontFace(kind: FaceKind, weight: Weight): { fontFamily: string; fontWeight?: Weight } {
  if (Platform.OS === 'web') return { fontFamily: tokens.font.family[kind], fontWeight: weight };
  const names: Partial<Record<Weight, string>> = NATIVE_FACES[kind];
  return { fontFamily: names[weight] ?? tokens.font.family[kind] };
}
