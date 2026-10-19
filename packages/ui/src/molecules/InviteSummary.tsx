import { StyleSheet, Text as NativeText, View } from 'react-native';
import { Avatar } from '../atoms/Avatar.tsx';
import { Text } from '../atoms/Text.tsx';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';

/** An invite summary is only ever read: one state. */
export const INVITESUMMARY_STATES = ['rest'] as const;

export interface InviteSummaryProps {
  /** Who sent the invite. */
  inviter: string;
  /** The name of the kitchen they are inviting to. */
  kitchen: string;
  /** What joining means, in a sentence or two. */
  description: string;
}

/** The inviter and what they invite you to, on the Join screen (avatar 64, text.heading, text.body). */
export function InviteSummary({ inviter, kitchen, description }: InviteSummaryProps) {
  return (
    <View style={styles.card}>
      <Avatar name={inviter} size="xl" />
      <View style={styles.heading}>
        <Text variant="heading">{`${inviter} invited you to`}</Text>
        <Text variant="heading">{kitchen}</Text>
      </View>
      <NativeText style={styles.description}>{description}</NativeText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: tokens.space[12],
    paddingVertical: tokens.space[24],
    paddingHorizontal: tokens.space[20],
    borderRadius: tokens.radius[24],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.lineSoft,
    backgroundColor: tokens.color.surfaceCard,
  },
  heading: { alignItems: 'center' },
  description: {
    textAlign: 'center',
    color: tokens.color.inkMuted,
    ...fontFace('body', tokens.font.weight.medium),
    fontSize: tokens.font.size.body,
    lineHeight: tokens.font.lineHeight.body,
  },
});
