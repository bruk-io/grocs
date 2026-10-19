import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { tokens } from '../tokens/tokens.ts';
import { focusRing } from './focus.ts';
import { spaceActivates } from './keyboard.ts';

/** The states of Switch (switch--off, --on, --focus, --disabled, --disabled-on, plus pressed); each has a story (R61, R63). */
export const SWITCH_STATES = ['rest', 'on', 'pressed', 'focus', 'disabled', 'disabledOn'] as const;

export interface SwitchProps {
  on: boolean;
  /** What a screen reader says: the setting this turns on or off. */
  label: string;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Draws a state without the interaction that causes it. For Storybook and tests. */
  forceState?: 'pressed' | 'focus';
}

export function Switch({ on, label, onChange, disabled = false, forceState }: SwitchProps) {
  const [focused, setFocused] = useState(false);
  const toggle = () => onChange?.(!on);
  return (
    <Pressable
      role="switch"
      aria-label={label}
      aria-checked={on}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={toggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={styles.target}
      {...spaceActivates(toggle, !disabled)}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.track,
            on && styles.trackOn,
            disabled && styles.trackDisabled,
            (pressed || forceState === 'pressed') && !disabled && styles.pressed,
            (focused || forceState === 'focus') && focusRing,
          ]}
        >
          <View style={[styles.knob, on && styles.knobOn, disabled && styles.knobDisabled]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    alignSelf: 'flex-start',
    width: tokens.size.switchW,
    height: tokens.size.target,
    justifyContent: 'center',
  },
  track: {
    width: tokens.size.switchW,
    height: tokens.size.switchH,
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surfaceTint,
  },
  trackOn: { backgroundColor: tokens.color.forest, borderColor: tokens.color.forest },
  trackDisabled: { backgroundColor: tokens.color.disabled, borderColor: tokens.color.lineSoft },
  pressed: { opacity: tokens.opacity.pressed },
  knob: {
    position: 'absolute',
    left: tokens.size.lineW,
    top: tokens.size.lineW,
    width: tokens.size.knob,
    height: tokens.size.knob,
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.size.lineW,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surfaceCard,
  },
  // The knob travels the width of the track inside its border, less its own width and the gap kept at each end.
  knobOn: {
    borderColor: tokens.color.surfaceCard,
    transform: [{ translateX: tokens.size.switchW - tokens.size.knob - tokens.size.lineW * 4 }],
  },
  knobDisabled: { backgroundColor: tokens.color.surfaceDone, borderColor: tokens.color.lineSoft },
});
