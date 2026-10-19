import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** A week navigator is always usable: one state. */
export const WEEKNAV_STATES = ['rest'] as const;

export interface WeekNavProps {
  /** The week as it should read, such as "Oct 19 - 25". */
  label: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

/** Steps the plan one week back or forward (button.icon--ghost x 2, text.body). */
export function WeekNav({ label, onPrevious, onNext }: WeekNavProps) {
  return (
    <View style={styles.row}>
      <Button variant="iconGhost" icon="back" label="Previous week" {...(onPrevious ? { onPress: onPrevious } : {})} />
      <Text variant="label">
        {label}
      </Text>
      <Button variant="iconGhost" icon="forward" label="Next week" {...(onNext ? { onPress: onNext } : {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: tokens.space[4] },
});
