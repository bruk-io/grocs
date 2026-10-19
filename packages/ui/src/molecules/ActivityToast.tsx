import { StyleSheet, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** A toast is only ever read: one state. The way it lands from above and leaves after about 4 seconds is the screen's. */
export const ACTIVITYTOAST_STATES = ['rest'] as const;

export interface ActivityToastProps {
  /** Who did it; their initial shows on a chartreuse avatar. */
  name: string;
  /** What happened, such as "Shazya added Oat milk · just now". */
  message: string;
}

/** A short line about what the other person just did (avatar.s on chartreuse, text.small on ink). */
export function ActivityToast({ name, message }: ActivityToastProps) {
  return (
    <View aria-live="polite" style={styles.pill}>
      <Avatar name={name} size="s" tone="chartreuse" />
      <Text variant="small" tone="onBrand">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[8],
    paddingVertical: tokens.space[6],
    paddingLeft: tokens.space[6],
    paddingRight: tokens.space[14],
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.ink,
  },
});
