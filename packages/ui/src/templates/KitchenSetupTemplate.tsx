import { LabelledField } from '../molecules/LabelledField.tsx';
import type { StatusRowProps } from '../molecules/StatusRow.tsx';
import { InviteCard } from '../organisms/InviteCard.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Your kitchen screen: waiting for the partner, and once they have joined. */
export const KITCHENSETUPTEMPLATE_STATES = ['rest'] as const;

export interface KitchenSetupTemplateProps {
  /** The Google account that is signed in. */
  email: string;
  kitchenName: string;
  onKitchenNameChange: (name: string) => void;
  /** The invite code and, once it is shared, where the invite stands. */
  inviteCode: string;
  inviteStatus?: StatusRowProps;
  onShare?: () => void;
  onCopy?: () => void;
  onStart?: () => void;
  /** The kitchen is being made. */
  starting?: boolean;
}

/** template.task filled for Your kitchen: header.sub, field.labelled, invite.card, action.bar. */
export function KitchenSetupTemplate({ email, kitchenName, onKitchenNameChange, inviteCode, inviteStatus, onShare, onCopy, onStart, starting = false }: KitchenSetupTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'line', text: `Signed in as ${email}` }} tag="Last step" title="Your kitchen" mascot="enoki" />}
      actionBar={<ActionBar label="Start planning" loading={starting} loadingLabel="Starting" {...(onStart ? { onPress: onStart } : {})} />}
    >
      <LabelledField label="Name your kitchen" value={kitchenName} onChangeText={onKitchenNameChange} disabled={starting} />
      <InviteCard code={inviteCode} {...(inviteStatus ? { status: inviteStatus } : {})} {...(onShare ? { onShare } : {})} {...(onCopy ? { onCopy } : {})} />
    </TaskLayout>
  );
}
