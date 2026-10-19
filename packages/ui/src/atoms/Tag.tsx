import { StyleSheet, Text, View } from 'react-native';
import { icons } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** tag.status, tag.neutral, tag.new, tag.sync and tag.date; a tag is only ever read, so each state is a kind. */
export const TAG_STATES = ['status', 'neutral', 'new', 'sync', 'date'] as const;
export type TagKind = (typeof TAG_STATES)[number];

export interface TagProps {
  label: string;
  kind?: TagKind;
}

const look: Record<TagKind, { fill: string; ink: string }> = {
  status: { fill: tokens.color.positiveTint, ink: tokens.color.forest },
  neutral: { fill: tokens.color.tagNeutral, ink: tokens.color.tagNeutralInk },
  new: { fill: tokens.color.chartreuse, ink: tokens.color.ink },
  sync: { fill: tokens.color.tagNeutral, ink: tokens.color.tagNeutralInk },
  date: { fill: tokens.color.surfaceTint, ink: tokens.color.inkOnTint },
};

/** A short fact about a row or a day: its status, that it is new, that it waits to send, or a date. */
export function Tag({ label, kind = 'status' }: TagProps) {
  const { fill, ink } = look[kind];
  const Clock = icons.clock;
  return (
    <View style={[styles.pill, { backgroundColor: fill }]}>
      {kind === 'sync' ? <Clock color={ink} size={tokens.size.iconTag} /> : null}
      <Text style={[styles.text, kind === 'date' ? styles.date : styles.small, { color: ink }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[4],
    paddingHorizontal: tokens.space[10],
    paddingVertical: tokens.space[4],
    borderRadius: tokens.radius.pill,
  },
  text: { ...fontFace('body', tokens.font.weight.heavy) },
  small: { fontSize: tokens.font.size.micro, lineHeight: tokens.font.lineHeight.micro },
  date: { fontSize: tokens.font.size.small, lineHeight: tokens.font.lineHeight.small },
});
