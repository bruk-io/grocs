import { StyleSheet, Text as NativeText } from 'react-native';
import type { TextProps as NativeTextProps } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/**
 * The variants of Text: one per type token on the board (text.display ... text.micro), plus three the
 * screens already use (title, muted, struck). Each has a story (R63).
 */
export const TEXT_STATES = ['display', 'titleL', 'titleM', 'heading', 'label', 'body', 'small', 'caption', 'micro', 'title', 'muted', 'struck'] as const;
export type TextVariant = (typeof TEXT_STATES)[number];

export interface TextProps extends Omit<NativeTextProps, 'style'> {
  variant?: TextVariant;
  /** Overrides the ink colour: an error message, a label on a dark fill, a brand-coloured title. */
  tone?: 'error' | 'forest' | 'onBrand';
}

export function Text({ variant = 'body', tone, ...rest }: TextProps) {
  return <NativeText {...rest} style={tone ? [styles[variant], tones[tone]] : styles[variant]} />;
}

const base = {
  color: tokens.color.ink,
  ...fontFace('body', tokens.font.weight.medium),
  fontSize: tokens.font.size.body,
  lineHeight: tokens.font.lineHeight.body,
} as const;

const small = { ...base, fontSize: tokens.font.size.small, lineHeight: tokens.font.lineHeight.small } as const;

const styles = StyleSheet.create({
  display: { ...base, ...fontFace('display', tokens.font.weight.bold), fontSize: tokens.font.size.display, lineHeight: tokens.font.lineHeight.display },
  titleL: { ...base, ...fontFace('display', tokens.font.weight.bold), fontSize: tokens.font.size.titleL, lineHeight: tokens.font.lineHeight.titleL },
  titleM: { ...base, ...fontFace('display', tokens.font.weight.bold), fontSize: tokens.font.size.titleM, lineHeight: tokens.font.lineHeight.titleM },
  heading: { ...base, ...fontFace('display', tokens.font.weight.medium), fontSize: tokens.font.size.heading, lineHeight: tokens.font.lineHeight.heading },
  label: { ...base, ...fontFace('body', tokens.font.weight.heavy), fontSize: tokens.font.size.label, lineHeight: tokens.font.lineHeight.label },
  body: base,
  small,
  caption: { ...base, ...fontFace('body', tokens.font.weight.heavy), fontSize: tokens.font.size.caption, lineHeight: tokens.font.lineHeight.caption },
  micro: { ...base, ...fontFace('body', tokens.font.weight.heavy), fontSize: tokens.font.size.micro, lineHeight: tokens.font.lineHeight.micro },
  // Screens built before the board: title is a bold heading, muted a quieter small, struck a ticked-off name.
  title: { ...base, ...fontFace('display', tokens.font.weight.bold), fontSize: tokens.font.size.heading, lineHeight: tokens.font.lineHeight.heading },
  muted: { ...small, color: tokens.color.inkMuted },
  struck: { ...base, color: tokens.color.doneInk, textDecorationLine: 'line-through' },
});

const tones = StyleSheet.create({
  error: { color: tokens.color.error },
  forest: { color: tokens.color.forest },
  onBrand: { color: tokens.color.onBrand },
});
