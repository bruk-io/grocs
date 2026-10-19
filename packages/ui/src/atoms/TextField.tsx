import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { icons } from '../icons/index.ts';
import { fontFace } from '../platform/font-face.ts';
import { tokens } from '../tokens/tokens.ts';
import { Button } from './Button.tsx';
import { Text } from './Text.tsx';

/** The states of TextField; each has a story (R61, R63). */
export const TEXTFIELD_STATES = ['rest', 'filled', 'pressed', 'focus', 'disabled', 'invalid'] as const;

export interface TextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  /** What a screen reader says, and the hint shown when the field is empty. */
  label: string;
  onSubmit?: () => void;
  disabled?: boolean;
  /** Shown under the field, and makes the field read as invalid. */
  errorMessage?: string;
  /** Names the round button inside the field (input.text--inline). The button shows only when this is set. */
  actionLabel?: string;
  onAction?: () => void;
  /** icon is the round plus (default); soft is a small soft button that shows the action label, such as "Paste"; primary is a small filled button with the label, such as "Add". */
  actionKind?: 'icon' | 'soft' | 'primary';
  /** The hint shown when the field is empty, when it is not the label. */
  placeholder?: string;
  /** Sets the typed value in the display font, as for an invite code. */
  display?: boolean;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

export function TextField({ value, onChangeText, label, onSubmit, disabled = false, errorMessage, actionLabel, onAction, actionKind = 'icon', placeholder, display = false, forceState }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const invalid = errorMessage !== undefined;
  const lit = focused || forceState === 'focus';
  const Alert = icons.alert;
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.box,
          actionLabel !== undefined && styles.boxInline,
          forceState === 'pressed' && styles.pressed,
          lit && styles.focused,
          lit && { boxShadow: tokens.shadow.focus },
          invalid && styles.invalid,
          invalid && lit && { boxShadow: tokens.shadow.focusError },
          disabled && styles.disabled,
        ]}
      >
        <TextInput
          aria-label={label}
          aria-invalid={invalid}
          placeholder={placeholder ?? label}
          placeholderTextColor={tokens.color.inkHint}
          value={value}
          editable={!disabled}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="done"
          style={[styles.input, actionLabel !== undefined && styles.inputInline, display && styles.inputDisplay, disabled && styles.inputDisabled]}
        />
        {actionLabel !== undefined ? <Button variant={actionKind === 'soft' ? 'soft' : actionKind === 'primary' ? 'primary' : 'icon'} {...(actionKind === 'primary' ? { size: 's' as const } : {})} label={actionLabel} disabled={disabled} {...(onAction ? { onPress: onAction } : {})} /> : null}
      </View>
      {invalid ? (
        <View style={styles.error} role="alert">
          <Alert color={tokens.color.error} size={tokens.size.iconChip} />
          <Text variant="caption" tone="error">
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: tokens.space[6] },
  box: {
    minHeight: tokens.size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[8],
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius[20],
    paddingHorizontal: tokens.space[18],
    backgroundColor: tokens.color.surfaceCard,
  },
  boxInline: { paddingHorizontal: tokens.space[4], paddingLeft: tokens.space[18] },
  input: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    minHeight: tokens.size.target,
    outlineWidth: 0,
    color: tokens.color.ink,
    ...fontFace('body', tokens.font.weight.bold),
    fontSize: tokens.font.size.label,
  },
  inputInline: { ...fontFace('body', tokens.font.weight.medium), height: tokens.size.target },
  inputDisplay: { ...fontFace('display', tokens.font.weight.bold) },
  inputDisabled: { color: tokens.color.disabledInk },
  pressed: { backgroundColor: tokens.color.surfaceTint },
  focused: { borderColor: tokens.color.forest },
  invalid: { borderColor: tokens.color.error },
  disabled: { backgroundColor: tokens.color.disabled, borderColor: tokens.color.lineSoft },
  error: { flexDirection: 'row', alignItems: 'center', gap: tokens.space[6] },
});
