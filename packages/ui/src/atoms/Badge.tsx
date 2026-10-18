import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';

export const BADGE_STATES = ['rest'] as const;

/** A small label, such as the name of the meal an item is for. */
export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: tokens.color.badge,
    borderRadius: tokens.radius.round,
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[1],
    maxWidth: '100%',
  },
  text: {
    color: tokens.color.textOnBadge,
    fontSize: tokens.font.size.caption,
    lineHeight: tokens.font.lineHeight.caption,
    fontWeight: tokens.font.weight.bold,
  },
});
