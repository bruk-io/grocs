import { StyleSheet, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** status.row--waiting and --joined; a status row is only ever read, so each state is how far the invite has got. */
export const STATUSROW_STATES = ['waiting', 'joined'] as const;

export interface StatusRowProps {
  kind?: (typeof STATUSROW_STATES)[number];
  message: string;
  /** Who joined; shown as a large avatar on a joined row. */
  name?: string;
}

/** One line on the invite card: a dot while waiting, the person's avatar once they joined (dot or avatar.l, text.body). */
export function StatusRow({ kind = 'waiting', message, name }: StatusRowProps) {
  const joined = kind === 'joined';
  return (
    <View aria-live="polite" style={[styles.row, joined ? styles.joined : styles.waiting]}>
      {joined && name ? <Avatar name={name} tone="chartreuse" /> : <View aria-hidden style={styles.dot} />}
      <View style={styles.message}>
        {joined ? (
          <Text variant="label" tone="forest">
            {message}
          </Text>
        ) : (
          <Text variant="body">{message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[12],
    paddingVertical: tokens.space[10],
    paddingHorizontal: tokens.space[12],
    borderRadius: tokens.radius[16],
  },
  waiting: { backgroundColor: tokens.color.surfaceDone },
  joined: { backgroundColor: tokens.color.positiveTint },
  dot: { width: tokens.size.dot, height: tokens.size.dot, marginHorizontal: tokens.space[6], borderRadius: tokens.radius.pill, backgroundColor: tokens.color.tomato },
  message: { flex: 1 },
});
