import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { InviteSummary } from '../molecules/InviteSummary.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Join from an invite screen: ready, and while Google's sheet is open. */
export const INVITEJOINTEMPLATE_STATES = ['rest'] as const;

export interface InviteJoinTemplateProps {
  /** Who sent the invite. */
  inviter: string;
  /** The name of the kitchen they invite you to. */
  kitchen: string;
  /** What joining means. */
  description: string;
  onJoin?: () => void;
  /** Google's sheet is open. */
  joining?: boolean;
}

/** template.task filled for Join: header.sub with the wordmark, invite.summary and one Google button, no action bar. */
export function InviteJoinTemplate({ inviter, kitchen, description, onJoin, joining = false }: InviteJoinTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'wordmark' }} tag="Invite" title="You're invited" mascot="chanty" />}
      footer={
        <Text variant="small" tone="muted">
          Not expecting this? You can ignore it.
        </Text>
      }
    >
      <InviteSummary inviter={inviter} kitchen={kitchen} description={description} />
      <Button variant="secondary" stretch label="Join with Google" loading={joining} loadingLabel="Joining" {...(onJoin ? { onPress: onJoin } : {})} />
    </TaskLayout>
  );
}
