import { StyleSheet, View } from 'react-native';
import { Text } from '../atoms/Text.tsx';
import { StatusRow } from '../molecules/StatusRow.tsx';
import { InviteCard } from '../organisms/InviteCard.tsx';
import type { InviteCardComposeProps, InviteCardInvitedProps } from '../organisms/InviteCard.tsx';
import { SubHeader } from '../organisms/SubHeader.tsx';
import { tokens } from '../tokens/tokens.ts';
import { TaskLayout } from './layouts/TaskLayout.tsx';

/** The household screen (TASK-56, TASK-78): the partner's email to add while the kitchen has room, once they are invited, both members once it is full, and while the kitchen is being read or could not be. */
export const HOUSEHOLDTEMPLATE_STATES = ['rest', 'invited', 'full', 'loading', 'failed'] as const;

export interface HouseholdMember {
  readonly name: string;
  /** The signed-in member, shown as "(you)". */
  readonly isYou: boolean;
}

/** The invite card while there is room (compose or invited), or what shows in its place. */
export type HouseholdInvite =
  | InviteCardComposeProps
  | InviteCardInvitedProps
  | { readonly kind: 'full' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'failed'; readonly message: string };

export interface HouseholdTemplateProps {
  kitchenName: string;
  members: readonly HouseholdMember[];
  invite: HouseholdInvite;
  /** Back to the screen the household was opened from. */
  backLabel?: string;
  onBack?: () => void;
}

/** template.task filled for Household: header.sub, a status.row per member, then invite.card while there is room for the partner. */
export function HouseholdTemplate({ kitchenName, members, invite, backLabel = 'Settings', onBack }: HouseholdTemplateProps) {
  return (
    <TaskLayout header={<SubHeader lead={{ kind: 'back', label: backLabel, ...(onBack ? { onPress: onBack } : {}) }} tag="Household" title={kitchenName} mascot="enoki" />}>
      <View style={styles.members}>
        {members.map((m) => (
          <StatusRow key={m.name} kind="joined" name={m.name} message={m.isYou ? `${m.name} (you)` : m.name} />
        ))}
      </View>
      {invite.kind === 'compose' || invite.kind === 'invited' ? (
        <InviteCard {...invite} />
      ) : invite.kind === 'full' ? (
        <Text variant="muted">Your kitchen has both its members. They share the plan and the list, live on each phone.</Text>
      ) : invite.kind === 'loading' ? (
        <Text variant="muted">Checking your kitchen</Text>
      ) : (
        <Text variant="muted">{`Could not check your kitchen: ${invite.message}`}</Text>
      )}
    </TaskLayout>
  );
}

const styles = StyleSheet.create({
  members: { gap: tokens.space[8] },
});
