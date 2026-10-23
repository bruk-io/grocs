import { useEffect, useRef } from 'react';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import type { TextFieldHandle } from '../atoms/TextField.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Join from an invite screen's typed code entry: a first attempt, a code that did not match, and while a code is being checked. */
export const INVITERETRYTEMPLATE_STATES = ['invalid', 'firstAttempt'] as const;

interface InviteRetryTemplateBase {
  code: string;
  onCodeChange: (code: string) => void;
  onCheck?: () => void;
  /** The new code is being checked. */
  checking?: boolean;
}

/** Someone who chose to join and is typing a code. Nobody's name is known yet and no code failed, so inviter, errorMessage and onBack are not accepted. */
export interface InviteRetryTemplateFirstProps extends InviteRetryTemplateBase {
  attempt: 'first';
  inviter?: never;
  errorMessage?: never;
  onBack?: never;
}

/** A code that did not match (the default). */
export interface InviteRetryTemplateRetryProps extends InviteRetryTemplateBase {
  attempt?: 'retry';
  /** Who sent the invite. */
  inviter: string;
  /** Why the code did not work. */
  errorMessage?: string;
  /** Goes back to the invite the person came from. */
  onBack?: () => void;
}

export type InviteRetryTemplateProps = InviteRetryTemplateFirstProps | InviteRetryTemplateRetryProps;

/** template.task filled for the invalid code: header.sub, field.labelled--error, button.primary, button.text. */
export function InviteRetryTemplate(props: InviteRetryTemplateProps) {
  const { code, onCodeChange, onCheck, checking = false } = props;
  const field = useRef<TextFieldHandle>(null);
  const wasChecking = useRef(checking);
  // Locking the field while a code is checked drops its focus (and a phone's keyboard); take it back when the check ends.
  useEffect(() => {
    if (wasChecking.current && !checking) field.current?.focus();
    wasChecking.current = checking;
  }, [checking]);
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'wordmark' }} tag="Invite code" title={props.attempt === 'first' ? 'Enter your invite code' : "Code didn't work"} mascot="chanty" />}
      {...(props.attempt === 'first'
        ? {}
        : {
            footer: (
              <Text variant="small" tone="muted">
                Not expecting this? You can ignore it.
              </Text>
            ),
          })}
    >
      <LabelledField
        label={props.attempt === 'first' ? 'Invite code' : `Invite code from ${props.inviter}`}
        {...(props.attempt === 'first' ? { placeholder: 'MOREL-42' } : {})}
        value={code}
        onChangeText={onCodeChange}
        display
        inputRef={field}
        disabled={checking}
        {...(props.attempt !== 'first' && props.errorMessage ? { errorMessage: props.errorMessage } : {})}
        {...(onCheck ? { onSubmit: onCheck } : {})}
      />
      <Button stretch label="Check code" loading={checking} loadingLabel="Checking" {...(onCheck ? { onPress: onCheck } : {})} />
      {props.attempt === 'first' ? null : <Button variant="text" stretch label="Back to my invite" {...(props.onBack ? { onPress: props.onBack } : {})} />}
    </TaskLayout>
  );
}
