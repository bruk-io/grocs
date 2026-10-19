import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** count.neutral and count.accent; a count is only ever read, so each state is a tone. */
export const COUNT_STATES = ['neutral', 'accent'] as const;

export interface CountProps {
  value: number;
  /** Accent marks the number that wants attention, such as what is still to buy. */
  tone?: 'neutral' | 'accent';
}

export function Count({ value, tone = 'neutral' }: CountProps) {
  return (
    <View style={[styles.base, tone === 'accent' ? styles.accent : styles.neutral]}>
      <Text style={[styles.text, { color: tone === 'accent' ? tokens.color.ink : tokens.color.inkMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.space[6],
    borderRadius: tokens.radius.pill,
  },
  neutral: {
    minWidth: tokens.size.count,
    height: tokens.size.count,
    backgroundColor: tokens.color.surfaceCard,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
  },
  accent: { minWidth: tokens.size.badge, height: tokens.size.badge, backgroundColor: tokens.color.chartreuse },
  text: {
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.caption,
    lineHeight: tokens.font.lineHeight.caption,
  },
});
