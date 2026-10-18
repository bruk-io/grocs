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
  color: tokens.color.text,
  fontSize: tokens.font.size.body,
  lineHeight: tokens.font.lineHeight.body,
  fontWeight: tokens.font.weight.regular,
} as const;

const styles = StyleSheet.create({
  body: base,
  title: {
    ...base,
    fontSize: tokens.font.size.title,
    lineHeight: tokens.font.lineHeight.title,
    fontWeight: tokens.font.weight.bold,
  },
  caption: { ...base, fontSize: tokens.font.size.caption, lineHeight: tokens.font.lineHeight.caption },
  muted: {
    ...base,
    color: tokens.color.textMuted,
    fontSize: tokens.font.size.caption,
    lineHeight: tokens.font.lineHeight.caption,
  },
  struck: { ...base, color: tokens.color.textMuted, textDecorationLine: 'line-through' },
});
