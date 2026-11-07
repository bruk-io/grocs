import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { LabelledField } from '../molecules/LabelledField.tsx';
import { InviteCard } from '../organisms/InviteCard.tsx';
import type { InviteCardProps } from '../organisms/InviteCard.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { ActionBar } from './layouts/ActionBar.tsx';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/**
 * The Your kitchen screen: before the kitchen is made (rest), once it is made and the partner's email
 * can be added (made), and once they are invited (invited).
 */
export const KITCHENSETUPTEMPLATE_STATES = ['rest', 'made', 'invited'] as const;

export interface KitchenSetupTemplateProps {
  /** The Google account that is signed in. */
  email: string;
  kitchenName: string;
  onKitchenNameChange: (name: string) => void;
  /** The invite card: noKitchen until the kitchen is made. */
  invite: InviteCardProps;
  onStart?: () => void;
  /** The kitchen is being made. */
  starting?: boolean;
  /**
   * Looks again for an invite to this email (TASK-78). Someone whose partner has not added them yet
   * lands here; once the partner has, this finds it without signing out. Shown only before the
   * kitchen is made.
   */
  onCheckInvites?: () => void;
  checkingInvites?: boolean;
  /**
   * Signs out, for someone who signed in with the wrong account: setup has no Settings to do it from,
   * so without this they are stuck here (TASK-67).
   */
  onSignOut?: () => void;
}

/** template.task filled for Your kitchen: header.sub, field.labelled, invite.card, action.bar. */
export function KitchenSetupTemplate({ email, kitchenName, onKitchenNameChange, invite, onStart, starting = false, onCheckInvites, checkingInvites = false, onSignOut }: KitchenSetupTemplateProps) {
  const beforeKitchen = invite.kind === 'noKitchen';
  return (
    <TaskLayout
      header={<SubHeader lead={{ kind: 'line', text: `Signed in as ${email}` }} tag="Last step" title="Your kitchen" mascot="enoki" />}
      actionBar={<ActionBar label="Start planning" loading={starting} loadingLabel="Starting" {...(onStart ? { onPress: onStart } : {})} />}
      {...((beforeKitchen && onCheckInvites) || onSignOut
        ? {
            footer: (
              <View style={styles.footer}>
                {beforeKitchen && onCheckInvites ? (
                  <View style={styles.joining}>
                    <Text variant="small" tone="muted">
                      {`Joining your partner's kitchen? Ask them to add ${email} in Household.`}
                    </Text>
                    <Button variant="text" size="s" label="Check for an invite" loading={checkingInvites} loadingLabel="Checking" disabled={starting} onPress={onCheckInvites} />
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
      <InviteCard {...invite} />
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  footer: { gap: tokens.space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
  joining: { alignItems: 'center', gap: tokens.space[2] },
});
