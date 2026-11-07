import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { TextField } from '../atoms/TextField.tsx';
import { StatusRow } from '../molecules/StatusRow.tsx';
import { tokens } from '../tokens/tokens.ts';

/**
 * invite.card (TASK-78): typing the partner's email (rest, filled, invalid, sending), once they are
 * invited, and before the kitchen exists (noKitchen: the field is shown but cannot be used yet).
 */
export const INVITECARD_STATES = ['rest', 'filled', 'invalid', 'sending', 'invited', 'noKitchen'] as const;

/** The partner's email is being typed. Leave onInvite out and the Invite button is disabled, never dead. */
export interface InviteCardComposeProps {
  readonly kind: 'compose';
  readonly email: string;
  readonly onEmailChange: (email: string) => void;
  readonly onInvite?: () => void;
  /** The invite is on its way to the server. */
  readonly sending?: boolean;
  /** Why the last try did not work, shown under the field. */
  readonly errorMessage?: string;
}

/** Invited and not yet joined. */
export interface InviteCardInvitedProps {
  readonly kind: 'invited';
  /** The address invited, as stored. */
  readonly email: string;
  /** Takes the invite back. Left out, the button is disabled. */
  readonly onCancel?: () => void;
  readonly cancelling?: boolean;
}

/** There is no kitchen to invite to yet. */
export interface InviteCardNoKitchenProps {
  readonly kind: 'noKitchen';
}

export type InviteCardProps = InviteCardComposeProps | InviteCardInvitedProps | InviteCardNoKitchenProps;

const FIELD_LABEL = 'Their email';

/** Invites the partner by the email they sign in to Google with (text.heading, text.body, input.text--inline or status.row with a text button). */
export function InviteCard(props: InviteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.words}>
        <Text variant="heading">Invite your partner</Text>
        <Text variant="body" tone="muted">
          Add the email they use with Google. They see your invite the next time they open Grocs, and get the same plan and list.
        </Text>
      </View>
      {props.kind === 'invited' ? (
        <View style={styles.invited}>
          <StatusRow kind="waiting" message={`Invited ${props.email}. Waiting for them to join.`} />
          <Button
            variant="text"
            size="s"
            label="Cancel invite"
            loading={props.cancelling ?? false}
            loadingLabel="Cancelling"
            disabled={!props.onCancel}
            {...(props.onCancel ? { onPress: props.onCancel } : {})}
          />
        </View>
      ) : props.kind === 'noKitchen' ? (
        <>
          <TextField value="" onChangeText={() => undefined} label={FIELD_LABEL} placeholder="name@gmail.com" email disabled actionLabel="Invite" actionKind="primary" />
          <Text variant="small" tone="muted">
            You can invite them once your kitchen is made.
          </Text>
        </>
      ) : (
        <TextField
          value={props.email}
          onChangeText={props.onEmailChange}
          label={FIELD_LABEL}
          placeholder="name@gmail.com"
          email
          disabled={props.sending ?? false}
          actionLabel={props.sending ? 'Inviting' : 'Invite'}
          actionKind="primary"
          {...(props.onInvite && !props.sending ? { onAction: props.onInvite, onSubmit: props.onInvite } : {})}
          {...(props.errorMessage !== undefined ? { errorMessage: props.errorMessage } : {})}
        />
      )}
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
  invited: { gap: tokens.space[6], alignItems: 'flex-start' },
});
