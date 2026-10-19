import { StyleSheet, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';

/** meter--empty, --part and --full; a meter is only ever read, so each state is how full it is. */
export const METER_STATES = ['empty', 'part', 'full'] as const;

export interface MeterProps {
  /** How much is done, from 0 to 1. */
  fraction: number;
  /** What a screen reader says, such as "Items in the cart". */
  label: string;
}

/** A thin bar showing how much of something is done. It fills the width it is given. */
export function Meter({ fraction, label }: MeterProps) {
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    height: tokens.size.meter,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.lineSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: tokens.radius.pill, backgroundColor: tokens.color.forest },
});
