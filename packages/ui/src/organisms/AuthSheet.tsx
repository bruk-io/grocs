import { StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button.tsx';
import { Text } from '../atoms/Text.tsx';
import { tokens } from '../tokens/tokens.ts';

/** auth.sheet: ready to sign in, signing in, and with sign-in off. */
export const AUTHSHEET_STATES = ['rest', 'signingIn', 'disabled'] as const;

export interface AuthSheetProps {
  /** Sign-in is Google only. */
  onContinue?: () => void;
  /** Takes someone with an invite to the join screen. */
  onOpenInvite?: () => void;
  /** Google's sheet is open: the button shows it is busy. */
  signingIn?: boolean;
  disabled?: boolean;
}

/** The sheet at the foot of Welcome: the one way in, and the way in for an invite (button.secondary, text.small, button.text). */
export function AuthSheet({ onContinue, onOpenInvite, signingIn = false, disabled = false }: AuthSheetProps) {
  return (
    <View style={styles.sheet}>
      <Button
        variant="secondary"
        label="Continue with Google"
        loading={signingIn}
        loadingLabel="Signing in"
        disabled={disabled}
        stretch
        {...(onContinue ? { onPress: onContinue } : {})}
      />
      <View style={styles.invite}>
        <Text variant="small" tone="muted">
          Got an invite?
        </Text>
        <Button variant="text" size="s" label="Open it to join" disabled={disabled} {...(onOpenInvite ? { onPress: onOpenInvite } : {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.space[8],
    paddingTop: tokens.space[24],
    paddingHorizontal: tokens.space[24],
    paddingBottom: tokens.space[24],
    borderTopLeftRadius: tokens.radius[28],
    borderTopRightRadius: tokens.radius[28],
    backgroundColor: tokens.color.surfaceCard,
    boxShadow: [...tokens.shadow.sheet],
  },
  invite: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
});
