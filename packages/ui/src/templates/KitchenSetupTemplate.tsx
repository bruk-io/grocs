import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import type { StatusRowProps } from '../molecules/StatusRow.tsx';
import { InviteCard } from '../organisms/InviteCard.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The Your kitchen screen: waiting for the partner, once they have joined, and and before there is an invite code (the card shows a hint and no Share link or Copy code). */
export const KITCHENSETUPTEMPLATE_STATES = ['rest', 'noInviteYet'] as const;

interface KitchenSetupTemplateBase {
  /** The Google account that is signed in. */
  email: string;
  kitchenName: string;
  onKitchenNameChange: (name: string) => void;
  onStart?: () => void;
  /** The kitchen is being made. */
  starting?: boolean;
  /**
   * Someone with an invite who signed in before opening it lands here, not on the join screen: this
   * offers the code entry instead of making a kitchen of their own (R3, TASK-56). Shown only before
   * the kitchen exists.
   */
  onOpenInvite?: () => void;
  /**
   * Signs out, for someone who signed in with the wrong account: setup has no Settings to do it from,
   * so without this they are stuck here (TASK-67).
   */
  onSignOut?: () => void;
}

/** The kitchen has an invite code and where it stands. Leave onShare or onCopy out and that button on the invite card is disabled. */
export interface KitchenSetupTemplateInviteProps extends KitchenSetupTemplateBase {
  inviteCode: string;
  inviteStatus?: StatusRowProps;
  onShare?: () => void;
  onCopy?: () => void;
}

/** Before Start planning there is no code: the card shows a hint and no Share link or Copy code, so no status or handlers are accepted. */
export interface KitchenSetupTemplateNoInviteProps extends KitchenSetupTemplateBase {
  inviteCode: null;
  inviteStatus?: never;
  onShare?: never;
  onCopy?: never;
}

export type KitchenSetupTemplateProps = KitchenSetupTemplateInviteProps | KitchenSetupTemplateNoInviteProps;

/** template.task filled for Your kitchen: header.sub, field.labelled, invite.card, action.bar. */
export function KitchenSetupTemplate({ email, kitchenName, onKitchenNameChange, inviteCode, inviteStatus, onShare, onCopy, onStart, starting = false, onOpenInvite, onSignOut }: KitchenSetupTemplateProps) {
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'line', text: `Signed in as ${email}` }} tag="Last step" title="Your kitchen" mascot="enoki" />}
      actionBar={<ActionBar label="Start planning" loading={starting} loadingLabel="Starting" {...(onStart ? { onPress: onStart } : {})} />}
      {...((inviteCode === null && onOpenInvite) || onSignOut
        ? {
            footer: (
              <View style={styles.footer}>
                {inviteCode === null && onOpenInvite ? (
                  <View style={styles.row}>
                    <Text variant="small" tone="muted">
                      Got an invite?
                    </Text>
                    <Button variant="text" size="s" label="Open it to join" disabled={starting} onPress={onOpenInvite} />
                  </View>
                ) : null}
                {onSignOut ? (
                  <View style={styles.row}>
                    <Text variant="small" tone="muted">
                      Not you?
                    </Text>
                    <Button variant="text" size="s" label="Sign out" disabled={starting} onPress={onSignOut} />
                  </View>
                ) : null}
              </View>
            ),
          }
        : {})}
    >
      <LabelledField label="Name your kitchen" value={kitchenName} onChangeText={onKitchenNameChange} disabled={starting} />
      {inviteCode === null ? (
        <InviteCard code={null} />
      ) : (
        <InviteCard code={inviteCode} {...(inviteStatus ? { status: inviteStatus } : {})} {...(onShare ? { onShare } : {})} {...(onCopy ? { onCopy } : {})} />
      )}
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  footer: { gap: tokens.space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
});
