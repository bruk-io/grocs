import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** auth.sheet: ready to sign in, signing in, with sign-in off, and leading with one primary action instead. */
export const AUTHSHEET_STATES = ['rest', 'signingIn', 'disabled', 'primaryAction'] as const;

interface AuthSheetBase {
  disabled?: boolean;
  /** Below the invite row (or the primary action), in the sheet's own layout. Development builds put the test sign-in here (R53). */
  footer?: ReactNode;
}

/** The sign-in sheet: Continue with Google, and the invite row under it. */
export interface AuthSheetSignInProps extends AuthSheetBase {
  /** Sign-in is Google only. */
  onContinue?: () => void;
  /** Takes someone with an invite to the join screen. */
  onOpenInvite?: () => void;
  /** Google's sheet is open: the button shows it is busy. */
  signingIn?: boolean;
  primaryLabel?: never;
  onPrimary?: never;
}

/** The sheet leading with one primary action in place of Continue with Google and the invite row (the demo). There is no Google sheet to be busy with, so signingIn, onContinue and onOpenInvite are not accepted. */
export interface AuthSheetPrimaryProps extends AuthSheetBase {
  primaryLabel: string;
  onPrimary: () => void;
  signingIn?: never;
  onContinue?: never;
  onOpenInvite?: never;
}

export type AuthSheetProps = AuthSheetSignInProps | AuthSheetPrimaryProps;

/** The sheet at the foot of Welcome: the one way in, and the way in for an invite (button.primary, button.secondary, text.small, button.text). */
export function AuthSheet(props: AuthSheetProps) {
  const { disabled = false, footer } = props;
  return (
    <View style={[styles.sheet, props.primaryLabel === undefined ? styles.sheetCentred : styles.sheetTop]}>
      {props.primaryLabel !== undefined ? (
        <Button variant="primary" label={props.primaryLabel} disabled={disabled} stretch onPress={props.onPrimary} />
      ) : (
        <>
          <Button
            variant="secondary"
            label="Continue with Google"
            loading={props.signingIn ?? false}
            loadingLabel="Signing in"
            disabled={disabled}
            stretch
            {...(props.onContinue ? { onPress: props.onContinue } : {})}
          />
          <View style={styles.invite}>
            <Text variant="small" tone="muted">
              Got an invite?
            </Text>
            <Button variant="text" size="s" label="Open it to join" disabled={disabled} {...(props.onOpenInvite ? { onPress: props.onOpenInvite } : {})} />
          </View>
        </>
      )}
      {footer ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    // flexGrow, not flex: 1. flex: 1 is a flex basis of 0 on Yoga, which leaves a content-sized parent only this sheet's padding (TASK-36).
    flexGrow: 1,
    gap: tokens.space[8],
    paddingTop: tokens.space[24],
    paddingHorizontal: tokens.space[24],
    paddingBottom: tokens.space[24],
    borderTopLeftRadius: tokens.radius[28],
    borderTopRightRadius: tokens.radius[28],
    backgroundColor: tokens.color.surfaceCard,
    boxShadow: [...tokens.shadow.sheet],
  },
  // Two rows sit centred in the sheet; the lone primary action starts where the sheet's content does, not mid-way down an empty one.
  sheetCentred: { justifyContent: 'center' },
  sheetTop: { justifyContent: 'flex-start' },
  invite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
});
