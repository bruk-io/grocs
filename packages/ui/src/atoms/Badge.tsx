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
    backgroundColor: tokens.color.mealAmber,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.space[10],
    paddingVertical: tokens.space[4],
    maxWidth: '100%',
  },
  text: {
    color: tokens.color.mealAmberInk,
    fontFamily: tokens.font.family.body,
    fontSize: tokens.font.size.micro,
    lineHeight: tokens.font.lineHeight.micro,
    fontWeight: tokens.font.weight.heavy,
  },
});
