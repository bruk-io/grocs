import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** auth.sheet: ready to sign in, signing in, with sign-in off, and leading with one primary action instead. */
export const AUTHSHEET_STATES = ['rest', 'signingIn', 'disabled', 'primaryAction'] as const;

interface AuthSheetBase {
  disabled?: boolean;
  /** Below the invite line (or the primary action), in the sheet's own layout. Development builds put the test sign-in here (R53). */
  footer?: ReactNode;
}

/** The sign-in sheet: Continue with Google, and a line under it for someone with an invite. */
export interface AuthSheetSignInProps extends AuthSheetBase {
  /** Sign-in is Google only. */
  onContinue?: () => void;
  /** Google's sheet is open: the button shows it is busy. */
  signingIn?: boolean;
  primaryLabel?: never;
  onPrimary?: never;
}

/** The sheet leading with one primary action in place of Continue with Google and the invite line (the demo). There is no Google sheet to be busy with, so signingIn and onContinue are not accepted. */
export interface AuthSheetPrimaryProps extends AuthSheetBase {
  primaryLabel: string;
  onPrimary: () => void;
  signingIn?: never;
  onContinue?: never;
}

export type AuthSheetProps = AuthSheetSignInProps | AuthSheetPrimaryProps;

/** The sheet at the foot of Welcome: the one way in, and what someone with an invite does (button.primary, button.secondary, text.small). */
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
          {/* An invite is to an email, so it is found by signing in with that Google account (TASK-78). */}
          <Text variant="small" tone="muted" align="center">
            Got an invite? Continue with the Google account it was sent to.
          </Text>
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
  // The button and the invite line sit centred in the sheet; the lone primary action starts where the sheet's content does, not mid-way down an empty one.
  sheetCentred: { justifyContent: 'center' },
  sheetTop: { justifyContent: 'flex-start' },
});
