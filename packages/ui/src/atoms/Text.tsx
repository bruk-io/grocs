import { StyleSheet, Text as NativeText } from 'react-native';
import type { TextProps as NativeTextProps } from 'react-native';
import { tokens } from '../tokens/tokens.ts';

/** The variants of Text; each has a story (R63). */
export const TEXT_STATES = ['body', 'title', 'caption', 'muted', 'struck'] as const;
export type TextVariant = (typeof TEXT_STATES)[number];

export interface TextProps extends Omit<NativeTextProps, 'style'> {
  variant?: TextVariant;
}

export function Text({ variant = 'body', ...rest }: TextProps) {
  return <NativeText {...rest} style={styles[variant]} />;
}

const base = {
  color: tokens.color.ink,
  fontFamily: tokens.font.family.body,
  fontSize: tokens.font.size.body,
  lineHeight: tokens.font.lineHeight.body,
  fontWeight: tokens.font.weight.medium,
} as const;

const styles = StyleSheet.create({
  body: base,
  title: {
    ...base,
    fontFamily: tokens.font.family.display,
    fontSize: tokens.font.size.heading,
    lineHeight: tokens.font.lineHeight.heading,
    fontWeight: tokens.font.weight.bold,
  },
  caption: { ...base, fontSize: tokens.font.size.small, lineHeight: tokens.font.lineHeight.small },
  muted: {
    ...base,
    color: tokens.color.inkMuted,
    fontSize: tokens.font.size.small,
    lineHeight: tokens.font.lineHeight.small,
  },
  struck: { ...base, color: tokens.color.doneInk, textDecorationLine: 'line-through' },
});
