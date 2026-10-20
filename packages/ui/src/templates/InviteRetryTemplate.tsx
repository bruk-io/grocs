import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Join from an invite screen's typed code entry: a first attempt, a code that did not match, and while a code is being checked. */
export const INVITERETRYTEMPLATE_STATES = ['invalid', 'firstAttempt'] as const;

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
  /** 'first' is the neutral entry before any code was tried (no error title, no way back); 'retry' (the default) follows a code that did not match. */
  attempt?: 'first' | 'retry';
  /** Goes back to the invite the person came from. Only the retry state shows it. */
  onBack?: () => void;
}

/** template.task filled for the invalid code: header.sub, field.labelled--error, button.primary, button.text. */
export function InviteRetryTemplate({ inviter, code, onCodeChange, errorMessage, onCheck, checking = false, attempt = 'retry', onBack }: InviteRetryTemplateProps) {
  const first = attempt === 'first';
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'wordmark' }} tag="Invite code" title={first ? 'Enter your invite code' : "Code didn't work"} mascot="chanty" />}
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
      {first ? null : <Button variant="text" stretch label="Back to my invite" {...(onBack ? { onPress: onBack } : {})} />}
    </TaskLayout>
  );
}
