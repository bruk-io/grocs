import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { InviteCode } from '../atoms/InviteCode.tsx';
import { Text } from '../atoms/Text.tsx';
import { StatusRow } from '../molecules/StatusRow.tsx';
import type { StatusRowProps } from '../molecules/StatusRow.tsx';
import { tokens } from '../tokens/tokens.ts';

/** invite.card: before it is shared, waiting for the partner to join, joined, and with nothing to share yet (both buttons disabled). */
export const INVITECARD_STATES = ['waiting', 'joined', 'unsent', 'unshareable'] as const;

export interface InviteCardProps {
  code: string;
  /** The line at the foot: waiting for them, or who joined. Left out before the invite is sent. */
  status?: StatusRowProps;
  /** A button whose handler is left out renders disabled, never dead. */
  onShare?: () => void;
  onCopy?: () => void;
}

/** Invites the partner: the code, the two ways to send it and where it stands (text.heading, invite.code, button x 2, status.row). */
export function InviteCard({ code, status, onShare, onCopy }: InviteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.words}>
        <Text variant="heading">Invite your partner</Text>
        <Text variant="body" tone="muted">
          They get the same plan and list, live on their phone.
        </Text>
      </View>
      <InviteCode code={code} />
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button stretch size="s" variant="primary" label="Share link" leadingIcon="share" disabled={!onShare} {...(onShare ? { onPress: onShare } : {})} />
        </View>
        <View style={styles.button}>
          <Button stretch size="s" variant="secondary" label="Copy code" disabled={!onCopy} {...(onCopy ? { onPress: onCopy } : {})} />
        </View>
      </View>
      {status ? <StatusRow {...status} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.space[14],
    padding: tokens.space[18],
    borderRadius: tokens.radius[24],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.lineSoft,
    backgroundColor: tokens.color.surfaceCard,
  },
  words: { gap: tokens.space[4] },
  buttons: { flexDirection: 'row', gap: tokens.space[8] },
  button: { flex: 1 },
});
