import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { InviteSummary } from '../molecules/InviteSummary.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/**
 * The invite offered on opening the app (TASK-78): for someone with no kitchen (rest), for someone
 * who would leave their own (leaving), while joining, and when the join did not go through (error).
 */
export const INVITEJOINTEMPLATE_STATES = ['rest', 'leaving', 'joining', 'error'] as const;

export interface InviteJoinTemplateProps {
  /** Who sent the invite. */
  inviter: string;
  /** The name of the kitchen they invite you to. */
  kitchen: string;
  /** What joining means. */
  description: string;
  /** The kitchen the person is in now, which joining leaves; left out when they have none. */
  leaving?: string;
  onJoin?: () => void;
  /** Puts the invite aside for now; it is offered again next time. */
  onNotNow?: () => void;
  joining?: boolean;
  /** Why the last try did not work. */
  errorMessage?: string;
}

/** template.task filled for an invite: header.sub with the wordmark, invite.summary, Join and Not now, no action bar. */
export function InviteJoinTemplate({ inviter, kitchen, description, leaving, onJoin, onNotNow, joining = false, errorMessage }: InviteJoinTemplateProps) {
  return (
    <TaskLayout header={<SubHeader lead={{ kind: 'wordmark' }} tag="Invite" title="You're invited" mascot="chanty" />}>
      <InviteSummary inviter={inviter} kitchen={kitchen} description={description} />
      {leaving !== undefined ? (
        <Text variant="body" tone="muted">
          {`Joining takes you out of ${leaving}. Its list and meals stay there.`}
        </Text>
      ) : null}
      {errorMessage !== undefined ? (
        // Announced when it appears, without moving focus off the buttons.
        <View aria-live="polite">
          <Text variant="body" tone="error">
            {errorMessage}
          </Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button variant="primary" stretch label={`Join ${kitchen}`} loading={joining} loadingLabel="Joining" disabled={!onJoin} {...(onJoin ? { onPress: onJoin } : {})} />
        <Button variant="text" stretch label="Not now" disabled={joining || !onNotNow} {...(onNotNow ? { onPress: onNotNow } : {})} />
      </View>
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  actions: { gap: tokens.space[8] },
});
