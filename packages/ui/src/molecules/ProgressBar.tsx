import { StyleSheet, View } from 'react-native';
import { Meter } from '../atoms/Meter.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** progress.bar with nothing, some or everything in the cart; a progress bar is only ever read, so each state is how full it is. */
export const PROGRESSBAR_STATES = ['empty', 'part', 'full'] as const;

export interface ProgressBarProps {
  /** Items still to buy. Counted from the list, never typed. */
  toGo: number;
  /** Items in the cart. */
  inCart: number;
}

/** How far the shop has got: the counts on top, the meter under them (text.small x 2, meter). */
export function ProgressBar({ toGo, inCart }: ProgressBarProps) {
  const total = toGo + inCart;
  return (
    <View style={styles.wrap}>
      <View style={styles.counts}>
        <Text variant="muted">{`${toGo} to go`}</Text>
        <Text variant="muted">{`${inCart} in the cart`}</Text>
      </View>
      <Meter fraction={total === 0 ? 0 : inCart / total} label="Shopping progress" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: tokens.space[6] },
  counts: { flexDirection: 'row', justifyContent: 'space-between' },
});
