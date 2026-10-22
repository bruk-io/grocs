import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** filter.empty: a meal with nothing left on the list (rest is the only state). */
export const FILTEREMPTY_STATES = ['rest'] as const;

export interface FilterEmptyProps {
  /** The meal the list is narrowed to. */
  mealName: string;
}

/** What the list says when the chosen meal has no items to buy (text.body in a dashed box). */
export function FilterEmpty({ mealName }: FilterEmptyProps) {
  return (
    <View style={styles.box}>
      <Text variant="body" align="center">{`Nothing on the list for ${mealName} yet.`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    paddingVertical: tokens.space[24],
    paddingHorizontal: tokens.space[16],
    borderRadius: tokens.radius[20],
    borderWidth: tokens.size.lineW,
    borderStyle: 'dashed',
    borderColor: tokens.color.lineDashed,
  },
});
