import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Join from an invite screen after a code that did not match: the error, and while the new code is being checked. */
export const INVITERETRYTEMPLATE_STATES = ['invalid'] as const;

export interface InviteRetryTemplateProps {
  /** Who sent the invite. */
  inviter: string;
  code: string;
  onCodeChange: (code: string) => void;
  /** Why the code did not work. */
  errorMessage?: string;
  onCheck?: () => void;
  /** The new code is being checked. */
  checking?: boolean;
  /** Goes back to the invite the person came from. */
  onBack?: () => void;
}

/** template.task filled for the invalid code: header.sub, field.labelled--error, button.primary, button.text. */
export function InviteRetryTemplate({ inviter, code, onCodeChange, errorMessage, onCheck, checking = false, onBack }: InviteRetryTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'wordmark' }} tag="Invite code" title="Code didn't work" mascot="chanty" />}
      footer={
        <Text variant="small" tone="muted">
          Not expecting this? You can ignore it.
        </Text>
      }
    >
      <LabelledField
        label={`Invite code from ${inviter}`}
        value={code}
        onChangeText={onCodeChange}
        display
        disabled={checking}
        {...(errorMessage ? { errorMessage } : {})}
        {...(onCheck ? { onSubmit: onCheck } : {})}
      />
      <Button stretch label="Check code" loading={checking} loadingLabel="Checking" {...(onCheck ? { onPress: onCheck } : {})} />
      <Button variant="text" stretch label="Back to my invite" {...(onBack ? { onPress: onBack } : {})} />
    </TaskLayout>
  );
}
