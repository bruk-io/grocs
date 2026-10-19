import { StyleSheet, Text, View } from 'react-native';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** tile.day: a day of the week over its date number. Only ever read, so one state. */
export const TILE_STATES = ['rest'] as const;

export interface TileProps {
  /** Short weekday as it should show, such as "THU". */
  weekday: string;
  /** Day of the month. */
  day: number;
}

export function Tile({ weekday, day }: TileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.weekday}>{weekday.toUpperCase()}</Text>
      <Text style={styles.day}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: tokens.size.dayTile,
    minHeight: tokens.size.row,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius[16],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surfaceCard,
  },
  weekday: {
    color: tokens.color.inkMuted,
    ...fontFace('body', tokens.font.weight.heavy),
    fontSize: tokens.font.size.micro,
    lineHeight: tokens.font.lineHeight.micro,
    letterSpacing: tokens.font.tracking.caps * tokens.font.size.micro,
  },
  day: {
    color: tokens.color.ink,
    ...fontFace('display', tokens.font.weight.medium),
    fontSize: tokens.font.size.heading,
    lineHeight: tokens.font.lineHeight.label,
  },
});
