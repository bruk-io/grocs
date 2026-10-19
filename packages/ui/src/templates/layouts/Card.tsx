import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { tokens } from '../../tokens/tokens.ts';

/** A white card that groups one setting or fact on a task screen. */
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.space[12],
    padding: tokens.space[18],
    borderRadius: tokens.radius[24],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.lineSoft,
    backgroundColor: tokens.color.surfaceCard,
  },
});
