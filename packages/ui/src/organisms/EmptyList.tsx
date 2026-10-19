import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { Mascot } from '../molecules/Mascot.tsx';
import { tokens } from '../tokens/tokens.ts';

/** list.empty: a list with nothing on it yet. */
export const EMPTYLIST_STATES = ['rest'] as const;

export interface EmptyListProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** What the list says when it is empty, with the way to fill it (mascot, text.heading, text.body, button.primary). */
export function EmptyList({ title = 'Nothing on the list yet', message = 'Add an item, or plan a meal and its ingredients will turn up here.', actionLabel = 'Add an item', onAction }: EmptyListProps) {
  return (
    <View style={styles.box}>
      <Mascot name="cremi" size={tokens.size.avatarXl} />
      <Text variant="heading">{title}</Text>
      <Text variant="body" tone="muted" align="center">
        {message}
      </Text>
      <View style={styles.action}>
        <Button label={actionLabel} {...(onAction ? { onPress: onAction } : {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: tokens.space[12],
    paddingVertical: tokens.space[24],
    paddingHorizontal: tokens.space[20],
    borderRadius: tokens.radius[24],
    borderWidth: tokens.size.lineW,
    borderStyle: 'dashed',
    borderColor: tokens.color.lineDashed,
  },
  action: { alignSelf: 'stretch' },
});
